require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');



app.use(cors({
  origin: [
    "https://pos-caffeshop-u9m5.vercel.app",
    // tambahkan juga kalau ada custom domain lain
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options('*', cors({
  origin: [
    "https://pos-caffeshop-u9m5.vercel.app",
  ],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// ─────────────────────────────────────────
// Static file (gambar produk demo)
// ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────
// Root / Health Check
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'POS Caffe Backend — Demo Mode 🚀',
    info: 'Data bersifat sementara (in-memory). Reset otomatis saat server restart.',
    demo_pins: {
      admin: '1234',
      waiter: '5678'
    }
  });
});

module.exports = app;