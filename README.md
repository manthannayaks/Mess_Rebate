# Campus Mess Companion (Offline)

Clean, institute-neutral dashboard that works entirely offline. Drop your latest mess bills, menus, and academic calendar files into `data__/`, regenerate the datasets, and open the static pages from the root directory. The app now ships three dedicated sections:

- **Landing page:** Minimal overview with links to every tool.
- **Mess Rebate:** Fast roll-number lookup with totals and month-wise tables.
- **Mess Menu:** Stylish day-by-day layout for both vegetarian and non-vegetarian plans.
- **Academic Calendar:** Calendar-grid view of holidays/events plus an “Open Full Calendar” button for the official PDF.

## Experience highlights

- **Theme toggle (Auto / Light / Dark):** Present on every page so the UI can follow the OS preference or override it instantly.
- **Mess feedback hub:** Students can log 5-star ratings + comments for each meal, and staff can export all offline feedback as CSV.
- **Meal reminder switches:** Browser notifications (breakfast, lunch, snacks, dinner) keep everyone on schedule even without internet—just leave the tab open.
- **QR pass locker:** Each student profile stores a QR image + decoded text locally so entry scans stay handy even when the network drops.

## Project structure

```
data__/                         Raw offline files you maintain
  ├─ Mess Bill/*.csv            ← monthly rebate data (2025 onward)
  ├─ Menu/*.csv                 ← veg / non-veg plans
  └─ Academic Calender/
       ├─ Academic_*.pdf        ← official calendar PDF
       └─ calendar-events.json  ← structured events for dashboard view
index.html                      ← landing page (root)
mess-menu.html                  ← menu page
rebates.html                    ← rebate lookup
academic-calendar.html          ← calendar board
login.html                      ← admin login
admin-dashboard.html            ← admin dashboard
404.html                        ← custom 404 page
assets/                         ← CSS + JS + copied PDF
  ├─ styles/main.css
  ├─ scripts/
  └─ academic-calendar.pdf
data/                           ← auto-generated JS datasets
  ├─ rebates-data.js
  ├─ menu-data.js
  └─ academic_events.json
scripts/
  ├─ build-dataset.mjs          ← parses data__/ and rewrites data/*
  └─ preview.mjs                ← lightweight static server (optional)
```

## Getting started

```bash
npm install          # only once
npm run build:data   # parse CSVs + copy PDF + emit JS datasets
npm run preview      # serve at http://localhost:4173
```

Prefer to double-click `index.html`? That works offline too—just remember to rebuild data whenever the CSV/PDF files change.

## Updating data

1. **Mess bills:** Drop the latest month’s CSV inside `data__/Mess Bill/` (file name should include the month + year, e.g. `November 2025 Mess Bill.csv`).
2. **Menus:** Export the veg/non-veg planner as CSV and place them in `data__/Menu/`. The build script auto-detects plan type based on the filename (looks for “non” to treat it as non-veg).
3. **Academic calendar:**
   - Copy the PDF into `data__/Academic Calender/`.
   - Update `calendar-events.json` to keep the on-page grid in sync (see the existing file for the schema).
4. Run `npm run build:data` to refresh `data/*.js` and copy the PDF into `assets/`.

The root directory contains all files needed for deployment—no databases, APIs, or internet access required.

## Deploying to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Initial Setup

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

3. **The deployment will happen automatically:**
   - Every push to `main` or `master` branch triggers a build and deployment
   - The workflow builds the data files and deploys from the root directory
   - Your site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Manual Deployment

You can also trigger a manual deployment:
- Go to **Actions** tab in your repository
- Select **Deploy to GitHub Pages** workflow
- Click **Run workflow**

## Deploying to Vercel

This project is also configured for deployment to Vercel.

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **For production:**
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. **Connect your GitHub repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New Project**
   - Import your GitHub repository

2. **Configure project:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `.` (root)
   - **Install Command:** `npm install`

3. **Deploy:**
   - Click **Deploy**
   - Vercel will automatically build and deploy your site

### Vercel Configuration

The project includes `vercel.json` with:
- Build command configuration
- Service worker headers
- Cache control for static assets
- Clean URLs enabled

### Important Notes

- The `.nojekyll` file in the root prevents Jekyll processing (GitHub Pages)
- A custom `404.html` page is included for better error handling
- The build process runs automatically on every push
- All files are organized in the root directory for compatibility with both platforms
- Service worker is configured to work with both GitHub Pages and Vercel

## Notes & assumptions

- Rebates are calculated as `absent_days × ₹140`. Adjust `RATE_PER_ABSENT_DAY` in `scripts/build-dataset.mjs` if the policy changes.
- The parser targets 2025-onward data; older months are ignored automatically.
- Menu CSVs may come from Excel exports—keep the first column as the day name and the second as the meal name (Breakfast/Lunch/Snacks/Dinner) for reliable parsing.
- Calendar events are flexible. Use categories such as `holiday`, `exam`, `break`, `event`, `milestone`, or `academic` to control badge colors in the grid.

Happy tracking! 🚀
