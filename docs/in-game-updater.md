# 内置更新（Windows 桌面版）

版本 `2026.10.21.1`，适用基础客户端 `1.11.7`。启动 `game/noname.exe` 后先进入三国古风启动页，可进入游戏、查看更新日志、配置更新源。现有旧客户端必须先安装包含启动器的新版本，之后才具备内置更新能力。

## 玩家流程

启动检查配置的独立 HTTPS 更新清单。云端与本地版本号不同且基础版本兼容时，展示更新日志并询问是否下载；可以暂不更新。断网或检查失败仍可进入游戏。下载显示从真实字节计算的百分比、速度、已下载、剩余量与预计时间。取消会清理未完成文件；重试重新下载，不支持断点续传。下载大小及 SHA-256 校验通过才允许重启安装。

Windows PowerShell 安装器在游戏退出后执行，逐个验证包内文件，备份待覆盖文件，最后更新版本标记；安装失败会尝试恢复已改动文件。备份保存在 `%APPDATA%/noname-mushoku/Updates/backup-*`。若恢复也失败，启动页显示恢复未完成，请保留该目录处理。用户数据位于独立的 `UserData` 目录，不在更新包覆盖范围内。

游戏菜单“操作 → 更新日志”随时可读本地日志。“检查游戏更新”会先提示结束当前对局，再返回启动页。

## 独立更新源

内置更新不使用 GitHub；拒绝 GitHub、githubusercontent.com 与 github.io 下载源。默认配置在 `game/resources/app/updater/config.json`，玩家在启动页保存的地址优先，存于 `%APPDATA%/noname-mushoku/updater-settings.json`。地址留空时明确提示尚未配置。不要填入短期签名链接、令牌地址或需要登录的控制台地址。

生成发布目录：

```powershell
python tools/build-update.py --base-url https://实际更新域名/游戏目录
```

将 `releases/update-site` 全部文件上传到静态托管／对象存储，公开 `noname-update.json` 和清单引用的 ZIP。每次发布修改 `updater/version.json` 的版本号和日志，再生成包、先上传包、最后更新清单。版本号必须唯一，包文件名不可复用。清单建议设置 `Cache-Control: no-store`；ZIP 可长期缓存。

不传 `--base-url` 只生成 `noname-update.template.json`，不伪造已可用的公开地址。脚本生成累积运行时补丁，包括游戏代码、已有定制素材、启动器。新增不符合预设文件范围的素材时应扩充脚本。基础引擎／Electron／依赖升级需发布完整客户端并更改基础版本，不能把普通资源补丁当作完整引擎升级。

清单 schema 为 1，包含 `version`、`baseVersion`、`notes`、`windows.url`、`windows.bytes`、`windows.sha256`。Windows 包根目录包含 `payload.json`，列出每个文件的相对路径与校验值。不允许路径逃逸、重复路径、链接路径。发布站点应保持账号安全；SHA-256 能检测传输损坏，当前实现没有独立数字签名，站点被篡改后的恶意清单不在此校验的保护范围内。

## 托管核查（2026-10-21）

- 阿里云 ESA Pages：已通过账号控制台创建 `noname-mushoku-updates`，免费模式、本地上传；默认测试域名需鉴权且令牌仅 60 分钟有效，不能用作长期更新源。无自有域名时尚不能完成稳定接入。未启用付费模式。
- 腾讯云 CloudBase：已创建上海免费体验环境 `noname-updates`，环境 ID `noname-updates-d3gpg961xc497eb27`，控制台确认 6 个月、总金额 0 元。官方公开定价列出免费环境每月 3,000 资源点，单次续期 6 个月，到期前 1 个月内可续。已部署版本 `2026.10.21.1` 并配置到客户端，匿名请求清单和完整 ZIP 下载、大小及 SHA-256 校验均通过。
- 默认更新清单：`https://noname-updates-d3gpg961xc497eb27-1510703983.tcloudbaseapp.com/noname-update.json`。发布时运行 `python tools/build-update.py --base-url https://noname-updates-d3gpg961xc497eb27-1510703983.tcloudbaseapp.com`，先上传 ZIP，再上传清单到 CloudBase 静态网站托管。
- 默认域名有开发测试用途、访问频率和稳定性限制，不提供生产 SLA；免费环境有额度和有效期，需留意控制台到期续期与资源用量。不能把它称作永久无限量或保证稳定的服务器。后续可在启动页切换独立 HTTPS 更新源。
- Cloudflare 已按用户要求排除，不作为客户端更新源。

官方参考：

- https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/what-is-functions-and-pages
- https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/functions-and-pages-billing
- https://cloudbase.net/pricing
- https://docs.cloudbase.net/service/introduce

## 验证

`node --test updater.test.mjs` 覆盖真实 HTTP 请求、截断／超大／错误哈希、取消清理，以及真实 PowerShell 的暂存安装、损坏拒绝、路径逃逸拒绝、失败回滚和个人文件保留。`tools/updater-smoke.cjs` 在隔离 Electron 中验证持久化设置、更新弹窗、进度、取消、校验与暂不更新后进入游戏；网络使用可控测试数据，不能替代公开服务测试。

2026-10-21 对交付 ZIP 提取的独立快照运行全部测试，102 项通过；共享目录有并行角色开发，当前目录结果不能替代发行包结果。`tools/updater-live-smoke.cjs` 使用实际 Electron 启动页与 `net.fetch`，已验证匿名云端版本检查、完整公开更新包下载及 SHA-256，报告位于 `output/updater-qa/live-result.json`。1440×810 和 844×390 界面已截图检查。该功能目前针对 Windows；没有为 Android APK 实现下载安装，也未进行手机真机验证。

背景由 imagegen 技能官方脚本调用 `gpt-image-2` 生成。原图及提示词保存在项目根 `output/imagegen/three-kingdoms-loading-*`，运行时使用压缩 JPEG；不包含 API 凭据。
