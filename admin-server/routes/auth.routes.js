const express = require('express');
const router = express.Router();

// Import controllers (we'll create these next)
const authController = require('../controllers/auth.controller');

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
