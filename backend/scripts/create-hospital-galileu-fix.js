const { PrismaClient } = require('@prisma/client');
const SlugSecurity = require('../utils/slug-security');

const prisma = new PrismaClient();

async function createHospitalGalileu() {
  try {
    console.log('<å Criando/Corrigindo Hospital Galileu...');

    const slug = 'hospital-galileu';
    const publicId = SlugSecurity.generatePublicId(slug);

    console.log(`=Ë Dados do Hospital:
    - Nome: Hospital Galileu
    - Slug: ${slug}  
    - Public ID: ${publicId}
    - Email: admin@galileu.com.br
    `);

    // First, try to find any existing tenant with similar data
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: slug },
          { email: 'admin@galileu.com.br' },
          { name: { contains: 'Galileu' } }
        ]
      }
    });

    if (existingTenant) {
      console.log('  Hospital encontrado! Atualizando com publicId correto...');
      console.log('=Ê Dados atuais:', existingTenant);
      
      const updatedTenant = await prisma.tenant.update({
        where: { id: existingTenant.id },
        data: {
          name: 'Hospital Galileu',
          slug: slug,
          publicId: publicId,
          email: 'admin@galileu.com.br',
          status: 'active',
          plan: 'professional',
          isActive: true,
          lastActivityAt: new Date(),
          metadata: {
            specialty: 'fisioterapia_hospitalar',
            features: ['indicators', 'mrc_barthel', 'evolutions'],
            created_by: 'claude_code',
            implementation_date: '2025-08-27',
            fixed_public_id: true
          }
        }
      });

      console.log(' Hospital Galileu atualizado com sucesso!');
      console.log('=Ê Dados finais:', {
        id: updatedTenant.id,
        name: updatedTenant.name,
        publicId: updatedTenant.publicId,
        slug: updatedTenant.slug
      });

    } else {
      console.log('<• Criando novo Hospital Galileu...');

      const newTenant = await prisma.tenant.create({
        data: {
          name: 'Hospital Galileu',
          slug: slug,
          publicId: publicId,
          email: 'admin@galileu.com.br',
          status: 'active',
          plan: 'professional',
          billingEmail: 'admin@galileu.com.br',
          isActive: true,
          lastActivityAt: new Date(),
          metadata: {
            specialty: 'fisioterapia_hospitalar',
            features: ['indicators', 'mrc_barthel', 'evolutions'],
            created_by: 'claude_code',
            implementation_date: '2025-08-27'
          }
        }
      });

      console.log(' Hospital Galileu criado com sucesso!');
      console.log('=Ê ID do Tenant:', newTenant.id);
    }

    console.log(`
<‰ Hospital Galileu configurado com sucesso!

= URLs de acesso corretas:
- Sistema: https://fisiohub.app/t/${publicId}
- Dashboard: https://fisiohub.app/t/${publicId}/dashboard  
- Indicadores: https://fisiohub.app/t/${publicId}/indicators
- Escalas: https://fisiohub.app/t/${publicId}/assessments

=ç Credenciais:
- Email: admin@galileu.com.br

=Ê Informações técnicas:
- Public ID: ${publicId}
- Slug interno: ${slug}
- Status: Ativo
- Plano: Professional

¡ O sistema agora deve mostrar "Hospital Galileu" ao invés de "${publicId}"
    `);

  } catch (error) {
    console.error('L Erro ao criar/corrigir Hospital Galileu:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if called directly
if (require.main === module) {
  createHospitalGalileu();
}

module.exports = createHospitalGalileu;