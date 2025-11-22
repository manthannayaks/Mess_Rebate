/**
 * ============================================================================
 * HOME PAGE SCRIPT
 * ============================================================================
 * 
 * This script handles the home page QR pass functionality:
 * - Allows users to upload QR code images
 * - Automatically decodes QR codes using BarcodeDetector API
 * - Stores QR data in localStorage for offline access
 * - Displays QR code in profile panel
 * 
 * Features:
 * - Image upload and preview
 * - Automatic QR code decoding
 * - Manual text input fallback
 * - Persistent storage across sessions
 * ============================================================================
 */

(() => {
  // ==========================================================================
  // DOM ELEMENT REFERENCES
  // ==========================================================================
  
  const qrCard = document.querySelector('[data-home-qr-card]');
  if (!qrCard) return; // Exit if QR card not found

  const fileInput = qrCard.querySelector('[data-home-qr-input]'); // File input for image upload
  const clearBtn = qrCard.querySelector('[data-home-qr-clear]'); // Clear/remove button
  const previewWrapper = qrCard.querySelector('[data-home-qr-preview-wrapper]'); // Preview container
  const previewImg = qrCard.querySelector('[data-home-qr-preview]'); // Preview image element
  const qrTextNode = qrCard.querySelector('[data-home-qr-text]'); // Decoded text display
  const manualWrapper = qrCard.querySelector('[data-home-qr-manual-wrapper]'); // Manual input wrapper
  const manualInput = qrCard.querySelector('[data-home-qr-manual]'); // Manual text input

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  const QR_KEY = 'user-qr-pass'; // localStorage key for QR data
  let qrData = loadQr(); // Load saved QR data from localStorage

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  
  render(); // Render initial state

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================
  
  /**
   * Handles QR image file upload
   * Converts image to data URL and attempts automatic QR decoding
   */
  fileInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Convert file to data URL for preview and storage
    const dataUrl = await readFileAsDataURL(file);
    if (!dataUrl) return;
    
    // Show preview immediately
    showPreview(dataUrl);

    // Attempt to decode QR code automatically
    const decoded = await decodeQr(dataUrl);
    if (decoded) {
      // Successfully decoded - save both image and text
      updateQr({ image: dataUrl, text: decoded });
      manualWrapper?.classList.add('hidden');
      qrTextNode.textContent = decoded;
      manualInput.value = '';
    } else {
      // Decoding failed - show manual input option
      qrTextNode.textContent =
        'Could not decode automatically. Paste the QR text below.';
      manualWrapper?.classList.remove('hidden');
      updateQr({ image: dataUrl, text: '' }); // Save image only
    }
  });

  /**
   * Handles manual QR text input (fallback when auto-decode fails)
   */
  manualInput?.addEventListener('input', () => {
    updateQr({ ...qrData, text: manualInput.value.trim() });
    qrTextNode.textContent = manualInput.value.trim() || 'Text stored locally.';
  });

  /**
   * Handles clear/remove QR button click
   */
  clearBtn?.addEventListener('click', () => {
    qrData = {};
    saveQr();
    render();
    fileInput.value = '';
  });

  // ==========================================================================
  // RENDERING FUNCTIONS
  // ==========================================================================
  
  /**
   * Renders the QR card based on current state
   * Shows preview if image exists, handles text display and manual input visibility
   */
  function render() {
    if (qrData.image) {
      // QR image exists - show preview
      showPreview(qrData.image);
      if (qrData.text) {
        // Text also exists - show it and hide manual input
        qrTextNode.textContent = qrData.text;
        manualWrapper?.classList.add('hidden');
        manualInput.value = '';
      } else {
        // No text - show manual input option
        qrTextNode.textContent =
          'No decoded text saved. Paste it below if needed.';
        manualWrapper?.classList.remove('hidden');
        manualInput.value = '';
      }
    } else {
      // No QR uploaded - show empty state
      previewWrapper?.classList.add('hidden');
      manualWrapper?.classList.add('hidden');
      qrTextNode.textContent = 'Upload a QR to preview and decode it.';
      manualInput.value = '';
    }
  }

  /**
   * Shows the QR image preview
   * @param {string} src - Image source (data URL)
   */
  function showPreview(src) {
    if (!previewWrapper || !previewImg) return;
    previewWrapper.classList.remove('hidden');
    previewImg.src = src;
  }

  /**
   * Updates QR data and saves to localStorage
   * @param {Object} next - Partial QR data object to merge
   */
  function updateQr(next) {
    qrData = { ...qrData, ...next };
    saveQr();
  }

  /**
   * Saves QR data to localStorage and dispatches update event
   * The update event notifies other parts of the app (e.g., profile panel)
   */
  function saveQr() {
    try {
      localStorage.setItem(QR_KEY, JSON.stringify(qrData));
    } catch {
      /* ignore storage issues */
    }
    // Notify other components that QR was updated
    window.dispatchEvent(new CustomEvent('qrpass:update'));
  }

  /**
   * Loads QR data from localStorage
   * @returns {Object} QR data object with image and text properties
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
  // UTILITY FUNCTIONS
  // ==========================================================================
  
  /**
   * Converts a File object to a data URL string
   * @param {File} file - File object from input
   * @returns {Promise<string|null>} Data URL string or null on error
   */
  async function readFileAsDataURL(file) {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Attempts to decode QR code from an image using BarcodeDetector API
   * Requires browser support for BarcodeDetector (Chrome/Edge)
   * 
   * @param {string} dataUrl - Image data URL
   * @returns {Promise<string|null>} Decoded QR text or null if failed
   */
  async function decodeQr(dataUrl) {
    // Check if browser supports BarcodeDetector API
    if (!('BarcodeDetector' in window)) return null;
    
    try {
      // Load image and draw to canvas
      const image = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      
      // Create detector and attempt to detect QR code
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(canvas);
      
      // Return first detected code's value
      if (codes.length > 0) {
        return codes[0].rawValue || codes[0].data || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Loads an image from a source URL
   * @param {string} src - Image source URL
   * @returns {Promise<HTMLImageElement>} Image element
   */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
})();

