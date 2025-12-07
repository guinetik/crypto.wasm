// Direct WASM module imports
// @ts-ignore - dynamic WASM module
import init, { CryptoWasm, EncryptorType } from '@guinetik/crypto-wasm/wasm';

// CryptoWasm instance interface
interface CryptoInstance {
  cypher(input: string): string;
  decypher(input: string): string;
  free(): void;
}

// DOM Elements interface
interface Elements {
  loadingOverlay: HTMLDivElement;
  statusMessage: HTMLDivElement;
  statusIcon: HTMLSpanElement;
  statusText: HTMLSpanElement;
  encryptorType: HTMLSelectElement;
  secretKey: HTMLInputElement;
  keyLength: HTMLSpanElement;
  keyToggle: HTMLButtonElement;
  keyGroup: HTMLDivElement;
  inputToken: HTMLTextAreaElement;
  outputToken: HTMLTextAreaElement;
  encryptButton: HTMLButtonElement;
  decryptButton: HTMLButtonElement;
  swapButton: HTMLButtonElement;
  clearInput: HTMLButtonElement;
  clearOutput: HTMLButtonElement;
  pasteInput: HTMLButtonElement;
  copyOutput: HTMLButtonElement;
}

// Get DOM elements
const elements: Elements = {
  loadingOverlay: document.getElementById('loadingOverlay') as HTMLDivElement,
  statusMessage: document.getElementById('statusMessage') as HTMLDivElement,
  statusIcon: document.getElementById('statusIcon') as HTMLSpanElement,
  statusText: document.getElementById('statusText') as HTMLSpanElement,
  encryptorType: document.getElementById('encryptorType') as HTMLSelectElement,
  secretKey: document.getElementById('secretKey') as HTMLInputElement,
  keyLength: document.getElementById('keyLength') as HTMLSpanElement,
  keyToggle: document.getElementById('keyToggle') as HTMLButtonElement,
  keyGroup: document.getElementById('keyGroup') as HTMLDivElement,
  inputToken: document.getElementById('inputToken') as HTMLTextAreaElement,
  outputToken: document.getElementById('outputToken') as HTMLTextAreaElement,
  encryptButton: document.getElementById('encryptButton') as HTMLButtonElement,
  decryptButton: document.getElementById('decryptButton') as HTMLButtonElement,
  swapButton: document.getElementById('swapButton') as HTMLButtonElement,
  clearInput: document.getElementById('clearInput') as HTMLButtonElement,
  clearOutput: document.getElementById('clearOutput') as HTMLButtonElement,
  pasteInput: document.getElementById('pasteInput') as HTMLButtonElement,
  copyOutput: document.getElementById('copyOutput') as HTMLButtonElement,
};

// State
let wasmInitialized = false;

// Utility Functions
const showStatus = (message: string, type: 'error' | 'success' = 'error'): void => {
  elements.statusMessage.className = `status-message ${type}`;
  elements.statusIcon.textContent = type === 'error' ? '⚠️' : '✅';
  elements.statusText.textContent = message;
};

const hideStatus = (): void => {
  elements.statusMessage.className = 'status-message';
};

const updateKeyLengthIndicator = (): void => {
  const type = elements.encryptorType.value;
  const value = elements.secretKey.value;
  const length = value.length;

  if (type === 'aes128') {
    elements.keyLength.textContent = `${length}/16`;
    elements.keyLength.className = `key-length ${length === 16 ? 'valid' : 'invalid'}`;
  } else if (type === 'xor') {
    elements.keyLength.textContent = `${length} chars`;
    elements.keyLength.className = `key-length ${length > 0 ? 'valid' : 'invalid'}`;
  } else if (type === 'caesar') {
    const shift = parseInt(value, 10);
    const isValid = !isNaN(shift) && shift >= 1 && shift <= 25;
    elements.keyLength.textContent = isValid ? `shift ${shift}` : 'invalid';
    elements.keyLength.className = `key-length ${isValid ? 'valid' : 'invalid'}`;
  } else {
    elements.keyLength.textContent = '';
    elements.keyLength.className = 'key-length';
  }
};

const flashButton = (button: HTMLButtonElement, className: string): void => {
  button.classList.add(className);
  setTimeout(() => button.classList.remove(className), 1000);
};

const copyToClipboard = async (text: string, button: HTMLButtonElement): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    flashButton(button, 'copied');
  } catch {
    showStatus('Failed to copy to clipboard', 'error');
  }
};

// Validation for ROT13 - only ASCII printable characters
const isValidRot13Input = (text: string): boolean => {
  // Allow ASCII printable characters (32-126) which includes:
  // letters, numbers, punctuation, and space
  return /^[\x20-\x7E]*$/.test(text);
};

// Crypto Functions
const createCryptoInstance = (): CryptoInstance | null => {
  if (!wasmInitialized) {
    showStatus('Crypto module not initialized', 'error');
    return null;
  }

  const type = elements.encryptorType.value;
  const key = elements.secretKey.value;

  // Validate key based on algorithm
  if (type === 'aes128' && key.length !== 16) {
    showStatus('Secret key must be exactly 16 characters for AES-128', 'error');
    return null;
  }
  if (type === 'xor' && key.length === 0) {
    showStatus('XOR cipher requires a non-empty key', 'error');
    return null;
  }
  if (type === 'caesar') {
    const shift = parseInt(key, 10);
    if (isNaN(shift) || shift < 1 || shift > 25) {
      showStatus('Caesar cipher requires a shift between 1 and 25', 'error');
      return null;
    }
  }

  try {
    hideStatus();
    let encType;
    if (type === 'aes128') {
      encType = EncryptorType.Aes128;
    } else if (type === 'rot13') {
      encType = EncryptorType.Rot13;
    } else if (type === 'xor') {
      encType = EncryptorType.Xor;
    } else if (type === 'caesar') {
      encType = EncryptorType.Caesar;
    } else {
      encType = EncryptorType.Base64;
    }
    return new CryptoWasm(key, encType);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    showStatus(`Failed to create crypto instance: ${msg}`, 'error');
    return null;
  }
};

const encrypt = (): void => {
  const input = elements.inputToken.value.trim();
  if (!input) {
    showStatus('Please enter text to encrypt', 'error');
    return;
  }

  // Validate ROT13 input
  if (elements.encryptorType.value === 'rot13' && !isValidRot13Input(input)) {
    showStatus('ROT13 only supports ASCII characters (letters, numbers, punctuation)', 'error');
    return;
  }

  const crypto = createCryptoInstance();
  if (!crypto) return;

  try {
    const encrypted = crypto.cypher(input);
    elements.outputToken.value = encrypted;
    hideStatus();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    showStatus(`Encryption failed: ${msg}`, 'error');
  } finally {
    crypto.free();
  }
};

const decrypt = (): void => {
  const input = elements.inputToken.value.trim();
  if (!input) {
    showStatus('Please enter text to decrypt', 'error');
    return;
  }

  // Validate ROT13 input
  if (elements.encryptorType.value === 'rot13' && !isValidRot13Input(input)) {
    showStatus('ROT13 only supports ASCII characters (letters, numbers, punctuation)', 'error');
    return;
  }

  const crypto = createCryptoInstance();
  if (!crypto) return;

  try {
    const decrypted = crypto.decypher(input);
    elements.outputToken.value = decrypted;
    hideStatus();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    showStatus(`Decryption failed: ${msg}`, 'error');
  } finally {
    crypto.free();
  }
};

const swap = (): void => {
  const output = elements.outputToken.value;
  elements.inputToken.value = output;
  elements.outputToken.value = '';
};

// Event Listeners
const setupEventListeners = (): void => {
  // Encryptor type change
  elements.encryptorType.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const keyLabel = elements.keyGroup.querySelector('.form-label') as HTMLLabelElement;

    // Hide key for Base64 and ROT13
    if (target.value === 'base64' || target.value === 'rot13') {
      elements.keyGroup.style.display = 'none';
    } else {
      elements.keyGroup.style.display = 'flex';

      // Update label based on algorithm
      if (target.value === 'aes128') {
        keyLabel.textContent = 'Secret Key (16 characters)';
        elements.secretKey.placeholder = 'Enter 16-character key';
        elements.secretKey.value = 'thisisasecretkey';
      } else if (target.value === 'xor') {
        keyLabel.textContent = 'XOR Key (any length)';
        elements.secretKey.placeholder = 'Enter any key';
        elements.secretKey.value = 'secret';
      } else if (target.value === 'caesar') {
        keyLabel.textContent = 'Shift (1-25)';
        elements.secretKey.placeholder = 'Enter shift number';
        elements.secretKey.value = '3';
      }
      updateKeyLengthIndicator();
    }
  });

  // Key input
  elements.secretKey.addEventListener('input', updateKeyLengthIndicator);

  // Key visibility toggle
  elements.keyToggle.addEventListener('click', () => {
    const isPassword = elements.secretKey.type === 'password';
    elements.secretKey.type = isPassword ? 'text' : 'password';
    elements.keyToggle.textContent = isPassword ? '🙈' : '👁️';
  });

  // Action buttons
  elements.encryptButton.addEventListener('click', encrypt);
  elements.decryptButton.addEventListener('click', decrypt);
  elements.swapButton.addEventListener('click', swap);

  // Clear buttons
  elements.clearInput.addEventListener('click', () => {
    elements.inputToken.value = '';
  });
  elements.clearOutput.addEventListener('click', () => {
    elements.outputToken.value = '';
  });

  // Paste button
  elements.pasteInput.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.inputToken.value = text;
    } catch {
      showStatus('Failed to paste from clipboard', 'error');
    }
  });

  // Copy button
  elements.copyOutput.addEventListener('click', () => {
    const text = elements.outputToken.value;
    if (text) {
      copyToClipboard(text, elements.copyOutput);
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          decrypt();
        } else {
          encrypt();
        }
      }
    }
  });
};

// Initialize
const initApp = async (): Promise<void> => {
  try {
    // Initialize the WASM module directly
    await init();
    wasmInitialized = true;

    // Setup UI
    setupEventListeners();
    updateKeyLengthIndicator();

    // Hide loading overlay
    elements.loadingOverlay.classList.add('hidden');

    console.log('crypto.wasm demo initialized successfully!');
  } catch (error) {
    elements.loadingOverlay.classList.add('hidden');
    const msg = error instanceof Error ? error.message : String(error);
    showStatus(`Failed to initialize: ${msg}`, 'error');
    console.error('Initialization error:', error);
  }
};

// Start
initApp();
