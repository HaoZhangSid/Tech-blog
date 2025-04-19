// Database Configuration
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting application due to database connection failure.');
      process.exit(1);
    }
  }
};

module.exports = connectDB; 