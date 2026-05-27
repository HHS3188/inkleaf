$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== HMark Check ===" -ForegroundColor Cyan

Write-Host "`n--- typecheck ---" -ForegroundColor Cyan
pnpm typecheck
if ($LASTEXITCODE -ne 0) { throw "typecheck failed" }

Write-Host "`n--- lint ---" -ForegroundColor Cyan
pnpm lint
if ($LASTEXITCODE -ne 0) { throw "lint failed" }

Write-Host "`n--- test ---" -ForegroundColor Cyan
pnpm test
if ($LASTEXITCODE -ne 0) { throw "test failed" }

Write-Host "`n--- vite:build ---" -ForegroundColor Cyan
pnpm vite:build
if ($LASTEXITCODE -ne 0) { throw "vite build failed" }

Write-Host "`n=== All checks passed ===" -ForegroundColor Green
