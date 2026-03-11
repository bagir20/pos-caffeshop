const store = require('../config/db');

exports.getReport = (req, res) => {
  try {
    const { range = 'today' } = req.query;

    const msMap = { today: 86400000, week: 7 * 86400000, month: 30 * 86400000 };
    const ms = msMap[range] || 86400000;
    const since = new Date(Date.now() - ms);

    const doneOrders = store.orders.filter(
      o => o.status === 'done' && new Date(o.created_at) >= since
    );

    const totalRevenue = doneOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = doneOrders.length ? totalRevenue / doneOrders.length : 0;

    // Top products
    const productTotals = {};
    for (const order of doneOrders) {
      const items = store.orderItems.filter(oi => oi.order_id === order.id);
      for (const oi of items) {
        const product = store.products.find(p => p.id === oi.product_id);
        const name = product ? product.name : 'Unknown';
        if (!productTotals[name]) productTotals[name] = { name, total_qty: 0, total_revenue: 0 };
        productTotals[name].total_qty += oi.quantity;
        productTotals[name].total_revenue += oi.quantity * oi.price;
      }
    }

    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);

    res.json({
      summary: {
        total_orders: doneOrders.length,
        total_revenue: totalRevenue,
        avg_order: avgOrder,
      },
      top_products: topProducts,
      orders: doneOrders.map(o => ({
        id: o.id,
        table_number: o.table_number,
        total: o.total,
        created_at: o.created_at,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
