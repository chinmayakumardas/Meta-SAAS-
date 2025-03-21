/**
 * Standard response format for successful API calls
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

/**
 * Standard response format for failed API calls
 * @param {Object} res - Express response object
 * @param {Error} error - Error object or message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, error, statusCode = 500) => {
  const response = {
    success: false,
    message: error.message || error,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
  return res.status(statusCode).json(response);
};

/**
 * Standard response format for validation errors
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation Error',
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Standard response format for unauthorized access
 * @param {Object} res - Express response object
 * @param {string} message - Custom unauthorized message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Standard response format for forbidden access
 * @param {Object} res - Express response object
 * @param {string} message - Custom forbidden message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden
};
