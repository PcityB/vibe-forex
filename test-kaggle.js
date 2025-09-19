// Direct test of Kaggle API credentials
const username = 'netszy';
const apiKey = '60a515ec7742c89c180861c1ec823493';

async function testKaggleAuth() {
  console.log('Testing Kaggle API Authentication...');
  console.log(`Username: ${username}`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...`);
  
  try {
    // Test 1: List kernels
    console.log('\n=== Test 1: List Kernels ===');
    const auth = btoa(`${username}:${apiKey}`);
    console.log(`Authorization header: Basic ${auth.substring(0, 20)}...`);
    
    const response = await fetch('https://www.kaggle.com/api/v1/kernels/list', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'Vibe-Forex-Dashboard/1.0'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Found ${data.length || 0} kernels`);
      if (data.length > 0) {
        console.log('Sample kernel:', data[0]);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText}`);
    }
    
    // Test 2: Get user info
    console.log('\n=== Test 2: User Info ===');
    const userResponse = await fetch(`https://www.kaggle.com/api/v1/users/${username}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'Vibe-Forex-Dashboard/1.0'
      }
    });
    
    console.log(`User info status: ${userResponse.status}`);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User found:', userData.displayName || userData.name);
    } else {
      const userError = await userResponse.text();
      console.log(`❌ User lookup failed: ${userError}`);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the test
testKaggleAuth();