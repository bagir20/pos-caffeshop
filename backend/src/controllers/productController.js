const pool = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT 
  products.id,
  products.name,
  products.price,
  products.image_url,
  products.is_available,
  categories.name AS category
FROM products
LEFT JOIN categories
ON products.category_id = categories.id
ORDER BY products.id
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO products (name, price, category_id, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, price, category_id, image_url]
    );

    res.json({ message: "Product created", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : req.body.image_url;

    const result = await pool.query(
      `UPDATE products SET name=$1, price=$2, category_id=$3, image_url=$4
       WHERE id=$5 RETURNING *`,
      [name, price, category_id, image_url, id]
    );

    res.json({ message: "Product updated", product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM products WHERE id=$1`, [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE products 
       SET is_available = NOT is_available 
       WHERE id = $1 
       RETURNING id, name, is_available`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};