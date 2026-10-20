"""Package the customized Windows runtime and verify the resulting archive."""
from pathlib import Path
import hashlib
import json
import zipfile

project = Path(__file__).resolve().parents[1]
runtime = project / 'game'
destination = project / 'releases/noname-custom-20261020-windows.zip'
prefix = '无名杀联机版/'
files = sorted(p for p in runtime.rglob('*') if p.is_file()
               and not any('backup' in part.lower() or part == '__pycache__'
                           for part in p.relative_to(runtime).parts))
destination.parent.mkdir(parents=True, exist_ok=True)
readme = '''无名杀定制联机版（Windows）

请先完整解压，再运行本文件夹中的 noname.exe。无需安装 Node.js 或 Python。
房主：联机 → 启动服务器，创建标准身份房间，设置2—8个总席位，可独自开始。
加入者：使用同一份定制版，在联机地址中输入房主局域网IP:8080。
人数不足由AI补位；中途加入者依次接替存活AI，继承原角色状态。
断线后AI接管；重新连接可恢复尚未被其他玩家接替的原席位。
房主须保持游戏运行，防火墙需允许连接。
Sakura TCP隧道：frp-use.com:50723 → 127.0.0.1:8080。
手机和电脑加入者均填写 frp-use.com:50723，使用同版角色包。
Boss挑战目前仅支持单机，不支持在标准身份联机房间中选择Boss。

完整说明：resources/app/docs/online-ai-room.md
跨设备网络及Sakura公网连接尚未验证，请以本次完整性报告为准。
'''
with zipfile.ZipFile(destination, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
    archive.writestr(prefix + '使用说明.txt', readme.encode('utf-8-sig'))
    for index, path in enumerate(files, 1):
        archive.write(path, prefix + path.relative_to(runtime).as_posix())
        if index % 3000 == 0:
            print(f'Packaged {index}/{len(files)} files', flush=True)

with zipfile.ZipFile(destination) as archive:
    assert len(archive.infolist()) == len(files) + 1
    assert archive.testzip() is None, 'Archive CRC verification failed'
    for relative in ['noname.exe', 'resources/app/character/mushoku.js',
                     'resources/app/character/minecraft.js',
                     'resources/app/noname/init/mushoku-online.js',
                     'resources/app/node_modules/ws/package.json',
                     'resources/app/docs/online-ai-room.md']:
        assert archive.read(prefix + relative) == (runtime / relative).read_bytes(), relative

digest = hashlib.file_digest(destination.open('rb'), 'sha256').hexdigest()
destination.with_suffix('.zip.sha256').write_text(f'{digest}  {destination.name}\n', encoding='ascii')
print(json.dumps({'archive': str(destination), 'files': len(files) + 1,
                  'bytes': destination.stat().st_size, 'sha256': digest,
                  'crc_verified': True}, ensure_ascii=False), flush=True)
