$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== InkLeaf Electron Build ===" -ForegroundColor Cyan

pnpm build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host "`n=== Build complete ===" -ForegroundColor Green
Write-Host "Artifacts: $ProjectRoot\release\" -ForegroundColor DarkGray
