const fetch = require('node-fetch');

async function testServer() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing server endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Response:`, healthData);
    }
    
    // Test march data endpoint
    console.log('\n2. Testing march data endpoint...');
    const dataResponse = await fetch(`${baseUrl}/api/march-data`);
    console.log(`   Status: ${dataResponse.status}`);
    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log(`   Data loaded: ${data.title}`);
      console.log(`   Days: ${data.days.length}`);
    } else {
      const error = await dataResponse.text();
      console.log(`   Error: ${error}`);
    }
    
    // Test JSON file serving
    console.log('\n3. Testing JSON file serving...');
    const fileResponse = await fetch(`${baseUrl}/data/philadelphia-to-dc-march.json`);
    console.log(`   Status: ${fileResponse.status}`);
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      console.log(`   File loaded: ${fileData.title}`);
      console.log(`   Days: ${fileData.days.length}`);
    } else {
      const error = await fileResponse.text();
      console.log(`   Error: ${error}`);
    }
    
  } catch (error) {
    console.error('Error testing server:', error.message);
  }
}

testServer(); 