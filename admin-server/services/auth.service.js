const Auth = require('../models/auth.model');
const { generateOTP } = require('../helpers/otp.helper');
const customError = require('../utils/customError');
const emailHelper = require('../helpers/email.helper');

exports.register = async (email) => {
    const existing = await Auth.findOne({ email });
    if (existing) throw new customError('Email already registered', 400);
    const otp = generateOTP();
    const newUser = new Auth({ email, otp });
    await newUser.save();
    await emailHelper.sendOtp(email, otp);
    return { email, otp };
};

exports.login = async (email) => {
    const otp = generateOTP();
    let user = await Auth.findOne({ email });
    if (!user) {
        user = new Auth({ email, otp });
    } else {
        user.otp = otp;
    }
    await user.save();
    await emailHelper.sendOtp(email, otp);
    return { email, otp };
};

exports.verifyOtp = async (email, otp) => {
    const user = await Auth.findOne({ email });
    if (!user || user.otp !== otp) throw new customError('Invalid OTP', 400);
    return user;
};
