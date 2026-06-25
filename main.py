from pathlib import Path

import joblib
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "modelo_completo.pkl"

try:
    artefactos = joblib.load(MODEL_PATH)
except FileNotFoundError as exc:
    raise RuntimeError(f"No se encontro el modelo en {MODEL_PATH}") from exc

modelo = artefactos["modelo"]
scaler = artefactos["scaler"]
columnas_esperadas = list(artefactos["columnas"])

app = FastAPI(title="Trabajo Integrador de Python")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    protocol_type: str
    service: str
    duration: float = Field(ge=0)
    src_bytes: float = Field(ge=0)
    dst_bytes: float = Field(ge=0)
    logged_in: int = Field(ge=0, le=1)
    count: float = Field(ge=0)

@app.get("/")
def read_root():
    # Endpoint de prueba para confirmar que el backend esta levantado.
    # Aqui puedes dejar una respuesta simple mientras conectas el modelo.
    # Esta ruta suele usar return de un diccionario porque FastAPI lo convierte
    # automaticamente en JSON sin que tengas que serializar nada a mano.
    return {"message":"Hola desde el backend"}


@app.post("/predict")
def predict(datos: PredictionInput):
    # 1. Convertir la entrada recibida en un DataFrame de una fila
    entrada = pd.DataFrame([datos.model_dump()])
    
    # 2. Aplicar One-Hot Encoding a las variables categóricas
    entrada_codificada = pd.get_dummies(entrada, columns=["protocol_type", "service"], dtype=int)
    
    # 3. CORRECCIÓN AQUÍ: Primero alineamos las 71 columnas esperadas
    # Esto creará las columnas que faltan y las rellenará con 0
    entrada_final = entrada_codificada.reindex(columns=columnas_esperadas, fill_value=0)

    if entrada_final.shape[1] != len(columnas_esperadas):
        raise HTTPException(status_code=500, detail="No se pudo alinear la entrada con las columnas del modelo")

    # 4. Ahora que tiene las 71 columnas en el orden exacto, escalamos TODO el DataFrame
    entrada_escalada = scaler.transform(entrada_final)

# 5. Realizar la predicción final usando los datos ya escalados
    # Quitamos el int() porque el modelo ya devuelve texto directamente ('normal', 'ataque', etc.)
    prediccion_raw = modelo.predict(entrada_escalada)[0] 
    
    probabilidad = float(modelo.predict_proba(entrada_escalada)[0].max())
    
    # Adaptamos la etiqueta por si el modelo devuelve algo ligeramente distinto
    # Si el modelo ya devuelve 'normal', lo dejamos pasar; si no, lo evalúa.
    if prediccion_raw in ["normal", "ataque"]:
        etiqueta = prediccion_raw
    else:
        etiqueta = "normal" if prediccion_raw == 1 else "ataque"

    return {"prediccion": etiqueta, "probabilidad": round(probabilidad, 4)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
