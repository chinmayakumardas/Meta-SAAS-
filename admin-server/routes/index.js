const express = require('express');
const router = express.Router();

// Import routes
const adminRoutes = require('./admin.routes');
const superadminRoutes = require('./superadmin.routes');
const tenantRoutes = require('./tenant.routes');
const authRoutes = require('./auth.routes');
const applicationRoutes = require('./application.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/tenant', tenantRoutes);
router.use('/application', applicationRoutes);

module.exports = router;
