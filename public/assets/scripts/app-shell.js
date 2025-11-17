(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.site-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
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

