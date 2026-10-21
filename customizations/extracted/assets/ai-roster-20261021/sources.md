# AI角色与手机版图标素材来源

2026-10-21。五张头像先查询社区拟人形象，再逐张调用图像生成API制作统一竖幅卡面；不将参考图原样作为游戏头像。生成工具为官方 `image_gen.py`，通过 `conda run -n imagegen` 运行。原图和对应 `*-prompt.txt` 保留于本目录，游戏使用600×900 JPG。

| 素材 | 参考形象 | 本次采用的参考URL |
|---|---|---|
| GPT | 白色龙女、青绿与白色、龙角与长发 | https://img1.gamersky.com/image2026/10/20261007_cza_511_1/1490_S.jpg |
| DeepSeek | 蓝色鲸鱼女仆 | https://raw.githubusercontent.com/lmy414/ai-girl-stickers/main/dist/submissions/originals/deepseek/5eaf14841d3e3f34.jpg |
| Claude | 橙发二次元少女 | https://raw.githubusercontent.com/lmy414/ai-girl-stickers/main/dist/submissions/originals/claude/48343eb7359e9ef2.png |
| 豆包 | 黑色短发、温暖可爱风格 | https://storage.moegirl.org.cn/moegirl/commons/0/0d/%E8%B1%86%E5%8C%85AI.png |
| Grok | Ani系金色双马尾、黑色哥特服装 | https://image.hkhl.hk/f/1024p0/0x0/100/none/2eed32fb77bf4c0b1213fba1878eb0cd/2025-07/Grok_Ani_00-00-06.png |
| 手机版图标 | 自行设计蓝色龙、卡牌与宝石，适合小尺寸识别 | 无外部角色参考图 |

社区形象归档：https://github.com/lmy414/ai-girl-stickers 。Grok/Ani相关检索背景：https://m.36kr.com/p/3393869078726793 。这些参考用于视觉识别，不代表对应公司官方设定或素材授权声明。

运行头像位于 `game/resources/app/image/character/`：`ac_chatgpt.jpg`、`ai_deepseek.jpg`、`ai_claude.jpg`、`ai_doubao.jpg`、`ai_grok.jpg`。Android图标位于 `android/res/`，含48/72/96/144/192密度和自适应资源；本轮未生成APK。

技能强度按现有角色与回合资源限制设计，未据模型排行榜硬性分配数值，也不宣称完成长期平衡验证。
