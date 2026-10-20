param([Parameter(Mandatory=$true)][string]$AppRoot, [switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$AppRoot = (Resolve-Path -LiteralPath $AppRoot).Path
& (Join-Path $PSScriptRoot 'disable-music.ps1') -AppRoot $AppRoot -CheckOnly
$payload = Join-Path $PSScriptRoot 'game/resources/app'
$utf8 = [Text.UTF8Encoding]::new($false)
$calls = @(
    @('noname/init/index.js', 'prepareMushokuMode(lib.imported.mode[lib.config.mode], lib, get'),
    @('noname/init/loading.js', 'prepareMushokuMode(mode, lib, get'),
    @('noname/game/index.js', 'prepareMushokuMode(content, lib, get'),
    @('src/noname/init/index.ts', 'prepareMushokuMode(lib.imported.mode[lib.config.mode], lib, get'),
    @('src/noname/init/loading.ts', 'prepareMushokuMode(mode, lib, get'),
    @('src/noname/game/index.js', 'prepareMushokuMode(content, lib, get')
)
$edits = @{}
foreach ($entry in $calls) {
    $file = Join-Path $AppRoot $entry[0]
    if (!(Test-Path -LiteralPath $file)) { throw "Unsupported extracted layout: missing $file" }
    $text = [IO.File]::ReadAllText($file)
    $before = $entry[1] + ')'
    $after = $entry[1] + ', game)'
    if ($text.Contains($before)) { $edits[$entry[0]] = $text.Replace($before, $after) }
    elseif (!$text.Contains($after)) { throw "Unsupported loader: $file" }
}
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
foreach ($item in $manifest) {
    $source = Join-Path $payload $item.path
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $item.sha256) { throw "Payload checksum mismatch: $($item.path)" }
}
if ($CheckOnly) { Write-Output "Preflight passed: $($manifest.Count) payload files, $($edits.Count) loader changes needed."; return }
$backup = Join-Path (Split-Path $AppRoot) ('noname-customization-backup-' + [guid]::NewGuid().ToString('N'))
foreach ($relative in (@($manifest.path) + @($edits.Keys) | Select-Object -Unique)) {
    $target = Join-Path $AppRoot $relative
    if (Test-Path -LiteralPath $target) {
        $saved = Join-Path $backup $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $saved) | Out-Null
        Copy-Item -LiteralPath $target -Destination $saved
    }
}
foreach ($item in $manifest) {
    $target = Join-Path $AppRoot $item.path
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath (Join-Path $payload $item.path) -Destination $target
}
foreach ($relative in $edits.Keys) { [IO.File]::WriteAllText((Join-Path $AppRoot $relative), $edits[$relative], $utf8) }
foreach ($item in $manifest) {
    if ((Get-FileHash -LiteralPath (Join-Path $AppRoot $item.path) -Algorithm SHA256).Hash -ne $item.sha256) { throw "Installed checksum mismatch: $($item.path)" }
}
& (Join-Path $PSScriptRoot 'disable-music.ps1') -AppRoot $AppRoot
Write-Output "Installed custom roster and Boss update. Existing files backed up to: $backup"
