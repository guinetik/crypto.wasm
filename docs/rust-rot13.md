# ROT13 Implementation

> Simple letter substitution cipher

## Overview

ROT13 (rotate by 13 places) is a simple letter substitution cipher that replaces each letter with the letter 13 positions after it in the alphabet.

## Struct

```rust
struct Rot13Encryptor;
```

Zero-sized type - no state needed for ROT13.

## Core Algorithm

```rust
impl Rot13Encryptor {
    fn rot13_byte(byte: u8) -> u8 {
        match byte {
            b'A'..=b'M' | b'a'..=b'm' => byte + 13,
            b'N'..=b'Z' | b'n'..=b'z' => byte - 13,
            _ => byte, // Non-alphabetic characters unchanged
        }
    }

    fn rot13_transform(data: &[u8]) -> Vec<u8> {
        data.iter().map(|&b| Self::rot13_byte(b)).collect()
    }
}
```

## Transformation Table

| Input | Output |
|-------|--------|
| A-M | N-Z |
| N-Z | A-M |
| a-m | n-z |
| n-z | a-m |
| 0-9, punctuation | unchanged |

## Example

```
Input:  Hello World!
Output: Uryyb Jbeyq!
```

## Symmetric Property

ROT13 is its own inverse - applying it twice returns the original:

```rust
fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
    Rot13Encryptor::rot13_transform(data)
}

fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
    // Same operation!
    Rot13Encryptor::rot13_transform(encrypted_data)
}
```

## Characteristics

| Property | Value |
|----------|-------|
| Key required | No |
| IV required | No |
| Preserves case | Yes |
| Preserves non-alpha | Yes |
| Security | None (trivially reversible) |

## Use Cases

- Hiding spoilers in text
- Simple obfuscation of text
- Encoding puzzle answers
- Educational purposes

## Warning

ROT13 provides **NO security**. It's a simple substitution that anyone can reverse. For actual encryption, use [AES-128](./rust-aes128.md).

## Links

- [Encryptor Trait](./rust-encryptor-trait.md) - Parent trait
- [Base64](./rust-base64.md) - Another encoding option
- [AES-128](./rust-aes128.md) - Secure encryption
