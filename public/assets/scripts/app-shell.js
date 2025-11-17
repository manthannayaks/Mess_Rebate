(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.site-nav');
  const themeButtons = document.querySelectorAll('[data-theme-option]');
  const THEME_KEY = 'mess-theme-choice';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let themeChoice = localStorage.getItem(THEME_KEY) || 'auto';

  const profileToggle = document.querySelector('[data-profile-toggle]');
  const profilePanel = document.querySelector('[data-profile-panel]');
  const profileCloseEls = document.querySelectorAll('[data-profile-close]');
  const profileForm = document.querySelector('[data-profile-form]');
  const profileInitial = document.querySelector('[data-profile-initial]');
  const profileLabel = document.querySelector('[data-profile-label]');
  const profileQrPreview = document.querySelector('[data-profile-qr-preview]');

  const PROFILE_KEY = 'mess-profile';
  const QR_KEY = 'user-qr-pass';
  let profileData = loadProfile();
  let qrData = loadQr();

  initTheme();
  initProfile();

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function initTheme() {
    applyTheme(themeChoice);
    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        themeChoice = button.dataset.themeOption;
        applyTheme(themeChoice);
      });
    });
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
    updateThemeButtons(choice);
  }

  function updateThemeButtons(choice) {
    themeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.themeOption === choice);
    });
  }

  function initProfile() {
    renderProfileBadge();
    renderProfileForm();
    renderProfileQr();

    profileToggle?.addEventListener('click', () => {
      profilePanel?.classList.remove('hidden');
      document.body.classList.add('no-scroll');
    });

    profileCloseEls.forEach((button) =>
      button.addEventListener('click', closeProfilePanel)
    );

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeProfilePanel();
    });

    profileForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(profileForm);
      profileData = {
        name: formData.get('name')?.toString().trim(),
        roll: formData.get('roll')?.toString().trim(),
        hostel: formData.get('hostel')?.toString().trim(),
        phone: formData.get('phone')?.toString().trim(),
      };
      saveProfile();
      renderProfileBadge();
      renderProfileForm();
      closeProfilePanel();
    });

    window.addEventListener('qrpass:update', () => {
      qrData = loadQr();
      renderProfileQr();
    });
  }

  function closeProfilePanel() {
    profilePanel?.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }

  function renderProfileBadge() {
    if (!profileInitial || !profileLabel) return;
    if (profileData?.name) {
      const firstLetter = profileData.name.charAt(0).toUpperCase();
      profileInitial.textContent = firstLetter || '☺';
      profileLabel.textContent = profileData.name.split(' ')[0] || 'Profile';
    } else {
      profileInitial.textContent = '☺';
      profileLabel.textContent = 'Profile';
    }
  }

  function renderProfileForm() {
    if (!profileForm) return;
    profileForm.elements.name.value = profileData?.name || '';
    profileForm.elements.roll.value = profileData?.roll || '';
    profileForm.elements.hostel.value = profileData?.hostel || '';
    profileForm.elements.phone.value = profileData?.phone || '';
  }

  function renderProfileQr() {
    if (!profileQrPreview) return;
    if (!qrData?.image) {
      profileQrPreview.innerHTML =
        '<p class="meta">Upload a QR on the home page to see it here.</p>';
      return;
    }
    profileQrPreview.innerHTML = `
      <div class="profile-qr-preview__content">
        <img src="${qrData.image}" alt="Stored QR pass" />
        <p>${qrData.text || 'QR text stored locally.'}</p>
      </div>`;
  }

  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    } catch {
      /* ignore storage issues */
    }
  }

  function loadProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  function loadQr() {
    try {
      const stored = localStorage.getItem(QR_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
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

