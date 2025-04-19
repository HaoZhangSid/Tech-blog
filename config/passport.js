// Passport Configuration
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      console.log(`Passport LocalStrategy: Attempting to authenticate user: ${email}`); // Log strategy start
      try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Check if user exists
        if (!user) {
          console.warn(`Passport LocalStrategy: User not found for email: ${email}`); // Log user not found
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Compare passwords
        console.log(`Passport LocalStrategy: Comparing password for user: ${email}`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.warn(`Passport LocalStrategy: Password mismatch for user: ${email}`); // Log password mismatch
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Success
        console.log(`Passport LocalStrategy: Authentication successful for user: ${email}`); // Log success
        return done(null, user); // Return the full Mongoose user object here
      } catch (err) {
        console.error(`Passport LocalStrategy: Error during authentication for ${email}:`, err); // Log error
        return done(err);
      }
    }
  ));

  // Serialize user
  passport.serializeUser((user, done) => {
    console.log(`Passport serializeUser: Serializing user with ID: ${user.id}`);
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    console.log(`Passport deserializeUser: Attempting to deserialize user with ID: ${id}`);
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
        console.log(`Passport deserializeUser: Successfully deserialized user ID: ${id}`);
        done(null, plainUser); // Pass the plain object to req.user
      } else {
        console.warn(`Passport deserializeUser: User not found for ID: ${id}`);
        done(null, null); // Important to call done even if user not found
      }
    } catch (err) {
      console.error(`Passport deserializeUser: Error deserializing user ID ${id}:`, err);
      done(err);
    }
  });
}; 