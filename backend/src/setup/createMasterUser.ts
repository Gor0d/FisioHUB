import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMasterUser() {
  try {
    console.log('🚀 Criando usuário master para Cesar (MaisFisio)...');

    // Buscar o cliente MaisFisio
    let client = await prisma.client.findFirst({
      where: { name: "MaisFisio" }
    });

    if (!client) {
      // Criar cliente MaisFisio se não existir
      console.log('📋 Criando cliente MaisFisio...');
      client = await prisma.client.create({
        data: {
          name: "MaisFisio",
          contactEmail: "cesar@maisfisio.com.br",
          contactPhone: "(11) 99999-9999",
          subscriptionPlan: "enterprise",
          maxHospitals: 20,
          maxUsers: 1000,
        }
      });
      console.log('✅ Cliente MaisFisio criado');
    }

    // Buscar primeiro hospital para associar o usuário master
    const firstHospital = await prisma.hospital.findFirst();
    if (!firstHospital) {
      console.error('❌ Nenhum hospital encontrado. Execute primeiro o createFirstClient.ts');
      return;
    }

    // Verificar se usuário Cesar já existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: "cesar@maisfisio.com.br",
        hospitalId: firstHospital.id 
      }
    });

    if (existingUser) {
      console.log('✅ Usuário Cesar já existe');
      return;
    }

    // Criar usuário master Cesar
    const hashedPassword = await bcrypt.hash('cesar123', 12);
    const masterUser = await prisma.user.create({
      data: {
        email: "cesar@maisfisio.com.br",
        name: "Cesar",
        password: hashedPassword,
        role: 'ADMIN', // Admin com acesso total
        specialty: 'CEO MaisFisio', // Identificação especial
        hospitalId: firstHospital.id, // Associado ao primeiro hospital por questão técnica
        // serviceId pode ser null para ter acesso a todos os serviços
      }
    });

    console.log('✅ Usuário master criado com sucesso!');
    console.log('\n📋 Informações de acesso:');
    console.log('👤 Usuário Master:');
    console.log('   Nome: Cesar');
    console.log('   Email: cesar@maisfisio.com.br');
    console.log('   Senha: cesar123');
    console.log('   Empresa: MaisFisio');
    console.log('   Acesso: Todos os hospitais e serviços');

    return masterUser;

  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createMasterUser()
    .then(() => {
      console.log('✅ Script concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falhou:', error);
      process.exit(1);
    });
}

export { createMasterUser };