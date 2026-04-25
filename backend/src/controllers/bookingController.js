const Booking = require('../models/Booking');
const { verifyTransaction } = require('./paymentController');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { getIO } = require('../utils/socket');

/**
 * createBooking - Handles new event booking requests.
 */
const createBooking = async (req, res) => {
  try {
    const { 
      eventName, 
      date, 
      time, 
      headcount, 
      contactNumber, 
      dietaryPreference, 
      selectedMealIds, 
      note 
    } = req.body;

    // --- Phase 3.1: Foundation & Constraints ---
    
    // 1. Minimum Headcount Validation
    if (!headcount || headcount < 5) {
      return sendError(res, 'Event bookings require a minimum of 5 guests.', 400);
    }

    // 2. 48-Hour Advance Notice Validation
    const bookingDate = new Date(date);
    const now = new Date();
    const minAdvanceTime = 48 * 60 * 60 * 1000; // 48 hours in ms

    if (bookingDate.getTime() < now.getTime() + minAdvanceTime) {
      return sendError(res, 'Manual bookings must be requested at least 48 hours in advance.', 400);
    }
    // -------------------------------------------

    const userId = req.session.user.id;

    const newBooking = new Booking({
      user: userId,
      eventName,
      eventDate: new Date(date),
      eventTime: time,
      headcount,
      contactNumber,
      dietaryPreference,
      selectedMeals: selectedMealIds.map(id => id._id || id.id || id),
      notes: note,
      status: 'Requested'
    });

    await newBooking.save();
    
    // Populate meals for the return object
    await newBooking.populate('selectedMeals');

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify staff of the new booking request
      io.to('staff_dashboard').emit('booking_created', newBooking);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (booking_created):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { booking: newBooking }, 201);
  } catch (err) {
    console.error('❌ Error creating booking:', err);
    return sendError(res, err.message || 'Failed to create booking', 500);
  }
};

/**
 * getUserBookings - Retrieves all bookings for the authenticated user.
 */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('selectedMeals')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { bookings });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    return sendError(res, 'Failed to fetch bookings', 500);
  }
};

/**
 * updateBookingStatus - Advanced status changes (Accepted by user or progressed by kitchen).
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, headcount: newHeadcount } = req.body;
    const { role, id: requesterId } = req.session.user;

    // Find booking
    const booking = await Booking.findById(id).populate('selectedMeals');
    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Verify ownership or check for admin role
    const isOwner = booking.user.toString() === requesterId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 'Unauthorized to update this booking', 403);
    }

    // 1. Headcount Update (Only allowed if status is Requested or Confirmed)
    if (newHeadcount && (booking.status === 'Requested' || booking.status === 'Confirmed')) {
      booking.headcount = newHeadcount;
      // Re-calculate total if already confirmed or about to be confirmed
      const headcount = booking.headcount;
      const total = booking.selectedMeals.reduce((acc, meal) => acc + (meal.price * headcount), 0);
      booking.totalAmount = total;
    }

    // 2. Status Update
    if (status) {
      // If moving to 'Confirmed', "Lock" the total price for payment activation
      if (status === 'Confirmed' && booking.status !== 'Confirmed') {
        const headcount = booking.headcount || 1;
        const total = booking.selectedMeals.reduce((acc, meal) => acc + (meal.price * headcount), 0);
        booking.totalAmount = total;
      }
      booking.status = status;
    }
    if (notes) booking.notes = notes;

    await booking.save();
    await booking.populate('selectedMeals');

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify both the user and the staff dashboard
      io.to(`user:${booking.user}`).emit('booking_updated', booking);
      io.to('staff_dashboard').emit('booking_updated', booking);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (booking_status_update):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { booking: booking });
  } catch (err) {
    console.error('❌ Error updating booking:', err);
    return sendError(res, 'Failed to update booking status', 500);
  }
};

/**
 * activateBooking - Verifies a payment transaction and schedules the event.
 */
const activateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    const userId = req.session.user.id;

    const booking = await Booking.findOne({ _id: id, user: userId }).populate('selectedMeals');
    if (!booking) {
      return sendError(res, 'Booking not found or unauthorized', 404);
    }

    if (booking.status !== 'Confirmed') {
      return sendError(res, 'Booking must be confirmed by kitchen before payment.', 400);
    }

    if (booking.paymentStatus === 'Paid') {
      return sendError(res, 'Booking is already paid and activated.', 400);
    }

    // Verify the transaction via the payment helper
    const isVerified = await verifyTransaction(transactionId, userId, booking.totalAmount);
    if (!isVerified) {
      return sendError(res, 'Invalid transaction or amount mismatch. Activation failed.', 402);
    }

    // Update status to Scheduled (Full Arranged)
    booking.transactionId = transactionId;
    booking.paymentStatus = 'Paid';
    booking.status = 'Scheduled';

    await booking.save();

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify both the user and the staff dashboard
      io.to(`user:${booking.user}`).emit('booking_updated', booking);
      io.to('staff_dashboard').emit('booking_updated', booking);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (booking_activated):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { 
      message: 'Booking successfully activated and scheduled!',
      booking 
    });
  } catch (err) {
    console.error('❌ Error activating booking:', err);
    return sendError(res, 'Failed to activate booking', 500);
  }
};

/**
 * getAllBookings - Staff endpoint to retrieve all active and upcoming event bookings.
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $ne: 'Collected' } })
      .populate('user', 'name email picture')
      .populate('selectedMeals')
      .sort({ eventDate: 1 });

    return sendSuccess(res, { bookings });
  } catch (err) {
    console.error('❌ Error fetching all bookings:', err);
    return sendError(res, 'Failed to retrieve global bookings', 500);
  }
};

/**
 * collectBooking - Staff endpoint to mark a booking as collected/attended.
 */
const collectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // In case we want to pass a specific final state

    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 'Booking not found', 404);

    if (booking.status === 'Collected') {
      return sendError(res, 'Booking already collected', 400);
    }

    booking.status = 'Collected';
    await booking.save();

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify both the user and the staff dashboard
      io.to(`user:${booking.user}`).emit('booking_updated', booking);
      io.to('staff_dashboard').emit('booking_updated', booking);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (booking_collected):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { message: 'Booking collected successfully', booking });
  } catch (err) {
    console.error('❌ Error collecting booking:', err);
    return sendError(res, 'Failed to collect booking', 500);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  activateBooking,
  getAllBookings,
  collectBooking
};
