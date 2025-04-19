/**
 * Tech Blog Server Entry Point
 * 
 * Configures and starts the Express application.
 */

// Core dependencies
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

// Configuration modules
const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const configureHandlebars = require('./config/handlebars');

// Route modules
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Configure Passport
configurePassport(passport);

// Configure Handlebars view engine
configureHandlebars(app);

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
  }
}));

// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // For passport specific errors
  
  // Make user object available in all templates (if logged in)
  // The user object is already processed in config/passport.js deserializeUser
  res.locals.user = req.user || null; 
  
  next();
});

// Mount Routes
app.use('/', indexRoutes); 
app.use('/', authRoutes);   // Auth routes do not need a prefix
app.use('/admin', adminRoutes); // Admin routes are prefixed

// 404 page - catch-all for undefined routes
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    description: 'The requested page could not be found'
    // user is available globally via middleware
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).render('error', {
    title: 'Server Error',
    description: 'Something went wrong on our end',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message
    // user is available globally via middleware
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
}); 