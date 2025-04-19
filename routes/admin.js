// Admin Routes
const express = require('express');
const router = express.Router();

// Import middleware
const { ensureAuthenticated } = require('../middleware/auth');

// Import controller
const adminController = require('../controllers/adminController');

// Admin Dashboard
router.get('/dashboard', ensureAuthenticated, adminController.getDashboard);

// Posts Management
router.get('/posts', ensureAuthenticated, adminController.getPostsList);
router.get('/posts/new', ensureAuthenticated, adminController.getNewPostForm);
router.post('/posts/new', ensureAuthenticated, adminController.postNewPost);
router.get('/posts/edit/:id', ensureAuthenticated, adminController.getEditPostForm);
router.post('/posts/edit/:id', ensureAuthenticated, adminController.postUpdatePost);
router.delete('/posts/:id', ensureAuthenticated, adminController.deletePost);

// Remove placeholder route
// router.get('/dashboard', ensureAuthenticated, (req, res) => res.send('Admin Dashboard Placeholder'));

module.exports = router; 