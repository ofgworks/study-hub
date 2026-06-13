param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
} catch {
  # Older PowerShell hosts may not allow changing console encoding.
}

$ProjectRoot = $PSScriptRoot
$Port = 3000
$BindHost = "127.0.0.1"
$BrowserUrl = "http://localhost:$Port"
$HealthUrl = "http://127.0.0.1:$Port/api/brain"
$ServerWindowTitle = "Study Hub Local Server"

function Write-Info($Message) {
  Write-Host "[Study Hub] $Message"
}

function Fail($Message) {
  Write-Host ""
  Write-Host "[Study Hub] Hata: $Message" -ForegroundColor Red
  Write-Host ""
  exit 1
}

function Test-CommandExists($CommandName) {
  return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Test-StudyHubReady {
  try {
    $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 500) {
      return $false
    }

    $json = $response.Content | ConvertFrom-Json
    return [bool]($json.teams -or $json.stats)
  } catch {
    return $false
  }
}

function Open-Browser {
  if ($NoOpen) {
    Write-Info "Test modu: tarayıcı açılmadı. Adres: $BrowserUrl"
    return
  }

  Start-Process $BrowserUrl
}

Set-Location -LiteralPath $ProjectRoot
Write-Info "Proje klasörü: $ProjectRoot"

if (-not (Test-CommandExists "node")) {
  Fail "Node.js bulunamadı. Önce Node.js kurulu olmalı."
}

if (-not (Test-CommandExists "npm.cmd")) {
  Fail "npm bulunamadı. Node.js kurulumunu kontrol edin."
}

$packageJson = Join-Path $ProjectRoot "package.json"
if (-not (Test-Path -LiteralPath $packageJson)) {
  Fail "package.json bulunamadı. Bu dosyayı proje klasöründen çalıştırın."
}

$nodeModules = Join-Path $ProjectRoot "node_modules"
$nextCli = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"
if (-not (Test-Path -LiteralPath $nodeModules) -or -not (Test-Path -LiteralPath $nextCli)) {
  Write-Info "Bağımlılıklar eksik görünüyor. npm install çalıştırılıyor..."
  npm.cmd install
  if ($LASTEXITCODE -ne 0) {
    Fail "Bağımlılıklar kurulamadı. İnternet bağlantısını ve npm çıktısını kontrol edin."
  }
}

if (Test-StudyHubReady) {
  Write-Info "Uygulama zaten çalışıyor. Tarayıcı açılıyor: $BrowserUrl"
  Open-Browser
  exit 0
}

$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($listeners.Count -gt 0) {
  $owner = $listeners | Select-Object -First 1 -ExpandProperty OwningProcess
  $processName = "bilinmiyor"
  try {
    $processName = (Get-Process -Id $owner -ErrorAction Stop).ProcessName
  } catch {
  }

  Fail "Port $Port başka bir uygulama tarafından kullanılıyor (PID $owner, süreç: $processName). Bu uygulamayı kapatıp tekrar deneyin."
}

Write-Info "Uygulama sadece ${BindHost}:$Port üzerinde başlatılıyor. Dış ağ erişimi açılmayacak."

$serverCommand = @"
`$Host.UI.RawUI.WindowTitle = '$ServerWindowTitle'
Set-Location -LiteralPath '$ProjectRoot'
Write-Host 'Study Hub yerel sunucusu çalışıyor: $BrowserUrl'
Write-Host 'Kapatmak için bu pencereyi kapatabilir veya Ctrl+C kullanabilirsiniz.'
npm.cmd run dev:local
Write-Host ''
Write-Host 'Sunucu durdu. Bu pencereyi kapatabilirsiniz.'
"@

Start-Process `
  -FilePath "powershell.exe" `
  -ArgumentList @("-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $serverCommand) `
  -WorkingDirectory $ProjectRoot `
  -WindowStyle Minimized

Write-Info "Sunucunun hazır olması bekleniyor..."
for ($i = 1; $i -le 30; $i++) {
  Start-Sleep -Seconds 1
  if (Test-StudyHubReady) {
    Write-Info "Hazır. Tarayıcı açılıyor: $BrowserUrl"
    Open-Browser
    exit 0
  }
}

Fail "Sunucu 30 saniye içinde hazır hale gelmedi. Minimize edilmiş '$ServerWindowTitle' penceresindeki mesajları kontrol edin."
