function Initialize-HMarkEnv {
  param([string]$ProjectRoot)

  # --- VS/MSVC: use temp batch file to capture env ---
  $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
  if (-not (Test-Path $vswhere)) {
    $vswhere = "C:\Program Files\Microsoft Visual Studio\Installer\vswhere.exe"
  }

  $vsPath = & "$vswhere" -latest -property installationPath
  if (-not $vsPath) { throw "Visual Studio / Build Tools not found. Install Visual Studio 2022 Build Tools." }

  $vsDevCmd = Join-Path $vsPath "Common7\Tools\VsDevCmd.bat"
  if (-not (Test-Path $vsDevCmd)) { throw "VsDevCmd.bat not found at $vsDevCmd" }

  Write-Host "  VS: $vsDevCmd" -ForegroundColor DarkGray

  # Create temp batch: call VsDevCmd then dump env
  $tmp = [System.IO.Path]::GetTempFileName() + ".bat"
  try {
    @"
call "$vsDevCmd" -arch=x64 -host_arch=x64 > nul 2>&1
set
"@ | Set-Content -Path $tmp -Encoding ASCII

    # Run and parse env vars
    cmd /c $tmp | ForEach-Object {
      if ($_ -match '^(.*?)=(.*)$') {
        Set-Item -Path "env:$($matches[1])" -Value $matches[2] -ErrorAction SilentlyContinue
      }
    }
  } finally {
    Remove-Item -Path $tmp -ErrorAction SilentlyContinue
  }

  # --- Cargo/Rust ---
  $env:RUSTUP_HOME = Join-Path $ProjectRoot ".tools\rustup"
  $env:CARGO_HOME   = Join-Path $ProjectRoot ".tools\cargo"
  $env:PATH = "$env:CARGO_HOME\bin;$env:PATH"

  Write-Host "  RUSTUP_HOME: $env:RUSTUP_HOME" -ForegroundColor DarkGray
  Write-Host "  CARGO_HOME:  $env:CARGO_HOME" -ForegroundColor DarkGray

  # --- Verify toolchain ---
  $tools = @(
    @{ Name = "cargo"; Exe = (Get-Command "cargo" -ErrorAction SilentlyContinue).Source }
    @{ Name = "link";  Exe = (Get-Command "link" -ErrorAction SilentlyContinue).Source }
    @{ Name = "cl";    Exe = (Get-Command "cl" -ErrorAction SilentlyContinue).Source }
    @{ Name = "rc";    Exe = (Get-Command "rc" -ErrorAction SilentlyContinue).Source }
  )

  $allOk = $true
  foreach ($t in $tools) {
    if ($t.Exe) {
      Write-Host "  [OK] $($t.Name): $($t.Exe)" -ForegroundColor Green
    } else {
      Write-Host "  [MISSING] $($t.Name)" -ForegroundColor Red
      $allOk = $false
    }
  }

  if (-not $allOk) { throw "Toolchain incomplete. Check VS / Windows SDK installation." }
}
