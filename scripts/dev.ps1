$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== HMark Dev ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

. (Join-Path $PSScriptRoot "bootstrap-env.ps1")
Initialize-HMarkEnv -ProjectRoot $ProjectRoot

Write-Host "Starting pnpm dev..." -ForegroundColor Cyan
pnpm dev
