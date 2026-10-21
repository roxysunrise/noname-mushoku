param([Parameter(Mandatory=$true)][string]$JobFile, [switch]$TestMode)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$job = Get-Content -LiteralPath $JobFile -Raw -Encoding UTF8 | ConvertFrom-Json
$work = Split-Path -Parent ([IO.Path]::GetFullPath($JobFile))
$targetRoot = [IO.Path]::GetFullPath($job.appRoot).TrimEnd('\')
$stage = Join-Path $work ('stage-' + [guid]::NewGuid().ToString('N'))
$backup = Join-Path $work ('backup-' + [guid]::NewGuid().ToString('N'))
$changed = [Collections.Generic.List[object]]::new()
$success = $false
function File-Hash([string]$file) {
    $stream = [IO.File]::OpenRead($file)
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','') }
    finally { $stream.Dispose(); $algorithm.Dispose() }
}
function Safe-Path([string]$root, [string]$relative) {
    if (!$relative -or $relative.Contains('\') -or [IO.Path]::IsPathRooted($relative) -or $relative.Contains(':') -or ($relative.Split('/') | Where-Object { $_ -in @('..','.','') -or $_ -match '[. ]$' -or $_ -match '^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])($|\.)' })) { throw "Unsafe update path: $relative" }
    $full = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (!$full.StartsWith($root.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Update path leaves target' }
    $cursor = Split-Path -Parent $full
    while ($cursor -and $cursor.Length -ge $root.Length) {
        if ((Test-Path -LiteralPath $cursor) -and ((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Update path contains a link' }
        $cursor = Split-Path -Parent $cursor
    }
    if ((Test-Path -LiteralPath $full) -and ((Get-Item -LiteralPath $full -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Update target is a link' }
    return $full
}
try {
    if (!$TestMode) {
        $running = Get-Process -Id $job.pid -ErrorAction SilentlyContinue
        if ($running) { $running | Wait-Process -Timeout 90 }
    }
    if (!(Test-Path -LiteralPath (Join-Path $targetRoot 'package.json'))) { throw 'Game directory missing' }
    if ((File-Hash $job.archive) -ne $job.sha256) { throw 'Archive checksum mismatch' }
    New-Item -ItemType Directory -Path $stage,$backup | Out-Null
    $archive = [IO.Compression.ZipFile]::OpenRead($job.archive)
    try {
        $names = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
        foreach ($entry in $archive.Entries) {
            if (!$names.Add($entry.FullName)) { throw 'Duplicate archive entry' }
            $destination = Safe-Path $stage $entry.FullName
            if ($entry.Length -gt 200MB) { throw 'Archive entry too large' }
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination)
        }
    } finally { $archive.Dispose() }
    $manifest = Get-Content -LiteralPath (Join-Path $stage 'payload.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.version -ne $job.version -or @($manifest.files).Count -eq 0) { throw 'Payload version mismatch' }
    $unique = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($item in $manifest.files) {
        if (!$unique.Add($item.path) -or $item.path -eq 'payload.json') { throw 'Duplicate payload path' }
        $source = Safe-Path $stage $item.path
        $destination = Safe-Path $targetRoot $item.path
        if ((File-Hash $source) -ne $item.sha256) { throw "File checksum mismatch: $($item.path)" }
    }
    $version = Get-Content -LiteralPath (Join-Path $stage 'updater/version.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($version.version -ne $job.version -or !$unique.Contains('updater/version.json')) { throw 'Version marker missing' }
    # Commit the version marker last. Roll back every touched file if any copy fails.
    $ordered = @($manifest.files | Where-Object path -ne 'updater/version.json') + @($manifest.files | Where-Object path -eq 'updater/version.json')
    foreach ($item in $ordered) {
        $destination = Safe-Path $targetRoot $item.path
        $saved = Safe-Path $backup $item.path
        $existed = Test-Path -LiteralPath $destination
        if ($existed) {
            if ((Get-Item -LiteralPath $destination).PSIsContainer) { throw 'Target is a directory' }
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $saved) | Out-Null
            Copy-Item -LiteralPath $destination -Destination $saved
        }
        $changed.Add([pscustomobject]@{ path=$item.path; existed=$existed })
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
        Copy-Item -LiteralPath (Safe-Path $stage $item.path) -Destination $destination -Force
        if ((File-Hash $destination) -ne $item.sha256) { throw 'Installed file checksum mismatch' }
    }
    $success = $true
    @{success=$true;version=$job.version;backup=$backup} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $work 'result.json') -Encoding UTF8
} catch {
    $reason = $_.Exception.Message
    $rollbackErrors = @()
    for ($i=$changed.Count-1; $i -ge 0; $i--) {
        try {
            $item = $changed[$i]
            $destination = Safe-Path $targetRoot $item.path
            if ($item.existed) { Copy-Item -LiteralPath (Safe-Path $backup $item.path) -Destination $destination -Force }
            elseif (Test-Path -LiteralPath $destination -PathType Leaf) { Remove-Item -LiteralPath $destination -Force }
        } catch { $rollbackErrors += $_.Exception.Message }
    }
    @{success=$false;error=$reason;rollbackErrors=$rollbackErrors;backup=$backup} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $work 'result.json') -Encoding UTF8
} finally {
    # Backups and staging remain in the update directory for recovery and inspection.
    if (!$TestMode) { Start-Process -FilePath $job.executable -WindowStyle Hidden }
}
if (!$success) { exit 1 }
