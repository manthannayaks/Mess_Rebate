# Vercel Deployment Guide - Fixed Version

## Issues Fixed

### 1. **vercel.json Configuration**
- ✅ Fixed to use proper serverless functions (`api/**/*.js`)
- ✅ Updated routes to point to correct API endpoints
- ✅ Removed references to traditional Express server

### 2. **Frontend API Calls**
- ✅ Updated `Front_end/script.js` to use relative API paths (`/api/students/${roll}`)
- ✅ Removed hardcoded localhost URLs

### 3. **Serverless Functions**
- ✅ Fixed MongoDB data structure handling in `api/students/[roll].js`
- ✅ Added support for both Map and Object data structures
- ✅ Updated import function to use Object format for MongoDB compatibility

### 4. **Package Configuration**
- ✅ Updated root `package.json` with proper main entry point
- ✅ Added Vercel build script

## Deployment Steps

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 2: Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. In your project root, run: `vercel`
4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name: **mess-rebate-tracker**
   - Directory: **./**

### Step 3: Set Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `MONGODB_URI` = `your-mongodb-atlas-connection-string`

### Step 4: Import Data
After deployment, you need to import your data:

1. **Option A: Use the import API endpoint**
   ```bash
   curl -X POST https://your-app.vercel.app/api/import-data
   ```

2. **Option B: Import your CSV data**
   - Update the `sampleData` array in `api/import-data.js` with your actual data
   - Redeploy and call the import endpoint

## Testing Your Deployment

### 1. Test the API
```bash
# Test student lookup
curl https://your-app.vercel.app/api/students/B24CS1056
```

### 2. Test the Frontend
- Visit: `https://your-app.vercel.app/`
- Enter a roll number (e.g., `B24CS1056`)
- Check if data loads correctly

## Common Issues and Solutions

### Issue 1: "Function not found" or 404 errors
**Solution**: Check that your `vercel.json` is correctly configured and your API files are in the `api/` directory.

### Issue 2: "MongoDB connection failed"
**Solution**: 
- Verify your `MONGODB_URI` environment variable is set correctly
- Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
- Check that your database user has read/write permissions

### Issue 3: "No data found" errors
**Solution**:
- Make sure you've imported data using the `/api/import-data` endpoint
- Check that your data structure matches what the API expects
- Verify roll numbers exist in your database

### Issue 4: CORS errors
**Solution**: The serverless functions already include CORS headers, but if you still get errors, check the browser's network tab for the actual error.

## File Structure for Vercel
```
/
├── api/
│   ├── students/
│   │   └── [roll].js          # Student lookup API
│   └── import-data.js         # Data import API
├── Front_end/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── ...
├── vercel.json                # Vercel configuration
├── package.json               # Root package.json
└── ...
```

## Environment Variables Required
- `MONGODB_URI`: Your MongoDB Atlas connection string

## Next Steps After Deployment

1. **Import your actual data**: Update the sample data in `api/import-data.js` with your real student data
2. **Test thoroughly**: Try different roll numbers to ensure the system works
3. **Monitor logs**: Check Vercel function logs for any errors
4. **Set up custom domain**: If needed, configure a custom domain in Vercel settings

## Support
If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Test API endpoints directly with curl
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas is accessible and has the correct data
