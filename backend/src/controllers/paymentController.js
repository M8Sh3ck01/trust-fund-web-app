const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * simulatePayment - Mock PayChangu gateway simulation
 * 1. Creates a Pending transaction
 * 2. Simulates network delay (3.5s)
 * 3. Marks transaction as Completed
 * 4. Returns success to the UI
 */
const simulatePayment = async (req, res) => {
  try {
    const { amount, metadata } = req.body;
    const userId = req.session.user.id;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid payment amount', 400);
    }

    // 1. Create the unique transaction ID
    const transactionId = `TXN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // 2. Persist as Pending
    const transaction = new Transaction({
      transactionId,
      user: userId,
      amount,
      metadata,
      status: 'Pending'
    });
    await transaction.save();

    // 3. Simulate PayChangu Processing Time
    // We use a promise to wrap the timeout
    await new Promise(resolve => setTimeout(resolve, 3500));

    // 4. Update to Completed
    transaction.status = 'Completed';
    await transaction.save();

    return sendSuccess(res, {
      message: 'Payment processed successfully',
      transactionId,
      amount
    });

  } catch (err) {
    console.error('❌ Payment simulation error:', err);
    return sendError(res, 'Payment Gateway Timeout', 504);
  }
};

/**
 * verifyTransaction - Helper used by other controllers to ensure
 * a payment is actually valid before processing business logic.
 */
const verifyTransaction = async (transactionId, userId, amount) => {
  const transaction = await Transaction.findOne({ transactionId, user: userId });
  
  if (!transaction) return false;
  if (transaction.status !== 'Completed') return false;
  
  // Basic amount verification (optional but recommended)
  // if (amount && transaction.amount !== amount) return false;

  return true;
};

module.exports = {
  simulatePayment,
  verifyTransaction
};
