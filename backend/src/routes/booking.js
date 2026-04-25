const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authorize = require('../middleware/authorize');

// All booking routes require authentication
router.use(authorize('user', 'admin'));

// Current User's Bookings
router.get('/', bookingController.getUserBookings);

// Create New Booking Request
router.post('/', bookingController.createBooking);

// Update Booking Status (Accept Changes / Admin Update)
router.patch('/:id/status', bookingController.updateBookingStatus);

// GET /bookings/admin/all - Retrieve all active bookings for staff (Admin only)
router.get('/admin/all', authorize('admin'), bookingController.getAllBookings);

// Activate Booking (User Pays)
router.post('/:id/activate', bookingController.activateBooking);

// Collect Booking (Staff scan)
router.patch('/:id/collect', authorize('admin'), bookingController.collectBooking);

module.exports = router;
