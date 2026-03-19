import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../axiosInstance"; // ← ganti pakai api instance

export default function PrivateRoute({ children, roles = [] }) {
  const [status, setStatus] = useState("loading");
  const [userRole, setUserRole] = useState("");

 useEffect(() => {
  const verify = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("fail");
      return;
    }

    try {
      const res = await api.get("/auth/me");
      const role = res.data.user.role;
      localStorage.setItem("role", role);
      localStorage.setItem("name", res.data.user.name);
      setUserRole(role);
      setStatus("ok");
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      setStatus("fail");
    }
  };

  verify();
}, []);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#0c0f18", color: "#6b7899",
        fontFamily: "sans-serif", fontSize: 14, gap: 10,
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          border: "2px solid #263050", borderTopColor: "#6c8ef5",
          animation: "spin 0.7s linear infinite",
        }} />
        Memverifikasi sesi...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "fail") return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/order" replace />;
  }

  return children;
}