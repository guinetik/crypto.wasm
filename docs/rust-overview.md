# Rust Overview

> Rust codebase structure and module organization

## Module Structure

```rust
// lib.rs - Module declaration
pub mod crypto;
```

The library exposes a single module `crypto` which contains all encryption logic.

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `CryptoWasm` | crypto.rs | Main public API struct |
| `EncryptorType` | crypto.rs | Enum for algorithm selection |
| `Encryptor` | crypto.rs | Internal trait for encryption strategies |

## Dependencies

```toml
wasm-bindgen = "0.2"     # WASM bindings
base64 = "0.13"          # Base64 encoding
aes = "0.7"              # AES encryption
block-modes = "0.8"      # CBC mode
hex = "0.4"              # Hex encoding for output
rand = "0.8"             # Random IV generation
```

## Conditional Compilation

The codebase uses conditional attributes to support both native and WASM targets:

```rust
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct CryptoWasm { ... }
```

This means:
- When compiling for WASM: applies `wasm_bindgen` attribute
- When compiling for native: no attribute applied

## Links

- [Encryptor Trait](./rust-encryptor-trait.md) - The Encryptor abstraction
- [AES-128](./rust-aes128.md) - AES-128 implementation
- [Base64](./rust-base64.md) - Base64 implementation
- [WASM Bindings](./rust-wasm-bindings.md) - WASM integration details
