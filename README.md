# Pos Caffe — Sistem Point of Sale Kafe

Pos Caffe adalah aplikasi kasir berbasis web yang dirancang untuk memudahkan pengelolaan pesanan, menu, dan laporan pada usaha kafe atau restoran kecil.

> Proyek portfolio yang mendemonstrasikan REST API production-style dengan antarmuka kasir React modern.

---

## Teknologi yang Digunakan

**Backend**
- Node.js & Express.js — REST API server
- JWT Authentication — proteksi route berbasis token
- Arsitektur berbasis Middleware — autentikasi, validasi, dan error handling
- Multer — upload gambar menu

**Frontend**
- React + Vite — antarmuka pengguna yang cepat dan responsif
- React Router — navigasi antar halaman
- Axios — komunikasi dengan API
- CSS per komponen — styling terpisah tiap halaman

---

## Fitur

- Buat Order — pilih menu berdasarkan kategori dan meja, tambahkan ke keranjang
- Manajemen Menu — tambah, edit, hapus menu beserta foto dan harga
- Kategori Menu — filter menu berdasarkan kategori (Kopi, Non-Kopi, Makanan, Snack, Dessert)
- Kitchen Display — tampilan dapur real-time untuk memantau pesanan masuk
- Laporan — rekap transaksi dan penjualan
- Manajemen Pengguna — kelola akun dan role pengguna
- Login & Autentikasi — akses berbasis role (Admin, Waiter)

---

## Halaman

| Halaman | Deskripsi |
|---|---|
| Create Order | Halaman utama kasir untuk membuat pesanan per meja |
| Menu Manager | Kelola daftar menu, harga, foto, dan kategori |
| Kitchen Display | Tampilan dapur untuk memantau status pesanan |
| Laporan | Rekap transaksi dan data penjualan |
| User Manager | Manajemen akun pengguna oleh Admin |
| Login | Halaman autentikasi |

---
