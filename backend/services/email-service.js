const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar transportador de email
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configuração para diferentes provedores
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    
    switch (emailProvider) {
      case 'sendgrid':
        return nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      
      case 'resend':
        return nodemailer.createTransporter({
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY
          }
        });
      
      case 'gmail':
      default:
        return nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD // App password, not regular password
          }
        });
    }
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(to, code, hospitalName) {
    const subject = `[${hospitalName}] Código de Verificação - FisioHUB`;
    
    const htmlContent = this.getVerificationEmailTemplate(code, hospitalName);
    const textContent = this.getVerificationEmailText(code, hospitalName);

    try {
      const mailOptions = {
        from: {
          name: 'FisioHUB',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de verificação enviado para ${to}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email with credentials
   */
  async sendWelcomeEmail(to, credentials, hospitalName, role) {
    const subject = `[${hospitalName}] Bem-vindo ao FisioHUB - Suas credenciais de acesso`;
    
    const htmlContent = this.getWelcomeEmailTemplate(credentials, hospitalName, role);
    const textContent = this.getWelcomeEmailText(credentials, hospitalName, role);

    try {
      const mailOptions = {
        from: {
          name: 'FisioHUB',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de boas-vindas enviado para ${to}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send invitation email with temporary password
   */
  async sendInvitationEmail(email, name, hospitalName, tempPassword) {
    const subject = `[${hospitalName}] Convite para integrar a equipe - FisioHUB`;
    
    const htmlContent = this.getInvitationEmailTemplate(email, name, hospitalName, tempPassword);
    const textContent = this.getInvitationEmailText(email, name, hospitalName, tempPassword);

    try {
      const mailOptions = {
        from: {
          name: 'FisioHUB',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Convite enviado para ${email}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Erro ao enviar convite:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send staff invitation email
   */
  async sendStaffInvitation(to, inviteData, hospitalName) {
    const subject = `[${hospitalName}] Convite para integrar a equipe - FisioHUB`;
    
    const htmlContent = this.getStaffInviteTemplate(inviteData, hospitalName);
    const textContent = this.getStaffInviteText(inviteData, hospitalName);

    try {
      const mailOptions = {
        from: {
          name: 'FisioHUB',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Convite enviado para ${to}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Erro ao enviar convite:', error);
      return { success: false, error: error.message };
    }
  }

  // Email Templates
  getVerificationEmailTemplate(code, hospitalName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação - FisioHUB</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #1e40af; color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .code-box { background: #f1f5f9; border: 2px dashed #64748b; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: monospace; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 ${hospitalName}</h1>
            <p>Sistema FisioHUB - Verificação de Email</p>
          </div>
          
          <div class="content">
            <h2>Confirme seu email</h2>
            <p>Olá! Para finalizar a criação da sua conta no FisioHUB, confirme seu endereço de email usando o código abaixo:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
              <p style="margin-top: 15px; color: #64748b;">Código de verificação</p>
            </div>
            
            <div class="warning">
              <strong>⏰ Importante:</strong> Este código expira em 10 minutos e pode ser usado apenas uma vez.
            </div>
            
            <p>Se você não criou uma conta no FisioHUB, pode ignorar este email com segurança.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p><strong>Próximos passos:</strong></p>
            <ol>
              <li>Insira o código na tela de verificação</li>
              <li>Complete a configuração inicial</li>
              <li>Acesse seu painel administrativo</li>
              <li>Configure sua equipe</li>
            </ol>
          </div>
          
          <div class="footer">
            <p><strong>FisioHUB</strong> - Sistema de Gestão Hospitalar</p>
            <p>📧 Este email foi enviado automaticamente, não responda.</p>
            <p>🔒 Seus dados estão protegidos com criptografia de nível empresarial.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getVerificationEmailText(code, hospitalName) {
    return `
[${hospitalName}] Código de Verificação - FisioHUB

Confirme seu email

Para finalizar a criação da sua conta no FisioHUB, confirme seu endereço de email usando o código:

CÓDIGO: ${code}

⏰ Este código expira em 10 minutos e pode ser usado apenas uma vez.

Se você não criou uma conta no FisioHUB, pode ignorar este email.

Próximos passos:
1. Insira o código na tela de verificação
2. Complete a configuração inicial  
3. Acesse seu painel administrativo
4. Configure sua equipe

---
FisioHUB - Sistema de Gestão Hospitalar
Este email foi enviado automaticamente.
    `;
  }

  getWelcomeEmailTemplate(credentials, hospitalName, role) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao FisioHUB</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #059669; color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .credentials { background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao FisioHUB!</h1>
            <p>${hospitalName}</p>
          </div>
          
          <div class="content">
            <h2>Sua conta foi criada com sucesso!</h2>
            <p>Olá! Você agora faz parte da equipe do <strong>${hospitalName}</strong> no sistema FisioHUB.</p>
            
            <div class="credentials">
              <h3>📧 Suas credenciais de acesso:</h3>
              <p><strong>Email:</strong> ${credentials.email}</p>
              <p><strong>Senha temporária:</strong> ${credentials.temporaryPassword}</p>
              <p><strong>Função:</strong> ${role}</p>
            </div>
            
            <a href="${credentials.loginUrl}" class="button">🔑 Fazer Primeiro Login</a>
            
            <p><strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar sua senha no primeiro acesso.</p>
            
            <hr>
            
            <h3>🚀 O que você pode fazer no FisioHUB:</h3>
            <ul>
              <li>📊 Acompanhar indicadores clínicos em tempo real</li>
              <li>⚖️ Realizar avaliações com escalas MRC e Barthel</li>
              <li>📝 Registrar evoluções de fisioterapia</li>
              <li>📈 Gerar relatórios detalhados</li>
              <li>👥 Colaborar com a equipe</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailText(credentials, hospitalName, role) {
    return `
Bem-vindo ao FisioHUB!
${hospitalName}

Sua conta foi criada com sucesso!

Credenciais de acesso:
Email: ${credentials.email}
Senha temporária: ${credentials.temporaryPassword}
Função: ${role}

Link de acesso: ${credentials.loginUrl}

⚠️ Por segurança, altere sua senha no primeiro acesso.

O que você pode fazer no FisioHUB:
- Acompanhar indicadores clínicos
- Realizar avaliações MRC e Barthel  
- Registrar evoluções
- Gerar relatórios
- Colaborar com a equipe

---
FisioHUB - Sistema de Gestão Hospitalar
    `;
  }

  getStaffInviteTemplate(inviteData, hospitalName) {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Convite para integrar a equipe</h1>
        <p>Você foi convidado para fazer parte da equipe do <strong>${hospitalName}</strong>!</p>
        <p>Clique no link abaixo para aceitar o convite:</p>
        <a href="${inviteData.inviteUrl}">Aceitar Convite</a>
      </body>
      </html>
    `;
  }

  getInvitationEmailTemplate(email, name, hospitalName, tempPassword) {
    const loginUrl = `https://fisiohub.app/t/0li0k7HNQslV`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para integrar a equipe - FisioHUB</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #059669; color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .credentials { background: #f0fdf4; border: 1px solid #16a34a; padding: 25px; border-radius: 8px; margin: 25px 0; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; text-align: center; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo à equipe!</h1>
            <p>${hospitalName} - Sistema FisioHUB</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Você foi convidado para integrar a equipe de fisioterapeutas do <strong>${hospitalName}</strong> no sistema FisioHUB.</p>
            
            <div class="credentials">
              <h3>🔐 Suas credenciais de acesso:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Senha temporária:</strong> <code style="background:#e2e8f0; padding:4px 8px; border-radius:4px; font-family:monospace;">${tempPassword}</code></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">🚀 Acessar FisioHUB</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar sua senha no primeiro acesso.
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <h3>🏥 O que você pode fazer no FisioHUB:</h3>
            <ul>
              <li>📊 <strong>Indicadores Clínicos:</strong> Registrar e monitorar indicadores de qualidade</li>
              <li>⚖️ <strong>Escalas de Avaliação:</strong> Aplicar escalas MRC e Barthel</li>
              <li>📝 <strong>Evoluções:</strong> Documentar evolução dos pacientes</li>
              <li>📈 <strong>Relatórios:</strong> Gerar relatórios detalhados</li>
              <li>👥 <strong>Colaboração:</strong> Trabalhar em equipe de forma integrada</li>
            </ul>
            
            <p><strong>Dúvidas?</strong> Entre em contato com o administrador do sistema.</p>
          </div>
          
          <div class="footer">
            <p><strong>FisioHUB</strong> - Sistema de Gestão de Fisioterapia Hospitalar</p>
            <p>📧 Este email foi enviado automaticamente, não responda.</p>
            <p>🔒 Seus dados estão protegidos com criptografia de nível empresarial.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInvitationEmailText(email, name, hospitalName, tempPassword) {
    const loginUrl = `https://fisiohub.app/t/0li0k7HNQslV`;
    
    return `
[${hospitalName}] Convite para integrar a equipe - FisioHUB

Bem-vindo à equipe!

Olá, ${name}!

Você foi convidado para integrar a equipe de fisioterapeutas do ${hospitalName} no sistema FisioHUB.

🔐 Suas credenciais de acesso:
Email: ${email}
Senha temporária: ${tempPassword}

🚀 Acessar FisioHUB: ${loginUrl}

⚠️ IMPORTANTE: Altere sua senha no primeiro acesso por segurança.

🏥 O que você pode fazer no FisioHUB:
- Indicadores Clínicos: Registrar e monitorar indicadores
- Escalas de Avaliação: Aplicar escalas MRC e Barthel
- Evoluções: Documentar evolução dos pacientes
- Relatórios: Gerar relatórios detalhados
- Colaboração: Trabalhar em equipe de forma integrada

Dúvidas? Entre em contato com o administrador do sistema.

---
FisioHUB - Sistema de Gestão de Fisioterapia Hospitalar
Este email foi enviado automaticamente.
    `;
  }

  getStaffInviteText(inviteData, hospitalName) {
    return `Convite para ${hospitalName}\n\nVocê foi convidado para a equipe!\nLink: ${inviteData.inviteUrl}`;
  }
}

module.exports = new EmailService();