// Test script for API endpoints with authentication
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing Seraphim Vanguards API...\n');

    // 1. Test login
    console.log('1. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/auth/dev-login`, {
      email: 'admin@seraphim.ai',
      password: 'admin123'
    });
    
    const { data } = loginResponse.data;
    const { token, user } = data;
    console.log('✓ Login successful');
    console.log(`  - User: ${user.email} (${user.role})`);
    console.log(`  - Token: ${token.substring(0, 20)}...`);
    
    // Configure axios with auth token
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n2. Testing authenticated endpoints...\n');
    
    // 2. Test LLM endpoints
    console.log('Testing LLM endpoints:');
    try {
      const llmsResponse = await authAxios.get('/llm');
      console.log(`✓ GET /llm - Status: ${llmsResponse.status}`);
      if (llmsResponse.data.data) {
        console.log(`  - Found ${llmsResponse.data.data.length} LLMs`);
      }
    } catch (error) {
      console.log(`✗ GET /llm - ${error.response?.data?.error || error.message}`);
    }
    
    // 3. Test agent endpoints
    console.log('\nTesting agent endpoints:');
    try {
      const agentsResponse = await authAxios.get('/agents');
      console.log(`✓ GET /agents - Status: ${agentsResponse.status}`);
    } catch (error) {
      console.log(`✗ GET /agents - ${error.response?.data?.error || error.message}`);
    }
    
    // 4. Test workflows
    console.log('\nTesting workflows:');
    try {
      const workflowsResponse = await authAxios.get('/workflows');
      console.log(`✓ GET /workflows - Found ${workflowsResponse.data.length} workflows`);
    } catch (error) {
      console.log(`✗ GET /workflows - ${error.response?.data?.error || error.message}`);
    }
    
    // 5. Test audit logs
    console.log('\nTesting audit logs:');
    try {
      const auditResponse = await authAxios.get('/audit');
      console.log(`✓ GET /audit - Found ${auditResponse.data.logs.length} audit logs`);
    } catch (error) {
      console.log(`✗ GET /audit - ${error.response?.data?.error || error.message}`);
    }
    
    // 6. Test user profile
    console.log('\nTesting user endpoints:');
    try {
      const userResponse = await authAxios.get(`/auth/dev-user/${user.uid}`);
      console.log('✓ GET /auth/dev-user/:uid - User profile retrieved');
      console.log(`  - Email: ${userResponse.data.data.email}`);
      console.log(`  - Role: ${userResponse.data.data.role}`);
    } catch (error) {
      console.log(`✗ GET /auth/dev-user/:uid - ${error.response?.data?.error || error.message}`);
    }
    
    // 7. Test unauthorized access
    console.log('\n3. Testing unauthorized access...');
    try {
      await axios.get(`${API_URL}/llm`);
      console.log('✗ Unauthorized access allowed (this should not happen)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Unauthorized access properly blocked');
      } else {
        console.log(`✗ Unexpected error: ${error.response?.status || error.message}`);
      }
    }
    
    console.log('\n✅ API testing completed!');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAPI();