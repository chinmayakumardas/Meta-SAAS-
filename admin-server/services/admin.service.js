const Tenant = require('../models/tenant.model');
const Application = require('../models/application.model');
const tenantHelper = require('../helpers/tenant.helper');
const customError = require('../utils/customError');

exports.getAllTenants = async () => {
    return Tenant.find({});
};

exports.activateTenant = async (tenantId) => {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new customError('Tenant not found', 404);
    tenant.active = true;
    await tenant.save();
    return tenant;
};

exports.deactivateTenant = async (tenantId) => {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new customError('Tenant not found', 404);
    tenant.active = false;
    await tenant.save();
    return tenant;
};

exports.deleteTenant = async (tenantId) => {
    return Tenant.findByIdAndDelete(tenantId);
};

exports.approveApplication = async (applicationId) => {
    const application = await Application.findById(applicationId);
    if (!application) throw new customError('Application not found', 404);
    const tenant = await Tenant.findById(application.tenantId);
    if (!tenant) throw new customError('Tenant not found', 404);
    tenant.tenantId = tenantHelper.generatePermanentTenantId();
    tenant.verified = true;
    await tenant.save();
    application.status = 'approved';
    await application.save();
    return { tenant, application };
};

exports.rejectApplication = async (applicationId) => {
    const application = await Application.findById(applicationId);
    if (!application) throw new customError('Application not found', 404);
    application.status = 'rejected';
    await application.save();
    return application;
};
