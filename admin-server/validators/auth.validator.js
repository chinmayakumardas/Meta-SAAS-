// const Joi = require('joi');

// exports.register = Joi.object({
//   email: Joi.string().email().required(),
// });

// exports.login = Joi.object({
//   email: Joi.string().email().required(),
// });

// exports.verifyOtp = Joi.object({
//   email: Joi.string().email().required(),
//   otp: Joi.string().length(6).required(),
// });
const Joi = require('joi');

exports.registerSchema = Joi.object({
    email: Joi.string().email().required(),
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});
