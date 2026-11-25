# Installs the mhag layout, theme and mods into Herdr (Windows).
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1   (re-run to update; only mhag files are replaced)
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$app = if ($env:HERDR_APP_HOME) { $env:HERDR_APP_HOME } else { Join-Path $HOME ".config\herdr-app" }

if (-not (Test-Path $app)) { Write-Error "No Herdr folder at $app. Start Herdr once, then run this again."; exit 1 }

Write-Host "Herdr folder: $app"
foreach ($d in "layouts", "themes", "mods") { New-Item -ItemType Directory -Force (Join-Path $app $d) | Out-Null }
Copy-Item "$src\layouts\mhag.json" "$app\layouts\" -Force
Copy-Item "$src\themes\mhag.json" "$app\themes\" -Force
$mods = Get-ChildItem "$src\mods" -Directory -Filter "mhag-*"
foreach ($m in $mods) {
  $dest = Join-Path "$app\mods" $m.Name
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  Copy-Item $m.FullName $dest -Recurse
}
Write-Host "  layout, theme and $($mods.Count) mods copied"

# The `todo` command (prints a space's todos in its terminal) and the Claude /todo commands.
$bin = Join-Path $HOME ".local\bin"
$cmds = Join-Path $HOME ".claude\commands"
New-Item -ItemType Directory -Force $bin, $cmds | Out-Null
Copy-Item "$src\bin\todo.js", "$src\bin\todo.cmd", "$src\bin\todo" $bin -Force
Copy-Item "$src\claude\commands\todo.md" $cmds -Force
Write-Host "  todo command copied to $bin, /todo to $cmds"
$path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
if (($path -split ";") -notcontains $bin) { Write-Host "  note: add $bin to your PATH to use 'todo'" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host "  note: Node.js is not installed; 'todo' and the /todo-<task> commands need it" }

if (Get-Command herdr-app -ErrorAction SilentlyContinue) {
  foreach ($m in $mods) { herdr-app check "mods/$($m.Name)" | Out-Null; if ($LASTEXITCODE) { Write-Host "  check failed: $($m.Name)" } }
  herdr-app do layout.switch '{\"name\":\"mhag\"}' | Out-Null
  if ($LASTEXITCODE) { Write-Host "Pick 'mhag' with ctrl-shift-l in Herdr." } else { Write-Host "Switched to mhag." }
} else { Write-Host "Pick 'mhag' with ctrl-shift-l in Herdr." }
