const xlsx = require('xlsx');

const createExcelTemplate = () => {
  // Sample data for the template
  const templateData = [
    {
      RollNo: 'B24CM1010',
      Name: 'Rajesh Kumar',
      Month: 'jun2024',
      AteDays: 20,
      RebateDays: 5,
      TotalRebate: 700
    },
    {
      RollNo: 'B24CM1010',
      Name: 'Rajesh Kumar',
      Month: 'jul2024',
      AteDays: 22,
      RebateDays: 3,
      TotalRebate: 420
    },
    {
      RollNo: 'B24CM1044',
      Name: 'Priya Sharma',
      Month: 'jun2024',
      AteDays: 21,
      RebateDays: 4,
      TotalRebate: 560
    },
    {
      RollNo: 'B24CM1044',
      Name: 'Priya Sharma',
      Month: 'jul2024',
      AteDays: 20,
      RebateDays: 5,
      TotalRebate: 700
    }
  ];

  // Create a new workbook
  const workbook = xlsx.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = xlsx.utils.json_to_sheet(templateData);
  
  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Mess Rebate Data');
  
  // Write the file
  xlsx.writeFile(workbook, './data/mess_rebate_template.xlsx');
  
  console.log('✅ Excel template created: ./data/mess_rebate_template.xlsx');
  console.log('\n📋 Template Format:');
  console.log('RollNo | Name | Month | AteDays | RebateDays | TotalRebate');
  console.log('B24CM1010 | Rajesh Kumar | jun2024 | 20 | 5 | 700');
  console.log('\n💡 Instructions:');
  console.log('1. Open the template file');
  console.log('2. Replace sample data with your actual data');
  console.log('3. Save the file');
  console.log('4. Use the import function to load data into database');
};

module.exports = createExcelTemplate;
