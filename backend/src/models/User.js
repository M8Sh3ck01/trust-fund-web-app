const mongoose = require('mongoose');

/**
 * User schema — stores data derived from Google's ID Token claims.
 * We use Google's 'sub' claim as the canonical user identifier ('googleId').
 * This is stable and never changes, unlike email.
 */
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String, // URL to Google profile avatar
    },
    phone: {
      type: String,
      trim: true,
    },
    membership: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Founders'],
      default: 'Bronze',
    },
    isSubscriber: {
      type: Boolean,
      default: false,
    },
    subscriptionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    subscriptionExpiry: {
      type: Date,
    },
    currentPlan: {
      months: { type: Number },
      price: { type: Number },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Optionally track the last login time for audit purposes
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Senior Developer Pattern: Virtual Property
 * Encapsulates the logic for "Is this user a valid active subscriber?"
 * Checks both the flag and the expiry date in one clean property.
 */
userSchema.virtual('isSubscriptionActive').get(function () {
  if (!this.isSubscriber || !this.subscriptionExpiry) return false;
  return new Date() < this.subscriptionExpiry;
});

module.exports = mongoose.model('User', userSchema);
