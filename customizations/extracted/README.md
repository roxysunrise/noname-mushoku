# 解压版更新：Dream 调整与洛琪希 Boss

2026-10-20。直接修改的运行目标为 `无名杀/game/resources/app`，可从游戏的「挑战」进入洛琪希战。三名挑战者对战一名 10 体力 Boss，按座次行动。

- Dream 保持 4/4；筹谋随机发红桃，险逸改为 4/6/8 且累计获得；衔追要求目标本回合同时被 Dream 的牌指定且受到过伤害，取消目标数的蓄力上限约束。
- 洛琪希：水咏、水袭、豪雨、决意、水灵。水灵为「出牌阶段，你可以失去2点魔力，回复1点体力并摸一张牌」，不限次数，满体力也可使用。
- 不包含黑客 ROXY。
- 已移除背景音乐，运行版和源码的背景音乐入口均停止播放，默认设置关闭；保留人物语音与卡牌音效。应用脚本把原背景音乐移到 app 同级的备份目录，不上传音乐文件。

此目录保存实际解压版的源码、可直接使用的角色包及素材。仓库 `apps/core` 是较旧的源码工程，故不覆盖其引擎代码。为保持解压版当前十一人角色池可用，补丁包含它依赖的二次元/Minecraft 角色包和名单快照。原工程单独构建不会自动包含此补丁。

## 使用

退出游戏，解压本更新包，执行（将路径换成你自己的 app 目录）：

```powershell
./apply.ps1 -AppRoot 'D:/Codex/Project/肉鸽/无名杀/game/resources/app' -CheckOnly
./apply.ps1 -AppRoot 'D:/Codex/Project/肉鸽/无名杀/game/resources/app'
```

脚本先核对六个加载入口及 SHA256，拒绝不兼容目录；备份既有文件后复制补丁并局部修正加载调用。重复执行可用。备份位于目标 app 的同级目录。不需要重新安装游戏。

## 验证

```powershell
node --test crossover.test.mjs online-room.test.mjs boss-roxy.test.mjs
```

42 项检查覆盖技能结算、Boss 隔离、角色池及联机回归。隔离浏览器中已进入 Dream、希露菲、艾莉丝对战洛琪希的四人牌局，并验证正式头像可解码。尚未进行完整对局的数值平衡测试，也未重打包 Windows 安装程序。

`assets/boss-roxy-original.png` 保存 API 生成原图，`assets/boss-roxy-prompt.txt` 为提示词，游戏头像同时保存在通用及 Boss 模式素材目录。
