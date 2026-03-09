import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";


const PIN_LEN = 6;

const NUMPAD = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  ["del","0","✓"],
];

export default function Login() {
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const navigate              = useNavigate();

  // Kalau sudah login, redirect langsung
 useEffect(() => {
  axios.get('/api/auth/me', { withCredentials: true })
    .then((res) => {
      const role = res.data.user.role;
      navigate(role === "admin" ? "/laporan" : "/order", { replace: true });
    })
    .catch(() => {
      // belum login, tetap di halaman login
    });
}, [navigate]);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setPin("");
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = useCallback(async (pinVal) => {
    if (pinVal.length < 4) return triggerError("PIN minimal 4 digit");
    setLoading(true);
    setError("");
    try {
      // withCredentials agar httpOnly cookie diterima browser
     const res = await axios.post('/api/auth/login', { pin: pinVal }, {
  withCredentials: true,
});
      const { user } = res.data;

      // Simpan hanya info non-sensitif (bukan token)
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);

      if (user.role === "admin") {
        navigate("/laporan", { replace: true });
      } else {
        navigate("/order", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "PIN salah";
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleKey = useCallback((key) => {
    if (loading) return;
    setError("");

    if (key === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }

    if (key === "✓") {
      handleSubmit(pin);
      return;
    }

    if (pin.length >= PIN_LEN) return;

    const next = pin + key;
    setPin(next);

    // Auto submit kalau sudah PIN_LEN digit
    if (next.length === PIN_LEN) {
      handleSubmit(next);
    }
  }, [pin, loading, handleSubmit]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      else if (e.key === "Backspace")   handleKey("del");
      else if (e.key === "Enter")       handleKey("✓");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">☕</div>
          <div className="login-title">Pos Caffe</div>
          <div className="login-subtitle">Masukkan PIN untuk melanjutkan</div>
        </div>

        {/* Body */}
        <div className="login-body">

          {/* PIN dots */}
          <div className="pin-dots">
            {Array.from({ length: PIN_LEN }).map((_, i) => (
              <div
                key={i}
                className={`pin-dot ${i < pin.length ? "filled" : ""} ${shake && i < pin.length ? "error" : ""}`}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="numpad">
            {NUMPAD.flat().map((key, i) => {
              if (key === "del") return (
                <button
                  key={i}
                  className="num-btn del"
                  onClick={() => handleKey("del")}
                  disabled={loading || pin.length === 0}
                >
                  ⌫
                </button>
              );

              if (key === "✓") return (
                <button
                  key={i}
                  className="num-btn submit"
                  onClick={() => handleKey("✓")}
                  disabled={loading || pin.length < 4}
                >
                  ✓
                </button>
              );

              if (key === "0") return (
                <button
                  key={i}
                  className="num-btn zero"
                  onClick={() => handleKey("0")}
                  disabled={loading}
                >
                  0
                </button>
              );

              return (
                <button
                  key={i}
                  className="num-btn"
                  onClick={() => handleKey(key)}
                  disabled={loading}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="login-error">{error}</div>
          )}

          {/* Loading */}
          {loading && (
            <div className="login-loading">
              <div className="spinner" />
              Memverifikasi...
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-footer-text">Bisa juga ketik PIN lewat keyboard</div>
          <a href="/" className="login-footer-link">
            🍳 Buka Kitchen Display
          </a>
        </div>

      </div>
    </div>
  );
}