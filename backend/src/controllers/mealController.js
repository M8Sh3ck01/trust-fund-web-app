const Meal = require('../models/Meal');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * getMeals - Retrieves all active meals from the database.
 * Supports filtering by category and availability via query params.
 */
const getMeals = async (req, res) => {
  try {
    const { category, availability } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (availability) query.availability = availability;

    const meals = await Meal.find(query).sort({ category: 1, name: 1 });
    
    return sendSuccess(res, { meals });
  } catch (err) {
    console.error('❌ Error fetching meals:', err);
    return sendError(res, 'Failed to retrieve the menu', 500);
  }
};

/**
 * getMealById - Retrieves detailed information for a specific meal.
 */
const getMealById = async (req, res) => {
  try {
    const { id } = req.params;
    const meal = await Meal.findById(id);

    if (!meal) {
      return sendError(res, 'Meal not found', 404);
    }

    return sendSuccess(res, { meal });
  } catch (err) {
    console.error('❌ Error fetching meal detail:', err);
    return sendError(res, 'Failed to retrieve meal details', 500);
  }
};

module.exports = {
  getMeals,
  getMealById,
};
