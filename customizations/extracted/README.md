# 无名杀定制版覆盖层

## 当前更新（2026-10-21）

本轮更新音洄/豪赌真人联机选择、艾莉丝低血决意、手机显示设置和Android安全区/图标；新增独立AI分组及五张正式头像、彩色多称号，联机支持斗地主、2v2和独立3v1 Boss。普通角色19名，当前协议27111730。所有客户端应使用同版资源。GPT保留原推演，四名新AI使用审核后八技能，详见[技能说明](docs/ai-skills-20261021.md)。

审核稿实装后76项规则测试及本机双客户端检查通过，覆盖推理远端选择、程序同步、洞察私密选择、伴行和验算实际手牌触发与缩放后鼠标选牌。Android Java和图标资源编译此前已通过；按用户最新要求制作20261021版Windows便携ZIP和Android APK，成品与仅本地过程报告放在 D:/无名杀；未进行真机或跨设备实战验证。详细边界与复现见 [更新说明](docs/update-20261021.md)。生成原图、提示词和社区来源见 `assets/ai-roster-20261021/`。按用户最终要求单AI分批实施。

应用覆盖层仍使用本文下方的 `apply.ps1`，先运行 `-CheckOnly`。覆盖层依赖完整解压版，不能独立启动。

以下为2026-10-20的历史交付记录，角色数量、联机限制和安装包结论不代表当前源码状态。

## 历史完整性报告（2026-10-20）

本目录是实际解压版 `game/resources/app` 的更新覆盖层。仓库 `apps/core` 为较旧引擎，未用本次覆盖层替换其历史。

## 已完成

- 普通角色池15人；新增蛇喰梦子、怪盗基德、ChatGPT、下界合金剑，按用户提供的技能实现。
- Boss洛琪希与阿卡多，挑战模式为1名Boss对3名挑战者。阿卡多开局2嗜血，每次自己的准备阶段恢复；死河零式后永久不能获得嗜血。
- Dream 4/4削弱方案；洛琪希水灵消耗2魔力、回复1体力并摸1牌。
- 新增五张正式API位图头像，保留原图与提示词于 assets/roster-expansion；Boss头像兼容挑战模式路径。
- 移除背景音乐并关闭播放入口，电脑端保留卡牌音效和人物语音。手机精简包不含原版人物技能/阵亡语音。
- Windows便携ZIP与Android APK使用相同定制技能、角色池与协议27111727。

## Sakura联机

房主在电脑上进入联机，启动服务器，建立标准身份房间。Sakura必须使用TCP隧道：

`frp-use.com:50723 → 127.0.0.1:8080`

手机与电脑加入者均填写 `frp-use.com:50723`。旧安装的保存地址可能覆盖新默认值，请手动修改。房主保持游戏及Sakura运行；人数不足由AI补位。

目前只支持标准身份、单将、2至8个总席位；Boss挑战为单机，不包含Boss多人联机。

## 本次实际验证

- `node --test crossover.test.mjs online-room.test.mjs boss-roxy.test.mjs expansion.test.mjs`：56项全部通过。
- Electron全新配置目录：房主和3AI开局；第二客户端接替AI，角色/体力/手牌ID一致；断线和重新连接均通过。复用被其他测试进程占用的配置目录曾导致空白，测试脚本改用临时独立目录。
- 浏览器实际进入阿卡多挑战；五张头像可解码；非杀免疫、体力流失免疫、嗜血抵消和属性杀经过运行时检查。
- Windows ZIP：16030项，CRC完整性及关键运行文件内容校验通过。
- APK：签名v2/v3、zipalign、ZIP CRC及资源路径校验通过；包名com.roxysunrise.noname，Android8以上。
- APK资源在浏览器可进入游戏，但没有Android手机或模拟器实测，安装、WebView启动及跨设备联机仍待验证。
- 房主8080监听时，公网 `ws://frp-use.com:50723` 握手返回HTTP501。尚未验证公网隧道可用；需核对TCP类型、映射地址、端口及Sakura在线状态。
- 未进行完整多人对局和所有技能交互的人工平衡测试。

## 应用覆盖层

退出游戏，PowerShell执行：

```powershell
./apply.ps1 -AppRoot 'D:/Codex/Project/肉鸽/无名杀/game/resources/app' -CheckOnly
./apply.ps1 -AppRoot 'D:/Codex/Project/肉鸽/无名杀/game/resources/app'
```

脚本核对加载入口和SHA256，备份既有文件后复制。该补丁依赖原解压版的引擎及其他资源，不能独立启动。

## 构建

`build-crossover.ps1`重建角色包。`tools/build-android.ps1`需要JDK17、Python、Android35平台和构建工具，SDK位于项目父目录 `.android-tools/android-35` 和 `.android-tools/android-15`；临时使用N/O盘映射。签名密钥保留本地，不提交Git。`tools/package-online.py`构建Windows完整便携ZIP。仓库不保存依赖、完整游戏资源或安装包；安装包单独交付。
