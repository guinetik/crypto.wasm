/**
 * CryptoWasm TypeScript Wrapper
 *
 * A typed wrapper for the crypto.wasm WebAssembly module providing
 * AES-128/CBC/PKCS7 encryption and Base64 encoding functionality.
 *
 * @module crypto_wasm
 */

/**
 * Encryptor type enum values
 */
export const EncryptorTypeValues = {
  Aes128: 0,
  Base64: 1,
} as const;

export type EncryptorTypeValue =
  (typeof EncryptorTypeValues)[keyof typeof EncryptorTypeValues];

/**
 * Interface for the CryptoWasm class from WASM
 */
export interface ICryptoWasm {
  cypher(input: string): string;
  decypher(encrypted_input: string): string;
  free(): void;
}

/**
 * Interface for the CryptoWasm constructor
 */
export interface ICryptoWasmConstructor {
  new (secret_key: string, encryptor_type: EncryptorTypeValue): ICryptoWasm;
}

/**
 * Interface for the EncryptorType enum from WASM
 */
export interface IEncryptorType {
  Aes128: EncryptorTypeValue;
  Base64: EncryptorTypeValue;
}

/**
 * Output returned by the init function
 */
export interface InitOutput {
  readonly memory: WebAssembly.Memory;
}

/**
 * Interface for the dynamically imported WASM module
 */
interface WasmModule {
  default: (
    input?: string | URL | Request | BufferSource | WebAssembly.Module,
  ) => Promise<InitOutput>;
  CryptoWasm: ICryptoWasmConstructor;
  EncryptorType: IEncryptorType;
}

// Extend Window interface for global declarations
declare global {
  interface Window {
    CryptoWasm?: ICryptoWasmConstructor;
    EncryptorType?: IEncryptorType;
    CryptoWasmWrapper?: typeof CryptoWasmWrapper;
  }
}

/**
 * Wrapper class for initializing and managing the crypto.wasm WebAssembly module.
 *
 * @example
 * ```typescript
 * const wrapper = new CryptoWasmWrapper();
 * await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
 *
 * const crypto = wrapper.createCrypto('thisisasecretkey', wrapper.EncryptorType.Aes128);
 * const encrypted = crypto.cypher('my secret message');
 * const decrypted = crypto.decypher(encrypted);
 * ```
 */
export class CryptoWasmWrapper {
  /** The loaded WASM module instance */
  private _module: WasmModule | null = null;

  /** Whether the WASM module has been initialized */
  private _isInitialized: boolean = false;

  /**
   * Creates a new CryptoWasmWrapper instance
   */
  constructor() {
    this._module = null;
    this._isInitialized = false;
  }

  /**
   * Gets whether the WASM module has been initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Gets the loaded module (for advanced usage)
   * @throws Error if the module has not been initialized
   */
  get module(): WasmModule {
    if (!this._module) {
      throw new Error("WASM module not initialized. Call init() first.");
    }
    return this._module;
  }

  /**
   * Gets the CryptoWasm class from the loaded module
   * @throws Error if the module has not been initialized
   */
  get CryptoWasm(): ICryptoWasmConstructor {
    return this.module.CryptoWasm;
  }

  /**
   * Gets the EncryptorType enum from the loaded module
   * @throws Error if the module has not been initialized
   */
  get EncryptorType(): IEncryptorType {
    return this.module.EncryptorType;
  }

  /**
   * Initializes the WASM module by dynamically importing the JavaScript loader
   *
   * @param jsFilePath - Path to the WASM JavaScript loader file (e.g., 'crypto_wasm.lib.min.js')
   * @returns Promise that resolves when initialization is complete
   * @throws Error if initialization fails or if already initialized
   *
   * @example
   * ```typescript
   * const wrapper = new CryptoWasmWrapper();
   * await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
   * ```
   */
  async init(jsFilePath: string): Promise<void> {
    if (this._isInitialized) {
      console.warn("CryptoWasmWrapper: Module already initialized, skipping.");
      return;
    }

    try {
      // Dynamically import the WASM JavaScript loader
      const wasmModule = (await import(
        /* webpackIgnore: true */ /* @vite-ignore */ jsFilePath
      )) as WasmModule;

      // Call the default init function to initialize the WASM module
      await wasmModule.default();

      // Store the loaded module
      this._module = wasmModule;
      this._isInitialized = true;

      // Optionally expose to global scope for legacy browser usage
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
   * @param secretKey - The secret key (must be 16 bytes for AES-128, can be empty for Base64)
   * @param encryptorType - The type of encryptor to use
   * @returns A new CryptoWasm instance
   * @throws Error if the module has not been initialized
   *
   * @example
   * ```typescript
   * const crypto = wrapper.createCrypto('thisisasecretkey', wrapper.EncryptorType.Aes128);
   * ```
   */
  createCrypto(
    secretKey: string,
    encryptorType: EncryptorTypeValue,
  ): ICryptoWasm {
    if (!this._isInitialized || !this._module) {
      throw new Error("WASM module not initialized. Call init() first.");
    }
    return new this._module.CryptoWasm(secretKey, encryptorType);
  }

  /**
   * Encrypts a string using AES-128
   * Convenience method that creates a temporary CryptoWasm instance
   *
   * @param plaintext - The string to encrypt
   * @param secretKey - The 16-byte secret key
   * @returns The encrypted string in format "iv:ciphertext" (hex encoded)
   * @throws Error if the module has not been initialized or encryption fails
   */
  encryptAes128(plaintext: string, secretKey: string): string {
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
   * @param ciphertext - The encrypted string in format "iv:ciphertext" (hex encoded)
   * @param secretKey - The 16-byte secret key
   * @returns The decrypted plaintext string
   * @throws Error if the module has not been initialized or decryption fails
   */
  decryptAes128(ciphertext: string, secretKey: string): string {
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
   * @param plaintext - The string to encode
   * @returns The Base64 encoded string
   * @throws Error if the module has not been initialized
   */
  encodeBase64(plaintext: string): string {
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
   * @param encoded - The Base64 encoded string
   * @returns The decoded plaintext string
   * @throws Error if the module has not been initialized or decoding fails
   */
  decodeBase64(encoded: string): string {
    const crypto = this.createCrypto("", this.EncryptorType.Base64);
    try {
      return crypto.decypher(encoded);
    } finally {
      crypto.free();
    }
  }
}

// Default export for easier importing
export default CryptoWasmWrapper;
