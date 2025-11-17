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

  if (daySelect) {
    daySelect.value = selectedDay;
    daySelect.addEventListener('change', (event) => {
      selectedDay = event.target.value;
      renderMenu();
    });
  }

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
})();

