# CLI Usage

> Command-line interface for crypto.wasm

## Installation

```bash
cargo install --path .
```

Or run directly:
```bash
cargo run -- [OPTIONS]
```

## Synopsis

```
crypto_cli [OPTIONS] --encryptor <ENCRYPTOR> --input <INPUT>
```

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--encryptor` | `-e` | Algorithm: `aes128`, `xor`, `caesar`, `base64`, `rot13` |
| `--key` | `-k` | Secret key (see key requirements below) |
| `--input` | `-i` | Text to encrypt/decrypt |
| `--decrypt` | `-d` | Decrypt mode (default: encrypt) |

## Key Requirements

| Algorithm | Key |
|-----------|-----|
| `aes128` | Exactly 16 characters |
| `xor` | Any non-empty string |
| `caesar` | Number 1-25 |
| `base64` | Not required |
| `rot13` | Not required |

## Examples

### Encrypt with AES-128

```bash
cargo run -- -e aes128 -k "thisisasecretkey" -i "Hello World"
# Output: Encrypted: a1b2c3...:d4e5f6...
```

### Decrypt with AES-128

```bash
cargo run -- -e aes128 -k "thisisasecretkey" -i "a1b2c3...:d4e5f6..." -d
# Output: Decrypted: Hello World
```

### Base64 Encode

```bash
cargo run -- -e base64 -i "Hello World"
# Output: Encrypted: SGVsbG8gV29ybGQ=
```

### Base64 Decode

```bash
cargo run -- -e base64 -i "SGVsbG8gV29ybGQ=" -d
# Output: Decrypted: Hello World
```

### XOR Encrypt

```bash
cargo run -- -e xor -k "secret" -i "Hello World"
# Output: Encrypted: 3b0a021c0545360a021c09
```

### XOR Decrypt

```bash
cargo run -- -e xor -k "secret" -i "3b0a021c0545360a021c09" -d
# Output: Decrypted: Hello World
```

### Caesar Encrypt (shift=3)

```bash
cargo run -- -e caesar -k "3" -i "Hello World"
# Output: Encrypted: Khoor Zruog
```

### Caesar Decrypt

```bash
cargo run -- -e caesar -k "3" -i "Khoor Zruog" -d
# Output: Decrypted: Hello World
```

### ROT13

```bash
cargo run -- -e rot13 -i "Hello World"
# Output: Encrypted: Uryyb Jbeyq
```

## Error Handling

```bash
# Missing key for AES-128
cargo run -- -e aes128 -i "test"
# Error: A key is required for AES-128 encryption.

# Wrong key length
cargo run -- -e aes128 -k "short" -i "test"
# Error: Secret key must be exactly 16 bytes long for AES-128!
```

## Links

- [Output Format](./output-format.md) - Understanding encrypted output
- [AES-128](./rust-aes128.md) - AES-128 implementation details
