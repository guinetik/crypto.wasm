# crypto.wasm Documentation

> Zettelkasten-style documentation for crypto.wasm - AES-128/CBC/PKCS7 encryption powered by Rust & WebAssembly

## Quick Links

| Topic | Description |
|-------|-------------|
| [Architecture](./architecture.md) | System overview and design decisions |
| [Output Format](./output-format.md) | Understanding the encrypted output format |

## Rust Implementation

| Topic | Description |
|-------|-------------|
| [Rust Overview](./rust-overview.md) | Rust codebase structure |
| [Encryptor Trait](./rust-encryptor-trait.md) | The `Encryptor` trait abstraction |
| [AES-128](./rust-aes128.md) | AES-128-CBC implementation details |
| [XOR Cipher](./rust-xor.md) | XOR bitwise cipher |
| [Caesar Cipher](./rust-caesar.md) | Classic shift cipher |
| [Base64](./rust-base64.md) | Base64 encoding implementation |
| [ROT13](./rust-rot13.md) | ROT13 letter substitution cipher |
| [WASM Bindings](./rust-wasm-bindings.md) | wasm-bindgen integration |
| [CLI Usage](./rust-cli.md) | Command-line interface usage |

## JavaScript Implementation

| Topic | Description |
|-------|-------------|
| [JS Wrapper](./js-wrapper.md) | CryptoWasmWrapper class |
| [API Reference](./js-api.md) | Full API reference |
| [Browser Usage](./js-usage-browser.md) | Browser usage examples |
| [npm Usage](./js-usage-npm.md) | npm package usage |

## See Also

- [GitHub Repository](https://github.com/guinetik/crypto.wasm)
- [npm Package](https://www.npmjs.com/package/@guinetik/crypto-wasm)
- [Live Demo](https://cryptowasm.guinetik.com)
