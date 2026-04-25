const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, activateSubscription } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

// All user routes require authentication
router.use(requireAuth);

/**
 * @route GET /users/profile
 * @desc Get currently authenticated user's detailed profile
 */
router.get('/profile', getProfile);

/**
 * @route PATCH /users/profile
 * @desc Update user preferences (dietary, phone). Subscription fields are NOT accepted here.
 */
router.patch('/profile', updateProfile);

/**
 * @route POST /users/subscribe
 * @desc Activate a subscription plan. All pricing/balance calculated server-side.
 */
router.post('/subscribe', activateSubscription);

module.exports = router;
