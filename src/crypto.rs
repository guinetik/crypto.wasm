use wasm_bindgen::prelude::*;
use aes::Aes128;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use rand::Rng;
use hex;

// Define o tipo de cifra AES-128 em modo CBC com preenchimento PKCS7
type Aes128Cbc = Cbc<Aes128, Pkcs7>;

// Chave secreta de 128 bits usada para criptografia e descriptografia (16 bytes)
const SECRET_KEY: &[u8; 16] = b"thisisasecretkey";

/// Criptografa o token fornecido usando AES-128 em modo CBC com um IV aleatório.
///
/// # Argumentos
///
/// * `input` - String de entrada que representa o token a ser criptografado.
///
/// # Retorna
///
/// Uma `String` que contém o IV (vetor de inicialização) e o token criptografado,
/// codificados em hexadecimal e separados por `:` para facilitar a transmissão e armazenamento.
#[wasm_bindgen]
pub fn cypher(input: &str) -> String {
    let token_bytes = input.as_bytes();

    // Gera um IV aleatório de 16 bytes
    let mut iv = [0u8; 16];
    rand::thread_rng().fill(&mut iv);

    // Criptografa o token
    let encrypted_token = aes_encrypt(token_bytes, &iv);

    // Concatena IV e token criptografado em hexadecimal
    let iv_hex = hex::encode(iv);
    let encrypted_hex = hex::encode(encrypted_token);
    format!("{}:{}", iv_hex, encrypted_hex)
}

/// Descriptografa um token criptografado no formato `IV:encrypted_data`.
///
/// # Argumentos
///
/// * `encrypted_input` - String de entrada no formato `IV:encrypted_data`, onde `IV`
///   é o vetor de inicialização em hexadecimal e `encrypted_data` é o token criptografado.
///
/// # Retorna
///
/// Um `Result<String, String>` onde o valor `Ok` contém o token descriptografado original,
/// e o valor `Err` indica uma falha na descriptografia ou formato inválido.
#[wasm_bindgen]
pub fn decypher(encrypted_input: &str) -> Result<String, String> {
    // Separa IV e token criptografado
    let parts: Vec<&str> = encrypted_input.split(':').collect();
    if parts.len() != 2 {
        return Err("Formato inválido: esperado IV:encrypted_data".to_string());
    }

    let iv = hex::decode(parts[0]).map_err(|_| "Formato de IV inválido")?;
    let encrypted_bytes = hex::decode(parts[1]).map_err(|_| "Formato de dados criptografados inválido")?;

    // Descriptografa o token
    let decrypted_bytes = aes_decrypt(&encrypted_bytes, &iv);
    String::from_utf8(decrypted_bytes).map_err(|_| "Descriptografia falhou: UTF-8 inválido".to_string())
}

/// Função auxiliar para criptografar dados usando AES-128 com CBC e PKCS7.
///
/// # Argumentos
///
/// * `data` - Dados em bytes a serem criptografados.
/// * `iv` - Vetor de inicialização de 16 bytes.
///
/// # Retorna
///
/// Um `Vec<u8>` contendo os dados criptografados.
fn aes_encrypt(data: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes128Cbc::new_from_slices(SECRET_KEY, iv).unwrap();
    cipher.encrypt_vec(data)
}

/// Função auxiliar para descriptografar dados usando AES-128 com CBC e PKCS7.
///
/// # Argumentos
///
/// * `encrypted_data` - Dados criptografados em bytes.
/// * `iv` - Vetor de inicialização de 16 bytes utilizado na criptografia.
///
/// # Retorna
///
/// Um `Vec<u8>` contendo os dados descriptografados.
fn aes_decrypt(encrypted_data: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes128Cbc::new_from_slices(SECRET_KEY, iv).unwrap();
    cipher.decrypt_vec(encrypted_data).unwrap()
}
