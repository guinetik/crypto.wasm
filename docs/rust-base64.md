# Base64 Implementation

> Simple Base64 encoding/decoding

## Struct

```rust
struct Base64Encryptor;
```

Zero-sized type - no state needed for Base64.

## Implementation

```rust
impl Encryptor for Base64Encryptor {
    fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
        encode(data).into_bytes()
    }

    fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
        decode(encrypted_data).unwrap_or_else(|_| vec![])
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Base64
    }
}
```

## Notes

- **IV is ignored** (`_iv`) - Base64 doesn't use initialization vectors
- **No key required** - Base64 is encoding, not encryption
- Returns empty vector on decode failure

## Use Cases

- Encoding binary data for text transmission
- Simple obfuscation (not security!)
- Testing the encryption pipeline

## Warning

Base64 is **NOT encryption**. It provides no security - anyone can decode Base64 data. Use [AES-128](./rust-aes128.md) for actual encryption.

## Links

- [Encryptor Trait](./rust-encryptor-trait.md) - Parent trait
- [AES-128](./rust-aes128.md) - Secure alternative
