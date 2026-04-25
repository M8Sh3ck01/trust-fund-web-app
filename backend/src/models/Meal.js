const mongoose = require('mongoose');

/**
 * Meal schema — central management for the Trust Fund menu.
 * Includes nutritional data and status indicators for the frontend.
 */
const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Meal description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: ['Main', 'Vegetarian', 'Special', 'Sides'],
      default: 'Main',
      index: true,
    },
    availability: {
      type: String,
      enum: ['Available', 'Limited', 'SoldOut'],
      default: 'Available',
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    prepTime: {
      type: String,
      default: '15-20 min',
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: String, default: '0g' },
      carbs: { type: String, default: '0g' },
      fat: { type: String, default: '0g' },
    },
    ingredients: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for common search patterns
mealSchema.index({ category: 1, availability: 1 });

module.exports = mongoose.model('Meal', mealSchema);
