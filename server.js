/**
 * Tech Blog Authentication Server
 * 
 * This server implements a secure authentication system for a tech blog,
 * allowing authors to securely log in and access the admin dashboard.
 * 
 * Technologies: Node.js, Express, MongoDB, Passport.js, bcrypt
 */

// Core dependencies
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Load environment variables
require('dotenv').config();

// Import models and middleware
const User = require('./models/User');
const { ensureAuthenticated } = require('./middleware/auth');
const { generateResetToken, hashToken, verifyToken, getTokenExpiration } = require('./utils/tokenGenerator');
const emailSender = require('./utils/emailSender');

// Import sample data for development
const { samplePosts, sampleComments, adminUser } = require('./data/sampleData');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your connection string and credentials');
    // Exit process with failure in production environments
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting application due to database connection failure');
      process.exit(1);
    }
  });

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'temporary-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Set up Handlebars as the template engine
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    // Current year helper
    currentYear: function() {
      return new Date().getFullYear();
    },
    // Format date helper
    formatDate: function(date, format) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    },
    // Range helper (used for pagination)
    range: function(start, end) {
      let result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    // Add helpers for math operations
    add: function(a, b) {
      return a + b;
    },
    multiply: function(a, b) {
      return a * b;
    },
    // Truncate text helper
    truncate: function(str, len) {
      if (!str) return '';
      if (str.length <= len) return str;
      return str.substring(0, len) + '...';
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure Passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      // Check if user exists
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Success
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ----- Routes -----

// Home page - display blog posts
app.get('/', (req, res) => {
  // Filter published posts for public view
  const publishedPosts = samplePosts.filter(post => post.published);
  
  res.render('home', {
    title: 'Home',
    description: 'A blog about web development and technology',
    posts: publishedPosts,
    user: req.user
  });
});

// Post detail page
app.get('/post/:slug', (req, res) => {
  const { slug } = req.params;
  
  // Find post by slug
  const post = samplePosts.find(post => post.slug === slug);
  
  if (!post) {
    return res.status(404).render('404', {
      title: 'Post Not Found',
      description: 'The requested post could not be found',
      user: req.user
    });
  }
  
  // Find comments for this post
  const comments = sampleComments.filter(comment => comment.postId === post._id);
  
  res.render('post-detail', {
    title: post.title,
    description: post.summary,
    post,
    comments,
    user: req.user
  });
});

// Comment submission route
app.post('/post/:id/comment', (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;
  
  // Find post by ID
  const post = samplePosts.find(post => post._id === id);
  
  if (!post) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/');
  }
  
  // In a real app, you would save the comment to the database
  // Here we'll just redirect back to the post detail page
  req.flash('success_msg', 'Comment added successfully');
  res.redirect(`/post/${post.slug}`);
});

// About page
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    description: 'Learn more about the Tech Blog platform',
    user: req.user
  });
});

// Login page
app.get('/login', (req, res) => {
  // If already logged in, redirect to admin dashboard
  if (req.isAuthenticated()) {
    return res.redirect('/admin/dashboard');
  }
  
  res.render('login', {
    title: 'Login',
    description: 'Login to access the admin dashboard'
  });
});

// Login POST handler
app.post('/login', [
  // Validate input
  check('email', 'Please enter a valid email').isEmail(),
  check('password', 'Password is required').notEmpty()
], (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/login');
  }
  
  // Passport authentication
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout route
app.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
});

// Forgot password page
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', {
    title: 'Forgot Password',
    description: 'Reset your password'
  });
});

// Forgot password POST handler
app.post('/forgot-password', [
  check('email', 'Please enter a valid email').isEmail()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/forgot-password');
  }
  
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always show success message, even if user doesn't exist (security best practice)
    req.flash('success_msg', 'If your email is registered, you will receive password reset instructions');
    
    // If user exists, generate reset token and send email
    if (user) {
      // Generate token
      const resetToken = generateResetToken();
      const hashedToken = hashToken(resetToken);
      const tokenExpiration = getTokenExpiration();
      
      // Save token to user document
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = tokenExpiration;
      await user.save();
      
      // Send password reset email
      try {
        await emailSender.sendPasswordResetEmail(user.email, resetToken, user.name);
        console.log(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose this error to the user - they already got the success message
      }
    }
    
    // Redirect after processing
    res.redirect('/login');
  } catch (err) {
    console.error('Forgot password error:', err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/forgot-password');
  }
});

// Reset password page
app.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);
    
    // Find user with this token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    // Token is valid, render reset password form
    res.render('reset-password', {
      title: 'Reset Password',
      description: 'Set a new password for your account',
      token: token
    });
  } catch (err) {
    console.error('Error checking reset token:', err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/forgot-password');
  }
});

// Reset password POST handler
app.post('/reset-password/:token', [
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
  check('password2').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect(`/reset-password/${req.params.token}`);
  }
  
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = hashToken(token);
    
    // Find user with this token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    // Update user's password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Log the user in automatically after password reset
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
});

// Admin dashboard - protected route
app.get('/admin/dashboard', ensureAuthenticated, (req, res) => {
  res.render('admin-dashboard', {
    title: 'Admin Dashboard',
    description: 'Manage your blog',
    user: req.user,
    isAdminPage: true,
    postCount: samplePosts.length,
    commentCount: sampleComments.length
  });
});

// Admin posts list - protected route
app.get('/admin/posts', ensureAuthenticated, (req, res) => {
  res.render('admin-posts-list', {
    title: 'Manage Posts',
    description: 'View and manage all blog posts',
    user: req.user,
    isAdminPage: true,
    posts: samplePosts
  });
});

// New post form - protected route
app.get('/admin/posts/new', ensureAuthenticated, (req, res) => {
  res.render('admin-post-form', {
    title: 'New Post',
    description: 'Create a new blog post',
    user: req.user,
    isAdminPage: true,
    isEditing: false,
    post: {} // Empty post for the form
  });
});

// Create new post - protected route
app.post('/admin/posts/new', ensureAuthenticated, (req, res) => {
  const { title, slug, summary, content, published } = req.body;
  
  // In a real app, you would save the post to the database
  // Here we'll just redirect back to the posts list
  req.flash('success_msg', 'Post created successfully');
  res.redirect('/admin/posts');
});

// Edit post form - protected route
app.get('/admin/posts/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  
  // Find post by ID
  const post = samplePosts.find(post => post._id === id);
  
  if (!post) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/admin/posts');
  }
  
  res.render('admin-post-form', {
    title: 'Edit Post',
    description: 'Edit an existing blog post',
    user: req.user,
    isAdminPage: true,
    isEditing: true,
    post
  });
});

// Update post - protected route
app.post('/admin/posts/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { title, slug, summary, content, published } = req.body;
  
  // Find post by ID
  const post = samplePosts.find(post => post._id === id);
  
  if (!post) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/admin/posts');
  }
  
  // In a real app, you would update the post in the database
  // Here we'll just redirect back to the posts list
  req.flash('success_msg', 'Post updated successfully');
  res.redirect('/admin/posts');
});

// Delete post - protected route
app.delete('/admin/posts/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  
  // In a real app, you would delete the post from the database
  // Here we'll just send a success response
  res.status(200).json({ success: true });
});

// 404 page - catch-all for undefined routes
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    description: 'The requested page could not be found',
    user: req.user
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    description: 'Something went wrong on our end',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    user: req.user
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 