const axios = require('axios');

// Test security features
async function testSecurity() {
  const baseURL = process.env.API_URL || 'https://api.fisiohub.app';
  console.log(`🔒 Testing security features on ${baseURL}`);

  // Test 1: Rate limiting
  console.log('\n1. Testing Rate Limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(axios.get(`${baseURL}/health`));
    }
    
    const results = await Promise.allSettled(promises);
    const rateLimited = results.some(result => 
      result.status === 'rejected' && 
      result.reason.response?.status === 429
    );
    
    if (rateLimited) {
      console.log('✅ Rate limiting is working');
    } else {
      console.log('⚠️ Rate limiting may not be configured properly');
    }
  } catch (error) {
    console.log('❌ Error testing rate limiting:', error.message);
  }

  // Test 2: Security headers
  console.log('\n2. Testing Security Headers...');
  try {
    const response = await axios.get(`${baseURL}/health`);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ Missing header: ${header}`);
      }
    });
    
    if (!headers['x-powered-by']) {
      console.log('✅ X-Powered-By header removed');
    } else {
      console.log('❌ X-Powered-By header exposed');
    }
  } catch (error) {
    console.log('❌ Error testing security headers:', error.message);
  }

  // Test 3: Input validation
  console.log('\n3. Testing Input Validation...');
  try {
    const maliciousInputs = [
      { name: "<script>alert('xss')</script>", slug: "test", email: "test@test.com", password: "test123" },
      { name: "'; DROP TABLE tenants; --", slug: "test", email: "test@test.com", password: "test123" },
      { name: "test", slug: "test", email: "not-an-email", password: "test123" },
      { name: "test", slug: "test", email: "test@test.com", password: "123" } // weak password
    ];
    
    for (const payload of maliciousInputs) {
      try {
        await axios.post(`${baseURL}/api/tenants/register`, payload);
        console.log('❌ Malicious input was accepted:', Object.keys(payload).join(', '));
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Input validation blocked malicious input');
        } else {
          console.log('⚠️ Unexpected error:', error.response?.status);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error testing input validation:', error.message);
  }

  // Test 4: Public ID system
  console.log('\n4. Testing Public ID System...');
  try {
    // Test slug security
    const SlugSecurity = require('../utils/slug-security');
    
    const testSlug = 'hospital-teste-security';
    const publicId = SlugSecurity.generatePublicId(testSlug);
    const isValid = SlugSecurity.isValidPublicId(publicId);
    
    console.log(`✅ Slug "${testSlug}" -> Public ID "${publicId}"`);
    console.log(`✅ Public ID validation: ${isValid}`);
    
    // Test that same slug generates same ID
    const publicId2 = SlugSecurity.generatePublicId(testSlug);
    if (publicId === publicId2) {
      console.log('✅ Deterministic public ID generation');
    } else {
      console.log('❌ Public ID generation is not deterministic');
    }
    
  } catch (error) {
    console.log('❌ Error testing public ID system:', error.message);
  }

  // Test 5: Secure endpoint access
  console.log('\n5. Testing Secure Endpoint Access...');
  try {
    // Test invalid public ID
    try {
      await axios.get(`${baseURL}/api/secure/invalid-id/info`);
      console.log('❌ Invalid public ID was accepted');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid public ID rejected');
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
      }
    }
    
    // Test valid format but non-existent public ID
    try {
      await axios.get(`${baseURL}/api/secure/x1HVX4TgxwLZ/info`);
      console.log('⚠️ Non-existent public ID returned data');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Non-existent public ID returns 404');
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing secure endpoints:', error.message);
  }

  console.log('\n🎉 Security testing completed!');
}

// Run if called directly
if (require.main === module) {
  testSecurity().catch(console.error);
}

module.exports = testSecurity;