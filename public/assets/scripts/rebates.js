(() => {
  const data = window.MESS_REBATE_DATA || { students: {}, months: [] };
  const students = new Map(Object.entries(data.students || {}));
  const rate = data.ratePerAbsentDay || 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const nodes = {
    form: document.querySelector('[data-rebate-form]'),
    input: document.querySelector('[data-rebate-form] input[name="roll"]'),
    clearBtn: document.querySelector('[data-rebate-search] [data-action="clear"]'),
    stats: document.querySelector('[data-rebate-stats]'),
    resultCard: document.querySelector('[data-rebate-result]'),
    emptyCard: document.querySelector('[data-rebate-empty]'),
    name: document.querySelector('[data-student-name]'),
    roll: document.querySelector('[data-student-roll]'),
    hostel: document.querySelector('[data-student-hostel]'),
    contact: document.querySelector('[data-student-contact]'),
    totalRebate: document.querySelector('[data-total-rebate]'),
    totalAbsent: document.querySelector('[data-total-absent]'),
    totalMonths: document.querySelector('[data-total-months]'),
    rateValue: document.querySelector('[data-rate-value]'),
    tableBody: document.querySelector('[data-records-body]'),
    generated: document.querySelector('[data-rebate-generated]'),
    months: document.querySelector('[data-rebate-months]'),
    statStudents: document.querySelector('[data-stat-students]'),
    statRate: document.querySelector('[data-stat-rate]'),
    statMonths: document.querySelector('[data-stat-months]'),
    recentList: document.querySelector('[data-recent-list]'),
    recentClear: document.querySelector('[data-recent-clear]'),
    qrInput: document.querySelector('[data-qr-input]'),
    qrPreviewWrapper: document.querySelector('[data-qr-preview-wrapper]'),
    qrPreviewImage: document.querySelector('[data-qr-preview]'),
    qrText: document.querySelector('[data-qr-text]'),
    qrManualWrapper: document.querySelector('[data-qr-manual-wrapper]'),
    qrManualInput: document.querySelector('[data-qr-manual]'),
  };

  const recentStorageKey = 'mess-rebate-recent';
  const qrStorageKey = 'mess-qr-passes';
  let recentLookups = loadRecent();
  let qrVault = loadQrVault();
  let activeRoll = null;

  nodes.rateValue.textContent = rate ? formatter.format(rate) + '/day' : '—';
  nodes.stats.textContent = `${students.size.toLocaleString('en-IN')} students • ${
    data.months.length
  } months • ${formatter.format(rate || 0)}/day rebate`;
  nodes.generated.textContent = data.generatedAt
    ? new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data.generatedAt))
    : '—';
  nodes.months.textContent = data.months.length || '—';
  nodes.statStudents && (nodes.statStudents.textContent = students.size.toLocaleString('en-IN'));
  nodes.statRate && (nodes.statRate.textContent = formatter.format(rate || 0));
  renderMonthBadges();
  renderRecent();

  nodes.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    search(nodes.input.value);
  });

  nodes.input?.addEventListener('input', (event) => {
    const value = event.target.value.toUpperCase();
    event.target.value = value;
    search(value);
  });

  nodes.clearBtn?.addEventListener('click', () => {
    nodes.input.value = '';
    showEmpty('Type a roll number to load the student’s mess rebate summary.');
    nodes.input.focus();
  });

  nodes.recentClear?.addEventListener('click', () => {
    recentLookups = [];
    persistRecent();
    renderRecent();
  });

  nodes.recentList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-roll]');
    if (!button) return;
    const roll = button.dataset.roll;
    if (!roll) return;
    nodes.input.value = roll;
    search(roll);
    nodes.input.focus();
  });

  nodes.qrInput?.addEventListener('change', async (event) => {
    if (!activeRoll) {
      nodes.qrInput.value = '';
      alert('Select a student before uploading a QR pass.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    if (!dataUrl) return;
    showQrPreview(dataUrl);
    const decoded = await decodeQrImage(dataUrl);
    if (decoded) {
      nodes.qrText && (nodes.qrText.textContent = decoded);
      nodes.qrManualWrapper?.classList.add('hidden');
      nodes.qrManualInput && (nodes.qrManualInput.value = '');
      saveQrEntry(activeRoll, dataUrl, decoded);
    } else {
      if (nodes.qrText) {
        nodes.qrText.textContent =
          'Could not decode automatically. Paste the QR text below.';
      }
      nodes.qrManualWrapper?.classList.remove('hidden');
      nodes.qrManualInput && (nodes.qrManualInput.value = '');
      saveQrEntry(activeRoll, dataUrl, '');
    }
  });

  nodes.qrManualInput?.addEventListener('input', () => {
    if (!activeRoll) return;
    if (!qrVault[activeRoll]) qrVault[activeRoll] = {};
    qrVault[activeRoll].text = nodes.qrManualInput.value.trim();
    if (nodes.qrText) {
      nodes.qrText.textContent =
        nodes.qrManualInput.value.trim() || 'Text stored locally.';
    }
    persistQrVault();
  });

  showEmpty('Type a roll number to load the student’s mess rebate summary.');

  function search(roll) {
    const sanitized = roll.trim();
    if (!sanitized) {
      showEmpty('Type a roll number to load the student’s mess rebate summary.');
      return;
    }
    const student = students.get(sanitized);
    if (!student) {
      showEmpty(`No data found for ${sanitized}.`);
      return;
    }
    renderStudent(student);
  }

  function renderStudent(student) {
    nodes.resultCard.classList.remove('hidden');
    nodes.emptyCard.classList.add('hidden');
    activeRoll = student.rollNo;

    nodes.name.textContent = student.name || 'Unknown student';
    nodes.hostel.textContent = student.hostel || '—';
    nodes.roll.textContent = student.rollNo;
    nodes.contact.textContent = student.contact || '—';

    nodes.totalRebate.textContent = formatter.format(
      student.totals.rebateAmount || 0
    );
    nodes.totalAbsent.textContent = student.totals.absentDays ?? 0;
    nodes.totalMonths.textContent = student.totals.monthsCount ?? 0;

    nodes.tableBody.innerHTML = student.records
      .map(
        (record) => `
        <tr>
          <td>${record.monthLabel}</td>
          <td>${record.presentDays}</td>
          <td>${record.absentDays}</td>
          <td>${formatter.format(record.rebateAmount)}</td>
        </tr>`
      )
      .join('');

    rememberLookup(student);
    loadQrEntry(student.rollNo);
  }

  function showEmpty(message) {
    nodes.resultCard.classList.add('hidden');
    nodes.emptyCard.classList.remove('hidden');
    nodes.emptyCard.textContent = message;
    activeRoll = null;
    if (nodes.qrInput) {
      nodes.qrInput.value = '';
      nodes.qrInput.disabled = true;
    }
    if (nodes.qrPreviewWrapper) nodes.qrPreviewWrapper.classList.add('hidden');
    if (nodes.qrManualWrapper) nodes.qrManualWrapper.classList.add('hidden');
    if (nodes.qrText) {
      nodes.qrText.textContent = 'Upload a QR image to decode it.';
    }
  }

  function renderMonthBadges() {
    if (!nodes.statMonths) return;
    const months = data.months || [];
    if (!months.length) {
      nodes.statMonths.innerHTML = '<span class="meta">No months loaded yet.</span>';
      return;
    }
    const latest = months.slice(-6);
    const extra = months.length - latest.length;
    const badges = latest
      .map(
        (month) =>
          `<span class="month-badge">${month.label.replace(' 20', " '")}</span>`
      )
      .join('');
    const extraBadge =
      extra > 0 ? `<span class="month-badge dimmed">+${extra} more</span>` : '';
    nodes.statMonths.innerHTML = badges + extraBadge;
  }

  function loadRecent() {
    try {
      const stored = localStorage.getItem(recentStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistRecent() {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(recentLookups));
    } catch {
      /* ignore */
    }
  }

  function rememberLookup(student) {
    const entry = {
      roll: student.rollNo,
      name: student.name,
      hostel: student.hostel,
    };
    recentLookups = [entry, ...recentLookups.filter((item) => item.roll !== entry.roll)];
    recentLookups = recentLookups.slice(0, 5);
    persistRecent();
    renderRecent();
  }

  function renderRecent() {
    if (!nodes.recentList) return;
    if (!recentLookups.length) {
      nodes.recentList.innerHTML = '<li class="meta">No lookups yet.</li>';
      return;
    }
    nodes.recentList.innerHTML = recentLookups
      .map(
        (entry) => `
        <li class="recent-item">
          <div>
            <strong>${entry.name || 'Unknown'}</strong>
            <span class="meta">${entry.roll}</span>
          </div>
          <button class="btn primary slim" type="button" data-roll="${entry.roll}">
            View
          </button>
        </li>`
      )
      .join('');
  }

  function showQrPreview(dataUrl) {
    if (!nodes.qrPreviewWrapper || !nodes.qrPreviewImage) return;
    nodes.qrPreviewWrapper.classList.remove('hidden');
    nodes.qrPreviewImage.src = dataUrl;
  }

  function loadQrEntry(roll) {
    if (!nodes.qrInput) return;
    nodes.qrInput.disabled = false;
    const entry = qrVault[roll];
    if (!entry) {
      if (nodes.qrPreviewWrapper) nodes.qrPreviewWrapper.classList.add('hidden');
      if (nodes.qrManualWrapper) nodes.qrManualWrapper.classList.add('hidden');
      if (nodes.qrText) {
        nodes.qrText.textContent = 'Upload a QR image to decode it.';
      }
      return;
    }
    if (entry.image) {
      showQrPreview(entry.image);
    }
    if (entry.text) {
      nodes.qrText && (nodes.qrText.textContent = entry.text);
      nodes.qrManualWrapper?.classList.add('hidden');
    } else {
      if (nodes.qrText) {
        nodes.qrText.textContent =
          'No text stored yet. Paste it below if decoding failed.';
      }
      nodes.qrManualWrapper?.classList.remove('hidden');
    }
    if (nodes.qrManualInput) {
      nodes.qrManualInput.value = entry.text || '';
    }
  }

  function saveQrEntry(roll, image, text) {
    qrVault[roll] = { image, text };
    persistQrVault();
  }

  function persistQrVault() {
    try {
      localStorage.setItem(qrStorageKey, JSON.stringify(qrVault));
    } catch {
      /* ignore */
    }
  }

  function loadQrVault() {
    try {
      const stored = localStorage.getItem(qrStorageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  async function readFileAsDataURL(file) {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async function decodeQrImage(dataUrl) {
    if (!('BarcodeDetector' in window)) {
      return null;
    }
    try {
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(canvas);
      if (codes.length && (codes[0].rawValue || codes[0].data)) {
        return codes[0].rawValue || codes[0].data;
      }
    } catch {
      return null;
    }
    return null;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }
})();

