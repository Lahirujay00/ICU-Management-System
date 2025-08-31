const fetch = require('node-fetch');

async function testDutyStatusUpdate() {
  console.log('🔧 Testing duty status update...');
  
  // Test staff ID from the logs
  const staffId = '68af3c38af230c8087d4c7fb';
  const apiUrl = 'http://localhost:5000/api';
  
  // Test data
  const updateData = {
    isOnDuty: true,
    currentShift: 'morning'
  };
  
  try {
    console.log(`🔧 Calling PUT ${apiUrl}/staff/${staffId}/status`);
    console.log('🔧 Request data:', updateData);
    
    const response = await fetch(`${apiUrl}/staff/${staffId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('🔧 Response status:', response.status);
    console.log('🔧 Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Response not OK:', errorData);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Success! Response data:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

testDutyStatusUpdate();
