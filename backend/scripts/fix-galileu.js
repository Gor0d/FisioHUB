const { PrismaClient } = require('@prisma/client');
const SlugSecurity = require('../utils/slug-security');

const prisma = new PrismaClient();

async function fixHospitalGalileu() {
  try {
    console.log('Fixing Hospital Galileu...');

    const slug = 'hospital-galileu';
    const publicId = SlugSecurity.generatePublicId(slug);

    console.log('Data:', {
      name: 'Hospital Galileu',
      slug: slug,
      publicId: publicId,
      email: 'admin@galileu.com.br'
    });

    // Find and update tenant
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
      console.log('Updating existing tenant...');
      
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
          lastActivityAt: new Date()
        }
      });

      console.log('Success! Updated tenant:', updatedTenant.id);

    } else {
      console.log('Creating new tenant...');

      const newTenant = await prisma.tenant.create({
        data: {
          name: 'Hospital Galileu',
          slug: slug,
          publicId: publicId,
          email: 'admin@galileu.com.br',
          status: 'active',
          plan: 'professional',
          isActive: true
        }
      });

      console.log('Success! Created tenant:', newTenant.id);
    }

    console.log('Hospital Galileu fixed successfully!');
    console.log('URL: https://fisiohub.app/t/' + publicId);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixHospitalGalileu();
}

module.exports = fixHospitalGalileu;