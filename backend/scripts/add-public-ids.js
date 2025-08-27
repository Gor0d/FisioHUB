const { PrismaClient } = require('@prisma/client');
const SlugSecurity = require('../utils/slug-security');

const prisma = new PrismaClient();

async function addPublicIdsToExistingTenants() {
  try {
    console.log('🔄 Iniciando migração de publicIds...');
    
    // Buscar todos os tenants sem publicId
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { publicId: null },
          { publicId: '' }
        ]
      }
    });

    console.log(`📊 Encontrados ${tenants.length} tenants para atualizar`);

    // Atualizar cada tenant
    for (const tenant of tenants) {
      const publicId = SlugSecurity.generatePublicId(tenant.slug);
      
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { publicId }
      });

      console.log(`✅ Tenant ${tenant.name} (${tenant.slug}) -> publicId: ${publicId}`);
    }

    console.log('🎉 Migração concluída com sucesso!');

    // Listar todos os tenants com seus novos publicIds
    const updatedTenants = await prisma.tenant.findMany({
      select: {
        name: true,
        slug: true,
        publicId: true
      }
    });

    console.log('\n📋 Tenants com publicIds:');
    updatedTenants.forEach(tenant => {
      console.log(`  - ${tenant.name}: https://fisiohub.app/t/${tenant.publicId}`);
    });

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addPublicIdsToExistingTenants();
}

module.exports = addPublicIdsToExistingTenants;