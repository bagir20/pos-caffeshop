import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, DollarSign, ShoppingBag, TrendingUp, Star, CheckCircle } from "lucide-react";
import api from "../axiosInstance";
import "./Laporan.css";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n) || 0);

const formatTime = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const RANGES = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "7 Hari" },
  { key: "month", label: "30 Hari" },
];

export default function Laporan() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (r) => {
    setLoading(true);
    try {
      const res = await api.get(`/report?range=${r}`);
      setData(res.data);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(range); }, [range, fetchReport]);

  const summary = data?.summary ?? {};
  const topProducts = data?.top_products ?? [];
  const orders = data?.orders ?? [];
  const maxQty = topProducts.length ? Math.max(...topProducts.map(p => Number(p.total_qty))) : 1;
  const rangeLabel = RANGES.find(r => r.key === range)?.label ?? "";

  const STATS = [
    { icon: <DollarSign size={16} />, label: "Total Omzet", value: formatRp(summary.total_revenue), desc: rangeLabel, color: "accent" },
    { icon: <ShoppingBag size={16} />, label: "Total Order", value: Number(summary.total_orders) || 0, desc: "Order selesai", color: "ink" },
    { icon: <TrendingUp size={16} />, label: "Rata-rata Order", value: formatRp(summary.avg_order), desc: "Per transaksi", color: "positive" },
    { icon: <Star size={16} />, label: "Produk Terlaris", value: topProducts[0]?.name ?? "—", desc: topProducts[0] ? `${topProducts[0].total_qty}x terjual` : "Belum ada data", color: "soft" },
  ];

  return (
    <div className="laporan-page">
      <header className="laporan-header">
        <div className="laporan-header-left">
          <div className="laporan-icon"><BarChart2 size={20} /></div>
          <div>
            <div className="laporan-title">Laporan Penjualan</div>
            <div className="laporan-sub">Pos Caffe · Admin</div>
          </div>
        </div>
        <div className="range-tabs">
          {RANGES.map(r => (
            <button key={r.key} className={`range-tab ${range === r.key ? "active" : ""}`} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="laporan-content">

        {/* Stats */}
        <div className="summary-grid">
          {STATS.map((s, i) => (
            <motion.div key={i} className={`summary-card stat-${s.color}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <div className="card-top">
                <div className="card-label">{s.label}</div>
                <div className={`card-icon stat-${s.color}`}>{s.icon}</div>
              </div>
              {loading
                ? <div className="skel" style={{ height: 28, width: "65%", marginBottom: 8 }} />
                : <div className="card-value">{s.value}</div>
              }
              <div className="card-desc">{s.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="laporan-row">

          {/* Orders table */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Riwayat Order Selesai</span>
              <span className="panel-badge">{orders.length} order</span>
            </div>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr><th>ID</th><th>Meja</th><th>Waktu</th><th>Status</th><th className="right">Total</th></tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[40, 30, 100, 60, 80].map((w, j) => (
                        <td key={j}><div className="skel" style={{ height: 12, width: w, marginLeft: j === 4 ? "auto" : 0 }} /></td>
                      ))}
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr><td colSpan={5}>
                      <div className="panel-empty">
                        <ShoppingBag size={28} color="var(--ink-muted)" strokeWidth={1.5} />
                        <div className="panel-empty-text">Belum ada order selesai<br />pada periode ini</div>
                      </div>
                    </td></tr>
                  )}
                  <AnimatePresence initial={false}>
                    {!loading && orders.map((o, i) => (
                      <motion.tr key={o.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}>
                        <td><span className="order-id-cell">#{o.id}</span></td>
                        <td><span className="order-table-cell">Meja {o.table_number}</span></td>
                        <td><span className="order-time-cell">{formatTime(o.created_at)}</span></td>
                        <td><span className="done-badge"><CheckCircle size={11} /> Selesai</span></td>
                        <td className="right"><span className="order-total-cell">{formatRp(o.total)}</span></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top products */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Produk Terlaris</span>
              <span className="panel-badge">Top {topProducts.length}</span>
            </div>
            {loading ? (
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skel" style={{ height: 56, borderRadius: 8 }} />)}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="panel-empty">
                <Star size={28} color="var(--ink-muted)" strokeWidth={1.5} />
                <div className="panel-empty-text">Belum ada data produk<br />pada periode ini</div>
              </div>
            ) : (
              <div className="top-products-list">
                {topProducts.map((p, i) => (
                  <motion.div key={i} className="top-product-item"
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <span className={`rank-num ${i < 3 ? "top" : ""}`}>
                      {i === 0 ? "01" : i === 1 ? "02" : i === 2 ? "03" : `${String(i + 1).padStart(2, "0")}`}
                    </span>
                    <div className="top-product-info">
                      <div className="top-product-name">{p.name}</div>
                      <div className="top-product-rev">{formatRp(p.total_revenue)}</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${(Number(p.total_qty) / maxQty) * 100}%` }} />
                      </div>
                    </div>
                    <div className="top-product-qty">
                      <span className="qty-num-big">{p.total_qty}</span>
                      <span className="qty-label">terjual</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}