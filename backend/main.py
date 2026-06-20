import os
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Detección de Anomalías API")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "modelo_completo.pkl")

artefactos = None
fake_mode = False

try:
    artefactos = joblib.load(MODEL_PATH)
    print(f"Modelo cargado desde {MODEL_PATH}")
except Exception as e:
    fake_mode = True
    print(f"No se pudo cargar el modelo: {e}")
    print("Usando modo fake (predicción estática)")

columnas_numericas = ["duration", "src_bytes", "dst_bytes", "count"]


class InputData(BaseModel):
    protocol_type: str
    service: str
    duration: float
    src_bytes: float
    dst_bytes: float
    logged_in: int
    count: float


@app.get("/")
def read_root():
    return {"message": "API de Detección de Anomalías", "fake_mode": fake_mode}


@app.post("/predict")
def predict(data: InputData):
    if fake_mode:
        return {"prediccion": "ataque", "probabilidad": 0.95}

    df = pd.DataFrame([data.model_dump()])

    df = pd.get_dummies(df, columns=["protocol_type", "service"], dtype=int)

    df = df.reindex(columns=artefactos["columnas"], fill_value=0)

    df[columnas_numericas] = artefactos["scaler"].transform(df[columnas_numericas])

    pred = artefactos["modelo"].predict(df)[0]
    proba = artefactos["modelo"].predict_proba(df)[0].max()

    label = "normal" if pred == 0 else "ataque"
    return {"prediccion": label, "probabilidad": round(float(proba), 4)}
