const { supabase } = require('../lib/supabase.js');
const store = require('../config/db');

// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { table_number, items, payment_method } = req.body;

    // Ambil semua products dari Supabase
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*');

    if (productError) throw productError;

    // Hitung total
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find(p => p.id === Number(item.product_id));
      if (!product) continue;

      const subtotal = product.price * item.quantity;
      total += subtotal;

      orderItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Insert order ke Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ table_number, status: 'pending', payment_method: payment_method || null, total }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order_items ke Supabase
    const itemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Emit socket.io event
    try {
      const io = req.app.get('io');
      if (io) io.emit('newOrder', {
        id: orderData.id,
        table_number,
        status: 'pending',
        total,
      });
    } catch (_) {}

    res.json({ message: 'Order created', order_id: orderData.id, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET ALL ORDERS
exports.getOrders = async (req, res) => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Ambil semua order_items sekaligus
    const orderIds = orders.map(o => o.id);

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds.length ? orderIds : [0]);

    if (itemsError) throw itemsError;

    // Ambil products untuk nama produk
    const { data: products } = await supabase.from('products').select('id, name');

    const ordersWithItems = orders.map(order => {
      const items = orderItems
        .filter(oi => oi.order_id === order.id)
        .map(oi => {
          const product = products.find(p => p.id === oi.product_id);
          return {
            name: product ? product.name : 'Unknown',
            qty: oi.quantity,
            price: oi.price,
          };
        });
      return { ...order, items };
    });

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET ORDER DETAIL
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: items, error } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', id);

    if (error) throw error;

    const result = items.map(oi => ({
      name: oi.products ? oi.products.name : 'Unknown',
      quantity: oi.quantity,
      price: oi.price,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    try {
      const io = req.app.get('io');
      if (io) io.emit('orderUpdated', order);
    } catch (_) {}

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};
