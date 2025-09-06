// Test frontend patient creation
console.log('Testing frontend patient creation...');

// Simulate the same data structure that would come from the form
const testData = {
  firstName: 'Test',
  lastName: 'Patient',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  diagnosis: 'Test condition',
  bedNumber: 'ICU-003',
  admittingPhysician: 'Dr. Test',
  patientId: 'TEST001',
  contactNumber: '1234567890'
};

console.log('Form data:', testData);

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

// Transform data (copied from frontend logic)
const transformedData = {
  name: `${testData.firstName} ${testData.lastName}`.trim(),
  age: testData.dateOfBirth ? calculateAge(testData.dateOfBirth) : 25,
  gender: testData.gender,
  diagnosis: testData.diagnosis,
  bedNumber: testData.bedNumber,
  attendingPhysician: testData.admittingPhysician,
  patientId: testData.patientId,
  contactNumber: testData.contactNumber
};

console.log('Transformed data:', transformedData);

// Test API call
async function testAPI() {
  try {
    const response = await fetch('https://icu-management-system.vercel.app/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Success! Patient created:', result);
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testAPI();
