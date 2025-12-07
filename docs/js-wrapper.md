# CryptoWasmWrapper

> JavaScript wrapper class for the WASM module

## Overview

`CryptoWasmWrapper` provides a high-level interface for loading and using the crypto.wasm module in JavaScript/TypeScript applications.

## Class Definition

```javascript
class CryptoWasmWrapper {
    constructor()
    async init(jsFilePath: string): Promise<void>
    get isInitialized(): boolean
    get CryptoWasm(): CryptoWasmConstructor
    get EncryptorType(): EncryptorType
    createCrypto(secretKey: string, encryptorType: number): CryptoWasm
    encryptAes128(plaintext: string, secretKey: string): string
    decryptAes128(ciphertext: string, secretKey: string): string
    encodeBase64(plaintext: string): string
    decodeBase64(encoded: string): string
}
```

## Lifecycle

```javascript
// 1. Create wrapper instance
const wrapper = new CryptoWasmWrapper();

// 2. Initialize WASM module
await wrapper.init('./path/to/crypto_wasm.lib.min.js');

// 3. Use encryption methods
const encrypted = wrapper.encryptAes128('Hello', 'thisisasecretkey');
```

## Properties

### `isInitialized`
```javascript
wrapper.isInitialized  // boolean
```
Check if WASM module is loaded.

### `CryptoWasm`
```javascript
const crypto = new wrapper.CryptoWasm(key, type);
```
Access to the raw WASM class (advanced usage).

### `EncryptorType`
```javascript
wrapper.EncryptorType.Aes128  // 0
wrapper.EncryptorType.Base64  // 1
```

## Global Exposure

After initialization, these are available globally:
```javascript
window.CryptoWasm
window.EncryptorType
window.CryptoWasmWrapper
```

## Links

- [API Reference](./js-api.md) - Complete method documentation
- [Browser Usage](./js-usage-browser.md) - Browser examples
- [npm Usage](./js-usage-npm.md) - npm package examples
