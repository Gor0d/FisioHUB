import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createFirstClient() {
  try {
    console.log('🚀 Criando primeiro cliente...');

    // Verificar se já existe um cliente
    const existingClient = await prisma.client.findFirst();
    if (existingClient) {
      console.log('✅ Cliente já existe, pulando criação.');
      return;
    }

    // Criar o primeiro cliente com dados do usuário
    const clientData = {
      name: "Fisioterapia Grupo Hospitalar",
      cnpj: null,
      contactEmail: "admin@fisiohub.com.br",
      contactPhone: null,
      subscriptionPlan: "enterprise" as const,
      maxHospitals: 10,
      maxUsers: 500,
      hospitals: [
        {
          name: "Hospital Público Estadual Galileu",
          code: "galileu",
          adminName: "Administrador Galileu",
          adminEmail: "admin@galileu.com.br",
          adminPassword: "admin123",
          services: [
            {
              name: "Fisioterapia",
              code: "fisioterapia",
              description: "Serviço de fisioterapia hospitalar",
              color: "#10B981",
              icon: "heart"
            },
            {
              name: "Psicologia",
              code: "psicologia", 
              description: "Serviço de psicologia hospitalar",
              color: "#3B82F6",
              icon: "brain"
            },
            {
              name: "Serviço Social",
              code: "servico-social",
              description: "Serviço social hospitalar",
              color: "#F59E0B",
              icon: "users"
            }
          ]
        },
        {
          name: "Hospital Santa Teresinha",
          code: "santa-teresinha",
          adminName: "Administrador Santa Teresinha",
          adminEmail: "admin@santateresinha.com.br",
          adminPassword: "admin123",
          services: [
            {
              name: "Fisioterapia",
              code: "fisioterapia",
              description: "Serviço de fisioterapia hospitalar",
              color: "#10B981",
              icon: "heart"
            }
          ]
        }
      ]
    };

    // Criar em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar cliente
      const client = await tx.client.create({
        data: {
          name: clientData.name,
          cnpj: clientData.cnpj,
          contactEmail: clientData.contactEmail,
          contactPhone: clientData.contactPhone,
          subscriptionPlan: clientData.subscriptionPlan,
          maxHospitals: clientData.maxHospitals,
          maxUsers: clientData.maxUsers,
        }
      });

      console.log(`✅ Cliente criado: ${client.name}`);

      const hospitals = [];

      // Criar hospitais e serviços
      for (const hospitalData of clientData.hospitals) {
        // Criar hospital
        const hospital = await tx.hospital.create({
          data: {
            name: hospitalData.name,
            code: hospitalData.code,
            clientId: client.id,
          }
        });

        console.log(`  🏥 Hospital criado: ${hospital.name}`);

        // Criar usuário administrador do hospital
        const hashedPassword = await bcrypt.hash(hospitalData.adminPassword, 12);
        const admin = await tx.user.create({
          data: {
            email: hospitalData.adminEmail,
            name: hospitalData.adminName,
            password: hashedPassword,
            role: 'ADMIN',
            hospitalId: hospital.id,
          }
        });

        console.log(`    👤 Admin criado: ${admin.email}`);

        const services = [];

        // Criar serviços do hospital
        for (const serviceData of hospitalData.services) {
          const service = await tx.service.create({
            data: {
              name: serviceData.name,
              code: serviceData.code,
              description: serviceData.description,
              color: serviceData.color,
              icon: serviceData.icon,
              hospitalId: hospital.id,
            }
          });

          console.log(`      ⚕️  Serviço criado: ${service.name}`);

          // Criar template padrão para fisioterapia
          if (serviceData.code === 'fisioterapia') {
            const template = await tx.indicatorTemplate.create({
              data: {
                name: "Indicadores de Fisioterapia Hospitalar",
                description: "Template padrão para indicadores de fisioterapia hospitalar",
                serviceId: service.id,
                fields: [
                  // Indicadores de Internação
                  {
                    name: "patientsHospitalized",
                    label: "Pacientes Internados",
                    type: "number",
                    required: false,
                    category: "Internação",
                    description: "Número de pacientes internados no período"
                  },
                  {
                    name: "patientsPrescribed",
                    label: "Pacientes Prescritos",
                    type: "number", 
                    required: false,
                    category: "Internação"
                  },
                  {
                    name: "patientsCaptured",
                    label: "Pacientes Captados",
                    type: "number",
                    required: false,
                    category: "Internação"
                  },
                  {
                    name: "discharges",
                    label: "Altas",
                    type: "number",
                    required: false,
                    category: "Internação"
                  },
                  // Indicadores Respiratórios
                  {
                    name: "respiratoryTherapyCount",
                    label: "Atendimentos Fisioterapia Respiratória",
                    type: "number",
                    required: false,
                    category: "Respiratórios"
                  },
                  {
                    name: "respiratoryTherapyRate",
                    label: "Taxa de Fisioterapia Respiratória (%)",
                    type: "percentage",
                    required: false,
                    category: "Respiratórios",
                    validation: { min: 0, max: 100 }
                  },
                  {
                    name: "extubationEffectivenessRate",
                    label: "Taxa de Efetividade na Extubação (%)",
                    type: "percentage",
                    required: false,
                    category: "Respiratórios",
                    validation: { min: 0, max: 100 }
                  },
                  // Indicadores Motores
                  {
                    name: "motorTherapyRate",
                    label: "Taxa de Fisioterapia Motora (%)",
                    type: "percentage",
                    required: false,
                    category: "Motores",
                    validation: { min: 0, max: 100 }
                  },
                  {
                    name: "sedestationRate",
                    label: "Taxa de Sedestação (%)",
                    type: "percentage",
                    required: false,
                    category: "Motores",
                    validation: { min: 0, max: 100 }
                  },
                  {
                    name: "orthostatismRate",
                    label: "Taxa de Ortostatismo (%)",
                    type: "percentage",
                    required: false,
                    category: "Motores",
                    validation: { min: 0, max: 100 }
                  },
                  {
                    name: "ambulationRate",
                    label: "Taxa de Deambulação (%)",
                    type: "percentage",
                    required: false,
                    category: "Motores",
                    validation: { min: 0, max: 100 }
                  }
                ]
              }
            });

            console.log(`        📋 Template criado para Fisioterapia`);
          }

          services.push(service);
        }

        hospitals.push({
          ...hospital,
          admin: { ...admin, password: undefined },
          services
        });
      }

      return { client, hospitals };
    });

    console.log('\n🎉 Primeiro cliente criado com sucesso!');
    console.log('\n📋 Informações de acesso:');
    console.log('\n🏥 Hospital Público Estadual Galileu:');
    console.log('   Email: admin@galileu.com.br');
    console.log('   Senha: admin123');
    console.log('   Serviços: Fisioterapia, Psicologia, Serviço Social');
    
    console.log('\n🏥 Hospital Santa Teresinha:');
    console.log('   Email: admin@santateresinha.com.br');
    console.log('   Senha: admin123');
    console.log('   Serviços: Fisioterapia');

    return result;

  } catch (error) {
    console.error('❌ Erro ao criar primeiro cliente:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createFirstClient()
    .then(() => {
      console.log('✅ Script concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falhou:', error);
      process.exit(1);
    });
}

export { createFirstClient };