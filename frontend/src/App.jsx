import { useState, useRef } from "react";
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
  const resultRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" || name === "logged_in" ? Number(value) : value,
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  const isAtaque = result?.prediccion === "ataque";

  return (
    <>
      <div className="bg" />
      <div className="bg-overlay" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-pattern" />

      <div className="app">
        <header className="header">
          <div className="header-badge">Machine Learning</div>
          <h1>Detección de Anomalías</h1>
          <p>Clasificación de tráfico de red con inteligencia artificial</p>
        </header>

        <main className="main">
          <div className="form-wrapper">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
                Parámetros de entrada
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Protocolo</label>
                  <select name="protocol_type" value={form.protocol_type} onChange={handleChange}>
                    {PROTOCOL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Servicio</label>
                  <select name="service" value={form.service} onChange={handleChange}>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>logged_in</label>
                  <select name="logged_in" value={form.logged_in} onChange={handleChange}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duración</label>
                  <input type="number" name="duration" value={form.duration} onChange={handleChange} min="0" />
                </div>

                <div className="form-group">
                  <label>src_bytes</label>
                  <input type="number" name="src_bytes" value={form.src_bytes} onChange={handleChange} min="0" />
                </div>

                <div className="form-group">
                  <label>dst_bytes</label>
                  <input type="number" name="dst_bytes" value={form.dst_bytes} onChange={handleChange} min="0" />
                </div>

                <div className="form-group">
                  <label>Count</label>
                  <input type="number" name="count" value={form.count} onChange={handleChange} min="0" />
                </div>
              </div>

              <div className="btn-wrap">
                <button type="submit" className="btn-predict" disabled={loading}>
                  <span>
                    {loading ? (
                      <span className="loading-dots">
                        <span /><span /><span />
                      </span>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 2a10 10 0 1 0 10 10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Predecir
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {result && (
            <div className={`result ${isAtaque ? "result-danger" : "result-safe"}`} ref={resultRef}>
              <div className="result-icon">{isAtaque ? "🚨" : "✅"}</div>
              <h3>Resultado</h3>
              <div className="prediction-label">
                {isAtaque ? "Ataque detectado" : "Tráfico normal"}
              </div>

              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${(result.probabilidad * 100).toFixed(0)}%` }} />
              </div>
              <div className="confidence-text">
                Confianza: <strong>{(result.probabilidad * 100).toFixed(1)}%</strong>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Protocolo</div>
                  <div className="detail-value">{form.protocol_type}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Servicio</div>
                  <div className="detail-value">{form.service}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">logged_in</div>
                  <div className="detail-value">{form.logged_in === 1 ? "Sí" : "No"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">src_bytes</div>
                  <div className="detail-value">{form.src_bytes.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">dst_bytes</div>
                  <div className="detail-value">{form.dst_bytes.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Count</div>
                  <div className="detail-value">{form.count}</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <strong>TP Final</strong> &mdash; Python para Ciencia de Datos
        </footer>
      </div>
    </>
  );
}

export default App;
