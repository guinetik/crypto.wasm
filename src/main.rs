use clap::{Arg, Command, value_parser};
use crypto_wasm::crypto::{CryptoWasm, EncryptorType};

fn main() {
    let matches = Command::new("crypto_cli")
        .version("0.1.0")
        .author("Guinetik <guinetik@gmail.com>")
        .about("Encrypts or decrypts data using various algorithms")
        .arg(
            Arg::new("encryptor")
                .long("encryptor")
                .short('e')
                .value_name("ENCRYPTOR")
                .help("The encryptor to use (aes128, xor, caesar, base64, rot13)")
                .value_parser(value_parser!(String))
                .required(true),
        )
        .arg(
            Arg::new("key")
                .long("key")
                .short('k')
                .value_name("KEY")
                .help("The secret key (16 chars for AES-128, any for XOR, 1-25 for Caesar)")
                .value_parser(value_parser!(String)),
        )
        .arg(
            Arg::new("input")
                .long("input")
                .short('i')
                .value_name("INPUT")
                .help("The input data to encrypt or decrypt")
                .value_parser(value_parser!(String))
                .required(true),
        )
        .arg(
            Arg::new("decrypt")
                .long("decrypt")
                .short('d')
                .help("Decrypt the input data")
                .action(clap::ArgAction::SetTrue),
        )
        .get_matches();

    // Parse encryptor type
    let encryptor_type = match matches.get_one::<String>("encryptor").unwrap().as_str() {
        "aes128" => EncryptorType::Aes128,
        "base64" => EncryptorType::Base64,
        "rot13" => EncryptorType::Rot13,
        "xor" => EncryptorType::Xor,
        "caesar" => EncryptorType::Caesar,
        _ => {
            eprintln!("Invalid encryptor type. Use 'aes128', 'xor', 'caesar', 'base64', or 'rot13'.");
            std::process::exit(1);
        }
    };

    // Parse key (optional for Base64 and ROT13)
    let key = matches.get_one::<String>("key").cloned().unwrap_or_default();

    // Validate key based on encryptor type
    match encryptor_type {
        EncryptorType::Aes128 if key.is_empty() => {
            eprintln!("A key is required for AES-128 encryption.");
            std::process::exit(1);
        }
        EncryptorType::Xor if key.is_empty() => {
            eprintln!("A key is required for XOR encryption.");
            std::process::exit(1);
        }
        EncryptorType::Caesar => {
            if key.is_empty() {
                eprintln!("A shift value (1-25) is required for Caesar cipher.");
                std::process::exit(1);
            }
            if key.parse::<u8>().map(|n| n < 1 || n > 25).unwrap_or(true) {
                eprintln!("Caesar shift must be a number between 1 and 25.");
                std::process::exit(1);
            }
        }
        _ => {}
    }

    // Parse input
    let input = matches.get_one::<String>("input").unwrap();

    // Initialize CryptoWasm
    let crypto = CryptoWasm::new(key, encryptor_type);

    // Perform encryption or decryption
    if matches.get_flag("decrypt") {
        match crypto.decypher(input) {
            Ok(decrypted) => println!("Decrypted: {}", decrypted),
            Err(e) => eprintln!("Decryption failed: {}", e),
        }
    } else {
        let encrypted = crypto.cypher(input);
        println!("Encrypted: {}", encrypted);
    }
}