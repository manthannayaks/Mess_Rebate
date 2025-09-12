# Mess Rebate Tracker - IIT Jodhpur

A web application to track mess rebates for students at IIT Jodhpur. Students can check their rebate amount by entering their roll number.

## Features

- **Student Lookup**: Enter roll number to view student information and rebate details
- **Monthly Tracking**: View rebate data for each month from June 2024 onwards
- **Total Calculation**: Automatic calculation of total rebate amount
- **Modern UI**: Responsive design with IIT Jodhpur branding
- **Database Integration**: MongoDB for data storage

## Project Structure

```
Mess_Rebate_Tracker/
├── Back_end/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   └── studentController.js # API controllers
│   ├── data/
│   │   └── sampleData.json    # Sample student data
│   ├── models/
│   │   └── Student.js         # Student data model
│   ├── routes/
│   │   └── studentRoutes.js   # API routes
│   ├── utils/
│   │   └── excelParser.js     # Data import utilities
│   ├── package.json
│   └── server.js              # Main server file
├── Front_end/
│   ├── index.html             # Main HTML file
│   ├── script.js              # Frontend JavaScript
│   ├── style.css              # Styling
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd Back_end
npm install
```

### 2. Install Frontend Dependencies

```bash
cd Front_end
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
mongod
```

### 4. Start the Backend Server

```bash
cd Back_end
npm start
```

The server will start on `http://localhost:5000`

### 5. Start the Frontend

```bash
cd Front_end
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Enter a student's roll number (e.g., B24CM1010, B24CS1001)
3. Click "Get Rebate Data" to view the student's information and rebate details
4. The system will display:
   - Student name and roll number
   - Monthly breakdown of present/absent days and rebate amount
   - Total rebate amount

## Sample Data

The application comes with sample data for testing:

- **B24CM1010** - Rajesh Kumar
- **B24CM1044** - Priya Sharma  
- **B24CS1001** - Amit Singh
- **B24EE1005** - Sneha Patel
- **B24ME1008** - Vikram Joshi

## API Endpoints

- `GET /api/students/:roll` - Get student data by roll number
- `POST /api/students` - Add new student
- `PUT /api/students/:roll` - Update student data
- `DELETE /api/students/:roll` - Delete student

## Data Structure

Each student record contains:
- `rollNo`: Student's roll number
- `name`: Student's full name
- `records`: Monthly data object with:
  - `present`: Number of days present in mess
  - `absent`: Number of days absent from mess
  - `rebate`: Calculated rebate amount (₹140 per absent day)

## Adding New Data

### Method 1: Using the API
```javascript
// POST to /api/students
{
  "rollNo": "B24CS1002",
  "name": "New Student",
  "records": {
    "jun2024": { "present": 20, "absent": 5, "rebate": 700 }
  }
}
```

### Method 2: Using Excel Import
1. Create an Excel file with columns: RollNo, Name, Month, AteDays, RebateDays, TotalRebate
2. Place the file in the Back_end/data/ directory
3. Update server.js to call `importExcel("./data/yourfile.xlsx")`

## Customization

- **Rebate Rate**: Change the `perDayRate` variable in `Front_end/script.js` (currently ₹140)
- **Styling**: Modify `Front_end/style.css` for different colors/themes
- **Database**: Update connection string in `Back_end/config/db.js`

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running on port 27017
2. **CORS Issues**: Check that the frontend is running on port 3000 and backend on port 5000
3. **No Data Found**: Verify that sample data has been imported successfully

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MongoDB
- **Styling**: Custom CSS with responsive design

## License

This project is created for IIT Jodhpur mess rebate tracking system.
