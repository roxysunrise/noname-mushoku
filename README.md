<h1 align="center">无名杀</h1>

<p align="center">
  <a href="https://github.com/libnoname/noname/actions/workflows/build.yml"><img alt="构建状态" src="https://img.shields.io/github/actions/workflow/status/libnoname/noname/build.yml?branch=main&style=flat-square"></a>
  <a href="https://github.com/libnoname/noname/releases/latest"><img alt="最新版本" src="https://img.shields.io/github/v/release/libnoname/noname?display_name=tag&style=flat-square"></a>
  <a href="https://github.com/libnoname/noname/releases"><img alt="累计下载" src="https://img.shields.io/github/downloads/libnoname/noname/total?style=flat-square"></a>
  <a href="https://github.com/libnoname/noname/graphs/contributors"><img alt="项目贡献者" src="https://img.shields.io/github/contributors/libnoname/noname?style=flat-square"></a>
  <a href="./LICENSE"><img alt="许可证" src="https://img.shields.io/github/license/libnoname/noname?style=flat-square"></a>
</p>

## 本仓库介绍

这是基于 [无名杀](https://github.com/libnoname/noname) 的个人定制 Fork，增加《无职转生》、二次元、Minecraft 与 AI 主题角色，提供联机 AI 补位、斗地主、2v2 对决、独立 Boss 挑战及手机显示适配。

最新定制代码、构建脚本、技能说明和验证范围见 [定制覆盖层](customizations/extracted/README.md)；覆盖层需要完整游戏资源，不能独立启动。下方保留上游项目的使用与开发说明。

## 项目使用约定

本项目基于 GPL 3.0 协议开源，使用此项目时请遵守开源协议。  
除此外，希望你在使用代码时已经了解以下额外说明：

1. 打包、二次分发 **请保留代码出处**：<https://github.com/libnoname/noname>
2. 请不要用于商业用途。

## 快速启动

### 环境要求

> **提示：** 请参考 [本地文档](./docs/how-to-start.md) 或 [github文档](https://github.com/libnoname/noname/wiki/%E5%A6%82%E4%BD%95%E8%BF%90%E8%A1%8C%E6%97%A0%E5%90%8D%E6%9D%80%EF%BC%88%E7%A8%8B%E5%BA%8F%E5%91%98%E7%89%88%EF%BC%89) 配置环境。

- [Node.js](https://nodejs.org/) ^20.19.0 || >=22.12.0
- [pnpm](https://pnpm.io/) >= 9
- Webview: Chromium >= 91 || Safari >=16.4.0 (暂不支持Firefox)

### 安装依赖

```bash
pnpm install
```

### 启动

```bash
pnpm dev
```

---

贡献代码可阅读相关文档：

[Git 下载安装指南](https://github.com/libnoname/noname/wiki/Git%E4%B8%8B%E8%BD%BD%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

[Github 桌面版客户端使用入门](https://docs.github.com/zh/desktop/overview/getting-started-with-github-desktop)

[如何提交代码到《无名杀》Github 仓库](https://github.com/libnoname/noname/wiki/%E5%A6%82%E4%BD%95%E6%8F%90%E4%BA%A4%E4%BB%A3%E7%A0%81%E5%88%B0%E3%80%8A%E6%97%A0%E5%90%8D%E6%9D%80%E3%80%8BGithub%E4%BB%93%E5%BA%93)

[《无名杀》项目 Pull Request 提交规范](https://github.com/libnoname/noname/wiki/%E3%80%8A%E6%97%A0%E5%90%8D%E6%9D%80%E3%80%8B%E9%A1%B9%E7%9B%AE-Pull-Request-%E6%8F%90%E4%BA%A4%E8%A7%84%E8%8C%83)

客户端下载戳这里：

安卓： <https://github.com/nonameShijian/noname-shijian-android/releases/tag/v1.6.8>

PC:  <https://github.com/nonameShijian/noname/releases/tag/v1.75>

网页端推荐使用 Chrome 系内核浏览器游玩，暂不支持 Firefox 浏览器

请尽量保证游玩的 Chrome 系浏览器或手机 Webview 的`内核版本大于等于91`

---

## 版本与扩展兼容性

无名杀社区存在多个基于开源代码发展的分支，不同分支在引擎版本、武将机制和扩展接口方面可能有所不同。选择版本时，请参考对应项目的源码、更新记录和扩展说明；同一扩展在不同分支上的兼容性需要分别验证。

本仓库是基于无名杀的个人定制分支，与其他社区版本的开发团队相互独立。感谢上游及社区开发者的贡献；修改和再分发时，请遵守 GPL-3.0 许可证并保留相关代码出处与版权声明。
