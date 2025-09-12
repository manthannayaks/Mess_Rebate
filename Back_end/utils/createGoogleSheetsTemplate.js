const fs = require('fs');

const createGoogleSheetsTemplate = () => {
  // Create CSV template for Google Sheets
  const csvContent = `Roll No,Name,Month,Present Days,Absent Days
B24CM1010,Rajesh Kumar,jun2024,20,5
B24CM1010,Rajesh Kumar,jul2024,22,3
B24CM1010,Rajesh Kumar,aug2024,25,2
B24CM1044,Priya Sharma,jun2024,21,4
B24CM1044,Priya Sharma,jul2024,20,5
B24CM1044,Priya Sharma,aug2024,24,3
B24CS1001,Amit Singh,jun2024,18,7
B24CS1001,Amit Singh,jul2024,19,6
B24CS1001,Amit Singh,aug2024,22,5`;

  // Write CSV file
  fs.writeFileSync('./data/google_sheets_template.csv', csvContent);
  
  console.log('✅ Google Sheets template created: ./data/google_sheets_template.csv');
  console.log('\n📋 Template Format:');
  console.log('Roll No | Name | Month | Present Days | Absent Days');
  console.log('B24CM1010 | Rajesh Kumar | jun2024 | 20 | 5');
  console.log('\n💡 Instructions for Google Sheets:');
  console.log('1. Open Google Sheets');
  console.log('2. Create a new sheet');
  console.log('3. Use the column headers: Roll No, Name, Month, Present Days, Absent Days');
  console.log('4. Add your data month-wise (one row per student per month)');
  console.log('5. Export as CSV: File > Download > Comma-separated values (.csv)');
  console.log('6. Save the CSV file in Back_end/data/ folder');
  console.log('7. Use importGoogleSheets() function to import the data');
  console.log('\n📊 Supported Column Names:');
  console.log('- Roll No: Roll No, RollNo, Roll_No, roll_no');
  console.log('- Name: Name, Student Name, Student_Name');
  console.log('- Month: Month, month (format: jun2024, jul2024, etc.)');
  console.log('- Present Days: Present Days, PresentDays, Present_Days, present_days, Days Present, DaysPresent');
  console.log('- Absent Days: Absent Days, AbsentDays, Absent_Days, absent_days, Days Absent, DaysAbsent');
};

module.exports = createGoogleSheetsTemplate;
