// // src/controllers/common.controller.js
// const { successResponse } = require('../helpers/response.helper');

// exports.logout = async (req, res) => {
//   req.session.destroy(() => {
//     successResponse(res, 'Logged out successfully');
//   });
// };

// exports.sessionStatus = async (req, res) => {
//   successResponse(res, 'Session active', { user: req.user });
// };
const { sendSuccess } = require('../helpers/response.helper');

exports.sessionStatus = (req, res) => {
  if (req.session.userId) {
    return sendSuccess(res, 'Session active', { userId: req.session.userId, role: req.session.role });
  }
  return sendSuccess(res, 'No active session');
};
