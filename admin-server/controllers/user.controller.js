// /src/controllers/user.controller.js

const userService = require('../services/user.service');

exports.createAdmin = async (req, res) => {
  try {
    const admin = await userService.createAdmin(req.body, req.user.id);
    return successResponse(res, 'Admin Created', admin);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateAdminStatus = async (req, res) => {
  try {
    const admin = await userService.updateAdminStatus(req.params.id, req.body.status);
    return successResponse(res, 'Admin Status Updated', admin);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    await userService.deleteAdmin(req.params.id);
    return successResponse(res, 'Admin Deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await userService.getAllAdmins();
    return successResponse(res, 'All Admins', admins);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
