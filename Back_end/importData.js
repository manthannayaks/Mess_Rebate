const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { importSampleData, importExcel } = require('./utils/excelParser');
const createExcelTemplate = require('./utils/createExcelTemplate');

// Connect to database
connectDB();

const importData = async () => {
  try {
    console.log('🚀 Starting data import process...\n');
    
    // Create Excel template
    console.log('📝 Creating Excel template...');
    createExcelTemplate();
    
    // Import sample data
    console.log('\n📊 Importing sample data...');
    await importSampleData();
    
    console.log('\n✅ Data import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check the template file: ./data/mess_rebate_template.xlsx');
    console.log('2. Replace sample data with your actual data');
    console.log('3. To import your Excel file, update server.js to call:');
    console.log('   importExcel("./data/your_file.xlsx")');
    console.log('\n🎯 Your application is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
};

// Run the import
importData();
