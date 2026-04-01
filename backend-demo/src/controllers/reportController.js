const { supabase } = require('../lib/supabase.js');

exports.getReport = async (req, res) => {
  try {
    const { range = 'today' } = req.query;

    const msMap = { today: 86400000, week: 7 * 86400000, month: 30 * 86400000 };
    const ms = msMap[range] || 86400000;
    const since = new Date(Date.now() - ms).toISOString();

    // Ambil orders yang sudah done dalam rentang waktu
    const { data: doneOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'done')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const totalRevenue = doneOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = doneOrders.length ? totalRevenue / doneOrders.length : 0;

    // Ambil order_items untuk orders yang done
    const orderIds = doneOrders.map(o => o.id);

    let topProducts = [];

    if (orderIds.length > 0) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Hitung top products
      const productTotals = {};
      for (const oi of orderItems) {
        const name = oi.products ? oi.products.name : 'Unknown';
        if (!productTotals[name]) {
          productTotals[name] = { name, total_qty: 0, total_revenue: 0 };
        }
        productTotals[name].total_qty += oi.quantity;
        productTotals[name].total_revenue += oi.quantity * oi.price;
      }

      topProducts = Object.values(productTotals)
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 5);
    }

    res.json({
      summary: {
        total_orders: doneOrders.length,
        total_revenue: totalRevenue,
        avg_order: Math.round(avgOrder),
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
