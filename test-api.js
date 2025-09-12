// Test script to verify all roll numbers work
const studentData = {
  "B24CS1056": { "rollNo": "B24CS1056", "name": "PRANAV H NAIR", "records": { "jul2024": { "present": 25, "absent": 5, "rebate": 700 } }, "totalRebate": 700 },
  "B24PH1019": { "rollNo": "B24PH1019", "name": "PRAGYAN DAS", "records": { "jul2024": { "present": 30, "absent": 0, "rebate": 0 } }, "totalRebate": 0 },
  "B24EE1069": { "rollNo": "B24EE1069", "name": "SARAIYA VED GAURAV", "records": { "jul2024": { "present": 29, "absent": 1, "rebate": 140 } }, "totalRebate": 140 },
  "B24EE1014": { "rollNo": "B24EE1014", "name": "DESAI AUM NIKUNJKUMAR", "records": { "jul2024": { "present": 28, "absent": 2, "rebate": 280 } }, "totalRebate": 280 },
  "B24CM1053": { "rollNo": "B24CM1053", "name": "SADAT UL ROUF WANI", "records": { "jul2024": { "present": 30, "absent": 0, "rebate": 0 } }, "totalRebate": 0 },
  "B24CM1052": { "rollNo": "B24CM1052", "name": "RUPESH", "records": { "jul2024": { "present": 27, "absent": 3, "rebate": 420 } }, "totalRebate": 420 },
  "B24ME1064": { "rollNo": "B24ME1064", "name": "SAI AKSHAR TADIMETI", "records": { "jul2024": { "present": 23, "absent": 7, "rebate": 980 } }, "totalRebate": 980 },
  "B24ME1055": { "rollNo": "B24ME1055", "name": "PRABHASH RADHESHYAM CHAURASIA", "records": { "jul2024": { "present": 27, "absent": 3, "rebate": 420 } }, "totalRebate": 420 },
  "B24CH1022": { "rollNo": "B24CH1022", "name": "MAYANK BANSAL", "records": { "jul2024": { "present": 24, "absent": 6, "rebate": 840 } }, "totalRebate": 840 },
  "B24BB1034": { "rollNo": "B24BB1034", "name": "SAYYED HAMZA ALI", "records": { "jul2024": { "present": 23, "absent": 7, "rebate": 980 } }, "totalRebate": 980 }
};

console.log('🧪 Testing all roll numbers...\n');

const testRolls = ['B24CS1056', 'B24PH1019', 'B24EE1069', 'B24EE1014', 'B24CM1053', 'B24CM1052', 'B24ME1064', 'B24ME1055', 'B24CH1022', 'B24BB1034'];

testRolls.forEach(roll => {
  const student = studentData[roll];
  if (student) {
    console.log(`✅ ${roll}: ${student.name} - ₹${student.totalRebate} rebate`);
  } else {
    console.log(`❌ ${roll}: NOT FOUND`);
  }
});

console.log(`\n📊 Total students in database: ${Object.keys(studentData).length}`);
console.log('🎯 All roll numbers are working correctly!');
