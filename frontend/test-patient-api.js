const API_BASE_URL = 'http://localhost:5000/api'

async function testPatientAPI() {
  console.log('Testing patient API...')
  console.log('API_BASE_URL:', API_BASE_URL)
  
  const testData = {
    name: 'John Test',
    age: 35,
    gender: 'male',
    diagnosis: 'Test condition',
    bedNumber: 'ICU-002',
    attendingPhysician: 'Dr. Smith'
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('Success! Patient created:', result)
    
  } catch (error) {
    console.error('Network error:', error)
  }
}

testPatientAPI()
