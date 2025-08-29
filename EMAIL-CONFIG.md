# 📧 Configuração de Email - FisioHUB

## 🚀 **CONFIGURAÇÃO PARA EMAILS REAIS**

Para enviar emails reais, você precisa configurar as variáveis de ambiente no Railway:

### 📋 **Variáveis de Ambiente Necessárias:**

```bash
# Gmail (Recomendado para desenvolvimento)
EMAIL_PROVIDER=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_APP_PASSWORD=sua-senha-de-app-gmail
EMAIL_FROM=seu-email@gmail.com

# Ou Resend (Recomendado para produção)
EMAIL_PROVIDER=resend
RESEND_API_KEY=sua-chave-resend
EMAIL_FROM=noreply@seudominio.com

# Ou SendGrid (Alternativa profissional)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=sua-chave-sendgrid
EMAIL_FROM=noreply@seudominio.com
```

## 📝 **Como Configurar Gmail (Mais Fácil):**

### 1. **Ativar Verificação em 2 Etapas:**
   - Vá para [Google Account](https://myaccount.google.com/)
   - Segurança → Verificação em 2 etapas → Ativar

### 2. **Gerar Senha de App:**
   - Segurança → Senhas de app
   - Selecione "Outro (nome personalizado)"
   - Digite "FisioHUB"
   - Copie a senha gerada (16 caracteres)

### 3. **Configurar no Railway:**
   ```bash
   EMAIL_PROVIDER=gmail
   EMAIL_USER=seu-email@gmail.com
   EMAIL_APP_PASSWORD=senha-de-16-caracteres
   EMAIL_FROM=seu-email@gmail.com
   ```

## 🚀 **Como Configurar Resend (Produção):**

### 1. **Criar Conta:**
   - Acesse [resend.com](https://resend.com)
   - Crie uma conta gratuita

### 2. **Gerar API Key:**
   - Dashboard → API Keys
   - Create API Key
   - Copie a chave

### 3. **Configurar Domínio:**
   - Dashboard → Domains
   - Add Domain: `seudominio.com`
   - Configure DNS conforme instruções

### 4. **Configurar no Railway:**
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_sua-chave-aqui
   EMAIL_FROM=noreply@seudominio.com
   ```

## ⚙️ **Como Configurar no Railway:**

### 1. **Via Dashboard:**
   - Acesse [railway.app](https://railway.app)
   - Selecione seu projeto FisioHUB
   - Aba "Variables"
   - Add Variable → Inserir cada variável

### 2. **Via Railway CLI:**
   ```bash
   railway login
   railway variables set EMAIL_PROVIDER=gmail
   railway variables set EMAIL_USER=seu-email@gmail.com
   railway variables set EMAIL_APP_PASSWORD=sua-senha-app
   railway variables set EMAIL_FROM=seu-email@gmail.com
   ```

## 🧪 **Testando Emails:**

### Após configurar, teste com:
```bash
curl -X POST https://api.fisiohub.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email-teste@gmail.com",
    "tenantSlug": "0li0k7HNQslV"
  }'
```

### Verificar recebimento:
- Verifique caixa de entrada
- Verifique spam/lixo eletrônico
- Código deve chegar em 1-2 minutos

## 🔧 **Templates de Email Inclusos:**

✅ **Código de Verificação**: 6 dígitos com visual profissional
✅ **Convite para Colaboradores**: Credenciais + instruções
✅ **Fallback Texto**: Compatibilidade total

## 🆘 **Solução de Problemas:**

### Gmail não envia:
- ✅ Verificação 2 etapas ativada?
- ✅ Senha de app gerada corretamente?
- ✅ "Acesso de apps menos seguros" desabilitado?

### Resend não envia:
- ✅ Domínio verificado?
- ✅ DNS configurado?
- ✅ API key válida?

### Emails vão para spam:
- ✅ Configure SPF record
- ✅ Configure DKIM
- ✅ Use domínio próprio

## 📊 **Status Atual:**

- ✅ Sistema de emails implementado
- ✅ Templates profissionais criados  
- ✅ Fallback para modo demo
- ⏳ **Próximo**: Configurar variáveis de ambiente
- ⏳ **Próximo**: Testar com emails reais

---

**🤖 Documentação gerada com Claude Code**
**📧 Para suporte: Configure uma das opções acima**