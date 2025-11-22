/**
 * ============================================================================
 * MESS MENU PAGE SCRIPT
 * ============================================================================
 * 
 * This script handles the mess menu page functionality:
 * - Auto-selects the current day of the week on page load
 * - Renders menu plans (veg/non-veg) with day-wise schedules
 * - Allows users to switch between days and menu plans
 * - Manages meal ratings and feedback
 * - Handles meal reminder notifications
 * 
 * Data Source: window.MESS_MENU_DATA (loaded from data/menu-data.js)
 * ============================================================================
 */

(() => {
  // ==========================================================================
  // INITIALIZATION & DATA LOADING
  // ==========================================================================
  
  // Load menu data from global variable (set by menu-data.js)
  const menuData = window.MESS_MENU_DATA || { plans: [] };
  const plans = menuData.plans || [];
  
  // If no menu data is available, show a message and exit
  if (!plans.length) {
    const output = document.querySelector('[data-menu-output]');
    if (output) {
      output.innerHTML =
        '<p class="meta">No menu uploaded yet. Add CSV files to data__/Menu and rebuild.</p>';
    }
    return;
  }

  // ==========================================================================
  // DAY SELECTION - AUTO-SELECT CURRENT DAY
  // ==========================================================================
  
  // Array of day names in order (Sunday = 0, Monday = 1, etc.)
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  
  // Get current day of the week (0 = Sunday, 1 = Monday, etc.)
  const today = dayNames[new Date().getDay()] ?? 'Monday';

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  // Currently active menu plan (veg or non-veg)
  let activePlanId = plans[0].id;
  
  // Currently selected day - auto-select today (default to Monday if Sunday)
  // Note: Mess typically operates Monday-Saturday, so Sunday defaults to Monday
  let selectedDay = today === 'Sunday' ? 'Monday' : today;

  // ==========================================================================
  // DOM ELEMENT REFERENCES
  // ==========================================================================
  
  const tabsRoot = document.querySelector('[data-menu-tabs]'); // Menu plan tabs container
  const daySelect = document.querySelector('[data-menu-day]'); // Day dropdown selector
  const titleNode = document.querySelector('[data-menu-title]'); // Menu title display
  const gridNode = document.querySelector('[data-menu-grid]'); // Menu items grid
  const updatedNode = document.querySelector('[data-menu-updated]'); // Last updated timestamp

  // Rating system elements
  const ratingForm = document.querySelector('[data-rating-form]');
  const ratingMealSelect = document.querySelector('[data-rating-meal]');
  const ratingStars = document.querySelectorAll('[data-rating-star]');
  const ratingComment = document.querySelector('[data-rating-comment]');
  const ratingList = document.querySelector('[data-rating-list]');
  const ratingSummaryNodes = {
    breakfast: document.querySelector('[data-rating-summary-breakfast]'),
    lunch: document.querySelector('[data-rating-summary-lunch]'),
    snacks: document.querySelector('[data-rating-summary-snacks]'),
    dinner: document.querySelector('[data-rating-summary-dinner]'),
  };
  const ratingExportBtn = document.querySelector('[data-rating-export]');
  
  // Reminder system elements
  const reminderToggles = document.querySelectorAll('[data-reminder-toggle]');
  const reminderNote = document.querySelector('[data-reminder-note]');

  // ==========================================================================
  // RATINGS SYSTEM
  // ==========================================================================
  
  const ratingsKey = 'mess-menu-ratings'; // localStorage key for ratings
  let ratings = loadRatings(); // Load saved ratings from localStorage
  let starValue = 0; // Currently selected star rating (1-5)

  // ==========================================================================
  // REMINDER SYSTEM
  // ==========================================================================
  
  // Meal reminder configuration (times in 24-hour format)
  const reminderConfig = {
    breakfast: { label: 'Breakfast', time: '07:45' },
    lunch: { label: 'Lunch', time: '12:45' },
    snacks: { label: 'Snacks', time: '17:30' },
    dinner: { label: 'Dinner', time: '20:15' },
  };
  const reminderKey = 'mess-reminder-prefs'; // localStorage key for reminder preferences
  const reminderTimers = new Map(); // Active reminder timers
  let reminderPrefs = loadReminders(); // Load saved reminder preferences

  // ==========================================================================
  // DAY SELECTOR SETUP - AUTO-SELECT CURRENT DAY
  // ==========================================================================
  
  if (daySelect) {
    // Set the dropdown to the current day (auto-select on page load)
    daySelect.value = selectedDay;
    
    // Listen for manual day changes
    daySelect.addEventListener('change', (event) => {
      selectedDay = event.target.value;
      renderMenu(); // Re-render menu for the new day
    });
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  
  initRatings(); // Set up rating system
  initReminders(); // Set up reminder notifications
  renderTabs(); // Render menu plan tabs (veg/non-veg)
  renderMenu(); // Render the menu for the selected day

  // ==========================================================================
  // MENU RENDERING FUNCTIONS
  // ==========================================================================
  
  /**
   * Renders the menu plan tabs (Veg/Non-Veg buttons)
   * Allows users to switch between different menu plans
   */
  function renderTabs() {
    if (!tabsRoot) return;
    tabsRoot.innerHTML = '';
    
    // Create a button for each menu plan
    plans.forEach((plan) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = plan.label || plan.type;
      button.className = plan.id === activePlanId ? 'active' : '';
      
      // When clicked, switch to this plan and re-render
      button.addEventListener('click', () => {
        activePlanId = plan.id;
        renderTabs(); // Update active state
        renderMenu(); // Show menu for new plan
      });
      tabsRoot.appendChild(button);
    });
  }

  /**
   * Renders the menu for the currently selected day and plan
   * Auto-adjusts selected day if current day is not available in the schedule
   */
  function renderMenu() {
    // Find the active plan (veg or non-veg)
    const plan = plans.find((entry) => entry.id === activePlanId) || plans[0];
    if (!plan || !titleNode || !gridNode) return;

    const schedule = plan.schedule || {}; // Day-wise meal schedule
    const daysForPlan = Object.keys(schedule); // Available days in this plan
    
    // If no schedule data exists, show a message
    if (!daysForPlan.length) {
      gridNode.innerHTML =
        '<p class="meta">This plan has no entries yet. Update the CSV to populate it.</p>';
      titleNode.textContent = plan.label || plan.type;
      return;
    }

    // If selected day is not available in schedule, auto-select a valid day
    // Priority: today if available, otherwise first available day
    if (!schedule[selectedDay]) {
      selectedDay = daysForPlan.includes(today) ? today : daysForPlan[0];
      if (daySelect) daySelect.value = selectedDay; // Update dropdown
    }

    // Update page title with plan name and selected day
    titleNode.textContent = `${plan.label || plan.type} • ${selectedDay}`;
    
    // Show last updated timestamp if available
    updatedNode.textContent = menuData.generatedAt
      ? `Last refreshed ${new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(menuData.generatedAt))}`
      : '';

    // Render all meals for the selected day
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    gridNode.innerHTML = meals
      .map((mealKey) => renderMealCell(mealKey, schedule[selectedDay][mealKey]))
      .join('');
    
    // Update ratings display for the current day
    renderRatings();
  }

  /**
   * Renders a single meal card (breakfast, lunch, snacks, or dinner)
   * Handles both simple string format and detailed object format (for veg menu)
   * 
   * @param {string} mealKey - The meal type (breakfast, lunch, snacks, dinner)
   * @param {string|object} contents - Meal content (string for non-veg, object for veg)
   * @returns {string} HTML string for the meal card
   */
  function renderMealCell(mealKey, contents) {
    // No data available
    if (!contents) {
      return `
        <article class="menu-card-item">
          <h3>${mealKey}</h3>
          <p class="meta">No data uploaded.</p>
        </article>`;
    }

    // Simple string format (non-veg menu)
    if (typeof contents === 'string') {
      return `
        <article class="menu-card-item">
          <h3>${mealKey}</h3>
          <p>${contents}</p>
        </article>`;
    }

    // Detailed object format (veg menu with veg/jain/compulsory options)
    return `
      <article class="menu-card-item">
        <h3>${mealKey}</h3>
        <ul>
          <li><strong>Main:</strong> ${contents.veg || '—'}</li>
          ${
            contents.jain
              ? `<li><strong>Jain:</strong> ${contents.jain}</li>`
              : ''
          }
          ${
            contents.compulsory
              ? `<li><strong>Counter:</strong> ${contents.compulsory}</li>`
              : ''
          }
        </ul>
      </article>`;
  }

  // ==========================================================================
  // RATINGS SYSTEM FUNCTIONS
  // ==========================================================================
  
  /**
   * Initializes the meal rating system
   * Sets up event listeners for star ratings and form submission
   */
  function initRatings() {
    if (!ratingForm) return;

    // Make star buttons clickable
    ratingStars.forEach((button) => {
      button.addEventListener('click', () => {
        starValue = Number(button.dataset.ratingStar);
        updateStarVisuals(); // Highlight selected stars
      });
    });

    // Handle form submission
    ratingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Validate that a rating was selected
      if (!starValue) {
        alert('Please choose a star rating before saving.');
        return;
      }
      
      // Create rating entry
      const entry = {
        planId: activePlanId, // Which menu plan (veg/non-veg)
        day: selectedDay, // Which day of the week
        meal: ratingMealSelect.value, // Which meal (breakfast/lunch/etc)
        rating: starValue, // Star rating (1-5)
        comment: ratingComment.value.trim(), // Optional comment
        timestamp: new Date().toISOString(), // When the rating was given
      };
      
      // Save rating and update display
      ratings.push(entry);
      persistRatings(); // Save to localStorage
      starValue = 0;
      ratingComment.value = '';
      updateStarVisuals();
      renderRatings(); // Refresh ratings display
    });

    // Export ratings to CSV
    ratingExportBtn?.addEventListener('click', exportRatings);
  }

  /**
   * Renders ratings for the currently selected day and plan
   * Shows average ratings per meal and individual rating entries
   */
  function renderRatings() {
    if (!ratingList) return;
    
    // Filter ratings for current plan and day
    const current = ratings.filter(
      (entry) => entry.planId === activePlanId && entry.day === selectedDay
    );
    
    // Calculate average ratings per meal
    const summary = {
      breakfast: { sum: 0, count: 0 },
      lunch: { sum: 0, count: 0 },
      snacks: { sum: 0, count: 0 },
      dinner: { sum: 0, count: 0 },
    };

    // Sum up ratings for each meal
    current.forEach((entry) => {
      if (!summary[entry.meal]) return;
      summary[entry.meal].sum += entry.rating;
      summary[entry.meal].count += 1;
    });

    // Display average ratings in summary nodes
    Object.entries(summary).forEach(([meal, stats]) => {
      const node = ratingSummaryNodes[meal];
      if (!node) return;
      if (!stats.count) {
        node.textContent = '—';
        return;
      }
      const average = (stats.sum / stats.count).toFixed(1);
      node.textContent = `${average} ★ (${stats.count})`;
    });

    // Show message if no ratings exist
    if (!current.length) {
      ratingList.innerHTML = '<p class="meta">No feedback saved for this day yet.</p>';
      return;
    }

    // Render individual rating entries
    ratingList.innerHTML = current
      .map(
        (entry) => `
        <article class="rating-entry">
          <strong>${capitalize(entry.meal)} — ${'★'.repeat(entry.rating)}</strong>
          ${
            entry.comment
              ? `<p>${entry.comment}</p>`
              : '<p class="meta">No comment added.</p>'
          }
          <p class="meta">${formatTimestamp(entry.timestamp)}</p>
        </article>`
      )
      .join('');
  }

  /**
   * Exports all ratings to a CSV file
   * Allows mess staff to download and analyze feedback
   */
  function exportRatings() {
    if (!ratings.length) {
      alert('No ratings to export yet.');
      return;
    }
    
    // Create CSV structure
    const header = ['Plan', 'Day', 'Meal', 'Rating', 'Comment', 'Timestamp'];
    const rows = ratings.map((row) => [
      row.planId,
      row.day,
      row.meal,
      row.rating,
      row.comment?.replace(/"/g, '""') || '', // Escape quotes in CSV
      row.timestamp,
    ]);
    
    // Convert to CSV format
    const csv = [header, ...rows]
      .map((cells) => cells.map((cell) => `"${cell ?? ''}"`).join(','))
      .join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mess-ratings.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Updates visual appearance of star rating buttons
   * Highlights stars up to the selected rating value
   */
  function updateStarVisuals() {
    ratingStars.forEach((button) => {
      const value = Number(button.dataset.ratingStar);
      button.classList.toggle('active', value <= starValue);
    });
  }

  /**
   * Saves ratings to localStorage
   * Persists user feedback across page reloads
   */
  function persistRatings() {
    try {
      localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    } catch {
      /* ignore storage errors */
    }
  }

  /**
   * Loads ratings from localStorage
   * @returns {Array} Array of rating entries
   */
  function loadRatings() {
    try {
      const stored = localStorage.getItem(ratingsKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // ==========================================================================
  // REMINDER SYSTEM FUNCTIONS
  // ==========================================================================
  
  /**
   * Initializes the meal reminder notification system
   * Sets up toggles and schedules notifications based on user preferences
   */
  function initReminders() {
    if (!reminderToggles.length) return;
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      reminderToggles.forEach((toggle) => {
        toggle.disabled = true;
      });
      if (reminderNote) {
        reminderNote.textContent =
          'Notifications are not supported in this browser.';
      }
      return;
    }

    // Set up each meal reminder toggle
    reminderToggles.forEach((toggle) => {
      const meal = toggle.value;
      toggle.checked = Boolean(reminderPrefs[meal]);
      
      // Handle toggle changes
      toggle.addEventListener('change', async () => {
        if (toggle.checked) {
          // Request notification permission
          const permission = await ensureNotificationPermission();
          if (permission !== 'granted') {
            toggle.checked = false;
            reminderPrefs[meal] = false;
            persistReminders();
            alert('Unable to enable reminders without notification permission.');
            return;
          }
          // Enable reminder
          reminderPrefs[meal] = true;
          persistReminders();
          scheduleReminder(meal);
        } else {
          // Disable reminder
          reminderPrefs[meal] = false;
          persistReminders();
          cancelReminder(meal);
        }
      });
      
      // If already enabled, schedule it
      if (toggle.checked) {
        scheduleReminder(meal);
      }
    });
  }

  /**
   * Schedules a reminder notification for a specific meal
   * Sets up a timer that triggers at the meal time and repeats daily
   * 
   * @param {string} meal - Meal type (breakfast, lunch, snacks, dinner)
   */
  function scheduleReminder(meal) {
    cancelReminder(meal); // Cancel any existing reminder
    
    const config = reminderConfig[meal];
    if (!config) return;
    
    // Calculate delay until next meal time
    const delay = timeUntil(config.time);
    
    // Set timeout to show notification and reschedule for next day
    const id = window.setTimeout(() => {
      showNotification(config.label);
      scheduleReminder(meal); // Reschedule for tomorrow
    }, delay);
    
    reminderTimers.set(meal, id); // Store timer ID
  }

  /**
   * Cancels a scheduled reminder for a specific meal
   * 
   * @param {string} meal - Meal type to cancel
   */
  function cancelReminder(meal) {
    const id = reminderTimers.get(meal);
    if (id) {
      clearTimeout(id);
      reminderTimers.delete(meal);
    }
  }

  /**
   * Shows a browser notification for a meal reminder
   * 
   * @param {string} label - Meal label (e.g., "Breakfast")
   */
  function showNotification(label) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    new Notification(`${label} reminder`, {
      body: `${label} for ${selectedDay} starts soon.`,
    });
  }

  /**
   * Calculates milliseconds until a specific time
   * If the time has passed today, calculates for tomorrow
   * 
   * @param {string} timeString - Time in HH:MM format (24-hour)
   * @returns {number} Milliseconds until the target time
   */
  function timeUntil(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (target <= now) target.setDate(target.getDate() + 1);
    
    return target - now;
  }

  /**
   * Requests notification permission from the user
   * @returns {Promise<string>} Permission status ('granted', 'denied', or 'default')
   */
  async function ensureNotificationPermission() {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  /**
   * Saves reminder preferences to localStorage
   */
  function persistReminders() {
    try {
      localStorage.setItem(reminderKey, JSON.stringify(reminderPrefs));
    } catch {
      /* ignore */
    }
  }

  /**
   * Loads reminder preferences from localStorage
   * @returns {Object} Reminder preferences object
   */
  function loadReminders() {
    try {
      const stored = localStorage.getItem(reminderKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  
  /**
   * Capitalizes the first letter of a string
   * @param {string} value - String to capitalize
   * @returns {string} Capitalized string
   */
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /**
   * Formats a timestamp for display
   * @param {string} value - ISO timestamp string
   * @returns {string} Formatted date string
   */
  function formatTimestamp(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value));
    } catch {
      return value;
    }
  }
})();

