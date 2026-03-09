const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { pin } = req.body;
    console.log("PIN diterima:", pin);

    const result = await pool.query(
      "SELECT * FROM users WHERE role IN ('admin', 'waiter')"
    );
    console.log("Users ditemukan:", result.rows.length);

    let matchedUser = null;
    for (const user of result.rows) {
      const valid = await bcrypt.compare(pin, user.pin);
      if (valid) { matchedUser = user; break; }
    }

    if (!matchedUser) {
      return res.status(401).json({ message: "PIN salah" });
    }

    const token = jwt.sign(
      { id: matchedUser.id, name: matchedUser.name, role: matchedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Kirim token via httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // ganti true kalau pakai HTTPS
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
    });

    res.json({
      message: "Login berhasil",
      user: { id: matchedUser.id, name: matchedUser.name, role: matchedUser.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logout berhasil" });
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};