// Test script to verify absent marking functionality
console.log('🔧 Testing Absent Marking Functionality');
console.log('=====================================');

// Helper function to get Colombo time (matching frontend)
const getColomboTimeAsDate = () => {
  const now = new Date()
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const colomboTime = new Date(utcTime + (5.5 * 3600000)) // UTC+5:30
  return colomboTime
}

const testStaffId = '68af3c38af230c8087d4c7fb'

console.log('\n1. Current Colombo Time:', getColomboTimeAsDate().toString());

const colomboTime = getColomboTimeAsDate()
const dateKey = colomboTime.toDateString()
const isoDateKey = colomboTime.toISOString().split('T')[0]

console.log('\n2. Date Keys:');
console.log('   dateKey:', dateKey);
console.log('   isoDateKey:', isoDateKey);

// Simulate marking as absent
console.log('\n3. Simulating absent marking...');
const staffScheduleKey = `staff_schedule_${testStaffId}`

// Get existing schedule
const existingSchedule = JSON.parse(localStorage?.getItem?.(staffScheduleKey) || '{}')
console.log('   Existing schedule:', existingSchedule);

// Add absent status
existingSchedule[isoDateKey] = 'absent'
existingSchedule[dateKey] = 'absent'

console.log('   Updated schedule:', existingSchedule);

// This would normally save to localStorage
// localStorage.setItem(staffScheduleKey, JSON.stringify(existingSchedule))

console.log('\n4. Testing date matching logic...');
console.log('   Looking for absent status on:', dateKey);
console.log('   Found in schedule:', existingSchedule[dateKey] || existingSchedule[isoDateKey] || 'Not found');

console.log('\n✅ Test Complete!');
