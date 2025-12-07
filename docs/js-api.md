# API Reference

> Complete JavaScript/TypeScript API documentation

## CryptoWasmWrapper

### `constructor()`
Creates a new wrapper instance.

```javascript
const wrapper = new CryptoWasmWrapper();
```

---

### `init(jsFilePath)`
Initializes the WASM module.

```javascript
await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
```

| Parameter | Type | Description |
|-----------|------|-------------|
| jsFilePath | string | Path to the WASM JS loader |

**Throws**: Error if initialization fails.

---

### `createCrypto(secretKey, encryptorType)`
Creates a low-level CryptoWasm instance.

```javascript
const crypto = wrapper.createCrypto('thisisasecretkey', wrapper.EncryptorType.Aes128);
const encrypted = crypto.cypher('Hello');
crypto.free();  // Important: release memory
```

| Parameter | Type | Description |
|-----------|------|-------------|
| secretKey | string | 16-char key for AES, empty for Base64 |
| encryptorType | number | `EncryptorType.Aes128` or `EncryptorType.Base64` |

---

### `encryptAes128(plaintext, secretKey)`
Convenience method for AES-128 encryption.

```javascript
const encrypted = wrapper.encryptAes128('Hello World', 'thisisasecretkey');
// Returns: "a1b2c3...:d4e5f6..."
```

---

### `decryptAes128(ciphertext, secretKey)`
Convenience method for AES-128 decryption.

```javascript
const decrypted = wrapper.decryptAes128('a1b2c3...:d4e5f6...', 'thisisasecretkey');
// Returns: "Hello World"
```

**Throws**: Error if decryption fails (wrong key, invalid format).

---

### `encodeBase64(plaintext)`
Encode string to Base64.

```javascript
const encoded = wrapper.encodeBase64('Hello World');
// Returns: "SGVsbG8gV29ybGQ="
```

---

### `decodeBase64(encoded)`
Decode Base64 string.

```javascript
const decoded = wrapper.decodeBase64('SGVsbG8gV29ybGQ=');
// Returns: "Hello World"
```

---

## CryptoWasm (Low-level)

### `cypher(input)`
Encrypt a string.

```javascript
const crypto = new CryptoWasm('thisisasecretkey', EncryptorType.Aes128);
const encrypted = crypto.cypher('Hello');
```

### `decypher(encryptedInput)`
Decrypt a string.

```javascript
const decrypted = crypto.decypher('a1b2c3...:d4e5f6...');
```

### `free()`
Release WASM memory. **Always call when done!**

```javascript
crypto.free();
```

## Links

- [Output Format](./output-format.md) - Understanding encrypted output
- [JS Wrapper](./js-wrapper.md) - Wrapper class overview
