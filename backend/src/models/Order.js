const mongoose = require('mongoose');

/**
 * Order schema — handles both paid (Cash) and subscriber (Credit) redemptions.
 * Uses a unique orderId for QR code generation and collection verification.
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Meal',
          required: true,
        },
        nameAtPurchase: String, // Snapshot of meal name
        priceAtPurchase: Number, // Snapshot for historical records
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Credit'], // Credit refers to subscriber meal balance
      required: true,
    },
    status: {
      type: String,
      enum: ['Requested', 'Preparing', 'Ready', 'Collected', 'Cancelled'],
      default: 'Requested',
      index: true,
    },
    collectedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    collectionToken: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate a friendly order number (e.g., TF-12345)
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `TF-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
