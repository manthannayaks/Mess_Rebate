// Complete student data from July and August Google Sheets
const studentData = {
  "B24CS1056": {
    "rollNo": "B24CS1056",
    "name": "PRANAV H NAIR",
    "records": {
      "jul2024": { "present": 25, "absent": 5, "rebate": 700 },
      "aug2024": { "present": 25, "absent": 6, "rebate": 840 }
    },
    "totalRebate": 1540
  },
  "B24PH1019": {
    "rollNo": "B24PH1019",
    "name": "PRAGYAN DAS",
    "records": {
      "jul2024": { "present": 30, "absent": 0, "rebate": 0 },
      "aug2024": { "present": 30, "absent": 1, "rebate": 140 }
    },
    "totalRebate": 140
  },
  "B24EE1069": {
    "rollNo": "B24EE1069",
    "name": "SARAIYA VED GAURAV",
    "records": {
      "jul2024": { "present": 29, "absent": 1, "rebate": 140 },
      "aug2024": { "present": 29, "absent": 2, "rebate": 280 }
    },
    "totalRebate": 420
  },
  "B24EE1014": {
    "rollNo": "B24EE1014",
    "name": "DESAI AUM NIKUNJKUMAR",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CM1053": {
    "rollNo": "B24CM1053",
    "name": "SADAT UL ROUF WANI",
    "records": {
      "jul2024": { "present": 30, "absent": 0, "rebate": 0 },
      "aug2024": { "present": 30, "absent": 1, "rebate": 140 }
    },
    "totalRebate": 140
  },
  "B24CM1052": {
    "rollNo": "B24CM1052",
    "name": "RUPESH",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 },
      "aug2024": { "present": 27, "absent": 4, "rebate": 560 }
    },
    "totalRebate": 980
  },
  "B24ME1064": {
    "rollNo": "B24ME1064",
    "name": "SAI AKSHAR TADIMETI",
    "records": {
      "jul2024": { "present": 23, "absent": 7, "rebate": 980 },
      "aug2024": { "present": 23, "absent": 8, "rebate": 1120 }
    },
    "totalRebate": 2100
  },
  "B24ME1055": {
    "rollNo": "B24ME1055",
    "name": "PRABHASH RADHESHYAM CHAURASIA",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 },
      "aug2024": { "present": 27, "absent": 4, "rebate": 560 }
    },
    "totalRebate": 980
  },
  "B24CH1022": {
    "rollNo": "B24CH1022",
    "name": "MAYANK BANSAL",
    "records": {
      "jul2024": { "present": 24, "absent": 6, "rebate": 840 },
      "aug2024": { "present": 24, "absent": 7, "rebate": 980 }
    },
    "totalRebate": 1820
  },
  "B24BB1034": {
    "rollNo": "B24BB1034",
    "name": "SAYYED HAMZA ALI",
    "records": {
      "jul2024": { "present": 23, "absent": 7, "rebate": 980 },
      "aug2024": { "present": 23, "absent": 8, "rebate": 1120 }
    },
    "totalRebate": 2100
  },
  "B24MT1008": {
    "rollNo": "B24MT1008",
    "name": "BHUKYA NARENDER",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CS1016": {
    "rollNo": "B24CS1016",
    "name": "ARYAN ASHOK JAIN",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24PH1018": {
    "rollNo": "B24PH1018",
    "name": "NITISH KUMAR DAS",
    "records": {
      "jul2024": { "present": 24, "absent": 6, "rebate": 840 },
      "aug2024": { "present": 24, "absent": 7, "rebate": 980 }
    },
    "totalRebate": 1820
  },
  "B24EE1007": {
    "rollNo": "B24EE1007",
    "name": "ARSH GOYAL",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24EE1060": {
    "rollNo": "B24EE1060",
    "name": "RAGHAV SRINIVASAN",
    "records": {
      "jul2024": { "present": 26, "absent": 4, "rebate": 560 },
      "aug2024": { "present": 26, "absent": 5, "rebate": 700 }
    },
    "totalRebate": 1260
  },
  "B24CM1007": {
    "rollNo": "B24CM1007",
    "name": "AMISH RAI",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CM1050": {
    "rollNo": "B24CM1050",
    "name": "PAARAS KATARIA",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24ME1066": {
    "rollNo": "B24ME1066",
    "name": "SAIGIRISH S",
    "records": {
      "jul2024": { "present": 26, "absent": 4, "rebate": 560 },
      "aug2024": { "present": 26, "absent": 5, "rebate": 700 }
    },
    "totalRebate": 1260
  },
  "B24ME1019": {
    "rollNo": "B24ME1019",
    "name": "CHHATRALA DARSH NAVNEETBHAI",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CI1030": {
    "rollNo": "B24CI1030",
    "name": "MARKAD TEJAS VILAS",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CH1046": {
    "rollNo": "B24CH1046",
    "name": "TANISHQ VARSHNEY",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24BB1012": {
    "rollNo": "B24BB1012",
    "name": "GYAN VARDHAN CHAUHAN",
    "records": {
      "jul2024": { "present": 24, "absent": 6, "rebate": 840 },
      "aug2024": { "present": 24, "absent": 7, "rebate": 980 }
    },
    "totalRebate": 1820
  },
  "B24MT1020": {
    "rollNo": "B24MT1020",
    "name": "MADAS SHIVA SHANKAR",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24CI1037": {
    "rollNo": "B24CI1037",
    "name": "NITESH KUMAR",
    "records": {
      "jul2024": { "present": 26, "absent": 4, "rebate": 560 },
      "aug2024": { "present": 26, "absent": 5, "rebate": 700 }
    },
    "totalRebate": 1260
  },
  "B24CS1058": {
    "rollNo": "B24CS1058",
    "name": "PRIYAM MAHESHBHAI PATEL",
    "records": {
      "jul2024": { "present": 27, "absent": 3, "rebate": 420 },
      "aug2024": { "present": 27, "absent": 4, "rebate": 560 }
    },
    "totalRebate": 980
  },
  "B24PH1022": {
    "rollNo": "B24PH1022",
    "name": "SALLA SAI CHAITHANYA",
    "records": {
      "jul2024": { "present": 29, "absent": 1, "rebate": 140 },
      "aug2024": { "present": 29, "absent": 2, "rebate": 280 }
    },
    "totalRebate": 420
  },
  "B24EE1026": {
    "rollNo": "B24EE1026",
    "name": "HRUJUL MENDHE",
    "records": {
      "jul2024": { "present": 26, "absent": 4, "rebate": 560 },
      "aug2024": { "present": 26, "absent": 5, "rebate": 700 }
    },
    "totalRebate": 1260
  },
  "B24EE1077": {
    "rollNo": "B24EE1077",
    "name": "SUPARN AGRAWAL",
    "records": {
      "jul2024": { "present": 28, "absent": 2, "rebate": 280 },
      "aug2024": { "present": 28, "absent": 3, "rebate": 420 }
    },
    "totalRebate": 700
  },
  "B24BB1029": {
    "rollNo": "B24BB1029",
    "name": "PRIYANSHU PANDEY",
    "records": {
      "jul2024": { "present": 26, "absent": 4, "rebate": 560 },
      "aug2024": { "present": 26, "absent": 5, "rebate": 700 }
    },
    "totalRebate": 1260
  },
  "B24CM1044": {
    "rollNo": "B24CM1044",
    "name": "MANTHAN NAYAK",
    "records": {
      "aug2024": { "present": 8, "absent": 23, "rebate": 3220 }
    },
    "totalRebate": 3220
  }
};

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

    // Look up student in static data
    const student = studentData[roll];

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return student data directly
    res.status(200).json(student);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
