/**
 * ============================================================================
 * MESS REBATE LOOKUP PAGE SCRIPT
 * ============================================================================
 * 
 * This script handles the mess rebate lookup page functionality:
 * - Allows searching for students by roll number
 * - Displays rebate calculations per semester
 * - Shows monthly attendance records
 * - Manages recent search history
 * 
 * Data Source: window.MESS_REBATE_DATA (loaded from data/rebates-data.js)
 * ============================================================================
 */

(() => {
  // ==========================================================================
  // DATA LOADING & INITIALIZATION
  // ==========================================================================
  
  // Load rebate data from global variable (set by rebates-data.js)
  const data = window.MESS_REBATE_DATA || { students: {}, months: [] };
  
  // Convert students object to Map for efficient lookup
  const students = new Map(Object.entries(data.students || {}));
  
  // Get rebate rate per absent day
  const rate = data.ratePerAbsentDay || 0;

  // Currency formatter for Indian Rupees
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  // ==========================================================================
  // SEMESTER CONFIGURATION
  // ==========================================================================
  // NOTE: This must match the configuration in scripts/build-dataset.mjs
  // Each semester defines:
  // - key: Unique identifier
  // - name: Display name
  // - start/end: Year and month (monthIndex: 0=Jan, 11=Dec)
  // - paid: Amount paid for this semester (0 if not paid yet)
  // ==========================================================================
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

  // ==========================================================================
  // MONTH UTILITIES
  // ==========================================================================
  
  // Map of month abbreviations to month indices (0-11)
  const MONTH_ABBR_TO_INDEX = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  /**
   * Parses a month key string (e.g., "jan2025") into year and month index
   * @param {string} key - Month key in format "mmmYYYY" (e.g., "jan2025")
   * @returns {Object|null} Object with year and monthIndex, or null if invalid
   */
  function parseMonthKey(key) {
    if (!key) return null;
    const m = key.match(/^([a-z]{3})(\d{4})$/i);
    if (!m) return null;
    return { monthIndex: MONTH_ABBR_TO_INDEX[m[1].toLowerCase()], year: Number(m[2]) };
  }

  /**
   * Checks if a month falls within a semester's date range
   * @param {number} year - Year of the month
   * @param {number} monthIndex - Month index (0-11)
   * @param {Object} sem - Semester configuration object
   * @returns {boolean} True if month is within semester range
   */
  function monthWithinSem(year, monthIndex, sem) {
    // Convert dates to comparable numeric keys (year * 12 + month)
    const sKey = sem.start.year * 12 + sem.start.monthIndex;
    const eKey = sem.end.year * 12 + sem.end.monthIndex;
    const mKey = year * 12 + monthIndex;
    return mKey >= sKey && mKey <= eKey;
  }

  // ==========================================================================
  // DOM ELEMENT REFERENCES
  // ==========================================================================
  
  const nodes = {
    form: document.querySelector('[data-rebate-form]'), // Search form
    input: document.querySelector('[data-rebate-form] input[name="roll"]'), // Roll number input
    clearBtn: document.querySelector('[data-rebate-search] [data-action="clear"]'), // Clear button
    stats: document.querySelector('[data-rebate-stats]'), // Statistics display
    resultCard: document.querySelector('[data-rebate-result]'), // Student result card
    emptyCard: document.querySelector('[data-rebate-empty]'), // Empty state message
    name: document.querySelector('[data-student-name]'), // Student name display
    roll: document.querySelector('[data-student-roll]'), // Roll number display
    hostel: document.querySelector('[data-student-hostel]'), // Hostel display
    contact: document.querySelector('[data-student-contact]'), // Contact display
    totalRebate: document.querySelector('[data-total-rebate]'), // Total rebate amount
    totalAbsent: document.querySelector('[data-total-absent]'), // Total absent days
    totalMonths: document.querySelector('[data-total-months]'), // Total months count
    rateValue: document.querySelector('[data-rate-value]'), // Rate per day display
    tableBody: document.querySelector('[data-records-body]'), // Monthly records table
    generated: document.querySelector('[data-rebate-generated]'), // Data generation timestamp
    months: document.querySelector('[data-rebate-months]'), // Months count display
    statStudents: document.querySelector('[data-stat-students]'), // Total students stat
    statRate: document.querySelector('[data-stat-rate]'), // Rate stat
    statMonths: document.querySelector('[data-stat-months]'), // Months stat
    recentList: document.querySelector('[data-recent-list]'), // Recent searches list
    recentClear: document.querySelector('[data-recent-clear]'), // Clear recent button
  };

  // ==========================================================================
  // RECENT SEARCHES MANAGEMENT
  // ==========================================================================
  
  const recentStorageKey = 'mess-rebate-recent'; // localStorage key for recent searches
  let recentLookups = loadRecent(); // Load recent searches from localStorage

  // ==========================================================================
  // INITIAL PAGE SETUP
  // ==========================================================================
  
  // Display rebate rate
  nodes.rateValue.textContent = rate ? formatter.format(rate) + '/day' : '—';
  
  // Display overall statistics
  nodes.stats.textContent = `${students.size.toLocaleString('en-IN')} students • ${
    data.months.length
  } months • ${formatter.format(rate || 0)}/day rebate`;
  
  // Display data generation timestamp
  nodes.generated.textContent = data.generatedAt
    ? new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data.generatedAt))
    : '—';
  
  // Display month count
  nodes.months.textContent = data.months.length || '—';
  
  // Update stat displays if they exist
  nodes.statStudents && (nodes.statStudents.textContent = students.size.toLocaleString('en-IN'));
  nodes.statRate && (nodes.statRate.textContent = formatter.format(rate || 0));
  
  // Render month badges and recent searches
  renderMonthBadges();
  renderRecent();

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================
  
  // Handle form submission (search by roll number)
  nodes.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    search(nodes.input.value);
  });

  // Handle real-time input (search as user types)
  nodes.input?.addEventListener('input', (event) => {
    const value = event.target.value.toUpperCase(); // Convert to uppercase
    event.target.value = value;
    search(value);
  });

  // Handle clear button click
  nodes.clearBtn?.addEventListener('click', () => {
    nodes.input.value = '';
    showEmpty('Type a roll number to load the student's mess rebate summary.');
    nodes.input.focus();
  });

  // Handle clear recent searches
  nodes.recentClear?.addEventListener('click', () => {
    recentLookups = [];
    persistRecent();
    renderRecent();
  });

  // Handle click on recent search item
  nodes.recentList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-roll]');
    if (!button) return;
    const roll = button.dataset.roll;
    if (!roll) return;
    nodes.input.value = roll;
    search(roll);
    nodes.input.focus();
  });

  // Show initial empty state
  showEmpty('Type a roll number to load the student's mess rebate summary.');

  // ==========================================================================
  // SEARCH FUNCTION
  // ==========================================================================
  
  /**
   * Searches for a student by roll number and displays their rebate information
   * @param {string} roll - Roll number to search for
   */
  function search(roll) {
    const sanitized = roll.trim();
    
    // Show empty state if no input
    if (!sanitized) {
      showEmpty('Type a roll number to load the student's mess rebate summary.');
      return;
    }
    
    // Look up student in the Map
    const student = students.get(sanitized);
    
    // Show error if student not found
    if (!student) {
      showEmpty(`No data found for ${sanitized}.`);
      return;
    }
    
    // Render student information
    renderStudent(student);
  }

  // ==========================================================================
  // STUDENT RENDERING FUNCTIONS
  // ==========================================================================
  
  /**
   * Renders a student's rebate information including monthly records and semester summaries
   * @param {Object} student - Student data object from the dataset
   */
  function renderStudent(student) {
    // Show result card and hide empty state
    nodes.resultCard.classList.remove('hidden');
    nodes.emptyCard.classList.add('hidden');

    // Display basic student information
    nodes.name.textContent = student.name || 'Unknown student';
    nodes.hostel.textContent = student.hostel || '—';
    nodes.roll.textContent = student.rollNo;
    nodes.contact.textContent = student.contact || '—';

    // Render monthly attendance table
    // Note: Monthly rebate column shows '—' because rebate is calculated at semester level
    nodes.tableBody.innerHTML = student.records
      .map(
        (record) => `
        <tr>
          <td>${record.monthLabel}</td>
          <td>${record.presentDays}</td>
          <td>${record.absentDays}</td>
          <td>—</td>
        </tr>`
      )
      .join('');

    // Get semester summaries (use pre-computed if available, otherwise compute)
    const semesterSummaries = (student.semesters && Array.isArray(student.semesters))
      ? student.semesters.map((s) => ({ ...s })) // Use pre-computed from dataset
      : computeSemestersClient(student); // Compute client-side if not available

    // Find or create semester summary container
    let semContainer = nodes.resultCard.querySelector('[data-semester-summary]');
    if (!semContainer) {
      semContainer = document.createElement('div');
      semContainer.setAttribute('data-semester-summary', '');
      semContainer.className = 'semester-summary';
      // Place it after the records table
      const tableEl = nodes.tableBody && nodes.tableBody.closest('table');
      if (tableEl && tableEl.parentElement) {
        tableEl.parentElement.appendChild(semContainer);
      } else {
        nodes.resultCard.appendChild(semContainer);
      }
    }

    // Render semester summaries with detailed breakdown
    semContainer.innerHTML = semesterSummaries
      .map((s) => {
        // Unpaid semester (no data or not paid)
        if (!s.isPaid) {
          return `
          <div class="sem-card sem-unpaid">
            <h3>${s.name}</h3>
            <p class="dimmed">No data for this semester → treated as <strong>Not Paid</strong>. Rebate: ₹0</p>
          </div>`;
        }
        // Paid semester with detailed calculation
        return `
        <div class="sem-card">
          <h3>${s.name}</h3>
          <table class="sem-table">
            <tr><td><strong>Amount paid</strong></td><td>${formatter.format(s.paid)}</td></tr>
            <tr><td><strong>Present days (used)</strong></td><td>${s.presentDays}</td></tr>
            <tr><td><strong>Used amount</strong></td><td>${formatter.format(s.usedAmount)}</td></tr>
            <tr><td><strong>Rebate</strong></td><td>${formatter.format(s.rebate)}</td></tr>
            <tr class="dimmed"><td colspan="2">(${formatter.format(s.paid)} - ${formatter.format(s.usedAmount)} = ${formatter.format(s.rebate)})</td></tr>
          </table>
        </div>`;
      })
      .join('');

    // Calculate and display total rebate (sum of all semester rebates)
    const totalRebate = semesterSummaries.reduce((sum, s) => sum + (s.rebate || 0), 0);
    nodes.totalRebate.textContent = formatter.format(totalRebate);

    // Display totals
    nodes.totalAbsent.textContent = student.totals.absentDays ?? 0;
    nodes.totalMonths.textContent = student.totals.monthsCount ?? 0;

    // Remember this lookup in recent searches
    rememberLookup(student);
  }

  /**
   * Computes semester summaries client-side if not pre-computed in dataset
   * Calculates rebate based on present days and semester payment status
   * 
   * @param {Object} student - Student data object
   * @returns {Array} Array of semester summary objects
   */
  function computeSemestersClient(student) {
    const summaries = [];
    
    // Process each semester
    for (const sem of SEMESTERS) {
      // Check if student has any months within this semester
      const studentHasAnyMonth = student.records.some((rec) => {
        const parsed = parseMonthKey(rec.monthKey);
        if (!parsed) return false;
        return monthWithinSem(parsed.year, parsed.monthIndex, sem);
      });

      const semConfiguredPaidAmount = sem.paid || 0;
      // Semester is considered paid only if:
      // 1. Payment amount > 0 AND
      // 2. Student has at least one month of data in this semester
      const semConsideredPaid = semConfiguredPaidAmount > 0 && studentHasAnyMonth;

      // If not paid, return zero rebate
      if (!semConsideredPaid) {
        summaries.push({
          key: sem.key,
          name: sem.name,
          paid: semConfiguredPaidAmount,
          isPaid: false,
          presentDays: 0,
          usedAmount: 0,
          rebate: 0,
        });
        continue;
      }

      // Calculate total present days for this semester
      let semPresentDays = 0;
      for (const rec of student.records) {
        const parsed = parseMonthKey(rec.monthKey);
        if (!parsed) continue;
        if (monthWithinSem(parsed.year, parsed.monthIndex, sem)) {
          semPresentDays += Number(rec.presentDays) || 0;
        }
      }

      // Calculate used amount and rebate
      // Used amount = present days × rate per day
      // Rebate = amount paid - used amount (minimum 0)
      const usedAmount = semPresentDays * rate;
      const rebate = Math.max(0, semConfiguredPaidAmount - usedAmount);

      summaries.push({
        key: sem.key,
        name: sem.name,
        paid: semConfiguredPaidAmount,
        isPaid: true,
        presentDays: semPresentDays,
        usedAmount,
        rebate,
      });
    }
    return summaries;
  }

  // ==========================================================================
  // UI HELPER FUNCTIONS
  // ==========================================================================
  
  /**
   * Shows empty state message
   * @param {string} message - Message to display
   */
  function showEmpty(message) {
    nodes.resultCard.classList.add('hidden');
    nodes.emptyCard.classList.remove('hidden');
    nodes.emptyCard.textContent = message;
  }

  /**
   * Renders month badges showing available months in the dataset
   * Displays the latest 6 months with a "+X more" indicator if needed
   */
  function renderMonthBadges() {
    if (!nodes.statMonths) return;
    const months = data.months || [];
    if (!months.length) {
      nodes.statMonths.innerHTML = '<span class="meta">No months loaded yet.</span>';
      return;
    }
    const latest = months.slice(-6); // Get last 6 months
    const extra = months.length - latest.length;
    const badges = latest
      .map(
        (month) =>
          `<span class="month-badge">${month.label.replace(' 20', " '")}</span>`
      )
      .join('');
    const extraBadge =
      extra > 0 ? `<span class="month-badge dimmed">+${extra} more</span>` : '';
    nodes.statMonths.innerHTML = badges + extraBadge;
  }

  // ==========================================================================
  // RECENT SEARCHES FUNCTIONS
  // ==========================================================================
  
  /**
   * Loads recent searches from localStorage
   * @returns {Array} Array of recent search entries
   */
  function loadRecent() {
    try {
      const stored = localStorage.getItem(recentStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves recent searches to localStorage
   */
  function persistRecent() {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(recentLookups));
    } catch {
      /* ignore */
    }
  }

  /**
   * Adds a student lookup to recent searches
   * Keeps only the 5 most recent searches
   * @param {Object} student - Student data object
   */
  function rememberLookup(student) {
    const entry = {
      roll: student.rollNo,
      name: student.name,
      hostel: student.hostel,
    };
    // Add to beginning, remove duplicates, keep only 5
    recentLookups = [entry, ...recentLookups.filter((item) => item.roll !== entry.roll)];
    recentLookups = recentLookups.slice(0, 5);
    persistRecent();
    renderRecent();
  }

  /**
   * Renders the recent searches list
   */
  function renderRecent() {
    if (!nodes.recentList) return;
    if (!recentLookups.length) {
      nodes.recentList.innerHTML = '<li class="meta">No lookups yet.</li>';
      return;
    }
    nodes.recentList.innerHTML = recentLookups
      .map(
        (entry) => `
        <li class="recent-item">
          <div>
            <strong>${entry.name || 'Unknown'}</strong>
            <span class="meta">${entry.roll}</span>
          </div>
          <button class="btn primary slim" type="button" data-roll="${entry.roll}">
            View
          </button>
        </li>`
      )
      .join('');
  }

})();