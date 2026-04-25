const express = require('express');
const router = express.Router();
const { getUserOrders, createOrder, collectOrder, getOrderStatus, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const requireAuth = require('../middleware/requireAuth');
const authorize = require('../middleware/authorize');

/**
 * Route: /orders
 * All routes here are protected - users can only manage their own orders.
 */

// GET /orders - Retrieve current user's order history
router.get('/', requireAuth, getUserOrders);

// POST /orders - Place a new order
router.post('/', requireAuth, createOrder);

// GET /orders/:id/status - Poll order status
router.get('/:id/status', requireAuth, getOrderStatus);

// GET /orders/admin/all - Retrieve all active orders for staff (Admin only)
router.get('/admin/all', requireAuth, authorize('admin'), getAllOrders);

// PATCH /orders/:id/status - Staff action to progress order
router.patch('/:id/status', requireAuth, authorize('admin'), updateOrderStatus);

// PATCH /orders/:id/collect - Used by staff (or dev sim) to collect an order using its token
router.patch('/:id/collect', requireAuth, collectOrder);

module.exports = router;
