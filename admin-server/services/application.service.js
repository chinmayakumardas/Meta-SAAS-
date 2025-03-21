const Application = require('../models/application.model');
const Tenant = require('../models/tenant.model');
const { APIError } = require('../middlewares/errorHandler.middleware');
const { APPLICATION_STATUS } = require('../config/appConfig');
const { sendApplicationStatusEmail } = require('../helpers/email.helper');
const logger = require('../helpers/logger.helper');

/**
 * Submit a new application
 */
const submitApplication = async (applicationData) => {
  try {
    // Check for existing application
    const existing = await Application.findOne({
      tenantId: applicationData.tenantId,
      status: { $ne: 'rejected' }
    });

    if (existing) {
      throw new APIError('An active application already exists', 400);
    }

    const application = await Application.create(applicationData);
    logger.info(`New application submitted for tenant: ${applicationData.tenantId}`);
    return application;
  } catch (error) {
    logger.error('Error submitting application:', error);
    throw error;
  }
};

/**
 * Get application by ID
 */
const getApplicationById = async (applicationId) => {
  const application = await Application.findById(applicationId)
    .populate('reviewedBy', 'name email')
    .populate('tenantId', 'businessName email');

  if (!application) {
    throw new APIError('Application not found', 404);
  }
  return application;
};

/**
 * Get applications with filters
 */
const getApplications = async (filters = {}) => {
  return await Application.find(filters)
    .populate('reviewedBy', 'name email')
    .populate('tenantId', 'businessName email')
    .sort({ createdAt: -1 });
};

/**
 * Update application status
 */
const updateApplicationStatus = async (applicationId, status, reviewerId, notes = '') => {
  const application = await Application.findById(applicationId)
    .populate('tenantId', 'email businessName');

  if (!application) {
    throw new APIError('Application not found', 404);
  }

  // Update application
  application.status = status;
  application.reviewedBy = reviewerId;
  application.reviewedAt = new Date();
  application.notes = notes;
  
  if (status === APPLICATION_STATUS.APPROVED) {
    application.approvedAt = new Date();
  }

  await application.save();

  // Send email notification
  if (application.tenantId) {
    await sendApplicationStatusEmail(
      application.tenantId.email,
      status,
      application.tenantId.businessName
    );
  }

  return application;
};

/**
 * Get pending applications count
 */
const getPendingApplicationsCount = async () => {
  return await Application.countDocuments({ status: APPLICATION_STATUS.PENDING });
};

/**
 * Get application statistics
 */
const getApplicationStats = async () => {
  const stats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const formattedStats = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return {
    pending: formattedStats[APPLICATION_STATUS.PENDING] || 0,
    approved: formattedStats[APPLICATION_STATUS.APPROVED] || 0,
    rejected: formattedStats[APPLICATION_STATUS.REJECTED] || 0,
    total: Object.values(formattedStats).reduce((a, b) => a + b, 0)
  };
};

/**
 * Add document to application
 */
const addApplicationDocument = async (applicationId, document) => {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new APIError('Application not found', 404);
  }

  application.documents.push(document);
  await application.save();
  return application;
};

module.exports = {
  submitApplication,
  getApplicationById,
  getApplications,
  updateApplicationStatus,
  getPendingApplicationsCount,
  getApplicationStats,
  addApplicationDocument
};
