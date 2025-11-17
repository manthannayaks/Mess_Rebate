const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const data = window.MESS_REBATE_DATA || { students: {}, months: [] };
const students = new Map(Object.entries(data.students || {}));

const menuData = window.MESS_MENU_DATA || { plans: [] };
let activeMenuId = menuData.plans[0]?.id ?? null;
const dayOrder = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const today = new Date();
const todayDayName = dayOrder[((today.getDay() + 6) % 7 + 7) % 7] || 'Monday'; // map Sunday=0 to dayOrder
let selectedMenuDay = todayDayName;

const elements = {
  input: document.getElementById('roll-input'),
  clear: document.getElementById('clear-btn'),
  stats: document.getElementById('stats'),
  empty: document.getElementById('empty-state'),
  panel: document.getElementById('result-panel'),
  name: document.getElementById('student-name'),
  roll: document.getElementById('student-roll'),
  hostel: document.getElementById('student-hostel'),
  contact: document.getElementById('student-contact'),
  totalRebate: document.getElementById('total-rebate'),
  totalAbsent: document.getElementById('total-absent'),
  totalMonths: document.getElementById('total-months'),
  recordsBody: document.getElementById('records-body'),
  menuTabs: document.getElementById('menu-tabs'),
  menuDays: document.getElementById('menu-days'),
  menuDaySelect: document.getElementById('menu-day-select'),
  todayDate: document.getElementById('today-date'),
  todayDay: document.getElementById('today-day'),
};

elements.stats.textContent = `${students.size} students • ${data.months.length} months • ₹${data.ratePerAbsentDay}/absent day`;

elements.input.addEventListener('input', (event) => {
  const roll = event.target.value.trim().toUpperCase();
  if (!roll) {
    hideResult();
    return;
  }
  const student = students.get(roll);
  if (!student) {
    showNotFound(roll);
    return;
  }
  renderStudent(student);
});

elements.clear.addEventListener('click', () => {
  elements.input.value = '';
  hideResult();
  elements.input.focus();
});

if (elements.todayDate) {
  elements.todayDate.textContent = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today);
}

if (elements.todayDay) {
  elements.todayDay.textContent = todayDayName;
}

if (elements.menuDaySelect) {
  elements.menuDaySelect.value = todayDayName;
  elements.menuDaySelect.addEventListener('change', (event) => {
    selectedMenuDay = event.target.value;
    renderMenuDays();
  });
}

function hideResult() {
  elements.panel.classList.add('hidden');
  elements.empty.classList.remove('hidden');
  elements.empty.textContent = 'Type a roll number to see the full rebate history.';
}

function showNotFound(roll) {
  elements.panel.classList.add('hidden');
  elements.empty.classList.remove('hidden');
  elements.empty.textContent = `No rebate data found for ${roll}.`;
}

function renderStudent(student) {
  elements.panel.classList.remove('hidden');
  elements.empty.classList.add('hidden');

  elements.name.textContent = student.name || 'Unknown student';
  elements.roll.textContent = student.rollNo;
  elements.hostel.textContent = student.hostel || '—';
  elements.contact.textContent = student.contact || '—';
  elements.totalRebate.textContent = currencyFormatter.format(
    student.totals.rebateAmount
  );
  elements.totalAbsent.textContent = student.totals.absentDays;
  elements.totalMonths.textContent = student.totals.monthsCount;

  elements.recordsBody.innerHTML = student.records
    .map(
      (record) => `
        <tr>
          <td>${record.monthLabel}</td>
          <td>${record.presentDays}</td>
          <td>${record.absentDays}</td>
          <td>${currencyFormatter.format(record.rebateAmount)}</td>
        </tr>`
    )
    .join('');
}

function initMenu() {
  if (!elements.menuTabs || !elements.menuDays) return;
  if (!menuData.plans.length) {
    elements.menuDays.innerHTML =
      '<p class="meta">Mess menu not uploaded yet.</p>';
    return;
  }

  renderMenuTabs();
  renderMenuDays();
}

function renderMenuTabs() {
  elements.menuTabs.innerHTML = '';
  menuData.plans.forEach((plan) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = plan.label || plan.type;
    button.className = `menu-tab${
      plan.id === activeMenuId ? ' active' : ''
    }`;
    button.addEventListener('click', () => {
      activeMenuId = plan.id;
      renderMenuTabs();
      renderMenuDays();
    });
    elements.menuTabs.appendChild(button);
  });
}

function renderMenuDays() {
  const plan =
    menuData.plans.find((entry) => entry.id === activeMenuId) ||
    menuData.plans[0];
  if (!plan) return;

  const availableDays = dayOrder.filter((day) =>
    Object.prototype.hasOwnProperty.call(plan.schedule, day)
  );
  if (!availableDays.includes(selectedMenuDay)) {
    selectedMenuDay = availableDays[0] || todayDayName;
  }

  if (elements.menuDaySelect) {
    elements.menuDaySelect.value = selectedMenuDay;
  }

  elements.menuDays.innerHTML = '';
  if (!plan.schedule[selectedMenuDay]) {
    elements.menuDays.innerHTML = `<p class="meta">No menu uploaded for ${selectedMenuDay}.</p>`;
    return;
  }

  const dayCard = document.createElement('div');
  dayCard.className = 'menu-day-card';

  const title = document.createElement('h3');
  title.textContent = selectedMenuDay;
  dayCard.appendChild(title);

  const list = document.createElement('dl');
  ['breakfast', 'lunch', 'snacks', 'dinner'].forEach((mealKey) => {
    const mealData = plan.schedule[selectedMenuDay][mealKey];
    const dt = document.createElement('dt');
    dt.textContent = mealKey;
    const dd = document.createElement('dd');

    if (!mealData) {
      dd.textContent = '—';
    } else if (typeof mealData === 'string') {
      dd.textContent = mealData;
    } else {
      dd.textContent = mealData.veg || '—';
      if (mealData.jain) {
        const jainSpan = document.createElement('span');
        jainSpan.className = 'meal-meta';
        jainSpan.textContent = `Jain: ${mealData.jain}`;
        dd.appendChild(jainSpan);
      }
      if (mealData.compulsory) {
        const compSpan = document.createElement('span');
        compSpan.className = 'meal-meta';
        compSpan.textContent = `Compulsory: ${mealData.compulsory}`;
        dd.appendChild(compSpan);
      }
    }

    list.appendChild(dt);
    list.appendChild(dd);
  });

  dayCard.appendChild(list);
  elements.menuDays.appendChild(dayCard);
}

hideResult();
initMenu();
