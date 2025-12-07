<#
    This PowerShell script automates the process of building, testing, and packaging
    a WebAssembly module written in Rust. It is temporary and intended for local use
    only until a more robust solution is integrated into the CI pipeline.

    Author: Guinetik <guinetik@gmail.com>
#>

# Helper function to display highlighted messages
function Write-PopLog {
    param (
        [string]$Message,
        [string]$Color = "Yellow"
    )
    Write-Host ("`n========== {0} ==========" -f $Message) -ForegroundColor $Color
}

# **Step 1: Run cargo tests to ensure everything is working correctly**
Write-PopLog "Running tests with cargo..." -Color "Green"
cargo test
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Tests failed! Aborting the build process." -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 1.5
Write-Host "`n✅ All tests passed successfully." -ForegroundColor Green

# **Step 2: TypeScript type checking**
Write-PopLog "Running TypeScript type check..." -Color "Cyan"
if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ TypeScript type check failed! Aborting." -ForegroundColor Red
        exit 1
    }
    Write-Host "`n✅ TypeScript type check passed successfully." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ npx not found, skipping TypeScript type check." -ForegroundColor Yellow
}
Start-Sleep -Seconds 1.5

# **Step 3: Build the WebAssembly module using wasm-pack**
Write-PopLog "Building WebAssembly with wasm-pack..." -Color "Cyan"
wasm-pack build --target web --out-dir build/crypto_wasm
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to execute wasm-pack build! Aborting." -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 1.5
Write-Host "`n✅ WebAssembly build completed successfully." -ForegroundColor Green

# **Step 4: Minify the generated JavaScript file using terser**
Write-PopLog "Minifying generated JavaScript file with terser..." -Color "Yellow"
terser build/crypto_wasm/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.lib.min.js --compress --mangle -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to minify with terser! Aborting." -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 1.5
Write-Host "`n✅ JavaScript minification completed successfully." -ForegroundColor Green

# **Step 5: Minify the custom JavaScript interface file**
Write-PopLog "Minifying custom JavaScript interface file..." -Color "Magenta"
terser js/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.min.js --compress --mangle
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to minify crypto_wasm.js with terser! Aborting." -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 1.5
Write-Host "`n✅ Custom JavaScript minification completed successfully." -ForegroundColor Green

# **Step 6: Prepare the final package for distribution**
Write-PopLog "Preparing the distribution package..." -Color "Blue"
if (-Not (Test-Path -Path dist)) {
    New-Item -ItemType Directory -Path dist | Out-Null
}
if (-Not (Test-Path -Path dist/crypto_wasm)) {
    New-Item -ItemType Directory -Path dist/crypto_wasm | Out-Null
}
Start-Sleep -Seconds 1.5

Copy-Item build/crypto_wasm/crypto_wasm.lib.min.js dist/crypto_wasm/crypto_wasm.lib.min.js -Force
Copy-Item build/crypto_wasm/crypto_wasm_bg.wasm dist/crypto_wasm/crypto_wasm_bg.wasm -Force
Copy-Item build/crypto_wasm/crypto_wasm.min.js dist/crypto_wasm/crypto_wasm.min.js -Force

# **Step 7: Copy TypeScript declaration files to dist**
Write-PopLog "Copying TypeScript declaration files..." -Color "Blue"
Copy-Item js/crypto_wasm.d.ts dist/crypto_wasm/crypto_wasm.d.ts -Force
Write-Host "`n✅ TypeScript declaration files copied." -ForegroundColor Green

Write-Host "`n🚀 Build completed successfully. Package is ready in 'dist/crypto_wasm'." -ForegroundColor Green
