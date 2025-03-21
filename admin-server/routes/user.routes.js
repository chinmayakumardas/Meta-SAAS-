const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Only superAdmin can manage Admins
router.post('/admin', authMiddleware(['super_admin']), validate('createAdmin'), userController.createAdmin);
router.put('/admin/:id/status', authMiddleware(['super_admin']), validate('updateStatus'), userController.updateAdminStatus);
router.delete('/admin/:id', authMiddleware(['super_admin']), userController.deleteAdmin);
router.get('/admin', authMiddleware(['super_admin']), userController.getAllAdmins);

module.exports = router;
