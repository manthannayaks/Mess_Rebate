# Mess Rebate Tracker – Offline Edition

This repository now provides a single-page offline app that bundles every mess report between **July&nbsp;2024 and October&nbsp;2025** into a searchable dataset. Enter any roll number to instantly view month-wise attendance and the total rebate earned so far.

## Project structure

```
Data__/                Raw monthly reports (CSV + PDF)
public/                Static, offline-ready web app
  ├─ data/rebates-data.js   ← auto-generated dataset
  ├─ app.js / styles.css    ← UI + interaction logic
scripts/
  ├─ build-dataset.mjs      ← parses Data__/ and builds the dataset
  └─ preview.mjs            ← tiny static file server for local preview
package.json
```

## Usage

1. **Install dependencies** (only once):
   ```bash
   npm install
   ```

2. **Generate the dataset** whenever you drop new monthly reports into `Data__/`:
   ```bash
   npm run build:data
   ```
   This script parses every CSV/PDF report, normalises the data, and rewrites `public/data/rebates-data.js`.  
   It also looks at `Data__/Menu/` for `*.csv` files (veg & non-veg menus) and emits `public/data/menu-data.js` for the Mess Menu section.

3. **View the app** (pick one):
   - Double-click `public/index.html` for a fully offline experience, or
   - Run a local server:
     ```bash
     npm start
     ```
     then open http://localhost:4173

## Updating data going forward

1. Save the new month’s CSV/PDF inside the `Data__/` folder. File names just need to include the month and year (e.g. `November 2025 Mess Bill.csv`).
2. Run `npm run build:data`. The script auto-detects the month, parses the file (supports both CSV and the IITJ PDF template), and recalculates every student’s totals.
3. Redeploy or share the refreshed `public/` folder. No backend or internet connection is required for lookups—the entire dataset ships with the UI.

### Mess Menu updates

1. Drop the latest Veg/Non-Veg menu CSVs into `Data__/Menu/`. (You can export Excel menus as CSV; name them something like `Veg November.csv`, `Non-Veg November.csv`.)
2. Run `npm run build:data` to regenerate `public/data/menu-data.js`.
3. Open the “Mess Menu” tab in the app to verify both menus render with the new dishes.

### Academic calendar

Place the official PDF in `Data__/Academic_Calender/` (any filename works). The build script copies the most recent PDF to `public/assets/academic-calendar.pdf`, and the dashboard download button will automatically serve the new file.

## Notes

- Rebate amounts are computed as `absent_days × ₹140` for every month.
- `scripts/build-dataset.mjs` is resilient to minor header/column differences, but keeping the IITJ export format avoids surprises.
- `public/data/rebates-data.js` can become large (~10&nbsp;MB) because it contains records for every roll number. That’s expected for completely offline use.

Happy tracking! 🚀
