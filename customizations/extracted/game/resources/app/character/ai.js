// game/resources/app/src/character/ai/index.js
import { game as game3 } from "noname";

// game/resources/app/src/noname/init/mushoku-characters.js
var characters = {
  ac_yumeko: { sex: "female", group: "huan", hp: 4, maxHp: 4, skills: ["ac_haodu", "ac_xuju"], img: "image/character/ac_yumeko.jpg" },
  ac_kaito: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_zhangyan"], img: "image/character/ac_kaito.jpg" },
  ac_chatgpt: { sex: "female", group: "xu", hp: 4, maxHp: 4, skills: ["ac_tuiyan"], img: "image/character/ac_chatgpt.jpg" },
  ai_doubao: { sex: "female", group: "xu", hp: 3, skills: ["ai_banda", "ai_qingyu"], img: "image/character/ai_doubao.jpg" },
  ai_deepseek: { sex: "female", group: "xu", hp: 3, skills: ["ai_shensuan", "ai_chengsi"], img: "image/character/ai_deepseek.jpg" },
  ai_claude: { sex: "female", group: "xu", hp: 3, skills: ["ai_shenshen", "ai_chengzhang"], img: "image/character/ai_claude.jpg" },
  ai_grok: { sex: "female", group: "xu", hp: 4, skills: ["ai_ruiwen", "ai_zhuiwen"], img: "image/character/ai_grok.jpg" },
  mc_netherite: { sex: "none", group: "qi", hp: 4, maxHp: 4, skills: ["mc_fengcang", "mc_xiejia", "mc_rongzhu"], img: "image/character/mc_netherite.jpg" },
  th_mokou: { sex: "female", group: "shen", hp: 2, maxHp: 2, skills: ["th_penglai", "th_fengyi"], img: "image/character/th_mokou.jpg" },
  ac_yuu: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_heyun", "ac_yinhui"], img: "image/character/ac_yuu.jpg" },
  mc_dream: { sex: "male", group: "wang", hp: 4, skills: ["mc_choumou", "mc_xianyi", "mc_xianzhui"], img: "image/character/mc_dream.jpg" },
  mt_rudeus: { sex: "male", group: "huan", hp: 3, skills: ["mt_voiceless", "mt_foresight"] },
  mt_roxy: { sex: "female", group: "huan", hp: 3, skills: ["mt_study", "mt_water", "mt_mentor"] },
  mt_sylphie: { sex: "female", group: "huan", hp: 3, skills: ["mt_heal", "mt_guard"] },
  mt_eris: { sex: "female", group: "huan", hp: 4, skills: ["mt_sword", "mt_resolve"] },
  mt_orsted: { sex: "male", group: "shen", hp: 4, isZhugong: true, skills: ["mt_dragon", "mt_dragonlord"] },
  mt_ruijerd: { sex: "male", group: "huan", hp: 4, skills: ["mt_eye", "mt_protect", "mt_spear"] },
  mt_paul: { sex: "male", group: "huan", hp: 4, skills: ["mt_styles", "mt_rescue"] },
  mt_ghislaine: { sex: "female", group: "huan", hp: 4, skills: ["mt_swordking", "mt_training", "mt_ghislaine_guard"] }
};
for (const [id, character] of Object.entries(characters)) character.img ??= `image/character/${id}.${id.startsWith("ac_") || id.startsWith("mc_") ? "svg" : "jpg"}`;
var mushoku_characters_default = characters;

// game/resources/app/src/noname/init/mushoku-rosters.js
var packForCharacter = (id) => id === "ac_chatgpt" || id.startsWith("ai_") ? "ai" : id.startsWith("mc_") ? "minecraft" : "mushoku";
var badge = (text, color) => `<span style="display:inline-block;color:${color};border:1px solid currentColor;border-radius:5px;padding:1px 5px;margin:2px 3px;line-height:1.5;font-size:.9em">${text}</span>`;
var labels = {
  th_mokou: [["\u4E0D\u706D\u7684\u70DF\u706B", "#ff8d72"], ["\u84EC\u83B1\u4E0D\u6B7B", "#ffd284"]],
  ac_yumeko: [["\u6DF1\u6E0A\u8D4C\u5F92", "#e898ac"], ["\u547D\u8FD0\u8C6A\u8D4C", "#d0a5ff"]],
  ac_kaito: [["\u6708\u4E0B\u9B54\u672F\u5E08", "#a4d8ff"], ["\u5343\u9762\u5E7B\u5F71", "#d3c3ff"]],
  ac_yuu: [["\u661F\u9699\u56DE\u58F0", "#adc5ff"], ["\u9006\u65F6\u97F3\u5F8B", "#a2e4e5"]],
  mt_rudeus: [["\u65E0\u58F0\u548F\u5531", "#a0d5fa"], ["\u9B54\u672F\u65B0\u751F", "#d5b0f5"]],
  mt_roxy: [["\u6C34\u8272\u5BFC\u5E08", "#94d4fa"], ["\u8FFD\u77E5\u4E4B\u65C5", "#b9c8ff"]],
  mt_sylphie: [["\u9759\u98CE\u5B88\u671B", "#a6e5bb"], ["\u6E29\u67D4\u63F4\u62A4", "#c2e6ed"]],
  mt_eris: [["\u8D64\u5203\u51B3\u610F", "#ff9d96"], ["\u5251\u5FC3\u4E0D\u9000", "#ffc582"]],
  mt_orsted: [["\u9F99\u795E", "#e5c887"], ["\u8F6E\u56DE\u5B64\u65C5", "#b6c8ea"]],
  mt_ruijerd: [["\u989D\u773C\u5B88\u62A4", "#9be0c8"], ["\u4E0D\u5C48\u6218\u58EB", "#e5c194"]],
  mt_paul: [["\u4E09\u6D41\u6D3E\u5251\u58EB", "#d7bf92"], ["\u820D\u8EAB\u6551\u63F4", "#f6b0a0"]],
  mt_ghislaine: [["\u5251\u738B", "#f3b36f"], ["\u6388\u5251\u4E4B\u5E08", "#c4dba7"]],
  mc_dream: [["\u9010\u730E\u5E7B\u8E2A", "#a8e887"], ["\u7EDD\u5883\u9003\u751F", "#8fe0d7"]],
  mc_netherite: [["\u4F59\u70EC\u4E4B\u950B", "#d7a4ef"], ["\u7194\u94F8\u653B\u5B88", "#efba8a"]],
  ac_chatgpt: [["\u4E07\u8A00\u4E4B\u955C", "#9ce0ca"], ["\u661F\u6D77\u9F99\u541F", "#dbb7ff"]],
  ai_doubao: [["\u4E91\u95F4\u4F34\u8BED", "#ffc49d"], ["\u6696\u5FC3\u5171\u9E23", "#ffadca"]],
  ai_deepseek: [["\u6DF1\u6D77\u6C42\u7D22", "#9acfff"], ["\u6F84\u6F88\u63A8\u7406", "#93e4e2"]],
  ai_claude: [["\u957F\u5377\u7EC7\u8BED", "#efbf9c"], ["\u5BA1\u614E\u5B88\u671B", "#cfb7ef"]],
  ai_grok: [["\u661F\u9645\u9510\u95EE", "#c1d3f7"], ["\u9006\u98CE\u8FFD\u95EE", "#f1a4ca"]]
};
var characterTitles = Object.fromEntries(Object.entries(labels).map(([id, values]) => [id, values.map(([text, color]) => badge(text, color)).join(" ")]));
var titlesForPack = (pack) => Object.fromEntries(Object.entries(characterTitles).filter(([id]) => packForCharacter(id) === pack));

// game/resources/app/src/character/ai/character.js
var character_default = Object.fromEntries(Object.entries(mushoku_characters_default).filter(([id]) => packForCharacter(id) === "ai"));

// game/resources/app/src/character/ai/skill.js
import { game, get, lib } from "noname";

// game/resources/app/src/character/ai/mechanics.js
function createAiSkills(game4, get3, lib3) {
  const remoteChoice2 = (source) => get3.infoFuncOL("_noname_func:" + source);
  return {
    ai_banda: {
      trigger: { global: "gainAfter" },
      usable: 1,
      filter: (event, player) => event.player !== player && event.player.isIn() && event.cards?.length >= 2,
      check: (event, player) => get3.attitude(player, event.player) > 0,
      async content(event, trigger, player) {
        await trigger.player.draw();
        if (player.isIn() && player.countCards("h") < trigger.player.countCards("h")) await player.draw();
      }
    },
    ai_qingyu: {
      enable: "phaseUse",
      usable: 1,
      position: "h",
      selectCard: 1,
      discard: false,
      lose: false,
      delay: false,
      filterCard: true,
      filterTarget: (card, player, target) => target !== player,
      check: (card) => 6 - get3.value(card),
      async content(event, trigger, player) {
        await player.give(event.cards, event.target);
        if (event.target.isIn() && event.target.countCards("h") <= event.target.hp) await event.target.draw();
      },
      ai: { order: 3, result: { target: 1 } }
    },
    ai_shensuan: {
      enable: "phaseUse",
      usable: 1,
      position: "h",
      selectCard: 1,
      filterCard: true,
      check: (card) => 6 - get3.value(card),
      async content(event, trigger, player) {
        const cards = await player.draw(2).forResult();
        const drawn = Array.isArray(cards) ? cards : cards?.cards;
        if (drawn?.length === 2 && ["red", "black"].includes(get3.color(drawn[0], false)) && get3.color(drawn[0], false) === get3.color(drawn[1], false)) await player.draw();
      },
      ai: { order: 5, result: { player: 1 } }
    },
    ai_chengsi: {
      trigger: { player: "phaseJieshuBegin" },
      direct: true,
      filter: (event, player) => player.countCards("h") >= 3 && game4.hasPlayer((target) => target !== player),
      async content(event, trigger, player) {
        const result = await player.chooseCardTarget({
          prompt: "\u6F84\u601D\uFF1A\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4E00\u5F20\u624B\u724C\uFF0C\u82E5\u5176\u5DF2\u53D7\u4F24\u5219\u56DE\u590D1\u70B9\u4F53\u529B",
          position: "h",
          selectCard: 1,
          filterCard: true,
          filterTarget: (card, source, target2) => source !== target2,
          ai1: remoteChoice2("card => 6 - get.value(card)"),
          ai2: remoteChoice2("target => get.attitude(_status.event.player, target) * (target.isDamaged() ? 2 : 1)")
        }).forResult();
        if (!result.bool) return;
        const target = result.targets[0];
        player.logSkill("ai_chengsi", target);
        await player.give(result.cards, target);
        if (target.isIn() && target.isDamaged()) await target.recover();
      }
    },
    ai_shenshen: {
      trigger: { global: "damageBegin4" },
      usable: 1,
      filter(event, player) {
        const color = get3.color(event.card);
        return event.num > 0 && ["red", "black"].includes(color) && player.countCards("h", (card) => get3.color(card) === color && lib3.filter.cardDiscardable(card, player, "ai_shenshen")) > 0;
      },
      async cost(event, trigger, player) {
        event.result = await player.chooseToDiscard("h", "\u5BA1\u614E\uFF1A\u5F03\u7F6E\u540C\u989C\u8272\u624B\u724C\uFF0C\u4EE4\u4F24\u5BB3-1", remoteChoice2("card => get.color(card) === _status.event.aiDamageColor")).set("aiDamageColor", get3.color(trigger.card)).set("aiProtect", get3.attitude(player, trigger.player) > 0).set("chooseonly", true).set("ai", remoteChoice2("card => _status.event.aiProtect ? 8 - get.value(card) : 0")).forResult();
      },
      async content(event, trigger, player) {
        await player.discard(event.cards);
        trigger.num--;
      }
    },
    ai_chengzhang: {
      trigger: { player: "phaseJieshuBegin" },
      forced: true,
      filter: (event, player) => new Set(player.getHistory("useCard").map((evt) => get3.type2(evt.card)).filter((type) => ["basic", "trick", "equip"].includes(type))).size >= 2,
      async content(event, trigger, player) {
        await player.draw(2);
      }
    },
    ai_ruiwen: {
      enable: "phaseUse",
      usable: 1,
      position: "h",
      selectCard: 1,
      filterCard: (card) => ["red", "black"].includes(get3.color(card)),
      filterTarget: (card, player, target) => target !== player,
      check: (card) => 6 - get3.value(card),
      async content(event, trigger, player) {
        const target = event.target, color = get3.color(event.cards[0], false);
        const result = await target.chooseToDiscard("h", "\u9510\u95EE\uFF1A\u5F03\u7F6E\u540C\u989C\u8272\u624B\u724C\uFF0C\u5426\u5219\u53D7\u52301\u70B9\u4F24\u5BB3", remoteChoice2("card => get.color(card) === _status.event.aiRuiwenColor")).set("aiRuiwenColor", color).set("ai", remoteChoice2("card => 7 - get.value(card)")).forResult();
        if (!result.bool && target.isIn()) await target.damage(1, player);
      },
      ai: { order: 6, result: { target: -1 } }
    },
    ai_zhuiwen: {
      trigger: { player: "shaMiss" },
      usable: 1,
      frequent: true,
      async content(event, trigger, player) {
        await player.draw();
      }
    }
  };
}

// game/resources/app/src/character/ai/skill.js
var skill_default = createAiSkills(game, get, lib);

// game/resources/app/src/character/ai/translate.js
var translate_default = {
  ac_chatgpt: "ChatGPT",
  ac_chatgpt_ab: "GPT",
  ai_doubao: "\u8C46\u5305",
  ai_deepseek: "DeepSeek",
  ai_claude: "Claude",
  ai_grok: "Grok",
  ac_tuiyan: "\u63A8\u6F14",
  ac_tuiyan_info: "\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u9879\uFF0C\u6BCF\u9879\u6BCF\u9636\u6BB5\u9650\u4E00\u6B21\uFF1A\u2460\u5C06\u624B\u724C\u6478\u81F3\u4F53\u529B\u4E0A\u9650\uFF0C\u7136\u540E\u76F4\u5230\u672C\u9636\u6BB5\u7ED3\u675F\uFF0C\u4F60\u4E0D\u80FD\u5BF9\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u724C\uFF1B\u2461\u5C06X\u5F20\u624B\u724C\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF08X\u4E3A\u4F60\u7684\u624B\u724C\u6570\u51CF\u53BB\u4F60\u7684\u4F53\u529B\u503C\uFF0C\u4E14\u987B\u5927\u4E8E0\uFF09\u3002",
  ai_banda: "\u4F34\u7B54",
  ai_banda_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5176\u4ED6\u89D2\u8272\u4E00\u6B21\u83B7\u5F97\u81F3\u5C11\u4E24\u5F20\u724C\u540E\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u5176\u6478\u4E00\u5F20\u724C\u3002\u7136\u540E\uFF0C\u82E5\u4F60\u7684\u624B\u724C\u6570\u5C0F\u4E8E\u5176\u624B\u724C\u6570\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002",
  ai_qingyu: "\u8F7B\u8BED",
  ai_qingyu_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4E00\u5F20\u624B\u724C\u3002\u4EA4\u724C\u540E\uFF0C\u82E5\u5176\u624B\u724C\u6570\u4E0D\u5927\u4E8E\u5176\u4F53\u529B\u503C\uFF0C\u5176\u6478\u4E00\u5F20\u724C\u3002",
  ai_shensuan: "\u6DF1\u7B97",
  ai_shensuan_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u624B\u724C\u5E76\u6478\u4E24\u5F20\u724C\u3002\u82E5\u6478\u5230\u7684\u4E24\u5F20\u724C\u989C\u8272\u76F8\u540C\uFF0C\u4F60\u989D\u5916\u6478\u4E00\u5F20\u724C\u3002",
  ai_chengsi: "\u6F84\u601D",
  ai_chengsi_info: "\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u7684\u624B\u724C\u6570\u81F3\u5C11\u4E3A\u4E09\uFF0C\u4F60\u53EF\u4EE5\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4E00\u5F20\u624B\u724C\u3002\u7136\u540E\uFF0C\u82E5\u5176\u5DF2\u53D7\u4F24\uFF0C\u5176\u56DE\u590D1\u70B9\u4F53\u529B\u3002",
  ai_shenshen: "\u5BA1\u614E",
  ai_shenshen_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4E00\u540D\u89D2\u8272\u53D7\u5230\u6709\u989C\u8272\u7684\u724C\u9020\u6210\u7684\u4F24\u5BB3\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u4E0E\u6B64\u724C\u989C\u8272\u76F8\u540C\u7684\u624B\u724C\uFF0C\u4EE4\u6B64\u4F24\u5BB3-1\u3002",
  ai_chengzhang: "\u6210\u7AE0",
  ai_chengzhang_info: "\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u4F7F\u7528\u8FC7\u81F3\u5C11\u4E24\u79CD\u7C7B\u522B\u7684\u724C\uFF0C\u4F60\u6478\u4E24\u5F20\u724C\u3002\uFF08\u57FA\u672C\u724C\u3001\u666E\u901A\u9526\u56CA\u4E0E\u5EF6\u65F6\u9526\u56CA\u5408\u8BA1\u7684\u9526\u56CA\u724C\u3001\u88C5\u5907\u724C\u4E3A\u4E09\u7C7B\u3002\uFF09",
  ai_ruiwen: "\u9510\u95EE",
  ai_ruiwen_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u6709\u989C\u8272\u7684\u624B\u724C\uFF0C\u4EE4\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u5F03\u7F6E\u4E00\u5F20\u540C\u989C\u8272\u624B\u724C\uFF0C\u5426\u5219\u4F60\u5BF9\u5176\u9020\u62101\u70B9\u4F24\u5BB3\u3002",
  ai_zhuiwen: "\u8FFD\u95EE",
  ai_zhuiwen_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F60\u4F7F\u7528\u7684\u3010\u6740\u3011\u88AB\u3010\u95EA\u3011\u62B5\u6D88\u540E\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002"
};

// game/resources/app/src/character/mushoku/expansion.js
import { lib as lib2, game as game2, get as get2, _status } from "noname";
var discardable = (card, player) => lib2.filter.cardDiscardable(card, player, "ac_haodu");
var suits = (cards) => new Set(cards.map((card) => get2.suit(card, false)).filter((suit) => ["heart", "diamond", "club", "spade"].includes(suit))).size;
var replayTargets = (player) => player.getStorage("ac_xuju");
var remoteChoice = (source) => get2.infoFuncOL("_noname_func:" + source);
var expansion_default = {
  ac_haodu: {
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player, target) {
      return target !== player;
    },
    async content(event, trigger, player) {
      const target = event.target;
      const results = await player.chooseCardOL([player, target], "he", [0, Infinity], true, "\u8C6A\u8D4C\uFF1A\u79D8\u5BC6\u9009\u62E9\u8981\u5F03\u7F6E\u7684\u724C\uFF0C\u53EF\u9009\u62E9\u96F6\u5F20", remoteChoice('(card, owner) => lib.filter.cardDiscardable(card, owner, "ac_haodu")')).set("ai", remoteChoice("card => 4 - get.value(card)")).forResult();
      const chosen = [player, target].map((who, i) => [who, (results[i]?.cards || []).filter((card) => who.getCards("he").includes(card) && discardable(card, who))]);
      const counts = chosen.map(([, cards]) => ({ count: cards.length, suits: suits(cards) }));
      if (chosen.some(([, cards]) => cards.length)) await game2.loseAsync({ lose_list: chosen.filter(([, cards]) => cards.length) }).setContent("discardMultiple");
      const limit = Number(counts[0].count >= counts[1].count) + Number(counts[0].suits >= counts[1].suits);
      player.storage.ac_haodu_last = { count: counts[0].count, last: null };
      player.syncStorage("ac_haodu_last");
      const remaining = ["\u4F24\u5BB3", "\u6478\u724C"];
      for (let i = 0; i < limit && player.isIn(); i++) {
        const options = remaining.filter((option) => option !== "\u4F24\u5BB3" || target.isIn());
        if (!options.length) break;
        const result = await player.chooseControl([...options, "cancel2"]).set("prompt", `\u8C6A\u8D4C\uFF1A\u8FD8\u53EF\u4F9D\u6B21\u6267\u884C${limit - i}\u9879\uFF08\u4F24\u5BB3\uFF1A\u5BF9\u76EE\u6807\u9020\u62101\u70B9\u4F24\u5BB3\uFF1B\u6478\u724C\uFF1A\u81EA\u5DF1\u6478\u4E09\u5F20\u724C\uFF09`).set("acHaoduPreferred", options.includes("\u4F24\u5BB3") && get2.attitude(player, target) < 0 ? "\u4F24\u5BB3" : "\u6478\u724C").set("ai", remoteChoice("() => _status.event.acHaoduPreferred")).forResult();
        if (!options.includes(result.control)) break;
        remaining.splice(remaining.indexOf(result.control), 1);
        player.storage.ac_haodu_last.last = result.control === "\u4F24\u5BB3" ? "damage" : "draw";
        player.syncStorage("ac_haodu_last");
        if (result.control === "\u4F24\u5BB3") await target.damage(1, player);
        else await player.draw(3);
      }
    },
    ai: { order: 6, result: { player: 1, target: -1 } }
  },
  ac_xuju: {
    trigger: { player: "phaseJieshuBegin" },
    direct: true,
    mark: true,
    marktext: "\u7EED",
    intro: { content: "\u5DF2\u7EED\u5C40\u89D2\u8272\uFF1A$" },
    filter(event, player) {
      const last = player.storage.ac_haodu_last;
      return !!last?.last && player.countCards("he", (card) => lib2.filter.cardDiscardable(card, player, "ac_xuju")) >= last.count && game2.hasPlayer((target) => target.isDamaged() && !replayTargets(player).includes(target));
    },
    async content(event, trigger, player) {
      const last = { ...player.storage.ac_haodu_last };
      const result = await player.chooseTarget(`\u7EED\u5C40\uFF1A\u5F03\u7F6E${last.count}\u5F20\u724C\uFF0C\u4EE4\u4E00\u540D\u5DF2\u53D7\u4F24\u4E14\u672A\u7EED\u5C40\u7684\u89D2\u8272${last.last === "draw" ? "\u6478\u4E09\u5F20\u724C" : "\u53D7\u5230\u4F60\u9020\u6210\u76841\u70B9\u4F24\u5BB3"}`, (card, source, target2) => target2.isDamaged() && !source.getStorage("ac_xuju").includes(target2)).set("ai", (target2) => get2.attitude(player, target2) * (last.last === "draw" ? 1 : -1)).forResult();
      if (!result.bool) return;
      if (last.count > 0) {
        const paid = await player.chooseToDiscard("he", last.count, true, "\u7EED\u5C40\uFF1A\u652F\u4ED8\u5F03\u724C\u8D39\u7528").forResult();
        if (!paid.bool || paid.cards?.length !== last.count) return;
      }
      const target = result.targets[0];
      player.logSkill("ac_xuju", target);
      player.markAuto("ac_xuju", [target]);
      if (!target.isIn()) return;
      if (last.last === "draw") await target.draw(3);
      else await target.damage(1, player);
    }
  },
  ac_zhangyan: {
    enable: "phaseUse",
    usable: 1,
    position: "he",
    filterCard: true,
    filter(event, player) {
      return player.countCards("he") > 0 && game2.hasPlayer((target) => target !== player && target.countCards("h") > 0);
    },
    filterTarget(card, player, target) {
      return target !== player && target.countCards("h") > 0;
    },
    async content(event, trigger, player) {
      const target = event.target;
      if (player.countCards("h")) await target.viewHandcards(player);
      if (!target.isIn() || !target.countCards("h")) return;
      await player.viewHandcards(target);
      await player.gainPlayerCard(target, "h", true, "visible");
    },
    ai: { order: 8, result: { target: -1 } }
  },
  ac_tuiyan: {
    enable: "phaseUse",
    filter(event, player) {
      return !player.hasSkill("ac_tuiyan_draw") || !player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game2.hasPlayer((target) => target !== player);
    },
    async content(event, trigger, player) {
      const choices = [];
      if (!player.hasSkill("ac_tuiyan_draw")) choices.push("\u8865\u5145\u624B\u724C");
      if (!player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game2.hasPlayer((target) => target !== player)) choices.push("\u4EA4\u4ED8\u624B\u724C");
      if (!choices.length) return;
      const result = await player.chooseControl(choices).set("prompt", "\u63A8\u6F14\uFF1A\u6BCF\u9879\u6BCF\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21").set("ai", remoteChoice("() => _status.event.controls[0]")).forResult();
      if (result.control === "\u8865\u5145\u624B\u724C") {
        player.addTempSkill("ac_tuiyan_draw", { player: "phaseUseAfter" });
        await player.drawTo(player.maxHp);
      } else if (result.control === "\u4EA4\u4ED8\u624B\u724C") {
        const num = player.countCards("h") - player.hp;
        if (num <= 0) return;
        const selected = await player.chooseTarget("\u63A8\u6F14\uFF1A\u9009\u62E9\u63A5\u6536\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272", true, (card, source, target) => target !== source).set("ai", remoteChoice("target => get.attitude(_status.event.player, target)")).forResult();
        if (!selected.bool) return;
        const given = await player.chooseToGive(selected.targets[0], "h", num, true).forResult();
        if (given.bool) player.addTempSkill("ac_tuiyan_give", { player: "phaseUseAfter" });
      }
    },
    ai: { order: 0.5, result: { player: 1 } },
    subSkill: {
      draw: { charlotte: true, mark: true, marktext: "\u6F14", intro: { content: "\u672C\u51FA\u724C\u9636\u6BB5\u4E0D\u80FD\u5BF9\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u724C\u3002" }, mod: { playerEnabled(card, player, target) {
        if (target !== player) return false;
      } } },
      give: { charlotte: true }
    }
  },
  mc_fengcang: {
    zhuanhuanji: true,
    locked: true,
    forced: true,
    mark: true,
    marktext: "\u950B",
    intro: { content(storage) {
      return storage ? "\u9634\uFF1A\u5176\u4ED6\u89D2\u8272\u81F3\u4F60\u7684\u8DDD\u79BB+1\uFF1B\u4E0D\u80FD\u54CD\u5E94\u5176\u4ED6\u89D2\u8272\u7684\u7EA2\u8272\u6740\u3002" : "\u9633\uFF1A\u4F60\u81F3\u5176\u4ED6\u89D2\u8272\u7684\u8DDD\u79BB-1\uFF1B\u9ED1\u8272\u6740\u4E0D\u53EF\u54CD\u5E94\u3002";
    } },
    trigger: { player: ["phaseZhunbeiBegin", "phaseJieshuBegin"] },
    async content(event, trigger, player) {
      const yin = trigger.name === "phaseJieshu";
      if (!!player.storage.mc_fengcang !== yin) player.changeZhuanhuanji("mc_fengcang");
    },
    mod: {
      globalFrom(from, to, distance) {
        if (!from.storage.mc_fengcang) return distance - 1;
      },
      globalTo(from, to, distance) {
        if (to.storage.mc_fengcang) return distance + 1;
      }
    },
    group: ["mc_fengcang_black", "mc_fengcang_red"],
    subSkill: {
      black: { charlotte: true, forced: true, trigger: { player: "useCard" }, filter(event, player) {
        return !player.storage.mc_fengcang && event.card.name === "sha" && get2.color(event.card) === "black";
      }, async content(event, trigger) {
        trigger.directHit.addArray(game2.players);
      } },
      red: { charlotte: true, forced: true, trigger: { target: "useCardToTargeted" }, filter(event, player) {
        return !!player.storage.mc_fengcang && event.player !== player && event.card.name === "sha" && get2.color(event.card) === "red";
      }, async content(event, trigger, player) {
        trigger.getParent().directHit.add(player);
      } }
    }
  },
  mc_xiejia: {
    trigger: { source: "damageBegin2" },
    filter(event, player) {
      return event.player !== player && event.num > 0 && event.player.countGainableCards(player, "e") > 0;
    },
    check(event, player) {
      return event.num > 1 || get2.attitude(player, event.player) > 0 || event.player.countCards("e") > 0;
    },
    async content(event, trigger, player) {
      trigger.num--;
      await player.gainPlayerCard(trigger.player, "e", true);
    }
  },
  mc_rongzhu: {
    enable: "chooseToUse",
    position: "hes",
    selectCard: 1,
    filterCard(card) {
      return get2.type(card) === "equip";
    },
    viewAs: { name: "jiu" },
    viewAsFilter(player) {
      return player.countCards("hes", (card) => get2.type(card) === "equip") > 0;
    },
    check(card) {
      return 6 - get2.value(card);
    },
    mod: { maxHandcard(player, num) {
      return num + player.countCards("e");
    } },
    ai: { order: 5 }
  }
};

// game/resources/app/src/character/ai/index.js
game3.import("character", () => ({
  name: "ai",
  connect: true,
  character: character_default,
  skill: { ...skill_default, ac_tuiyan: expansion_default.ac_tuiyan },
  translate: translate_default,
  characterTitle: titlesForPack("ai"),
  characterIntro: Object.fromEntries(Object.keys(character_default).map((id) => [id, "\u7531\u5927\u6A21\u578B\u4EA7\u54C1\u98CE\u683C\u542F\u53D1\u7684\u5E7B\u60F3\u89D2\u8272\u3002\u6280\u80FD\u7528\u4E8E\u6E38\u620F\u521B\u4F5C\uFF0C\u4E0D\u4EE3\u8868\u6A21\u578B\u80FD\u529B\u6392\u884C\u6216\u5B98\u65B9\u8BBE\u5B9A\u3002"]))
}));
