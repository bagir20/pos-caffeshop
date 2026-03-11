const store = require('../config/db');

exports.createOrder = (req, res) => {
  try {
    const { table_number, items } = req.body;

    const order = {
      id: store.nextId.orders++,
      table_number,
      status: 'pending',
      total: 0,
      created_at: new Date().toISOString(),
    };

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = store.products.find(p => p.id === Number(item.product_id));
      if (!product) continue;

      const price = product.price;
      const subtotal = price * item.quantity;
      total += subtotal;

      const oi = {
        id: store.nextId.orderItems++,
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        price,
      };
      orderItems.push(oi);
      store.orderItems.push(oi);
    }

    order.total = total;
    store.orders.push(order);

    // Emit socket.io event kalau ada
    try {
      const io = req.app.get('io');
      if (io) io.emit('newOrder', { id: order.id, table_number, status: 'pending', total });
    } catch (_) {}

    res.json({ message: 'Order created', order_id: order.id, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrders = (req, res) => {
  const ordersWithItems = store.orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(order => {
      const items = store.orderItems
        .filter(oi => oi.order_id === order.id)
        .map(oi => {
          const product = store.products.find(p => p.id === oi.product_id);
          return {
            name: product ? product.name : 'Unknown',
            qty: oi.quantity,
            price: oi.price,
          };
        });
      return { ...order, items };
    });

  res.json(ordersWithItems);
};

exports.getOrderDetail = (req, res) => {
  const { id } = req.params;
  const items = store.orderItems
    .filter(oi => oi.order_id === Number(id))
    .map(oi => {
      const product = store.products.find(p => p.id === oi.product_id);
      return {
        name: product ? product.name : 'Unknown',
        quantity: oi.quantity,
        price: oi.price,
      };
    });
  res.json(items);
};

exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = store.orders.find(o => o.id === Number(id));
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    order.status = status;

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
