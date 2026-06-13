@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%open-local.ps1"

if errorlevel 1 (
  echo.
  echo Uygulama baslatilamadi. Yukaridaki mesaji kontrol edin.
  pause
)
