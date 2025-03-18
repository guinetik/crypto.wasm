use wasm_bindgen::prelude::*;
use base64::{encode, decode};
use aes::Aes128;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use hex;
use rand::Rng;

type Aes128Cbc = Cbc<Aes128, Pkcs7>;

#[derive(PartialEq)]
#[wasm_bindgen]
pub enum EncryptorType {
    Aes128,
    Base64,
}

/// Encryption trait
trait Encryptor {
    fn encrypt(&self, data: &[u8], iv: &[u8]) -> Vec<u8>;
    fn decrypt(&self, encrypted_data: &[u8], iv: &[u8]) -> Vec<u8>;
    fn encryptor_type(&self) -> EncryptorType;
}

/// AES-128 CBC implementation
struct Aes128Encryptor {
    key: [u8; 16],
}

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

/// Base64 implementation
struct Base64Encryptor;

impl Encryptor for Base64Encryptor {
    fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
        encode(data).into_bytes()
    }

    fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
        decode(encrypted_data).unwrap_or_else(|_| vec![])
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Base64  // Return the encryptor type
    }
}

impl Encryptor for Aes128Encryptor {
    fn encrypt(&self, data: &[u8], iv: &[u8]) -> Vec<u8> {
        let cipher = Aes128Cbc::new_from_slices(&self.key, iv).unwrap();
        cipher.encrypt_vec(data)
    }

    fn decrypt(&self, encrypted_data: &[u8], iv: &[u8]) -> Vec<u8> {
        let cipher = Aes128Cbc::new_from_slices(&self.key, iv).unwrap();
        cipher.decrypt_vec(encrypted_data).unwrap_or_else(|_| vec![]) // Return empty Vec<u8> instead of error
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Aes128  // Return the encryptor type
    }
}

/// CryptoWasm class with configurable key
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct CryptoWasm {
    encryptor: Box<dyn Encryptor>,
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl CryptoWasm {
    /// Initialize with a key and encryptor type
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(secret_key: String, encryptor_type: EncryptorType) -> CryptoWasm {
        let encryptor: Box<dyn Encryptor> = match encryptor_type {
            EncryptorType::Aes128 => {
                let key_bytes = secret_key.as_bytes();
                if key_bytes.len() != 16 {
                    panic!("Secret key must be exactly 16 bytes long for AES-128!");
                }
                Box::new(Aes128Encryptor::new(key_bytes))
            }
            EncryptorType::Base64 => Box::new(Base64Encryptor),
        };
        CryptoWasm { encryptor }
    }

    /// Encrypts a string
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn cypher(&self, input: &str) -> String {
        match self.encryptor.encryptor_type() {
            EncryptorType::Aes128 => {
                // AES-128 encryption logic
                let token_bytes = input.as_bytes();
                let mut iv = [0u8; 16];
                rand::thread_rng().fill(&mut iv);
                let encrypted_token = self.encryptor.encrypt(token_bytes, &iv);
                format!("{}:{}", hex::encode(iv), hex::encode(encrypted_token))
            }
            EncryptorType::Base64 => {
                // Base64 encoding logic
                let encoded = self.encryptor.encrypt(input.as_bytes(), &[]);
                String::from_utf8(encoded).unwrap_or_else(|_| "Encoding failed".to_string())
            }
        }
    }

    /// Decrypts a string
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn decypher(&self, encrypted_input: &str) -> Result<String, String> {
        match self.encryptor.encryptor_type() {
            EncryptorType::Aes128 => {
                // AES-128 decryption logic
                let parts: Vec<&str> = encrypted_input.split(':').collect();
                if parts.len() != 2 {
                    return Err("Invalid format: expected IV:encrypted_data".to_string());
                }

                let iv = hex::decode(parts[0]).map_err(|_| "Invalid IV format".to_string())?;
                let encrypted_bytes = hex::decode(parts[1]).map_err(|_| "Invalid encrypted data format".to_string())?;

                let decrypted_bytes = self.encryptor.decrypt(&encrypted_bytes, &iv);

                if decrypted_bytes.is_empty() {
                    return Err("Decryption failed: Invalid key or corrupted data".to_string());
                }

                String::from_utf8(decrypted_bytes).map_err(|_| "Decryption failed: Invalid UTF-8 data".to_string())
            }
            EncryptorType::Base64 => {
                // Base64 decoding logic
                let decoded = self.encryptor.decrypt(encrypted_input.as_bytes(), &[]);
                String::from_utf8(decoded).map_err(|_| "Decoding failed: Invalid UTF-8 data".to_string())
            }
        }
    }
}