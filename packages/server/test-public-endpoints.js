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
    const response = await axios.post(`${BASE_URL}/${procedure}`, input, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data };
    }
    return { success: false, error: error.message };
  }
}

async function testPublicEndpoints() {
  console.log('🧪 Testing Public vs Protected Endpoints\n');

  // Test 1: Public endpoints should work without authentication
  console.log('1️⃣ Testing public endpoints without authentication...');
  
  const marchList = await trpcCall('march.list');
  console.log('march.list:', marchList.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const marchDaysList = await trpcCall('marchDays.list', { marchId: 'test' });
  console.log('marchDays.list:', marchDaysList.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const orgsList = await trpcCall('organizations.list');
  console.log('organizations.list:', orgsList.success ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('');

  // Test 2: Protected endpoints should fail without authentication
  console.log('2️⃣ Testing protected endpoints without authentication...');
  
  const marchersList = await trpcCall('marchers.list');
  console.log('marchers.list:', marchersList.success ? '❌ SHOULD FAIL' : '✅ CORRECTLY FAILED');
  
  const vehiclesList = await trpcCall('vehicles.list');
  console.log('vehicles.list:', vehiclesList.success ? '❌ SHOULD FAIL' : '✅ CORRECTLY FAILED');
  
  const assignmentsList = await trpcCall('assignments.marcherDay');
  console.log('assignments.marcherDay:', assignmentsList.success ? '❌ SHOULD FAIL' : '✅ CORRECTLY FAILED');
  
  console.log('');

  // Test 3: Login and test protected endpoints with authentication
  console.log('3️⃣ Testing protected endpoints with authentication...');
  
  const loginResult = await trpcCall('auth.login', {
    email: 'admin@marchplanner.com',
    password: 'admin123'
  });
  
  if (!loginResult.success) {
    console.log('❌ Login failed:', loginResult.error);
    return;
  }
  
  const token = loginResult.data.result.token;
  console.log('✅ Login successful, got token');
  
  const marchersListAuth = await trpcCall('marchers.list', {}, token);
  console.log('marchers.list (with auth):', marchersListAuth.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const vehiclesListAuth = await trpcCall('vehicles.list', {}, token);
  console.log('vehicles.list (with auth):', vehiclesListAuth.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const assignmentsListAuth = await trpcCall('assignments.marcherDay', {}, token);
  console.log('assignments.marcherDay (with auth):', assignmentsListAuth.success ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('');

  // Test 4: Test organizer+ endpoints with admin role
  console.log('4️⃣ Testing organizer+ endpoints with admin role...');
  
  const marchCreate = await trpcCall('march.create', {
    title: 'Test March',
    description: 'Test description',
    startDate: '2024-06-01',
    endDate: '2024-06-02',
    missionStatement: {
      title: 'Test Mission',
      subtitle: 'Test Subtitle',
      description: 'Test mission description'
    },
    callToAction: {
      title: 'Test CTA',
      description: 'Test CTA description'
    },
    itineraryDescription: 'Test itinerary'
  }, token);
  
  console.log('march.create (admin):', marchCreate.success ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('\n🎉 Public vs Protected endpoint tests completed!');
}

// Run the tests
testPublicEndpoints().catch(console.error); 