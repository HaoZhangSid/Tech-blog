// Passport Configuration
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
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

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      // Convert to plain JavaScript object and ensure all necessary properties exist
      if (user) {
        const plainUser = {
          id: user.id,
          name: user.name || 'Admin',
          email: user.email,
          initials: user.initials || (user.name ? user.name.charAt(0).toUpperCase() : 'A')
        };
        done(null, plainUser);
      } else {
        done(null, null);
      }
    } catch (err) {
      done(err);
    }
  });
}; 