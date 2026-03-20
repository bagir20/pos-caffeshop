import { supabase } from '../lib/supabase.js'
const store = require('../config/db')

// Helper kategori (masih pakai store)
const withCategory = (product) => {
  const cat = store.categories.find(c => c.id === product.category_id)
  return { ...product, category: cat ? cat.name : null }
}

// ✅ GET PRODUCTS (dari Supabase)
export async function getProducts(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }

    // 🔥 penting: gabung kategori + anti null
    const products = (data || []).map(withCategory)

    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ CREATE PRODUCT
export async function createProduct(req, res) {
  try {
    const { name, price, category_id } = req.body
    const image_url = req.file ? req.file.path : null

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          price: Number(price),
          category_id: Number(category_id),
          image_url,
          is_available: true
        }
      ])
      .select()

    if (error) throw error

    res.json({
      message: 'Product created',
      product: withCategory(data[0])
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ UPDATE PRODUCT
export async function updateProduct(req, res) {
  try {
    const { id } = req.params
    const { name, price, category_id } = req.body

    const image_url = req.file
      ? req.file.path
      : req.body.image_url

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        price: Number(price),
        category_id: Number(category_id),
        image_url
      })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({
      message: 'Product updated',
      product: withCategory(data[0])
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ DELETE PRODUCT
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ TOGGLE AVAILABILITY
export async function toggleAvailability(req, res) {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('products')
      .select('is_available, name')
      .eq('id', id)
      .single()

    if (error) throw error

    const { error: updateError } = await supabase
      .from('products')
      .update({ is_available: !data.is_available })
      .eq('id', id)

    if (updateError) throw updateError

    res.json({
      id,
      name: data.name,
      is_available: !data.is_available
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}