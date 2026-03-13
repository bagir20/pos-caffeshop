import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Zap, CheckCheck, ClipboardList, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import "./Kitchen.css";

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatTime = (ts) => {
  if (!ts) return "--:--";
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="clock">
      {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders")
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));

    socket.on("newOrder", order => setOrders(prev => [order, ...prev]));
    socket.on("orderUpdated", updatedOrder => setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)));

    return () => { socket.off("newOrder"); socket.off("orderUpdated"); };
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
  };

  const pending = orders.filter(o => o.status === "pending").length;
  const preparing = orders.filter(o => o.status === "preparing").length;
  const done = orders.filter(o => o.status === "done").length;

  const STATS = [
    { icon: <Zap size={16} />, label: "Pending", value: pending, color: "orange" },
    { icon: <UtensilsCrossed size={16} />, label: "Diproses", value: preparing, color: "blue" },
    { icon: <CheckCheck size={16} />, label: "Selesai", value: done, color: "green" },
    { icon: <ClipboardList size={16} />, label: "Total", value: orders.length, color: "white" },
  ];

  return (
    <div className="kitchen-wrapper">

      {/* Back button — subtle, hover only */}
      <button className="kitchen-back" onClick={() => navigate("/order")} title="Kembali ke Admin">
        <ArrowLeft size={15} />
        <span>Admin</span>
      </button>

      <header className="kitchen-header">
        <div className="header-left">
          <div className="header-icon"><UtensilsCrossed size={20} /></div>
          <div>
            <div className="header-title">Kitchen Display</div>
            <div className="header-subtitle">Pos Caffe · Dapur Utama</div>
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge"><span className="live-dot" />Live</div>
          <Clock />
        </div>
      </header>

      <div className="stats-bar">
        {STATS.map((s, i) => (
          <div key={i} className="stat-item">
            <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="orders-section">
        <div className="section-label">Antrian Order</div>
        <div className="orders-grid">
          {loading && [1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line short" />
              <div className="skeleton-line full" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line full" />
            </div>
          ))}

          {!loading && orders.length === 0 && (
            <div className="empty-state">
              <UtensilsCrossed size={40} strokeWidth={1} color="var(--text-muted)" />
              <div className="empty-title">Belum Ada Order</div>
              <div className="empty-desc">Menunggu order masuk...</div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {!loading && orders.map(order => (
              <motion.div key={order.id}
                className={`order-card status-${order.status}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}>

                <div className="card-header">
                  <div className="table-number">
                    <span className="table-label">Meja</span>
                    <span className="table-num">{order.table_number}</span>
                  </div>
                  <div className={`status-badge ${order.status}`}>
                    <span className="status-dot" />
                    {order.status === "pending" ? "Pending" : order.status === "preparing" ? "Diproses" : "Selesai"}
                  </div>
                </div>

                <div className="card-body">
                  {order.items?.length > 0 && (
                    <ul className="order-items">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="order-item">
                          <span className="item-qty">×{item.qty}</span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">{formatRupiah(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="divider" />
                  <div className="card-meta">
                    <div className="order-total">
                      <span className="total-label">Total</span>
                      <span className="total-value">{formatRupiah(order.total)}</span>
                    </div>
                    <span className="order-time">{formatTime(order.created_at)}</span>
                  </div>
                </div>

                {order.status !== "done" && (
                  <div className="card-footer">
                    {order.status === "pending" && (
                      <button className="btn btn-process" onClick={() => updateStatus(order.id, "preparing")}>
                        <Zap size={13} /> Proses
                      </button>
                    )}
                    <button className="btn btn-done" onClick={() => updateStatus(order.id, "done")}>
                      <CheckCheck size={13} /> Selesai
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}