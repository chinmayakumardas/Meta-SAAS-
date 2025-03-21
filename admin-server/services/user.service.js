// // /src/services/user.service.js

// const UserModel = require('../models/User.model');
// const { sendEmail } = require('../helpers/emailHelper');
// const { logInfo } = require('../helpers/logHelper');

// exports.createAdmin = async (data, createdBy) => {
//   const { email, name } = data;
//   const existing = await UserModel.findOne({ email });
//   if (existing) throw new Error('Admin already exists');

//   const admin = await UserModel.create({
//     email,
//     name,
//     role: 'admin',
//     createdBy,
//   });
//   await sendEmail(email, 'Admin Account Created', 'Your admin account has been created successfully.');
//   await logInfo('Admin Created', { adminId: admin._id, createdBy });
//   return admin;
// };

// exports.updateAdminStatus = async (adminId, status) => {
//   const admin = await UserModel.findById(adminId);
//   if (!admin || admin.role !== 'admin') throw new Error('Admin not found');
//   admin.status = status;
//   await admin.save();
//   await logInfo('Admin Status Updated', { adminId, status });
//   return admin;
// };

// exports.deleteAdmin = async (adminId) => {
//   const admin = await UserModel.findById(adminId);
//   if (!admin || admin.role !== 'admin') throw new Error('Admin not found');
//   await admin.remove();
//   await logInfo('Admin Deleted', { adminId });
//   return true;
// };

// exports.getAllAdmins = async () => {
//   const admins = await UserModel.find({ role: 'admin' });
//   return admins;
// };
const { User } = require('../models/user.model');
const { sendEmail } = require('../utils/emailSender');

exports.createAdmin = async (email) => {
  const admin = new User({
    email,
    role: 'admin',
    status: 'active',
  });
  await admin.save();
  await sendEmail(email, 'Admin Created', '<h1>You have been added as an Admin</h1>');
  return admin;
};

exports.getAllAdmins = () => User.find({ role: 'admin' });

exports.updateAdminStatus = (id, status) => 
  User.findByIdAndUpdate(id, { status }, { new: true });

exports.deleteAdmin = (id) => User.findByIdAndDelete(id);
