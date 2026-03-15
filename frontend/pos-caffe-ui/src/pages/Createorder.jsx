import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, User, X, Minus, Plus, ChevronRight } from "lucide-react";
import api from "../axiosInstance";
import "./Createorder.css";

const IMG_BASE = import.meta.env.VITE_IMG_BASE ?? "";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const timerRef = useRef(null);
  const show = (msg, type = "success") => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, show: true });
    timerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };
  return { toast, showToast: show };
}

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);
const PAYMENT_METHODS = [
  { key: "tunai", label: "Tunai", short: "Rp" },
  { key: "qris", label: "QRIS", short: "QR" },
  { key: "transfer", label: "Transfer", short: "TF" },
];

export default function CreateOrder() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [tableNum, setTableNum] = useState(1);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState("tunai");
  const [cashInput, setCashInput] = useState("");

  const { toast, showToast } = useToast();
  const waiterName = localStorage.getItem("name") ?? "Waiter";

  useEffect(() => {
    Promise.all([api.get("/products"), api.get("/categories")])
      .then(([pRes, cRes]) => { setProducts(pRes.data); setCategories(cRes.data); })
      .catch(() => showToast("Gagal memuat menu", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.product.id === product.id);
      if (ex) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((c) => c.product.id === id ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0)
    );
  };

  const clearCart = () => setCart([]);
  const cartQty = (id) => cart.find((c) => c.product.id === id)?.qty ?? 0;
  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const cashNum = Number(String(cashInput).replace(/\D/g, "")) || 0;
  const kembalian = cashNum - subtotal;

  const tabs = ["Semua", ...categories.map((c) => c.name)];

  const filtered = products.filter((p) => {
    const matchCat = activeTab === "Semua" || (p.category || "").toLowerCase() === activeTab.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchAvailable = p.is_available !== false;
    return matchCat && matchSearch && matchAvailable;
  });

  const openPayment = () => {
    if (cart.length === 0) return showToast("Keranjang masih kosong!", "error");
    setCashInput(""); setPayMethod("tunai"); setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (payMethod === "tunai" && cashNum < subtotal) return showToast("Uang tidak cukup!", "error");
    setSubmitting(true);
    try {
      await api.post("/orders", {
        table_number: tableNum,
        items: cart.map((c) => ({ product_id: c.product.id, quantity: c.qty })),
        notes, payment_method: payMethod,
      });
      setShowPayment(false);
      showToast(`Order Meja ${tableNum} dikirim ke dapur`, "success");
      clearCart(); setNotes("");
    } catch {
      showToast("Gagal memproses order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-page">

      {/* ── Header ── */}
      <header className="order-header">
        <div className="header-brand">
          <div className="brand-mark">PC</div>
          <div>
            <div className="brand-name">Pos Caffe</div>
            <div className="brand-role">Waiter · New Order</div>
          </div>
        </div>

        <div className="header-center">
          <span className="table-select-label">Meja</span>
          <select className="table-select" value={tableNum} onChange={(e) => setTableNum(Number(e.target.value))}>
            {TABLES.map((n) => <option key={n} value={n}>#{n}</option>)}
          </select>
        </div>

        <div className="waiter-chip">
          <div className="waiter-avatar"><User size={14} /></div>
          {waiterName}
        </div>
      </header>

      <div className="order-content">

        {/* ── Menu Panel ── */}
        <div className="menu-panel">
          <div className="search-bar">
            <Search size={15} color="var(--ink-muted)" strokeWidth={2} />
            <input
              className="search-input"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            {tabs.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${activeTab === cat ? "active" : ""}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="menu-section-label">Menu Tersedia</div>

          <div className="products-grid">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skel-card">
                <div className="skel skel-img" />
                <div className="skel skel-line" style={{ width: "70%" }} />
                <div className="skel skel-line short" />
              </div>
            ))}

            {!loading && filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "var(--ink-muted)", fontSize: 13 }}>
                Tidak ada menu yang cocok
              </div>
            )}

            {!loading && filtered.map((p, i) => {
              const qty = cartQty(p.id);
              return (
                <motion.div
                  key={p.id}
                  className={`product-card ${qty > 0 ? "in-cart" : ""}`}
                  onClick={() => addToCart(p)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <AnimatePresence>
                    {qty > 0 && (
                      <motion.span
                        className="cart-badge"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        {qty}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className="product-thumb">
                    {p.image_url
                      ? <img src={`${IMG_BASE}${p.image_url}`} alt={p.name} />
                      : <div className="product-thumb-fallback">{getInitials(p.name)}</div>
                    }
                  </div>
                  <div className="product-info">
                    {p.category && <div className="product-cat">{p.category}</div>}
                    <div className="product-name">{p.name}</div>
                    <div className="product-price">{formatRp(p.price)}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Order Panel ── */}
        <div className="order-panel">
          <div className="order-panel-header">
            <span className="order-panel-title">Meja #{tableNum}</span>
            {totalItems > 0 && (
              <motion.span className="order-count" key={totalItems} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                {totalItems}
              </motion.span>
            )}
          </div>

          <div className="order-items-list">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={32} color="var(--ink-muted)" strokeWidth={1.5} />
                <div className="cart-empty-text">Belum ada item.<br />Pilih menu di sebelah kiri.</div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {cart.map(({ product, qty }) => (
                  <motion.div
                    key={product.id}
                    className="cart-item"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="cart-item-thumb">
                      {product.image_url
                        ? <img src={`${IMG_BASE}${product.image_url}`} alt={product.name} />
                        : <div className="cart-item-fallback">{getInitials(product.name)}</div>
                      }
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{product.name}</div>
                      <div className="cart-item-sub">{formatRp(product.price * qty)}</div>
                    </div>
                    <div className="qty-control">
                      <button className="qty-btn minus" onClick={() => changeQty(product.id, -1)}><Minus size={12} /></button>
                      <span className="qty-num">{qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(product.id, +1)}><Plus size={12} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {cart.length > 0 && (
            <div className="order-notes-wrap">
              <div className="notes-label">Catatan</div>
              <textarea
                className="notes-input"
                placeholder="Tanpa gula, extra ice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          <div className="order-summary">
            {cart.length > 0 && (
              <>
                <div className="summary-row">
                  <span className="summary-label">Subtotal ({totalItems} item)</span>
                  <span className="summary-value">{formatRp(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Meja</span>
                  <span className="summary-value">#{tableNum}</span>
                </div>
                <div className="summary-divider" />
                <div className="total-row">
                  <span className="total-label-big">Total</span>
                  <span className="total-value-big">{formatRp(subtotal)}</span>
                </div>
                <button className="btn-clear" onClick={clearCart}>Kosongkan Keranjang</button>
              </>
            )}
            <button className="btn-submit" onClick={openPayment} disabled={cart.length === 0}>
              <span className="btn-submit-label">
                {cart.length === 0 ? "Pilih Menu" : "Proses Pembayaran"}
              </span>
              {cart.length > 0 && (
                <span className="btn-submit-price">{formatRp(subtotal)}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowPayment(false)}
          >
            <motion.div
              className="payment-modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.22 }}
            >
              <div className="payment-modal-header">
                <div>
                  <div className="payment-modal-title">Pembayaran</div>
                  <div className="payment-modal-sub">Meja #{tableNum} &middot; {totalItems} item</div>
                </div>
                <button className="payment-close" onClick={() => setShowPayment(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="payment-modal-body">
                <div className="payment-items">
                  {cart.map(({ product, qty }) => (
                    <div key={product.id} className="payment-item-row">
                      <span className="payment-item-name">{product.name} x{qty}</span>
                      <span className="payment-item-price">{formatRp(product.price * qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="payment-total-row">
                  <span>Total</span>
                  <span className="payment-total-value">{formatRp(subtotal)}</span>
                </div>

                <div className="payment-method-label">Metode Pembayaran</div>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.key}
                      className={`payment-method-btn ${payMethod === m.key ? "active" : ""}`}
                      onClick={() => setPayMethod(m.key)}
                    >
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: payMethod === m.key ? "rgba(255,255,255,0.7)" : "var(--ink-muted)" }}>
                        {m.short}
                      </span>
                      <span className="pm-label">{m.label}</span>
                    </button>
                  ))}
                </div>

                {payMethod === "tunai" && (
                  <div className="cash-section">
                    <div className="payment-method-label">Uang Diterima</div>
                    <input
                      className="cash-input"
                      type="number"
                      placeholder="0"
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                    />
                    <div className="cash-shortcuts">
                      {[subtotal, Math.ceil(subtotal / 10000) * 10000 + 10000, 50000, 100000]
                        .filter((v, i, a) => a.indexOf(v) === i && v >= subtotal)
                        .slice(0, 4)
                        .map((v) => (
                          <button key={v} className="cash-shortcut" onClick={() => setCashInput(String(v))}>
                            {formatRp(v)}
                          </button>
                        ))}
                    </div>
                    <AnimatePresence>
                      {cashNum >= subtotal && (
                        <motion.div
                          className="kembalian-row"
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >
                          <span>Kembalian</span>
                          <span className="kembalian-value">{formatRp(kembalian)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="payment-modal-footer">
                <button className="btn-cancel-payment" onClick={() => setShowPayment(false)}>Batal</button>
                <button
                  className="btn-confirm-payment"
                  onClick={handleConfirmPayment}
                  disabled={submitting || (payMethod === "tunai" && cashNum < subtotal)}
                >
                  {submitting ? "Memproses..." : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      Konfirmasi <ChevronRight size={16} />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </div>
  );
}