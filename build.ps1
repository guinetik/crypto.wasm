<#
    Este script PowerShell automatiza o processo de build, teste e empacotamento
    de um módulo WebAssembly gerado em Rust. Ele é temporário e destinado apenas 
    para uso local até que uma solução mais robusta seja integrada ao CI.

    Autor: Guinetik <guinetik@gmail.com>
#>

# Função auxiliar para mensagens destacadas
function Write-PopLog {
    param (
        [string]$Message,
        [string]$Color = "Yellow"
    )
    Write-Host ("`n==================== {0} ====================" -f $Message) -ForegroundColor $Color
}

# Etapa 1: Executar os testes do cargo para garantir que tudo está funcionando corretamente
Write-PopLog "Executando testes com cargo..." -Color "Green"
cargo test
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Testes falharam! Abortando o processo de build." -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Todos os testes passaram com sucesso." -ForegroundColor Green

# Etapa 2: Construir o módulo WebAssembly com wasm-pack
Write-PopLog "Construindo WebAssembly com wasm-pack..." -Color "Cyan"
wasm-pack build --target web --out-dir build/crypto_wasm
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Falha ao executar wasm-pack build! Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Construção do WebAssembly concluída com sucesso." -ForegroundColor Green

# Etapa 3: Minificar o arquivo JavaScript gerado usando terser
Write-PopLog "Minificando arquivo JavaScript gerado com terser..." -Color "Yellow"
terser build/crypto_wasm/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.lib.min.js --compress --mangle -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Falha ao minificar com terser! Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Minificação do JavaScript concluída com sucesso." -ForegroundColor Green

# Etapa 4: Minificar o arquivo de interface JS customizado
Write-PopLog "Minificando arquivo de interface JavaScript personalizado..." -Color "Magenta"
terser js/crypto_wasm.js -o build/crypto_wasm/crypto_wasm.min.js --compress --mangle
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Falha ao minificar crypto_wasm.js com terser! Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Minificação do JS personalizado concluída com sucesso." -ForegroundColor Green

# Etapa 5: Preparar o pacote final para distribuição
Write-PopLog "Preparando o pacote de distribuição..." -Color "Blue"
if (-Not (Test-Path -Path dist)) {
    New-Item -ItemType Directory -Path dist | Out-Null
}
if (-Not (Test-Path -Path dist/crypto_wasm)) {
    New-Item -ItemType Directory -Path dist/crypto_wasm | Out-Null
}

Copy-Item build/crypto_wasm/crypto_wasm.lib.min.js dist/crypto_wasm/crypto_wasm.lib.min.js -Force
Copy-Item build/crypto_wasm/crypto_wasm_bg.wasm dist/crypto_wasm/crypto_wasm_bg.wasm -Force
Copy-Item build/crypto_wasm/crypto_wasm.min.js dist/crypto_wasm/crypto_wasm.min.js -Force

Write-Host "`n🚀 Build concluído com sucesso. Pacote pronto em 'dist/crypto_wasm'." -ForegroundColor Green
