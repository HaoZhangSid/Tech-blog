/**
 * Handlebars Helper Functions
 */

// Format date helper
exports.formatDate = function(date, format) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Time ago helper
exports.timeAgo = function(date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);
  
  // Time constants
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (seconds < minute) {
    return seconds === 1 ? '1 second ago' : seconds + ' seconds ago';
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return minutes === 1 ? '1 minute ago' : minutes + ' minutes ago';
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return hours === 1 ? '1 hour ago' : hours + ' hours ago';
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return days === 1 ? '1 day ago' : days + ' days ago';
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return weeks === 1 ? '1 week ago' : weeks + ' weeks ago';
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return months === 1 ? '1 month ago' : months + ' months ago';
  } else {
    const years = Math.floor(seconds / year);
    return years === 1 ? '1 year ago' : years + ' years ago';
  }
};

// Truncate text helper
exports.truncate = function(str, len) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
};

// Math operations
exports.math = {
  add: function(a, b) {
    return a + b;
  },
  subtract: function(a, b) {
    return a - b;
  },
  multiply: function(a, b) {
    return a * b;
  },
  divide: function(a, b) {
    return a / b;
  }
}; 