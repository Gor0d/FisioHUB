const validator = require('validator');
const rateLimit = require('./rate-limiting');

// Input sanitization and validation
class InputValidator {
  // Sanitize string inputs
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .substring(0, 255); // Limit length
  }

  // Validate email format
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(email) && email.length <= 254;
  }

  // Validate password strength
  static validatePassword(password) {
    if (!password || typeof password !== 'string') return {
      valid: false,
      message: 'Senha é obrigatória'
    };

    if (password.length < 8) return {
      valid: false,
      message: 'Senha deve ter pelo menos 8 caracteres'
    };

    if (password.length > 128) return {
      valid: false,
      message: 'Senha muito longa (máximo 128 caracteres)'
    };

    // Check for at least one number and one letter
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return {
      valid: false,
      message: 'Senha deve conter pelo menos uma letra e um número'
    };

    return { valid: true };
  }

  // Validate slug format
  static validateSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    
    // Allow only lowercase letters, numbers, and hyphens
    return /^[a-z0-9-]+$/.test(slug) && 
           slug.length >= 3 && 
           slug.length <= 50 &&
           !slug.startsWith('-') &&
           !slug.endsWith('-');
  }

  // Validate tenant name
  static validateTenantName(name) {
    if (!name || typeof name !== 'string') return false;
    
    const sanitized = this.sanitizeString(name);
    return sanitized.length >= 2 && sanitized.length <= 100;
  }

  // Check for SQL injection patterns
  static hasSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|(\\')|(;)|(\\x)|(\\u))/i,
      /(OR|AND)\s+\d+\s*=\s*\d+/i,
      /\b(DROP|DELETE|INSERT|SELECT)\s+\w+/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  static hasXSS(input) {
    if (typeof input !== 'string') return false;
    
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // General input validation middleware
  static validateInput(req, res, next) {
    const body = req.body;
    
    // Check all string inputs for malicious patterns
    const checkValue = (value, key) => {
      if (typeof value === 'string') {
        if (InputValidator.hasSQLInjection(value)) {
          console.warn(`🚨 SQL injection attempt detected in ${key}: ${value}`);
          return res.status(400).json({
            success: false,
            message: 'Entrada inválida detectada',
            code: 'INVALID_INPUT'
          });
        }
        
        if (InputValidator.hasXSS(value)) {
          console.warn(`🚨 XSS attempt detected in ${key}: ${value}`);
          return res.status(400).json({
            success: false,
            message: 'Entrada inválida detectada',
            code: 'INVALID_INPUT'
          });
        }
      }
      
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          const result = checkValue(subValue, `${key}.${subKey}`);
          if (result) return result;
        }
      }
      
      return null;
    };

    // Validate all body parameters
    for (const [key, value] of Object.entries(body || {})) {
      const result = checkValue(value, key);
      if (result) return result;
    }

    next();
  }

  // Registration-specific validation
  static validateRegistration(req, res, next) {
    const { name, slug, email, password } = req.body;
    
    // Validate required fields
    if (!name || !slug || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validate email
    if (!InputValidator.validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validate password
    const passwordCheck = InputValidator.validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message
      });
    }

    // Validate slug
    if (!InputValidator.validateSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador deve conter apenas letras minúsculas, números e hífens (3-50 caracteres)'
      });
    }

    // Validate name
    if (!InputValidator.validateTenantName(name)) {
      return res.status(400).json({
        success: false,
        message: 'Nome da organização deve ter entre 2 e 100 caracteres'
      });
    }

    // Sanitize inputs
    req.body.name = InputValidator.sanitizeString(name);
    req.body.slug = slug.toLowerCase();
    req.body.email = email.toLowerCase().trim();
    
    next();
  }
}

module.exports = InputValidator;