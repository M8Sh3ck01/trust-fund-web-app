const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, logout } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const authorize = require('../middleware/authorize');
const { sendSuccess } = require('../utils/responseHelper');

// ── Public Routes ─────────────────────────────────────────────────────────────

// Initiates the OAuth flow — redirects user to Google's consent screen
router.get('/google', googleAuth);

// Google redirects here after user grants/denies consent
router.get('/google/callback', googleCallback);

// Destroys the session and clears the cookie
router.get('/logout', logout);

const User = require('../models/User');

// Returns the currently authenticated user's session profile (or null if guest).
router.get('/me', async (req, res) => {
  if (!req.session?.user) {
    return sendSuccess(res, { user: null });
  }

  try {
    // Sync latest role/status from DB (important if role was changed while logged in)
    const user = await User.findById(req.session.user.id);
    if (user) {
      req.session.user.role = user.role;
      req.session.user.isSubscriber = user.isSubscriber;
    }
    
    return sendSuccess(res, { user: req.session.user });
  } catch (err) {
    return sendSuccess(res, { user: req.session.user }); // Fallback to session
  }
});

// Admin-only test route
router.get('/admin/test', authorize('admin'), (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome, Admin! You have access to this restricted route.',
    user: req.session.user,
  });
});

module.exports = router;
