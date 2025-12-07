# Browser Usage

> Using crypto.wasm directly in the browser

## Script Tag Setup

```html
<!DOCTYPE html>
<html>
<head>
    <script src="js/crypto_wasm.js"></script>
</head>
<body>
    <script type="module">
        const wrapper = new CryptoWasmWrapper();
        await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');

        // Now use encryption
        const encrypted = wrapper.encryptAes128('Hello', 'thisisasecretkey');
        console.log(encrypted);
    </script>
</body>
</html>
```

## File Structure

```
your-project/
├── index.html
├── js/
│   └── crypto_wasm.js       # Wrapper script
└── dist/
    └── crypto_wasm/
        ├── crypto_wasm.lib.min.js
        └── crypto_wasm_bg.wasm
```

## Using Global Variables

After initialization, globals are available:

```javascript
// These work after init()
const crypto = new CryptoWasm('thisisasecretkey', EncryptorType.Aes128);
const encrypted = crypto.cypher('Hello');
crypto.free();
```

## Error Handling

```javascript
try {
    await wrapper.init('./dist/crypto_wasm/crypto_wasm.lib.min.js');
} catch (error) {
    console.error('Failed to load WASM:', error.message);
}

try {
    const decrypted = wrapper.decryptAes128(ciphertext, key);
} catch (error) {
    console.error('Decryption failed:', error.message);
}
```

## CORS Considerations

WASM files require proper MIME type (`application/wasm`). When developing locally:

```bash
# Use a local server, not file://
npx serve .
# or
python -m http.server 8000
```

## Links

- [npm Usage](./js-usage-npm.md) - Using via npm
- [API Reference](./js-api.md) - Full API docs
