/**
 * TypeScript declarations for crypto.wasm
 * A WebAssembly library for AES-128/CBC/PKCS7 encryption, XOR, Caesar, Base64, and ROT13
 */

/**
 * Encryptor type enum - determines which encryption algorithm to use
 */
export enum EncryptorType {
    /** AES-128 CBC encryption with PKCS7 padding */
    Aes128 = 0,
    /** Base64 encoding (not actual encryption) */
    Base64 = 1,
    /** ROT13 letter substitution */
    Rot13 = 2,
    /** XOR cipher (any length key) */
    Xor = 3,
    /** Caesar cipher (shift 1-25) */
    Caesar = 4,
}

/**
 * Main crypto class exported from the WASM module
 * Provides encryption and decryption functionality
 */
export class CryptoWasm {
    /**
     * Creates a new CryptoWasm instance
     * @param secret_key - The secret key for encryption (must be exactly 16 bytes for AES-128, can be empty for Base64)
     * @param encryptor_type - The type of encryptor to use
     * @throws Error if key length is invalid for the selected encryptor type
     */
    constructor(secret_key: string, encryptor_type: EncryptorType);

    /**
     * Encrypts/encodes the input string
     * @param input - The plaintext string to encrypt
     * @returns For AES-128: "iv:encrypted_data" in hex format. For Base64: the encoded string
     */
    cypher(input: string): string;

    /**
     * Decrypts/decodes the input string
     * @param encrypted_input - The encrypted string to decrypt (format depends on encryptor type)
     * @returns The decrypted plaintext string
     * @throws Error if decryption fails due to invalid format, key, or corrupted data
     */
    decypher(encrypted_input: string): string;

    /**
     * Frees the memory allocated by this instance
     * Call this when you're done using the instance to prevent memory leaks
     */
    free(): void;
}

/**
 * WASM module initialization function
 * Must be called before using any other exports
 * @param module_or_path - Optional: WASM module, URL, or Request object
 * @returns Promise that resolves when initialization is complete
 */
export default function init(module_or_path?: InitInput): Promise<InitOutput>;

/**
 * Synchronous initialization for environments that support it
 * @param module - The WASM module to initialize
 * @returns The initialization output
 */
export function initSync(module: BufferSource): InitOutput;

/**
 * Input types accepted by the init function
 */
export type InitInput =
    | RequestInfo
    | URL
    | Response
    | BufferSource
    | WebAssembly.Module;

/**
 * Output returned by the init function
 */
export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_cryptowasm_free: (a: number) => void;
    readonly cryptowasm_new: (a: number, b: number, c: number) => number;
    readonly cryptowasm_cypher: (a: number, b: number, c: number, d: number) => void;
    readonly cryptowasm_decypher: (a: number, b: number, c: number, d: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

/**
 * Wrapper class for initializing and managing the WASM module
 */
export class CryptoWasmWrapper {
    /** The loaded WASM module instance */
    module: typeof import('./crypto_wasm') | null;

    /** Whether the WASM module has been initialized */
    isInitialized: boolean;

    constructor();

    /**
     * Initializes the WASM module
     * @param jsFilePath - Path to the WASM JavaScript loader file
     * @returns Promise that resolves when initialization is complete
     * @throws Error if initialization fails
     */
    init(jsFilePath: string): Promise<void>;
}

// Global declarations for browser environment when using the minified bundle
declare global {
    interface Window {
        CryptoWasm: typeof CryptoWasm;
        EncryptorType: typeof EncryptorType;
        CryptoWasmWrapper: typeof CryptoWasmWrapper;
    }
}
