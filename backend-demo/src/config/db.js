const store = {
  categories: [
    { id: 4, name: 'Snack' },
    { id: 5, name: 'Kopi' },
    { id: 6, name: 'Non-Kopi' },
    { id: 7, name: 'Makanan' },
    { id: 8, name: 'Dessert' },
  ],

  // ❌ HAPUS products

  orders: [],
  orderItems: [],

  users: [
    { id: 1, name: 'Admin Demo', role: 'admin',  pin_plain: '1234' },
    { id: 2, name: 'Waiter Demo', role: 'waiter', pin_plain: '5678' },
  ],

  nextId: {
    // ❌ products dihapus
    orders: 1,
    orderItems: 1,
  },
};

module.exports = store;