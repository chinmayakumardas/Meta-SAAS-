const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { APIError } = require('../middlewares/errorHandler.middleware');
const { sendSuccess } = require('../helpers/response.helper');
const logger = require('../helpers/logger.helper');
const User = require('../models/user.model');
const ActionLog = require('../models/log.model');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'tenant' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new APIError('Name, email and password are required', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError('Email already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = user.generateAuthToken();

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Log the registration
    await ActionLog.logAction({
      userId: user._id,
      action: 'REGISTER',
      category: 'auth',
      description: 'New user registration',
      targetResource: 'user',
      targetId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      },
      status: 'success'
    });

    sendSuccess(res, 'Registration successful', { token }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new APIError('Email and password are required', 400);
    }

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new APIError('Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new APIError('Account is not active', 403);
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new APIError('Account is locked due to too many failed attempts', 403);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      throw new APIError('Invalid credentials', 401);
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Log the login
    await ActionLog.logAction({
      userId: user._id,
      action: 'LOGIN',
      category: 'auth',
      description: 'User logged in',
      targetResource: 'user',
      targetId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      },
      status: 'success'
    });

    sendSuccess(res, 'Login successful', { token });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    if (req.session.user) {
      // Log the logout
      await ActionLog.logAction({
        userId: req.session.user.id,
        action: 'LOGOUT',
        category: 'auth',
        description: 'User logged out',
        targetResource: 'user',
        targetId: req.session.user.id,
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent')
        },
        status: 'success'
      });
    }

    req.session.destroy();
    res.clearCookie('connect.sid');
    sendSuccess(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.session.user) {
      throw new APIError('Not authenticated', 401);
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      throw new APIError('User not found', 404);
    }

    sendSuccess(res, 'User details retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new APIError('Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found for security
      return sendSuccess(res, 'If your email is registered, you will receive password reset instructions');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send password reset email
    // For now, just return the token in response
    sendSuccess(res, 'Password reset instructions sent', { resetToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new APIError('Token and new password are required', 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new APIError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log the password reset
    await ActionLog.logAction({
      userId: user._id,
      action: 'RESET_PASSWORD',
      category: 'auth',
      description: 'User reset password',
      targetResource: 'user',
      targetId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      },
      status: 'success'
    });

    sendSuccess(res, 'Password has been reset successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
