// Index Controller
const { samplePosts, sampleComments } = require('../data/sampleData');

// Display home page with published posts
exports.getHomePage = (req, res) => {
  const publishedPosts = samplePosts.filter(post => post.published);
  res.render('home', {
    title: 'Home',
    description: 'A blog about web development and technology',
    posts: publishedPosts,
    isHomePage: true // Indicate this is the home page for layout
  });
};

// Display post detail page
exports.getPostBySlug = (req, res) => {
  const { slug } = req.params;
  const post = samplePosts.find(post => post.slug === slug);

  if (!post) {
    return res.status(404).render('404', {
      title: 'Post Not Found',
      description: 'The requested post could not be found'
    });
  }

  const comments = sampleComments.filter(comment => comment.postId === post._id);

  res.render('post-detail', {
    title: post.title,
    description: post.summary,
    post,
    comments
  });
};

// Handle comment submission
exports.postComment = (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;
  const post = samplePosts.find(post => post._id === id);

  if (!post) {
    req.flash('error_msg', 'Post not found');
    return res.redirect('/');
  }

  // In a real app, save the comment to the database.
  // For demo purposes, we add it to the sample data (won't persist restarts)
  const newComment = {
    _id: `comment-${Date.now()}`,
    postId: id,
    authorName: authorName,
    content: content,
    createdAt: new Date()
  };
  sampleComments.push(newComment);

  req.flash('success_msg', 'Comment added successfully');
  res.redirect(`/post/${post.slug}`);
};

// Display about page
exports.getAboutPage = (req, res) => {
  res.render('about', {
    title: 'About',
    description: 'Learn more about the Tech Blog platform',
    isAboutPage: true // Indicate this is the about page for layout
  });
}; 