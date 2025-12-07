# Architecture

> System overview and design decisions

## Overview

crypto.wasm is a dual-target Rust library that compiles to both:
1. **Native binary** - CLI tool for terminal usage
2. **WebAssembly** - Browser-compatible encryption

```
┌─────────────────────────────────────────────────────────┐
│                      crypto.wasm                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   CLI App   │    │  WASM Module │    │  JS Wrapper │  │
│  │  (main.rs)  │    │  (lib.rs)    │    │ (crypto.js) │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │          │
│         └────────┬─────────┴─────────┬────────┘          │
│                  ▼                   ▼                   │
│           ┌─────────────┐    ┌───────────────┐          │
│           │  CryptoWasm │    │ EncryptorType │          │
│           └──────┬──────┘    └───────────────┘          │
│                  │                                       │
│         ┌────────┴────────┐                             │
│         │ Encryptor Trait │                             │
│         └────────┬────────┘                             │
│     ┌────────────┴────────────┐                         │
│     ▼                         ▼                         │
│ ┌────────────────┐    ┌────────────────┐               │
│ │ Aes128Encryptor│    │ Base64Encryptor│               │
│ └────────────────┘    └────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Design Decisions

### Strategy Pattern
The [Encryptor trait](./rust-encryptor-trait.md) uses the Strategy pattern, allowing easy addition of new encryption algorithms without modifying core logic.

### Conditional Compilation
`#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]` enables the same code to work in both native and WASM contexts.

### Output Format
AES encryption uses [IV:CIPHERTEXT format](./output-format.md) for self-contained decryption.

## File Structure

```
src/
├── lib.rs      # Module exports
├── crypto.rs   # Core encryption logic
└── main.rs     # CLI application
js/
├── crypto_wasm.js   # JavaScript wrapper
└── crypto_wasm.ts   # TypeScript source
```

## Links

- [Rust Overview](./rust-overview.md) - Detailed Rust implementation
- [JS Wrapper](./js-wrapper.md) - JavaScript wrapper details
