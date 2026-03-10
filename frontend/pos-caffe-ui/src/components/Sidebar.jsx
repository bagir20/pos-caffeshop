import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/order", label: "Buat Order", roles: ["admin", "waiter"] },
  { to: "/menu", label: "Menu", roles: ["admin"] },
  { to: "/laporan", label: "Laporan", roles: ["admin"] },
  { to: "/users", label: "Pengguna", roles: ["admin"] },
];

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const name = localStorage.getItem("name") ?? "User";
  const role = localStorage.getItem("role") ?? "";

  const close = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch { /* tetap logout */ }
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login", { replace: true });
  };

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <div className="app-shell">
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)}>
        <span /><span /><span />
      </button>

      <div className={`sidebar-overlay ${open ? "show" : ""}`} onClick={close} />

      <aside className={`sidebar ${open ? "open" : ""}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">0ng</div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">oE nongki</div>
            <div className="sidebar-brand-sub">{role === "admin" ? "Admin Panel" : "Waiter"}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu Utama</div>

          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={close}
            >
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-divider" />

          <div className="nav-section-label">Display</div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="kitchen-link"
          >
            <span className="kitchen-dot" />
            <span>Kitchen Display</span>
            <span className="kitchen-arrow">↗</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <div className="footer-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="footer-name">{name}</div>
              <div className="footer-role">{role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon" />
            </button>
          </div>
        </div>

      </aside>

      <main className="sidebar-main">{children}</main>
    </div>
  );
}