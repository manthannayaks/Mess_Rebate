const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const { importSampleData, importExcel, importCSV, importGoogleSheets } = require("./utils/excelParser");

const app = express();

// Connect to MongoDB
// connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);

// Data import options - uncomment the one you want to use:

// Option 1: Import sample data (default)
// importSampleData();

// Option 2: Import from Excel file (uncomment and update path)
// importExcel("./data/your_mess_data.xlsx");

// Option 3: Import from Google Sheets CSV export (uncomment and update path)
// importGoogleSheets("./data/google_sheets_export.csv");
// importGoogleSheets("./data/August_2025.csv");

// Option 4: Import from CSV file (uncomment and update path)
importCSV("./data/August_2025_Mess.csv");

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Data Import Options:`);
  console.log(`1. Sample data is loaded by default`);
  console.log(`2. Excel: importExcel("./data/your_file.xlsx")`);
  console.log(`3. Google Sheets: importGoogleSheets("./data/your_file.csv")`);
  console.log(`4. CSV: importCSV("./data/your_file.csv")`);
  console.log(`\n📋 Google Sheets Format:`);
  console.log(`Roll No | Name | Month | Present Days | Absent Days`);
  console.log(`\n💡 To use Google Sheets:`);
  console.log(`1. Create template: node utils/createGoogleSheetsTemplate.js`);
  console.log(`2. Export your Google Sheets as CSV`);
  console.log(`3. Update server.js to call importGoogleSheets()`);
});