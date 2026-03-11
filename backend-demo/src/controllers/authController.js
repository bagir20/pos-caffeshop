const store = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-pos-caffeshop';

exports.login = async (req, res) => {
  try {
    const { pin } = req.body;

    // Demo mode: bandingkan PIN langsung (plain text)
    const matchedUser = store.users.find(u => u.pin_plain === pin);

    if (!matchedUser) {
      return res.status(401).json({ message: 'PIN salah. Coba: 1234 (admin) atau 5678 (waiter)' });
    }

    const token = jwt.sign(
      { id: matchedUser.id, name: matchedUser.name, role: matchedUser.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login berhasil',
      user: { id: matchedUser.id, name: matchedUser.name, role: matchedUser.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ message: 'Logout berhasil' });
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
