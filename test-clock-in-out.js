// Test script to verify clock in/out functionality
const fetch = require('node-fetch');

const API_BASE_URL = 'https://icu-management-system.vercel.app/api';

// Test staff ID (from the schedules we saw earlier)
const TEST_STAFF_ID = '68af3c38af230c8087d4c7fb'; // This staff has morning shift today

async function testClockInOut() {
  try {
    console.log('🔧 Testing Clock In/Out Functionality');
    console.log('=====================================');
    
    // First, get the current staff info
    console.log('\n1. Getting current staff info...');
    const staffResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}`);
    const staff = await staffResponse.json();
    
    console.log('Staff Info:', {
      name: `${staff.firstName} ${staff.lastName}`,
      isOnDuty: staff.isOnDuty,
      currentShift: staff.currentShift
    });
    
    // Test Clock In
    console.log('\n2. Testing Clock In...');
    const clockInData = {
      isOnDuty: true,
      currentShift: 'morning'
    };
    
    const clockInResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clockInData)
    });
    
    if (clockInResponse.ok) {
      const clockInResult = await clockInResponse.json();
      console.log('✅ Clock In Successful:', {
        name: `${clockInResult.firstName} ${clockInResult.lastName}`,
        isOnDuty: clockInResult.isOnDuty,
        currentShift: clockInResult.currentShift
      });
    } else {
      const error = await clockInResponse.text();
      console.log('❌ Clock In Failed:', error);
      return;
    }
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test Clock Out
    console.log('\n3. Testing Clock Out...');
    const clockOutData = {
      isOnDuty: false,
      currentShift: 'off'
    };
    
    const clockOutResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clockOutData)
    });
    
    if (clockOutResponse.ok) {
      const clockOutResult = await clockOutResponse.json();
      console.log('✅ Clock Out Successful:', {
        name: `${clockOutResult.firstName} ${clockOutResult.lastName}`,
        isOnDuty: clockOutResult.isOnDuty,
        currentShift: clockOutResult.currentShift
      });
    } else {
      const error = await clockOutResponse.text();
      console.log('❌ Clock Out Failed:', error);
    }
    
    console.log('\n✅ Clock In/Out Test Complete!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testClockInOut();
