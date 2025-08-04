const axios = require('axios');

const API_URL = 'http://localhost:3001/api/auth';

async function testAuth() {
  console.log('Testing Development Authentication...\n');

  try {
    // Test 1: Login with pre-configured admin user
    console.log('1. Testing login with admin user...');
    const loginResponse = await axios.post(`${API_URL}/dev-login`, {
      email: 'admin@seraphim.ai',
      password: 'admin123'
    });
    console.log('✓ Login successful:', {
      email: loginResponse.data.data.user.email,
      role: loginResponse.data.data.user.role,
      token: loginResponse.data.data.token.substring(0, 20) + '...'
    });

    // Test 2: Register a new user
    console.log('\n2. Testing user registration...');
    const testEmail = `test${Date.now()}@seraphim.ai`;
    const registerResponse = await axios.post(`${API_URL}/dev-register`, {
      email: testEmail,
      password: 'test123',
      displayName: 'Test User'
    });
    console.log('✓ Registration successful:', {
      email: registerResponse.data.data.user.email,
      displayName: registerResponse.data.data.user.displayName
    });

    // Test 3: Login with the new user
    console.log('\n3. Testing login with new user...');
    const newUserLogin = await axios.post(`${API_URL}/dev-login`, {
      email: testEmail,
      password: 'test123'
    });
    console.log('✓ New user login successful');

    // Test 4: Get user info
    console.log('\n4. Testing get user info...');
    const userInfo = await axios.get(`${API_URL}/dev-user/${registerResponse.data.data.user.uid}`);
    console.log('✓ User info retrieved:', userInfo.data.data);

    // Test 5: List all users
    console.log('\n5. Testing list all users...');
    const allUsers = await axios.get(`${API_URL}/dev-users`);
    console.log('✓ Users list retrieved, count:', allUsers.data.data.length);

    // Test 6: Invalid login
    console.log('\n6. Testing invalid login...');
    try {
      await axios.post(`${API_URL}/dev-login`, {
        email: 'invalid@seraphim.ai',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✓ Invalid login correctly rejected:', error.response.data.error);
    }

    console.log('\n✅ All authentication tests passed!');
    console.log('\nYou can now use these credentials to test the frontend:');
    console.log('- Admin: admin@seraphim.ai / admin123');
    console.log('- User: user@seraphim.ai / admin123');
    console.log(`- Test User: ${testEmail} / test123`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAuth();