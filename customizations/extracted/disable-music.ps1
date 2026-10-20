param([Parameter(Mandatory=$true)][string]$AppRoot, [switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$AppRoot = (Resolve-Path -LiteralPath $AppRoot).Path
$utf8 = [Text.UTF8Encoding]::new($false)
$updates = @{}
$replacement = @'
playBackgroundMusic() {
    // Background music removed in this distribution; keep card and voice audio.
    if (lib.config.background_music !== "music_off") game.saveConfig("background_music", "music_off");
    const music = ui.backgroundMusic;
    if (music) {
      music.pause();
      if (music.hasAttribute("src")) {
        music.removeAttribute("src");
        music.load();
      }
    }
  }
  // 某种意义上
'@
foreach ($relative in @('noname/game/index.js', 'src/noname/game/index.js')) {
    $text = [IO.File]::ReadAllText((Join-Path $AppRoot $relative))
    $pattern = '(?s)playBackgroundMusic\(\)\s*\{.*?\r?\n[ \t]*// 某种意义上'
    if ([regex]::Matches($text, $pattern).Count -ne 1) { throw "Unsupported music entry: $relative" }
    $updates[$relative] = [regex]::Replace($text, $pattern, $replacement)
}
$configPath = Join-Path $AppRoot 'game/config.json'
$config = [IO.File]::ReadAllText($configPath)
if (![regex]::IsMatch($config, '"background_music"\s*:\s*"[^"]*"')) { throw 'Missing default music setting' }
$updates['game/config.json'] = [regex]::Replace($config, '("background_music"\s*:\s*)"[^"]*"', '${1}"music_off"')
$audioPath = [IO.Path]::GetFullPath((Join-Path $AppRoot 'audio/background'))
if (!$audioPath.StartsWith($AppRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Audio directory outside game root' }
$files = @(Get-ChildItem -LiteralPath $audioPath -File -Recurse -ErrorAction SilentlyContinue)
if ($CheckOnly) { Write-Output "Music preflight: $($files.Count) tracks, runtime/source/default setting verified."; return }
$backup = Join-Path (Split-Path $AppRoot) ('noname-music-backup-' + [guid]::NewGuid().ToString('N'))
foreach ($relative in $updates.Keys) {
    $saved = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $saved) | Out-Null
    Copy-Item -LiteralPath (Join-Path $AppRoot $relative) -Destination $saved
    [IO.File]::WriteAllText((Join-Path $AppRoot $relative), $updates[$relative], $utf8)
}
if ($files.Count) {
    Move-Item -LiteralPath $audioPath -Destination (Join-Path $backup 'background')
    New-Item -ItemType Directory -Force -Path $audioPath | Out-Null
}
Write-Output "Removed $($files.Count) music tracks from game; backup: $backup"
