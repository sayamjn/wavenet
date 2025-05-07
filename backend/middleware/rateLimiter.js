const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware to protect against brute force attacks
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,  // Time window
    max: max,            // Max number of requests per windowMs
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,   // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false,    // Disable the X-RateLimit-* headers
  });
};

// Rate limiter for authentication routes (15 minutes, 10 requests)
exports.authLimiter = createRateLimiter(
  15 * 60 * 1000, 
  10, 
  'Too many login attempts from this IP, please try again after 15 minutes'
);

// Rate limiter for notes API (1 minute, 60 requests)
exports.apiLimiter = createRateLimiter(
  60 * 1000, 
  60, 
  'Too many requests from this IP, please try again after a minute'
);

// Rate limiter for note sharing (1 hour, 30 shares)
exports.shareLimiter = createRateLimiter(
  60 * 60 * 1000, 
  30, 
  'You have reached the share limit for this hour, please try again later'
);