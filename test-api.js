// Simple test script for the patient API
const axios = require('axios');

async function testPatientAPI() {
  try {
    console.log('🧪 Testing Patient API...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test get all patients
    console.log('\n2. Testing get all patients...');
    const patientsResponse = await axios.get('http://localhost:5000/api/patients');
    console.log('✅ Get patients:', patientsResponse.data.length, 'patients found');
    
    // Test create patient
    console.log('\n3. Testing create patient...');
    const testPatient = {
      name: 'Test Patient',
      age: 45,
      gender: 'male',
      bedNumber: 'ICU-Test-001',
      diagnosis: 'Test diagnosis',
      attendingPhysician: 'Dr. Test',
      patientId: 'TEST-' + Date.now(),
      emergencyContact: 'Test Contact: 123-456-7890'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/patients', testPatient);
    console.log('✅ Create patient successful:', createResponse.data);
    
    console.log('\n🎉 All tests passed! Patient API is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testPatientAPI();
