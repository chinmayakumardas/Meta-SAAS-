const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// Get tenant profile
router.get('/profile', isAuthenticated, tenantController.getProfile);

// Update tenant profile
router.put('/profile', isAuthenticated, tenantController.updateProfile);

// Get tenant's application status
router.get('/application', isAuthenticated, tenantController.getApplicationStatus);

// Submit new application
router.post('/application', isAuthenticated, tenantController.submitApplication);

// Get tenant's documents
router.get('/documents', isAuthenticated, tenantController.getDocuments);

// Upload document
router.post('/documents', isAuthenticated, tenantController.uploadDocument);

module.exports = router;
