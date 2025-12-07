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
    Rot13,
    Xor,
    Caesar,
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

/// ROT13 implementation
struct Rot13Encryptor;

/// XOR cipher implementation
struct XorEncryptor {
    key: Vec<u8>,
}

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

/// Caesar cipher implementation
struct CaesarEncryptor {
    shift: u8,
}

impl CaesarEncryptor {
    fn new(shift: u8) -> Self {
        // Normalize shift to 0-25 range
        Self { shift: shift % 26 }
    }

    fn caesar_encrypt_byte(byte: u8, shift: u8) -> u8 {
        match byte {
            b'A'..=b'Z' => b'A' + (byte - b'A' + shift) % 26,
            b'a'..=b'z' => b'a' + (byte - b'a' + shift) % 26,
            _ => byte, // Non-alphabetic characters unchanged
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

impl Encryptor for Base64Encryptor {
    fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
        encode(data).into_bytes()
    }

    fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
        decode(encrypted_data).unwrap_or_else(|_| vec![])
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Base64
    }
}

impl Encryptor for Rot13Encryptor {
    fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
        Rot13Encryptor::rot13_transform(data)
    }

    fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
        // ROT13 is symmetric - applying it twice returns original
        Rot13Encryptor::rot13_transform(encrypted_data)
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Rot13
    }
}

impl Encryptor for XorEncryptor {
    fn encrypt(&self, data: &[u8], _iv: &[u8]) -> Vec<u8> {
        self.xor_transform(data)
    }

    fn decrypt(&self, encrypted_data: &[u8], _iv: &[u8]) -> Vec<u8> {
        // XOR is symmetric - applying it twice returns original
        self.xor_transform(encrypted_data)
    }

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Xor
    }
}

impl Encryptor for CaesarEncryptor {
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

    fn encryptor_type(&self) -> EncryptorType {
        EncryptorType::Caesar
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
            EncryptorType::Rot13 => Box::new(Rot13Encryptor),
            EncryptorType::Xor => {
                let key_bytes = secret_key.as_bytes();
                if key_bytes.is_empty() {
                    panic!("XOR cipher requires a non-empty key!");
                }
                Box::new(XorEncryptor::new(key_bytes))
            }
            EncryptorType::Caesar => {
                // Parse shift from key string (expects a number 1-25)
                let shift: u8 = secret_key.parse().unwrap_or(3);
                Box::new(CaesarEncryptor::new(shift))
            }
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
            EncryptorType::Rot13 => {
                // ROT13 encoding logic
                let encoded = self.encryptor.encrypt(input.as_bytes(), &[]);
                String::from_utf8(encoded).unwrap_or_else(|_| "Encoding failed".to_string())
            }
            EncryptorType::Xor => {
                // XOR cipher - output as hex since result may contain non-printable bytes
                let encrypted = self.encryptor.encrypt(input.as_bytes(), &[]);
                hex::encode(encrypted)
            }
            EncryptorType::Caesar => {
                // Caesar cipher
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
            EncryptorType::Rot13 => {
                // ROT13 decoding logic (symmetric - same as encoding)
                let decoded = self.encryptor.decrypt(encrypted_input.as_bytes(), &[]);
                String::from_utf8(decoded).map_err(|_| "Decoding failed: Invalid UTF-8 data".to_string())
            }
            EncryptorType::Xor => {
                // XOR cipher - input is hex encoded
                let encrypted_bytes = hex::decode(encrypted_input)
                    .map_err(|_| "Invalid hex format".to_string())?;
                let decrypted = self.encryptor.decrypt(&encrypted_bytes, &[]);
                String::from_utf8(decrypted).map_err(|_| "Decoding failed: Invalid UTF-8 data".to_string())
            }
            EncryptorType::Caesar => {
                // Caesar cipher decoding
                let decoded = self.encryptor.decrypt(encrypted_input.as_bytes(), &[]);
                String::from_utf8(decoded).map_err(|_| "Decoding failed: Invalid UTF-8 data".to_string())
            }
        }
    }
}