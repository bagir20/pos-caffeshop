const store = require('../config/db');

// Helper: gabungkan produk dengan nama kategori
const withCategory = (product) => {
  const cat = store.categories.find(c => c.id === product.category_id);
  return { ...product, category: cat ? cat.name : null };
};

exports.getProducts = (req, res) => {
  const products = store.products.map(withCategory);
  res.json(products);
};

exports.createProduct = (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    // Cloudinary: URL ada di req.file.path
    const image_url = req.file ? req.file.path : null;

    const newProduct = {
      id: store.nextId.products++,
      name,
      price: Number(price),
      category_id: Number(category_id),
      image_url,
      is_available: true,
    };

    store.products.push(newProduct);
    res.json({ message: 'Product created', product: withCategory(newProduct) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const idx = store.products.findIndex(p => p.id === Number(id));

    if (idx === -1) return res.status(404).json({ message: 'Product tidak ditemukan' });

    // Cloudinary: URL ada di req.file.path
    const image_url = req.file
      ? req.file.path
      : req.body.image_url || store.products[idx].image_url;

    store.products[idx] = {
      ...store.products[idx],
      name,
      price: Number(price),
      category_id: Number(category_id),
      image_url,
    };

    res.json({ message: 'Product updated', product: withCategory(store.products[idx]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const idx = store.products.findIndex(p => p.id === Number(id));
    if (idx === -1) return res.status(404).json({ message: 'Product tidak ditemukan' });
    store.products.splice(idx, 1);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleAvailability = (req, res) => {
  try {
    const { id } = req.params;
    const product = store.products.find(p => p.id === Number(id));
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    product.is_available = !product.is_available;
    res.json({ id: product.id, name: product.name, is_available: product.is_available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};