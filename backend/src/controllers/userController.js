const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET semua user
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, role, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah user
exports.createUser = async (req, res) => {
  try {
    const { name, role, pin } = req.body;
    if (!name || !role || !pin) {
      return res.status(400).json({ message: "Nama, role, dan PIN wajib diisi" });
    }
    if (pin.length < 4) {
      return res.status(400).json({ message: "PIN minimal 4 digit" });
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    const result = await pool.query(
      "INSERT INTO users (name, role, pin) VALUES ($1, $2, $3) RETURNING id, name, role, created_at",
      [name, role, hashedPin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, pin } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: "Nama dan role wajib diisi" });
    }

    let query, params;
    if (pin && pin.trim() !== "") {
      if (pin.length < 4) {
        return res.status(400).json({ message: "PIN minimal 4 digit" });
      }
      const hashedPin = await bcrypt.hash(pin, 10);
      query  = "UPDATE users SET name=$1, role=$2, pin=$3 WHERE id=$4 RETURNING id, name, role, created_at";
      params = [name, role, hashedPin, id];
    } else {
      // PIN tidak diubah
      query  = "UPDATE users SET name=$1, role=$2 WHERE id=$3 RETURNING id, name, role, created_at";
      params = [name, role, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Cegah hapus diri sendiri
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "Tidak bisa menghapus akun sendiri" });
    }
    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "User dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};