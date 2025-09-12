const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/messRebateDB';
const MONGODB_DB = 'messRebateDB';

// Sample data - using Object instead of Map for MongoDB compatibility
const sampleData = [
  {
    "rollNo": "B24CS1056",
    "name": "PRANAV H NAIR",
    "records": {
      "jul2024": { "present": 25, "absent": 5, "rebate": 700 }
    }
  },
  {
    "rollNo": "B24PH1019",
    "name": "PRAGYAN DAS",
    "records": {
      "jul2024": { "present": 30, "absent": 0, "rebate": 0 }
    }
  },
  {
    "rollNo": "B24EE1069",
    "name": "SARAIYA VED GAURAV",
    "records": {
      "jul2024": { "present": 29, "absent": 1, "rebate": 140 }
    }
  },
  {
    "rollNo": "B24EE1014",
    "name": "DESAI AUM NIKUNJKUMAR",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 }
    }
  },
  {
    "rollNo": "B24CM1053",
    "name": "SADAT UL ROUF WANI",
    "records": {
      "jul2024": { "present": 30, "absent": 0, "rebate": 0 }
    }
  },
  {
    "rollNo": "B24CM1052",
    "name": "RUPESH",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 }
    }
  },
  {
    "rollNo": "B24ME1064",
    "name": "SAI AKSHAR TADIMETI",
    "records": {
      "jul2024": { "present": 23, "absent": 7, "rebate": 980 }
    }
  },
  {
    "rollNo": "B24ME1055",
    "name": "PRABHASH RADHESHYAM CHAURASIA",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 }
    }
  },
  {
    "rollNo": "B24CH1022",
    "name": "MAYANK BANSAL",
    "records": {
      "jul2024": { "present": 24, "absent": 6, "rebate": 840 }
    }
  },
  {
    "rollNo": "B24BB1034",
    "name": "SAYYED HAMZA ALI",
    "records": {
      "jul2024": { "present": 23, "absent": 7, "rebate": 980 }
    }
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Clear existing data
    await db.collection('students').deleteMany({});
    console.log('Cleared existing data');

    // Insert sample data
    await db.collection('students').insertMany(sampleData);
    console.log(`Successfully imported ${sampleData.length} students`);

    await client.close();

    res.status(200).json({ 
      message: 'Data imported successfully',
      count: sampleData.length 
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ message: 'Error importing data', error: error.message });
  }
}
