# Claude Instructions for crypto.wasm

## IMPORTANT RULES

1. **NEVER run `npm run dev`** - The user handles starting dev servers. Running dev servers locks files and occupies ports.

2. **NEVER run background processes** - No `run_in_background: true` for this project.

3. **Building is OK** - You can run `npm run build` when needed.

## Project Structure

```
crypto.wasm/
├── src/
│   ├── crypto.rs      # Core encryption logic (Rust)
│   ├── lib.rs         # Library exports
│   └── main.rs        # CLI entry point
├── js/
│   ├── crypto_wasm.js    # JavaScript wrapper
│   ├── crypto_wasm.ts    # TypeScript wrapper
│   └── crypto_wasm.d.ts  # Type definitions
├── dist/crypto_wasm/     # Built WASM output
├── demo/                 # Vite demo app
│   ├── src/main.ts       # Demo entry point
│   ├── index.html        # Demo HTML
│   └── package.json      # Demo dependencies
└── docs/                 # Zettelkasten documentation
```

## Encryption Algorithms

| Type | Enum Value | Key Requirement |
|------|------------|-----------------|
| AES-128-CBC | 0 | Exactly 16 chars |
| Base64 | 1 | None |
| ROT13 | 2 | None |
| XOR | 3 | Any non-empty string |
| Caesar | 4 | Number 1-25 |

## Build Commands

```bash
# Build WASM (from root)
npm run build

# Link local package to demo (for testing)
npm link
cd demo && npm link @guinetik/crypto-wasm

# Publish to npm
npm version patch
npm publish
```

## When Updating Algorithms

Must update ALL these files:
1. `src/crypto.rs` - Rust implementation
2. `src/main.rs` - CLI support
3. `js/crypto_wasm.ts` - TypeScript types
4. `js/crypto_wasm.js` - JS wrapper docs
5. `js/crypto_wasm.d.ts` - Type definitions
6. `demo/src/main.ts` - Demo UI logic
7. `demo/index.html` - Demo dropdown options
8. `docs/` - Documentation

## Testing Changes

After making changes:
1. Run `npm run build` in root
2. User runs `npm run dev` in demo folder
3. User tests in browser
