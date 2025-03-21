const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:8000/api';

// Test data
const testUsers = {
  admin: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  },
  tenantAdmin: {
    name: 'Tenant Admin',
    email: 'tenant.admin@example.com',
    password: 'TenantAdmin@123',
    role: 'tenantAdmin'
  }
};

// Store tokens
let tokens = {};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test registration
const testRegistration = async () => {
  console.log('\n=== Testing Registration ===');

  // Test successful registration
  console.log('\nTesting successful registration:');
  const regResult = await apiCall('post', '/auth/register', testUsers.tenantAdmin);
  console.log(regResult);

  // Test duplicate email
  console.log('\nTesting duplicate email registration:');
  const dupResult = await apiCall('post', '/auth/register', testUsers.tenantAdmin);
  console.log(dupResult);

  // Test invalid password
  console.log('\nTesting invalid password:');
  const invalidPass = await apiCall('post', '/auth/register', {
    ...testUsers.tenantAdmin,
    email: 'new.user@example.com',
    password: '123'
  });
  console.log(invalidPass);
};

// Test login
const testLogin = async () => {
  console.log('\n=== Testing Login ===');

  // Test successful login
  console.log('\nTesting successful login:');
  const loginResult = await apiCall('post', '/auth/login', {
    email: testUsers.tenantAdmin.email,
    password: testUsers.tenantAdmin.password
  });
  console.log(loginResult);

  if (loginResult.success) {
    tokens.tenantAdmin = loginResult.data.data.token;
  }

  // Test invalid credentials
  console.log('\nTesting invalid credentials:');
  const invalidLogin = await apiCall('post', '/auth/login', {
    email: testUsers.tenantAdmin.email,
    password: 'wrongpassword'
  });
  console.log(invalidLogin);

  // Test account locking (after 5 failed attempts)
  console.log('\nTesting account locking:');
  for (let i = 0; i < 5; i++) {
    const failedLogin = await apiCall('post', '/auth/login', {
      email: testUsers.tenantAdmin.email,
      password: 'wrongpassword'
    });
    console.log(`Attempt ${i + 1}:`, failedLogin.error);
  }
};

// Test protected routes
const testProtectedRoutes = async () => {
  console.log('\n=== Testing Protected Routes ===');

  // Test accessing protected route with valid token
  console.log('\nTesting protected route with valid token:');
  const protectedResult = await apiCall('get', '/auth/me', null, tokens.tenantAdmin);
  console.log(protectedResult);

  // Test accessing protected route without token
  console.log('\nTesting protected route without token:');
  const unauthorizedResult = await apiCall('get', '/auth/me');
  console.log(unauthorizedResult);
};

// Run all tests
const runTests = async () => {
  try {
    await testRegistration();
    await testLogin();
    await testProtectedRoutes();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
};

// Instructions for running the tests
console.log(`
=== API Test Instructions ===
1. Make sure your server is running at ${API_URL}
2. Install axios if not already installed:
   npm install axios

To run the tests:
1. Open terminal in the project root directory
2. Run: node test.js

Note: These tests will create actual users in your database.
You may want to clear test users after running the tests.
`);

// Uncomment the following line to run the tests
// runTests();
