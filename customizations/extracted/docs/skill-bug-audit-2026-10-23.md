# 角色技能 Bug 检查记录

日期：2026-10-23（Asia/Shanghai）。控制文档：Bug维修 v1.1。背景依据：当前对话要求检查全部已有角色；用户明确没有额外背景要求。仅本地维修，不打包、不上传，不修改技能文本、数值或平衡。

## 检查范围与状态

- 当前共用名册有39名普通角色，Boss名册有3名，共42名。实际引擎中逐一核对注册、技能文本、技能依赖及内容编译；Boss模式共检查166个主技能、子技能及依赖，438项检查通过。
- 普通模式扫描及现有结算烟测397项通过；任意门真实引擎的取消、增加目标、移除目标等5项检查通过。
- 12个相关测试文件共155项通过。该数字是本次实际覆盖数，不作为以后验收指标。
- 以上不是42名角色所有技能组合的穷举对局测试；安卓真机、真实双客户端联机、长局循环尚未验证。

## 已复现、已修改、已回归

| 问题 | 修复前证据与根因 | 最小修复与预期依据 |
|---|---|---|
| Grok洞察拿走目标最后手牌后不交牌 | 回归实际交牌次数0，预期1；代码错误要求目标仍有手牌 | 移除目标手牌数量门槛，保留双方在场及发动者有可交手牌检查；按当前技能文本执行交牌 |
| 哆啦A梦任意门联机选人报错 | 隔离序列化回调报`use is not defined`；目标过滤器依赖调用栈局部变量 | 将用牌、使用者和目标列表放入选择事件，回调从事件读取；保留至少一目标规则 |
| 美国队长取消杀后的选人报错 | 隔离序列化回调报`canHit is not defined` | 将受令角色放入选择事件；过滤器独立判断在场、范围及排除发动者，选择返回后继续校验 |
| 夜神月死亡笔记联机弃牌报错 | 隔离序列化回调报`type is not defined` | 将展示牌类别放入选择事件；不同类别才可弃置，取消按原回复分支执行 |
| Dream筹谋联机自动决策报错 | 消耗数量回调报`player is not defined`；选人AI也捕获同一局部变量 | 数量及选人AI使用引擎支持的事件上下文，不改消耗、数量和收益 |
| 无咏、预见、守护、龙盟、护幼、救援、授剑、续局、Boss豺狼的联机AI回调报错 | 9项新增回归修复前全部失败，涉及`get2/get5`打包别名或局部`player/good/last`丢失 | 通过原生`get.infoFuncOL`创建独立回调；所需布尔值和目标写入选择事件，不改变原AI评分意图和技能结算 |

同文件未启用的旧水术弃牌AI也使用同样的独立回调写法，避免再次启用时保留相同的打包别名问题；不改变角色技能列表。

## 测试修正

原洞察测试漏声明`p`，随机手牌夹具漏`length`，命中后的摸牌断言也落后于当前文本；修正测试后新增“拿走最后手牌仍须交牌”用例。选择夹具改为在事件属性设置完成后调用过滤器，与真实引擎顺序一致。Boss豺狼旧测试补齐引擎原生`get.infoFuncOL`依赖。

## 修改与本地同步

源码：

- `game/resources/app/src/character/mushoku/sixteen.js`
- `game/resources/app/src/character/mushoku/skill.js`
- `game/resources/app/src/character/mushoku/expansion.js`
- `game/resources/app/src/character/minecraft/skill.js`
- `game/resources/app/src/character/ai/mechanics.js`
- `game/resources/app/src/noname/init/mushoku-alucard.js`

重新生成`game/resources/app/character/`下mushoku、western、modern、minecraft、ai五个包；Boss源码同步至`game/resources/app/noname/init/mushoku-alucard.js`。未生成APK或桌面安装包，未改发布版本或云端清单。

测试：`online-skill-callbacks.test.mjs`、`ai-characters.test.mjs`、`sixteen-skills.test.mjs`、`alucard-nerf.test.mjs`及`tools/sixteen-engine-smoke.cjs`。

## 验证命令与证据

在无名杀目录运行：

```powershell
node --test crossover.test.mjs expansion.test.mjs sixteen-skills.test.mjs ai-characters.test.mjs online-skill-callbacks.test.mjs boss-revision.test.mjs boss-supply.test.mjs alucard-nerf.test.mjs johan-crime.test.mjs ordinary-roxy.test.mjs boss-roxy-update.test.mjs boss-roxy.test.mjs
node ../node_modules/electron/cli.js tools/sixteen-engine-smoke.cjs
node ../node_modules/electron/cli.js tools/sixteen-engine-smoke.cjs --boss-roster
node ../node_modules/electron/cli.js tools/anydoor-engine-smoke.cjs
```

引擎烟测需要本地8092端口服务；三个烟测共享测试房间端口，应串行运行。曾并行运行导致测试端口占用，已按串行重跑，不计入游戏缺陷。各测试使用隔离临时存档及隐藏窗口。

日志：`tools/skill-audit-tests.log`、`tools/sixteen-engine-smoke.log`、`tools/boss-roster-audit.log`、`tools/anydoor-engine-smoke.log`。修改脚本语法检查通过；已核对Boss源/运行文件同步。

## 生效、回滚与边界

重载本地游戏并重新开局后使用新运行代码。手机现有安装不会因此自动更新。回滚时仅撤销上述源码与测试中本次补丁，再用相同esbuild参数重建五包并同步Boss文件；不得覆盖其他人的已有修改。

本次未改公共协议、UI或玩法规则。单元测试验证回调在序列化后脱离闭包仍可运行，不能代替两个真实客户端的联机对局证据。注册及编译检查只证明结构完整，不证明全部角色互动无Bug。

## 阶段摘要

Bug维修v1.1：检查42名角色的166个技能及依赖，修复洞察漏交牌及多处联机回调丢失变量问题；155项回归、普通与Boss引擎扫描及任意门结算烟测通过。本地源码和运行代码已同步。真实双端联机、安卓真机与全组合长局待验证；不打包、不上传。
