const pool = require('../config/db');

exports.getReport = async (req, res) => {
  try {
    const { range = "today" } = req.query;

    const intervalMap = { today: "1 day", week: "7 days", month: "30 days" };
    const interval = intervalMap[range] || "1 day";

    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)                        AS total_orders,
        COALESCE(SUM(total), 0)         AS total_revenue,
        COALESCE(AVG(total), 0)         AS avg_order
      FROM orders
      WHERE status = 'done'
        AND created_at >= NOW() - INTERVAL '${interval}'
    `);

    const topProductsResult = await pool.query(`
      SELECT
        products.name,
        SUM(order_items.quantity)                       AS total_qty,
        SUM(order_items.quantity * order_items.price)   AS total_revenue
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      JOIN orders   ON order_items.order_id   = orders.id
      WHERE orders.status = 'done'
        AND orders.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY products.name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    const ordersResult = await pool.query(`
      SELECT id, table_number, total, created_at
      FROM orders
      WHERE status = 'done'
        AND created_at >= NOW() - INTERVAL '${interval}'
      ORDER BY created_at DESC
    `);

    res.json({
      summary: summaryResult.rows[0],
      top_products: topProductsResult.rows,
      orders: ordersResult.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};