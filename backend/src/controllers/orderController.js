const pool = require('../config/db');

exports.createOrder = async (req, res) => {
  try {
    const { table_number, items } = req.body;

    const orderResult = await pool.query(
      `INSERT INTO orders (table_number, status, total)
       VALUES ($1,'pending',0)
       RETURNING *`,
      [table_number]
    );

    const order = orderResult.rows[0];
    let total = 0;

    for (const item of items) {
      const productResult = await pool.query(
        `SELECT price FROM products WHERE id=$1`,
        [item.product_id]
      );

      const price = productResult.rows[0].price;
      const subtotal = price * item.quantity;
      total += subtotal;

      await pool.query(
        `INSERT INTO order_items (order_id,product_id,quantity,price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, item.product_id, item.quantity, price]
      );
    }

 await pool.query(
  `UPDATE orders SET total=$1 WHERE id=$2`,
  [total, order.id]
);

const io = req.app.get("io");

io.emit("newOrder", {
  id: order.id,
  table_number: order.table_number,
  status: "pending",
  total: total
});

res.json({
  message: "Order created",
  order_id: order.id,
  total: total
});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Ambil semua order
    const orderResult = await pool.query(`
      SELECT id, table_number, status, total, created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    const orders = orderResult.rows;

    // Ambil items untuk setiap order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemResult = await pool.query(`
          SELECT 
            products.name,
            order_items.quantity AS qty,
            order_items.price
          FROM order_items
          JOIN products ON order_items.product_id = products.id
          WHERE order_items.order_id = $1
        `, [order.id]);

        return { ...order, items: itemResult.rows };
      })
    );

    res.json(ordersWithItems);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        products.name,
        order_items.quantity,
        order_items.price
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      WHERE order_items.order_id = $1
    `, [id]);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    const updatedOrder = result.rows[0];

    // ambil socket instance
    const io = req.app.get("io");

    // kirim event realtime
    io.emit("orderUpdated", updatedOrder);

    res.json({
      message: "Order status updated",
      order: updatedOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });
  }
};