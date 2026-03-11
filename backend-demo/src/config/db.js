// ============================================================
// IN-MEMORY STORE — Demo / Portfolio Mode
// Data hilang otomatis saat serverless function sleep (Vercel)
// ============================================================

const store = {
  categories: [
    { id: 1, name: 'Coffee' },
    { id: 2, name: 'Non-Coffee' },
    { id: 3, name: 'Food' },
    { id: 4, name: 'Snack' },
  ],

  products: [
    { id: 1, name: 'Espresso',        price: 15000, category_id: 1, image_url: null, is_available: true },
    { id: 2, name: 'Americano',       price: 18000, category_id: 1, image_url: null, is_available: true },
    { id: 3, name: 'Cappuccino',      price: 22000, category_id: 1, image_url: null, is_available: true },
    { id: 4, name: 'Latte',           price: 25000, category_id: 1, image_url: null, is_available: true },
    { id: 5, name: 'V60',             price: 28000, category_id: 1, image_url: null, is_available: true },
    { id: 6, name: 'Matcha Latte',    price: 25000, category_id: 2, image_url: null, is_available: true },
    { id: 7, name: 'Taro Latte',      price: 25000, category_id: 2, image_url: null, is_available: true },
    { id: 8, name: 'Strawberry Milk', price: 22000, category_id: 2, image_url: null, is_available: true },
    { id: 9, name: 'Nasi Goreng',     price: 35000, category_id: 3, image_url: null, is_available: true },
    { id: 10, name: 'Sandwich',       price: 28000, category_id: 3, image_url: null, is_available: true },
    { id: 11, name: 'Kentang Goreng', price: 18000, category_id: 4, image_url: null, is_available: true },
    { id: 12, name: 'Donat',          price: 12000, category_id: 4, image_url: null, is_available: true },
  ],

  orders: [],
  orderItems: [],

  users: [
    // PIN: 1234  (pre-hashed untuk demo — kita bypass bcrypt di mode demo)
    { id: 1, name: 'Admin Demo', role: 'admin',  pin_plain: '1234' },
    { id: 2, name: 'Waiter Demo', role: 'waiter', pin_plain: '5678' },
  ],

  nextId: {
    products: 13,
    orders: 1,
    orderItems: 1,
  },
};

module.exports = store;
