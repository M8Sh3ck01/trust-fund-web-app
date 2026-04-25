/**
 * requireAuth - Middleware guard for protected routes.
 *
 * Checks that a valid user object exists in the session (set during OAuth callback).
 * If absent, returns 401 rather than redirecting — this API is consumed by frontends
 * that handle their own routing. Adjust to redirect if building a server-rendered app.
 */
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — please log in via /auth/google',
    });
  }
  next();
};

module.exports = requireAuth;
