const express = require('express');
const router = express.Router();
const { simulatePayment } = require('../controllers/paymentController');
const requireAuth = require('../middleware/requireAuth');

/**
 * Route: /api/payments/paychangu/simulate
 * Simulates a PayChangu payment gateway transaction.
 */
router.post('/paychangu/simulate', requireAuth, simulatePayment);

module.exports = router;
