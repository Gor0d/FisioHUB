const SlugSecurity = require('../utils/slug-security');

// Cache para evitar consultas desnecessárias ao banco
const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class TenantSecurity {
  // Middleware para resolver publicId para tenant real
  static async resolvePublicId(req, res, next) {
    try {
      const publicId = req.params.publicId || req.params.slug;
      
      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID é obrigatório'
        });
      }

      // Verificar se é um ID público válido
      if (!SlugSecurity.isValidPublicId(publicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID público inválido'
        });
      }

      // Verificar cache primeiro
      const cacheKey = `tenant_${publicId}`;
      const cached = tenantCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        req.tenant = cached.tenant;
        req.publicId = publicId;
        return next();
      }

      // Buscar tenant no banco pelo publicId
      const tenant = await req.prisma.tenant.findUnique({
        where: { publicId: publicId }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Organização não encontrada'
        });
      }

      // Verificar se o tenant está ativo
      if (!tenant.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Organização inativa'
        });
      }

      // Armazenar no cache
      tenantCache.set(cacheKey, {
        tenant,
        timestamp: Date.now()
      });

      // Adicionar tenant ao request
      req.tenant = tenant;
      req.publicId = publicId;
      
      next();
    } catch (error) {
      console.error('Erro no middleware de segurança do tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Limpar cache periodicamente
  static clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of tenantCache.entries()) {
      if (now - value.timestamp >= CACHE_TTL) {
        tenantCache.delete(key);
      }
    }
  }

  // Validar acesso do usuário ao tenant
  static async validateTenantAccess(req, res, next) {
    try {
      const user = req.user; // Assumindo que já passou pelo middleware de auth
      const tenant = req.tenant;

      if (!user || !tenant) {
        return res.status(401).json({
          success: false,
          message: 'Acesso não autorizado'
        });
      }

      // Verificar se o usuário pertence a este tenant
      if (user.tenantId !== tenant.id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado para esta organização'
        });
      }

      next();
    } catch (error) {
      console.error('Erro na validação de acesso ao tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

// Limpar cache a cada 10 minutos
setInterval(() => {
  TenantSecurity.clearExpiredCache();
}, 10 * 60 * 1000);

module.exports = TenantSecurity;