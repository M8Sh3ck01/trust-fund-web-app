const mongoose = require('mongoose');

/**
 * Booking schema — manages event reservations and large group bookings.
 * Designed to capture detailed requirements from the Booking Wizard.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    headcount: {
      type: Number,
      required: [true, 'Headcount is required'],
      min: [1, 'Headcount must be at least 1'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
    },
    dietaryPreference: {
      type: String,
      default: 'No Preference',
    },
    selectedMeals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }],
    status: {
      type: String,
      enum: ['Requested', 'ChangesMade', 'Confirmed', 'Scheduled', 'Preparing', 'Ready', 'Collected', 'Cancelled'],
      default: 'Requested',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      index: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String, // Internal staff notes or kitchen message to user
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Basic validation to ensure event date is in the future
bookingSchema.path('eventDate').validate(function (value) {
  return value > new Date();
}, 'Event date must be in the future');

module.exports = mongoose.model('Booking', bookingSchema);
