export const westernCharacterIds = Object.freeze(["ac_hulk", "ac_joker", "ac_spiderman", "ac_wonderwoman", "ac_batman", "ac_captain", "ac_vader"]);
export const modernCharacterIds = Object.freeze(["ac_fighter", "ac_tank", "ac_santa"]);
export const characterGroups = Object.freeze(["huan", "xu", "wang", "qi", "yi"]);
export const characterPacks = ["mushoku", "minecraft", "ai", "western", "modern"];
export const packForCharacter = id => modernCharacterIds.includes(id) ? "modern" : westernCharacterIds.includes(id) ? "western" : id === "ac_chatgpt" || id.startsWith("ai_") ? "ai" : id.startsWith("mc_") ? "minecraft" : "mushoku";
const badge = (text, color) => `<span style="display:inline-block;color:${color};border:1px solid currentColor;border-radius:5px;padding:1px 5px;margin:2px 3px;line-height:1.5;font-size:.9em">${text}</span>`;
const labels = {
 th_mokou: [["不灭的烟火", "#ff8d72"], ["蓬莱不死", "#ffd284"]],
 ac_yumeko: [["深渊赌徒", "#e898ac"], ["命运豪赌", "#d0a5ff"]],
 ac_kaito: [["月下魔术师", "#a4d8ff"], ["千面幻影", "#d3c3ff"]],
 ac_yuu: [["星隙回声", "#adc5ff"], ["逆时音律", "#a2e4e5"]],
 mt_rudeus: [["无声咏唱", "#a0d5fa"], ["魔术新生", "#d5b0f5"]],
 mt_roxy: [["水色导师", "#94d4fa"], ["追知之旅", "#b9c8ff"]],
 mt_sylphie: [["静风守望", "#a6e5bb"], ["温柔援护", "#c2e6ed"]],
 mt_eris: [["赤刃决意", "#ff9d96"], ["剑心不退", "#ffc582"]],
 mt_orsted: [["龙神", "#e5c887"], ["轮回孤旅", "#b6c8ea"]],
 mt_ruijerd: [["额眼守护", "#9be0c8"], ["不屈战士", "#e5c194"]],
 mt_paul: [["三流派剑士", "#d7bf92"], ["舍身救援", "#f6b0a0"]],
 mt_ghislaine: [["剑王", "#f3b36f"], ["授剑之师", "#c4dba7"]],
 mc_dream: [["逐猎幻踪", "#a8e887"], ["绝境逃生", "#8fe0d7"]],
 mc_netherite: [["余烬之锋", "#d7a4ef"], ["熔铸攻守", "#efba8a"]],
 ac_chatgpt: [["万言之镜", "#9ce0ca"], ["星海龙吟", "#dbb7ff"]],
 ac_alucard: [["无生之王", "#9b8cff"], ["命河君临", "#d8b4ff"]],
 boss_alucard: [["无生之王", "#A62D40"], ["不死", "#7651A8"], ["猎杀", "#C43D32"], ["解放", "#A66B12"]],
 ac_okabe: [["狂气科学家", "#e5b86b"], ["世界线观测者", "#a7c7ff"]],
 ac_fighter: [["制空之翼", "#a7d8ff"], ["机械天穹", "#b8c5d6"]],
 ac_tank: [["钢铁堡垒", "#aab7c4"], ["重装壁垒", "#d2a679"]],
 boss_johan: [["无名的怪物", "#c7b7cf"], ["完美犯罪", "#be8b91"]],
 ac_hulk: [["怒意巨神", "#d66b5d"], ["伽马狂潮", "#8fd36d"]], ac_gojo: [["六眼术师", "#a8c7ff"], ["无量领域", "#d1b4ff"]],
 ac_doraemon: [["未来伙伴", "#77bde8"], ["奇迹口袋", "#f0c46c"]], ac_joker: [["混沌笑匠", "#d889aa"], ["罪恶循环", "#9c8caf"]],
 ac_spiderman: [["城市蛛网", "#e56d6d"]], ac_wonderwoman: [["亚马逊之盾", "#dfb071"], ["真言持守", "#91b8e8"]],
 ac_ken: [["北斗神拳", "#e58b72"], ["宿命强者", "#d8b77e"]], ac_batman: [["哥谭暗影", "#9ba8c9"], ["蝙蝠猎手", "#c2a8d7"]],
 ac_santa: [["冬夜使者", "#e97979"], ["愿望成真", "#9ed39c"]], ac_captain: [["自由先锋", "#87aee8"]],
 ac_totoro: [["森林精灵", "#91c89e"]], ac_light: [["基拉之名", "#b8a7d9"], ["死亡裁决", "#8b8b9e"]],
 ac_kirby: [["星之吞噬者", "#ed9bb8"], ["万象复制", "#a8c8f0"]], ac_gandalf: [["白袍贤者", "#d8d0bc"]],
 ac_mustang: [["焰之炼金术师", "#e79265"], ["军略焚城", "#d9b37b"]], ac_vader: [["帝国黑影", "#9a9aa8"]],
 ai_doubao: [["万象巧答", "#ffc49d"], ["暖心伴行", "#ffadca"]],
 ai_deepseek: [["深海求索", "#9acfff"], ["步步求证", "#93e4e2"]],
 ai_claude: [["代码织匠", "#efbf9c"], ["审慎求证", "#cfb7ef"]],
 ai_grok: [["实时洞察", "#c1d3f7"], ["锋芒直言", "#f1a4ca"]],
};
export const characterTitles = Object.fromEntries(Object.entries(labels).map(([id, values]) => [id, values.map(([text, color]) => badge(text, color)).join(" ")]));
export const titlesForPack = pack => Object.fromEntries(Object.entries(characterTitles).filter(([id]) => packForCharacter(id) === pack));
