/**
 * responseHelper.js
 * 
 * Standardizes all API responses to ensure the frontend always knows 
 * where to find data or error messages.
 */

/**
 * sendSuccess - Standard success response
 * @param {Response} res - Express response object
 * @param {Object} data - The payload to send
 * @param {Number} status - HTTP status code (default 200)
 */
const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

/**
 * sendError - Standard error response
 * @param {Response} res - Express response object
 * @param {String} message - Human-readable error message
 * @param {Number} status - HTTP status code (default 400)
 */
const sendError = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
