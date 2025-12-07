/**
 * CryptoWasm JavaScript Wrapper
 *
 * A wrapper for the crypto.wasm WebAssembly module providing
 * AES-128/CBC/PKCS7 encryption, XOR cipher, Caesar cipher, Base64 encoding, and ROT13.
 *
 * @module crypto_wasm
 */

/**
 * @typedef {Object} WasmModule
 * @property {function(): Promise<void>} default - The WASM initialization function
 * @property {typeof CryptoWasm} CryptoWasm - The CryptoWasm class
 * @property {typeof EncryptorType} EncryptorType - The EncryptorType enum
 */

/**
 * Wrapper class for initializing and managing the crypto.wasm WebAssembly module.
 *
 * @example
 * // Initialize the wrapper
 * const wrapper = new CryptoWasmWrapper();
 * await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
 *
 * // Create a crypto instance and use it
 * const crypto = new CryptoWasm('thisisasecretkey', EncryptorType.Aes128);
 * const encrypted = crypto.cypher('my secret message');
 * const decrypted = crypto.decypher(encrypted);
 *
 * @class
 */
class CryptoWasmWrapper {
  /**
   * Creates a new CryptoWasmWrapper instance
   * @constructor
   */
  constructor() {
    /**
     * The loaded WASM module instance
     * @type {WasmModule|null}
     * @private
     */
    this._module = null;

    /**
     * Whether the WASM module has been initialized
     * @type {boolean}
     * @private
     */
    this._isInitialized = false;
  }

  /**
   * Gets whether the WASM module has been initialized
   * @returns {boolean} True if initialized, false otherwise
   */
  get isInitialized() {
    return this._isInitialized;
  }

  /**
   * Gets the loaded module (for advanced usage)
   * @returns {WasmModule} The loaded WASM module
   * @throws {Error} If the module has not been initialized
   */
  get module() {
    if (!this._module) {
      throw new Error("WASM module not initialized. Call init() first.");
    }
    return this._module;
  }

  /**
   * Gets the CryptoWasm class from the loaded module
   * @returns {typeof CryptoWasm} The CryptoWasm class
   * @throws {Error} If the module has not been initialized
   */
  get CryptoWasm() {
    return this.module.CryptoWasm;
  }

  /**
   * Gets the EncryptorType enum from the loaded module
   * @returns {Object} The EncryptorType enum with Aes128 and Base64 values
   * @throws {Error} If the module has not been initialized
   */
  get EncryptorType() {
    return this.module.EncryptorType;
  }

  /**
   * Initializes the WASM module by dynamically importing the JavaScript loader
   *
   * @param {string} jsFilePath - Path to the WASM JavaScript loader file (e.g., 'crypto_wasm.lib.min.js')
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * @throws {Error} If initialization fails
   *
   * @example
   * const wrapper = new CryptoWasmWrapper();
   * await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
   */
  async init(jsFilePath) {
    if (this._isInitialized) {
      console.warn("CryptoWasmWrapper: Module already initialized, skipping.");
      return;
    }

    try {
      // Dynamically import the WASM JavaScript loader
      const wasmModule = await import(jsFilePath);

      // Call the default init function to initialize the WASM module
      await wasmModule.default();

      // Store the loaded module
      this._module = wasmModule;
      this._isInitialized = true;

      // Expose to global scope for browser usage
      if (typeof window !== "undefined") {
        window.CryptoWasm = wasmModule.CryptoWasm;
        window.EncryptorType = wasmModule.EncryptorType;
        window.CryptoWasmWrapper = CryptoWasmWrapper;
      }

      console.log("CryptoWasmWrapper: Module initialized successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        "CryptoWasmWrapper: Failed to initialize module:",
        errorMessage,
      );
      throw new Error(`Failed to initialize WASM module: ${errorMessage}`);
    }
  }

  /**
   * Creates a new CryptoWasm instance with the specified key and encryptor type
   *
   * @param {string} secretKey - The secret key (must be 16 bytes for AES-128, can be empty for Base64)
   * @param {number} encryptorType - The type of encryptor to use (EncryptorType.Aes128 or EncryptorType.Base64)
   * @returns {CryptoWasm} A new CryptoWasm instance
   * @throws {Error} If the module has not been initialized
   *
   * @example
   * const crypto = wrapper.createCrypto('thisisasecretkey', wrapper.EncryptorType.Aes128);
   */
  createCrypto(secretKey, encryptorType) {
    if (!this._isInitialized || !this._module) {
      throw new Error("WASM module not initialized. Call init() first.");
    }
    return new this._module.CryptoWasm(secretKey, encryptorType);
  }

  /**
   * Encrypts a string using AES-128
   * Convenience method that creates a temporary CryptoWasm instance
   *
   * @param {string} plaintext - The string to encrypt
   * @param {string} secretKey - The 16-byte secret key
   * @returns {string} The encrypted string in format "iv:ciphertext" (hex encoded)
   * @throws {Error} If the module has not been initialized or encryption fails
   */
  encryptAes128(plaintext, secretKey) {
    const crypto = this.createCrypto(secretKey, this.EncryptorType.Aes128);
    try {
      return crypto.cypher(plaintext);
    } finally {
      crypto.free();
    }
  }

  /**
   * Decrypts a string using AES-128
   * Convenience method that creates a temporary CryptoWasm instance
   *
   * @param {string} ciphertext - The encrypted string in format "iv:ciphertext" (hex encoded)
   * @param {string} secretKey - The 16-byte secret key
   * @returns {string} The decrypted plaintext string
   * @throws {Error} If the module has not been initialized or decryption fails
   */
  decryptAes128(ciphertext, secretKey) {
    const crypto = this.createCrypto(secretKey, this.EncryptorType.Aes128);
    try {
      return crypto.decypher(ciphertext);
    } finally {
      crypto.free();
    }
  }

  /**
   * Encodes a string to Base64
   * Convenience method that creates a temporary CryptoWasm instance
   *
   * @param {string} plaintext - The string to encode
   * @returns {string} The Base64 encoded string
   * @throws {Error} If the module has not been initialized
   */
  encodeBase64(plaintext) {
    const crypto = this.createCrypto("", this.EncryptorType.Base64);
    try {
      return crypto.cypher(plaintext);
    } finally {
      crypto.free();
    }
  }

  /**
   * Decodes a Base64 string
   * Convenience method that creates a temporary CryptoWasm instance
   *
   * @param {string} encoded - The Base64 encoded string
   * @returns {string} The decoded plaintext string
   * @throws {Error} If the module has not been initialized or decoding fails
   */
  decodeBase64(encoded) {
    const crypto = this.createCrypto("", this.EncryptorType.Base64);
    try {
      return crypto.decypher(encoded);
    } finally {
      crypto.free();
    }
  }
}

// Expose to global scope for browser usage (when loaded as script tag)
if (typeof window !== "undefined") {
  window.CryptoWasmWrapper = CryptoWasmWrapper;
}

// ES module exports
export { CryptoWasmWrapper };
export default CryptoWasmWrapper;
