// Admin Controller
const { samplePosts, sampleComments } = require('../data/sampleData');

// Display admin dashboard
exports.getDashboard = (req, res) => {
  // In a real app, fetch counts from the database
  res.render('admin-dashboard', {
    title: 'Admin Dashboard',
    description: 'Manage your blog',
    layout: 'admin', // Use admin layout
    isAdminPage: true,
    isDashboardPage: true,
    postCount: samplePosts.length,
    commentCount: sampleComments.length
  });
};

// Display list of all posts for admin
exports.getPostsList = (req, res) => {
  // In a real app, fetch posts from the database with pagination
  res.render('admin-posts-list', {
    title: 'Manage Posts',
    description: 'View and manage all blog posts',
    layout: 'admin', // Use admin layout
    isAdminPage: true,
    isPostsPage: true,
    posts: samplePosts // Pass sample data for now
  });
};

// Display form to create a new post
exports.getNewPostForm = (req, res) => {
  res.render('admin-post-form', {
    title: 'New Post',
    description: 'Create a new blog post',
    layout: 'admin', // Use admin layout
    isAdminPage: true,
    isEditing: false,
    post: {} // Empty object for the form
  });
};

// Handle creation of a new post
exports.postNewPost = (req, res) => {
  const { title, slug, summary, content, published } = req.body;
  // Basic validation (in a real app, use express-validator)
  if (!title || !slug || !content) {
      req.flash('error_msg', 'Title, Slug, and Content are required.');
      // Re-render form with entered data (need to pass it back)
      return res.render('admin-post-form', { 
          title: 'New Post', layout: 'admin', isAdminPage: true, isEditing: false, 
          post: { title, slug, summary, content, published: !!published }, 
          error_msg: req.flash('error_msg') 
      });
  }

  // In a real app, save the new post to the database
  const newPost = {
      _id: `post-${Date.now()}`,
      title,
      slug,
      summary,
      content,
      published: !!published, // Convert checkbox value to boolean
      createdAt: new Date(),
      updatedAt: new Date()
  };
  samplePosts.unshift(newPost); // Add to the beginning for demo

  req.flash('success_msg', 'Post created successfully');
  res.redirect('/admin/posts');
};

// Display form to edit an existing post
exports.getEditPostForm = (req, res) => {
  const { id } = req.params;
  const post = samplePosts.find(p => p._id === id);

  if (!post) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/admin/posts');
  }

  res.render('admin-post-form', {
    title: 'Edit Post',
    description: 'Edit an existing blog post',
    layout: 'admin', // Use admin layout
    isAdminPage: true,
    isEditing: true,
    post
  });
};

// Handle update of an existing post
exports.postUpdatePost = (req, res) => {
  const { id } = req.params;
  const { title, slug, summary, content, published } = req.body;
  const postIndex = samplePosts.findIndex(p => p._id === id);

  if (postIndex === -1) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/admin/posts');
  }

  // Basic validation
  if (!title || !slug || !content) {
      req.flash('error_msg', 'Title, Slug, and Content are required.');
      // Re-render form with entered data
      return res.render('admin-post-form', { 
          title: 'Edit Post', layout: 'admin', isAdminPage: true, isEditing: true, 
          post: { ...samplePosts[postIndex], title, slug, summary, content, published: !!published }, // Merge original with new data
          error_msg: req.flash('error_msg') 
      });
  }

  // In a real app, update the post in the database
  samplePosts[postIndex] = {
      ...samplePosts[postIndex],
      title,
      slug,
      summary,
      content,
      published: !!published,
      updatedAt: new Date()
  };

  req.flash('success_msg', 'Post updated successfully');
  res.redirect('/admin/posts');
};

// Handle deletion of a post
exports.deletePost = (req, res) => {
  const { id } = req.params;
  const postIndex = samplePosts.findIndex(p => p._id === id);

  if (postIndex === -1) {
    // In a real app, you might return a 404 error if not found
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  // In a real app, delete the post from the database
  samplePosts.splice(postIndex, 1);

  // Send success response for AJAX request
  // If using form submission, you might flash a message and redirect
  res.status(200).json({ success: true, message: 'Post deleted successfully' });
}; 