import { prisma } from '@/lib/prisma';

const subscriptionPlans = [
  {
    name: 'Básico',
    slug: 'basic',
    description: 'Plano ideal para pequenos consultórios e clínicas',
    priceMonthly: 299.00,
    priceYearly: 2990.00, // 10 meses
    features: {
      dashboard: true,
      indicators: true,
      reports: false,
      api_access: false,
      white_label: false,
      priority_support: false,
      custom_integrations: false,
      advanced_analytics: false
    },
    limits: {
      hospitals: 1,
      users: 50,
      services: 3,
      patients: 1000,
      indicators_monthly: 5000
    }
  },
  {
    name: 'Profissional',
    slug: 'professional', 
    description: 'Plano completo para hospitais e redes de saúde',
    priceMonthly: 799.00,
    priceYearly: 7990.00, // 10 meses
    features: {
      dashboard: true,
      indicators: true,
      reports: true,
      api_access: true,
      white_label: false,
      priority_support: true,
      custom_integrations: true,
      advanced_analytics: true
    },
    limits: {
      hospitals: 5,
      users: 200,
      services: -1, // Ilimitado
      patients: 10000,
      indicators_monthly: 50000
    }
  },
  {
    name: 'Empresarial',
    slug: 'enterprise',
    description: 'Solução completa para grandes redes hospitalares',
    priceMonthly: 1999.00,
    priceYearly: 19990.00, // 10 meses
    features: {
      dashboard: true,
      indicators: true,
      reports: true,
      api_access: true,
      white_label: true,
      priority_support: true,
      custom_integrations: true,
      advanced_analytics: true
    },
    limits: {
      hospitals: -1, // Ilimitado
      users: -1, // Ilimitado
      services: -1, // Ilimitado
      patients: -1, // Ilimitado
      indicators_monthly: -1 // Ilimitado
    }
  }
];

async function seedPlans() {
  console.log('🌱 Iniciando seed dos planos de assinatura...');
  
  try {
    // Limpar planos existentes (cuidado em produção!)
    if (process.env.NODE_ENV === 'development') {
      await prisma.subscriptionPlan.deleteMany({});
      console.log('🗑️ Planos existentes removidos');
    }
    
    // Criar planos
    for (const plan of subscriptionPlans) {
      const createdPlan = await prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        create: plan,
        update: {
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          features: plan.features,
          limits: plan.limits,
          active: true
        }
      });
      
      console.log(`✅ Plano criado/atualizado: ${createdPlan.name} (${createdPlan.slug})`);
    }
    
    console.log('🎉 Seed dos planos concluído com sucesso!');
    
    // Mostrar resumo
    const totalPlans = await prisma.subscriptionPlan.count();
    console.log(`📊 Total de planos ativos: ${totalPlans}`);
    
  } catch (error) {
    console.error('❌ Erro no seed dos planos:', error);
    process.exit(1);
  }
}

async function main() {
  await seedPlans();
  await prisma.$disconnect();
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

export { seedPlans };