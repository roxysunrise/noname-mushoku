# 无名杀定制版：当前完整项目

整理日期：2026-10-21（Asia/Shanghai）。

## 启动

双击本目录的 `启动无名杀.cmd`，或运行 `game/noname.exe`。
`game` 是唯一维护的完整 Windows 运行目录，包含 EXE、Electron 依赖、引擎、角色、图片、音效及源码。复制给朋友时请复制整个 `game` 文件夹，不能只复制 EXE。

## 目录

- `game/`：当前完整 Windows 游戏，所有后续游戏修改都在这里进行。
- `game/resources/app/src/`：游戏源码及角色源码。
- `game/resources/app/character/`、`noname/`：运行时使用的构建产物。
- `game/resources/app/image/`：游戏实际使用的图片。
- `output/imagegen/`：保留的原创素材、生成原图及提示词；本次扩展角色的原图与提示词位于其 `roster-expansion/` 子目录。
- `tools/`、`build-crossover.ps1`：构建和验证工具；Node/Python 仅在开发和重新打包时需要。
- `*.test.mjs`：角色、Boss、联机和扩展规则检查。
- `android/`：Android 端源码及本地签名资料；生成的旧 APK 和重复构建目录移至历史归档。
- `docs/`：整理清单和项目说明。

## 跨平台交付约定

后续新增玩法、界面、资源和更新能力均按 Windows 电脑端与 Android 手机端同步规划。实现时分别接入两端入口和构建流程，保持规则、版本信息和玩家可见功能一致；若某项能力受平台限制暂不能同步，必须在交付说明中明确列出差异，不把仅完成电脑端称为完整交付。

不要移除运行目录内的 `node_modules`，其中含运行必需的 WebSocket 依赖。

## 联机

房主：联机 → 启动服务器 → 标准身份，保持游戏及 Sakura 的「1111」隧道运行。

朋友在同版游戏中完整填写：

```text
wss://www.r49rldyry.nyat.app:35683
```

该地址已完成可信证书校验、WebSocket 握手及无名杀 `opened` 响应验证；尚不能据此认定朋友设备已成功入房或完整多人对局已验证。

Sakura 配置保存在房主电脑上，不随本项目复制，不包含账户密钥、证书私钥或访问令牌。

## 开发检查

在本目录运行：

```powershell
./build-crossover.ps1
node --test crossover.test.mjs online-room.test.mjs boss-roxy.test.mjs expansion.test.mjs online-modes.test.mjs online-skill-callbacks.test.mjs ai-characters.test.mjs
```

历史版本、旧压缩包、预览截图及临时测试目录移至项目外历史归档，确切路径见 `docs/整理记录.json`。不再维护多份运行目录。

## 2026-10-21 更新

普通角色共19名，分为二次元、Minecraft、AI；AI 包含 GPT、豆包、DeepSeek、Claude、Grok。新头像原图、提示词及来源记录见 `output/imagegen/ai-roster-20261021/`。

AI技能已按审核稿修订：GPT保留最初的【推演】，豆包为【巧答】【伴行】，DeepSeek为【推理】【验算】，Claude为【编译】【调试】，Grok为【洞察】【直言】。完整规则见 `docs/ai-skills-20261021.md`。联机协议为27111730，所有客户端需一起更新并重启。

顶部「显示」可调整整体缩放、武将与手牌尺寸，提供手机紧凑预设、背景选取和昵称编辑。整体缩放需在10秒内确认，否则自动回退。

联机支持标准身份、斗地主、2v2 对决和独立的3v1 Boss挑战。固定席位、AI补位和断线接管沿用同一规则；Boss席位始终由AI控制。具体见 `game/resources/app/docs/online-ai-room.md`。

本批次按用户最新要求制作 Windows 便携ZIP和 Android APK，交付位置为 `D:/无名杀`。Android横屏、安全区和图标已纳入构建，但真机安装与交互仍待验证；Windows已有进程需在当前对局结束后重启以加载新代码。
