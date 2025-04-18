/**
 * Authentication Middleware
 * 
 * Provides middleware functions for route protection and authentication.
 */

/**
 * Ensure a user is authenticated
 * Used to protect routes that require login
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // If not authenticated, set flash message and redirect to login
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/login');
};

/**
 * Ensure a user is an admin
 * For routes that require admin privileges
 */
exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  
  // If not admin, show unauthorized message
  req.flash('error_msg', 'You do not have permission to access this page');
  res.redirect('/');
};

/**
 * Ensure a user is NOT authenticated
 * Used for routes like login/register where authenticated users should be redirected
 */
exports.ensureNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  
  // If authenticated, redirect to dashboard
  res.redirect('/admin/dashboard');
}; 