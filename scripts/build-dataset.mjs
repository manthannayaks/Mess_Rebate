import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { PdfReader } from 'pdfreader';

const ROOT = process.cwd();
const DATA_DIR = path.resolve(ROOT, 'Data__');
const MENU_DIR = path.resolve(DATA_DIR, 'Menu');
const CALENDAR_DIR = path.resolve(DATA_DIR, 'Academic_Calender');
const OUTPUT_FILE = path.resolve(ROOT, 'public/data/rebates-data.js');
const MENU_OUTPUT_FILE = path.resolve(ROOT, 'public/data/menu-data.js');
const CALENDAR_OUTPUT_FILE = path.resolve(
  ROOT,
  'public/assets/academic-calendar.pdf'
);
const RATE_PER_ABSENT_DAY = 140;
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

const roomPattern = /^([A-Z]-?\d+|\d{1,4})$/i;
const datePattern =
  /^\d{1,2}[-/](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[-/']?\d{2,4}$/i;

async function main() {
  const files = await fs.readdir(DATA_DIR);
  if (!files.length) {
    throw new Error('No files found in Data__ directory');
  }

  const students = new Map();
  const monthMeta = new Map();

  for (const fileName of files) {
    const sourcePath = path.join(DATA_DIR, fileName);
    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) continue;

    const monthInfo = extractMonthInfo(fileName);
    if (!monthInfo) {
      console.warn(`⚠️  Skipping "${fileName}" (unable to detect month/year)`);
      continue;
    }

    let rows = [];
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.csv') {
      rows = await parseCsvFile(sourcePath);
    } else if (ext === '.pdf') {
      rows = await parsePdfFile(sourcePath);
    } else {
      console.warn(`⚠️  Skipping "${fileName}" (unsupported extension)`);
      continue;
    }

    const normalizedRows = rows
      .map((row) => normalizeRow(row, monthInfo))
      .filter(Boolean);

    for (const record of normalizedRows) {
      upsertStudent(students, record);
    }

    const existing = monthMeta.get(monthInfo.key) || {
      ...monthInfo,
      sources: [],
      recordCount: 0,
    };
    existing.sources.push(fileName);
    existing.recordCount += normalizedRows.length;
    monthMeta.set(monthInfo.key, existing);

    console.log(
      `Processed ${normalizedRows.length
      } records for ${monthInfo.label} from ${fileName}`
    );
  }

  if (!students.size) {
    throw new Error('No student records were parsed. Check the input files.');
  }

  const monthOrderMap = new Map(
    Array.from(monthMeta.values())
      .sort((a, b) => a.order - b.order)
      .map((meta, idx) => [meta.key, idx])
  );

  const studentPayload = {};
  const sortedStudents = Array.from(students.values()).sort((a, b) =>
    a.rollNo.localeCompare(b.rollNo)
  );
  for (const student of sortedStudents) {
    student.records.sort(
      (a, b) =>
        (monthOrderMap.get(a.monthKey) ?? 0) -
        (monthOrderMap.get(b.monthKey) ?? 0)
    );
    const totals = student.records.reduce(
      (acc, record) => {
        acc.presentDays += record.presentDays;
        acc.absentDays += record.absentDays;
        acc.rebateAmount += record.rebateAmount;
        return acc;
      },
      { presentDays: 0, absentDays: 0, rebateAmount: 0 }
    );
    studentPayload[student.rollNo] = {
      rollNo: student.rollNo,
      name: student.name,
      hostel: student.hostel,
      contact: student.contact,
      totals: {
        presentDays: totals.presentDays,
        absentDays: totals.absentDays,
        rebateAmount: totals.rebateAmount,
        monthsCount: student.records.length,
      },
      records: student.records,
    };
  }

  const dataset = {
    generatedAt: new Date().toISOString(),
    ratePerAbsentDay: RATE_PER_ABSENT_DAY,
    totalStudents: sortedStudents.length,
    months: Array.from(monthMeta.values())
      .sort((a, b) => a.order - b.order)
      .map(({ key, label, year, monthIndex, recordCount, sources }) => ({
        key,
        label,
        year,
        monthIndex,
        recordCount,
        sources,
      })),
    students: studentPayload,
  };

  const serialized = `window.MESS_REBATE_DATA = ${JSON.stringify(
    dataset,
    null,
    2
  )};\n`;
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, serialized, 'utf8');
  console.log(
    `\n✅ Dataset generated at ${OUTPUT_FILE} for ${sortedStudents.length} students`
  );

  await buildMenuData();
  await copyAcademicCalendar();
}

main().catch((err) => {
  console.error('❌ Failed to build dataset:', err);
  process.exit(1);
});

async function buildMenuData() {
  const menuData = {
    generatedAt: new Date().toISOString(),
    plans: [],
  };

  const menuFiles = await safeListMenuFiles();
  for (const fileName of menuFiles) {
    const sourcePath = path.join(MENU_DIR, fileName);
    const planType = fileName.toLowerCase().includes('non') ? 'nonveg' : 'veg';
    const label = titleCase(path.parse(fileName).name.replace(/[_]+/g, ' ').trim());
    const slug = slugify(label || planType);
    const content = await fs.readFile(sourcePath, 'utf8');
    const rows = parseCsv(content, {
      skip_empty_lines: true,
    });

    const schedule =
      planType === 'veg' ? parseVegMenu(rows) : parseStandardMenu(rows);

    menuData.plans.push({
      id: slug,
      type: planType,
      label,
      schedule,
    });
  }

  await fs.mkdir(path.dirname(MENU_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    MENU_OUTPUT_FILE,
    `window.MESS_MENU_DATA = ${JSON.stringify(menuData, null, 2)};\n`,
    'utf8'
  );
  console.log(`✅ Menu data generated at ${MENU_OUTPUT_FILE}`);
}

async function safeListMenuFiles() {
  try {
    const entries = await fs.readdir(MENU_DIR);
    return entries.filter((file) => file.toLowerCase().endsWith('.csv'));
  } catch {
    return [];
  }
}

function parseStandardMenu(rows) {
  const schedule = {};
  let currentDay = null;

  for (const row of rows) {
    if (!row.length) continue;
    const dayValue = row[0]?.trim();
    if (dayValue) {
      currentDay = normalizeDay(dayValue);
    }
    if (!currentDay) continue;

    const mealValue = row[1]?.trim();
    const mealKey = normalizeMeal(mealValue);
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

    const dayValue = row[0]?.trim();
    if (dayValue) {
      currentDay = normalizeDay(dayValue);
    }
    if (!currentDay) continue;

    const mealValue = row[1]?.trim();
    const mealKey = normalizeMeal(mealValue);
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

function normalizeDay(value) {
  const trimmed = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const match = days.find((day) => day.startsWith(trimmed));
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

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function copyAcademicCalendar() {
  try {
    const entries = await fs.readdir(CALENDAR_DIR);
    const pdf = entries.find((file) => file.toLowerCase().endsWith('.pdf'));
    if (!pdf) {
      console.warn('⚠️  No academic calendar PDF found to copy.');
      return;
    }
    const sourcePath = path.join(CALENDAR_DIR, pdf);
    await fs.mkdir(path.dirname(CALENDAR_OUTPUT_FILE), { recursive: true });
    await fs.copyFile(sourcePath, CALENDAR_OUTPUT_FILE);
    console.log(`✅ Academic calendar copied to ${CALENDAR_OUTPUT_FILE}`);
  } catch (error) {
    console.warn('⚠️  Unable to copy academic calendar PDF:', error.message);
  }
}

function extractMonthInfo(fileName) {
  const match = fileName.match(/([A-Za-z]+)[\s_]+(\d{4})/);
  if (!match) return null;
  const [_, rawMonth, rawYear] = match;
  const monthName = rawMonth.toLowerCase();
  if (!MONTH_NAME_MAP.has(monthName)) return null;
  const monthIndex = MONTH_NAME_MAP.get(monthName);
  const year = Number(rawYear);
  const key = `${monthName.slice(0, 3)}${year}`;
  return {
    key,
    label: `${capitalize(monthName)} ${year}`,
    year,
    monthIndex,
    order: year * 12 + monthIndex,
  };
}

async function parseCsvFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const records = parseCsv(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    relaxQuotes: true,
  });
  return records.map((row) => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      normalized[normalizedKey] =
        typeof value === 'string' ? value.trim() : value;
    }
    return normalized;
  });
}

async function parsePdfFile(filePath) {
  const items = [];
  await new Promise((resolve, reject) => {
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve();
      else if (item.text) {
        const text = item.text.trim();
        if (text) items.push(text);
      }
    });
  });

  const dataTokens = dropHeaderTokens(items);
  const rows = [];
  let i = 0;
  while (i < dataTokens.length) {
    if (!looksLikeRoom(dataTokens[i])) {
      i++;
      continue;
    }
    const row = {
      room_no: dataTokens[i++],
      name: dataTokens[i++] ?? '',
      hostel: dataTokens[i++] ?? '',
      roll_no: dataTokens[i++] ?? '',
      contact_no: dataTokens[i++] ?? '',
      mess_start_date: dataTokens[i++] ?? '',
      mess_end_date: dataTokens[i++] ?? '',
      total_days: dataTokens[i++] ?? '',
      utilized_days: dataTokens[i++] ?? '',
      rebate_days: dataTokens[i++] ?? '',
      rebate_start_1: dataTokens[i++] ?? '',
      rebate_end_1: dataTokens[i++] ?? '',
    };

    if (looksLikeDate(dataTokens[i])) {
      row.rebate_start_2 = dataTokens[i++];
    }
    if (row.rebate_start_2 && looksLikeDate(dataTokens[i])) {
      row.rebate_end_2 = dataTokens[i++];
    }

    row.mess_charges = dataTokens[i++] ?? '';

    if (looksLikeDate(dataTokens[i])) {
      row.check_in_date = dataTokens[i++];
    }
    if (looksLikeDate(dataTokens[i])) {
      row.check_out_date = dataTokens[i++];
    }
    if (
      dataTokens[i] &&
      !looksLikeRoom(dataTokens[i]) &&
      !looksNumeric(dataTokens[i]) &&
      !looksLikeDate(dataTokens[i])
    ) {
      row.remarks = dataTokens[i++];
      while (
        dataTokens[i] &&
        !looksLikeRoom(dataTokens[i]) &&
        !looksNumeric(dataTokens[i]) &&
        !looksLikeDate(dataTokens[i])
      ) {
        row.remarks += ` ${dataTokens[i++]}`;
      }
    }

    rows.push(row);
  }
  return rows;
}

function dropHeaderTokens(tokens) {
  const startIndex = tokens.findIndex((token) => looksLikeRoom(token));
  return startIndex === -1 ? [] : tokens.slice(startIndex);
}

function normalizeRow(row, monthInfo) {
  const roll =
    firstNonEmpty(
      row.roll_no,
      row.roll_no_,
      row.pf_number,
      row.pf_no,
      row['roll no'],
      row['roll_no']
    ) ?? '';
  if (!roll) return null;

  const name =
    firstNonEmpty(
      row.name_of_the_students,
      row.name,
      row['name_of_the_students'],
      row['name']
    ) ?? '';

  const hostel =
    firstNonEmpty(row.hostel, row['hostel']) ?? (row.room_no?.slice(0, 1) || '');

  const contactRaw = firstNonEmpty(row.contact_no, row.contact) ?? '';
  const contact = formatContact(contactRaw);

  const totalDays = toNumber(
    firstMatchingValue(row, [
      'total_days',
      'no_of_days',
      'no_of_days_in',
      'no_of_days_in_july',
      'no_of_days_in_aug',
      'no_of_days_in_sep',
    ])
  );
  const utilizedDays = toNumber(
    firstMatchingValue(row, [
      'utilized_days',
      'utilized_day',
      'utilezed_day',
      'utilezed_day_in',
    ])
  );
  const rebateDays = toNumber(
    firstMatchingValue(row, [
      'rebate_in',
      'rebate_days',
      'rebate',
      'rebate_injan',
      'rebate_in_feb',
    ])
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

  const rebateAmount = absentDays * RATE_PER_ABSENT_DAY;

  return {
    rollNo: roll.toUpperCase(),
    name: titleCase(name),
    hostel: hostel?.toUpperCase() ?? '',
    contact,
    monthKey: monthInfo.key,
    monthLabel: monthInfo.label,
    presentDays,
    absentDays,
    totalDays: validNumber(totalDays) ? totalDays : presentDays + absentDays,
    rebateAmount,
  };
}

function upsertStudent(students, record) {
  const existing = students.get(record.rollNo) || {
    rollNo: record.rollNo,
    name: record.name,
    hostel: record.hostel,
    contact: record.contact,
    records: [],
  };
  if (!existing.name && record.name) existing.name = record.name;
  if (!existing.contact && record.contact) existing.contact = record.contact;
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
  students.set(record.rollNo, existing);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  }
  return null;
}

function firstMatchingValue(row, substrings) {
  for (const [key, value] of Object.entries(row)) {
    for (const sub of substrings) {
      if (key.includes(sub)) {
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

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function titleCase(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatContact(value) {
  if (!value) return '';
  if (/e\+/i.test(value)) {
    const num = Number(value);
    if (!Number.isNaN(num)) return Math.round(num).toString();
  }
  return String(value).replace(/[^0-9+]/g, '');
}

function looksLikeRoom(text) {
  return roomPattern.test(text);
}

function looksLikeDate(text) {
  return datePattern.test(text);
}

function looksNumeric(text) {
  return /^-?\d+(\.\d+)?$/.test(text);
}

