# Campus Mess Companion - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [How the Project Works](#how-the-project-works)
3. [Project Structure](#project-structure)
4. [File-by-File Explanation](#file-by-file-explanation)
5. [Data Flow](#data-flow)
6. [Deployment Process](#deployment-process)

---

## 🎯 Project Overview

**Campus Mess Companion** is an offline-first Progressive Web App (PWA) designed for managing mess-related information in residential campuses. It provides:
- **Mess Rebate Tracking**: Search student rebates by roll number
- **Mess Menu Display**: View daily meal schedules (Veg/Non-Veg)
- **Academic Calendar**: Visual calendar with events and holidays
- **Admin Dashboard**: Manage data and settings
- **Student Profiles**: Personal information and QR pass storage

**Key Features:**
- ✅ Works completely offline (after initial load)
- ✅ PWA support (installable on mobile/desktop)
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ No backend required (static site)

---

## 🔄 How the Project Works

### **Step-by-Step Flow:**

#### **1. Initial Setup & Data Processing**
```
User adds CSV files → Build Script processes → JavaScript datasets created
```

**Process:**
1. User places CSV files in `data__/` folder:
   - Mess Bill CSVs → `data__/Mess Bill/`
   - Menu CSVs → `data__/Menu/`
   - Academic Calendar PDF → `data__/Academic Calender/`

2. User runs `npm run build:data`
   - Script reads CSV files
   - Parses and processes data
   - Generates JavaScript files in `data/` folder
   - Copies PDF to `assets/` folder

3. Generated files:
   - `data/rebates-data.js` - Student rebate information
   - `data/menu-data.js` - Mess menu schedules
   - `data/academic_events.json` - Calendar events
   - `assets/academic-calendar.pdf` - Full calendar PDF

#### **2. Application Load**
```
Browser loads HTML → CSS styles applied → JavaScript executes → Data loaded
```

**Process:**
1. User opens `index.html` in browser
2. Browser loads:
   - `assets/styles/main.css` - All styling
   - `assets/scripts/app-shell.js` - Core functionality
   - Page-specific scripts (home.js, menu.js, etc.)
3. Service Worker registers (PWA support)
4. Theme preference loaded from localStorage
5. Profile data loaded from localStorage

#### **3. User Interactions**

**Rebate Lookup:**
1. User types roll number in `rebates.html`
2. `rebates.js` loads `data/rebates-data.js`
3. Searches student data
4. Displays results with calculations

**Menu View:**
1. User opens `mess-menu.html`
2. `menu.js` loads `data/menu-data.js`
3. Shows today's menu by default
4. User can switch days/plans

**Calendar View:**
1. User opens `academic-calendar.html`
2. `calendar.js` loads `data/academic_events.json`
3. Renders month-wise calendar grid
4. Shows events with color-coded badges

**Admin Access:**
1. User logs in via `login.html`
2. Credentials checked against `data/admin.json`
3. Access granted → `admin-dashboard.html`
4. Can edit data files (saved to localStorage)

#### **4. Data Storage**

**LocalStorage Keys:**
- `mess-theme-choice` - Theme preference (auto/light/dark)
- `mess-profile` - Student profile information
- `user-qr-pass` - QR code image and text
- `admin-logged-in` - Admin session status
- `menuData`, `rebateData`, `calendarData` - Admin edits

---

## 📁 Project Structure

```
Mess_Rebate_Tracker/
│
├── 📄 HTML Pages (Root)
│   ├── index.html              # Landing page
│   ├── mess-menu.html          # Menu display page
│   ├── rebates.html            # Rebate lookup page
│   ├── academic-calendar.html  # Calendar page
│   ├── login.html              # Admin login
│   ├── admin-dashboard.html    # Admin panel
│   └── 404.html                # Error page
│
├── 📦 Assets (Static Resources)
│   └── assets/
│       ├── styles/
│       │   └── main.css        # All CSS styles
│       ├── scripts/
│       │   ├── app-shell.js    # Core functionality
│       │   ├── home.js         # Home page logic
│       │   ├── menu.js         # Menu page logic
│       │   ├── rebates.js      # Rebates page logic
│       │   ├── calendar.js     # Calendar page logic
│       │   └── admin.js        # Admin functionality
│       ├── icons/              # PWA icons (to be added)
│       └── academic-calendar.pdf
│
├── 💾 Data (Generated/Config)
│   └── data/
│       ├── rebates-data.js     # Generated rebate data
│       ├── menu-data.js         # Generated menu data
│       ├── academic_events.json # Calendar events
│       └── admin.json           # Admin credentials
│
├── 🔧 Scripts (Build Tools)
│   └── scripts/
│       ├── build-dataset.mjs   # Data processing script
│       ├── preview.mjs          # Local development server
│       └── generate-icons.md    # Icon generation guide
│
├── 📥 Raw Data (Input)
│   └── data__/
│       ├── Mess Bill/           # CSV files for rebates
│       ├── Menu/                # CSV files for menus
│       └── Academic Calender/   # PDF and JSON
│
├── ⚙️ Configuration Files
│   ├── package.json            # NPM configuration
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── vercel.json             # Vercel deployment config
│   ├── .nojekyll               # GitHub Pages config
│   ├── .gitignore              # Git ignore rules
│   └── .vercelignore           # Vercel ignore rules
│
└── 🚀 Deployment
    └── .github/
        └── workflows/
            └── deploy.yml      # GitHub Actions workflow
```

---

## 📄 File-by-File Explanation

### **HTML Pages**

#### `index.html`
**Purpose:** Landing page and main entry point
**What it does:**
- Displays welcome screen with app overview
- Shows quick links to all features
- QR code upload section
- Profile panel (accessible via header button)
- Links to all other pages

**Key Features:**
- Hero section with current date
- Feature cards (Rebates, Menu, Calendar)
- QR pass upload functionality
- Responsive navigation

---

#### `mess-menu.html`
**Purpose:** Display daily mess menu schedules
**What it does:**
- Shows today's menu by default
- Allows switching between Veg/Non-Veg plans
- Day selector for different days
- Meal rating system
- Meal reminder notifications

**Scripts Used:**
- `data/menu-data.js` - Menu data
- `assets/scripts/app-shell.js` - Core features
- `assets/scripts/menu.js` - Menu-specific logic

---

#### `rebates.html`
**Purpose:** Student rebate lookup and tracking
**What it does:**
- Search interface for roll numbers
- Displays student rebate history
- Shows month-wise breakdown
- Calculates total rebates
- Recent searches storage

**Scripts Used:**
- `data/rebates-data.js` - Rebate data
- `assets/scripts/app-shell.js` - Core features
- `assets/scripts/rebates.js` - Rebate search logic

---

#### `academic-calendar.html`
**Purpose:** Academic calendar with events
**What it does:**
- Month-wise calendar grid view
- Event display with color coding
- Month selector dropdown
- Link to full PDF calendar

**Scripts Used:**
- `data/academic_events.json` - Calendar events
- `assets/scripts/app-shell.js` - Core features
- `assets/scripts/calendar.js` - Calendar rendering

---

#### `login.html`
**Purpose:** Admin authentication page
**What it does:**
- Login form (username/password)
- Validates credentials
- Redirects to admin dashboard
- Error handling

**Scripts Used:**
- `assets/scripts/admin.js` - Authentication logic

---

#### `admin-dashboard.html`
**Purpose:** Administrative control panel
**What it does:**
- Welcome dashboard with stats
- Action cards for different editors
- Menu data editor
- Rebate data editor
- Calendar data editor
- Logout functionality

**Scripts Used:**
- `assets/scripts/admin.js` - Admin functionality

---

#### `404.html`
**Purpose:** Custom error page
**What it does:**
- Displays when page not found
- Provides link back to home
- Maintains site branding

---

### **JavaScript Files**

#### `assets/scripts/app-shell.js`
**Purpose:** Core application functionality (loaded on all pages)
**What it does:**
- Theme management (light/dark/auto)
- Navigation toggle (mobile menu)
- Profile panel management
- Profile data storage/retrieval
- QR code handling
- Date formatting
- Service Worker registration
- PWA install prompt

**Key Functions:**
- `initTheme()` - Sets up theme system
- `applyTheme()` - Applies selected theme
- `initProfile()` - Manages profile panel
- `renderProfileBadge()` - Updates profile button
- `renderProfileForm()` - Populates profile form
- `renderProfileQr()` - Displays QR code

---

#### `assets/scripts/home.js`
**Purpose:** Home page specific functionality
**What it does:**
- QR code upload handling
- QR code image preview
- QR text decoding
- QR removal functionality

**Key Features:**
- File upload with preview
- Image to text conversion
- Manual QR text input
- LocalStorage storage

---

#### `assets/scripts/menu.js`
**Purpose:** Mess menu page functionality
**What it does:**
- Loads menu data
- Renders menu tabs (Veg/Non-Veg)
- Day selector functionality
- Menu card rendering
- Meal rating system
- Rating storage/export
- Meal reminder notifications

**Key Features:**
- Auto-selects today's menu
- Plan switching
- Star rating system
- CSV export for ratings
- Browser notification reminders

---

#### `assets/scripts/rebates.js`
**Purpose:** Rebate lookup functionality
**What it does:**
- Loads rebate dataset
- Search by roll number
- Displays student information
- Shows rebate calculations
- Month-wise breakdown table
- Recent searches storage
- Statistics display

**Key Features:**
- Instant search
- Recent searches list
- Clear search functionality
- Empty state handling
- Data validation

---

#### `assets/scripts/calendar.js`
**Purpose:** Academic calendar rendering
**What it does:**
- Loads calendar events
- Creates month-wise grid
- Renders calendar cells
- Event badge display
- Month selector functionality
- PDF opening

**Key Features:**
- Calendar grid layout
- Event color coding
- Month filtering
- Current month default

---

#### `assets/scripts/admin.js`
**Purpose:** Admin functionality
**What it does:**
- Login authentication
- Session management
- Dashboard protection
- Data editor functionality
- Save/reset operations
- Notification system

**Key Features:**
- Credential validation
- LocalStorage session
- Editor switching
- JSON validation
- Success/error notifications

---

### **Build Scripts**

#### `scripts/build-dataset.mjs`
**Purpose:** Processes raw CSV files into JavaScript datasets
**What it does:**
- Reads CSV files from `data__/` folder
- Parses Mess Bill CSVs
- Parses Menu CSVs
- Processes Academic Calendar
- Generates JavaScript files
- Copies PDF files

**Key Functions:**
- `buildRebateDataset()` - Processes rebate CSVs
- `buildMenuDataset()` - Processes menu CSVs
- `buildCalendarAssets()` - Handles calendar files
- `parseCsvAsMatrix()` - CSV parsing utility
- `calculateRebates()` - Rebate calculations

**Output:**
- `data/rebates-data.js` - Student rebate data
- `data/menu-data.js` - Menu schedules
- `assets/academic-calendar.pdf` - Calendar PDF

---

#### `scripts/preview.mjs`
**Purpose:** Local development server
**What it does:**
- Starts HTTP server on port 4173
- Serves static files
- Handles MIME types
- Directory index support

**Usage:**
```bash
npm run preview
# Serves at http://localhost:4173
```

---

### **Data Files**

#### `data/rebates-data.js`
**Purpose:** Student rebate dataset (generated)
**Format:**
```javascript
window.MESS_REBATE_DATA = {
  generatedAt: "2025-01-01T00:00:00.000Z",
  ratePerAbsentDay: 140,
  totalStudents: 500,
  months: ["January 2025", "February 2025", ...],
  students: {
    "B25EE1001": {
      rollNo: "B25EE1001",
      name: "Student Name",
      totals: { presentDays: 25, absentDays: 5, rebateAmount: 700 },
      records: [...],
      semesters: [...]
    }
  }
}
```

---

#### `data/menu-data.js`
**Purpose:** Mess menu dataset (generated)
**Format:**
```javascript
window.MESS_MENU_DATA = {
  generatedAt: "2025-01-01T00:00:00.000Z",
  plans: [
    {
      id: "veg-november",
      type: "veg",
      label: "Veg Menu November",
      schedule: {
        "Monday": {
          breakfast: "...",
          lunch: "...",
          snacks: "...",
          dinner: "..."
        }
      }
    }
  ]
}
```

---

#### `data/academic_events.json`
**Purpose:** Academic calendar events
**Format:**
```json
{
  "july_2025": {
    "name": "July 2025",
    "events": [
      { "date": "01 Jul", "title": "Campus Reopens", "category": "academic" }
    ]
  }
}
```

---

#### `data/admin.json`
**Purpose:** Admin credentials
**Format:**
```json
{
  "username": "admin",
  "password": "12345"
}
```

---

### **Configuration Files**

#### `package.json`
**Purpose:** NPM project configuration
**Scripts:**
- `npm run build` - Builds data files
- `npm run build:data` - Processes CSVs
- `npm run preview` - Local server
- `npm start` - Alias for preview

---

#### `manifest.json`
**Purpose:** PWA manifest for "Add to Home Screen"
**What it defines:**
- App name and description
- Icons (various sizes)
- Start URL
- Display mode
- Theme colors
- App shortcuts

---

#### `sw.js`
**Purpose:** Service Worker for offline functionality
**What it does:**
- Caches app resources
- Enables offline access
- Handles background sync
- Meal reminder notifications

**Cache Strategy:**
- Cache first, network fallback
- Updates cache on new versions
- Cleans old caches

---

#### `vercel.json`
**Purpose:** Vercel deployment configuration
**Settings:**
- Build command
- Output directory
- Headers (Service Worker, Cache)
- Clean URLs

---

#### `.github/workflows/deploy.yml`
**Purpose:** GitHub Actions workflow
**What it does:**
- Triggers on push to main/master
- Installs Node.js
- Runs build process
- Deploys to GitHub Pages

---

### **Styling**

#### `assets/styles/main.css`
**Purpose:** All application styles
**Organization:**
1. CSS Variables & Base Styles
2. Common Components (Header, Navigation, Profile Panel, Buttons, Cards)
3. Home Page Styles
4. Rebates Page Styles
5. Mess Menu Page Styles
6. Academic Calendar Page Styles
7. Login Page Styles
8. Admin Dashboard Styles
9. Dark Mode Overrides
10. Responsive Design

**Key Features:**
- CSS Custom Properties (variables)
- Dark/Light theme support
- Responsive breakpoints
- Smooth animations
- Professional gradients

---

## 🔀 Data Flow

### **Rebate Data Flow:**
```
CSV Files (data__/Mess Bill/)
    ↓
build-dataset.mjs (parses CSVs)
    ↓
Calculates rebates per student
    ↓
Generates rebates-data.js
    ↓
rebates.html loads data
    ↓
User searches by roll number
    ↓
Results displayed
```

### **Menu Data Flow:**
```
CSV Files (data__/Menu/)
    ↓
build-dataset.mjs (parses CSVs)
    ↓
Organizes by day and meal
    ↓
Generates menu-data.js
    ↓
mess-menu.html loads data
    ↓
Displays today's menu
    ↓
User can switch days/plans
```

### **Calendar Data Flow:**
```
PDF + JSON (data__/Academic Calender/)
    ↓
build-dataset.mjs (copies PDF, uses JSON)
    ↓
PDF → assets/academic-calendar.pdf
    ↓
JSON → data/academic_events.json
    ↓
academic-calendar.html loads JSON
    ↓
Renders calendar grid
    ↓
User can filter by month
```

---

## 🚀 Deployment Process

### **GitHub Pages:**
1. Push code to GitHub
2. GitHub Actions workflow triggers
3. Builds data files (`npm run build:data`)
4. Deploys root directory
5. Site available at `username.github.io/repo-name`

### **Vercel:**
1. Connect GitHub repo to Vercel
2. Vercel detects `vercel.json`
3. Runs build command
4. Deploys root directory
5. Site available at custom Vercel URL

### **Local Development:**
1. Run `npm install`
2. Run `npm run build:data` (process CSVs)
3. Run `npm run preview` (local server)
4. Open `http://localhost:4173`

---

## 🔑 Key Concepts

### **Offline-First Architecture:**
- All data loaded as JavaScript files
- No API calls required
- Service Worker caches resources
- Works without internet after initial load

### **Progressive Web App (PWA):**
- Installable on devices
- Works like native app
- Offline capability
- Push notifications support

### **Data Processing:**
- Raw CSVs → Processed JavaScript
- Build step required for updates
- Data stored in window objects
- Easy to query and display

### **LocalStorage Usage:**
- Theme preferences
- User profile
- QR codes
- Admin session
- Recent searches
- Meal ratings

---

## 📝 Maintenance Guide

### **Adding New Mess Bill Data:**
1. Add CSV file to `data__/Mess Bill/`
2. Run `npm run build:data`
3. New data appears in rebates page

### **Updating Menu:**
1. Add new CSV to `data__/Menu/`
2. Run `npm run build:data`
3. Menu updates automatically

### **Updating Calendar:**
1. Update `data__/Academic Calender/calendar-events.json`
2. Replace PDF if needed
3. Run `npm run build:data`

### **Changing Admin Credentials:**
1. Edit `data/admin.json`
2. Commit changes
3. New credentials take effect immediately

---

## 🎨 Design Philosophy

- **Clean & Minimal**: Simple, uncluttered interface
- **Offline-First**: Works without internet
- **User-Friendly**: Intuitive navigation
- **Responsive**: Works on all devices
- **Accessible**: Proper ARIA labels and semantic HTML
- **Fast**: Optimized loading and caching

---

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Pure CSS with Custom Properties
- **Build Tool**: Node.js scripts
- **Deployment**: GitHub Pages + Vercel
- **PWA**: Service Worker + Manifest
- **Data Format**: CSV → JavaScript

---

## 📚 Additional Resources

- See `README.md` for setup instructions
- See `scripts/generate-icons.md` for PWA icon generation
- Check `.github/workflows/deploy.yml` for CI/CD details
- Review `vercel.json` for Vercel configuration

---

**Last Updated:** 2025
**Version:** 2.0.0
**License:** MIT

