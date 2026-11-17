# Usage (PowerShell, from anywhere):
#   .\tools\bump.ps1 -Version 0.3.2 -Notes "New boss","Balance fixes"
#   .\tools\bump.ps1 -Version 0.4.0 -Notes "Save format changed" -Force   # players cannot postpone
param(
  [Parameter(Mandatory=$true)][string]$Version,
  [string[]]$Notes=@(),
  [switch]$Force
)
$root = Split-Path $PSScriptRoot -Parent
$idx = Join-Path $root 'index.html'
$html = [IO.File]::ReadAllText($idx)
$html = [regex]::Replace($html, "HF_VERSION='[^']*'", "HF_VERSION='$Version'")
[IO.File]::WriteAllText($idx, $html, (New-Object Text.UTF8Encoding $false))
$min = if ($Force) { $Version } else { '0.0.0' }
$obj = [ordered]@{ version = $Version; date = (Get-Date -Format 'yyyy-MM-dd'); minVersion = $min; notes = @($Notes) }
$json = $obj | ConvertTo-Json -Depth 3
[IO.File]::WriteAllText((Join-Path $root 'version.json'), $json, (New-Object Text.UTF8Encoding $false))
Write-Host "HOPEFIRE -> v$Version (minVersion $min). Now: git add -A; git commit -m 'v$Version'; git push"
