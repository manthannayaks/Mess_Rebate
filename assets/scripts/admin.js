// -------------------------------
// Admin Login System & Dashboard
// -------------------------------

async function loadAdminData() {
  const res = await fetch("data/admin.json");
  return res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  // Protect admin-dashboard.html
  if (window.location.pathname.includes("admin-dashboard.html")) {
    const logged = localStorage.getItem("admin-logged-in");
    if (!logged) {
      window.location.href = "login.html";
      return;
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("admin-logged-in");
        window.location.href = "login.html";
      });
    }
  }

  // Login form logic
  const form = document.getElementById("adminLoginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = document.getElementById("adminUser").value.trim();
      const pass = document.getElementById("adminPass").value.trim();
      const errorBox = document.getElementById("loginError");

      const data = await loadAdminData();

      if (user === data.username && pass === data.password) {
        localStorage.setItem("admin-logged-in", "yes");
        window.location.href = "admin-dashboard.html";
      } else {
        if (errorBox) errorBox.style.display = "block";
      }
    });
  }

  // --------------------------
  // ADMIN DASHBOARD
  // --------------------------
  const menuEditorWrap = document.getElementById("admin-menu-editor");
  const rebateEditorWrap = document.getElementById("admin-rebate-editor");
  const calendarEditorWrap = document.getElementById("admin-calendar-editor");

  const menuEditor = document.getElementById("menuEditor");
  const rebateEditor = document.getElementById("rebateEditor");
  const calendarEditor = document.getElementById("calendarEditor");

  // Action cards
  if (document.querySelector("[data-admin-action]")) {
    document.querySelectorAll("[data-admin-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.adminAction;

        menuEditorWrap?.classList.add("hidden");
        rebateEditorWrap?.classList.add("hidden");
        calendarEditorWrap?.classList.add("hidden");

        if (type === "menu") menuEditorWrap?.classList.remove("hidden");
        if (type === "rebates") rebateEditorWrap?.classList.remove("hidden");
        if (type === "calendar") calendarEditorWrap?.classList.remove("hidden");
      });
    });
  }

  // Close editor buttons
  document.querySelectorAll("[data-close-editor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      menuEditorWrap?.classList.add("hidden");
      rebateEditorWrap?.classList.add("hidden");
      calendarEditorWrap?.classList.add("hidden");
    });
  });

  // --------------------------
  // LOAD FILES INTO EDITOR
  // --------------------------

  // MENU FILE
  if (menuEditor) {
    const savedMenu = localStorage.getItem("menuData");
    if (savedMenu) {
      menuEditor.value = savedMenu;
    } else {
      fetch("data/menu-data.js")
        .then((res) => res.text())
        .then((txt) => (menuEditor.value = txt))
        .catch(() => (menuEditor.value = "// Error loading menu data"));
    }

    document.getElementById("saveMenuBtn")?.addEventListener("click", () => {
      localStorage.setItem("menuData", menuEditor.value);
      showNotification("Mess Menu saved successfully!");
    });

    document.getElementById("resetMenuBtn")?.addEventListener("click", () => {
      fetch("data/menu-data.js")
        .then((res) => res.text())
        .then((txt) => {
          menuEditor.value = txt;
          localStorage.removeItem("menuData");
          showNotification("Menu data reset to original");
        });
    });
  }

  // REBATE FILE
  if (rebateEditor) {
    const savedRebate = localStorage.getItem("rebateData");
    if (savedRebate) {
      rebateEditor.value = savedRebate;
    } else {
      fetch("data/rebates-data.js")
        .then((res) => res.text())
        .then((txt) => (rebateEditor.value = txt))
        .catch(() => (rebateEditor.value = "// Error loading rebate data"));
    }

    document.getElementById("saveRebateBtn")?.addEventListener("click", () => {
      localStorage.setItem("rebateData", rebateEditor.value);
      showNotification("Rebate data saved successfully!");
    });

    document.getElementById("resetRebateBtn")?.addEventListener("click", () => {
      fetch("data/rebates-data.js")
        .then((res) => res.text())
        .then((txt) => {
          rebateEditor.value = txt;
          localStorage.removeItem("rebateData");
          showNotification("Rebate data reset to original");
        });
    });
  }

  // CALENDAR FILE
  if (calendarEditor) {
    const savedCalendar = localStorage.getItem("calendarData");
    if (savedCalendar) {
      calendarEditor.value = savedCalendar;
    } else {
      fetch("data/academic_events.json")
        .then((res) => res.json())
        .then((data) => (calendarEditor.value = JSON.stringify(data, null, 2)))
        .catch(() => (calendarEditor.value = "// Error loading calendar data"));
    }

    document.getElementById("saveCalendarBtn")?.addEventListener("click", () => {
      try {
        JSON.parse(calendarEditor.value); // Validate JSON
        localStorage.setItem("calendarData", calendarEditor.value);
        showNotification("Calendar saved successfully!");
      } catch (e) {
        showNotification("Invalid JSON format!", "error");
      }
    });

    document.getElementById("resetCalendarBtn")?.addEventListener("click", () => {
      fetch("data/academic_events.json")
        .then((res) => res.json())
        .then((data) => {
          calendarEditor.value = JSON.stringify(data, null, 2);
          localStorage.removeItem("calendarData");
          showNotification("Calendar data reset to original");
        });
    });
  }
});

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `admin-notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
