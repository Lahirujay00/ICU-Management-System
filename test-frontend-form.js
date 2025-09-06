// Test script to debug patient creation from frontend perspective
console.log('🧪 Testing patient creation from frontend...');

// Environment variable check
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://icu-management-system.vercel.app/api';
console.log('🌐 API Base URL:', API_BASE_URL);

// Simulate form data exactly as frontend would send it
const formData = {
  firstName: 'Test',
  lastName: 'Patient',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  diagnosis: 'Test Diagnosis',
  bedNumber: 'ICU-TEST',
  admittingPhysician: 'Dr. Test',
  patientId: 'TEST-FRONTEND',
  contactNumber: '1234567890'
};

// Calculate age function (copied from frontend)
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
};

// Transform data exactly as frontend does
const transformedData = {
  name: `${formData.firstName} ${formData.lastName}`.trim(),
  age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 25,
  gender: formData.gender,
  diagnosis: formData.diagnosis,
  bedNumber: formData.bedNumber || `BED-${Date.now()}`,
  attendingPhysician: formData.admittingPhysician || 'Not Assigned',
  patientId: formData.patientId || `PAT-${Date.now()}`,
  contactNumber: formData.contactNumber || ''
};

console.log('📝 Original form data:', formData);
console.log('🔄 Transformed data:', transformedData);

// Test API call
async function testFrontendAPI() {
  try {
    console.log('🚀 Making API call to:', `${API_BASE_URL}/patients`);
    
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Success! Patient created:', result);
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('❌ Error message:', error.message);
  }
}

// Run the test
testFrontendAPI();
