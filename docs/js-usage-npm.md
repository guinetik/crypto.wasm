# npm Package Usage

> Using @guinetik/crypto-wasm via npm

## Installation

```bash
npm install @guinetik/crypto-wasm
```

## ES Module Import

```javascript
import init, { CryptoWasm, EncryptorType } from '@guinetik/crypto-wasm/wasm';

// Initialize WASM
await init();

// Use directly
const crypto = new CryptoWasm('thisisasecretkey', EncryptorType.Aes128);
const encrypted = crypto.cypher('Hello World');
const decrypted = crypto.decypher(encrypted);
crypto.free();
```

## Using the Wrapper

```javascript
import { CryptoWasmWrapper } from '@guinetik/crypto-wasm';

const wrapper = new CryptoWasmWrapper();
await wrapper.init('/node_modules/@guinetik/crypto-wasm/dist/crypto_wasm/crypto_wasm.lib.min.js');

// Convenience methods
const encrypted = wrapper.encryptAes128('Hello', 'thisisasecretkey');
const decrypted = wrapper.decryptAes128(encrypted, 'thisisasecretkey');
```

## Vite Setup

```javascript
// vite.config.js
export default {
    optimizeDeps: {
        exclude: ['@guinetik/crypto-wasm']
    },
    assetsInclude: ['**/*.wasm']
}
```

```javascript
// main.js
import init, { CryptoWasm, EncryptorType } from '@guinetik/crypto-wasm/wasm';

await init();
// Ready to use
```

## TypeScript

Types are included:

```typescript
import {
    CryptoWasmWrapper,
    ICryptoWasm,
    IEncryptorType,
    EncryptorTypeValue
} from '@guinetik/crypto-wasm';
```

## Package Exports

```javascript
// Main wrapper
import { CryptoWasmWrapper } from '@guinetik/crypto-wasm';

// Direct WASM module
import init, { CryptoWasm, EncryptorType } from '@guinetik/crypto-wasm/wasm';
```

## Links

- [Browser Usage](./js-usage-browser.md) - Direct browser usage
- [API Reference](./js-api.md) - Full API docs
- [npm Package](https://www.npmjs.com/package/@guinetik/crypto-wasm)
