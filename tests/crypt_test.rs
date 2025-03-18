use crypto_wasm::crypto::{CryptoWasm, EncryptorType};

/// Test to verify that encryption and decryption work correctly.
/// Encrypts a token, then decrypts it, and verifies that the original token is restored.
#[test]
fn test_encryption_and_decryption() {
    let crypto = CryptoWasm::new("thisisasecretkey".to_string(), EncryptorType::Aes128);
    let original_token = "testToken";
    println!("Original token: {}", original_token);

    // Encrypt the token
    let encrypted = crypto.cypher(original_token);
    println!("Encrypted token: {}", encrypted);

    // Decrypt the token
    let decrypted = crypto.decypher(&encrypted).expect("Decryption failed");
    println!("Decrypted token: {}", decrypted);

    // Verify that the decrypted token matches the original
    assert_eq!(decrypted, original_token, "Decrypted token must match the original");
}

/// Test to verify decryption with known values.
/// Encrypts a known token and verifies that the decrypted value is the same.
#[test]
fn test_decryption_with_known_values() {
    let crypto = CryptoWasm::new("thisisasecretkey".to_string(), EncryptorType::Aes128);
    let original_token = "knownValue";

    // Encrypt the known token
    let encrypted = crypto.cypher(original_token);

    // Decrypt the token
    let decrypted = crypto.decypher(&encrypted).expect("Decryption failed");

    // Verify that the decrypted value matches the known value
    assert_eq!(decrypted, original_token, "Decrypted token must match the original for known input");
}

/// Test to verify behavior with an invalid format.
/// Provides a string that does not follow the `IV:encrypted_data` format and expects a failure.
#[test]
fn test_invalid_decryption_format() {
    let crypto = CryptoWasm::new("thisisasecretkey".to_string(), EncryptorType::Aes128);
    let invalid_input = "invalidFormatWithoutColon";

    // Attempt to decrypt the invalid input
    let result = crypto.decypher(invalid_input);

    // Expect an error due to invalid format
    assert!(result.is_err(), "Expected an error for invalid input format");
}

/// Test to verify decryption failure when using an incorrect key.
/// Encrypts with one key and attempts to decrypt with another.
#[test]
fn test_decryption_with_wrong_key() {
    let crypto1 = CryptoWasm::new("thisisasecretkey".to_string(), EncryptorType::Aes128);
    let crypto2 = CryptoWasm::new("wrongsecretkey!!".to_string(), EncryptorType::Aes128);

    let original_token = "secureData";
    let encrypted = crypto1.cypher(original_token);

    let result = crypto2.decypher(&encrypted);

    assert!(result.is_err(), "Expected decryption failure with incorrect key");
}

/// Test to verify Base64 encryption and decryption.
#[test]
fn test_base64_encryption_and_decryption() {
    let crypto = CryptoWasm::new("".to_string(), EncryptorType::Base64); // Key is not used for Base64
    let original_token = "testToken";
    println!("Original token: {}", original_token);

    // Encrypt the token
    let encrypted = crypto.cypher(original_token);
    println!("Encrypted token: {}", encrypted);

    // Decrypt the token
    let decrypted = crypto.decypher(&encrypted).expect("Decryption failed");
    println!("Decrypted token: {}", decrypted);

    // Verify that the decrypted token matches the original
    assert_eq!(decrypted, original_token, "Decrypted token must match the original");
}

/// Test to verify Base64 decryption with known values.
#[test]
fn test_base64_decryption_with_known_values() {
    let crypto = CryptoWasm::new("".to_string(), EncryptorType::Base64); // Key is not used for Base64
    let original_token = "knownValue";

    // Encrypt the known token
    let encrypted = crypto.cypher(original_token);

    // Decrypt the token
    let decrypted = crypto.decypher(&encrypted).expect("Decryption failed");

    // Verify that the decrypted value matches the known value
    assert_eq!(decrypted, original_token, "Decrypted token must match the original for known input");
}