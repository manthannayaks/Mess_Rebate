(() => {
  const qrCard = document.querySelector('[data-home-qr-card]');
  if (!qrCard) return;

  const fileInput = qrCard.querySelector('[data-home-qr-input]');
  const clearBtn = qrCard.querySelector('[data-home-qr-clear]');
  const previewWrapper = qrCard.querySelector('[data-home-qr-preview-wrapper]');
  const previewImg = qrCard.querySelector('[data-home-qr-preview]');
  const qrTextNode = qrCard.querySelector('[data-home-qr-text]');
  const manualWrapper = qrCard.querySelector('[data-home-qr-manual-wrapper]');
  const manualInput = qrCard.querySelector('[data-home-qr-manual]');

  const QR_KEY = 'user-qr-pass';
  let qrData = loadQr();

  render();

  fileInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    if (!dataUrl) return;
    showPreview(dataUrl);

    const decoded = await decodeQr(dataUrl);
    if (decoded) {
      updateQr({ image: dataUrl, text: decoded });
      manualWrapper?.classList.add('hidden');
      qrTextNode.textContent = decoded;
      manualInput.value = '';
    } else {
      qrTextNode.textContent =
        'Could not decode automatically. Paste the QR text below.';
      manualWrapper?.classList.remove('hidden');
      updateQr({ image: dataUrl, text: '' });
    }
  });

  manualInput?.addEventListener('input', () => {
    updateQr({ ...qrData, text: manualInput.value.trim() });
    qrTextNode.textContent = manualInput.value.trim() || 'Text stored locally.';
  });

  clearBtn?.addEventListener('click', () => {
    qrData = {};
    saveQr();
    render();
    fileInput.value = '';
  });

  function render() {
    if (qrData.image) {
      showPreview(qrData.image);
      if (qrData.text) {
        qrTextNode.textContent = qrData.text;
        manualWrapper?.classList.add('hidden');
        manualInput.value = '';
      } else {
        qrTextNode.textContent =
          'No decoded text saved. Paste it below if needed.';
        manualWrapper?.classList.remove('hidden');
        manualInput.value = '';
      }
    } else {
      previewWrapper?.classList.add('hidden');
      manualWrapper?.classList.add('hidden');
      qrTextNode.textContent = 'Upload a QR to preview and decode it.';
      manualInput.value = '';
    }
  }

  function showPreview(src) {
    if (!previewWrapper || !previewImg) return;
    previewWrapper.classList.remove('hidden');
    previewImg.src = src;
  }

  function updateQr(next) {
    qrData = { ...qrData, ...next };
    saveQr();
  }

  function saveQr() {
    try {
      localStorage.setItem(QR_KEY, JSON.stringify(qrData));
    } catch {
      /* ignore storage issues */
    }
    window.dispatchEvent(new CustomEvent('qrpass:update'));
  }

  function loadQr() {
    try {
      const stored = localStorage.getItem(QR_KEY);
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

  async function decodeQr(dataUrl) {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const image = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(canvas);
      if (codes.length > 0) {
        return codes[0].rawValue || codes[0].data || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
})();

