const ActionLog = require('../models/log.model');
const { LOG_CATEGORIES } = require('../config/appConfig');

const logUserAction = async (req, res, next) => {
  // Store the original end function
  const originalEnd = res.end;
  const originalJson = res.json;

  // Get request metadata
  const userAgent = req.get('user-agent');
  const ip = req.ip || req.connection.remoteAddress;

  // Parse user agent for additional metadata
  const metadata = {
    ip,
    userAgent,
    browser: getBrowser(userAgent),
    platform: getPlatform(userAgent),
    deviceType: getDeviceType(userAgent)
  };

  // Override res.json to capture response data
  res.json = function(data) {
    res.locals.responseData = data;
    return originalJson.apply(res, arguments);
  };

  // Override res.end to log after response is sent
  res.end = async function(...args) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return originalEnd.apply(res, args);
      }

      // Determine action category based on route
      const path = req.path.toLowerCase();
      let category = LOG_CATEGORIES.SYSTEM;
      
      if (path.includes('auth')) category = LOG_CATEGORIES.AUTH;
      else if (path.includes('user')) category = LOG_CATEGORIES.USER;
      else if (path.includes('role')) category = LOG_CATEGORIES.ROLE;
      else if (path.includes('permission')) category = LOG_CATEGORIES.PERMISSION;
      else if (path.includes('application')) category = LOG_CATEGORIES.APPLICATION;
      else if (path.includes('tenant')) category = LOG_CATEGORIES.TENANT;
      else if (path.includes('document')) category = LOG_CATEGORIES.DOCUMENT;
      else if (path.includes('billing')) category = LOG_CATEGORIES.BILLING;

      // Get target resource and ID from request
      const targetResource = path.split('/')[1];
      const targetId = req.params.id || null;

      // Create log entry
      await ActionLog.logAction({
        userId,
        action: `${req.method} ${req.path}`,
        category,
        description: `User performed ${req.method} operation on ${targetResource}`,
        targetResource,
        targetId,
        changes: {
          before: req.body,
          after: res.locals.responseData
        },
        metadata,
        status: res.statusCode >= 400 ? 'failed' : 'success',
        errorDetails: res.locals.error ? {
          code: res.statusCode,
          message: res.locals.error.message,
          stack: process.env.NODE_ENV === 'development' ? res.locals.error.stack : undefined
        } : undefined
      });
    } catch (error) {
      console.error('Error logging user action:', error);
    }

    return originalEnd.apply(res, args);
  };

  next();
};

// Helper functions to parse user agent
function getBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  
  return 'Other';
}

function getPlatform(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  
  return 'Other';
}

function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  
  return 'Desktop';
}

module.exports = logUserAction;
