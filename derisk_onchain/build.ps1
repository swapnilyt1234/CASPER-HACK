$WASM_IN  = "target/wasm32-unknown-unknown/release/derisk_onchain_build_contract.wasm"
$WASM_OUT = "target/wasm32-unknown-unknown/release/derisk_onchain_build_contract_clean.wasm"

Write-Host "Building..." -ForegroundColor Cyan
cargo +nightly-2025-01-15 odra build

if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1 
}

Write-Host "Stripping bulk-memory opcodes..." -ForegroundColor Cyan
wasm-opt $WASM_IN -o $WASM_OUT --disable-bulk-memory --disable-sign-ext --disable-mutable-globals --strip-debug -O1

if ($LASTEXITCODE -ne 0) { 
    Write-Host "wasm-opt failed - binary still dirty" -ForegroundColor Red
    exit 1 
}

Write-Host "Clean binary ready: $WASM_OUT" -ForegroundColor Green