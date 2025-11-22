# 🔄 Code Flow - How Everything Works Together

## Complete Application Flow

### **1. Initial Load Sequence**

```
User opens index.html
    ↓
Browser loads:
  - HTML structure
  - CSS (main.css)
  - JavaScript (app-shell.js, home.js)
    ↓
app-shell.js executes:
  - Registers Service Worker
  - Loads theme preference
  - Initializes profile system
  - Sets up navigation
    ↓
home.js executes:
  - Sets up QR upload handlers
  - Loads saved QR data
    ↓
Page is ready for interaction
```

---

### **2. Navigation Flow**

```
User clicks navigation link
    ↓
Browser loads new HTML page
    ↓
Page-specific script loads:
  - mess-menu.html → menu.js
  - rebates.html → rebates.js
  - academic-calendar.html → calendar.js
    ↓
Script loads corresponding data file:
  - menu.js → data/menu-data.js
  - rebates.js → data/rebates-data.js
  - calendar.js → data/academic_events.json
    ↓
Data is parsed and displayed
```

---

### **3. Data Processing Flow**

```
Developer adds CSV files to data__/
    ↓
Runs: npm run build:data
    ↓
build-dataset.mjs executes:
  ├─ Reads CSV files
  ├─ Parses data
  ├─ Calculates rebates
  ├─ Organizes menus
  └─ Generates JavaScript files
    ↓
Files written to data/ folder:
  - rebates-data.js
  - menu-data.js
    ↓
Next page load uses new data
```

---

### **4. Rebate Search Flow**

```
User types roll number in rebates.html
    ↓
rebates.js listens for input
    ↓
Searches window.MESS_REBATE_DATA.students
    ↓
Finds matching student:
  - Calculates totals
  - Formats month-wise data
  - Prepares display
    ↓
Updates DOM with results
    ↓
Saves to recent searches (localStorage)
```

---

### **5. Menu Display Flow**

```
User opens mess-menu.html
    ↓
menu.js loads window.MESS_MENU_DATA
    ↓
Determines today's day
    ↓
Finds matching menu plan
    ↓
Renders menu cards:
  - Breakfast
  - Lunch
  - Snacks
  - Dinner
    ↓
User can switch:
  - Day (Monday-Sunday)
  - Plan (Veg/Non-Veg)
```

---

### **6. Calendar Rendering Flow**

```
User opens academic-calendar.html
    ↓
calendar.js fetches academic_events.json
    ↓
Parses month data
    ↓
Creates calendar grid:
  - Day headers (Sun-Sat)
  - Date cells
  - Event badges
    ↓
Renders month cards
    ↓
User can filter by month
```

---

### **7. Profile Management Flow**

```
User clicks profile button
    ↓
app-shell.js opens profile panel
    ↓
Loads saved profile from localStorage
    ↓
Populates form fields
    ↓
User edits and saves
    ↓
Data saved to localStorage
    ↓
Profile badge updates
```

---

### **8. Admin Login Flow**

```
User opens login.html
    ↓
Enters credentials
    ↓
admin.js fetches data/admin.json
    ↓
Validates credentials
    ↓
If valid:
  - Saves session to localStorage
  - Redirects to admin-dashboard.html
    ↓
Dashboard loads with editor access
```

---

### **9. Service Worker Flow**

```
Page loads
    ↓
app-shell.js registers sw.js
    ↓
Service Worker installs:
  - Caches all resources
  - Stores in browser cache
    ↓
On subsequent visits:
  - Serves from cache
  - Updates in background
    ↓
Enables offline functionality
```

---

### **10. Theme System Flow**

```
Page loads
    ↓
app-shell.js checks localStorage
    ↓
Gets theme preference:
  - 'auto' → Uses OS preference
  - 'light' → Light theme
  - 'dark' → Dark theme
    ↓
Applies theme via data-theme attribute
    ↓
CSS variables update
    ↓
Page re-renders with new theme
```

---

## 🔗 File Dependencies

### **index.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/app-shell.js`
- `assets/scripts/home.js`

### **mess-menu.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/app-shell.js`
- `assets/scripts/menu.js`
- `data/menu-data.js`

### **rebates.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/app-shell.js`
- `assets/scripts/rebates.js`
- `data/rebates-data.js`

### **academic-calendar.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/app-shell.js`
- `assets/scripts/calendar.js`
- `data/academic_events.json`

### **login.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/admin.js`
- `data/admin.json`

### **admin-dashboard.html depends on:**
- `assets/styles/main.css`
- `assets/scripts/admin.js`
- All data files (for editing)

---

## 🎯 Execution Order

### **On Every Page Load:**

1. **HTML Parsing**
   - Browser reads HTML
   - Creates DOM structure

2. **CSS Loading**
   - `main.css` loads
   - Styles applied
   - Theme variables set

3. **JavaScript Execution**
   - `app-shell.js` runs first (defer)
   - Page-specific script runs (defer)
   - Data files load (if needed)

4. **Service Worker**
   - Registers in background
   - Caches resources

5. **User Interaction Ready**
   - All handlers attached
   - Data loaded
   - Page interactive

---

## 🔄 State Management

### **LocalStorage Keys:**

| Key | Purpose | Used By |
|-----|---------|---------|
| `mess-theme-choice` | Theme preference | app-shell.js |
| `mess-profile` | Student profile | app-shell.js |
| `user-qr-pass` | QR code data | app-shell.js, home.js |
| `admin-logged-in` | Admin session | admin.js |
| `menuData` | Admin menu edits | admin.js |
| `rebateData` | Admin rebate edits | admin.js |
| `calendarData` | Admin calendar edits | admin.js |
| `mess-menu-ratings` | Meal ratings | menu.js |
| `mess-reminder-prefs` | Reminder settings | menu.js |

---

## 🎨 Styling Cascade

```
CSS Variables (root)
    ↓
Base Styles (body, img, a)
    ↓
Common Components (header, nav, buttons)
    ↓
Page-Specific Styles
    ↓
Dark Mode Overrides
    ↓
Responsive Breakpoints
```

---

## 📊 Data Structure

### **Rebate Data:**
```javascript
window.MESS_REBATE_DATA = {
  generatedAt: "timestamp",
  ratePerAbsentDay: 140,
  totalStudents: number,
  months: ["January 2025", ...],
  students: {
    "ROLL_NUMBER": {
      rollNo: string,
      name: string,
      totals: {...},
      records: [...],
      semesters: [...]
    }
  }
}
```

### **Menu Data:**
```javascript
window.MESS_MENU_DATA = {
  generatedAt: "timestamp",
  plans: [
    {
      id: string,
      type: "veg" | "nonveg",
      label: string,
      schedule: {
        "Monday": {...},
        "Tuesday": {...}
      }
    }
  ]
}
```

---

## 🚀 Build Process Details

### **Step-by-Step Build:**

1. **Read Raw Data**
   ```javascript
   fs.readdir(BILL_DIR)  // Get CSV files
   ```

2. **Parse CSV**
   ```javascript
   parseCsvAsMatrix()  // Convert to array
   ```

3. **Process Data**
   ```javascript
   calculateRebates()  // Calculate totals
   organizeMenus()      // Structure menus
   ```

4. **Generate Output**
   ```javascript
   fs.writeFile()  // Write JavaScript files
   ```

5. **Copy Assets**
   ```javascript
   fs.copyFile()  // Copy PDFs
   ```

---

## 🔐 Security Flow

### **Admin Authentication:**

```
User submits login form
    ↓
admin.js prevents default submit
    ↓
Fetches data/admin.json
    ↓
Compares credentials
    ↓
If match:
  - Sets localStorage flag
  - Redirects to dashboard
If no match:
  - Shows error message
```

### **Dashboard Protection:**

```
User navigates to admin-dashboard.html
    ↓
admin.js checks localStorage
    ↓
If not logged in:
  - Redirects to login.html
If logged in:
  - Loads dashboard
```

---

## 📱 PWA Flow

### **Installation:**

```
User visits site
    ↓
Service Worker registers
    ↓
Browser shows install prompt
    ↓
User clicks "Install"
    ↓
App installed to home screen
    ↓
Works like native app
```

### **Offline Access:**

```
User visits site (first time)
    ↓
Service Worker caches resources
    ↓
User goes offline
    ↓
Service Worker serves from cache
    ↓
App works without internet
```

---

## 🎯 Key Functions Reference

### **app-shell.js:**
- `initTheme()` - Theme system setup
- `applyTheme()` - Apply theme
- `initProfile()` - Profile management
- `renderProfileBadge()` - Update UI
- `saveProfile()` - Save to localStorage

### **menu.js:**
- `renderTabs()` - Plan selector
- `renderMenu()` - Display menu
- `initRatings()` - Rating system
- `initReminders()` - Notifications

### **rebates.js:**
- `searchStudent()` - Find by roll number
- `displayResults()` - Show data
- `saveRecent()` - Store searches

### **calendar.js:**
- `loadEvents()` - Fetch JSON
- `renderCalendar()` - Create grid
- `createCalendarGrid()` - Build cells

### **admin.js:**
- `loadAdminData()` - Get credentials
- `showNotification()` - User feedback
- Editor save/reset functions

---

This flow diagram shows how all components work together to create a seamless offline-first experience!

