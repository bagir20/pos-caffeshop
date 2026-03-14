import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, Package, Tag, TrendingUp, TrendingDown, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../axiosInstance";
import "./Menumanager.css";
import imageCompression from "browser-image-compression";

const IMG_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : "http://localhost:5000";
const EMPTY_FORM = { name: "", price: "", category_id: "", image_url: "" };

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const timer = useRef(null);
  const show = useCallback((msg, type = "success") => {
    clearTimeout(timer.current);
    setToast({ msg, type, show: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);
  return { toast, showToast: show };
}

export default function MenuManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const { toast, showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch { showToast("Gagal memuat produk", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    try { const res = await api.get("/categories"); setCategories(res.data); } catch { }
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  const categoryList = categories.length > 0
    ? categories
    : [...new Map(products.filter(p => p.category).map(p => ({ id: p.category_id ?? p.category, name: p.category }))).values()];

  const tabs = ["Semua", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    const matchTab = activeTab === "Semua" || p.category === activeTab;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalProduk = products.length;
  const totalKategori = new Set(products.map(p => p.category).filter(Boolean)).size;
  const hargaTertinggi = products.length ? Math.max(...products.map(p => p.price)) : 0;
  const hargaTerendah = products.length ? Math.min(...products.map(p => p.price)) : 0;

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null); setShowForm(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, category_id: p.category_id ?? "", image_url: p.image_url ?? "" });
    setImageFile(null);
    setImagePreview(p.image_url ? `${IMG_BASE}${p.image_url}` : null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditProduct(null); setImageFile(null); setImagePreview(null); };
  const openDelete = (p) => { setDeleteTarget(p); setShowDelete(true); };
  const closeDelete = () => { setShowDelete(false); setDeleteTarget(null); };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.5,        // maks 500KB
      maxWidthOrHeight: 800, // resize kalau lebih dari 800px
      useWebWorker: true,
    };

    try {
      const compressed = await imageCompression(file, options);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      // fallback ke file original kalau kompres gagal
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Nama produk wajib diisi", "error");
    if (!form.price || isNaN(form.price)) return showToast("Harga tidak valid", "error");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", Number(form.price));
      fd.append("category_id", form.category_id || "");
      if (imageFile) fd.append("image", imageFile);
      else if (form.image_url) fd.append("image_url", form.image_url);
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        showToast("Produk berhasil diperbarui");
      } else {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        showToast("Produk berhasil ditambahkan");
      }
      closeForm(); fetchProducts();
    } catch { showToast("Gagal menyimpan produk", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      showToast("Produk dihapus"); closeDelete(); fetchProducts();
    } catch { showToast("Gagal menghapus produk", "error"); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (product) => {
    try {
      const res = await api.patch(`/products/${product.id}/toggle`);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: res.data.is_available } : p));
      showToast(res.data.is_available ? "Produk diaktifkan" : "Produk ditandai habis");
    } catch { showToast("Gagal mengubah status", "error"); }
  };

  const STATS = [
    { icon: <Package size={16} />, label: "Total Produk", value: totalProduk, color: "accent" },
    { icon: <Tag size={16} />, label: "Kategori", value: totalKategori, color: "ink" },
    { icon: <TrendingUp size={16} />, label: "Harga Tertinggi", value: products.length ? formatRp(hargaTertinggi) : "—", color: "positive" },
    { icon: <TrendingDown size={16} />, label: "Harga Terendah", value: products.length ? formatRp(hargaTerendah) : "—", color: "soft" },
  ];

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div className="menu-header-left">
          <div className="menu-header-icon"><Package size={20} /></div>
          <div>
            <div className="menu-header-title">Manajemen Menu</div>
            <div className="menu-header-sub">Pos Caffe · Admin</div>
          </div>
        </div>
        <button className="btn-add-product" onClick={openAdd}>
          <Plus size={15} /> Tambah Produk
        </button>
      </header>

      <div className="menu-content">

        {/* Stats */}
        <div className="menu-stats">
          {STATS.map((s, i) => (
            <motion.div key={i} className={`menu-stat stat-${s.color}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}>
              <div className="stat-icon">{s.icon}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="menu-toolbar">
          <div className="toolbar-search">
            <Search size={14} color="var(--ink-muted)" strokeWidth={2} />
            <input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs">
            {tabs.map(tab => (
              <button key={tab} className={`filter-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="menu-table-wrap">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Status</th>
                <th className="right">Harga</th>
                <th className="right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[60, 40, 50, 50, 30].map((w, j) => (
                    <td key={j}><div className="skel" style={{ height: 13, width: `${w}%`, marginLeft: j >= 3 ? "auto" : 0 }} /></td>
                  ))}
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="table-empty">
                    <Package size={32} color="var(--ink-muted)" strokeWidth={1.5} />
                    <div className="table-empty-text">Belum ada produk yang cocok</div>
                  </div>
                </td></tr>
              )}

              <AnimatePresence initial={false}>
                {!loading && filtered.map((p, i) => (
                  <motion.tr key={p.id}
                    className={!p.is_available ? "row-unavailable" : ""}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}>
                    <td>
                      <div className="product-cell">
                        <div className="product-cell-thumb">
                          {p.image_url
                            ? <img src={`${IMG_BASE}${p.image_url}`} alt={p.name} />
                            : <span className="product-cell-initials">{getInitials(p.name)}</span>
                          }
                        </div>
                        <div>
                          <div className="product-cell-name">{p.name}</div>
                          <div className="product-cell-id">ID #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.category
                        ? <span className="cat-badge">{p.category}</span>
                        : <span style={{ color: "var(--ink-muted)", fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td>
                      <button className={`toggle-btn ${p.is_available ? "available" : "unavailable"}`} onClick={() => handleToggle(p)}>
                        {p.is_available
                          ? <><ToggleRight size={14} /> Tersedia</>
                          : <><ToggleLeft size={14} /> Habis</>
                        }
                      </button>
                    </td>
                    <td className="right"><span className="price-cell">{formatRp(p.price)}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="btn-icon edit" title="Edit" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                        <button className="btn-icon delete" title="Hapus" onClick={() => openDelete(p)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && closeForm()}>
            <motion.div className="modal"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}>
              <div className="modal-header">
                <span className="modal-title">{editProduct ? "Edit Produk" : "Tambah Produk"}</span>
                <button className="modal-close" onClick={closeForm}><X size={16} /></button>
              </div>
              <div className="modal-body">
                {/* Image upload */}
                <div className="form-field">
                  <label className="form-label">Foto Produk</label>
                  <div className={`image-upload-area ${imagePreview ? "has-image" : ""}`} onClick={() => fileInputRef.current?.click()}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="image-preview" />
                      : <div className="image-upload-placeholder">
                        <Upload size={20} color="var(--ink-muted)" strokeWidth={1.5} />
                        <span className="upload-text">Klik untuk upload foto</span>
                        <span className="upload-hint">JPG, PNG, WEBP · maks 2MB</span>
                      </div>
                    }
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleImageChange} />
                  {imagePreview && (
                    <button className="btn-remove-image" onClick={() => { setImageFile(null); setImagePreview(null); setForm({ ...form, image_url: "" }); }}>
                      <X size={12} /> Hapus foto
                    </button>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label">Nama Produk</label>
                  <input className="form-input" placeholder="contoh: Es Kopi Susu" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Harga (Rp)</label>
                    <input className="form-input" type="number" placeholder="25000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Kategori</label>
                    <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">— Pilih —</option>
                      {categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeForm}>Batal</button>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Menyimpan..." : editProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDelete && deleteTarget && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && closeDelete()}>
            <motion.div className="modal modal-delete"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}>
              <div className="modal-body">
                <div className="delete-icon"><Trash2 size={32} color="var(--accent)" strokeWidth={1.5} /></div>
                <div className="delete-title">Hapus Produk?</div>
                <div className="delete-desc"><strong>{deleteTarget.name}</strong> akan dihapus permanen.<br />Tindakan ini tidak bisa dibatalkan.</div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeDelete}>Batal</button>
                <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
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