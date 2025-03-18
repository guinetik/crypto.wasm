use crypto_wasm::crypto;

/// Teste para verificar se a criptografia e a descriptografia funcionam corretamente.
/// Criptografa um token, depois descriptografa, e verifica se o token original é restaurado.
#[test]
fn test_encryption_and_decryption() {
    let original_token = "testToken";
    println!("Original token: {}", original_token);
    // Criptografa o token
    let encrypted = crypto::cypher(original_token);
    println!("Encrypted token: {}", encrypted);
    // Descriptografa o token
    let decrypted = crypto::decypher(&encrypted).expect("Falha na descriptografia");
    println!("Decrypted token: {}", decrypted);
    // Verifica se o token descriptografado corresponde ao original
    assert_eq!(decrypted, original_token, "O token descriptografado deve corresponder ao original");
}

/// Teste para verificar a descriptografia de valores conhecidos.
/// Criptografa um token conhecido e verifica se o valor descriptografado é o mesmo.
#[test]
fn test_decryption_with_known_values() {
    let original_token = "knownValue";
    let encrypted = crypto::cypher(original_token);
    // Testa a descriptografia do token conhecido
    let decrypted = crypto::decypher(&encrypted).expect("Falha na descriptografia");
    // Verifica se o valor descriptografado corresponde ao valor conhecido
    assert_eq!(decrypted, original_token, "O token descriptografado deve corresponder ao valor original para entrada conhecida");
}

/// Teste para verificar o comportamento com um formato inválido.
/// Fornece uma string que não segue o formato `IV:encrypted_data` e espera uma falha.
#[test]
fn test_invalid_decryption_format() {
    let invalid_input = "invalidFormatWithoutColon";
    let result = crypto::decypher(invalid_input);
    // Espera um erro devido ao formato inválido
    assert!(result.is_err(), "Era esperado um erro para formato de entrada inválido");
}
