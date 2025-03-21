const tenantService = require('../services/tenant.service');
const applicationService = require('../services/application.service');
const { sendSuccess } = require('../helpers/response.helper');
const { APIError } = require('../middlewares/errorHandler.middleware');
const logger = require('../helpers/logger.helper');
const Admin = require('../models/admin.model');

const registerAdmin = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
  
      // Validation
      if (!name || !email || !password) {
        throw new APIError('All fields are required', 400);
      }
  
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        throw new APIError('Admin already exists with this email', 409);
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newAdmin = new Admin({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      });
  
      await newAdmin.save();
  
      sendSuccess(res, 'Admin registered successfully', {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * Get admin profile
 */
const getProfile = async (req, res, next) => {
  try {
    // Since we already have user data from auth middleware
    const admin = req.user;
    sendSuccess(res, 'Admin profile retrieved successfully', admin);
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    );
    sendSuccess(res, 'Admin profile updated successfully', admin);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tenants
 */
const getAllTenants = async (req, res, next) => {
  try {
    const { status, verified, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (verified) filters.isVerified = verified === 'true';

    const tenants = await tenantService.getAllTenants(filters);
    sendSuccess(res, 'Tenants retrieved successfully', tenants);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific tenant
 */
const getTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.params.id);
    sendSuccess(res, 'Tenant retrieved successfully', tenant);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const applications = await applicationService.getApplications(filters);
    sendSuccess(res, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific application
 */
const getApplication = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    sendSuccess(res, 'Application retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Review application
 */
const reviewApplication = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new APIError('Invalid application status', 400);
    }

    const application = await applicationService.updateApplicationStatus(
      req.params.id,
      status,
      req.user._id,
      notes
    );

    logger.info(`Application ${req.params.id} ${status} by admin ${req.user._id}`);
    sendSuccess(res, 'Application reviewed successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Get application statistics
 */
const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await applicationService.getApplicationStats();
    sendSuccess(res, 'Application statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Search tenants
 */
const searchTenants = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      throw new APIError('Search query is required', 400);
    }

    const results = await tenantService.searchTenants(query);
    sendSuccess(res, 'Search results retrieved successfully', results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllTenants,
  getTenant,
  getAllApplications,
  getApplication,
  reviewApplication,
  getApplicationStats,
  searchTenants,
  registerAdmin 
};
