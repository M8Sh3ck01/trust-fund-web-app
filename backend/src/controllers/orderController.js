const Order = require('../models/Order');
const Meal = require('../models/Meal');
const User = require('../models/User');
const crypto = require('crypto');
const { verifyTransaction } = require('./paymentController');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { getIO } = require('../utils/socket');

/**
 * getUserOrders - Retrieves all orders for the currently authenticated user.
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Fetch orders, populate the meal reference within each item
    const orders = await Order.find({ user: userId })
      .populate('items.meal')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { orders });
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    return sendError(res, 'Failed to retrieve orders', 500);
  }
};

/**
 * createOrder - Persists a new order from the frontend.
 * Handles both Cash (guest/regular) and Credit (subscriber) redemptions.
 */
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMode, transactionId, notes } = req.body;
    const userId = req.session.user.id;

    // 1. Basic Validation
    if (!items || items.length === 0) {
      return sendError(res, 'Order must contain items', 400);
    }

    // 2. Fetch User and verify status if paying with Credit
    const user = await User.findById(userId);
    if (!user) {
      req.session = null; // Clear stale session
      return sendError(res, 'Session invalid - user no longer exists', 401);
    }

    if (paymentMode === 'Cash') {
      if (!transactionId) {
        return sendError(res, 'Transaction ID is required for cash payments', 400);
      }
      
      const isVerified = await verifyTransaction(transactionId, userId, totalAmount);
      if (!isVerified) {
        return sendError(res, 'Invalid or incomplete payment transaction', 402);
      }
    }

    if (paymentMode === 'Credit') {
      const requiredCredits = items.reduce((sum, item) => sum + item.quantity, 0);
      
      if (!user.isSubscriber) {
        return sendError(res, 'Insufficient subscription status for this redemption (Not a subscriber)', 403);
      }
      
      if (user.subscriptionBalance < requiredCredits) {
        return sendError(res, `Insufficient subscription balance for this redemption (Required: ${requiredCredits}, Available: ${user.subscriptionBalance})`, 403);
      }

      // Deduct credits
      user.subscriptionBalance -= requiredCredits;
      await user.save();
    }

    // 3. Prepare items with purchase-time snapshots (name, price)
    const refinedItems = await Promise.all(items.map(async (item) => {
      // Extract ID safely from object or string
      const mealId = item.meal._id || item.meal.id || item.meal;
      const meal = await Meal.findById(mealId);
      return {
        meal: meal._id,
        nameAtPurchase: meal.name,
        priceAtPurchase: meal.price,
        quantity: item.quantity
      };
    }));

    // Generate secure collection token for the QR code
    const collectionToken = crypto.randomBytes(16).toString('hex');

    const newOrder = new Order({
      user: userId,
      items: refinedItems,
      totalAmount: paymentMode === 'Credit' ? 0 : totalAmount,
      paymentMode,
      notes,
      collectionToken,
      status: 'Requested' // All orders start as Requested for the kitchen to process
    });

    await newOrder.save();
    
    // Populate before sending back to UI
    await newOrder.populate('items.meal');

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify staff of the new order
      io.to('staff_dashboard').emit('order_created', newOrder);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (order_created):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, {
      order: newOrder,
      newBalance: user.subscriptionBalance
    }, 201);

  } catch (err) {
    console.error('❌ Error creating order:', err);
    return sendError(res, 'Failed to create order', 500);
  }
};

/**
 * collectOrder - Staff endpoint to mark an order as collected using the QR token.
 */
const collectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status === 'Collected') {
      return sendError(res, 'Order has already been collected', 400);
    }

    if (order.collectionToken !== token) {
      return sendError(res, 'Invalid collection token', 403);
    }

    order.status = 'Collected';
    order.collectedAt = new Date();
    await order.save();
    await order.populate('items.meal');

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify both the user and the staff dashboard
      io.to(`user:${order.user}`).emit('order_updated', order);
      io.to('staff_dashboard').emit('order_updated', order);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (order_collected):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { message: 'Order collected successfully', order });

  } catch (err) {
    console.error('❌ Error collecting order:', err);
    return sendError(res, 'Failed to collect order', 500);
  }
};

/**
 * getAllOrders - Staff endpoint to retrieve all active orders across the system.
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Collected' } })
      .populate('user', 'name email picture')
      .populate('items.meal')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { orders });
  } catch (err) {
    console.error('❌ Error fetching all orders:', err);
    return sendError(res, 'Failed to retrieve global orders', 500);
  }
};

/**
 * updateOrderStatus - Admin/Staff endpoint to progress an order.
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id).populate('user', 'name email picture').populate('items.meal');
    if (!order) return sendError(res, 'Order not found', 404);

    order.status = status;
    await order.save();

    // --- Real-time Notification ---
    try {
      const io = getIO();
      // Notify both the user and the staff dashboard
      io.to(`user:${order.user._id || order.user}`).emit('order_updated', order);
      io.to('staff_dashboard').emit('order_updated', order);
    } catch (err) {
      console.warn('⚠️ Socket.io notification failed (order_status_update):', err.message);
    }
    // ------------------------------

    return sendSuccess(res, { order });
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    return sendError(res, 'Failed to update order status', 500);
  }
};

/**
 * getOrderStatus - Gets the status of a specific order (for UI polling)
 */
const getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select('status');
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    return sendSuccess(res, { status: order.status });
  } catch (err) {
    console.error('❌ Error getting order status:', err);
    return sendError(res, 'Failed to get order status', 500);
  }
};

module.exports = {
  getUserOrders,
  createOrder,
  collectOrder,
  getOrderStatus,
  getAllOrders,
  updateOrderStatus
};
