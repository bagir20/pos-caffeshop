const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM categories ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};