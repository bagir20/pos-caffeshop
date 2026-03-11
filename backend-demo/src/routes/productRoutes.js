const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.get('/',       productController.getProducts);     
router.post('/',      auth, upload.single('image'), productController.createProduct);
router.put('/:id',    auth, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.patch('/:id/toggle', auth, productController.toggleAvailability);

module.exports = router;