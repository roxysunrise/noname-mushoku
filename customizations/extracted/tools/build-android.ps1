param([string]$OutputPath)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot
$project = Split-Path $root
if (!$OutputPath) { $OutputPath = Join-Path $root ('releases/noname-custom-' + (Get-Date -Format yyyyMMdd) + '-android.apk') }
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $OutputPath) { throw 'Refusing to overwrite an existing APK' }
New-Item -ItemType Directory -Force -Path (Split-Path $OutputPath) | Out-Null
$tools = 'O:/android-15'
$platform = 'O:/android-35/android.jar'
$jdk = 'C:/Program Files/Java/jdk-17'
$env:JAVA_HOME = $jdk
$env:PATH = "$jdk/bin;$env:PATH"
function Checked { param([string]$Exe,[string[]]$Arguments) & $Exe @Arguments; if($LASTEXITCODE -ne 0){throw "Failed: $Exe"} }
# aapt2 needs an ASCII path on this Windows installation.
$drive = 'N:'
if((Test-Path "$drive/") -or (Test-Path 'O:/')){throw 'Build requires unused N: and O: drives.'}
& subst O: (Join-Path $project '.android-tools')
& subst $drive $root
if($LASTEXITCODE -ne 0){throw 'Cannot map Android build directory'}
try {
    Push-Location "$drive/"
    try {
        Checked 'python' @('tools/stage-android.py')
        New-Item -ItemType Directory -Force android/build/classes,android/build/dex,releases | Out-Null
        Checked "$tools/aapt2.exe" @('compile','--dir','android/res','-o','android/build/icons.zip')
        Checked "$tools/aapt2.exe" @('link','-o','android/build/base.apk','-I',$platform,'--manifest','android/AndroidManifest.xml','android/build/icons.zip')
        Checked "$jdk/bin/javac.exe" @('-encoding','UTF-8','-source','8','-target','8','-bootclasspath',"$platform;$tools/core-lambda-stubs.jar",'-d','android/build/classes','android/src/com/roxysunrise/noname/MainActivity.java')
        $classes=@(Get-ChildItem android/build/classes -Filter '*.class' -Recurse | ForEach-Object FullName)
        Checked "$tools/d8.bat" (@('--lib',$platform,'--min-api','26','--output','android/build/dex')+$classes)
        Copy-Item -LiteralPath android/build/base.apk -Destination android/build/unsigned.apk -Force
        Checked 'python' @('tools/assemble-apk.py')
        Checked "$tools/zipalign.exe" @('-f','-p','4','android/build/unsigned.apk','android/build/aligned.apk')
        $key='android/noname-debug.keystore'
        if(!(Test-Path $key)){Checked "$jdk/bin/keytool.exe" @('-genkeypair','-keystore',$key,'-storepass','android','-keypass','android','-alias','androiddebugkey','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Noname Custom Development')}
        # Native Android archive tools cannot reliably read Chinese paths.
        $apk='android/build/signed.apk'
        Checked "$tools/apksigner.bat" @('sign','--ks',$key,'--ks-pass','pass:android','--key-pass','pass:android','--out',$apk,'android/build/aligned.apk')
        Checked "$tools/apksigner.bat" @('verify','--verbose',$apk)
        Checked "$tools/zipalign.exe" @('-c','4',$apk)
        Checked "$tools/aapt.exe" @('dump','badging',$apk)
        Copy-Item -LiteralPath $apk -Destination $OutputPath
        $apk=$OutputPath
        $hash=(Get-FileHash -LiteralPath $apk).Hash.ToLowerInvariant()
        [IO.File]::WriteAllText("$apk.sha256", "$hash  $([IO.Path]::GetFileName($apk))`n")
        Get-Item -LiteralPath $apk | Select-Object FullName,Length
    } finally { Pop-Location }
} finally { & subst $drive /D; & subst O: /D }
