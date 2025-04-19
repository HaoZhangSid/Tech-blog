// Index Routes (Public)
const express = require('express');
const router = express.Router();

// Import controller
const indexController = require('../controllers/indexController');

// Define public routes
router.get('/', indexController.getHomePage);
router.get('/post/:slug', indexController.getPostBySlug);
router.post('/post/:id/comment', indexController.postComment);
router.get('/about', indexController.getAboutPage);

// Remove placeholder route
// router.get('/', (req, res) => res.send('Homepage Placeholder'));

module.exports = router; 