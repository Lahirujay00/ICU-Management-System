// Test script to verify the absent marking and status display fixes
console.log('🔧 Testing Absent Marking and Status Display');
console.log('============================================');

// Test 1: Date calculations for absent marking
console.log('\n1. Testing Date Calculations for Absent Marking:');

// Simulating getColomboTimeAsDate function
const getColomboTimeAsDate = () => {
  const now = new Date()
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const colomboTime = new Date(utcTime + (5.5 * 3600000)) // UTC+5:30
  return colomboTime
}

const now = getColomboTimeAsDate()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const dateKey = today.toDateString()
const isoDateKey = today.toISOString().split('T')[0]

console.log('Current Colombo Time:', now);
console.log('Today Date Object:', today);
console.log('Date Key (toDateString):', dateKey);
console.log('ISO Date Key:', isoDateKey);

// Test 2: Schedule key generation
const staffId = '68af3c38af230c8087d4c7fb'
const staffScheduleKey = `staff_schedule_${staffId}`
console.log('Staff Schedule Key:', staffScheduleKey);

// Test 3: Status display logic
console.log('\n2. Testing Status Display Logic:');

// Simulate different staff states
const testCases = [
  { isOnDuty: true, currentShift: 'morning', description: 'Staff on duty with morning shift' },
  { isOnDuty: false, currentShift: 'off', description: 'Staff off duty' },
  { isOnDuty: false, currentShift: 'absent', description: 'Staff marked as absent' }
]

testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}: ${testCase.description}`);
  console.log('- isOnDuty:', testCase.isOnDuty);
  console.log('- currentShift:', testCase.currentShift);
  
  // Status display logic (simplified)
  let statusDisplay, statusColor;
  
  if (testCase.currentShift === 'absent') {
    statusDisplay = '● ABSENT'
    statusColor = 'text-orange-500'
  } else if (testCase.isOnDuty) {
    statusDisplay = '● ACTIVE'
    statusColor = 'text-green-500'
  } else {
    statusDisplay = '● OFF DUTY'
    statusColor = 'text-gray-500'
  }
  
  console.log(`- Status Display: ${statusDisplay}`);
  console.log(`- Status Color: ${statusColor}`);
});

console.log('\n✅ Test Complete!');
