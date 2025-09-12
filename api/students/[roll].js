const { MongoClient } = require('mongodb');

// MongoDB connection string - you'll need to set this in Vercel environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/messRebateDB';
const MONGODB_DB = 'messRebateDB';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { roll } = req.query;
    
    if (!roll) {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    const { db } = await connectToDatabase();
    const student = await db.collection('students').findOne({ rollNo: roll });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Handle records - could be Map or Object
    const recordsObj = {};
    let totalRebate = 0;
    
    if (student.records instanceof Map) {
      // If records is a Map
      for (const [month, data] of student.records.entries()) {
        recordsObj[month] = {
          present: data.present,
          absent: data.absent,
          rebate: data.rebate
        };
        totalRebate += data.rebate || 0;
      }
    } else if (student.records && typeof student.records === 'object') {
      // If records is an Object
      for (const [month, data] of Object.entries(student.records)) {
        recordsObj[month] = {
          present: data.present,
          absent: data.absent,
          rebate: data.rebate
        };
        totalRebate += data.rebate || 0;
      }
    }

    res.status(200).json({
      rollNo: student.rollNo,
      name: student.name,
      records: recordsObj,
      totalRebate
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
