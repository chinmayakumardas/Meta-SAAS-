const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const AuditLog = require('../models/log.model');
const { sendSuccess } = require('../helpers/response.helper');
const { APIError } = require('../middlewares/errorHandler.middleware');
const logger = require('../helpers/logger.helper');

/**
 * Get superadmin profile
 */
const getProfile = async (req, res, next) => {
  try {
    // Since we already have user data from auth middleware
    const superadmin = req.user;
    sendSuccess(res, 'Superadmin profile retrieved successfully', superadmin);
  } catch (error) {
    next(error);
  }
};

/**
 * Update superadmin profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const superadmin = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    );
    sendSuccess(res, 'Superadmin profile updated successfully', superadmin);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admins
 */
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    sendSuccess(res, 'Admins retrieved successfully', admins);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new admin
 */
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      throw new APIError('Admin with this email already exists', 400);
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    logger.info(`New admin created: ${admin._id}`);
    sendSuccess(res, 'Admin created successfully', admin, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific admin
 */
const getAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ 
      _id: req.params.id,
      role: 'admin'
    }).select('-password');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    sendSuccess(res, 'Admin retrieved successfully', admin);
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin
 */
const updateAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, status } = req.body;
    const admin = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'admin' },
      { name, email, phone, status },
      { new: true }
    ).select('-password');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    logger.info(`Admin updated: ${admin._id}`);
    sendSuccess(res, 'Admin updated successfully', admin);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete admin
 */
const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'admin'
    });

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    logger.info(`Admin deleted: ${admin._id}`);
    sendSuccess(res, 'Admin deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all roles
 */
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    sendSuccess(res, 'Roles retrieved successfully', roles);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 */
const createRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new APIError('Role with this name already exists', 400);
    }

    const role = await Role.create({
      name,
      permissions,
      description
    });

    logger.info(`New role created: ${role._id}`);
    sendSuccess(res, 'Role created successfully', role, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific role
 */
const getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new APIError('Role not found', 404);
    }
    sendSuccess(res, 'Role retrieved successfully', role);
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 */
const updateRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions, description },
      { new: true }
    );

    if (!role) {
      throw new APIError('Role not found', 404);
    }

    logger.info(`Role updated: ${role._id}`);
    sendSuccess(res, 'Role updated successfully', role);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      throw new APIError('Role not found', 404);
    }

    logger.info(`Role deleted: ${role._id}`);
    sendSuccess(res, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all permissions
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find();
    sendSuccess(res, 'Permissions retrieved successfully', permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new permission
 */
const createPermission = async (req, res, next) => {
  try {
    const { name, description, resource } = req.body;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      throw new APIError('Permission with this name already exists', 400);
    }

    const permission = await Permission.create({
      name,
      description,
      resource
    });

    logger.info(`New permission created: ${permission._id}`);
    sendSuccess(res, 'Permission created successfully', permission, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific permission
 */
const getPermission = async (req, res, next) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      throw new APIError('Permission not found', 404);
    }
    sendSuccess(res, 'Permission retrieved successfully', permission);
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 */
const updatePermission = async (req, res, next) => {
  try {
    const { name, description, resource } = req.body;
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { name, description, resource },
      { new: true }
    );

    if (!permission) {
      throw new APIError('Permission not found', 404);
    }

    logger.info(`Permission updated: ${permission._id}`);
    sendSuccess(res, 'Permission updated successfully', permission);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 */
const deletePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) {
      throw new APIError('Permission not found', 404);
    }

    logger.info(`Permission deleted: ${permission._id}`);
    sendSuccess(res, 'Permission deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 */
const getSystemStats = async (req, res, next) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      tenants: await User.countDocuments({ role: 'tenant' }),
      admins: await User.countDocuments({ role: 'admin' }),
      applications: await Application.countDocuments(),
      activeUsers: await User.countDocuments({ status: 'active' })
    };

    sendSuccess(res, 'System statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = {
      total: await User.countDocuments(),
      byRole: {
        tenants: await User.countDocuments({ role: 'tenant' }),
        admins: await User.countDocuments({ role: 'admin' }),
        superadmins: await User.countDocuments({ role: 'superadmin' })
      },
      byStatus: {
        active: await User.countDocuments({ status: 'active' }),
        inactive: await User.countDocuments({ status: 'inactive' }),
        suspended: await User.countDocuments({ status: 'suspended' })
      }
    };

    sendSuccess(res, 'User statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get application statistics
 */
const getApplicationStats = async (req, res, next) => {
  try {
    const stats = {
      total: await Application.countDocuments(),
      byStatus: {
        pending: await Application.countDocuments({ status: 'pending' }),
        approved: await Application.countDocuments({ status: 'approved' }),
        rejected: await Application.countDocuments({ status: 'rejected' }),
        review: await Application.countDocuments({ status: 'review' })
      }
    };

    sendSuccess(res, 'Application statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, action, userId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email role');

    const total = await AuditLog.countDocuments(query);

    sendSuccess(res, 'Audit logs retrieved successfully', {
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllAdmins,
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  getAllRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
  getSystemStats,
  getUserStats,
  getApplicationStats,
  getAuditLogs
};
