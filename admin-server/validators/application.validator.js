// const Joi = require('joi');

// exports.submitApplication = Joi.object({
//   businessId: Joi.string().required(),
//   businessDetails: Joi.string().min(10).required(),
// });
const Joi = require('joi');

exports.applicationCreateSchema = Joi.object({
    tenantId: Joi.string().required(),
    businessDetails: Joi.string().min(10).required(),
});
