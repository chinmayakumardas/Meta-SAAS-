const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin.controller');
const { isAuthenticated, isSuperAdmin } = require('../middlewares/auth.middleware');

// Protect all superadmin routes
router.use(isAuthenticated);
router.use(isSuperAdmin);

// Get superadmin profile
router.get('/profile', superadminController.getProfile);

// Update superadmin profile
router.put('/profile', superadminController.updateProfile);

// Admin management
router.get('/admins', superadminController.getAllAdmins);
router.post('/admins', superadminController.createAdmin);
router.get('/admins/:id', superadminController.getAdmin);
router.put('/admins/:id', superadminController.updateAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);

// Role management
router.get('/roles', superadminController.getAllRoles);
router.post('/roles', superadminController.createRole);
router.get('/roles/:id', superadminController.getRole);
router.put('/roles/:id', superadminController.updateRole);
router.delete('/roles/:id', superadminController.deleteRole);

// Permission management
router.get('/permissions', superadminController.getAllPermissions);
router.post('/permissions', superadminController.createPermission);
router.get('/permissions/:id', superadminController.getPermission);
router.put('/permissions/:id', superadminController.updatePermission);
router.delete('/permissions/:id', superadminController.deletePermission);

// System statistics
router.get('/stats/system', superadminController.getSystemStats);
router.get('/stats/users', superadminController.getUserStats);
router.get('/stats/applications', superadminController.getApplicationStats);

// Audit logs
router.get('/audit-logs', superadminController.getAuditLogs);

module.exports = router;
