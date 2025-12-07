# AES-128 Implementation

> AES-128-CBC with PKCS7 padding

## Type Alias

```rust
type Aes128Cbc = Cbc<Aes128, Pkcs7>;
```

Combines AES-128 block cipher with CBC mode and PKCS7 padding.

## Struct

```rust
struct Aes128Encryptor {
    key: [u8; 16],  // Exactly 16 bytes for AES-128
}
```

## Constructor

```rust
impl Aes128Encryptor {
    fn new(secret_key: &[u8]) -> Self {
        if secret_key.len() != 16 {
            panic!("Secret key must be exactly 16 bytes long!");
        }
        let mut key = [0u8; 16];
        key.copy_from_slice(&secret_key[..16]);
        Self { key }
    }
}
```

**Key requirement**: Exactly 16 ASCII characters (16 bytes).

## Encryption

```rust
fn encrypt(&self, data: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes128Cbc::new_from_slices(&self.key, iv).unwrap();
    cipher.encrypt_vec(data)
}
```

The IV is generated randomly in `CryptoWasm::cypher`:
```rust
let mut iv = [0u8; 16];
rand::thread_rng().fill(&mut iv);
```

## Decryption

```rust
fn decrypt(&self, encrypted_data: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes128Cbc::new_from_slices(&self.key, iv).unwrap();
    cipher.decrypt_vec(encrypted_data).unwrap_or_else(|_| vec![])
}
```

Returns empty vector on failure (wrong key, corrupted data).

## Security Properties

| Property | Value |
|----------|-------|
| Algorithm | AES-128 |
| Mode | CBC (Cipher Block Chaining) |
| Padding | PKCS7 |
| Key size | 128 bits (16 bytes) |
| Block size | 128 bits (16 bytes) |
| IV size | 128 bits (16 bytes) |

## Links

- [Output Format](./output-format.md) - How encrypted data is formatted
- [Encryptor Trait](./rust-encryptor-trait.md) - Parent trait
- [Base64](./rust-base64.md) - Alternative encoder
