(() => {
  const calendar = window.ACADEMIC_CALENDAR || { events: [] };
  const gridRoot = document.querySelector('[data-calendar-grid]');

  if (!gridRoot) return;

  const events = Array.isArray(calendar.events) ? calendar.events : [];
  const eventsByDate = groupEvents(events);
  const months = buildMonthRange(calendar, events);

  gridRoot.innerHTML = months.map(renderMonth).join('');

  function groupEvents(list) {
    return list.reduce((map, event) => {
      if (!event.date) return map;
      const bucket = map.get(event.date) || [];
      bucket.push(event);
      map.set(event.date, bucket);
      return map;
    }, new Map());
  }

  function buildMonthRange(calendarData, eventsList) {
    if (!eventsList.length) {
      return fallbackMonths(calendarData.academicYear);
    }

    const sorted = eventsList
      .map((event) => new Date(event.date))
      .sort((a, b) => a - b);
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    return enumerateMonths(start, end);
  }

  function fallbackMonths(academicYearLabel = '') {
    const startYear = parseInt(academicYearLabel, 10) || new Date().getFullYear();
    const start = new Date(startYear, 6, 1); // July
    const end = new Date(startYear + 1, 5, 30); // June next year
    return enumerateMonths(start, end);
  }

  function enumerateMonths(startDate, endDate) {
    const months = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= end) {
      months.push({
        year: cursor.getFullYear(),
        monthIndex: cursor.getMonth(),
        label: new Intl.DateTimeFormat('en-IN', {
          month: 'long',
          year: 'numeric',
        }).format(cursor),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }

  function renderMonth(month) {
    const firstDay = new Date(month.year, month.monthIndex, 1);
    const totalDays = new Date(month.year, month.monthIndex + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = [
        month.year,
        String(month.monthIndex + 1).padStart(2, '0'),
        String(day).padStart(2, '0'),
      ].join('-');
      cells.push({
        day,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return `
      <section class="calendar-month">
        <h3>${month.label}</h3>
        <div class="calendar-grid">
          ${dayNames.map((name) => `<span class="day-name">${name}</span>`).join('')}
          ${cells
            .map((cell, index) =>
              cell
                ? renderCell(cell)
                : `<div class="calendar-cell" aria-hidden="true"></div>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function renderCell(cell) {
    if (!cell) return '<div class="calendar-cell"></div>';
    const hasEvent = cell.events.length > 0;
    return `
      <div class="calendar-cell${hasEvent ? ' has-event' : ''}">
        <span class="date">${cell.day}</span>
        ${
          hasEvent
            ? `<ul>${cell.events
              .map(
                (event) => `
              <li>
                <span class="badge badge-${event.category || 'event'}"></span>
                <span>${event.title}</span>
              </li>`
              )
              .join('')}</ul>`
            : ''
        }
      </div>`;
  }
})();

