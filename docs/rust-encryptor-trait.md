# Encryptor Trait

> The core abstraction enabling multiple encryption strategies

## Definition

```rust
trait Encryptor {
    fn encrypt(&self, data: &[u8], iv: &[u8]) -> Vec<u8>;
    fn decrypt(&self, encrypted_data: &[u8], iv: &[u8]) -> Vec<u8>;
    fn encryptor_type(&self) -> EncryptorType;
}
```

## Purpose

The `Encryptor` trait implements the **Strategy Pattern**, allowing:
- Swappable encryption algorithms at runtime
- Easy addition of new algorithms
- Consistent API across all implementations

## Methods

### `encrypt`
```rust
fn encrypt(&self, data: &[u8], iv: &[u8]) -> Vec<u8>
```
- **data**: Raw bytes to encrypt
- **iv**: Initialization vector (used by AES, ignored by Base64)
- **returns**: Encrypted bytes

### `decrypt`
```rust
fn decrypt(&self, encrypted_data: &[u8], iv: &[u8]) -> Vec<u8>
```
- **encrypted_data**: Bytes to decrypt
- **iv**: Same IV used during encryption
- **returns**: Decrypted bytes (empty on failure)

### `encryptor_type`
```rust
fn encryptor_type(&self) -> EncryptorType
```
Returns the enum variant for type checking in `CryptoWasm`.

## Implementations

| Struct | Algorithm | Notes |
|--------|-----------|-------|
| [Aes128Encryptor](./rust-aes128.md) | AES-128-CBC-PKCS7 | Requires 16-byte key |
| [XorEncryptor](./rust-xor.md) | XOR Cipher | Any length key, symmetric |
| [CaesarEncryptor](./rust-caesar.md) | Caesar Cipher | Shift 1-25 |
| [Base64Encryptor](./rust-base64.md) | Base64 | No key required |
| [Rot13Encryptor](./rust-rot13.md) | ROT13 | No key required, symmetric |

## Design Note

The trait is **private** (`trait Encryptor` not `pub trait`). Only `CryptoWasm` is exposed publicly, encapsulating the strategy selection.

## Links

- [Architecture](./architecture.md) - System design overview
- [AES-128](./rust-aes128.md) - AES implementation
- [Base64](./rust-base64.md) - Base64 implementation
