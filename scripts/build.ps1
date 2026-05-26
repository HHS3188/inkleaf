$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== HMark Build ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

. (Join-Path $PSScriptRoot "bootstrap-env.ps1")
Initialize-HMarkEnv -ProjectRoot $ProjectRoot

Write-Host "Running pnpm build..." -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) { throw "pnpm build failed" }

Write-Host "=== Build complete ===" -ForegroundColor Green
Write-Host "Artifacts: $ProjectRoot\src-tauri\target\release\" -ForegroundColor DarkGray
