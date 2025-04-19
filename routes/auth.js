// Auth Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check } = require('express-validator');

// Import controller
const authController = require('../controllers/authController');

// Login Page
router.get('/login', authController.getLoginPage);

// Login Handle
router.post('/login', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').notEmpty()
], authController.postLogin);

// Logout Handle
router.post('/logout', authController.postLogout);

// Forgot Password Page
router.get('/forgot-password', authController.getForgotPasswordPage);

// Forgot Password Handle
router.post('/forgot-password', [
    check('email', 'Please enter a valid email').isEmail()
], authController.postForgotPassword);

// Reset Password Page
router.get('/reset-password/:token', authController.getResetPasswordPage);

// Reset Password Handle
router.post('/reset-password/:token', [
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], authController.postResetPassword);

module.exports = router; 