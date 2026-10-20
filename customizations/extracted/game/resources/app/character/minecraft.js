// game/resources/app/src/character/minecraft/index.js
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

// game/resources/app/src/character/minecraft/character.js
var character_default = Object.fromEntries(Object.entries(mushoku_characters_default).filter(([id]) => id.startsWith("mc_")));

// game/resources/app/src/character/minecraft/skill.js
import { game, get } from "noname";
var hunted = (player) => [...new Set(player.getHistory("useCard").flatMap((evt) => evt.targets || []))].filter((target) => target !== player && target.isIn() && target.getHistory("damage").some((evt) => evt.num > 0));
var skill_default = {
  mc_choumou: {
    chargeSkill: 0,
    forced: true,
    locked: false,
    trigger: { player: "loseAfter", global: ["loseAsyncAfter", "gainAfter", "addToExpansionAfter", "addJudgeAfter", "equipAfter", "phaseBegin"] },
    filter(event, player) {
      if (event.name === "phase") return player.countCharge() === player.getMaxCharge();
      return player.countCharge(true) > 0 && (event.getl?.(player)?.cards2 || []).some((card) => !get.is.damageCard(card));
    },
    async content(event, trigger, player) {
      if (trigger.name === "phase") {
        await player.draw();
        player.addMark("mc_choumou", 1, false);
        player.markSkill("charge");
      } else {
        const count = trigger.getl(player).cards2.filter((card) => !get.is.damageCard(card)).length;
        player.addCharge(count);
      }
    },
    mod: { maxCharge(player, num) {
      return num + player.countMark("mc_choumou");
    } },
    group: "mc_choumou_spend",
    subSkill: {
      spend: {
        enable: "phaseUse",
        usable: 1,
        filter(event, player) {
          return player.countCharge() > 0;
        },
        async content(event, trigger, player) {
          const result = await player.chooseNumbers("\u7B79\u8C0B\uFF1A\u9009\u62E9\u6D88\u8017\u7684\u84C4\u529B\u70B9\u6570", [{ prompt: "\u6D88\u8017\u70B9\u6570", min: 1, max: player.countCharge() }]).set("processAI", () => [Math.min(player.countCharge(), 8)]).forResult();
          if (!result.bool || !result.numbers?.length) return;
          const num = result.numbers[0];
          if (!Number.isInteger(num) || num < 1 || num > player.countCharge()) return;
          player.removeCharge(num);
          const chosen = await player.chooseTarget(`\u7B79\u8C0B\uFF1A\u4EE4\u81F3\u591A${num}\u540D\u89D2\u8272\u5404\u83B7\u5F97\u4E00\u5F20\u7EA2\u6843\u724C`, [1, Math.min(num, game.countPlayer())], true).set("ai", (target) => get.attitude(player, target)).forResult();
          if (!chosen.bool) return;
          for (const target of chosen.targets) {
            if (!target.isIn()) continue;
            const card = get.cardPile((card2) => get.suit(card2) === "heart", void 0, "random");
            if (card) await target.gain(card, "gain2");
          }
        },
        ai: { order: 8, result: { player: 1 } }
      }
    }
  },
  mc_xianyi: {
    forced: true,
    trigger: { player: "removeMark" },
    filter(event) {
      return event.markName === "charge" && event.num >= 4;
    },
    async content(event, trigger, player) {
      const cards = [];
      for (const [threshold, name] of [[4, "wuzhong"], [6, "wuxie"], [8, "wugu"]]) {
        if (trigger.num < threshold) continue;
        const card = get.discardPile((card2) => get.name(card2) === name);
        if (card) cards.push(card);
      }
      if (cards.length) await player.gain(cards, "gain2");
    }
  },
  mc_xianzhui: {
    trigger: { global: "phaseEnd" },
    filter(event, player) {
      return hunted(player).length > 0 && event.player.isIn() && event.player.countDiscardableCards(player, "he") > 0;
    },
    check(event, player) {
      return get.attitude(player, event.player) < 0 || hunted(player).some((target) => get.effect(target, { name: "shunshou" }, player, player) > 0);
    },
    async content(event, trigger, player) {
      const payment = await player.discardPlayerCard(trigger.player, "he", true).forResult();
      if (!payment.bool) return;
      const card = get.autoViewAs({ name: "shunshou", isCard: true });
      const targets = hunted(player).filter((target) => player.canUse(card, target, false));
      const max = targets.length;
      if (!max) return;
      await player.chooseUseTarget({
        card,
        prompt: `\u8854\u8FFD\uFF1A\u5BF9\u81F3\u591A${max}\u540D\u672C\u56DE\u5408\u66FE\u6307\u5B9A\u7684\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u65E0\u8DDD\u79BB\u9650\u5236\u7684\u3010\u987A\u624B\u7275\u7F8A\u3011`,
        selectTarget: [1, max],
        forced: true,
        filterTarget(card2, source, target) {
          return targets.includes(target) && source.canUse(card2, target, false);
        }
      }).set("nodistance", true);
    }
  }
};

// game/resources/app/src/character/minecraft/translate.js
var translate_default = {
  minecraft: "Minecraft",
  mc_dream: "Dream",
  mc_dream_ab: "Dream",
  mc_choumou: "\u7B79\u8C0B",
  mc_choumou_spend: "\u7B79\u8C0B",
  mc_choumou_info: "\u84C4\u529B\u6280\uFF080/0\uFF09\uFF0C\u6BCF\u540D\u89D2\u8272\u7684\u56DE\u5408\u5F00\u59CB\u65F6\uFF0C\u82E5\u4F60\u7684\u84C4\u529B\u70B9\u5DF2\u6EE1\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u4E14\u84C4\u529B\u70B9\u4E0A\u9650+1\u3002\u5F53\u4F60\u5931\u53BB\u4E00\u5F20\u975E\u4F24\u5BB3\u724C\u540E\uFF0C\u4F60\u83B7\u5F971\u70B9\u84C4\u529B\u70B9\uFF08\u4E00\u6B21\u5931\u53BB\u591A\u5F20\u65F6\u6309\u5F20\u6570\u8BA1\u7B97\uFF09\u3002\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u6D88\u8017\u4EFB\u610F\u70B9\u84C4\u529B\u70B9\uFF0C\u4EE4\u81F3\u591A\u7B49\u91CF\u540D\u89D2\u8272\u4ECE\u724C\u5806\u6216\u5F03\u724C\u5806\u4E2D\u5404\u968F\u673A\u83B7\u5F97\u4E00\u5F20\u7EA2\u6843\u724C\u3002",
  mc_xianyi: "\u9669\u9038",
  mc_xianyi_info: "\u9501\u5B9A\u6280\uFF0C\u5F53\u4F60\u4E00\u6B21\u6027\u6D88\u8017\u7684\u84C4\u529B\u70B9\u4E0D\u5C0F\u4E8E4/6/8\u65F6\uFF0C\u4F60\u4ECE\u5F03\u724C\u5806\u4E2D\u5206\u522B\u83B7\u5F97\u4E00\u5F20\u3010\u65E0\u4E2D\u751F\u6709\u3011/\u3010\u65E0\u61C8\u53EF\u51FB\u3011/\u3010\u4E94\u8C37\u4E30\u767B\u3011\uFF08\u8FBE\u5230\u66F4\u9AD8\u95E8\u69DB\u65F6\u7D2F\u8BA1\u83B7\u5F97\uFF1B\u7F3A\u5C11\u7684\u724C\u8DF3\u8FC7\uFF09\u3002",
  mc_xianzhui: "\u8854\u8FFD",
  mc_xianzhui_info: "\u4E00\u540D\u89D2\u8272\u7684\u56DE\u5408\u7ED3\u675F\u65F6\uFF0C\u82E5\u5B58\u5728\u672C\u56DE\u5408\u6210\u4E3A\u8FC7\u4F60\u724C\u76EE\u6807\u4E14\u672C\u56DE\u5408\u53D7\u5230\u8FC7\u4F24\u5BB3\u7684\u5176\u4ED6\u89D2\u8272\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u5F53\u524D\u56DE\u5408\u89D2\u8272\u7684\u4E00\u5F20\u624B\u724C\u6216\u88C5\u5907\u724C\uFF0C\u7136\u540E\u89C6\u4E3A\u5BF9\u5176\u4E2D\u4EFB\u610F\u540D\u89D2\u8272\u4F7F\u7528\u4E00\u5F20\u65E0\u8DDD\u79BB\u9650\u5236\u7684\u3010\u987A\u624B\u7275\u7F8A\u3011\uFF08\u4ECD\u987B\u7B26\u5408\u5176\u4ED6\u7528\u724C\u6761\u4EF6\uFF09\u3002"
};

// game/resources/app/src/character/mushoku/expansion.js
import { lib, game as game2, get as get2, _status } from "noname";
var discardable = (card, player) => lib.filter.cardDiscardable(card, player, "ac_haodu");
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
      return !!last?.last && player.countCards("he", (card) => lib.filter.cardDiscardable(card, player, "ac_xuju")) >= last.count && game2.hasPlayer((target) => target.isDamaged() && !replayTargets(player).includes(target));
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

// game/resources/app/src/character/mushoku/expansion-translate.js
var expansion_translate_default = {
  ac_yumeko: "\u86C7\u55B0\u68A6\u5B50",
  ac_yumeko_ab: "\u68A6\u5B50",
  ac_haodu: "\u8C6A\u8D4C",
  ac_haodu_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u4E0E\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u540C\u65F6\u79D8\u5BC6\u9009\u62E9\u5F03\u7F6E\u4EFB\u610F\u5F20\u624B\u724C\u6216\u88C5\u5907\u724C\uFF08\u53EF\u4E3A\u96F6\u5F20\uFF09\u3002\u7136\u540E\u4F60\u53EF\u4EE5\u9009\u62E9\u5E76\u4F9D\u6B21\u6267\u884C\u81F3\u591AX\u4E2A\u4E0D\u540C\u9009\u9879\uFF1A\u2460\u5BF9\u5176\u9020\u62101\u70B9\u4F24\u5BB3\uFF1B\u2461\u4F60\u6478\u4E09\u5F20\u724C\u3002X\u4E3A\u4EE5\u4E0B\u6761\u4EF6\u4E2D\u6EE1\u8DB3\u7684\u9879\u6570\uFF1A\u4F60\u5F03\u7F6E\u7684\u724C\u6570\u4E0D\u5C0F\u4E8E\u5176\uFF1B\u4F60\u5F03\u7F6E\u7684\u724C\u7684\u82B1\u8272\u6570\u4E0D\u5C0F\u4E8E\u5176\u3002",
  ac_xuju: "\u7EED\u5C40",
  ac_xuju_info: "\u6BCF\u540D\u89D2\u8272\u9650\u4E00\u6B21\u3002\u7ED3\u675F\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5DF2\u53D7\u4F24\u89D2\u8272\uFF0C\u5F03\u7F6EX\u5F20\u624B\u724C\u6216\u88C5\u5907\u724C\uFF08X\u4E3A\u4F60\u4E0A\u6B21\u53D1\u52A8\u8C6A\u8D4C\u65F6\u5F03\u7F6E\u7684\u724C\u6570\uFF09\uFF0C\u4EE4\u5176\u6267\u884C\u4E0A\u6B21\u8C6A\u8D4C\u6267\u884C\u7684\u6700\u540E\u4E00\u9879\uFF1A\u53D7\u5230\u4F60\u9020\u6210\u76841\u70B9\u4F24\u5BB3\uFF0C\u6216\u6478\u4E09\u5F20\u724C\u3002\u672A\u6267\u884C\u8FC7\u4EFB\u4F55\u9009\u9879\u65F6\u4E0D\u53EF\u53D1\u52A8\u3002",
  ac_kaito: "\u602A\u76D7\u57FA\u5FB7",
  ac_kaito_ab: "\u57FA\u5FB7",
  ac_zhangyan: "\u969C\u773C",
  ac_zhangyan_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u9009\u62E9\u4E00\u540D\u6709\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272\uFF0C\u4EE4\u5176\u89C2\u770B\u4F60\u7684\u624B\u724C\uFF0C\u7136\u540E\u4F60\u89C2\u770B\u5176\u624B\u724C\u5E76\u83B7\u5F97\u5176\u4E2D\u4E00\u5F20\u3002",
  ac_chatgpt: "ChatGPT",
  ac_chatgpt_ab: "GPT",
  ac_tuiyan: "\u63A8\u6F14",
  ac_tuiyan_info: "\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u9879\uFF0C\u6BCF\u9879\u6BCF\u9636\u6BB5\u9650\u4E00\u6B21\uFF1A\u2460\u5C06\u624B\u724C\u6478\u81F3\u4F53\u529B\u4E0A\u9650\uFF0C\u7136\u540E\u76F4\u5230\u672C\u9636\u6BB5\u7ED3\u675F\uFF0C\u4F60\u4E0D\u80FD\u5BF9\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u724C\uFF1B\u2461\u5C06X\u5F20\u624B\u724C\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF08X\u4E3A\u4F60\u7684\u624B\u724C\u6570\u51CF\u53BB\u4F60\u7684\u4F53\u529B\u503C\uFF0C\u4E14\u987B\u5927\u4E8E0\uFF09\u3002",
  mc_netherite: "\u4E0B\u754C\u5408\u91D1\u5251",
  mc_netherite_ab: "\u5408\u91D1\u5251",
  mc_fengcang: "\u950B\u85CF",
  mc_fengcang_info: "\u8F6C\u6362\u6280\uFF0C\u9501\u5B9A\u6280\u3002\u51C6\u5907\u9636\u6BB5\u8F6C\u4E3A\u9633\uFF0C\u7ED3\u675F\u9636\u6BB5\u8F6C\u4E3A\u9634\u3002\u9633\uFF1A\u4F60\u8BA1\u7B97\u4E0E\u5176\u4ED6\u89D2\u8272\u7684\u8DDD\u79BB-1\uFF0C\u4F60\u4F7F\u7528\u7684\u9ED1\u8272\u6740\u4E0D\u53EF\u88AB\u54CD\u5E94\uFF1B\u9634\uFF1A\u5176\u4ED6\u89D2\u8272\u8BA1\u7B97\u4E0E\u4F60\u7684\u8DDD\u79BB+1\uFF0C\u4F60\u4E0D\u53EF\u54CD\u5E94\u5176\u4ED6\u89D2\u8272\u5BF9\u4F60\u4F7F\u7528\u7684\u7EA2\u8272\u6740\u3002\u521D\u59CB\u4E3A\u9633\u3002",
  mc_xiejia: "\u5378\u7532",
  mc_xiejia_info: "\u5F53\u4F60\u5BF9\u5176\u4ED6\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u65F6\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u6B64\u4F24\u5BB3-1\uFF0C\u5E76\u83B7\u5F97\u5176\u88C5\u5907\u533A\u91CC\u7684\u4E00\u5F20\u724C\u3002",
  mc_rongzhu: "\u7194\u94F8",
  mc_rongzhu_info: "\u4F60\u53EF\u4EE5\u5C06\u4E00\u5F20\u88C5\u5907\u724C\u5F53\u9152\u4F7F\u7528\u3002\u4F60\u7684\u624B\u724C\u4E0A\u9650+X\uFF08X\u4E3A\u4F60\u88C5\u5907\u533A\u91CC\u7684\u724C\u6570\uFF09\u3002"
};

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

// game/resources/app/src/character/minecraft/index.js
game3.import("character", () => ({
  name: "minecraft",
  connect: true,
  character: character_default,
  skill: { ...skill_default, ...Object.fromEntries(Object.entries(expansion_default).filter(([id]) => id.startsWith("mc_"))) },
  translate: { ...translate_default, ...Object.fromEntries(Object.entries(expansion_translate_default).filter(([id]) => id.startsWith("mc_"))) },
  characterTitle: titlesForPack("minecraft"),
  characterIntro: { mc_dream: "Dream\uFF0C\u730E\u4EBA\u6E38\u620F\u4F20\u5947\u3002\u7B79\u8C0B\u79EF\u84C4\u7269\u8D44\uFF0C\u9669\u9038\u5728\u7EDD\u5883\u4E2D\u5BFB\u627E\u8F6C\u673A\uFF0C\u8854\u8FFD\u6301\u7EED\u8FFD\u730E\u3002", mc_netherite: "\u4F59\u70EC\u4E4B\u950B\u3002\u81EA\u4E0B\u754C\u70C8\u7130\u4E2D\u7194\u94F8\u800C\u751F\u7684\u5229\u5203\uFF0C\u653B\u5B88\u968F\u9634\u9633\u8F6C\u6362\u3002" }
}));
