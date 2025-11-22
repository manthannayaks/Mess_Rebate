(() => {
  const data = window.MESS_REBATE_DATA || { students: {}, months: [] };
  const students = new Map(Object.entries(data.students || {}));
  const rate = data.ratePerAbsentDay || 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  // ---------- SEMESTER CONFIG (mirror build-dataset.mjs) ----------
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

  const MONTH_ABBR_TO_INDEX = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  function parseMonthKey(key) {
    if (!key) return null;
    const m = key.match(/^([a-z]{3})(\d{4})$/i);
    if (!m) return null;
    return { monthIndex: MONTH_ABBR_TO_INDEX[m[1].toLowerCase()], year: Number(m[2]) };
  }

  function monthWithinSem(year, monthIndex, sem) {
    const sKey = sem.start.year * 12 + sem.start.monthIndex;
    const eKey = sem.end.year * 12 + sem.end.monthIndex;
    const mKey = year * 12 + monthIndex;
    return mKey >= sKey && mKey <= eKey;
  }

  const nodes = {
    form: document.querySelector('[data-rebate-form]'),
    input: document.querySelector('[data-rebate-form] input[name="roll"]'),
    clearBtn: document.querySelector('[data-rebate-search] [data-action="clear"]'),
    stats: document.querySelector('[data-rebate-stats]'),
    resultCard: document.querySelector('[data-rebate-result]'),
    emptyCard: document.querySelector('[data-rebate-empty]'),
    name: document.querySelector('[data-student-name]'),
    roll: document.querySelector('[data-student-roll]'),
    hostel: document.querySelector('[data-student-hostel]'),
    contact: document.querySelector('[data-student-contact]'),
    totalRebate: document.querySelector('[data-total-rebate]'),
    totalAbsent: document.querySelector('[data-total-absent]'),
    totalMonths: document.querySelector('[data-total-months]'),
    rateValue: document.querySelector('[data-rate-value]'),
    tableBody: document.querySelector('[data-records-body]'),
    generated: document.querySelector('[data-rebate-generated]'),
    months: document.querySelector('[data-rebate-months]'),
    statStudents: document.querySelector('[data-stat-students]'),
    statRate: document.querySelector('[data-stat-rate]'),
    statMonths: document.querySelector('[data-stat-months]'),
    recentList: document.querySelector('[data-recent-list]'),
    recentClear: document.querySelector('[data-recent-clear]'),
  };

  const recentStorageKey = 'mess-rebate-recent';
  let recentLookups = loadRecent();

  nodes.rateValue.textContent = rate ? formatter.format(rate) + '/day' : '—';
  nodes.stats.textContent = `${students.size.toLocaleString('en-IN')} students • ${
    data.months.length
  } months • ${formatter.format(rate || 0)}/day rebate`;
  nodes.generated.textContent = data.generatedAt
    ? new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data.generatedAt))
    : '—';
  nodes.months.textContent = data.months.length || '—';
  nodes.statStudents && (nodes.statStudents.textContent = students.size.toLocaleString('en-IN'));
  nodes.statRate && (nodes.statRate.textContent = formatter.format(rate || 0));
  renderMonthBadges();
  renderRecent();

  nodes.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    search(nodes.input.value);
  });

  nodes.input?.addEventListener('input', (event) => {
    const value = event.target.value.toUpperCase();
    event.target.value = value;
    search(value);
  });

  nodes.clearBtn?.addEventListener('click', () => {
    nodes.input.value = '';
    showEmpty('Type a roll number to load the student’s mess rebate summary.');
    nodes.input.focus();
  });

  nodes.recentClear?.addEventListener('click', () => {
    recentLookups = [];
    persistRecent();
    renderRecent();
  });

  nodes.recentList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-roll]');
    if (!button) return;
    const roll = button.dataset.roll;
    if (!roll) return;
    nodes.input.value = roll;
    search(roll);
    nodes.input.focus();
  });

  showEmpty('Type a roll number to load the student’s mess rebate summary.');

  function search(roll) {
    const sanitized = roll.trim();
    if (!sanitized) {
      showEmpty('Type a roll number to load the student’s mess rebate summary.');
      return;
    }
    const student = students.get(sanitized);
    if (!student) {
      showEmpty(`No data found for ${sanitized}.`);
      return;
    }
    renderStudent(student);
  }

  function renderStudent(student) {
    nodes.resultCard.classList.remove('hidden');
    nodes.emptyCard.classList.add('hidden');

    nodes.name.textContent = student.name || 'Unknown student';
    nodes.hostel.textContent = student.hostel || '—';
    nodes.roll.textContent = student.rollNo;
    nodes.contact.textContent = student.contact || '—';

    // Render monthly table (rebate column shows '—' because rebate is semester-level)
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

    // Use semester summaries available in dataset if present; otherwise compute client-side
    const semesterSummaries = (student.semesters && Array.isArray(student.semesters))
      ? student.semesters.map((s) => ({ ...s })) // shallow copy
      : computeSemestersClient(student);

    // Render semester summary block (create if missing)
    let semContainer = nodes.resultCard.querySelector('[data-semester-summary]');
    if (!semContainer) {
      semContainer = document.createElement('div');
      semContainer.setAttribute('data-semester-summary', '');
      semContainer.className = 'semester-summary';
      // place it after the records table
      const tableEl = nodes.tableBody && nodes.tableBody.closest('table');
      if (tableEl && tableEl.parentElement) {
        tableEl.parentElement.appendChild(semContainer);
      } else {
        nodes.resultCard.appendChild(semContainer);
      }
    }

    // Build semester HTML (Option B: detailed breakdown)
    semContainer.innerHTML = semesterSummaries
      .map((s) => {
        if (!s.isPaid) {
          return `
          <div class="sem-card sem-unpaid">
            <h3>${s.name}</h3>
            <p class="dimmed">No data for this semester → treated as <strong>Not Paid</strong>. Rebate: ₹0</p>
          </div>`;
        }
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

    // Total rebate = sum of semester rebates
    const totalRebate = semesterSummaries.reduce((sum, s) => sum + (s.rebate || 0), 0);
    nodes.totalRebate.textContent = formatter.format(totalRebate);

    nodes.totalAbsent.textContent = student.totals.absentDays ?? 0;
    nodes.totalMonths.textContent = student.totals.monthsCount ?? 0;

    rememberLookup(student);
  }

  function computeSemestersClient(student) {
    const summaries = [];
    for (const sem of SEMESTERS) {
      // determine if semester has any global months by checking student.records months
      const studentHasAnyMonth = student.records.some((rec) => {
        const parsed = parseMonthKey(rec.monthKey);
        if (!parsed) return false;
        return monthWithinSem(parsed.year, parsed.monthIndex, sem);
      });

      const semConfiguredPaidAmount = sem.paid || 0;
      const semConsideredPaid = semConfiguredPaidAmount > 0 && studentHasAnyMonth;

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

      let semPresentDays = 0;
      for (const rec of student.records) {
        const parsed = parseMonthKey(rec.monthKey);
        if (!parsed) continue;
        if (monthWithinSem(parsed.year, parsed.monthIndex, sem)) {
          semPresentDays += Number(rec.presentDays) || 0;
        }
      }

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

  function showEmpty(message) {
    nodes.resultCard.classList.add('hidden');
    nodes.emptyCard.classList.remove('hidden');
    nodes.emptyCard.textContent = message;
  }

  function renderMonthBadges() {
    if (!nodes.statMonths) return;
    const months = data.months || [];
    if (!months.length) {
      nodes.statMonths.innerHTML = '<span class="meta">No months loaded yet.</span>';
      return;
    }
    const latest = months.slice(-6);
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

  function persistRecent() {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(recentLookups));
    } catch {
      /* ignore */
    }
  }

  function rememberLookup(student) {
    const entry = {
      roll: student.rollNo,
      name: student.name,
      hostel: student.hostel,
    };
    recentLookups = [entry, ...recentLookups.filter((item) => item.roll !== entry.roll)];
    recentLookups = recentLookups.slice(0, 5);
    persistRecent();
    renderRecent();
  }

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