/**
 * Token Generator Utility
 * 
 * Generates secure tokens for password reset functionality
 */

const crypto = require('crypto');

/**
 * Generate a random token for password reset
 * @returns {string} Random token
 */
exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a hash of the token for secure storage
 * @param {string} token - The plain token
 * @returns {string} Hashed token
 */
exports.hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Verify that a token matches its hash
 * @param {string} token - The plain token
 * @param {string} hashedToken - The stored hashed token
 * @returns {boolean} Whether the token matches
 */
exports.verifyToken = (token, hashedToken) => {
  const hash = this.hashToken(token);
  return hash === hashedToken;
};

/**
 * Get token expiration date (1 hour from now)
 * @returns {Date} Token expiration date
 */
exports.getTokenExpiration = () => {
  return new Date(Date.now() + 3600000); // 1 hour in milliseconds
}; 