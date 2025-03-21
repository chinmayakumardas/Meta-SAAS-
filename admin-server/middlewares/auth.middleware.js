const jwt = require('jsonwebtoken');
const { APIError } = require('./errorHandler.middleware');
const User = require('../models/user.model');
const AuditLog = require('../models/log.model');

/**
 * Middleware to check if user is authenticated
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Check for token in headers or session
    let token = req.headers.authorization?.split(' ')[1];
    
    // If no token in headers, check session
    if (!token && req.session.user) {
      token = req.session.user.token;
    }

    if (!token) {
      throw new APIError('Authentication required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new APIError('User not found', 401);
    }

    if (user.status !== 'active') {
      throw new APIError('Account is not active', 403);
    }

    // Add user to request
    req.user = user;

    // Log access (optional, comment out if too verbose)
    await AuditLog.logSystemEvent({
      action: 'read',
      category: 'auth',
      message: 'User accessed protected route',
      userId: user._id,
      userRole: user.role,
      resourceId: user._id,
      resourceModel: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        path: req.path,
        method: req.method
      }
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new APIError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new APIError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check user role
 */
const hasRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      await AuditLog.logSystemEvent({
        action: 'other',
        category: 'auth',
        level: 'warning',
        message: 'Unauthorized role access attempt',
        userId: req.user._id,
        userRole: req.user.role,
        resourceId: req.user._id,
        resourceModel: 'User',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          path: req.path,
          method: req.method,
          requiredRoles: roles
        }
      });

      return next(new APIError('Unauthorized access', 403));
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Authentication required', 401));
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    // Log unauthorized admin access attempt
    await AuditLog.logSystemEvent({
      action: 'other',
      category: 'auth',
      level: 'warning',
      message: 'Unauthorized admin access attempt',
      userId: req.user._id,
      userRole: req.user.role,
      resourceId: req.user._id,
      resourceModel: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        path: req.path,
        method: req.method
      }
    });

    return next(new APIError('Admin access required', 403));
  }

  next();
};

/**
 * Middleware to check if user is superadmin
 */
const isSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Authentication required', 401));
  }

  if (req.user.role !== 'superadmin') {
    // Log unauthorized superadmin access attempt
    await AuditLog.logSystemEvent({
      action: 'other',
      category: 'auth',
      level: 'warning',
      message: 'Unauthorized superadmin access attempt',
      userId: req.user._id,
      userRole: req.user.role,
      resourceId: req.user._id,
      resourceModel: 'User',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        path: req.path,
        method: req.method
      }
    });

    return next(new APIError('Superadmin access required', 403));
  }

  next();
};

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin,
  isSuperAdmin
};
