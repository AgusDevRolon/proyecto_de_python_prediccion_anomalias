import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp"];

const SERVICE_OPTIONS = [
  "IRC", "X11", "Z39_50", "auth", "bgp", "courier", "csnet_ns", "ctf",
  "daytime", "discard", "domain", "domain_u", "echo", "eco_i", "ecr_i",
  "efs", "exec", "finger", "ftp", "ftp_data", "gopher", "hostnames",
  "http", "http_443", "imap4", "iso_tsap", "klogin", "kshell", "ldap",
  "link", "login", "mtp", "name", "netbios_dgm", "netbios_ns",
  "netbios_ssn", "netstat", "nnsp", "nntp", "ntp_u", "other", "pop_2",
  "pop_3", "printer", "private", "remote_job", "rje", "shell", "smtp",
  "sql_net", "ssh", "sunrpc", "supdup", "systat", "telnet", "tim_i",
  "time", "urh_i", "urp_i", "uucp", "uucp_path", "vmnet", "whois",
];

const initialForm = {
  protocol_type: "tcp",
  service: "http",
  duration: 0,
  src_bytes: 0,
  dst_bytes: 0,
  logged_in: 0,
  count: 0,
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Detección de Anomalías</h1>
        <p>Detección de tráfico malicioso en redes NSL-KDD</p>
      </header>

      <main className="main">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Protocolo
              <select
                name="protocol_type"
                value={form.protocol_type}
                onChange={handleChange}
              >
                {PROTOCOL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Servicio
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label>
              logged_in
              <select
                name="logged_in"
                value={form.logged_in}
                onChange={handleChange}
              >
                <option value={0}>No</option>
                <option value={1}>Sí</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Duración
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              src_bytes
              <input
                type="number"
                name="src_bytes"
                value={form.src_bytes}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              dst_bytes
              <input
                type="number"
                name="dst_bytes"
                value={form.dst_bytes}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              Count
              <input
                type="number"
                name="count"
                value={form.count}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>

          <button type="submit" className="btn-predict" disabled={loading}>
            {loading ? "Prediciendo..." : "Predecir"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className={`result ${result.prediccion}`}>
            <h2>Resultado</h2>
            <p className="prediction">
              <span className="label">Predicción:</span>{" "}
              <strong>{result.prediccion === "ataque" ? "🚨 Ataque" : "✅ Normal"}</strong>
            </p>
            <p className="probability">
              <span className="label">Confianza:</span>{" "}
              {(result.probabilidad * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>TP Final - Python para Ciencia de Datos</p>
      </footer>
    </div>
  );
}

export default App;
