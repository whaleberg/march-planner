const axios = require('axios');

const BASE_URL = 'http://localhost:3001/trpc';

// Helper function to make tRPC calls
async function trpcCall(procedure, input = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.post(BASE_URL, {
      json: {
        procedure,
        input,
      }
    }, { headers });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: error.response.data };
    }
    return { error: error.message };
  }
}

async function testAuthentication() {
  console.log('🧪 Testing Authentication System\n');

  // Test 1: Try to access protected endpoint without token
  console.log('1️⃣ Testing protected endpoint without authentication...');
  const noAuthResult = await trpcCall('greeting');
  console.log('Result:', noAuthResult);
  console.log('Expected: UNAUTHORIZED error\n');

  // Test 2: Register a new user
  console.log('2️⃣ Registering a new user...');
  const registerResult = await trpcCall('auth.register', {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'volunteer'
  });
  console.log('Result:', registerResult);
  console.log('Expected: User registered successfully\n');

  // Test 3: Login with the new user
  console.log('3️⃣ Logging in with the new user...');
  const loginResult = await trpcCall('auth.login', {
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('Result:', loginResult);
  
  if (loginResult.error) {
    console.log('❌ Login failed:', loginResult.error);
    return;
  }
  
  const token = loginResult.result.data.token;
  console.log('✅ Login successful, got token\n');

  // Test 4: Access protected endpoint with token
  console.log('4️⃣ Testing protected endpoint with authentication...');
  const authResult = await trpcCall('greeting', {}, token);
  console.log('Result:', authResult);
  console.log('Expected: "hello tRPC v10! You are authenticated!"\n');

  // Test 5: Get user profile
  console.log('5️⃣ Getting user profile...');
  const profileResult = await trpcCall('auth.me', {}, token);
  console.log('Result:', profileResult);
  console.log('Expected: User profile data\n');

  // Test 6: Try to access admin-only endpoint with volunteer role
  console.log('6️⃣ Testing admin endpoint with volunteer role...');
  const adminResult = await trpcCall('auth.listUsers', {}, token);
  console.log('Result:', adminResult);
  console.log('Expected: FORBIDDEN error (volunteer cannot access admin endpoint)\n');

  // Test 7: Login as admin
  console.log('7️⃣ Logging in as admin...');
  const adminLoginResult = await trpcCall('auth.login', {
    email: 'admin@marchplanner.com',
    password: 'admin123'
  });
  console.log('Result:', adminLoginResult);
  
  if (adminLoginResult.error) {
    console.log('❌ Admin login failed:', adminLoginResult.error);
    return;
  }
  
  const adminToken = adminLoginResult.result.data.token;
  console.log('✅ Admin login successful\n');

  // Test 8: Access admin endpoint with admin token
  console.log('8️⃣ Testing admin endpoint with admin role...');
  const adminListResult = await trpcCall('auth.listUsers', {}, adminToken);
  console.log('Result:', adminListResult);
  console.log('Expected: List of all users\n');

  console.log('🎉 Authentication tests completed!');
}

// Run the tests
testAuthentication().catch(console.error); 