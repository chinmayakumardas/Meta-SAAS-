// const Joi = require('joi');

// exports.registerTenant = Joi.object({
//   email: Joi.string().email().required(),
//   businessName: Joi.string().min(3).max(100).required(),
// });
const Joi = require('joi');

exports.tenantRegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    businessName: Joi.string().min(2).max(100).required(),
});

exports.tenantVerificationSchema = Joi.object({
    tenantId: Joi.string().required(),
    applicationId: Joi.string().required(),
});
