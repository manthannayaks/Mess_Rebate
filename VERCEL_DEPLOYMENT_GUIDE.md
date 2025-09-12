# Vercel Deployment Guide - Mess Rebate Tracker

## 🚀 How to Deploy to Vercel

### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub

### Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `messRebateDB`

3. **Create Database and Collection**
   - In MongoDB Atlas, go to "Collections"
   - Create a database named `messRebateDB`
   - Create a collection named `students`

### Step 2: Deploy to Vercel

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel dashboard, go to your project
   - Go to "Settings" → "Environment Variables"
   - Add: `MONGODB_URI` = your MongoDB Atlas connection string

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Import Data

1. **Access Your Deployed App**
   - Go to your Vercel deployment URL
   - Add `/api/import-data` to the end
   - Example: `https://your-app.vercel.app/api/import-data`

2. **Import Data**
   - Send a POST request to the import endpoint
   - You can use Postman or curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/import-data
   ```

### Step 4: Test Your Application

1. **Open Your App**
   - Go to your Vercel deployment URL
   - Try searching for student roll numbers:
     - `B24CS1056` (PRANAV H NAIR)
     - `B24PH1019` (PRAGYAN DAS)
     - `B24ME1064` (SAI AKSHAR TADIMETI)

## 🔧 Troubleshooting

### Common Issues:

1. **"MongoDB connection failed"**
   - Check your MONGODB_URI environment variable
   - Ensure your MongoDB Atlas cluster is running
   - Verify your IP is whitelisted in MongoDB Atlas

2. **"CORS error"**
   - The API routes include CORS headers
   - Make sure you're using the correct API endpoints

3. **"Student not found"**
   - Make sure you've imported the data first
   - Check the import-data endpoint

4. **"Build failed"**
   - Check that all dependencies are in package.json
   - Ensure Node.js version is compatible

## 📁 Project Structure for Vercel

```
Mess_Rebate_Tracker/
├── api/
│   ├── students/
│   │   └── [roll].js          # API endpoint for student lookup
│   └── import-data.js         # API endpoint for data import
├── Front_end/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── vercel.json                # Vercel configuration
└── package.json               # Root package.json
```

## 🌐 Environment Variables

Set these in Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `NODE_ENV` | `production` | Environment (set automatically) |

## 📊 API Endpoints

- `GET /api/students/[roll]` - Get student data by roll number
- `POST /api/import-data` - Import sample data to database

## 🎯 Testing Your Deployment

1. **Test API Directly**:
   ```bash
   curl https://your-app.vercel.app/api/students/B24CS1056
   ```

2. **Test Frontend**:
   - Open your Vercel URL
   - Search for any student roll number

## 💡 Tips for Success

1. **Use MongoDB Atlas**: Vercel doesn't support local MongoDB
2. **Set Environment Variables**: Always set MONGODB_URI in Vercel
3. **Import Data First**: Always run the import-data endpoint after deployment
4. **Check Logs**: Use Vercel dashboard to check deployment logs

## 🚀 Your App is Live!

Once deployed, your Mess Rebate Tracker will be available at:
`https://your-app-name.vercel.app`

Students can access it from anywhere and search for their rebate information!
