# Caesar Cipher Implementation

> Classic letter substitution cipher with configurable shift

## Overview

Caesar cipher (shift cipher) is one of the oldest known encryption techniques. It shifts each letter in the plaintext by a fixed number of positions in the alphabet.

## Struct

```rust
struct CaesarEncryptor {
    shift: u8,
}
```

Stores the shift value (1-25).

## Core Algorithm

```rust
impl CaesarEncryptor {
    fn new(shift: u8) -> Self {
        // Normalize shift to 0-25 range
        Self { shift: shift % 26 }
    }

    fn caesar_encrypt_byte(byte: u8, shift: u8) -> u8 {
        match byte {
            b'A'..=b'Z' => b'A' + (byte - b'A' + shift) % 26,
            b'a'..=b'z' => b'a' + (byte - b'a' + shift) % 26,
            _ => byte, // Non-alphabetic unchanged
        }
    }

    fn caesar_decrypt_byte(byte: u8, shift: u8) -> u8 {
        match byte {
            b'A'..=b'Z' => b'A' + (byte - b'A' + 26 - shift) % 26,
            b'a'..=b'z' => b'a' + (byte - b'a' + 26 - shift) % 26,
            _ => byte,
        }
    }
}
```

## Shift Table (shift=3)

| Input | A | B | C | D | E | ... | X | Y | Z |
|-------|---|---|---|---|---|-----|---|---|---|
| Output| D | E | F | G | H | ... | A | B | C |

## Example

```
Shift: 3
Input:  Hello World!
Output: Khoor Zruog!

Shift: 13 (same as ROT13)
Input:  Hello World!
Output: Uryyb Jbeyq!
```

## Asymmetric Operations

Unlike XOR or ROT13, Caesar uses different operations for encrypt/decrypt:

```rust
fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
    data.iter()
        .map(|&b| CaesarEncryptor::caesar_encrypt_byte(b, self.shift))
        .collect()
}

fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
    encrypted_data.iter()
        .map(|&b| CaesarEncryptor::caesar_decrypt_byte(b, self.shift))
        .collect()
}
```

## Characteristics

| Property | Value |
|----------|-------|
| Key required | Yes (shift 1-25) |
| IV required | No |
| Preserves case | Yes |
| Preserves non-alpha | Yes |
| Security | None (only 25 possibilities) |

## Historical Note

Named after Julius Caesar, who reportedly used shift=3 to communicate with his generals. The cipher was effective in ancient times when most people were illiterate.

## Relationship to ROT13

ROT13 is simply Caesar cipher with shift=13. The special property of shift=13 is that it's self-inverse (applying twice returns the original).

## Security Warning

Caesar cipher provides **no real security**:
- Only 25 possible keys
- Trivially broken by brute force
- Vulnerable to frequency analysis

Use [AES-128](./rust-aes128.md) for actual security needs.

## Links

- [Encryptor Trait](./rust-encryptor-trait.md) - Parent trait
- [ROT13](./rust-rot13.md) - Caesar with shift=13
- [XOR](./rust-xor.md) - Another classic cipher
