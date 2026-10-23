# 约翰 Boss 头像加载修复

2026-10-22，用户反馈约翰在 Boss 挑战列表中的图片未显示。

## 原因与修复

约翰已有注册与正式头像 `image/character/boss_johan-v2.jpg`。原来的 `setBackground` 在 Boss 模式优先拼接模式目录，忽略角色配置的 `img`，实际请求 `image/mode/boss/character/boss_johan.jpg` 并返回 404；正确图片请求返回 200。

现令角色明确配置的 `img` 优先于模式默认目录；未配置图片的 Boss 仍使用原模式目录，皮肤选择规则保持有效。同步修改 `src/noname/init/polyfill.ts` 与运行文件 `noname/init/polyfill.js`。

## 验证

- `node --test boss-portrait.test.mjs boss-supply.test.mjs`：5 项通过。
- 在独立浏览器存档中打开本机游戏服务的真实 Boss 模式列表，找到 `boss_johan`，实际背景为 `image/character/boss_johan-v2.jpg`，图片解码为 600×900。
- 修复前在相同游戏服务中复现了错误路径 404。
- 本次未重启用户正在运行的桌面游戏；桌面页面需重新加载后使用修复。
- 较早运行 `boss-roxy.test.mjs` 时有一项既有角色数量断言过时（预期 23，实际 39），其余该次 11 项通过；本次未改动这项无关数量断言。

游戏技能与数值未调整；未发布云端更新。
