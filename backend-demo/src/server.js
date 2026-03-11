require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// ─── CORS ────────────────────────────────────────────────────
// Izinkan semua origin biar bisa diakses dari porto manapun
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan requests tanpa origin (Postman, curl) dan semua origin di list
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // Di demo mode, izinkan semua origin dengan *.vercel.app
    if (origin && origin.endsWith('.vercel.app')) return callback(null, true);
    callback(null, true); // Demo mode: allow all
  },
  credentials: true,
}));

// ─── Socket.IO ───────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', credentials: false },
});

app.set('io', io);

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/report',     reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users',      userRoutes);

// Static uploads (gambar produk yang sudah ada di repo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'POS Caffe Backend — Demo Mode 🚀',
    info: 'Data bersifat sementara (in-memory). Reset otomatis saat server restart.',
    demo_pins: { admin: '1234', waiter: '5678' },
  });
});

// ─── Socket Events ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ POS Demo Server running on port ${PORT}`);
  console.log(`📦 Mode: IN-MEMORY (no database)`);
  console.log(`🔑 Demo PINs - Admin: 1234 | Waiter: 5678`);
});

module.exports = app;
