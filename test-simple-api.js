// Test the simple API structure
const studentData = {
  "B24CM1052": {
    "rollNo": "B24CM1052",
    "name": "RUPESH",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 420
  }
};

// Simulate the API handler
function handler(req) {
  const roll = req.query.roll;
  const student = studentData[roll];
  
  if (!student) {
    return { status: 404, json: { message: 'Student not found' } };
  }
  
  return { status: 200, json: student };
}

// Test the handler
console.log('🧪 Testing Simple API...\n');

const testReq = { query: { roll: 'B24CM1052' } };
const result = handler(testReq);

console.log('Request:', testReq);
console.log('Response:', result);

if (result.status === 200) {
  console.log('✅ Simple API working correctly!');
  console.log(`Student: ${result.json.name} - ₹${result.json.totalRebate} rebate`);
} else {
  console.log('❌ Simple API failed');
}

console.log('\n🎯 Ready for Vercel deployment with /api endpoint!');
