# crypto.wasm

This is a **study-focused WebAssembly library** designed to explore the bridge between WebAssembly (Wasm) and JavaScript. It provides a simple interface to encrypt and decrypt data using **AES-128/CBC/PKCS7** and **Base64** encoding. The library is written in Rust and compiled to WebAssembly, with a JavaScript bridge to interact with the Wasm module.

[![Build and Release](https://github.com/guinetik/crypto.wasm/actions/workflows/release.yaml/badge.svg?branch=master)](https://github.com/guinetik/crypto.wasm/actions/workflows/release.yaml)

---

## Demo

https://guinetik.github.io/crypto.wasm/

---

## Features

- **AES-128 Encryption**: Encrypts data using AES-128 in CBC mode with PKCS7 padding.
- **Base64 Encoding/Decoding**: Supports Base64 encoding and decoding as an alternative to encryption.
- **JavaScript Bridge**: Includes a custom JavaScript interface (`crypto_wasm.js`) to interact with the Wasm module.
- **CLI Support**: Includes a command-line interface (CLI) for encrypting, decrypting, encoding, and decoding data.
- **Study Focus**: This started as a study on traits. Then I wanted to check interoperability of the CLI and WASM. In short, this project demonstrates how to bridge WebAssembly and JavaScript for cryptographic operations.

---

## Installation

### Prerequisites

1. **Rust**: Install Rust using [rustup](https://rustup.rs/).

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **WebAssembly Target**: Add the WebAssembly target for Rust.

   ```bash
   rustup target add wasm32-unknown-unknown
   ```

3. **wasm-pack**: Install `wasm-pack` for building and packaging the WebAssembly module.

   ```bash
   cargo install wasm-pack
   ```

4. **Terser**: Install `terser` for minifying JavaScript files.
   ```bash
   npm install -g terser
   ```

---

## Testing

To run the tests, use the following command:

```bash
cargo test
```

---

## Building the Project

### Using `build.ps1` (Windows)

The `build.ps1` script automates the build process for Windows users. It runs tests, builds the WebAssembly module, minifies the JavaScript files, and prepares the final distribution package.

1. Open PowerShell.
2. Navigate to the project directory.
3. Run the script:
   ```powershell
   .\build.ps1
   ```

The final package will be located in the `dist/crypto_wasm` directory.

### Manual Build (All Platforms)

1. Run tests:

   ```bash
   cargo test
   ```

2. Build the WebAssembly module:

   ```bash
   wasm-pack build --target web --out-dir build/crypto_wasm
   ```

3. Minify the generated JavaScript files:

   ```bash
   terser build/crypto_wasm/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.lib.min.js --compress --mangle
   terser js/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.min.js --compress --mangle
   ```

4. Prepare the distribution package:
   ```bash
   mkdir -p dist/crypto_wasm
   cp build/crypto_wasm/crypto_wasm.lib.min.js dist/crypto_wasm/
   cp build/crypto_wasm/crypto_wasm_bg.wasm dist/crypto_wasm/
   cp build/crypto_wasm/crypto_wasm.min.js dist/crypto_wasm/
   ```

---

## Usage

### JavaScript Integration

1. Include the generated wrapper file in your html file:

   ```html
   <script src="path/to/crypto_wasm.min.js"></script>
   ```

2. Initialize the Wasm module and use the `CryptoWasm` class:

   ```javascript
   const wasmPath =
     window.location.href + "/dist/crypto_wasm/crypto_wasm.lib.min.js";

   // Initialize CryptoWasm
   const cryptoWasm = new CryptoWasmWrapper();
   await cryptoWasm.init(wasmPath);

   // Create a new CryptoWasm instance
   const crypto = new CryptoWasm("thisisasecretkey", EncryptorType.Aes128);

   // Encrypt a token
   const encrypted = crypto.cypher("my secret token");
   console.log("Encrypted:", encrypted);

   // Decrypt a token
   const decrypted = crypto.decypher(encrypted);
   console.log("Decrypted:", decrypted);
   ```

### CLI Usage

Before using the CLI, you must build the project using the release profile:

```bash
cargo build --release
```

A compiled binary will be available in the `target/release` directory (crypto_cli.exe on Windows).

The CLI supports both **AES-128 encryption/decryption** and **Base64 encoding/decoding**.

#### Encrypting Data (AES-128)

```bash
crypto_cli --encryptor aes128 --input "Hello, World!" --key "thisisasecretkey"
```

Output:

```
Encrypted: a238c6ee47d012c384fdd534ae0ddb6f:5c6feee9034441cb883170a0837ce8f2
```

#### Decrypting Data (AES-128)

```bash
crypto_cli --encryptor aes128 --input "ENCRYPTED VALUE" --key "thisisasecretkey" -d
```

Output:

```
Decrypted: Hello, World!
```

#### Encoding Data (Base64)

```bash
./target/release/crypto_cli --encryptor base64 --input "Hello, World!"
```

Output:

```
Encrypted: SGVsbG8sIFdvcmxkIQ==
```

#### Decoding Data (Base64)

```bash
crypto_cli --encryptor base64 --input "SGVsbG8sIFdvcmxkIQ==" -d
```

Output:

```
Decrypted: Hello, World!
```

---

## Project Structure

- **`src/lib.rs`**: Contains the Rust implementation of AES-128 and Base64 operations.
- **`src/main.rs`**: Implements the CLI interface.
- **`js/crypto_wasm.js`**: JavaScript bridge for interacting with the Wasm module.
- **`build.ps1`**: PowerShell script for automating the build process on Windows.
- **`dist/crypto_wasm/`**: Contains the final distribution files:
  - `crypto_wasm.lib.min.js`: Minified WebAssembly loader.
  - `crypto_wasm.min.js`: Minified JavaScript bridge.
  - `crypto_wasm_bg.wasm`: Compiled WebAssembly module.

---

## Contributing

This project is a study tool, but contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Rust](https://www.rust-lang.org/) for providing a safe and performant programming language.
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) for simplifying WebAssembly packaging.
- [aes](https://crates.io/crates/aes) and [block-modes](https://crates.io/crates/block-modes) crates for encryption functionality.

---
