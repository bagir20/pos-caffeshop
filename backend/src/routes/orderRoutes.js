const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/',           orderController.getOrders);      // ← tanpa auth, Kitchen butuh ini
router.get('/:id',        orderController.getOrderDetail); // ← tanpa auth
router.post('/',          auth, orderController.createOrder);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;