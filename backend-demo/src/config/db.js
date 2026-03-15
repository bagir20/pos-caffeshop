const store = {
  categories: [
    { id: 4, name: 'Snack' },
    { id: 5, name: 'Kopi' },
    { id: 6, name: 'Non-Kopi' },
    { id: 7, name: 'Makanan' },
    { id: 8, name: 'Dessert' },
  ],

  products: [
    { id: 1,  name: 'Espresso',      price: 18000, category_id: 5, image_url: null, is_available: true },
    { id: 2,  name: 'Latte',         price: 22000, category_id: 5, image_url: null, is_available: true },
    { id: 3,  name: 'Cappuccino',    price: 22000, category_id: 5, image_url: null, is_available: true },
    { id: 4,  name: 'Matcha Latte',  price: 25000, category_id: 6, image_url: null, is_available: true },
    { id: 11, name: 'Chocolate',     price: 23000, category_id: 6, image_url: null, is_available: true },
    { id: 5,  name: 'French Fries',  price: 20000, category_id: 4, image_url: null, is_available: true },
    { id: 15, name: 'Chicken Nugget',price: 22000, category_id: 4, image_url: null, is_available: true },
    { id: 16, name: 'Onion Ring',    price: 20000, category_id: 4, image_url: null, is_available: true },
    { id: 6,  name: 'Nasi Goreng',   price: 30000, category_id: 7, image_url: null, is_available: true },
    { id: 13, name: 'Chicken Katsu', price: 32000, category_id: 7, image_url: null, is_available: true },
    { id: 17, name: 'Cheese Cake',   price: 25000, category_id: 8, image_url: null, is_available: true },
    { id: 18, name: 'Brownies',      price: 22000, category_id: 8, image_url: null, is_available: true },
    { id: 19, name: 'Ice Cream',     price: 18000, category_id: 8, image_url: null, is_available: true },
    { id: 20, name: 'Waffle',        price: 24000, category_id: 8, image_url: null, is_available: true },
    { id: 21, name: 'Pancake',       price: 23000, category_id: 8, image_url: null, is_available: true },
  ],

  orders: [],
  orderItems: [],

  users: [
    { id: 1, name: 'Admin Demo', role: 'admin',  pin_plain: '1234' },
    { id: 2, name: 'Waiter Demo', role: 'waiter', pin_plain: '5678' },
  ],

  nextId: {
    products: 22,
    orders: 1,
    orderItems: 1,
  },
};

module.exports = store;