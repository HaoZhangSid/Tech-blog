// Auth Controller
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateResetToken, hashToken } = require('../utils/tokenGenerator');
const emailSender = require('../utils/emailSender');

// Display login page
exports.getLoginPage = (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User already authenticated, redirecting to dashboard.');
    return res.redirect('/admin/dashboard');
  }
  res.render('login', {
    title: 'Login',
    description: 'Login to access the admin dashboard'
  });
};

// Handle login POST request
exports.postLogin = (req, res, next) => {
  console.log(`Login attempt received for email: ${req.body.email}`); // Log attempt

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg;
    console.warn(`Login validation failed for ${req.body.email}: ${errorMsg}`); // Log validation error
    req.flash('error', errorMsg);
    return res.redirect('/login');
  }

  console.log(`Passing login request for ${req.body.email} to Passport authenticate`);
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
};

// Handle logout POST request
exports.postLogout = (req, res, next) => {
  const userEmail = req.user ? req.user.email : 'unknown user'; // Get email before logout
  console.log(`Logout request received for user: ${userEmail}`);
  req.logout(function(err) {
    if (err) {
      console.error(`Logout error for user ${userEmail}:`, err);
      return next(err);
    }
    console.log(`User ${userEmail} logged out successfully.`);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
};

// Display forgot password page
exports.getForgotPasswordPage = (req, res) => {
  res.render('forgot-password', {
    title: 'Forgot Password',
    description: 'Reset your password'
  });
};

// Handle forgot password POST request
exports.postForgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/forgot-password');
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always show success message for security
    req.flash('success_msg', 'If your email is registered, you will receive password reset instructions');

    if (user) {
      const resetToken = generateResetToken();
      user.resetPasswordToken = hashToken(resetToken);
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      try {
        await emailSender.sendPasswordResetEmail(user.email, resetToken, user.name);
        console.log(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Do not expose email sending errors to the user
      }
    }
    res.redirect('/login');
  } catch (err) {
    console.error('Forgot password error:', err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/forgot-password');
  }
};

// Display reset password page
exports.getResetPasswordPage = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }

    res.render('reset-password', {
      title: 'Reset Password',
      description: 'Set a new password for your account',
      token: req.params.token
    });
  } catch (err) {
    console.error('Error checking reset token:', err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/forgot-password');
  }
};

// Handle reset password POST request
exports.postResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect(`/reset-password/${req.params.token}`);
  }

  try {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }

    user.password = req.body.password; // Pre-save hook in User model will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in after password reset:', err);
        req.flash('success_msg', 'Your password has been updated. Please log in with your new password.');
        return res.redirect('/login');
      }
      req.flash('success_msg', 'Your password has been updated and you are now logged in');
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('Reset password error:', err);
    req.flash('error', 'An error occurred while resetting your password');
    res.redirect('/forgot-password');
  }
}; 