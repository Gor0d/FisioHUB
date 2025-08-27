const helmet = require('helmet');

// Security headers middleware
const securityHeaders = () => {
  return [
    // Basic helmet configuration
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.fisiohub.app"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // X-Frame-Options
      frameguard: { action: 'deny' },
      // X-Content-Type-Options
      noSniff: true,
      // X-XSS-Protection
      xssFilter: true,
      // Referrer Policy
      referrerPolicy: { policy: 'same-origin' },
      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      }
    }),

    // Custom security headers
    (req, res, next) => {
      // Remove sensitive server information
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      
      // Add custom security headers
      res.set({
        'X-API-Version': '1.0.0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });
      
      next();
    }
  ];
};

// CORS configuration with security in mind
const secureCorsList = [
  'https://fisiohub.app',
  'https://www.fisiohub.app',
  'https://fisiohubtech.com.br',
  'https://www.fisiohubtech.com.br'
];

const secureCorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (secureCorsList.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked origin: ${origin}`);
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  optionsSuccessStatus: 200, // IE11 support
  maxAge: 86400 // 24 hours preflight cache
};

module.exports = {
  securityHeaders,
  secureCorsOptions,
  secureCorsList
};