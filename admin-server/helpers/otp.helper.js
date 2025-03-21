// const crypto = require('crypto');
// const appConfig = require('../config/appConfig');

// exports.generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// exports.isOTPExpired = (otpGeneratedAt) => {
//   const expiryTime = otpGeneratedAt.getTime() + appConfig.OTP_EXPIRY_MINUTES * 60 * 1000;
//   return Date.now() > expiryTime;
// };
const crypto = require('crypto');
const appConfig = require('../config/appConfig');

exports.generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

exports.isOTPExpired = (otpCreatedAt) => {
    const expiryTime = appConfig.OTP_EXPIRY_MINUTES * 60 * 1000;
    return (Date.now() - otpCreatedAt) > expiryTime;
};
