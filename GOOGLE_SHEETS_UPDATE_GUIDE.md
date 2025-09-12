# 📊 Google Sheets Update Guide - Mess Rebate Tracker

## 🎯 **How to Add New Google Sheets Data**

This guide shows you how to add new month data from Google Sheets to your existing Mess Rebate Tracker.

## 📋 **Step-by-Step Process:**

### Step 1: Prepare Your Google Sheet

1. **Create Google Sheet** with these columns:
   - **Roll No** (e.g., B24CS1056)
   - **Name** (e.g., PRANAV H NAIR)
   - **Month** (e.g., aug2024, sep2024, oct2024)
   - **Present Days** (e.g., 25)
   - **Absent Days** (e.g., 6)

2. **Add Your Data** - one row per student per month

3. **Export as CSV**:
   - File → Download → Comma-separated values (.csv)
   - Save in `Back_end/data/` folder

### Step 2: Update the API Data

1. **Open** `api/index.js`
2. **Find the studentData object**
3. **Add new month data** to existing students

### Step 3: Data Format

For each student, add the new month to their records:

```javascript
"B24CS1056": {
  "rollNo": "B24CS1056",
  "name": "PRANAV H NAIR",
  "records": {
    "jul2024": { "present": 25, "absent": 5, "rebate": 700 },
    "aug2024": { "present": 25, "absent": 6, "rebate": 840 }  // ← New month
  },
  "totalRebate": 1540  // ← Updated total
}
```

### Step 4: Calculate Rebate

- **Rebate = Absent Days × ₹140**
- **Total Rebate = Sum of all months**

### Step 5: Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add August data"
   git push origin main
   ```

2. **Vercel auto-deploys** in 2-3 minutes

## 🔧 **Data Validation Rules:**

1. **Present Days + Absent Days = 30** (for most months)
2. **Absent Days ≤ 30** (can't be more than days in month)
3. **Rebate = Absent Days × 140**
4. **Month Format**: lowercase + year (aug2024, sep2024, etc.)

## 📊 **Example: Adding August Data**

### Before (July only):
```javascript
"B24CS1056": {
  "rollNo": "B24CS1056",
  "name": "PRANAV H NAIR",
  "records": {
    "jul2024": { "present": 25, "absent": 5, "rebate": 700 }
  },
  "totalRebate": 700
}
```

### After (July + August):
```javascript
"B24CS1056": {
  "rollNo": "B24CS1056",
  "name": "PRANAV H NAIR",
  "records": {
    "jul2024": { "present": 25, "absent": 5, "rebate": 700 },
    "aug2024": { "present": 25, "absent": 6, "rebate": 840 }
  },
  "totalRebate": 1540
}
```

## 🚨 **Common Issues & Fixes:**

### Issue 1: Data Validation Errors
- **Problem**: Present + Absent ≠ 30
- **Fix**: Check your Google Sheet data

### Issue 2: Wrong Month Format
- **Problem**: Month not in lowercase
- **Fix**: Use "aug2024" not "August" or "AUG2024"

### Issue 3: Missing Students
- **Problem**: Student not in July data
- **Fix**: Add new student entry to studentData

### Issue 4: Rebate Calculation
- **Problem**: Wrong rebate amount
- **Fix**: Rebate = Absent Days × 140

## 🎯 **Quick Checklist:**

- [ ] Google Sheet has correct columns
- [ ] Data exported as CSV
- [ ] Month format is lowercase + year
- [ ] Present + Absent = 30 (approximately)
- [ ] Rebate = Absent Days × 140
- [ ] Total rebate updated
- [ ] Code pushed to GitHub
- [ ] Vercel deployed successfully

## 📞 **Need Help?**

1. **Check the data format** in your CSV file
2. **Verify calculations** (Present + Absent = 30)
3. **Test locally** before deploying
4. **Check Vercel logs** if deployment fails

## 🎉 **Success!**

After following this guide:
- ✅ New month data will be available
- ✅ Students can see their updated rebate
- ✅ Total rebate will include all months
- ✅ App will work perfectly on Vercel
