# Publishing Guide

This guide explains how to publish `crypto-wasm` as an npm package.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **Login to npm**: Run `npm login` in your terminal
3. **Build tools**: Ensure you have Rust, wasm-pack, and Node.js installed

## Pre-Publishing Checklist

- [ ] Update version in `package.json` (follow [semver](https://semver.org/))
- [ ] Run `npm run build` to ensure everything builds correctly
- [ ] Run `npm run typecheck` to verify TypeScript types
- [ ] Run `npm test` to ensure all tests pass
- [ ] Update `README.md` if needed
- [ ] Verify `.npmignore` excludes unnecessary files
- [ ] Check that `files` field in `package.json` includes all necessary files

## Publishing Steps

### 1. Build the Package

```bash
npm run build
```

This will:
- Build the WebAssembly module
- Minify JavaScript files
- Copy files to `dist/` directory

### 2. Verify Package Contents

Check what will be included in the package:

```bash
npm pack --dry-run
```

This shows you exactly what files will be published without actually publishing.

### 3. Test Locally (Optional)

You can test the package locally before publishing:

```bash
npm pack
npm install ./crypto-wasm-*.tgz
```

### 4. Publish to npm

For the first time or a new major version:

```bash
npm publish --access public
```

For patch/minor versions:

```bash
npm publish
```

### 5. Verify Publication

Check that your package is available:

```bash
npm view crypto-wasm
```

Or visit: https://www.npmjs.com/package/crypto-wasm

## Version Management

Use npm version commands to bump versions:

```bash
# Patch version (1.0.2 -> 1.0.3)
npm version patch

# Minor version (1.0.2 -> 1.1.0)
npm version minor

# Major version (1.0.2 -> 2.0.0)
npm version major
```

These commands will:
- Update `package.json`
- Create a git tag
- Commit the changes

Then publish:

```bash
npm publish
git push --follow-tags
```

## Package Structure

The published package includes:

```
crypto-wasm/
├── dist/
│   └── crypto_wasm/
│       ├── crypto_wasm.lib.min.js    # Minified WASM loader
│       ├── crypto_wasm_bg.wasm        # Compiled WASM module
│       ├── crypto_wasm.min.js         # Minified wrapper
│       └── crypto_wasm.d.ts           # Type definitions
├── js/
│   ├── crypto_wasm.js                 # ES module wrapper
│   ├── crypto_wasm.ts                 # TypeScript source
│   └── crypto_wasm.d.ts               # Type definitions
├── package.json
├── README.md
└── LICENSE
```

## Troubleshooting

### "Package name already exists"

If the package name is taken, you'll need to:
1. Choose a different name in `package.json`
2. Update the repository URL if needed
3. Update documentation

### "You do not have permission"

Make sure you're logged in:
```bash
npm whoami
npm login
```

### Build fails

Ensure all dependencies are installed:
```bash
npm install
```

Check that Rust and wasm-pack are installed:
```bash
rustc --version
wasm-pack --version
```

## Post-Publishing

After publishing:

1. **Create a GitHub release** with the same version tag
2. **Update documentation** if needed
3. **Announce** the release (if applicable)
4. **Monitor** for issues and feedback

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing can break other projects. Only do this in emergencies.

```bash
# Unpublish within 72 hours
npm unpublish crypto-wasm@version

# Unpublish all versions (requires npm support)
npm unpublish crypto-wasm --force
```

Consider using `npm deprecate` instead:

```bash
npm deprecate crypto-wasm@version "Use version X.X.X instead"
```

