// const Joi = require('joi');

// exports.createAdmin = Joi.object({
//   email: Joi.string().email().required(),
//   name: Joi.string().min(3).max(50).required(),
// });
const Joi = require('joi');

exports.adminCreateSchema = Joi.object({
    email: Joi.string().email().required(),
});
