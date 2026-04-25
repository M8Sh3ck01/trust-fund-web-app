const User = require('../models/User');
const { verifyTransaction } = require('./paymentController');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Server-side subscription tier definitions.
 * This is the SINGLE SOURCE OF TRUTH for pricing — the client only sends a tier ID.
 * Keeps pricing tamper-proof; any mismatch between client display and server is harmless.
 */
const SUBSCRIPTION_TIERS = [
  { id: 1, months: 1, meals: 20, price: 85000,  label: 'Standard' },
  { id: 2, months: 2, meals: 40, price: 160000, label: 'Popular' },
  { id: 3, months: 3, meals: 60, price: 230000, label: 'Best Value' },
];

/**
 * updateProfile - Updates user preferences (dietary, phone).
 * 
 * SECURITY: Subscription fields (isSubscriber, subscriptionBalance, subscriptionExpiry, currentPlan)
 * are deliberately excluded from this endpoint. They can only be modified through
 * the dedicated activateSubscription handler which enforces server-side validation.
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { dietary, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Whitelist: only these fields are user-editable
    if (dietary !== undefined) user.dietary = dietary;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return sendSuccess(res, { 
      message: 'Profile updated successfully',
      user: {
        dietary: user.dietary,
        phone: user.phone,
        membership: user.membership || 'Bronze',
      }
    });

  } catch (err) {
    console.error('❌ Error updating user profile:', err);
    return sendError(res, 'Failed to update profile', 500);
  }
};

/**
 * getProfile - Fetches the latest user data from the database.
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      req.session = null; // Clear stale session
      return sendError(res, 'Session invalid - user no longer exists', 401);
    }

    return sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isSubscriber: user.isSubscriber,
        subscriptionBalance: user.subscriptionBalance,
        subscriptionExpiry: user.subscriptionExpiry,
        currentPlan: user.currentPlan,
        dietary: user.dietary,
        role: user.role,
        membership: user.membership || 'Bronze'
      }
    });
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    return sendError(res, 'Failed to fetch profile', 500);
  }
};

/**
 * activateSubscription - Backend-driven subscription activation.
 * 
 * The client sends ONLY the tier ID. All financial calculations (balance, expiry, price)
 * are computed server-side from the authoritative SUBSCRIPTION_TIERS table.
 * 
 * Flow:
 *   1. Client sends { tierId: 1 }
 *   2. Server looks up the tier, validates it exists
 *   3. Server computes balance (months × 20) and expiry (months × 30 days)
 *   4. Server atomically updates the User document
 *   5. Returns the updated profile
 * 
 * NOTE: Payment validation is intentionally left as a placeholder.
 * When PayChangu integration lands, a payment verification step will be
 * inserted between steps 2 and 3.
 */
const activateSubscription = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { tierId, transactionId } = req.body;

    // 1. Validate tier
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return sendError(res, `Invalid subscription tier: ${tierId}`, 400);
    }

    // 2. Payment verification
    if (!transactionId) {
      return sendError(res, 'Transaction ID is required for subscription activation', 400);
    }
    const isVerified = await verifyTransaction(transactionId, userId, tier.price);
    if (!isVerified) {
      return sendError(res, 'Invalid or incomplete payment transaction', 402);
    }

    // 3. Compute subscription values server-side
    const balance = tier.months * 20;
    const expiry = new Date(Date.now() + tier.months * 30 * 24 * 60 * 60 * 1000);
    const plan = { months: tier.months, price: tier.price };

    // 4. Atomically update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSubscriber: true,
        subscriptionBalance: balance,
        subscriptionExpiry: expiry,
        currentPlan: plan,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      req.session = null; // Clear stale session
      return sendError(res, 'Session invalid - user no longer exists', 401);
    }

    // 5. Update session to reflect new status
    req.session.user = {
      ...req.session.user,
      isSubscriber: true,
      subscriptionBalance: balance,
    };

    console.log(`✅ Subscription activated: User ${userId} → ${tier.label} (${tier.months}mo, ${balance} meals)`);

    return sendSuccess(res, {
      message: `${tier.label} plan activated successfully`,
      user: {
        isSubscriber: user.isSubscriber,
        subscriptionBalance: user.subscriptionBalance,
        subscriptionExpiry: user.subscriptionExpiry,
        currentPlan: user.currentPlan,
        dietary: user.dietary,
        membership: user.membership || 'Bronze',
      }
    });

  } catch (err) {
    console.error('❌ Error activating subscription:', err);
    return sendError(res, 'Failed to activate subscription', 500);
  }
};

module.exports = {
  updateProfile,
  getProfile,
  activateSubscription
};
