param([switch]$Apply, [switch]$DeferRunning)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot))
$project = [IO.Path]::GetFullPath((Split-Path $root))
$archiveBase = [IO.Path]::GetFullPath('D:/Codex/Archive')
$archive = Join-Path $archiveBase ('noname-history-20261021-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
$recordPath = Join-Path $root 'docs/整理记录.json'
$previous = if (Test-Path -LiteralPath $recordPath) { Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json } else { $null }
if ($previous -and $previous.status -eq 'waiting_for_game_exit') { $archive = $previous.archive }
$moves = [Collections.Generic.List[object]]::new()
function Add-Move([string]$Source, [string]$RelativeDestination) {
    if (Test-Path -LiteralPath $Source) {
        $resolved = [IO.Path]::GetFullPath($Source)
        if (-not $resolved.StartsWith($project + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Source is outside this project: $resolved"
        }
        $moves.Add([pscustomobject]@{ source = $resolved; destination = (Join-Path $archive $RelativeDestination) })
    }
}
foreach ($name in @('game-old-incomplete', 'game-1.11.7-portraits-fixed', 'asset-staging', 'compatibility-report', 'reference', 'releases')) {
    Add-Move (Join-Path $root $name) "noname/$name"
}
Add-Move (Join-Path $root 'android/build') 'noname/android-build'
Add-Move (Join-Path $root 'tools/online-test-profile') 'noname/online-test-profile'
foreach ($entry in Get-ChildItem -LiteralPath $root -File) {
    if ($entry.Extension -in @('.png', '.log', '.lnk')) { Add-Move $entry.FullName ('noname/preview/' + $entry.Name) }
}
foreach ($entry in Get-ChildItem -LiteralPath (Join-Path $root 'tools') -Filter '*.log' -File) {
    Add-Move $entry.FullName ('noname/preview/' + $entry.Name)
}
foreach ($entry in Get-ChildItem -LiteralPath (Join-Path $root 'game/resources') -Directory -Filter '*backup*') {
    Add-Move $entry.FullName ('noname/runtime-backups/' + $entry.Name)
}
foreach ($entry in Get-ChildItem -LiteralPath (Join-Path $project 'releases') -Force) {
    if ($entry.Name -like 'noname*') { Add-Move $entry.FullName ('root-releases/' + $entry.Name) }
}
if (-not $Apply) {
    [pscustomobject]@{ archive = $archive; moves = $moves; mode = 'preview' } | ConvertTo-Json -Depth 5
    exit 0
}
$running = @(Get-CimInstance Win32_Process -Filter "name='noname.exe'" | Where-Object {
    $_.ExecutablePath -and $_.ExecutablePath.StartsWith($project + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
})
if ($running.Count -and -not $DeferRunning) { throw 'Please exit the running Noname game normally before applying the reorganization.' }
if (-not (Test-Path -LiteralPath (Join-Path $root 'game/noname.exe'))) { throw 'Canonical game/noname.exe is missing.' }
New-Item -ItemType Directory -Path $archive -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path $recordPath) -Force | Out-Null
$record = [ordered]@{ date = '2026-10-21'; canonical = (Join-Path $root 'game'); archive = $archive; status = 'in_progress'; moves = @(); deferred = @() }
if ($previous -and $previous.archive -eq $archive) { $record.moves = @($previous.moves) }
$record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $recordPath -Encoding utf8
foreach ($move in $moves) {
    if (@($running | Where-Object { $_.ExecutablePath.StartsWith($move.source + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) }).Count) {
        $record.deferred += $move
        Write-Output "Deferred until game exits: $($move.source)"
        continue
    }
    $destination = [IO.Path]::GetFullPath($move.destination)
    if (-not $destination.StartsWith($archiveBase + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Archive target escaped allowed directory: $destination"
    }
    if (Test-Path -LiteralPath $destination) { throw "Archive target already exists: $destination" }
    New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
    Move-Item -LiteralPath $move.source -Destination $destination
    if ((Test-Path -LiteralPath $move.source) -or -not (Test-Path -LiteralPath $destination)) { throw "Move verification failed: $($move.source)" }
    $record.moves += $move
    $record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $recordPath -Encoding utf8
    Write-Output "Archived: $($move.source)"
}
$record.status = if ($record.deferred.Count) { 'waiting_for_game_exit' } else { 'completed' }
$record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $recordPath -Encoding utf8
Copy-Item -LiteralPath $recordPath -Destination (Join-Path $archive 'organization-record.json')
Write-Output "Canonical runtime: $(Join-Path $root 'game')"
Write-Output "Recoverable archive: $archive"
