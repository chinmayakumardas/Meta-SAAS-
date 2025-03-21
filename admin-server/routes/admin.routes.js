const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// Protect all admin routes
router.use(isAuthenticated);
router.use(isAdmin);
router.post('/registerAdmin', adminController.registerAdmin);
// Get admin profile
router.get('/profile', adminController.getProfile);

// Update admin profile
router.put('/profile', adminController.updateProfile);

// Get all tenants
router.get('/tenants', adminController.getAllTenants);

// Get specific tenant
router.get('/tenants/:id', adminController.getTenant);

// Get all applications
router.get('/applications', adminController.getAllApplications);

// Get specific application
router.get('/applications/:id', adminController.getApplication);

// Review application
router.put('/applications/:id/review', adminController.reviewApplication);

// Get application statistics
router.get('/stats/applications', adminController.getApplicationStats);

// Search tenants
router.get('/search/tenants', adminController.searchTenants);

module.exports = router;
