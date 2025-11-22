# 📂 Project Folder Structure

## Visual Organization

```
Campus Mess Companion/
│
├── 🏠 WEB PAGES (User-Facing)
│   ├── index.html              → Landing page / Home
│   ├── mess-menu.html          → Daily menu viewer
│   ├── rebates.html            → Student rebate lookup
│   ├── academic-calendar.html  → Calendar with events
│   ├── login.html              → Admin authentication
│   ├── admin-dashboard.html    → Admin control panel
│   └── 404.html                → Error page
│
├── 🎨 ASSETS (Visual & Interactive)
│   └── assets/
│       ├── styles/
│       │   └── main.css        → All styling (organized by page)
│       │
│       ├── scripts/
│       │   ├── app-shell.js    → Core features (theme, profile, PWA)
│       │   ├── home.js         → Home page features (QR upload)
│       │   ├── menu.js         → Menu page logic
│       │   ├── rebates.js      → Rebate search logic
│       │   ├── calendar.js     → Calendar rendering
│       │   └── admin.js        → Admin functionality
│       │
│       ├── icons/              → PWA icons (72x72 to 512x512)
│       └── academic-calendar.pdf → Full calendar PDF
│
├── 💾 DATA (Generated & Config)
│   └── data/
│       ├── rebates-data.js     → Student rebate data (from CSV)
│       ├── menu-data.js         → Menu schedules (from CSV)
│       ├── academic_events.json → Calendar events
│       └── admin.json          → Admin login credentials
│
├── 🔧 BUILD TOOLS (Development)
│   └── scripts/
│       ├── build-dataset.mjs   → CSV → JavaScript converter
│       ├── preview.mjs         → Local development server
│       └── generate-icons.md   → Icon generation guide
│
├── 📥 RAW DATA (Your Input)
│   └── data__/
│       ├── Mess Bill/          → Place CSV files here
│       │   └── *.csv           → Monthly mess bill files
│       │
│       ├── Menu/               → Place CSV files here
│       │   ├── Veg Menu *.csv
│       │   └── Non-Veg Menu *.csv
│       │
│       └── Academic Calender/ → Place files here
│           ├── Academic_*.pdf  → Full calendar PDF
│           └── calendar-events.json → Events data
│
├── ⚙️ CONFIGURATION (Settings)
│   ├── package.json            → NPM scripts & metadata
│   ├── manifest.json           → PWA configuration
│   ├── sw.js                   → Service Worker (offline support)
│   ├── vercel.json             → Vercel deployment config
│   ├── .nojekyll               → GitHub Pages config
│   ├── .gitignore              → Git ignore rules
│   └── .vercelignore           → Vercel ignore rules
│
├── 🚀 DEPLOYMENT (CI/CD)
│   └── .github/
│       └── workflows/
│           └── deploy.yml      → Auto-deploy to GitHub Pages
│
└── 📚 DOCUMENTATION
    ├── README.md               → Main documentation
    ├── PROJECT_DOCUMENTATION.md → Complete technical docs
    ├── QUICK_START.md          → Quick reference guide
    └── FOLDER_STRUCTURE.md    → This file
```

---

## 📋 Folder Purposes

### **Root Level HTML Files**
These are the main pages users interact with. Each page is self-contained and loads its specific JavaScript.

### **assets/** Folder
Contains all static resources:
- **styles/**: All CSS in one organized file
- **scripts/**: JavaScript files organized by functionality
- **icons/**: PWA icons for "Add to Home Screen"
- **PDFs**: Static documents

### **data/** Folder
Contains processed/generated data:
- Files here are created by `build-dataset.mjs`
- These are the files the web pages actually use
- **Never edit these directly** - edit source files in `data__/` instead

### **data__/** Folder
Your input folder:
- Place raw CSV files here
- Build script processes these
- Keep original data here for version control

### **scripts/** Folder
Build and development tools:
- `build-dataset.mjs`: Main data processor
- `preview.mjs`: Local server for testing
- Helper scripts and guides

### **Configuration Files**
Settings for different services:
- `package.json`: NPM configuration
- `manifest.json`: PWA settings
- `sw.js`: Offline functionality
- `vercel.json`: Vercel deployment
- `.github/workflows/`: CI/CD automation

---

## 🔄 Data Flow Between Folders

```
data__/ (Your Input)
    ↓
scripts/build-dataset.mjs (Processing)
    ↓
data/ (Generated Output)
    ↓
HTML Pages (Display)
```

---

## 📝 File Naming Conventions

### HTML Files
- `kebab-case.html` (e.g., `mess-menu.html`)
- Descriptive names
- Matches page purpose

### JavaScript Files
- `kebab-case.js` (e.g., `app-shell.js`)
- Matches HTML page name when page-specific
- `app-shell.js` is the exception (core functionality)

### Data Files
- `kebab-case.js` or `.json` (e.g., `rebates-data.js`)
- Descriptive of content
- `.js` for generated data, `.json` for config

### CSV Files
- Should include month/year in name
- Example: `January 2025 Mess Bill.csv`
- Menu files: `Veg Menu November.csv`

---

## 🎯 Key Principles

1. **Separation of Concerns**
   - HTML = Structure
   - CSS = Styling
   - JS = Functionality
   - Data = Content

2. **Clear Organization**
   - Related files grouped together
   - Logical folder structure
   - Easy to find what you need

3. **Build Process**
   - Raw data in `data__/`
   - Processed data in `data/`
   - Never mix them

4. **Documentation**
   - README for users
   - PROJECT_DOCUMENTATION for developers
   - QUICK_START for beginners

---

## 🔍 Finding Files

**Looking for...**

- **A page?** → Check root level HTML files
- **Styling?** → `assets/styles/main.css`
- **JavaScript logic?** → `assets/scripts/`
- **Data processing?** → `scripts/build-dataset.mjs`
- **Configuration?** → Root level JSON files
- **Raw data?** → `data__/` folder
- **Generated data?** → `data/` folder

---

This structure is designed to be:
- ✅ Easy to navigate
- ✅ Self-explanatory
- ✅ Scalable
- ✅ Maintainable

