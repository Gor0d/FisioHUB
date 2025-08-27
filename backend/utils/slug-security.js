const crypto = require('crypto');

// Secret key for encryption (should be in environment variables)
const ENCRYPTION_KEY = process.env.SLUG_ENCRYPTION_KEY || 'your-secret-key-32-chars-long-123';
const ALGORITHM = 'aes-256-gcm';

class SlugSecurity {
  // Generate a secure hash for a tenant slug
  static generateSecureId(originalSlug) {
    try {
      // Create deterministic hash based on slug + salt
      const salt = 'fisiohub-secure-salt-2025';
      const hash = crypto.createHash('sha256')
        .update(originalSlug + salt)
        .digest('hex');
      
      // Return first 16 chars + random 8 chars for uniqueness
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      return hash.substring(0, 16) + randomSuffix;
    } catch (error) {
      console.error('Error generating secure ID:', error);
      return null;
    }
  }

  // Encrypt the original slug (reversible)
  static encryptSlug(slug) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
      
      let encrypted = cipher.update(slug, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV and encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error encrypting slug:', error);
      return null;
    }
  }

  // Decrypt the slug (reversible)
  static decryptSlug(encryptedSlug) {
    try {
      const [ivHex, encrypted] = encryptedSlug.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting slug:', error);
      return null;
    }
  }

  // Generate URL-safe public ID (non-reversible but deterministic)
  static generatePublicId(slug) {
    try {
      // Create a consistent but non-reversible public ID
      const hash = crypto.createHash('sha256')
        .update(slug + 'fisiohub-public-2025')
        .digest('base64url');
      
      // Return first 12 characters for clean URLs
      return hash.substring(0, 12);
    } catch (error) {
      console.error('Error generating public ID:', error);
      return slug; // Fallback to original slug
    }
  }

  // Validate if a public ID could be valid
  static isValidPublicId(publicId) {
    return /^[A-Za-z0-9_-]{12}$/.test(publicId);
  }
}

module.exports = SlugSecurity;