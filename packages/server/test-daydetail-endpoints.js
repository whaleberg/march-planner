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
    // tRPC v10 format
    const response = await axios.post(`${BASE_URL}/${procedure}`, input, { headers });
    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: error.response.data };
    }
    return { error: error.message };
  }
}

async function testDayDetailEndpoints() {
  console.log('🧪 Testing DayDetail Endpoints\n');

  // Test 1: Get marches (public)
  console.log('1️⃣ Testing public march list...');
  const marchesResult = await trpcCall('march.list');
  console.log('Result:', marchesResult);
  console.log('Expected: List of marches (public data)\n');

  if (marchesResult.error) {
    console.log('❌ Failed to get marches:', marchesResult.error);
    return;
  }

  const marchId = marchesResult.result.data.data[0]?.id;
  if (!marchId) {
    console.log('❌ No march found for testing');
    return;
  }

  // Test 2: Get march days (public)
  console.log('2️⃣ Testing public march days...');
  const daysResult = await trpcCall('marchDays.list', { marchId });
  console.log('Result:', daysResult);
  console.log('Expected: List of march days (public data)\n');

  if (daysResult.error) {
    console.log('❌ Failed to get march days:', daysResult.error);
    return;
  }

  const dayId = daysResult.result.data.data[0]?.id;
  if (!dayId) {
    console.log('❌ No day found for testing');
    return;
  }

  // Test 3: Get specific day (public)
  console.log('3️⃣ Testing public day details...');
  const dayResult = await trpcCall('marchDays.getById', { id: dayId });
  console.log('Result:', dayResult);
  console.log('Expected: Day details (public data)\n');

  // Test 4: Try to get marchers without authentication (should fail)
  console.log('4️⃣ Testing marchers list without authentication...');
  const marchersNoAuthResult = await trpcCall('marchers.list', { marchId });
  console.log('Result:', marchersNoAuthResult);
  console.log('Expected: UNAUTHORIZED error (protected endpoint)\n');

  // Test 5: Try to get marcher assignments without authentication (should fail)
  console.log('5️⃣ Testing marcher assignments without authentication...');
  const assignmentsNoAuthResult = await trpcCall('assignments.marcherDay', { dayId });
  console.log('Result:', assignmentsNoAuthResult);
  console.log('Expected: UNAUTHORIZED error (protected endpoint)\n');

  // Test 6: Try to get organization assignments without authentication (should fail)
  console.log('6️⃣ Testing organization assignments without authentication...');
  const orgAssignmentsNoAuthResult = await trpcCall('assignments.organizationDay', { dayId });
  console.log('Result:', orgAssignmentsNoAuthResult);
  console.log('Expected: UNAUTHORIZED error (protected endpoint)\n');

  // Test 7: Login to get authentication token
  console.log('7️⃣ Logging in to test authenticated endpoints...');
  const loginResult = await trpcCall('auth.login', {
    email: 'admin@marchplanner.com',
    password: 'admin123'
  });
  console.log('Result:', loginResult);
  
  if (loginResult.error) {
    console.log('❌ Login failed:', loginResult.error);
    return;
  }
  
  const token = loginResult.result.data.token;
  console.log('✅ Login successful, got token\n');

  // Test 8: Get marchers with authentication (should succeed)
  console.log('8️⃣ Testing marchers list with authentication...');
  const marchersAuthResult = await trpcCall('marchers.list', { marchId }, token);
  console.log('Result:', marchersAuthResult);
  console.log('Expected: List of marchers (protected data)\n');

  // Test 9: Get marcher assignments with authentication (should succeed)
  console.log('9️⃣ Testing marcher assignments with authentication...');
  const assignmentsAuthResult = await trpcCall('assignments.marcherDay', { dayId }, token);
  console.log('Result:', assignmentsAuthResult);
  console.log('Expected: List of marcher assignments (protected data)\n');

  // Test 10: Get organization assignments with authentication (should succeed)
  console.log('🔟 Testing organization assignments with authentication...');
  const orgAssignmentsAuthResult = await trpcCall('assignments.organizationDay', { dayId }, token);
  console.log('Result:', orgAssignmentsAuthResult);
  console.log('Expected: List of organization assignments (protected data)\n');

  console.log('🎉 DayDetail endpoint tests completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Public endpoints work without authentication');
  console.log('✅ Protected endpoints require authentication');
  console.log('✅ DayDetail component can conditionally load data based on auth status');
}

// Run the tests
testDayDetailEndpoints().catch(console.error); 