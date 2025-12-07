# Output Format

> Understanding the encrypted output structure

## AES-128 Format

```
IV:CIPHERTEXT
```

Both parts are hex-encoded.

### Example

```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
└──────────── IV ────────────────┘ └────────── CIPHERTEXT ──────────┘
```

### Components

| Part | Length | Description |
|------|--------|-------------|
| IV | 32 hex chars (16 bytes) | Random initialization vector |
| Separator | 1 char | Colon `:` |
| Ciphertext | Variable | Encrypted data (PKCS7 padded) |

### Why IV is Included

The IV must be:
1. **Random** for each encryption (prevents pattern analysis)
2. **Known** for decryption (same IV required)
3. **Not secret** (can be transmitted with ciphertext)

By prepending IV to output, the encrypted string is self-contained.

## Base64 Format

```
SGVsbG8gV29ybGQ=
```

Standard Base64 encoding - no IV or separator.

## Parsing in Code

### Rust (decypher)

```rust
let parts: Vec<&str> = encrypted_input.split(':').collect();
if parts.len() != 2 {
    return Err("Invalid format: expected IV:encrypted_data");
}
let iv = hex::decode(parts[0])?;
let encrypted_bytes = hex::decode(parts[1])?;
```

### JavaScript

```javascript
const [ivHex, ciphertextHex] = encrypted.split(':');
```

## Links

- [AES-128](./rust-aes128.md) - How encryption works
- [API Reference](./js-api.md) - JavaScript decryption API
