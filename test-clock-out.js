// Test script to verify clock out functionality and absent marking
const fetch = require('node-fetch');

const API_BASE_URL = 'https://icu-management-system.vercel.app/api';
const TEST_STAFF_ID = '68af3c38af230c8087d4c7fb'; // Staff with morning shift today

async function testClockOut() {
  try {
    console.log('🔧 Testing Clock Out and Absent Marking');
    console.log('=======================================');
    
    // Step 1: Get current staff info
    console.log('\n1. Getting current staff info...');
    const staffResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}`);
    const staff = await staffResponse.json();
    
    console.log('Current Staff Status:', {
      name: `${staff.firstName} ${staff.lastName}`,
      isOnDuty: staff.isOnDuty,
      currentShift: staff.currentShift
    });
    
    // Step 2: Clock In first (if not already on duty)
    if (!staff.isOnDuty) {
      console.log('\n2. Clocking in first...');
      const clockInData = { isOnDuty: true, currentShift: 'morning' };
      
      const clockInResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clockInData)
      });
      
      if (clockInResponse.ok) {
        const result = await clockInResponse.json();
        console.log('✅ Clock In Successful:', {
          isOnDuty: result.isOnDuty,
          currentShift: result.currentShift
        });
      } else {
        console.log('❌ Clock In Failed');
        return;
      }
    }
    
    // Step 3: Clock Out
    console.log('\n3. Testing Clock Out...');
    const clockOutData = { isOnDuty: false, currentShift: 'off' };
    
    const clockOutResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clockOutData)
    });
    
    if (clockOutResponse.ok) {
      const result = await clockOutResponse.json();
      console.log('✅ Clock Out Successful:', {
        name: `${result.firstName} ${result.lastName}`,
        isOnDuty: result.isOnDuty,
        currentShift: result.currentShift
      });
      
      // Step 4: Verify the status
      console.log('\n4. Verifying final status...');
      const finalStatusResponse = await fetch(`${API_BASE_URL}/staff/${TEST_STAFF_ID}`);
      const finalStatus = await finalStatusResponse.json();
      
      console.log('Final Status:', {
        isOnDuty: finalStatus.isOnDuty,
        currentShift: finalStatus.currentShift,
        expectedStatus: 'Should be false (off duty)'
      });
      
      if (finalStatus.isOnDuty === false && finalStatus.currentShift === 'off') {
        console.log('✅ Status correctly updated to OFF DUTY');
      } else {
        console.log('❌ Status not correctly updated');
      }
      
    } else {
      const error = await clockOutResponse.text();
      console.log('❌ Clock Out Failed:', error);
    }
    
    console.log('\n✅ Clock Out Test Complete!');
    console.log('Note: Absent marking in localStorage would be handled by the frontend.');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testClockOut();
