from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
build=root/'android/build'
with zipfile.ZipFile(build/'unsigned.apk','a',compression=zipfile.ZIP_DEFLATED,compresslevel=3) as archive:
    archive.write(build/'dex/classes.dex','classes.dex')
    for file in (build/'assets').rglob('*'):
        if file.is_file(): archive.write(file,file.relative_to(build).as_posix())
with zipfile.ZipFile(build/'unsigned.apk') as archive:
    assert archive.testzip() is None
    assert not any('\\' in name for name in archive.namelist())
print('APK assets assembled with UTF-8 paths and CRC verified',flush=True)
