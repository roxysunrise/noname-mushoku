$ErrorActionPreference = 'Stop'
$appRoot = Join-Path $PSScriptRoot 'game/resources/app'
$wsTarget = Join-Path $appRoot 'node_modules/ws'
if (-not (Test-Path -LiteralPath (Join-Path $wsTarget 'package.json'))) {
    $onlineRuntime = Join-Path $PSScriptRoot 'tools/online-runtime'
    & npm ci --prefix $onlineRuntime --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw 'Failed to install WebSocket runtime' }
    New-Item -ItemType Directory -Force -Path (Join-Path $appRoot 'node_modules') | Out-Null
    Copy-Item -LiteralPath (Join-Path $onlineRuntime 'node_modules/ws') -Destination $wsTarget -Recurse
}
foreach ($packName in @('mushoku', 'minecraft', 'ai')) {
    & npx --yes esbuild (Join-Path $appRoot "src/character/$packName/index.js") --bundle --format=esm --external:noname "--outfile=$(Join-Path $appRoot "character/$packName.js")"
    if ($LASTEXITCODE -ne 0) { throw "Failed to build $packName" }
}
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-characters.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-characters.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-online.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-online.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-online-modes.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-online-modes.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-rosters.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-rosters.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'noname/init/mushoku-compatibility.js') -Destination (Join-Path $appRoot 'src/noname/init/mushoku-compatibility.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-boss.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-boss.js')
Copy-Item -LiteralPath (Join-Path $appRoot 'src/noname/init/mushoku-alucard.js') -Destination (Join-Path $appRoot 'noname/init/mushoku-alucard.js')
