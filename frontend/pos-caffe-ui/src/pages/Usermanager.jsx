import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, Coffee, Plus, Edit2, Trash2, Eye, EyeOff, X } from "lucide-react";
import api from "../axiosInstance";
import "./Usermanager.css";

const formatDate = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const timer = useRef(null);
  const show = useCallback((msg, type = "success") => {
    clearTimeout(timer.current);
    setToast({ msg, type, show: true });
    timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);
  return { toast, showToast: show };
}

const EMPTY_FORM = { name: "", role: "waiter", pin: "" };

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch { showToast("Gagal memuat data user", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalAdmin = users.filter(u => u.role === "admin").length;
  const totalWaiter = users.filter(u => u.role === "waiter").length;

  const openAdd = () => { setEditUser(null); setForm(EMPTY_FORM); setShowPin(false); setShowForm(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, role: u.role, pin: "" }); setShowPin(false); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditUser(null); };
  const openDelete = (u) => { setDeleteTarget(u); setShowDelete(true); };
  const closeDelete = () => { setShowDelete(false); setDeleteTarget(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Nama wajib diisi", "error");
    if (!editUser && form.pin.length < 4) return showToast("PIN minimal 4 digit", "error");
    if (editUser && form.pin && form.pin.length < 4) return showToast("PIN minimal 4 digit", "error");
    setSaving(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
        showToast("User berhasil diperbarui");
      } else {
        await api.post("/users", form);
        showToast("User berhasil ditambahkan");
      }
      closeForm(); fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message ?? "Gagal menyimpan user", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      showToast("User dihapus"); closeDelete(); fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message ?? "Gagal menghapus user", "error");
    } finally { setDeleting(false); }
  };

  const STATS = [
    { icon: <Users size={16} />, label: "Total User", value: users.length, color: "ink" },
    { icon: <ShieldCheck size={16} />, label: "Admin", value: totalAdmin, color: "accent" },
    { icon: <Coffee size={16} />, label: "Waiter", value: totalWaiter, color: "positive" },
  ];

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header-left">
          <div className="users-header-icon"><Users size={20} /></div>
          <div>
            <div className="users-header-title">Manajemen User</div>
            <div className="users-header-sub">Pos Caffe · Admin</div>
          </div>
        </div>
        <button className="btn-add-user" onClick={openAdd}>
          <Plus size={15} /> Tambah User
        </button>
      </header>

      <div className="users-content">

        {/* Stats */}
        <div className="users-stats">
          {STATS.map((s, i) => (
            <motion.div key={i} className={`user-stat stat-${s.color}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <div className="stat-icon">{s.icon}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>PIN</th>
                <th>Bergabung</th>
                <th className="right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {[60, 50, 40, 70, 30].map((w, j) => (
                    <td key={j}><div className="skel" style={{ height: 13, width: `${w}%`, marginLeft: j === 4 ? "auto" : 0 }} /></td>
                  ))}
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="table-empty">
                    <Users size={30} color="var(--ink-muted)" strokeWidth={1.5} />
                    <div className="table-empty-text">Belum ada user</div>
                  </div>
                </td></tr>
              )}

              <AnimatePresence initial={false}>
                {!loading && users.map((u, i) => (
                  <motion.tr key={u.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <td>
                      <div className="user-cell">
                        <div className={`user-avatar ${u.role}`}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="user-cell-name">{u.name}</div>
                          <div className="user-cell-id">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-badge ${u.role}`}>{u.role === "admin" ? "Admin" : "Waiter"}</span></td>
                    <td><span className="pin-cell">••••••</span></td>
                    <td><span className="date-cell">{formatDate(u.created_at)}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="btn-icon edit" onClick={() => openEdit(u)} title="Edit"><Edit2 size={13} /></button>
                        <button className="btn-icon delete" onClick={() => openDelete(u)} title="Hapus"><Trash2 size={13} /></button>
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
                <span className="modal-title">{editUser ? "Edit User" : "Tambah User"}</span>
                <button className="modal-close" onClick={closeForm}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label className="form-label">Nama</label>
                  <input className="form-input" placeholder="contoh: Budi"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">
                    PIN {editUser && <span className="form-hint-inline">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <div className="pin-input-wrap">
                    <input className="form-input"
                      type={showPin ? "text" : "password"}
                      placeholder={editUser ? "••••••" : "Min. 4 digit"}
                      value={form.pin} maxLength={6} inputMode="numeric"
                      onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} />
                    <button className="pin-toggle" onClick={() => setShowPin(s => !s)} type="button">
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <span className="form-hint">4–6 digit angka</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeForm}>Batal</button>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Menyimpan..." : editUser ? "Simpan Perubahan" : "Tambah User"}
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
                <div className="delete-title">Hapus User?</div>
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