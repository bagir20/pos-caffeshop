# POS Caffe — Demo Backend

Backend versi **demo/portfolio** yang bisa langsung deploy ke Vercel **tanpa database**.

## ✅ Perubahan dari versi asli
| Sebelum | Sesudah (Demo) |
|---------|----------------|
| PostgreSQL | In-Memory (array JS) |
| bcrypt hash PIN | PIN plain text (`1234` / `5678`) |
| Disk storage (multer) | Memory storage (file tidak disimpan) |
| `localhost:5173` only | Semua origin diizinkan |

## 🔑 Demo PIN
| Role | PIN |
|------|-----|
| Admin | `1234` |
| Waiter | `5678` |

> ⚠️ Data order/produk yang diinput akan **hilang otomatis** saat Vercel serverless function sleep (~beberapa menit idle). Cocok untuk demo!

---

## 🚀 Cara Deploy ke Vercel

### 1. Push folder ini ke GitHub
Pastikan folder `backend-demo` sudah ada di repo GitHub kamu, atau buat repo baru.

### 2. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo GitHub kamu
3. Set **Root Directory** ke `backend` (atau folder backend ini)
4. Tambah **Environment Variables**:
   - `JWT_SECRET` → isi string random panjang, contoh: `pos-demo-secret-2025`
5. Klik **Deploy**

### 3. Catat URL Backend
Setelah deploy, kamu dapat URL seperti:
```
https://pos-caffeshop-backend.vercel.app
```

---

## 🎨 Update Frontend

Di file konfigurasi API frontend kamu (biasanya `src/api/axios.js` atau `.env`):

```env
VITE_API_URL=https://pos-caffeshop-backend.vercel.app
```

Atau langsung di kode:
```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
```

---

## 🏃 Jalankan Lokal

```bash
npm install
cp .env.example .env
npm run dev
```

Server jalan di `http://localhost:5000`

Test di browser: `http://localhost:5000` → tampil info demo
