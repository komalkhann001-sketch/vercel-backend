const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getOrders,
    getOrderStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validator');

router.route('/').post(protect, validateOrder, addOrderItems).get(protect, admin, getOrders);
router.route('/stats').get(protect, admin, getOrderStats);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

module.exports = router;
