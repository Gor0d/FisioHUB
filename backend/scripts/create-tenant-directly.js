const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const SlugSecurity = require('../utils/slug-security');

// Inicializar Prisma com banco local
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function createHospitalGalileuDirectly() {
  console.log('🏥 Criando Hospital Galileu diretamente no banco local...\n');

  const hospitalData = {
    name: 'Hospital Galileu',
    slug: 'hospital-galileu',
    email: 'admin@hospitalgalileu.com.br',
    password: 'Galileu2025!@#'
  };

  const publicId = SlugSecurity.generatePublicId(hospitalData.slug);

  console.log('📋 Dados do Hospital:');
  console.log(`   Nome: ${hospitalData.name}`);
  console.log(`   Slug: ${hospitalData.slug}`);
  console.log(`   Email: ${hospitalData.email}`);
  console.log(`   Public ID: ${publicId}`);

  try {
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco local');

    // Verificar se já existe
    const existing = await prisma.tenant.findFirst({
      where: { slug: hospitalData.slug }
    });

    if (existing) {
      console.log('⚠️ Hospital Galileu já existe no banco!');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Public ID: ${existing.publicId}`);
      console.log(`   Criado em: ${existing.createdAt}`);
      return existing;
    }

    // Criar tenant
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: hospitalData.name,
        slug: hospitalData.slug,
        publicId: publicId,
        email: hospitalData.email,
        status: 'trial',
        plan: 'professional',
        isActive: true,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
      }
    });

    console.log('✅ Tenant criado:', tenant.id);

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash(hospitalData.password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const adminUser = await prisma.globalUser.create({
      data: {
        id: userId,
        email: hospitalData.email,
        name: `Admin ${hospitalData.name}`,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant.id,
        isActive: true
      }
    });

    console.log('✅ Usuário admin criado:', adminUser.id);

    // Informações finais
    console.log('\n🎉 HOSPITAL GALILEU CRIADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔗 URLs de Acesso (quando API estiver online):');
    console.log(`   Frontend: https://fisiohub.app/t/${publicId}`);
    console.log(`   Dashboard: https://fisiohub.app/t/${publicId}/dashboard`);
    console.log(`   Pacientes: https://fisiohub.app/t/${publicId}/patients`);
    
    console.log('\n👤 Credenciais de Acesso:');
    console.log(`   Email: ${hospitalData.email}`);
    console.log(`   Senha: ${hospitalData.password}`);
    
    console.log('\n🔐 Informações Técnicas:');
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log(`   Admin ID: ${adminUser.id}`);
    console.log(`   Slug: ${hospitalData.slug}`);
    console.log(`   Public ID: ${publicId}`);
    console.log(`   Status: ${tenant.status}`);
    console.log(`   Trial até: ${tenant.trialEndsAt}`);

    console.log('\n📋 Próximos Passos:');
    console.log('   1. Aguardar API Railway voltar online');
    console.log('   2. Migrar este tenant para produção');
    console.log('   3. Acessar o sistema');
    console.log('   4. Cadastrar pacientes de teste');

    return { tenant, adminUser };

  } catch (error) {
    console.error('❌ Erro ao criar Hospital Galileu:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para listar todos os tenants
async function listTenants() {
  console.log('\n📋 Listando todos os tenants...');
  
  try {
    await prisma.$connect();
    
    const tenants = await prisma.tenant.findMany({
      include: {
        globalUsers: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (tenants.length === 0) {
      console.log('📭 Nenhum tenant encontrado');
      return;
    }

    console.log(`\n📊 Encontrados ${tenants.length} tenant(s):\n`);
    
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`);
      console.log(`   🔗 Public ID: ${tenant.publicId}`);
      console.log(`   🏷️ Slug: ${tenant.slug}`);
      console.log(`   📧 Email: ${tenant.email}`);
      console.log(`   📈 Status: ${tenant.status}`);
      console.log(`   🎯 Plano: ${tenant.plan}`);
      console.log(`   👥 Usuários: ${tenant.globalUsers.length}`);
      
      if (tenant.globalUsers.length > 0) {
        tenant.globalUsers.forEach(user => {
          console.log(`      - ${user.name} (${user.email}) [${user.role}]`);
        });
      }
      
      console.log(`   📅 Criado: ${tenant.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao listar tenants:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    listTenants();
  } else {
    createHospitalGalileuDirectly().then(() => {
      console.log('\n🔍 Listando tenants após criação...');
      return listTenants();
    });
  }
}

module.exports = { createHospitalGalileuDirectly, listTenants };