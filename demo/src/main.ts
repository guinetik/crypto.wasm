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
  const length = elements.secretKey.value.length;
  elements.keyLength.textContent = `${length}/16`;
  elements.keyLength.className = `key-length ${length === 16 ? 'valid' : 'invalid'}`;
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

// Crypto Functions
const createCryptoInstance = (): CryptoInstance | null => {
  if (!wasmInitialized) {
    showStatus('Crypto module not initialized', 'error');
    return null;
  }

  const type = elements.encryptorType.value;
  const key = elements.secretKey.value;

  if (type === 'aes128' && key.length !== 16) {
    showStatus('Secret key must be exactly 16 characters for AES-128', 'error');
    return null;
  }

  try {
    hideStatus();
    const encType = type === 'aes128'
      ? EncryptorType.Aes128
      : EncryptorType.Base64;
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
    elements.keyGroup.style.display = target.value === 'base64' ? 'none' : 'flex';
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
