$ErrorActionPreference = 'Stop'

# 定位项目根目录
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== HMark Build ===" -ForegroundColor Cyan
Write-Host "项目根目录: $ProjectRoot" -ForegroundColor Gray

# --- VS/MSVC 环境 ---
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (-not (Test-Path $vswhere)) {
  $vswhere = "C:\Program Files\Microsoft Visual Studio\Installer\vswhere.exe"
}

$vsPath = & "$vswhere" -latest -property installationPath
if (-not $vsPath) {
  Write-Host "错误：未找到 Visual Studio / Build Tools。" -ForegroundColor Red
  exit 1
}

$vsDevCmd = Join-Path $vsPath "Common7\Tools\VsDevCmd.bat"
if (-not (Test-Path $vsDevCmd)) {
  Write-Host "错误：未找到 VsDevCmd.bat at $vsDevCmd" -ForegroundColor Red
  exit 1
}

Write-Host "导入 VS 环境..." -ForegroundColor Gray
cmd /c "`"$vsDevCmd`" -arch=x64 -host_arch=x64 && set" | ForEach-Object {
  if ($_ -match '^(\w+)=(.*)') {
    Set-Item -Path "env:$($matches[1])" -Value $matches[2] -ErrorAction SilentlyContinue
  }
}

# --- Cargo/Rust 环境 ---
$env:RUSTUP_HOME = Join-Path $ProjectRoot ".tools\rustup"
$env:CARGO_HOME = Join-Path $ProjectRoot ".tools\cargo"
$env:PATH = "$env:CARGO_HOME\bin;$env:PATH"

# --- 验证工具链 ---
$tools = @(
  @{ Name = "cargo"; Exe = (Get-Command "cargo" -ErrorAction SilentlyContinue).Source }
  @{ Name = "link";  Exe = (Get-Command "link" -ErrorAction SilentlyContinue).Source }
  @{ Name = "cl";    Exe = (Get-Command "cl" -ErrorAction SilentlyContinue).Source }
  @{ Name = "rc";    Exe = (Get-Command "rc" -ErrorAction SilentlyContinue).Source }
)

$allOk = $true
foreach ($tool in $tools) {
  if ($tool.Exe) {
    Write-Host "  [✓] $($tool.Name): $($tool.Exe)" -ForegroundColor Green
  } else {
    Write-Host "  [✗] $($tool.Name): 未找到" -ForegroundColor Red
    $allOk = $false
  }
}

if (-not $allOk) {
  Write-Host "错误：工具链不完整。" -ForegroundColor Red
  exit 1
}

Write-Host "`n运行 pnpm build..." -ForegroundColor Cyan
pnpm build
if ($LASTEXITCODE -ne 0) {
  Write-Host "pnpm build 失败" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 构建完成 ===" -ForegroundColor Green
Write-Host "产物位置: $ProjectRoot\src-tauri\target\release\" -ForegroundColor Gray
