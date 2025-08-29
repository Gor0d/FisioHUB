const crypto = require('crypto');
const emailService = require('./email-service');

class EmailVerificationService {
  constructor() {
    // In-memory storage for development (use Redis in production)
    this.verificationCodes = new Map();
    this.maxAttempts = 3;
    this.codeExpirationTime = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Generate a 6-digit verification code
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a unique verification ID
   */
  generateVerificationId() {
    return `verify_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Send verification code to email
   */
  async sendVerificationCode(email, tenantName) {
    try {
      // Generate code and verification ID
      const code = this.generateCode();
      const verificationId = this.generateVerificationId();
      const expiresAt = Date.now() + this.codeExpirationTime;

      // Store verification data
      const verificationData = {
        email,
        code,
        tenantName,
        attempts: 0,
        expiresAt,
        createdAt: Date.now(),
        isVerified: false
      };

      this.verificationCodes.set(verificationId, verificationData);

      // Send email
      const emailResult = await emailService.sendVerificationCode(email, code, tenantName);

      if (emailResult.success) {
        console.log(`✅ Código de verificação enviado para ${email}`);
        
        // Return verification ID (not the code for security)
        return {
          success: true,
          verificationId,
          expiresAt,
          message: 'Código de verificação enviado com sucesso'
        };
      } else {
        console.error('❌ Falha no envio de email:', emailResult.error);
        return {
          success: false,
          message: 'Erro ao enviar email de verificação'
        };
      }

    } catch (error) {
      console.error('❌ Erro no serviço de verificação:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verify the code entered by user
   */
  async verifyCode(verificationId, enteredCode) {
    try {
      const verificationData = this.verificationCodes.get(verificationId);

      if (!verificationData) {
        return {
          success: false,
          message: 'Código de verificação não encontrado ou expirado'
        };
      }

      // Check if already verified
      if (verificationData.isVerified) {
        return {
          success: false,
          message: 'Este código já foi utilizado'
        };
      }

      // Check expiration
      if (Date.now() > verificationData.expiresAt) {
        this.verificationCodes.delete(verificationId);
        return {
          success: false,
          message: 'Código de verificação expirou'
        };
      }

      // Check max attempts
      if (verificationData.attempts >= this.maxAttempts) {
        this.verificationCodes.delete(verificationId);
        return {
          success: false,
          message: 'Muitas tentativas inválidas. Solicite um novo código.'
        };
      }

      // Increment attempts
      verificationData.attempts++;

      // Verify code
      if (verificationData.code === enteredCode.toString()) {
        // Mark as verified
        verificationData.isVerified = true;
        verificationData.verifiedAt = Date.now();

        console.log(`✅ Email ${verificationData.email} verificado com sucesso`);

        return {
          success: true,
          email: verificationData.email,
          message: 'Email verificado com sucesso!'
        };
      } else {
        const remainingAttempts = this.maxAttempts - verificationData.attempts;
        
        return {
          success: false,
          message: `Código incorreto. ${remainingAttempts} tentativas restantes.`,
          remainingAttempts
        };
      }

    } catch (error) {
      console.error('❌ Erro na verificação do código:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Resend verification code
   */
  async resendCode(verificationId) {
    try {
      const verificationData = this.verificationCodes.get(verificationId);

      if (!verificationData) {
        return {
          success: false,
          message: 'Sessão de verificação não encontrada'
        };
      }

      if (verificationData.isVerified) {
        return {
          success: false,
          message: 'Email já foi verificado'
        };
      }

      // Generate new code
      const newCode = this.generateCode();
      const newExpiresAt = Date.now() + this.codeExpirationTime;

      // Update verification data
      verificationData.code = newCode;
      verificationData.expiresAt = newExpiresAt;
      verificationData.attempts = 0; // Reset attempts
      verificationData.resentAt = Date.now();

      // Send new email
      const emailResult = await emailService.sendVerificationCode(
        verificationData.email, 
        newCode, 
        verificationData.tenantName
      );

      if (emailResult.success) {
        return {
          success: true,
          expiresAt: newExpiresAt,
          message: 'Novo código enviado com sucesso'
        };
      } else {
        return {
          success: false,
          message: 'Erro ao reenviar código'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao reenviar código:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Clean expired verification codes (call periodically)
   */
  cleanExpiredCodes() {
    const now = Date.now();
    let cleaned = 0;

    for (const [verificationId, data] of this.verificationCodes.entries()) {
      if (now > data.expiresAt) {
        this.verificationCodes.delete(verificationId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Limpeza: ${cleaned} códigos expirados removidos`);
    }

    return cleaned;
  }

  /**
   * Get verification status
   */
  getVerificationStatus(verificationId) {
    const data = this.verificationCodes.get(verificationId);
    
    if (!data) {
      return { exists: false };
    }

    return {
      exists: true,
      email: data.email,
      attempts: data.attempts,
      maxAttempts: this.maxAttempts,
      isVerified: data.isVerified,
      expiresAt: data.expiresAt,
      isExpired: Date.now() > data.expiresAt
    };
  }

  /**
   * Send invitation email with temporary password
   */
  async sendInvitationEmail(email, name, tenantName, tempPassword) {
    try {
      const emailResult = await emailService.sendInvitationEmail(
        email, 
        name, 
        tenantName, 
        tempPassword
      );

      if (emailResult.success) {
        console.log(`✅ Convite enviado para ${email}`);
        return {
          success: true,
          message: 'Convite enviado com sucesso'
        };
      } else {
        console.error('❌ Falha no envio do convite:', emailResult.error);
        return {
          success: false,
          message: 'Erro ao enviar convite por email'
        };
      }

    } catch (error) {
      console.error('❌ Erro no serviço de convite:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats() {
    const total = this.verificationCodes.size;
    let verified = 0;
    let expired = 0;
    const now = Date.now();

    for (const data of this.verificationCodes.values()) {
      if (data.isVerified) verified++;
      if (now > data.expiresAt) expired++;
    }

    return {
      total,
      verified,
      expired,
      pending: total - verified - expired
    };
  }
}

// Auto-cleanup expired codes every 5 minutes
const verificationService = new EmailVerificationService();

setInterval(() => {
  verificationService.cleanExpiredCodes();
}, 5 * 60 * 1000);

module.exports = verificationService;