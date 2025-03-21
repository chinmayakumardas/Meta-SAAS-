const Admin = require('../models/admin.model');
const customError = require('../utils/customError');

exports.createAdmin = async (adminData) => {
    const admin = new Admin(adminData);
    await admin.save();
    return admin;
};

exports.getAllAdmins = async () => {
    return Admin.find({});
};

exports.updateAdmin = async (adminId, updateData) => {
    const admin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true });
    if (!admin) throw new customError('Admin not found', 404);
    return admin;
};

exports.deleteAdmin = async (adminId) => {
    return Admin.findByIdAndDelete(adminId);
};

exports.activateAdmin = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new customError('Admin not found', 404);
    admin.active = true;
    await admin.save();
    return admin;
};

exports.deactivateAdmin = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new customError('Admin not found', 404);
    admin.active = false;
    await admin.save();
    return admin;
};
