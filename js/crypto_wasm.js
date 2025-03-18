class CryptoWasmWrapper {
    constructor() {
        this.module = null;
        this.isInitialized = false;
    }

    async init(jsFilePath) {
        if (this.isInitialized) return;

        try {
            const wasmModule = await import(jsFilePath); // Dynamically import the Wasm JS file
            await wasmModule.default(); // Call init function (usually named `default`) in the Wasm module
            this.module = wasmModule;   // Store the loaded module for later access
            this.isInitialized = true;
            console.log("Wasm module initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize Wasm module:", error);
            throw error;
        }
    }

    // Dynamically call a method on the module
    execute(method, token) {
        if (!this.isInitialized) {
            throw new Error("Wasm module is not initialized.");
        }

        // Dynamically call the specified method on the Wasm module
        if (typeof this.module[method] === 'function') {
            return this.module[method](token);
        } else {
            throw new Error(`Invalid method: ${method} does not exist on the Wasm module.`);
        }
    }
}

/* 
// Usage example:
(async () => {
    const crimWasm = new CryptoWasmWrapper("/path/to/js/file.js");

    // Wait for initialization
    await crimWasm.init("/path/to/js/file.js");

    // Encrypt a token
    const token = "my_token";
    const signedToken = crimWasm.execute("transform_token", token);
    console.log("Encrypted Token:", signedToken);

    // Decrypt a token
    const decryptedToken = crimWasm.execute("decrypt_token", signedToken);
    console.log("Decrypted Token:", decryptedToken);
})();
 */