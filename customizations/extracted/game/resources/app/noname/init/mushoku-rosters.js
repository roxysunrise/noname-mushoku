export const characterPacks = ["mushoku", "minecraft", "ai"];
export const packForCharacter = id => id === "ac_chatgpt" || id.startsWith("ai_") ? "ai" : id.startsWith("mc_") ? "minecraft" : "mushoku";
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
 ai_doubao: [["万象巧答", "#ffc49d"], ["暖心伴行", "#ffadca"]],
 ai_deepseek: [["深海求索", "#9acfff"], ["步步求证", "#93e4e2"]],
 ai_claude: [["代码织匠", "#efbf9c"], ["审慎求证", "#cfb7ef"]],
 ai_grok: [["实时洞察", "#c1d3f7"], ["锋芒直言", "#f1a4ca"]],
};
export const characterTitles = Object.fromEntries(Object.entries(labels).map(([id, values]) => [id, values.map(([text, color]) => badge(text, color)).join(" ")]));
export const titlesForPack = pack => Object.fromEntries(Object.entries(characterTitles).filter(([id]) => packForCharacter(id) === pack));
