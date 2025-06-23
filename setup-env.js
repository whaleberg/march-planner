#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up environment variables for Walk App...\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('   If you need to update your Google Maps API key, edit the .env file manually.\n');
} else {
  // Create .env file with template
  const envContent = `# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_LOCAL_STORAGE=true

# Google Maps API Key (required for map functionality)
# Get your API key from: https://console.cloud.google.com/apis/credentials
# Make sure to enable: Maps JavaScript API, Geocoding API, Directions API, and Places API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with template values.');
  console.log('   Please update VITE_GOOGLE_MAPS_API_KEY with your actual Google Maps API key.\n');
}

console.log('📋 Next steps:');
console.log('1. Get a Google Maps API key from: https://console.cloud.google.com/apis/credentials');
console.log('2. Enable these APIs in your Google Cloud Console:');
console.log('   - Maps JavaScript API');
console.log('   - Geocoding API');
console.log('   - Directions API');
console.log('   - Places API');
console.log('3. Update VITE_GOOGLE_MAPS_API_KEY in your .env file');
console.log('4. Run "npm run dev" to start the development server\n');

console.log('🔗 Helpful links:');
console.log('- Google Maps API Setup: https://developers.google.com/maps/documentation/javascript/get-api-key');
console.log('- API Restrictions: https://developers.google.com/maps/documentation/javascript/restrict-api-key'); 