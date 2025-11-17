(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.site-nav');
  const themeSelect = document.querySelector('[data-theme-select]');
  const THEME_KEY = 'mess-theme-choice';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let themeChoice = localStorage.getItem(THEME_KEY) || 'auto';

  initTheme();

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function initTheme() {
    applyTheme(themeChoice);
    if (themeSelect) {
      themeSelect.value = themeChoice;
      themeSelect.addEventListener('change', (event) => {
        themeChoice = event.target.value;
        applyTheme(themeChoice);
      });
    }
    prefersDark.addEventListener('change', () => {
      if (themeChoice === 'auto') applyTheme('auto');
    });
  }

  function applyTheme(choice) {
    localStorage.setItem(THEME_KEY, choice);
    const resolved =
      choice === 'dark'
        ? 'dark'
        : choice === 'light'
          ? 'light'
          : prefersDark.matches
            ? 'dark'
            : 'light';
    document.documentElement.dataset.theme = resolved;
  }

  const today = new Date();
  const dayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'long' });
  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  document
    .querySelectorAll('[data-current-day]')
    .forEach((node) => (node.textContent = dayFormatter.format(today)));
  document
    .querySelectorAll('[data-current-date]')
    .forEach((node) => (node.textContent = dateFormatter.format(today)));

  const calendarData = window.ACADEMIC_CALENDAR;
  const academicYear =
    calendarData?.academicYear ||
    `${today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1
    }-${String((today.getFullYear() + 1) % 100).padStart(2, '0')}`;

  document
    .querySelectorAll('[data-academic-year]')
    .forEach((node) => (node.textContent = academicYear));

  const seasonSection = document.querySelector('[data-season-list]');
  const seasonGrid = document.querySelector('[data-season-grid]');
  if (seasonGrid && calendarData?.seasons?.length) {
    seasonGrid.innerHTML = calendarData.seasons
      .map(
        ({ label, start, end }) => `
        <article class="season-card">
          <h3>${label}</h3>
          <p class="meta">${formatRange(start, end)}</p>
        </article>`
      )
      .join('');
  } else if (seasonSection) {
    seasonSection.classList.add('hidden');
  }

  const openCalendarBtn = document.querySelector('[data-open-calendar]');
  if (openCalendarBtn) {
    openCalendarBtn.addEventListener('click', () => {
      window.open('assets/academic-calendar.pdf', '_blank');
    });
  }

  function formatRange(start, end) {
    if (!start || !end) return 'TBA';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatter = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
  }
})();

