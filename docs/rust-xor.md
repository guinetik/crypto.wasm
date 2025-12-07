# XOR Cipher Implementation

> Simple symmetric cipher using bitwise XOR

## Overview

XOR (exclusive or) cipher is a symmetric encryption algorithm that combines plaintext with a key using the XOR bitwise operation. It's the foundation of many modern encryption algorithms.

## Struct

```rust
struct XorEncryptor {
    key: Vec<u8>,
}
```

Stores the key bytes for XOR operations.

## Core Algorithm

```rust
impl XorEncryptor {
    fn new(key: &[u8]) -> Self {
        Self { key: key.to_vec() }
    }

    fn xor_transform(&self, data: &[u8]) -> Vec<u8> {
        data.iter()
            .enumerate()
            .map(|(i, &b)| b ^ self.key[i % self.key.len()])
            .collect()
    }
}
```

The key cycles through the data - if the key is shorter than the data, it repeats.

## Example

```
Key:    "KEY" (0x4B, 0x45, 0x59)
Input:  "Hello"
        H     e     l     l     o
        0x48  0x65  0x6C  0x6C  0x6F
XOR:    0x4B  0x45  0x59  0x4B  0x45
Result: 0x03  0x20  0x35  0x27  0x2A
Output: (hex encoded for display)
```

## Symmetric Property

XOR is its own inverse - encrypting twice with the same key returns the original:

```rust
fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
    self.xor_transform(data)
}

fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
    // Same operation!
    self.xor_transform(encrypted_data)
}
```

## Output Format

XOR output is hex-encoded because the result may contain non-printable bytes:
- Encrypt: plaintext -> XOR -> hex string
- Decrypt: hex string -> decode -> XOR -> plaintext

## Characteristics

| Property | Value |
|----------|-------|
| Key required | Yes (any length) |
| IV required | No |
| Key length | Any (cycles through data) |
| Security | Weak alone, strong with OTP |

## Security Notes

XOR cipher alone is **not secure** for:
- Repeated key usage (vulnerable to frequency analysis)
- Known plaintext attacks

However, XOR with a **one-time pad** (key as long as message, used once) provides perfect secrecy.

## Use Cases

- Educational purposes
- Simple obfuscation
- Building block for stream ciphers
- One-time pad implementation

## Links

- [Encryptor Trait](./rust-encryptor-trait.md) - Parent trait
- [Caesar](./rust-caesar.md) - Another classic cipher
- [AES-128](./rust-aes128.md) - Secure encryption
