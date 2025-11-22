/**
 * ============================================================================
 * APP SHELL SCRIPT (Shared across all pages)
 * ============================================================================
 * 
 * This script provides shared functionality used across all pages:
 * - Navigation menu toggle (mobile)
 * - Theme switching (light/dark/auto)
 * - Profile panel management
 * - Date/time display formatting
 * - Academic calendar data display
 * - Service Worker registration (PWA)
 * - PWA install prompt
 * 
 * This script is loaded on every page to provide consistent UI behavior.
 * ============================================================================
 */

(() => {
  // ==========================================================================
  // DOM ELEMENT REFERENCES - NAVIGATION
  // ==========================================================================
  
  const navToggle = document.querySelector('[data-nav-toggle]'); // Mobile menu toggle button
  const nav = document.querySelector('.site-nav'); // Navigation menu element

  // ==========================================================================
  // DOM ELEMENT REFERENCES - THEME
  // ==========================================================================
  
  const themeButtons = document.querySelectorAll('[data-theme-option]'); // Theme selector buttons
  const THEME_KEY = 'mess-theme-choice'; // localStorage key for theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)'); // System dark mode preference
  let themeChoice = localStorage.getItem(THEME_KEY) || 'auto'; // Current theme choice

  // ==========================================================================
  // DOM ELEMENT REFERENCES - PROFILE
  // ==========================================================================
  
  const profileToggle = document.querySelector('[data-profile-toggle]'); // Profile button
  const profilePanel = document.querySelector('[data-profile-panel]'); // Profile panel overlay
  const profileCloseEls = document.querySelectorAll('[data-profile-close]'); // Close buttons
  const profileForm = document.querySelector('[data-profile-form]'); // Profile form
  const profileInitial = document.querySelector('[data-profile-initial]'); // Profile initial (header)
  const profileLabel = document.querySelector('[data-profile-label]'); // Profile label (header)
  const profileQrPreview = document.querySelector('[data-profile-qr-preview]'); // QR preview in profile

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  const PROFILE_KEY = 'mess-profile'; // localStorage key for profile data
  const QR_KEY = 'user-qr-pass'; // localStorage key for QR data
  let profileData = loadProfile(); // Load saved profile
  let qrData = loadQr(); // Load saved QR

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  
  initTheme(); // Set up theme system
  initProfile(); // Set up profile system

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================
  
  /**
   * Sets up mobile navigation menu toggle
   */
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // ==========================================================================
  // THEME SYSTEM
  // ==========================================================================
  
  /**
   * Initializes the theme switching system
   * Sets up event listeners and applies saved theme preference
   */
  function initTheme() {
    applyTheme(themeChoice); // Apply saved theme
    
    // Set up theme button click handlers
    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        themeChoice = button.dataset.themeOption;
        applyTheme(themeChoice);
      });
    });
    
    // Listen for system theme changes (when auto mode is active)
    prefersDark.addEventListener('change', () => {
      if (themeChoice === 'auto') applyTheme('auto');
    });
  }

  /**
   * Applies the selected theme to the document
   * Resolves 'auto' mode based on system preference
   * 
   * @param {string} choice - Theme choice: 'light', 'dark', or 'auto'
   */
  function applyTheme(choice) {
    localStorage.setItem(THEME_KEY, choice); // Save preference
    
    // Resolve 'auto' to actual theme based on system preference
    const resolved =
      choice === 'dark'
        ? 'dark'
        : choice === 'light'
          ? 'light'
          : prefersDark.matches
            ? 'dark'
            : 'light';
    
    // Apply theme via data attribute (CSS uses this)
    document.documentElement.dataset.theme = resolved;
    updateThemeButtons(choice);
  }

  /**
   * Updates visual state of theme buttons
   * Highlights the active theme option
   * 
   * @param {string} choice - Currently active theme choice
   */
  function updateThemeButtons(choice) {
    themeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.themeOption === choice);
    });
  }

  // ==========================================================================
  // PROFILE SYSTEM
  // ==========================================================================
  
  /**
   * Initializes the profile panel system
   * Sets up event listeners and renders initial state
   */
  function initProfile() {
    renderProfileBadge(); // Update header badge
    renderProfileForm(); // Populate form with saved data
    renderProfileQr(); // Show QR if available

    // Open profile panel when button is clicked
    profileToggle?.addEventListener('click', () => {
      profilePanel?.classList.remove('hidden');
      document.body.classList.add('no-scroll'); // Prevent background scrolling
    });

    // Close panel when close buttons are clicked
    profileCloseEls.forEach((button) =>
      button.addEventListener('click', closeProfilePanel)
    );

    // Close panel on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeProfilePanel();
    });

    // Handle profile form submission
    profileForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Extract form data
      const formData = new FormData(profileForm);
      profileData = {
        name: formData.get('name')?.toString().trim(),
        roll: formData.get('roll')?.toString().trim(),
        hostel: formData.get('hostel')?.toString().trim(),
        phone: formData.get('phone')?.toString().trim(),
      };
      
      // Save and update UI
      saveProfile();
      renderProfileBadge();
      renderProfileForm();
      closeProfilePanel();
    });

    // Listen for QR updates from home page
    window.addEventListener('qrpass:update', () => {
      qrData = loadQr();
      renderProfileQr();
    });
  }

  /**
   * Closes the profile panel
   * Removes overlay and restores scrolling
   */
  function closeProfilePanel() {
    profilePanel?.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }

  /**
   * Renders the profile badge in the header
   * Shows first letter of name or default icon
   */
  function renderProfileBadge() {
    if (!profileInitial || !profileLabel) return;
    
    if (profileData?.name) {
      // Show first letter of name
      const firstLetter = profileData.name.charAt(0).toUpperCase();
      profileInitial.textContent = firstLetter || '☺';
      profileLabel.textContent = profileData.name.split(' ')[0] || 'Profile';
    } else {
      // Show default icon
      profileInitial.textContent = '☺';
      profileLabel.textContent = 'Profile';
    }
    
    // Also update profile avatar in panel (if it exists)
    const profileAvatar = document.querySelector('[data-profile-avatar]');
    const avatarInitial = document.querySelector('[data-profile-avatar] [data-profile-initial]');
    if (avatarInitial) {
      if (profileData?.name) {
        const firstLetter = profileData.name.charAt(0).toUpperCase();
        avatarInitial.textContent = firstLetter || '☺';
      } else {
        avatarInitial.textContent = '☺';
      }
    }
  }

  /**
   * Populates the profile form with saved data
   */
  function renderProfileForm() {
    if (!profileForm) return;
    profileForm.elements.name.value = profileData?.name || '';
    profileForm.elements.roll.value = profileData?.roll || '';
    profileForm.elements.hostel.value = profileData?.hostel || '';
    profileForm.elements.phone.value = profileData?.phone || '';
  }

  /**
   * Renders the QR code preview in the profile panel
   * Shows uploaded QR image and decoded text if available
   */
  function renderProfileQr() {
    if (!profileQrPreview) return;
    
    if (!qrData?.image) {
      // No QR uploaded - show placeholder
      profileQrPreview.innerHTML = `
        <div class="qr-placeholder">
          <span class="qr-icon">📷</span>
          <p>Upload a QR on the home page to see it here</p>
        </div>`;
      return;
    }
    
    // Show QR image and text
    profileQrPreview.innerHTML = `
      <div class="profile-qr-preview__content">
        <img src="${qrData.image}" alt="Stored QR pass" />
        <p>${qrData.text || 'QR text stored locally.'}</p>
      </div>`;
  }

  /**
   * Saves profile data to localStorage
   */
  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    } catch {
      /* ignore storage issues */
    }
  }

  /**
   * Loads profile data from localStorage
   * @returns {Object} Profile data object
   */
  function loadProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Loads QR data from localStorage
   * @returns {Object} QR data object
   */
  function loadQr() {
    try {
      const stored = localStorage.getItem(QR_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  // ==========================================================================
  // DATE & TIME DISPLAY
  // ==========================================================================
  
  /**
   * Updates date/time displays on the page
   * Formats current date and day of week for display
   */
  const today = new Date();
  const dayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'long' });
  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Update all day displays
  document
    .querySelectorAll('[data-current-day]')
    .forEach((node) => (node.textContent = dayFormatter.format(today)));
  
  // Update all date displays
  document
    .querySelectorAll('[data-current-date]')
    .forEach((node) => (node.textContent = dateFormatter.format(today)));

  // ==========================================================================
  // ACADEMIC CALENDAR DATA DISPLAY
  // ==========================================================================
  
  /**
   * Displays academic year and season information
   */
  const calendarData = window.ACADEMIC_CALENDAR;
  
  // Calculate academic year (starts in July)
  // If current month >= July, academic year is current year - next year
  // Otherwise, academic year is previous year - current year
  const academicYear =
    calendarData?.academicYear ||
    `${today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1
    }-${String((today.getFullYear() + 1) % 100).padStart(2, '0')}`;

  // Update all academic year displays
  document
    .querySelectorAll('[data-academic-year]')
    .forEach((node) => (node.textContent = academicYear));

  // Render season cards if available
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

  // Handle calendar PDF open button
  const openCalendarBtn = document.querySelector('[data-open-calendar]');
  if (openCalendarBtn) {
    openCalendarBtn.addEventListener('click', () => {
      window.open('assets/academic-calendar.pdf', '_blank');
    });
  }

  /**
   * Formats a date range for display
   * @param {string} start - Start date string
   * @param {string} end - End date string
   * @returns {string} Formatted date range
   */
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

  // ==========================================================================
  // PROGRESSIVE WEB APP (PWA) FUNCTIONALITY
  // ==========================================================================
  
  /**
   * Registers Service Worker for offline functionality
   * Enables caching and offline access to the app
   */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Get base path for service worker (works for both GitHub Pages and Vercel)
      const swPath = document.querySelector('base')?.href 
        ? new URL('sw.js', document.querySelector('base').href).pathname 
        : '/sw.js';
      
      navigator.serviceWorker.register(swPath)
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

  /**
   * Handles PWA install prompt
   * Shows a banner when the app can be installed
   */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  /**
   * Shows the PWA install banner
   * Allows users to install the app to their device
   */
  function showInstallButton() {
    const installBanner = document.createElement('div');
    installBanner.className = 'pwa-install-banner';
    installBanner.innerHTML = `
      <div class="pwa-install-content">
        <span>📱 Install this app for quick access</span>
        <button class="btn primary slim" id="pwa-install-btn">Install</button>
        <button class="btn ghost slim" id="pwa-dismiss-btn">×</button>
      </div>
    `;
    document.body.appendChild(installBanner);

    // Handle install button click
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBanner.remove();
      }
    });

    // Handle dismiss button click
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      installBanner.remove();
    });
  }
})();

