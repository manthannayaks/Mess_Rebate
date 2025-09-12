# Google Sheets Import Guide - Mess Rebate Tracker

## 📊 How to Import Data from Google Sheets

Your application now supports importing data directly from Google Sheets! This is perfect for month-wise data entry.

## 🎯 Google Sheets Format

Your Google Sheets should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Roll No** | Student's roll number | B24CM1010 |
| **Name** | Student's full name | Rajesh Kumar |
| **Month** | Month in format | jun2024, jul2024, aug2024, etc. |
| **Present Days** | Days student ate in mess | 20 |
| **Absent Days** | Days student was absent | 5 |

## 📝 Step-by-Step Process

### Step 1: Create Google Sheets Template
```bash
cd Back_end
node utils/createGoogleSheetsTemplate.js
```
This creates a template CSV file that you can import into Google Sheets.

### Step 2: Set Up Your Google Sheet
1. **Open Google Sheets** (sheets.google.com)
2. **Create a new sheet**
3. **Use these exact column headers:**
   - Roll No
   - Name
   - Month
   - Present Days
   - Absent Days

### Step 3: Add Your Data
Add one row for each student for each month:

| Roll No | Name | Month | Present Days | Absent Days |
|---------|------|-------|--------------|-------------|
| B24CM1010 | Rajesh Kumar | jun2024 | 20 | 5 |
| B24CM1010 | Rajesh Kumar | jul2024 | 22 | 3 |
| B24CM1010 | Rajesh Kumar | aug2024 | 25 | 2 |
| B24CM1044 | Priya Sharma | jun2024 | 21 | 4 |
| B24CM1044 | Priya Sharma | jul2024 | 20 | 5 |

### Step 4: Export as CSV
1. **In Google Sheets:** File → Download → Comma-separated values (.csv)
2. **Save the file** in your `Back_end/data/` folder
3. **Rename it** to something like `google_sheets_export.csv`

### Step 5: Import to Your Application
Update `server.js` to import your Google Sheets data:

```javascript
// Comment out sample data
// importSampleData();

// Uncomment Google Sheets import
importGoogleSheets("./data/google_sheets_export.csv");
```

### Step 6: Restart Your Server
```bash
npm start
```

## 🔧 Supported Column Names

The system is flexible and supports various column name formats:

### Roll Number:
- `Roll No` ✅
- `RollNo` ✅
- `Roll_No` ✅
- `roll_no` ✅

### Name:
- `Name` ✅
- `Student Name` ✅
- `Student_Name` ✅

### Month:
- `Month` ✅
- `month` ✅
- Format: `jun2024`, `jul2024`, `aug2024`, etc.

### Present Days:
- `Present Days` ✅
- `PresentDays` ✅
- `Present_Days` ✅
- `present_days` ✅
- `Days Present` ✅
- `DaysPresent` ✅

### Absent Days:
- `Absent Days` ✅
- `AbsentDays` ✅
- `Absent_Days` ✅
- `absent_days` ✅
- `Days Absent` ✅
- `DaysAbsent` ✅

## 📊 Example Google Sheets Setup

### Month-wise Data Entry:
```
Roll No        | Name          | Month   | Present Days | Absent Days
B24CM1010      | Rajesh Kumar  | jun2024 | 20           | 5
B24CM1010      | Rajesh Kumar  | jul2024 | 22           | 3
B24CM1010      | Rajesh Kumar  | aug2024 | 25           | 2
B24CM1044      | Priya Sharma  | jun2024 | 21           | 4
B24CM1044      | Priya Sharma  | jul2024 | 20           | 5
B24CM1044      | Priya Sharma  | aug2024 | 24           | 3
```

## 🚀 Quick Start Commands

### 1. Create Template:
```bash
cd Back_end
node utils/createGoogleSheetsTemplate.js
```

### 2. Import Your Data:
```bash
# Update server.js to use your CSV file
importGoogleSheets("./data/your_google_sheets_export.csv");
```

### 3. Start Server:
```bash
npm start
```

## ⚠️ Important Notes

1. **Month Format**: Use lowercase with year (e.g., `jun2024`, `jul2024`)
2. **Numeric Values**: Present Days and Absent Days must be numbers
3. **CSV Export**: Always export as CSV from Google Sheets
4. **File Location**: Place CSV file in `Back_end/data/` folder
5. **Rebate Calculation**: Automatically calculated as ₹140 per absent day

## 🔄 Multiple Import Methods

### Method 1: Google Sheets (Recommended)
1. Create Google Sheet with proper format
2. Export as CSV
3. Use `importGoogleSheets()` function

### Method 2: Direct CSV
1. Create CSV file manually
2. Use `importCSV()` function

### Method 3: Excel File
1. Create Excel file
2. Use `importExcel()` function

## 🎯 Benefits of Google Sheets

- ✅ **Easy Data Entry**: Familiar spreadsheet interface
- ✅ **Collaborative**: Multiple people can edit
- ✅ **Real-time Updates**: Changes sync automatically
- ✅ **Mobile Friendly**: Edit on phone/tablet
- ✅ **Backup**: Automatic cloud backup
- ✅ **Version History**: Track changes over time

## 🚨 Troubleshooting

### Common Issues:

1. **"Column not found"**
   - Check column names match exactly
   - Ensure no extra spaces

2. **"Invalid data type"**
   - Verify Present Days and Absent Days are numbers
   - Check for empty cells

3. **"Month format error"**
   - Use format: `jun2024`, `jul2024`, etc.
   - Ensure lowercase

4. **"File not found"**
   - Check file path in server.js
   - Ensure CSV file is in `Back_end/data/` folder

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your Google Sheets format
3. Ensure all required columns are present
4. Check that MongoDB is running

Your Google Sheets import functionality is now ready to use! 🚀

## 🎉 Success!

After importing, your data will be available in the web interface. Students can search for their roll number and see their rebate information month by month!
