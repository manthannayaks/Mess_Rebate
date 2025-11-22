import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const RAW_DATA_DIR = path.resolve(ROOT, 'data__');
const BILL_DIR = path.join(RAW_DATA_DIR, 'Mess Bill');
const MENU_DIR = path.join(RAW_DATA_DIR, 'Menu');
const CALENDAR_DIR = path.join(RAW_DATA_DIR, 'Academic Calender');

const PUBLIC_DIR = path.resolve(ROOT);
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const ASSET_DIR = path.join(PUBLIC_DIR, 'assets');

const REBATE_DATA_FILE = path.join(DATA_DIR, 'rebates-data.js');
const MENU_DATA_FILE = path.join(DATA_DIR, 'menu-data.js');
const CALENDAR_DATA_FILE = path.join(DATA_DIR, 'calendar-data.js');
const CALENDAR_PDF_FILE = path.join(ASSET_DIR, 'academic-calendar.pdf');

const RATE_PER_ABSENT_DAY = 140; // used as per-day rate (also used as per-day usedAmount multiplier)
const EARLIEST_YEAR = 2025;

/**
 * SEMESTER CONFIGURATION
 * - paid: amount paid for that semester (set to 0 if not paid yet)
 * - start/end: { year, monthIndex } where monthIndex 0 = Jan ... 11 = Dec
 *
  * NOTE: Rebate is calculated per student. A semester is considered "paid"
 * for a student only if that student has at least one month of data inside
 * that semester. If the student has zero months for a semester, that
 * semester is treated as NOT PAID for that student → rebate = 0.*/
const SEMESTERS = [
  {
    key: '2024-25-sem2',
    name: '2024-25 Sem 2',
    start: { year: 2025, monthIndex: 0 },
    end: { year: 2025, monthIndex: 5 },
    paid: 19000,
  },
  {
    key: '2025-26-sem1',
    name: '2025-26 Sem 1',
    start: { year: 2025, monthIndex: 6 },
    end: { year: 2025, monthIndex: 11 },
    paid: 19000,
  },
  {
    key: '2025-26-sem2',
    name: '2025-26 Sem 2',
    start: { year: 2026, monthIndex: 0 },
    end: { year: 2026, monthIndex: 5 },
    paid: 0,
  },
];

const MONTH_NAME_MAP = new Map(
  [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ].map((name, idx) => [name, idx])
);

const MONTH_ABBR_TO_INDEX = new Map(
  Array.from(MONTH_NAME_MAP.keys()).map((full, idx) => [full.slice(0, 3), idx])
);

async function main() {
  try {
    await fs.access(RAW_DATA_DIR);
  } catch {
    throw new Error('Missing data__ directory. Copy the offline data first.');
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ASSET_DIR, { recursive: true });

  await buildRebateDataset();
  await buildMenuDataset();
  await buildCalendarAssets();
}

main().catch((err) => {
  console.error('❌ Failed to build offline dataset\n');
  console.error(err);
  process.exit(1);
});

async function buildRebateDataset() {
  const entries = await safeReaddir(BILL_DIR);
  const csvFiles = entries.filter((file) =>
    file.toLowerCase().endsWith('.csv')
  );
  if (!csvFiles.length) {
    console.warn('⚠️  No CSV files found inside data__/Mess Bill');
  }

  const students = new Map();
  const monthMeta = new Map();

  for (const fileName of csvFiles) {
    const monthInfo = extractMonthInfo(fileName);
    if (!monthInfo) {
      console.warn(`⚠️  Skip ${fileName} (unknown month)`);
      continue;
    }
    if (monthInfo.year < EARLIEST_YEAR) continue;

    const filePath = path.join(BILL_DIR, fileName);
    const rows = await parseCsvFile(filePath);
    const normalized = rows
      .map((row) => normalizeRebateRow(row, monthInfo))
      .filter(Boolean);

    for (const record of normalized) {
      upsertStudent(students, record);
    }

    const meta = monthMeta.get(monthInfo.key) || {
      ...monthInfo,
      sources: [],
      recordCount: 0,
    };
    meta.sources.push(fileName);
    meta.recordCount += normalized.length;
    monthMeta.set(monthInfo.key, meta);

    console.log(
      `• ${monthInfo.label.padEnd(18)} → ${normalized.length} records from ${fileName}`
    );
  }

  if (!students.size) {
    throw new Error('No student rebates were parsed. Check the Mess Bill CSVs.');
  }

  const orderedMonths = Array.from(monthMeta.values()).sort(
    (a, b) => a.order - b.order
  );
  const monthOrderMap = new Map(
    orderedMonths.map((meta, index) => [meta.key, index])
  );

  
  const payload = {};
  const sortedStudents = Array.from(students.values()).sort((a, b) =>
    a.rollNo.localeCompare(b.rollNo)
  );

  for (const student of sortedStudents) {
    // sort monthly records chronologically
    student.records.sort(
      (a, b) =>
        (monthOrderMap.get(a.monthKey) ?? 0) -
        (monthOrderMap.get(b.monthKey) ?? 0)
    );

    // Ensure monthly rebateAmount is zero (we compute rebate per semester)
    student.records = student.records.map((r) => ({ ...r, rebateAmount: 0 }));

    // Aggregate totals (present/absent counts across all months available)
    const totals = student.records.reduce(
      (acc, record) => {
        acc.presentDays += Number(record.presentDays) || 0;
        acc.absentDays += Number(record.absentDays) || 0;
        return acc;
      },
      { presentDays: 0, absentDays: 0 }
    );

    // ------------------------------
// SEMESTER AGGREGATION & REBATE
// ------------------------------
const semesterSummaries = [];

for (const sem of SEMESTERS) {

  // STUDENT-SPECIFIC SEMESTER CHECK
  const studentHasAnyMonth = student.records.some((rec) => {
    const parsed = parseMonthKey(rec.monthKey);
    return parsed && isMonthWithinSemester(parsed.year, parsed.monthIndex, sem);
  });

  const semPaidAmount = sem.paid || 0;
  const isPaid = semPaidAmount > 0 && studentHasAnyMonth;

  if (!isPaid) {
    // Semester considered NOT paid → rebate = 0
    semesterSummaries.push({
      key: sem.key,
      name: sem.name,
      paid: semPaidAmount,
      isPaid: false,
      presentDays: 0,
      usedAmount: 0,
      rebate: 0,
    });
    continue;
  }

  // Semester is paid → now calculate present days ONLY for this student
  let semPresentDays = 0;
  for (const rec of student.records) {
    const parsed = parseMonthKey(rec.monthKey);
    if (parsed && isMonthWithinSemester(parsed.year, parsed.monthIndex, sem)) {
      semPresentDays += Number(rec.presentDays) || 0;
    }
  }

  const usedAmount = semPresentDays * RATE_PER_ABSENT_DAY;
  const rebate = Math.max(0, semPaidAmount - usedAmount);

  semesterSummaries.push({
    key: sem.key,
    name: sem.name,
    paid: semPaidAmount,
    isPaid: true,
    presentDays: semPresentDays,
    usedAmount,
    rebate,
  });
}
    // totals.rebateAmount is sum of semester rebates (not monthly)
    const totalRebate = semesterSummaries.reduce((s, x) => s + (x.rebate || 0), 0);

    payload[student.rollNo] = {
      rollNo: student.rollNo,
      name: student.name,
      hostel: student.hostel,
      contact: student.contact,
      totals: {
        presentDays: totals.presentDays,
        absentDays: totals.absentDays,
        rebateAmount: totalRebate,
        monthsCount: student.records.length,
      },
      records: student.records,
      semesters: semesterSummaries,
    };
  }

  const dataset = {
    generatedAt: new Date().toISOString(),
    ratePerAbsentDay: RATE_PER_ABSENT_DAY,
    totalStudents: sortedStudents.length,
    months: orderedMonths,
    students: payload,
  };

  await fs.writeFile(
    REBATE_DATA_FILE,
    `window.MESS_REBATE_DATA = ${JSON.stringify(dataset, null, 2)};\n`,
    'utf8'
  );
  console.log(`✅ Rebates dataset saved to ${REBATE_DATA_FILE}`);
}

async function buildMenuDataset() {
  const entries = await safeReaddir(MENU_DIR);
  const csvFiles = entries.filter((file) =>
    file.toLowerCase().endsWith('.csv')
  );
  if (!csvFiles.length) {
    console.warn('⚠️  No menu CSV files found inside data__/Menu');
  }

  const menuData = {
    generatedAt: new Date().toISOString(),
    plans: [],
  };

  for (const fileName of csvFiles) {
    const filePath = path.join(MENU_DIR, fileName);
    const planType = fileName.toLowerCase().includes('non') ? 'nonveg' : 'veg';
    const label = titleCase(
      path.parse(fileName).name.replace(/[_]+/g, ' ').replace(/\s+csv$/i, '')
    );
    const slug = slugify(`${planType}-${label}`);
    const rows = await parseCsvAsMatrix(filePath);
    const schedule =
      planType === 'veg' ? parseVegMenu(rows) : parseStandardMenu(rows);

    menuData.plans.push({
      id: slug,
      type: planType,
      label,
      schedule,
    });
  }

  await fs.writeFile(
    MENU_DATA_FILE,
    `window.MESS_MENU_DATA = ${JSON.stringify(menuData, null, 2)};\n`,
    'utf8'
  );
  console.log(`✅ Menu dataset saved to ${MENU_DATA_FILE}`);
}

async function buildCalendarAssets() {
  const pdfName = (await safeReaddir(CALENDAR_DIR)).find((name) =>
    name.toLowerCase().endsWith('.pdf')
  );
  if (pdfName) {
    const source = path.join(CALENDAR_DIR, pdfName);
    await fs.copyFile(source, CALENDAR_PDF_FILE);
    console.log(`✅ Academic calendar PDF copied to ${CALENDAR_PDF_FILE}`);
  } else {
    console.warn('⚠️  Could not locate calendar PDF inside data__/Academic Calender');
  }

  const jsonPath = path.join(CALENDAR_DIR, 'calendar-events.json');
  let calendarDataset = {
    academicYear: '2025-26',
    seasons: [],
    events: [],
  };

  try {
    const content = await fs.readFile(jsonPath, 'utf8');
    const parsed = JSON.parse(content);
    calendarDataset = normalizeCalendarDataset(parsed);
  } catch (error) {
    console.warn(
      `⚠️  calendar-events.json missing or invalid. (${error.message}). Using empty dataset.`
    );
  }

  await fs.writeFile(
    CALENDAR_DATA_FILE,
    `window.ACADEMIC_CALENDAR = ${JSON.stringify(calendarDataset, null, 2)};\n`,
    'utf8'
  );
  console.log(`✅ Calendar metadata saved to ${CALENDAR_DATA_FILE}`);
}

async function parseCsvFile(filePath) {
  const rows = await parseCsvAsMatrix(filePath);
  if (!rows.length) return [];
  const headers = rows[0].map((header, index) =>
    normalizeKey(header || `column_${index}`)
  );
  const records = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.some((cell) => cell && cell.trim())) continue;
    const record = {};
    for (let col = 0; col < headers.length; col++) {
      record[headers[col]] = (row[col] ?? '').trim();
    }
    records.push(record);
  }
  return records;
}

async function parseCsvAsMatrix(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return csvToMatrix(raw);
}

function normalizeCalendarDataset(input) {
  const academicYear = input.academicYear || '2025-26';
  const seasons = Array.isArray(input.seasons) ? input.seasons : [];
  const rawEvents = Array.isArray(input.events) ? input.events : [];
  const events = rawEvents
    .map((event) => ({
      date: event.date,
      title: event.title ?? event.label ?? 'Event',
      category: event.category ?? event.type ?? 'event',
      description: event.description ?? '',
    }))
    .filter((event) => Boolean(event.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  return { academicYear, seasons, events };
}

function normalizeRebateRow(row, monthInfo) {
  const roll =
    firstNonEmpty(
      row.roll_no,
      row.roll_no_,
      row.roll_number,
      row.roll_no__,
      row.roll,
      row.roll_no_1,
      row.rollno,
      row.roll_number_
    ) ?? '';
  if (!roll) return null;

  const name =
    firstNonEmpty(
      row.name_of_the_students,
      row.name,
      row.name_of_students,
      row.name_of_student,
      row.student_name
    ) ?? '';

  const hostel =
    firstNonEmpty(row.hostel, row.hostel_name) ??
    firstNonEmpty(row.block, row.hostel_block) ??
    '';

  const contact = formatContact(firstNonEmpty(row.contact_no, row.contact));

  const totalDays = toNumber(
    firstMatchingValue(row, [
      'no_of_days',
      'total_days',
      'total_no_of_days',
      'no_of_days_in',
    ])
  );

  const utilizedDays = toNumber(
    firstMatchingValue(row, [
      'utilized_days',
      'utilized_day',
      'no_of_days_utilized',
      'days_utilized',
    ])
  );

  const rebateDays = toNumber(
    firstMatchingValue(row, ['rebate_in', 'rebate_days', 'rebate'])
  );

  if (Number.isNaN(rebateDays) && Number.isNaN(utilizedDays)) {
    return null;
  }

  const absentDays = validNumber(rebateDays)
    ? rebateDays
    : Math.max(
        0,
        (validNumber(totalDays) ? totalDays : 30) -
          (validNumber(utilizedDays) ? utilizedDays : 0)
      );

  const presentDays = validNumber(utilizedDays)
    ? utilizedDays
    : Math.max(0, (validNumber(totalDays) ? totalDays : 30) - absentDays);

  // monthly rebate is 0 because rebate is computed at semester level
  return {
    rollNo: roll.toUpperCase(),
    name: titleCase(name),
    hostel: hostel ? hostel.toUpperCase() : '',
    contact,
    monthKey: monthInfo.key,
    monthLabel: monthInfo.label,
    presentDays,
    absentDays,
    totalDays: validNumber(totalDays) ? totalDays : presentDays + absentDays,
    rebateAmount: 0,
  };
}

/* ---------- Helpers for semester mapping ---------- */

function parseMonthKey(monthKey) {
  // expected e.g. 'jan2025' or 'feb2025'
  if (!monthKey || typeof monthKey !== 'string') return null;
  const m = monthKey.match(/^([a-z]{3})(\d{4})$/i);
  if (!m) return null;
  const abbr = m[1].toLowerCase();
  const year = Number(m[2]);
  const monthIndex = MONTH_ABBR_TO_INDEX.get(abbr);
  if (monthIndex === undefined) return null;
  return { year, monthIndex };
}

function isMonthWithinSemester(year, monthIndex, sem) {
  const { start, end } = sem;
  const startKey = start.year * 12 + start.monthIndex;
  const endKey = end.year * 12 + end.monthIndex;
  const mKey = year * 12 + monthIndex;
  return mKey >= startKey && mKey <= endKey;
}

/* ---------- Remaining helper functions from original file ---------- */

function parseStandardMenu(rows) {
  const schedule = {};
  let currentDay = null;

  for (const row of rows) {
    if (!row.length) continue;
    const dayValue = row[0];
    if (dayValue) {
      currentDay = normalizeDay(dayValue);
    }
    if (!currentDay) continue;

    const mealKey = normalizeMeal(row[1]);
    if (!mealKey) continue;

    const description = row
      .slice(2)
      .map((cell) => (cell ?? '').trim())
      .filter(Boolean)
      .join(' | ');

    if (!schedule[currentDay]) schedule[currentDay] = {};
    schedule[currentDay][mealKey] = description;
  }

  return schedule;
}

function parseVegMenu(rows) {
  const schedule = {};
  let currentDay = null;

  for (const row of rows) {
    if (!row.length) continue;
    const dayValue = row[0];
    if (dayValue) {
      currentDay = normalizeDay(dayValue);
    }
    if (!currentDay) continue;

    const mealKey = normalizeMeal(row[1]);
    if (!mealKey) continue;

    const [vegDish = '', jainDish = '', compulsory = ''] = row
      .slice(2)
      .map((cell) => (cell ?? '').trim());

    if (!schedule[currentDay]) schedule[currentDay] = {};
    schedule[currentDay][mealKey] = {
      veg: vegDish,
      jain: jainDish,
      compulsory,
    };
  }

  return schedule;
}

function csvToMatrix(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };

  const pushRow = () => {
    const trimmedRow = row.map((value) =>
      typeof value === 'string' ? value.replace(/\uFEFF/g, '') : value
    );
    rows.push(trimmedRow);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\r') continue;

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      pushCell();
    } else if (char === '\n') {
      pushCell();
      pushRow();
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    pushCell();
    pushRow();
  }

  return rows
    .map((cols) => cols.map((value) => (value ?? '').trim()))
    .filter((cols) => cols.some((value) => value));
}

function extractMonthInfo(fileName) {
  const match = fileName.match(/([a-zA-Z]+)[^0-9]*(\d{4})/);
  if (!match) return null;
  const [, rawMonth, rawYear] = match;
  const monthName = rawMonth.toLowerCase();
  if (!MONTH_NAME_MAP.has(monthName)) return null;
  const monthIndex = MONTH_NAME_MAP.get(monthName);
  const year = Number(rawYear);
  return {
    key: `${monthName.slice(0, 3)}${year}`,
    label: `${capitalize(monthName)} ${year}`,
    year,
    monthIndex,
    order: year * 12 + monthIndex,
  };
}

function upsertStudent(store, record) {
  const existing = store.get(record.rollNo) || {
    rollNo: record.rollNo,
    name: record.name,
    hostel: record.hostel,
    contact: record.contact,
    records: [],
  };
  if (!existing.name && record.name) existing.name = record.name;
  if (!existing.contact && record.contact) existing.contact = record.contact;
  if (!existing.hostel && record.hostel) existing.hostel = record.hostel;

  existing.records = existing.records.filter(
    (entry) => entry.monthKey !== record.monthKey
  );
  existing.records.push({
    monthKey: record.monthKey,
    monthLabel: record.monthLabel,
    presentDays: record.presentDays,
    absentDays: record.absentDays,
    totalDays: record.totalDays,
    rebateAmount: record.rebateAmount,
  });

  store.set(record.rollNo, existing);
}

function normalizeKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  }
  return null;
}

function firstMatchingValue(row, candidates) {
  for (const [key, value] of Object.entries(row)) {
    for (const needle of candidates) {
      if (key.includes(needle)) {
        if (typeof value === 'string' && value.trim()) return value.trim();
        if (typeof value === 'number') return String(value);
      }
    }
  }
  return '';
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function validNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function formatContact(value) {
  if (!value) return '';
  if (/e\+/i.test(value)) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return Math.round(numeric).toString();
  }
  return String(value).replace(/[^0-9+]/g, '');
}

function normalizeDay(value) {
  if (!value) return null;
  const cleaned = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const match = days.find((day) => day.startsWith(cleaned));
  return match ? capitalize(match) : null;
}

function normalizeMeal(value) {
  if (!value) return null;
  const key = value.toLowerCase();
  if (key.includes('breakfast')) return 'breakfast';
  if (key.includes('lunch')) return 'lunch';
  if (key.includes('snack')) return 'snacks';
  if (key.includes('dinner')) return 'dinner';
  return null;
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function titleCase(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function safeReaddir(dir) {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}