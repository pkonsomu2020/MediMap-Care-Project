// Test script to verify Google Places API integration
const fetch = require('node-fetch');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1/places';

async function testGooglePlacesAPI() {
  console.log('🧪 Testing Google Places API Integration...\n');

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    console.error('❌ GOOGLE_MAPS_API_KEY environment variable is not set.');
    console.log('Please set it in your .env file or run: GOOGLE_MAPS_API_KEY=your_key node test-google-places.js');
    return;
  }

  try {
    // Test 1: Search for nearby hospitals in Nairobi
    console.log('📍 Testing nearby search for hospitals in Nairobi...');
    const response = await fetch(`${BASE_URL}:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.id,places.types'
      },
      body: JSON.stringify({
        includedTypes: ['hospital'],
        maxResultCount: 5,
        locationRestriction: {
          circle: {
            center: { latitude: -1.2921, longitude: 36.8219 }, // Nairobi coordinates
            radius: 5000 // 5km radius
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched nearby hospitals:');
    console.log(`Found ${data.places?.length || 0} hospitals\n`);

    if (data.places && data.places.length > 0) {
      data.places.forEach((place, index) => {
        console.log(`${index + 1}. ${place.displayName?.text || 'Unknown'}`);
        console.log(`   Address: ${place.formattedAddress || 'N/A'}`);
        console.log(`   Rating: ${place.rating || 'N/A'}`);
        console.log(`   Status: ${place.businessStatus || 'N/A'}`);
        console.log(`   Place ID: ${place.id || 'N/A'}\n`);
      });
    }

    console.log('🎉 Google Places API integration test completed successfully!');
    console.log('💡 You can now use the /api/places/nearby endpoint in your application.');

  } catch (error) {
    console.error('❌ Error testing Google Places API:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Google Maps API key is correct');
    console.log('2. Ensure Places API is enabled in Google Cloud Console');
    console.log('3. Check API quotas and billing');
    console.log('4. Verify network connectivity');
  }
}

// Run the test
testGooglePlacesAPI();
