const axios = require('axios');
const SlugSecurity = require('../utils/slug-security');

async function createHospitalGalileu() {
  console.log('🏥 Criando Hospital Galileu...\n');

  // Dados do Hospital Galileu
  const hospitalData = {
    name: 'Hospital Galileu',
    slug: 'hospital-galileu',
    email: 'admin@hospitalgalileu.com.br',
    password: 'Galileu2025!@#',
    plan: 'professional'
  };

  // Gerar publicId para referência
  const publicId = SlugSecurity.generatePublicId(hospitalData.slug);
  
  console.log('📋 Dados do Hospital:');
  console.log(`   Nome: ${hospitalData.name}`);
  console.log(`   Slug: ${hospitalData.slug}`);
  console.log(`   Email: ${hospitalData.email}`);
  console.log(`   Public ID: ${publicId}`);
  console.log(`   Senha: ${hospitalData.password.replace(/./g, '*')}`);
  console.log('');

  try {
    // URL da API (tenta produção primeiro, depois local)
    const apiUrls = [
      'https://api.fisiohub.app',
      'http://localhost:3001'
    ];

    let response;
    let usedUrl;

    for (const url of apiUrls) {
      try {
        console.log(`🔄 Tentando registrar em: ${url}`);
        
        response = await axios.post(`${url}/api/tenants/register`, hospitalData, {
          timeout: 30000, // Aumentar timeout para Railway wake up
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'FisioHub-Setup-Script/1.0'
          },
          maxRedirects: 5,
          retries: 3
        });
        
        usedUrl = url;
        break;
      } catch (error) {
        console.log(`   ❌ Falhou em ${url}: ${error.message}`);
        continue;
      }
    }

    if (!response) {
      throw new Error('Não foi possível conectar a nenhuma API');
    }

    console.log(`\n✅ Hospital Galileu criado com sucesso em: ${usedUrl}\n`);
    console.log('📊 Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));

    // Informações importantes para o usuário
    console.log('\n🎉 HOSPITAL GALILEU CRIADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔗 URLs de Acesso:');
    console.log(`   Frontend: https://fisiohub.app/t/${publicId}`);
    console.log(`   Dashboard: https://fisiohub.app/t/${publicId}/dashboard`);
    console.log(`   Pacientes: https://fisiohub.app/t/${publicId}/patients`);
    
    console.log('\n👤 Credenciais de Acesso:');
    console.log(`   Email: ${hospitalData.email}`);
    console.log(`   Senha: ${hospitalData.password}`);
    
    console.log('\n🔐 Informações de Segurança:');
    console.log(`   Slug Real: ${hospitalData.slug} (não exposto na URL)`);
    console.log(`   Public ID: ${publicId} (usado na URL)`);
    console.log(`   Tenant ID: ${response.data.data.tenant.id}`);

    console.log('\n📋 Próximos Passos:');
    console.log('   1. Acessar o sistema com as credenciais acima');
    console.log('   2. Cadastrar os primeiros pacientes');
    console.log('   3. Testar funcionalidades de transferência');
    console.log('   4. Configurar dados específicos do hospital');

    console.log('\n🛡️ Segurança Implementada:');
    console.log('   ✅ URL criptografada (publicId)');
    console.log('   ✅ Rate limiting ativo');
    console.log('   ✅ Headers de segurança');
    console.log('   ✅ Validação rigorosa de inputs');
    console.log('   ✅ Senha forte obrigatória');

  } catch (error) {
    console.error('\n❌ ERRO ao criar Hospital Galileu:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Mensagem: ${error.response.data.message || 'Erro desconhecido'}`);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Erro de conexão - API não respondeu');
      console.error('Verifique se o backend está rodando');
    } else {
      console.error('Erro:', error.message);
    }

    console.error('\n🔧 Soluções possíveis:');
    console.error('   1. Verificar se o backend está online');
    console.error('   2. Verificar conexão com a internet');
    console.error('   3. Verificar se o banco de dados está funcionando');
    console.error('   4. Rodar localmente: cd backend && node index.js');
  }
}

// Função para testar o acesso ao tenant criado
async function testTenantAccess(publicId) {
  console.log('\n🔍 Testando acesso ao tenant...');
  
  try {
    const response = await axios.get(`https://api.fisiohub.app/api/secure/${publicId}/info`);
    
    console.log('✅ Acesso ao tenant funcionando:');
    console.log(`   Nome: ${response.data.data.name}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Plano: ${response.data.data.plan}`);
    console.log(`   Ativo: ${response.data.data.isActive}`);
    
  } catch (error) {
    console.error('❌ Erro ao testar acesso ao tenant:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Mensagem: ${error.response?.data?.message}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createHospitalGalileu().then(async () => {
    const publicId = SlugSecurity.generatePublicId('hospital-galileu');
    await testTenantAccess(publicId);
  }).catch(console.error);
}

module.exports = { createHospitalGalileu, testTenantAccess };