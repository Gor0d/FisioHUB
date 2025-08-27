const rateLimit = require('express-rate-limit');

// Store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

// Custom store implementation for rate limiting
class CustomRateLimitStore {
  constructor(windowMs = 15 * 60 * 1000) { // 15 minutes
    this.windowMs = windowMs;
    this.store = rateLimitStore;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  increment(key, callback) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    
    const requests = this.store.get(key);
    
    // Remove expired requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Add current request
    validRequests.push(now);
    this.store.set(key, validRequests);
    
    const totalHits = validRequests.length;
    const timeRemaining = this.windowMs;
    
    callback(null, totalHits, timeRemaining);
  }

  decrement(key) {
    // Not implemented - express-rate-limit doesn't use this
  }

  resetKey(key) {
    this.store.delete(key);
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, requests] of this.store.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, validRequests);
      }
    }
  }
}

// Rate limiters for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new CustomRateLimitStore(windowMs),
    keyGenerator: (req) => {
      // Use IP + User-Agent for more accurate limiting
      return `${req.ip}_${req.get('User-Agent') || 'unknown'}`;
    }
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // Authentication endpoints - stricter limits
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Muitas tentativas de login. Tente novamente em 15 minutos.'
  ),

  // Registration - prevent abuse
  register: createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 registrations per hour
    'Limite de registros excedido. Tente novamente em 1 hora.'
  ),

  // General API - moderate limits
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests
    'Muitas requisições. Tente novamente em alguns minutos.'
  ),

  // Public endpoints - more lenient
  public: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    200, // 200 requests
    'Limite de requisições atingido. Aguarde alguns minutos.'
  )
};

module.exports = rateLimiters;