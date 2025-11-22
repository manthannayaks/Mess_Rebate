(() => {
  const menuData = window.MESS_MENU_DATA || { plans: [] };
  const plans = menuData.plans || [];
  if (!plans.length) {
    const output = document.querySelector('[data-menu-output]');
    if (output) {
      output.innerHTML =
        '<p class="meta">No menu uploaded yet. Add CSV files to data__/Menu and rebuild.</p>';
    }
    return;
  }

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const today = dayNames[new Date().getDay()] ?? 'Monday';

  let activePlanId = plans[0].id;
  let selectedDay = today === 'Sunday' ? 'Monday' : today; // mess week starts Monday

  const tabsRoot = document.querySelector('[data-menu-tabs]');
  const daySelect = document.querySelector('[data-menu-day]');
  const titleNode = document.querySelector('[data-menu-title]');
  const gridNode = document.querySelector('[data-menu-grid]');
  const updatedNode = document.querySelector('[data-menu-updated]');

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
  const ratingsKey = 'mess-menu-ratings';
  let ratings = loadRatings();
  let starValue = 0;

  const reminderToggles = document.querySelectorAll('[data-reminder-toggle]');
  const reminderNote = document.querySelector('[data-reminder-note]');
  const reminderConfig = {
    breakfast: { label: 'Breakfast', time: '07:45' },
    lunch: { label: 'Lunch', time: '12:45' },
    snacks: { label: 'Snacks', time: '17:30' },
    dinner: { label: 'Dinner', time: '20:15' },
  };
  const reminderKey = 'mess-reminder-prefs';
  const reminderTimers = new Map();
  let reminderPrefs = loadReminders();

  if (daySelect) {
    daySelect.value = selectedDay;
    daySelect.addEventListener('change', (event) => {
      selectedDay = event.target.value;
      renderMenu();
    });
  }

  initRatings();
  initReminders();
  renderTabs();
  renderMenu();

  function renderTabs() {
    if (!tabsRoot) return;
    tabsRoot.innerHTML = '';
    plans.forEach((plan) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = plan.label || plan.type;
      button.className = plan.id === activePlanId ? 'active' : '';
      button.addEventListener('click', () => {
        activePlanId = plan.id;
        renderTabs();
        renderMenu();
      });
      tabsRoot.appendChild(button);
    });
  }

  function renderMenu() {
    const plan = plans.find((entry) => entry.id === activePlanId) || plans[0];
    if (!plan || !titleNode || !gridNode) return;

    const schedule = plan.schedule || {};
    const daysForPlan = Object.keys(schedule);
    if (!daysForPlan.length) {
      gridNode.innerHTML =
        '<p class="meta">This plan has no entries yet. Update the CSV to populate it.</p>';
      titleNode.textContent = plan.label || plan.type;
      return;
    }

    if (!schedule[selectedDay]) {
      selectedDay = daysForPlan.includes(today) ? today : daysForPlan[0];
      if (daySelect) daySelect.value = selectedDay;
    }

    titleNode.textContent = `${plan.label || plan.type} • ${selectedDay}`;
    updatedNode.textContent = menuData.generatedAt
      ? `Last refreshed ${new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(menuData.generatedAt))}`
      : '';

    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    gridNode.innerHTML = meals
      .map((mealKey) => renderMealCell(mealKey, schedule[selectedDay][mealKey]))
      .join('');
    renderRatings();
  }

  function renderMealCell(mealKey, contents) {
    if (!contents) {
      return `
        <article class="menu-card-item">
          <h3>${mealKey}</h3>
          <p class="meta">No data uploaded.</p>
        </article>`;
    }

    if (typeof contents === 'string') {
      return `
        <article class="menu-card-item">
          <h3>${mealKey}</h3>
          <p>${contents}</p>
        </article>`;
    }

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

  function initRatings() {
    if (!ratingForm) return;

    ratingStars.forEach((button) => {
      button.addEventListener('click', () => {
        starValue = Number(button.dataset.ratingStar);
        updateStarVisuals();
      });
    });

    ratingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!starValue) {
        alert('Please choose a star rating before saving.');
        return;
      }
      const entry = {
        planId: activePlanId,
        day: selectedDay,
        meal: ratingMealSelect.value,
        rating: starValue,
        comment: ratingComment.value.trim(),
        timestamp: new Date().toISOString(),
      };
      ratings.push(entry);
      persistRatings();
      starValue = 0;
      ratingComment.value = '';
      updateStarVisuals();
      renderRatings();
    });

    ratingExportBtn?.addEventListener('click', exportRatings);
  }

  function renderRatings() {
    if (!ratingList) return;
    const current = ratings.filter(
      (entry) => entry.planId === activePlanId && entry.day === selectedDay
    );
    const summary = {
      breakfast: { sum: 0, count: 0 },
      lunch: { sum: 0, count: 0 },
      snacks: { sum: 0, count: 0 },
      dinner: { sum: 0, count: 0 },
    };

    current.forEach((entry) => {
      if (!summary[entry.meal]) return;
      summary[entry.meal].sum += entry.rating;
      summary[entry.meal].count += 1;
    });

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

    if (!current.length) {
      ratingList.innerHTML = '<p class="meta">No feedback saved for this day yet.</p>';
      return;
    }

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

  function exportRatings() {
    if (!ratings.length) {
      alert('No ratings to export yet.');
      return;
    }
    const header = ['Plan', 'Day', 'Meal', 'Rating', 'Comment', 'Timestamp'];
    const rows = ratings.map((row) => [
      row.planId,
      row.day,
      row.meal,
      row.rating,
      row.comment?.replace(/"/g, '""') || '',
      row.timestamp,
    ]);
    const csv = [header, ...rows]
      .map((cells) => cells.map((cell) => `"${cell ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mess-ratings.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function updateStarVisuals() {
    ratingStars.forEach((button) => {
      const value = Number(button.dataset.ratingStar);
      button.classList.toggle('active', value <= starValue);
    });
  }

  function persistRatings() {
    try {
      localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    } catch {
      /* ignore storage errors */
    }
  }

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

  function initReminders() {
    if (!reminderToggles.length) return;
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

    reminderToggles.forEach((toggle) => {
      const meal = toggle.value;
      toggle.checked = Boolean(reminderPrefs[meal]);
      toggle.addEventListener('change', async () => {
        if (toggle.checked) {
          const permission = await ensureNotificationPermission();
          if (permission !== 'granted') {
            toggle.checked = false;
            reminderPrefs[meal] = false;
            persistReminders();
            alert('Unable to enable reminders without notification permission.');
            return;
          }
          reminderPrefs[meal] = true;
          persistReminders();
          scheduleReminder(meal);
        } else {
          reminderPrefs[meal] = false;
          persistReminders();
          cancelReminder(meal);
        }
      });
      if (toggle.checked) {
        scheduleReminder(meal);
      }
    });
  }

  function scheduleReminder(meal) {
    cancelReminder(meal);
    const config = reminderConfig[meal];
    if (!config) return;
    const delay = timeUntil(config.time);
    const id = window.setTimeout(() => {
      showNotification(config.label);
      scheduleReminder(meal);
    }, delay);
    reminderTimers.set(meal, id);
  }

  function cancelReminder(meal) {
    const id = reminderTimers.get(meal);
    if (id) {
      clearTimeout(id);
      reminderTimers.delete(meal);
    }
  }

  function showNotification(label) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(`${label} reminder`, {
      body: `${label} for ${selectedDay} starts soon.`,
    });
  }

  function timeUntil(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  async function ensureNotificationPermission() {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  function persistReminders() {
    try {
      localStorage.setItem(reminderKey, JSON.stringify(reminderPrefs));
    } catch {
      /* ignore */
    }
  }

  function loadReminders() {
    try {
      const stored = localStorage.getItem(reminderKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

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

