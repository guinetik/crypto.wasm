# crypto.wasm
This is a simple WebAssembly library that provides a simple interface to encrypt and decrypt data using AES-128/PKCS7 encryption. The library is written in Rust and compiled to WebAssembly. The library uses the `aes` crate to perform the encryption and decryption. The library a proof of concept to demonstrate how to use WebAssembly to perform AES-128/PKCS7 encryption on the browser.

## Instalando
Para compilar a lib é necessário ter um ambiente de instalação Rust. A forma mais fácil de fazer isso no Windows é via [rustup](https://rustup.rs/). É importante notar que o RustUp necessita do Visual Studio para compilar código nativo. Então é necessário o download do Visual C++ Build Tools. No Linux, o RustUp instala todas as dependências necessárias.

Para compilar para WebAssembly é necessário instalar o target wasm32-unknown-unknown que é responsável por compilar o código para WebAssembly.

```bash
    rustup target add wasm32-unknown-unknown
```

Além disso, é necessário instalar o wasm-pack que é responsável por empacotar o código para ser utilizado em um projeto Web.

```bash
    cargo install wasm-pack
```

## Testando
```bash
    cargo test
```

## Gerando o pacote
```bash
    wasm-pack build --target web --out-dir build/crypto_wasm
```

O pacote gerado estará na pasta dist/crypto_wasm. É recomendado executar o `terse` para minificar o código gerado.

```bash
    terser dist/crypto_wasm/crypto_wasm.js -o dist/crypto_wasm/crypto_wasm.lib.min.js
```