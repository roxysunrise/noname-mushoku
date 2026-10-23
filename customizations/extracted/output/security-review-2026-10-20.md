# 无名杀泄密风险检查

检查日期：2026-10-20（Asia/Shanghai）。

## 结论

当前没有发现已上传 API 密钥、GitHub 令牌、私钥或硬编码密码的证据。仓库为私有，只有账号 roxysunrise 一个协作者，没有部署密钥或 Webhook，Actions 关闭。运行时存在高权限客户端与未鉴权本地文件接口风险；这不等于已经发生泄密。

## 范围与证据

- 仓库：https://github.com/roxysunrise/noname-mushoku
- 已核对 GitHub main 与本地 HEAD 都是 ae04b9acc070d127a5d2dd0350018d5697809e3f。
- 已上传分支仅 main，其可达提交历史共 1 个提交，包含 15,597 个文件。
- 扫描已提交内容中的 899 个文本文件，匹配常见供应商令牌、私钥标记、硬编码密码/令牌赋值、带凭据的 URL 与 Windows 用户目录路径，未发现匹配。
- 已检查敏感文件名；上传树中没有 .env、.key、.pem、日志、临时目录及安装包。原上游的 localhost.decrypted.key 保留在本地，已从上传快照排除；原上游分支仍仅作为本地参考保留。
- .gitignore 排除了常见环境配置、私钥、临时文件、依赖和构建产物。忽略规则不能阻止已跟踪文件或 git add -f。

## 发现

### 1. 高：桌面页面具有 Node 权限且关闭浏览器隔离

位置：源码 apps/electron/app/main.ts:88-93。

证据：webSecurity=false、nodeIntegration=true、nodeIntegrationInSubFrames=true、nodeIntegrationInWorker=true、contextIsolation=false。

影响：若恶意扩展、页面注入或其他不可信脚本在该窗口执行，可能读取或修改运行账号可访问的本机文件，并进一步窃取秘密。该配置本身不是已经泄密的证据，本次未构造利用链。

建议：仅安装可信扩展。后续将页面改为关闭 Node 集成、启用隔离，通过受限 preload/IPC 提供必要能力。此项涉及无名杀扩展兼容，需要专项回归，不能仅改开关后声称安全。

### 2. 中：本地文件服务无鉴权、允许任意 Origin 及隐藏文件

位置：源码 packages/fs/src/index.ts:72-80、107-134、137-145。

证据：CORS origin 为 *；readFileAsText 等读写接口没有身份验证；静态服务允许 dotfiles。读取路径有目录边界检查，但不限制在目录中读取 .env 等敏感文件。

验证：在系统临时目录创建仅含非秘密占位符的 .env，使用 app.inject 请求 /readFileAsText?fileName=.env 并带 Origin: https://audit.invalid。返回 HTTP 200、Access-Control-Allow-Origin: *，无需鉴权即可读取测试内容；GET /.env 也返回测试内容。测试后已删除临时目录。此测试证明服务端行为，未验证真实浏览器在其本地网络访问限制下是否允许跨站调用。

暴露边界：桌面生产入口 apps/electron/app/main.ts:175-181 明确绑定 127.0.0.1，不能据此称服务已向局域网或公网开放。检查时未发现 8089 监听；8082 监听属于 QQ，与此项目无关。未对安装包单独进行运行验证。

建议：保持回环监听；限制 Origin 并为文件接口加入会话鉴权；禁止读取环境文件和 Git 元数据；将不需要的读写接口关闭或缩小范围。不应把 GitHub 私有状态视为运行时保护。

### 3. 低：提交记录暴露作者标识

位置：当前提交的 Git 作者字段。

证据：作者为 sunny，邮箱为 sunny@git.com。这是协作者可见的提交元数据，不是认证凭据。

建议：若未来公开仓库且不希望显示该邮箱，使用 GitHub noreply 邮箱创建后续提交；历史提交需要单独处理。

## 限制与下一步

本次检查聚焦 GitHub 上传内容和直接相关的本地文件泄露面，不是完整渗透测试。模式扫描可能漏掉自定义格式、编码后的秘密、媒体元数据或二进制内容。没有检查 GitHub 账号的双因素认证、其他 OAuth 应用权限、电脑是否感染恶意软件，亦未尝试调用任何疑似凭据。

本次没有修改或推送游戏代码。建议继续保持私有仓库、避免将凭据放入游戏目录；优先收紧本地文件服务，再规划 Electron 权限隔离改造。
