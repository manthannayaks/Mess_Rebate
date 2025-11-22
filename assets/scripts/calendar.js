// -------------------------------
// Academic Calendar Renderer - Enhanced Month-wise View
// -------------------------------

async function loadEvents() {
  const res = await fetch("data/academic_events.json");
  return res.json();
}

function getCategoryClass(category) {
  const map = {
    holiday: "badge-holiday",
    exam: "badge-exam",
    event: "badge-event",
    break: "badge-break",
    milestone: "badge-milestone",
    academic: "badge-academic"
  };
  return map[category] || "badge-event";
}

function createCalendarGrid(monthName, year, events) {
  const monthDiv = document.createElement("div");
  monthDiv.className = "calendar-month-wrapper";
  
  const header = document.createElement("div");
  header.className = "calendar-month-header";
  header.innerHTML = `<h2>${monthName} ${year}</h2>`;
  monthDiv.appendChild(header);

  // Create calendar grid
  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  
  // Day names header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach(day => {
    const dayNameEl = document.createElement("div");
    dayNameEl.className = "day-name";
    dayNameEl.textContent = day;
    grid.appendChild(dayNameEl);
  });

  // Get first day of month and number of days
  const monthIndex = getMonthIndex(monthName);
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  // Create event map by date
  const eventMap = new Map();
  events.forEach(event => {
    const day = parseInt(event.date.split(" ")[0]);
    if (!eventMap.has(day)) {
      eventMap.set(day, []);
    }
    eventMap.get(day).push(event);
  });

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    grid.appendChild(cell);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const dayEvents = eventMap.get(day) || [];
    
    if (dayEvents.length > 0) {
      cell.className = "calendar-cell has-event";
    } else {
      cell.className = "calendar-cell";
    }

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    if (dayEvents.length > 0) {
      const eventsList = document.createElement("ul");
      dayEvents.forEach(event => {
        const li = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = `badge ${getCategoryClass(event.category || "event")}`;
        const text = document.createElement("span");
        text.className = "event-text";
        text.textContent = event.title;
        li.appendChild(badge);
        li.appendChild(text);
        eventsList.appendChild(li);
      });
      cell.appendChild(eventsList);
    }

    grid.appendChild(cell);
  }

  monthDiv.appendChild(grid);

  // Events list below calendar
  if (events.length > 0) {
    const eventsSection = document.createElement("div");
    eventsSection.className = "calendar-events-list";
    const eventsTitle = document.createElement("h3");
    eventsTitle.textContent = "Events & Holidays";
    eventsSection.appendChild(eventsTitle);
    
    const eventsList = document.createElement("ul");
    eventsList.className = "events-list";
    events.forEach(event => {
      const li = document.createElement("li");
      li.className = "calendar-event-item";
      const date = document.createElement("span");
      date.className = "event-date";
      date.textContent = event.date;
      const title = document.createElement("span");
      title.className = "event-title";
      title.textContent = event.title;
      const badge = document.createElement("span");
      badge.className = `event-badge ${getCategoryClass(event.category || "event")}`;
      li.appendChild(badge);
      li.appendChild(date);
      li.appendChild(title);
      eventsList.appendChild(li);
    });
    eventsSection.appendChild(eventsList);
    monthDiv.appendChild(eventsSection);
  }

  return monthDiv;
}

function getMonthIndex(monthName) {
  const months = {
    "January": 0, "February": 1, "March": 2, "April": 3,
    "May": 4, "June": 5, "July": 6, "August": 7,
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  return months[monthName] || 0;
}

function getYearFromKey(monthKey) {
  if (monthKey.includes("2025")) return 2025;
  if (monthKey.includes("2026")) return 2026;
  return new Date().getFullYear();
}

async function renderCalendar(selectedMonth = "all") {
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";

  const data = await loadEvents();

  Object.keys(data).forEach(monthKey => {
    if (selectedMonth !== "all" && monthKey !== selectedMonth) return;

    const monthData = data[monthKey];
    const monthName = monthData.name.split(" ")[0];
    const year = getYearFromKey(monthKey);
    const events = monthData.events || [];

    const monthCard = createCalendarGrid(monthName, year, events);
    container.appendChild(monthCard);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("monthSelect");
  
  // Set current month as default
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' }).toLowerCase();
  const currentYear = now.getFullYear();
  const currentKey = `${currentMonth}_${currentYear}`;
  
  // Try to match current month
  const options = Array.from(select.options);
  const currentOption = options.find(opt => {
    const optValue = opt.value;
    if (optValue === "all") return false;
    const optMonth = optValue.split("_")[0];
    const optYear = optValue.includes("2025") ? 2025 : 2026;
    return optMonth === currentMonth && optYear === currentYear;
  });
  
  if (currentOption) {
    select.value = currentOption.value;
    renderCalendar(currentOption.value);
  } else {
    renderCalendar("all");
  }

  select.addEventListener("change", () => {
    const chosen = select.value;
    renderCalendar(chosen);
  });
});

function openPDF() {
  window.open("assets/academic-calendar.pdf", "_blank");
}
