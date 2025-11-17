# Campus Mess Companion (Offline)

Clean, institute-neutral dashboard that works entirely offline. Drop your latest mess bills, menus, and academic calendar files into `data__/`, regenerate the datasets, and open the static pages under `public/`. The app now ships three dedicated sections:

- **Landing page:** Minimal overview with links to every tool.
- **Mess Rebate:** Fast roll-number lookup with totals and month-wise tables.
- **Mess Menu:** Stylish day-by-day layout for both vegetarian and non-vegetarian plans.
- **Academic Calendar:** Calendar-grid view of holidays/events plus an “Open Full Calendar” button for the official PDF.

## Project structure

```
data__/                         Raw offline files you maintain
  ├─ Mess Bill/*.csv            ← monthly rebate data (2025 onward)
  ├─ Menu/*.csv                 ← veg / non-veg plans
  └─ Academic Calender/
       ├─ Academic_*.pdf        ← official calendar PDF
       └─ calendar-events.json  ← structured events for dashboard view
public/
  ├─ index.html                 ← landing page
  ├─ mess-menu.html             ← menu page
  ├─ rebates.html               ← rebate lookup
  ├─ academic-calendar.html     ← calendar board
  ├─ assets/                    ← CSS + JS + copied PDF
  └─ data/                      ← auto-generated JS datasets
scripts/
  ├─ build-dataset.mjs          ← parses data__/ and rewrites public/data/*
  └─ preview.mjs                ← lightweight static server (optional)
```

## Getting started

```bash
npm install          # only once
npm run build:data   # parse CSVs + copy PDF + emit JS datasets
npm run preview      # serve ./public at http://localhost:4173
```

Prefer to double-click `public/index.html`? That works offline too—just remember to rebuild data whenever the CSV/PDF files change.

## Updating data

1. **Mess bills:** Drop the latest month’s CSV inside `data__/Mess Bill/` (file name should include the month + year, e.g. `November 2025 Mess Bill.csv`).
2. **Menus:** Export the veg/non-veg planner as CSV and place them in `data__/Menu/`. The build script auto-detects plan type based on the filename (looks for “non” to treat it as non-veg).
3. **Academic calendar:**
   - Copy the PDF into `data__/Academic Calender/`.
   - Update `calendar-events.json` to keep the on-page grid in sync (see the existing file for the schema).
4. Run `npm run build:data` to refresh `public/data/*.js` and copy the PDF into `public/assets/`.

The resulting `public/` folder is the only thing you need to share or deploy—no databases, APIs, or internet access required.

## Notes & assumptions

- Rebates are calculated as `absent_days × ₹140`. Adjust `RATE_PER_ABSENT_DAY` in `scripts/build-dataset.mjs` if the policy changes.
- The parser targets 2025-onward data; older months are ignored automatically.
- Menu CSVs may come from Excel exports—keep the first column as the day name and the second as the meal name (Breakfast/Lunch/Snacks/Dinner) for reliable parsing.
- Calendar events are flexible. Use categories such as `holiday`, `exam`, `break`, `event`, `milestone`, or `academic` to control badge colors in the grid.

Happy tracking! 🚀
