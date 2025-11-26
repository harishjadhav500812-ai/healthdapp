import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

console.log('========================================');
console.log('  HealthChain Backend Test Script');
console.log('========================================\n');

// Test 1: Health Check
async function testHealthCheck() {
  console.log('Test 1: Health Check');
  console.log('---------------------');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    if (data.success) {
      console.log('✅ PASSED - Backend is running');
      console.log(`   Status: ${data.message}`);
      console.log(`   Uptime: ${Math.floor(data.uptime)}s\n`);
      return true;
    } else {
      console.log('❌ FAILED - Unexpected response\n');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED - Cannot connect to backend');
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure backend is running on ${API_URL}\n`);
    return false;
  }
}

// Test 2: Signup
async function testSignup() {
  console.log('Test 2: User Signup');
  console.log('-------------------');

  const testUser = {
    name: 'Test Patient',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'PATIENT',
    age: 30
  };

  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ PASSED - User signup successful');
      console.log(`   User ID: ${data.user._id}`);
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...\n`);
      return { success: true, token: data.token, userId: data.user._id };
    } else {
      console.log('❌ FAILED - Signup failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}\n`);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ FAILED - Signup error');
    console.log(`   Error: ${error.message}\n`);
    return { success: false };
  }
}

// Test 3: Login
async function testLogin(email, password) {
  console.log('Test 3: User Login');
  console.log('------------------');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ PASSED - Login successful');
      console.log(`   User ID: ${data.user._id}`);
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...\n`);
      return { success: true, token: data.token };
    } else {
      console.log('❌ FAILED - Login failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}\n`);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ FAILED - Login error');
    console.log(`   Error: ${error.message}\n`);
    return { success: false };
  }
}

// Test 4: Get Current User
async function testGetMe(token) {
  console.log('Test 4: Get Current User');
  console.log('------------------------');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ PASSED - Retrieved user data');
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}\n`);
      return true;
    } else {
      console.log('❌ FAILED - Could not get user data');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}\n`);
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED - Get user error');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting backend tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  const healthCheck = await testHealthCheck();
  if (healthCheck) passed++; else failed++;

  if (!healthCheck) {
    console.log('========================================');
    console.log('Cannot proceed - Backend is not running');
    console.log('Please start the backend server first:');
    console.log('  cd backend');
    console.log('  npm run dev');
    console.log('========================================\n');
    return;
  }

  // Test 2: Signup
  const signupResult = await testSignup();
  if (signupResult.success) passed++; else failed++;

  if (!signupResult.success) {
    console.log('Skipping remaining tests...\n');
  } else {
    // Use the created user for login test
    const testEmail = signupResult.email || `test${Date.now()}@example.com`;

    // Test 3: Login (create another user first)
    const loginUser = {
      name: 'Login Test User',
      email: `login${Date.now()}@example.com`,
      password: 'password123',
      role: 'DOCTOR',
      licenseId: 'MD-12345',
      specialization: 'General Practitioner'
    };

    const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginUser),
    });

    if (signupResponse.ok) {
      const loginResult = await testLogin(loginUser.email, loginUser.password);
      if (loginResult.success) passed++; else failed++;

      // Test 4: Get Current User
      if (loginResult.success) {
        const getMeResult = await testGetMe(loginResult.token);
        if (getMeResult) passed++; else failed++;
      } else {
        console.log('Test 4: Skipped (login failed)\n');
        failed++;
      }
    } else {
      console.log('Test 3: Skipped (could not create test user)\n');
      console.log('Test 4: Skipped\n');
      failed += 2;
    }
  }

  // Summary
  console.log('========================================');
  console.log('  Test Summary');
  console.log('========================================');
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! Backend is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
