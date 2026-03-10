import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Check, UtensilsCrossed } from "lucide-react";
import axios from "axios";
import "./Login.css";

const PIN_LEN = 6;
const NUMPAD  = [["1","2","3"],["4","5","6"],["7","8","9"],["del","0","ok"]];

export default function Login() {
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const navigate              = useNavigate();

  useEffect(() => {
    axios.get("/api/auth/me", { withCredentials: true })
      .then(res => navigate(res.data.user.role === "admin" ? "/laporan" : "/order", { replace: true }))
      .catch(() => {});
  }, [navigate]);

  const triggerError = (msg) => {
    setError(msg); setShake(true); setPin("");
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = useCallback(async (pinVal) => {
    if (pinVal.length < 4) return triggerError("PIN minimal 4 digit");
    setLoading(true); setError("");
    try {
      const res = await axios.post("/api/auth/login", { pin: pinVal }, { withCredentials: true });
      const { user } = res.data;
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      navigate(user.role === "admin" ? "/laporan" : "/order", { replace: true });
    } catch (err) {
      triggerError(err.response?.data?.message ?? "PIN salah");
    } finally { setLoading(false); }
  }, [navigate]);

  const handleKey = useCallback((key) => {
    if (loading) return;
    setError("");
    if (key === "del") { setPin(p => p.slice(0,-1)); return; }
    if (key === "ok")  { handleSubmit(pin); return; }
    if (pin.length >= PIN_LEN) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LEN) handleSubmit(next);
  }, [pin, loading, handleSubmit]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      else if (e.key === "Backspace")   handleKey("del");
      else if (e.key === "Enter")       handleKey("ok");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  return (
    <div className="login-page">
      <motion.div className="login-card"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-mark">PC</span>
          </div>
          <div className="login-title">Pos Caffe</div>
          <div className="login-subtitle">Masukkan PIN untuk melanjutkan</div>
        </div>

        {/* PIN dots */}
        <motion.div className={`pin-dots ${shake ? "shake" : ""}`}
          animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}>
          {Array.from({ length: PIN_LEN }).map((_, i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? "filled" : ""} ${shake ? "error" : ""}`} />
          ))}
        </motion.div>

        {/* Error / Loading */}
        <div className="login-feedback">
          <AnimatePresence mode="wait">
            {error && !loading && (
              <motion.div className="login-error" key="err"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
            {loading && (
              <motion.div className="login-loading" key="load"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="spinner" /> Memverifikasi...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Numpad */}
        <div className="numpad">
          {NUMPAD.flat().map((key, i) => {
            const isDel    = key === "del";
            const isOk     = key === "ok";
            const disabled = loading || (isDel && pin.length === 0) || (isOk && pin.length < 4);
            return (
              <button key={i}
                className={`num-btn ${isDel ? "del" : isOk ? "submit" : ""}`}
                onClick={() => handleKey(key)}
                disabled={disabled}>
                {isDel ? <Delete size={18} /> : isOk ? <Check size={18} /> : key}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-footer-text">Bisa juga ketik PIN lewat keyboard</div>
          <a href="/" className="login-footer-link">
            <UtensilsCrossed size={13} /> Kitchen Display
          </a>
        </div>

      </motion.div>
    </div>
  );
}