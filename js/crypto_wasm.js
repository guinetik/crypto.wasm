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
            window.CryptoWasm = this.module.CryptoWasm; // Expose the Wasm module to the global scope
            window.EncryptorType  = this.module.EncryptorType; // Expose the Wasm module to the global scope
            console.log("Wasm module initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize Wasm module:", error);
            throw error;
        }
    }
}