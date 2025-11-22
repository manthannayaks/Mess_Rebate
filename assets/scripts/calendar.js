/**
 * ============================================================================
 * ACADEMIC CALENDAR PAGE SCRIPT
 * ============================================================================
 * 
 * This script handles the academic calendar page functionality:
 * - Auto-selects the current month on page load
 * - Renders calendar grid view with events and holidays
 * - Allows users to filter by month
 * - Displays events with color-coded badges
 * 
 * Data Source: data/academic_events.json
 * ============================================================================
 */

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Loads academic calendar events from JSON file
 * @returns {Promise<Object>} Calendar data with month-wise events
 */
async function loadEvents() {
  const res = await fetch("data/academic_events.json");
  return res.json();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Maps event category to CSS class for styling
 * @param {string} category - Event category (holiday, exam, event, etc.)
 * @returns {string} CSS class name for the badge
 */
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

// ============================================================================
// CALENDAR RENDERING FUNCTIONS
// ============================================================================

/**
 * Creates a calendar grid for a specific month
 * Displays days in a grid format with events marked on their respective dates
 * 
 * @param {string} monthName - Full month name (e.g., "January")
 * @param {number} year - Year (e.g., 2025)
 * @param {Array} events - Array of event objects for this month
 * @returns {HTMLElement} DOM element containing the calendar grid
 */
function createCalendarGrid(monthName, year, events) {
  // Create month wrapper container
  const monthDiv = document.createElement("div");
  monthDiv.className = "calendar-month-wrapper";
  
  // Create month header
  const header = document.createElement("div");
  header.className = "calendar-month-header";
  header.innerHTML = `<h2>${monthName} ${year}</h2>`;
  monthDiv.appendChild(header);

  // Create calendar grid container
  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  
  // Add day name headers (Sun, Mon, Tue, etc.)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach(day => {
    const dayNameEl = document.createElement("div");
    dayNameEl.className = "day-name";
    dayNameEl.textContent = day;
    grid.appendChild(dayNameEl);
  });

  // Calculate calendar layout
  const monthIndex = getMonthIndex(monthName);
  const firstDay = new Date(year, monthIndex, 1).getDay(); // Day of week for 1st (0=Sun, 1=Mon, etc.)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Total days in month
  
  // Create a map of events by day number for quick lookup
  const eventMap = new Map();
  events.forEach(event => {
    const day = parseInt(event.date.split(" ")[0]); // Extract day number from date string
    if (!eventMap.has(day)) {
      eventMap.set(day, []);
    }
    eventMap.get(day).push(event);
  });

  // Add empty cells for days before the month starts (to align with day headers)
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    grid.appendChild(cell);
  }

  // Create cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const dayEvents = eventMap.get(day) || []; // Get events for this day
    
    // Add CSS class if day has events
    if (dayEvents.length > 0) {
      cell.className = "calendar-cell has-event";
    } else {
      cell.className = "calendar-cell";
    }

    // Add day number
    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    // Add events for this day
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

  // Add events list below calendar (detailed view)
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

/**
 * Converts month name to JavaScript Date month index (0-11)
 * @param {string} monthName - Full month name
 * @returns {number} Month index (0 = January, 11 = December)
 */
function getMonthIndex(monthName) {
  const months = {
    "January": 0, "February": 1, "March": 2, "April": 3,
    "May": 4, "June": 5, "July": 6, "August": 7,
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  return months[monthName] || 0;
}

/**
 * Extracts year from month key string (e.g., "july_2025" -> 2025)
 * @param {string} monthKey - Month key in format "monthname_year"
 * @returns {number} Year number
 */
function getYearFromKey(monthKey) {
  if (monthKey.includes("2025")) return 2025;
  if (monthKey.includes("2026")) return 2026;
  return new Date().getFullYear();
}

// ============================================================================
// MAIN RENDERING FUNCTION
// ============================================================================

/**
 * Renders the calendar for the selected month(s)
 * If "all" is selected, renders all months
 * 
 * @param {string} selectedMonth - Month key (e.g., "july_2025") or "all"
 */
async function renderCalendar(selectedMonth = "all") {
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";

  // Load calendar data
  const data = await loadEvents();

  // Render each month (or filter to selected month)
  Object.keys(data).forEach(monthKey => {
    // Skip months that don't match the selection
    if (selectedMonth !== "all" && monthKey !== selectedMonth) return;

    const monthData = data[monthKey];
    const monthName = monthData.name.split(" ")[0]; // Extract month name
    const year = getYearFromKey(monthKey); // Extract year
    const events = monthData.events || [];

    // Create and append calendar grid for this month
    const monthCard = createCalendarGrid(monthName, year, events);
    container.appendChild(monthCard);
  });
}

// ============================================================================
// PAGE INITIALIZATION - AUTO-SELECT CURRENT MONTH
// ============================================================================

/**
 * Initializes the calendar page when DOM is ready
 * Auto-selects the current month on page load
 */
document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("monthSelect");
  
  // Get current date information
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' }).toLowerCase(); // e.g., "july"
  const currentYear = now.getFullYear(); // e.g., 2025
  const currentKey = `${currentMonth}_${currentYear}`; // e.g., "july_2025"
  
  // Find the option that matches the current month and year
  const options = Array.from(select.options);
  const currentOption = options.find(opt => {
    const optValue = opt.value;
    if (optValue === "all") return false; // Skip "all" option
    
    // Extract month and year from option value
    const optMonth = optValue.split("_")[0]; // e.g., "july"
    const optYear = optValue.includes("2025") ? 2025 : 2026; // Extract year
    
    // Match if month and year both match
    return optMonth === currentMonth && optYear === currentYear;
  });
  
  // Auto-select current month if found, otherwise show all months
  if (currentOption) {
    select.value = currentOption.value;
    renderCalendar(currentOption.value); // Render only current month
  } else {
    renderCalendar("all"); // Render all months if current month not found
  }

  // Listen for manual month selection changes
  select.addEventListener("change", () => {
    const chosen = select.value;
    renderCalendar(chosen);
  });
});

// ============================================================================
// PDF VIEWER FUNCTION
// ============================================================================

/**
 * Opens the academic calendar PDF in a new tab
 * Called when user clicks the "Open PDF" button
 */
function openPDF() {
  window.open("assets/academic-calendar.pdf", "_blank");
}
