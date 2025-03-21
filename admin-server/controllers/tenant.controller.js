const tenantService = require('../services/tenant.service');
const applicationService = require('../services/application.service');
const { sendSuccess } = require('../helpers/response.helper');
const { APIError } = require('../middlewares/errorHandler.middleware');
const logger = require('../helpers/logger.helper');

/**
 * Get tenant profile
 */
const getProfile = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.user._id);
    sendSuccess(res, 'Tenant profile retrieved successfully', tenant);
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedTenant = await tenantService.updateTenantProfile(
      req.user._id,
      req.body
    );
    sendSuccess(res, 'Tenant profile updated successfully', updatedTenant);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant's application status
 */
const getApplicationStatus = async (req, res, next) => {
  try {
    const application = await tenantService.getTenantApplication(req.user._id);
    sendSuccess(res, 'Application status retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit new application
 */
const submitApplication = async (req, res, next) => {
  try {
    const applicationData = {
      tenantId: req.user._id,
      ...req.body
    };

    const application = await applicationService.submitApplication(applicationData);
    logger.info(`New application submitted by tenant: ${req.user._id}`);
    
    sendSuccess(res, 'Application submitted successfully', application, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant's documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.user._id);
    if (!tenant.documents || tenant.documents.length === 0) {
      return sendSuccess(res, 'No documents found', []);
    }
    sendSuccess(res, 'Documents retrieved successfully', tenant.documents);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload document
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new APIError('No files were uploaded', 400);
    }

    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE);

    const file = req.files.document;

    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new APIError('Invalid file type', 400);
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new APIError('File size exceeds limit', 400);
    }

    // Process file upload (implementation depends on your storage solution)
    const documentData = {
      name: file.name,
      type: file.mimetype,
      size: file.size,
      url: 'placeholder_url' // Replace with actual URL after upload
    };

    const tenant = await tenantService.updateTenantProfile(
      req.user._id,
      {
        $push: { documents: documentData }
      }
    );

    logger.info(`Document uploaded by tenant: ${req.user._id}`);
    sendSuccess(res, 'Document uploaded successfully', documentData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getApplicationStatus,
  submitApplication,
  getDocuments,
  uploadDocument
};
