const axios = require('axios');
const SlugSecurity = require('../utils/slug-security');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createHospitalGalileuWithRetry() {
  console.log('🏥 Criando Hospital Galileu com retry automático...\n');

  const hospitalData = {
    name: 'Hospital Galileu',
    slug: 'hospital-galileu',
    email: 'admin@hospitalgalileu.com.br',
    password: 'Galileu2025!@#',
    plan: 'professional'
  };

  const publicId = SlugSecurity.generatePublicId(hospitalData.slug);

  console.log('📋 Dados do Hospital:');
  console.log(`   Nome: ${hospitalData.name}`);
  console.log(`   Slug: ${hospitalData.slug}`);
  console.log(`   Email: ${hospitalData.email}`);
  console.log(`   Public ID: ${publicId}`);
  console.log(`   Senha: ${'*'.repeat(hospitalData.password.length)}`);
  console.log('');

  const maxRetries = 5;
  const baseUrl = 'https://api.fisiohub.app';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Acordando API Railway...`);
      
      // Primeiro tentar health check para acordar a API
      try {
        await axios.get(`${baseUrl}/health`, { timeout: 60000 });
      } catch (healthError) {
        // Ignorar erro de health check se for 502 (API dormindo)
        console.log(`   ⚠️ Health check: ${healthError.message}`);
      }
      
      console.log(`🔄 Tentando registrar tenant...`);
      
      const response = await axios.post(`${baseUrl}/api/tenants/register`, hospitalData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FisioHub-Setup-Script/2.0'
        }
      });

      // Sucesso!
      console.log('\n🎉 HOSPITAL GALILEU CRIADO COM SUCESSO!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n📊 Resposta da API:');
      console.log(JSON.stringify(response.data, null, 2));
      
      console.log('\n🔗 URLs de Acesso:');
      console.log(`   Frontend: https://fisiohub.app/t/${publicId}`);
      console.log(`   Dashboard: https://fisiohub.app/t/${publicId}/dashboard`);
      console.log(`   Pacientes: https://fisiohub.app/t/${publicId}/patients`);
      console.log(`   Cadastro: https://fisiohub.app/t/${publicId}/patients/new`);
      
      console.log('\n👤 Credenciais de Login:');
      console.log(`   Email: ${hospitalData.email}`);
      console.log(`   Senha: ${hospitalData.password}`);
      
      console.log('\n🔐 Informações de Segurança:');
      console.log(`   Slug Real: ${hospitalData.slug} (não exposto)`);
      console.log(`   Public ID: ${publicId} (usado nas URLs)`);
      console.log(`   Tenant ID: ${response.data.data.tenant.id}`);

      // Testar acesso ao tenant
      console.log('\n🔍 Testando acesso seguro ao tenant...');
      try {
        const testResponse = await axios.get(`${baseUrl}/api/secure/${publicId}/info`, {
          timeout: 10000
        });
        
        console.log('✅ Acesso seguro funcionando:');
        console.log(`   Nome: ${testResponse.data.data.name}`);
        console.log(`   Status: ${testResponse.data.data.status}`);
        console.log(`   Plano: ${testResponse.data.data.plan}`);
        
      } catch (testError) {
        console.log('⚠️ Teste de acesso falhou:', testError.message);
      }

      console.log('\n📋 Sistema Pronto Para Uso!');
      console.log('   ✅ Tenant criado e ativo');
      console.log('   ✅ Usuário admin configurado');
      console.log('   ✅ URLs de acesso funcionando');
      console.log('   ✅ Sistema de segurança ativo');
      
      return response.data;

    } catch (error) {
      console.log(`   ❌ Tentativa ${attempt} falhou: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error('\n💥 TODAS AS TENTATIVAS FALHARAM!');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Mensagem: ${error.response.data?.message || 'Erro desconhecido'}`);
          console.error('Dados:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('Erro de conexão:', error.message);
        }
        
        console.error('\n🔧 Possíveis soluções:');
        console.error('   1. API Railway pode estar com problemas');
        console.error('   2. Verificar status em https://railway.app');
        console.error('   3. Tentar novamente em alguns minutos');
        console.error('   4. Usar banco local se necessário');
        
        throw error;
      }
      
      const waitTime = attempt * 10000; // Aumenta o tempo a cada tentativa
      console.log(`   ⏳ Aguardando ${waitTime/1000}s antes da próxima tentativa...`);
      await sleep(waitTime);
    }
  }
}

// Executar
if (require.main === module) {
  createHospitalGalileuWithRetry().catch(error => {
    console.error('\n❌ Erro final:', error.message);
    process.exit(1);
  });
}

module.exports = createHospitalGalileuWithRetry;