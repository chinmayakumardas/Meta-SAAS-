const applicationService = require('../services/application.service');
const { sendSuccess } = require('../helpers/response.helper');
const { APIError } = require('../middlewares/errorHandler.middleware');
const logger = require('../helpers/logger.helper');

/**
 * Get all applications
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const applications = await applicationService.getApplications({
      filters,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order
    });

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
    
    // Check if user has permission to view this application
    if (!application) {
      throw new APIError('Application not found', 404);
    }

    // Only allow tenant to view their own application or admin/superadmin to view any
    if (req.user.role === 'tenant' && application.tenantId.toString() !== req.user._id.toString()) {
      throw new APIError('Not authorized to view this application', 403);
    }

    sendSuccess(res, 'Application retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit new application
 */
const submitApplication = async (req, res, next) => {
  try {
    // Check if tenant already has a pending or approved application
    const existingApplication = await applicationService.getTenantActiveApplication(req.user._id);
    if (existingApplication) {
      throw new APIError('You already have an active application', 400);
    }

    const applicationData = {
      tenantId: req.user._id,
      businessDetails: req.body.businessDetails,
      documents: req.body.documents,
      plan: req.body.plan,
      status: 'pending',
      submittedBy: req.user._id
    };

    const application = await applicationService.createApplication(applicationData);
    logger.info(`New application submitted by tenant: ${req.user._id}`);
    
    sendSuccess(res, 'Application submitted successfully', application, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected', 'pending', 'review'].includes(status)) {
      throw new APIError('Invalid application status', 400);
    }

    const application = await applicationService.updateApplicationStatus(
      id,
      status,
      req.user._id,
      notes
    );

    // Log the status change
    logger.info(`Application ${id} status updated to ${status} by ${req.user._id}`);

    sendSuccess(res, 'Application status updated successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Add document to application
 */
const addDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await applicationService.getApplicationById(id);

    // Verify application exists and user has permission
    if (!application) {
      throw new APIError('Application not found', 404);
    }

    if (req.user.role === 'tenant' && application.tenantId.toString() !== req.user._id.toString()) {
      throw new APIError('Not authorized to modify this application', 403);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      throw new APIError('No files were uploaded', 400);
    }

    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE);

    const file = req.files.document;

    // Validate file
    if (!allowedTypes.includes(file.mimetype)) {
      throw new APIError('Invalid file type', 400);
    }

    if (file.size > maxSize) {
      throw new APIError('File size exceeds limit', 400);
    }

    // Process file upload
    const documentData = {
      name: file.name,
      type: file.mimetype,
      size: file.size,
      url: 'placeholder_url', // Replace with actual URL after upload
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    const updatedApplication = await applicationService.addDocument(id, documentData);
    logger.info(`Document added to application ${id} by ${req.user._id}`);

    sendSuccess(res, 'Document added successfully', documentData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get application statistics
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await applicationService.getApplicationStats();
    sendSuccess(res, 'Application statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  getApplication,
  submitApplication,
  updateStatus,
  addDocument,
  getStats
};
