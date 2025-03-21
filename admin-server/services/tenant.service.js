const Tenant = require('../models/tenant.model');
const Application = require('../models/application.model');
const { APIError } = require('../middlewares/errorHandler.middleware');
const { sendWelcomeEmail } = require('../helpers/email.helper');
const logger = require('../helpers/logger.helper');

/**
 * Create a new tenant
 */
const createTenant = async (tenantData) => {
  try {
    const tenant = await Tenant.create(tenantData);
    await sendWelcomeEmail(tenant.email, tenant.businessName);
    return tenant;
  } catch (error) {
    logger.error('Error creating tenant:', error);
    throw new APIError('Failed to create tenant', 500);
  }
};

/**
 * Get tenant by ID
 */
const getTenantById = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new APIError('Tenant not found', 404);
  }
  return tenant;
};

/**
 * Get tenant by email
 */
const getTenantByEmail = async (email) => {
  const tenant = await Tenant.findOne({ email });
  if (!tenant) {
    throw new APIError('Tenant not found', 404);
  }
  return tenant;
};

/**
 * Update tenant profile
 */
const updateTenantProfile = async (tenantId, updateData) => {
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    updateData,
    { new: true, runValidators: true }
  );
  if (!tenant) {
    throw new APIError('Tenant not found', 404);
  }
  return tenant;
};

/**
 * Get all tenants with optional filters
 */
const getAllTenants = async (filters = {}) => {
  const query = { ...filters };
  return await Tenant.find(query).sort({ createdAt: -1 });
};

/**
 * Verify tenant's business
 */
const verifyTenant = async (tenantId) => {
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { isVerified: true },
    { new: true }
  );
  if (!tenant) {
    throw new APIError('Tenant not found', 404);
  }
  return tenant;
};

/**
 * Deactivate tenant
 */
const deactivateTenant = async (tenantId) => {
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { isActive: false },
    { new: true }
  );
  if (!tenant) {
    throw new APIError('Tenant not found', 404);
  }
  return tenant;
};

/**
 * Get tenant's application status
 */
const getTenantApplication = async (tenantId) => {
  const application = await Application.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .populate('reviewedBy', 'name email');
  
  if (!application) {
    throw new APIError('No application found for this tenant', 404);
  }
  return application;
};

/**
 * Search tenants
 */
const searchTenants = async (searchQuery) => {
  const query = {
    $or: [
      { businessName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ]
  };
  return await Tenant.find(query).sort({ createdAt: -1 });
};

module.exports = {
  createTenant,
  getTenantById,
  getTenantByEmail,
  updateTenantProfile,
  getAllTenants,
  verifyTenant,
  deactivateTenant,
  getTenantApplication,
  searchTenants
};
