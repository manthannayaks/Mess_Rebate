# Excel Import Guide - Mess Rebate Tracker

## 📊 How to Import Data from Excel Sheets

Your application supports importing student rebate data from Excel files. Here's how to do it:

## 🎯 Excel File Format

Your Excel file should have the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| **RollNo** | Student's roll number | B24CM1010 |
| **Name** | Student's full name | Rajesh Kumar |
| **Month** | Month in format | jun2024, jul2024, aug2024, etc. |
| **AteDays** | Days student ate in mess | 20 |
| **RebateDays** | Days student was absent | 5 |
| **TotalRebate** | Calculated rebate amount | 700 |

## 📝 Step-by-Step Process

### Step 1: Create Excel Template
```bash
cd Back_end
node utils/createExcelTemplate.js
```
This creates a template file at `./data/mess_rebate_template.xlsx`

### Step 2: Prepare Your Data
1. Open the template file
2. Replace sample data with your actual student data
3. Add rows for each student and each month
4. Save the file

### Step 3: Import Your Data
Update `server.js` to import your Excel file:

```javascript
// Comment out the sample data import
// importSampleData();

// Uncomment and update the Excel import
importExcel("./data/your_mess_data.xlsx");
```

### Step 4: Restart the Server
```bash
npm start
```

## 📋 Example Excel Data

| RollNo | Name | Month | AteDays | RebateDays | TotalRebate |
|--------|------|-------|---------|------------|-------------|
| B24CM1010 | Rajesh Kumar | jun2024 | 20 | 5 | 700 |
| B24CM1010 | Rajesh Kumar | jul2024 | 22 | 3 | 420 |
| B24CM1010 | Rajesh Kumar | aug2024 | 25 | 2 | 280 |
| B24CM1044 | Priya Sharma | jun2024 | 21 | 4 | 560 |
| B24CM1044 | Priya Sharma | jul2024 | 20 | 5 | 700 |

## 🔧 Multiple Import Methods

### Method 1: Direct Import (Recommended)
1. Place your Excel file in `Back_end/data/` folder
2. Update `server.js` to call `importExcel("./data/your_file.xlsx")`
3. Restart the server

### Method 2: Using Import Script
```bash
cd Back_end
node importData.js
```

### Method 3: Programmatic Import
```javascript
const { importExcel } = require('./utils/excelParser');
await importExcel('./data/your_file.xlsx');
```

## ⚠️ Important Notes

1. **File Format**: Use `.xlsx` format (Excel 2007+)
2. **Column Names**: Must match exactly (case-sensitive)
3. **Month Format**: Use lowercase with year (e.g., `jun2024`, `jul2024`)
4. **Data Validation**: Ensure numeric values for AteDays, RebateDays, TotalRebate
5. **Duplicate Handling**: The system will update existing records or create new ones

## 🚨 Troubleshooting

### Common Issues:

1. **"Cannot read Excel file"**
   - Check file path is correct
   - Ensure file is in `.xlsx` format
   - Verify file is not corrupted

2. **"Column not found"**
   - Check column names match exactly
   - Ensure no extra spaces in column names

3. **"Invalid data type"**
   - Verify AteDays, RebateDays, TotalRebate are numbers
   - Check for empty cells

4. **"Database connection error"**
   - Ensure MongoDB is running
   - Check database connection string

## 📊 Data Structure After Import

After importing, your data will be stored as:

```javascript
{
  "rollNo": "B24CM1010",
  "name": "Rajesh Kumar",
  "records": {
    "jun2024": { "present": 20, "absent": 5, "rebate": 700 },
    "jul2024": { "present": 22, "absent": 3, "rebate": 420 }
  }
}
```

## 🎯 Quick Start

1. **Create template**: `node utils/createExcelTemplate.js`
2. **Fill your data** in the template
3. **Update server.js** to import your file
4. **Restart server**: `npm start`
5. **Test**: Open frontend and search for a student

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your Excel file format
3. Ensure all required columns are present
4. Check that MongoDB is running

Your Excel import functionality is now ready to use! 🚀
