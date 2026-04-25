/**
 * authorize - Factory function to check if the logged-in user has the required role(s).
 *
 * @param {...string} allowedRoles - One or more roles allowed to access the route.
 * @returns {Function} Express middleware that checks req.session.user.role.
 *
 * Usage:
 *   router.get('/admin/stats', authorize('admin'), adminController.getStats);
 *   router.get('/orders', authorize('user', 'admin'), orderController.list);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user is logged in
    // This assumes requireAuth has already run OR we repeat the check here for safety.
    // Repeating it handles the case where authorize is used as the sole guard.
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized — please log in',
      });
    }

    const { role } = req.session.user;

    // 2. Check if their role is in the allowed list
    if (!allowedRoles.includes(role)) {
      console.warn(`🚫 Forbidden: Role '${role}' attempted to access restricted resource. Required: [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to access this resource (Required: ${allowedRoles.join(' or ')})`,
      });
    }

    next();
  };
};

module.exports = authorize;
