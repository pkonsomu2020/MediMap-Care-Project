// Simple script to check .env file format
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('=== Checking .env file ===');
console.log('File path:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('\n=== File content ===');
  console.log('Raw content:', JSON.stringify(content));
  console.log('\n=== Parsed lines ===');
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    console.log(`Line ${index + 1}:`, JSON.stringify(line));
    if (line.includes('VITE_GOOGLE_MAPS_API_KEY')) {
      console.log('  ^ Found VITE_GOOGLE_MAPS_API_KEY on this line');
    }
  });
  
  console.log('\n=== Recommendations ===');
  console.log('Make sure your .env file contains exactly:');
  console.log('VITE_GOOGLE_MAPS_API_KEY=AIzaSyBYAGRvFQvkZGFgyShJfyMyOkPOL9cxVEE');
  console.log('VITE_API_BASE_URL=http://localhost:8001/api');
  console.log('\nWith:');
  console.log('- No spaces around =');
  console.log('- No quotes around values');
  console.log('- Each variable on its own line');
  console.log('- No empty lines at the top');
}
