const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { isAuthenticated, hasRole } = require('../middlewares/auth.middleware');

// Get all applications (Admin & SuperAdmin only)
router.get('/', 
  isAuthenticated, 
  hasRole('admin', 'superadmin'), 
  applicationController.getAllApplications
);

// Get application by ID
router.get('/:id',
  isAuthenticated,
  applicationController.getApplication
);

// Submit new application (Tenant only)
router.post('/',
  isAuthenticated,
  hasRole('tenant'),
  applicationController.submitApplication
);

// Update application status (Admin & SuperAdmin only)
router.put('/:id/status',
  isAuthenticated,
  hasRole('admin', 'superadmin'),
  applicationController.updateStatus
);

// Add document to application
router.post('/:id/documents',
  isAuthenticated,
  applicationController.addDocument
);

// Get application statistics (Admin & SuperAdmin only)
router.get('/stats/overview',
  isAuthenticated,
  hasRole('admin', 'superadmin'),
  applicationController.getStats
);

module.exports = router;
