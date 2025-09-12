const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");
const sampleData = require("../data/sampleData.json");

const importSampleData = async () => {
  try {
    // Clear existing data
    await Student.deleteMany({});
    console.log("Cleared existing data");

    // Import sample data
    for (const studentData of sampleData) {
      const student = new Student(studentData);
      await student.save();
    }

    console.log(`✅ Successfully imported ${sampleData.length} student records`);
  } catch (err) {
    console.error("❌ Import error:", err);
  }
};

const importExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { RollNo, Name, Month, AteDays, RebateDays, TotalRebate } = row;
      await Student.findOneAndUpdate(
        { rollNo: RollNo },
        {
          $set: {
            name: Name,
            [`records.${Month}`]: {
              present: AteDays,
              absent: RebateDays,
              rebate: TotalRebate
            }
          }
        },
        { new: true, upsert: true }
      );
    }

    console.log("✅ Excel imported successfully");
  } catch (err) {
    console.error("❌ Error importing Excel:", err);
  }
};

// Import CSV file (for Google Sheets export)
const importCSV = async (filePath) => {
  try {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('📊 CSV Headers found:', headers);
    
    const students = {};
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        const { RollNo, Name, Month, PresentDays, AbsentDays } = row;
        
        if (RollNo && Name && Month && PresentDays && AbsentDays) {
          if (!students[RollNo]) {
            students[RollNo] = {
              rollNo: RollNo,
              name: Name,
              records: {}
            };
          }
          
          const present = parseInt(PresentDays);
          const absent = parseInt(AbsentDays);
          const rebate = absent * 140; // ₹140 per absent day
          
          students[RollNo].records[Month.toLowerCase()] = {
            present: present,
            absent: absent,
            rebate: rebate
          };
        }
      }
    }
    
    // Clear existing data
    await Student.deleteMany({});
    console.log('Cleared existing data');
    
    // Save to database
    for (const rollNo in students) {
      const student = new Student(students[rollNo]);
      await student.save();
    }
    
    console.log(`✅ Successfully imported ${Object.keys(students).length} students from CSV`);
  } catch (err) {
    console.error('❌ CSV Import error:', err);
  }
};

// Import Google Sheets data (month-wise format)
const importGoogleSheets = async (filePath) => {
  try {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('📊 Google Sheets Headers found:', headers);
    
    const students = {};
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // Handle different possible column names
        const rollNo = row['Roll No'] || row['RollNo'] || row['Roll_No'] || row['roll_no'];
        const name = row['Name'] || row['Student Name'] || row['Student_Name'];
        const month = row['Month'] || row['month'];
        const present = row['Present Days'] || row['PresentDays'] || row['Present_Days'] || row['present_days'] || row['Days Present'] || row['DaysPresent'];
        const absent = row['Absent Days'] || row['AbsentDays'] || row['Absent_Days'] || row['absent_days'] || row['Days Absent'] || row['DaysAbsent'];
        
        if (rollNo && name && month && present && absent) {
          if (!students[rollNo]) {
            students[rollNo] = {
              rollNo: rollNo,
              name: name,
              records: {}
            };
          }
          
          const presentDays = parseInt(present);
          const absentDays = parseInt(absent);
          const rebate = absentDays * 140; // ₹140 per absent day
          
          // Convert month to lowercase format and add year
          let monthKey = month.toLowerCase().replace(/\s+/g, '');
          
          // Handle different month formats
          if (monthKey === 'july') {
            monthKey = 'jul2024';
          } else if (monthKey === 'june') {
            monthKey = 'jun2024';
          } else if (monthKey === 'august') {
            monthKey = 'aug2024';
          } else if (monthKey === 'september') {
            monthKey = 'sep2024';
          } else if (monthKey === 'october') {
            monthKey = 'oct2024';
          } else if (monthKey === 'november') {
            monthKey = 'nov2024';
          } else if (monthKey === 'december') {
            monthKey = 'dec2024';
          }
          
          students[rollNo].records[monthKey] = {
            present: presentDays,
            absent: absentDays,
            rebate: rebate
          };
          
          console.log(`📝 Processed: ${name} (${rollNo}) - ${monthKey}: ${presentDays} present, ${absentDays} absent, ₹${rebate} rebate`);
        }
      }
    }
    
    // Clear existing data
    await Student.deleteMany({});
    console.log('Cleared existing data');
    
    // Save to database
    for (const rollNo in students) {
      const student = new Student(students[rollNo]);
      await student.save();
    }
    
    console.log(`✅ Successfully imported ${Object.keys(students).length} students from Google Sheets`);
    console.log('📋 Sample data imported:');
    for (const rollNo in students) {
      console.log(`- ${students[rollNo].name} (${rollNo}): ${Object.keys(students[rollNo].records).length} months`);
    }
  } catch (err) {
    console.error('❌ Google Sheets Import error:', err);
  }
};

module.exports = { importSampleData, importExcel, importCSV, importGoogleSheets };