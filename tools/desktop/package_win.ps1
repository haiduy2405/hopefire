# Build the Windows desktop (Steam) version of HOPEFIRE.
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File tools\desktop\package_win.ps1
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$ver  = (Get-Content "$root\version.json" | ConvertFrom-Json).version
$ev   = '45.3.4'                                   # Electron version
$cache= "$root\build\cache"; $out = "$root\build\HOPEFIRE"
New-Item -ItemType Directory -Force $cache | Out-Null
$zip = "$cache\electron-v$ev-win32-x64.zip"
if (!(Test-Path $zip)) { Write-Host "Downloading Electron $ev..."; Invoke-WebRequest "https://github.com/electron/electron/releases/download/v$ev/electron-v$ev-win32-x64.zip" -OutFile $zip }
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
Expand-Archive $zip $out
Rename-Item "$out\electron.exe" 'HOPEFIRE.exe'
Remove-Item "$out\resources\default_app.asar" -ErrorAction SilentlyContinue
$app = "$out\resources\app"; New-Item -ItemType Directory -Force "$app\assets" | Out-Null
Copy-Item "$root\index.html","$root\version.json" $app
Copy-Item "$root\css","$root\src" $app -Recurse
Copy-Item "$root\assets\sprites.png","$root\assets\sprites.js","$root\assets\sprites.json" "$app\assets"
foreach ($d in "ui","vo","music","lang") { if (Test-Path "$root\assets\$d") { Copy-Item "$root\assets\$d" "$app\assets" -Recurse -Force } }
Copy-Item "$PSScriptRoot\main.js","$PSScriptRoot\preload.js","$PSScriptRoot\package.json","$PSScriptRoot\icon.png" $app
# icon + version info (needs Node.js)
if (Get-Command node -ErrorAction SilentlyContinue) {
  Push-Location "$cache"; if (!(Test-Path "$cache\node_modules\resedit")) { npm init -y | Out-Null; npm i resedit@2 pe-library@1 --silent | Out-Null }
  Copy-Item "$PSScriptRoot\seticon.mjs" $cache -Force; node "$cache\seticon.mjs" "$out\HOPEFIRE.exe" "$PSScriptRoot\icon.ico"; Pop-Location
} else { Write-Host 'Node.js not found: exe keeps the default icon.' }
Compress-Archive -Path $out -DestinationPath "$root\build\HOPEFIRE-v$ver-win64.zip" -Force
Write-Host "Done: $out\HOPEFIRE.exe  and  build\HOPEFIRE-v$ver-win64.zip"
