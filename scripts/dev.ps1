$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== HMark Electron Dev ===" -ForegroundColor Cyan
Write-Host "Starting Vite + Electron..." -ForegroundColor Cyan

pnpm dev
