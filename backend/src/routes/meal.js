const express = require('express');
const router = express.Router();
const { getMeals, getMealById } = require('../controllers/mealController');

/**
 * Public Routes - Browsing the menu is available to everyone
 */
router.get('/', getMeals);
router.get('/:id', getMealById);

module.exports = router;
