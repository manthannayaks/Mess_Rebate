# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Add Your Data
Place your CSV files in the `data__/` folder:
- **Mess Bills**: `data__/Mess Bill/*.csv`
- **Menus**: `data__/Menu/*.csv`
- **Calendar**: `data__/Academic Calender/calendar-events.json` and PDF

### Step 3: Build and Run
```bash
npm run build:data    # Process your CSV files
npm run preview       # Start local server
```

Open `http://localhost:4173` in your browser!

---

## 📁 Folder Organization

### **Root Files** (Main Pages)
- `index.html` - Home page
- `mess-menu.html` - Menu viewer
- `rebates.html` - Rebate lookup
- `academic-calendar.html` - Calendar
- `login.html` - Admin login
- `admin-dashboard.html` - Admin panel

### **assets/** (Static Resources)
- `styles/main.css` - All styles
- `scripts/*.js` - Page-specific JavaScript
- `icons/` - PWA icons (add your icons here)
- `academic-calendar.pdf` - Calendar PDF

### **data/** (Generated Data)
- `rebates-data.js` - Generated from CSV
- `menu-data.js` - Generated from CSV
- `academic_events.json` - Calendar events
- `admin.json` - Admin credentials

### **data__/** (Your Input Data)
- `Mess Bill/` - Place CSV files here
- `Menu/` - Place CSV files here
- `Academic Calender/` - Place PDF and JSON here

### **scripts/** (Build Tools)
- `build-dataset.mjs` - Processes CSVs
- `preview.mjs` - Local server

---

## 🔄 Common Tasks

### Update Mess Bills
1. Add new CSV to `data__/Mess Bill/`
2. Run `npm run build:data`
3. Refresh browser

### Update Menu
1. Add new CSV to `data__/Menu/`
2. Run `npm run build:data`
3. Refresh browser

### Change Admin Password
1. Edit `data/admin.json`
2. Save file
3. Changes take effect immediately

### Deploy to GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages in Settings
3. Select "GitHub Actions" as source
4. Done! Auto-deploys on every push

### Deploy to Vercel
1. Connect repo to Vercel
2. Vercel auto-detects config
3. Deploy!

---

## 🐛 Troubleshooting

**Build fails?**
- Check CSV file format
- Ensure `data__/` folder exists
- Check file names match expected format

**Service Worker not working?**
- Clear browser cache
- Check browser console for errors
- Ensure HTTPS (required for service workers)

**Data not showing?**
- Run `npm run build:data` again
- Check browser console for errors
- Verify data files exist in `data/` folder

---

## 📖 Need More Details?

See `PROJECT_DOCUMENTATION.md` for complete documentation.

