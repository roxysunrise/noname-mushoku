// game/resources/app/src/character/mushoku/index.js
import { game as game5 } from "noname";

// game/resources/app/src/noname/init/mushoku-characters.js
var characters = {
  ac_yumeko: { sex: "female", group: "huan", hp: 4, maxHp: 4, skills: ["ac_haodu", "ac_xuju"], img: "image/character/ac_yumeko.jpg" },
  ac_kaito: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_zhangyan"], img: "image/character/ac_kaito.jpg" },
  ac_chatgpt: { sex: "none", group: "xu", hp: 4, maxHp: 4, skills: ["ac_tuiyan"], img: "image/character/ac_chatgpt.jpg" },
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

// game/resources/app/src/character/mushoku/character.js
var character_default = Object.fromEntries(Object.entries(mushoku_characters_default).filter(([id]) => !id.startsWith("mc_")));

// game/resources/app/src/character/mushoku/skill.js
import { lib, game, get, _status } from "noname";
var attack = (event) => event.card?.name === "sha";
var level = (player) => Math.min(4, player.countMark("mt_study"));
var skills = {
  mt_voiceless: {
    enable: "phaseUse",
    usable: 1,
    position: "h",
    filterCard: (card) => get.type(card) === "basic" || get.type2(card) === "trick",
    viewAs: { name: "sha", nature: "fire" },
    check: (card) => 6 - get.value(card),
    ai: { order: 5 },
    group: "mt_voiceless_draw",
    subSkill: { draw: {
      trigger: { source: "damageSource" },
      direct: true,
      filter: (event) => event.num > 0 && event.getParent("useCard")?.skill === "mt_voiceless" && event.cards?.some((card) => get.type2(card, false) === "trick"),
      async content(event, trigger, player) {
        const result = await player.chooseTarget("\u65E0\u548F\uFF1A\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C", (card, source, target) => target.isIn()).set("ai", (target) => get.attitude(player, target)).forResult();
        if (result.bool) {
          player.logSkill("mt_voiceless", result.targets);
          await result.targets[0].draw();
        }
      }
    } }
  },
  mt_foresight: {
    trigger: { target: "useCardToTargeted" },
    usable: 1,
    filter: (event, player) => event.player !== player && (attack(event) || player.hp <= 2 && get.type2(event.card) === "trick" && get.tag(event.card, "damage")),
    async cost(event, trigger, player) {
      event.result = await player.chooseToDiscard("he", "\u9884\u89C1\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u724C\u5BF9\u4F60\u65E0\u6548").set("ai", (card) => 7 - get.value(card)).set("chooseonly", true).forResult();
    },
    async content(event, trigger, player) {
      await player.discard(event.cards);
      trigger.getParent().excluded.add(player);
    }
  },
  mt_study: {
    trigger: { player: "phaseJieshuBegin" },
    forced: true,
    filter: (event, player) => level(player) < 4 && player.getHistory("useCard", (evt) => get.type2(evt.card) === "trick").length > 0,
    async content(event, trigger, player) {
      player.addMark("mt_study", 1);
      if (level(player) === 2 || level(player) === 4) await player.draw();
    },
    marktext: "\u7814",
    intro: { content: "mark", name: "\u7814\u4E60\uFF08\u4E0A\u96504\uFF09" },
    mod: { maxHandcard(player, num) {
      return num + Math.floor(level(player) / 2);
    } }
  },
  mt_water: {
    enable: "phaseUse",
    usable: 1,
    position: "he",
    selectCard: 1,
    filterCard: (card) => get.color(card) === "black",
    filterTarget: (card, player, target) => target !== player,
    check: (card) => 6 - get.value(card),
    async content(event, trigger, player) {
      const target = event.target;
      const count = level(player) >= 2 ? 2 : 1;
      const result = await target.chooseToDiscard(count, "he", `\u6C34\u672F\uFF1A\u5F03\u7F6E${count}\u5F20\u724C\uFF0C\u5426\u5219\u53D7\u52301\u70B9${level(player) === 4 ? "\u96F7\u7535" : "\u666E\u901A"}\u4F24\u5BB3`).set("ai", (card) => 7 - get.value(card)).forResult();
      if (!result.bool) {
        if (level(player) === 4) await target.damage(1, player, "thunder");
        else await target.damage(1, player);
      }
    },
    ai: { order: 6, result: { target: -1 } }
  },
  mt_mentor: {
    trigger: { global: "useCardAfter" },
    round: 1,
    filter: (event, player) => attack(event) && event.player !== player && event.player === _status.currentPhase && event.player.isIn(),
    check: (event, player) => get.attitude(player, event.player) > 0,
    async content(event, trigger, player) {
      const bonus = trigger.player.getHistory("useCard", (evt) => get.type(evt.card) === "trick").length > 0;
      await trigger.player.draw();
      if (bonus && player.isIn()) await player.draw();
    }
  },
  mt_heal: {
    enable: "phaseUse",
    usable: 1,
    position: "he",
    selectCard: 1,
    filterCard: (card) => get.color(card) === "red",
    filterTarget: (card, player, target) => target.isDamaged(),
    check: (card) => 7 - get.value(card),
    async content(event, trigger, player) {
      await event.target.recover();
      if (get.type2(event.cards[0]) === "trick" && player.isIn()) await player.draw();
    },
    ai: { order: 7, result: { target: 2 } }
  },
  mt_guard: {
    trigger: { global: "damageBegin4" },
    usable: 1,
    filter: (event, player) => event.player !== player && event.player.isIn() && player.countCards("he") > 0 && event.num > 0,
    async cost(event, trigger, player) {
      const good = get.attitude(player, trigger.player) > 0;
      event.result = await player.chooseToDiscard("he", "\u5B88\u62A4\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u6B21\u4F24\u5BB3-1").set("chooseonly", true).set("ai", (card) => good ? 6 - get.value(card) : 0).forResult();
    },
    async content(event, trigger, player) {
      await player.discard(event.cards);
      trigger.num--;
    }
  },
  mt_sword: {
    trigger: { player: "useCardToPlayered" },
    usable: 1,
    filter: (event, player) => attack(event) && player.isPhaseUsing() && event.targets.length === 1 && player.hp > 0,
    check: (event, player) => player.hp > 1 && get.attitude(player, event.target) < 0,
    async content(event, trigger, player) {
      await player.loseHp();
      trigger.getParent().directHit.add(trigger.target);
    }
  },
  mt_resolve: {
    trigger: { player: "phaseJieshuBegin" },
    filter: (event, player) => player.getHistory("sourceDamage").length > 0,
    frequent: true,
    async content(event, trigger, player) {
      await player.draw(player.hp <= 2 ? 2 : player.getHistory("sourceDamage").reduce((sum, evt) => sum + evt.num, 0));
    }
  },
  mt_dragon: {
    init(player) {
      if (!player.storage.mt_dragon_initialized) {
        player.storage.mt_dragon_initialized = true;
        player.addMark("mt_dragon", 3);
      }
    },
    marktext: "\u9F99",
    intro: { content: "mark", name: "\u9F99\u529B\uFF08\u4E0A\u96503\uFF09" },
    mod: { targetInRange(card) {
      if (card.name === "sha") return true;
    } },
    group: ["mt_dragon_strike", "mt_dragon_defend", "mt_dragon_rest"],
    subSkill: {
      rest: {
        trigger: { player: "phaseJieshuBegin" },
        forced: true,
        filter: (event, player) => player.countMark("mt_dragon") < 3 && player.getHistory("sourceDamage").length === 0,
        async content(event, trigger, player) {
          player.addMark("mt_dragon", 1);
        }
      },
      strike: {
        trigger: { source: "damageBegin1" },
        usable: 1,
        filter: (event, player) => attack(event) && player.isPhaseUsing() && event.player !== player && player.countMark("mt_dragon") > 0,
        check: (event, player) => get.attitude(player, event.player) < 0,
        async content(event, trigger, player) {
          player.removeMark("mt_dragon", 1);
          trigger.num++;
        }
      },
      defend: {
        trigger: { player: "damageBegin4" },
        usable: 1,
        filter: (event, player) => event.num > 0 && player.countMark("mt_dragon") > 0,
        check: (event) => event.num > 0,
        async content(event, trigger, player) {
          player.removeMark("mt_dragon", 1);
          trigger.num--;
        }
      }
    }
  },
  mt_dragonlord: {
    zhuSkill: true,
    trigger: { player: "phaseZhunbeiBegin" },
    forced: true,
    filter: (event, player) => player.identity === "zhu" && player.hasZhuSkill("mt_dragonlord"),
    async content(event, trigger, player) {
      if (player.countMark("mt_dragon") < 3) player.addMark("mt_dragon", 1);
      const result = await player.chooseTarget("\u9F99\u76DF\uFF1A\u53EF\u4EE4\u4E00\u540D\u5176\u4ED6\u5E7B\u6216\u795E\u52BF\u529B\u89D2\u8272\u6478\u4E00\u5F20\u724C\uFF0C\u7136\u540E\u4F60\u6478\u4E00\u5F20\u724C", (card, source, target) => target !== source && ["huan", "shen"].includes(target.group)).set("ai", (target) => get.attitude(player, target)).forResult();
      if (result.bool) {
        await result.targets[0].draw();
        if (player.isIn()) await player.draw();
      }
    }
  },
  mt_eye: { mod: { globalFrom(from, to, distance) {
    return distance - (from.hp <= 2 ? 2 : 1);
  } } },
  mt_protect: {
    trigger: { global: "damageEnd" },
    usable: 1,
    filter: (event, player) => event.player !== player && event.player.isIn() && event.player.hp <= player.hp && player.countCards("he") > 0,
    async cost(event, trigger, player) {
      const good = get.attitude(player, trigger.player) > 0;
      event.result = await player.chooseToDiscard("he", "\u62A4\u5E7C\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u53D7\u4F24\u89D2\u8272\u4F53\u529B\u5927\u4E8E1\u65F6\u6478\u4E24\u5F20\u724C\uFF0C\u5426\u5219\u56DE\u590D1\u70B9\u4F53\u529B\u5E76\u6478\u4E00\u5F20\u724C").set("chooseonly", true).set("ai", (card) => good ? 7 - get.value(card) : 0).forResult();
    },
    async content(event, trigger, player) {
      await player.discard(event.cards);
      if (!trigger.player.isIn()) return;
      if (trigger.player.hp > 1) await trigger.player.draw(2);
      else {
        await trigger.player.recover();
        if (trigger.player.isIn()) await trigger.player.draw();
      }
    }
  },
  mt_spear: {
    enable: "phaseUse",
    usable: 1,
    filter(event, player) {
      return game.hasPlayer((target) => target !== player && player.canUse({ name: "sha", isCard: true }, target, void 0, false));
    },
    filterTarget(card, player, target) {
      return target !== player && player.canUse({ name: "sha", isCard: true }, target, void 0, false);
    },
    async content(event, trigger, player) {
      if (!event.target.isIn() || !player.canUse({ name: "sha", isCard: true }, event.target, void 0, false)) return;
      const use = player.useCard({ name: "sha", isCard: true }, event.target, false);
      if (player.hp <= 1) use.directHit = [event.target];
      await use;
    },
    ai: { order: 6, result: { target: -1 } }
  },
  mt_styles: {
    enable: "phaseUse",
    usable: 1,
    position: "he",
    selectCard: 1,
    filterCard: true,
    check: (card) => 5 - get.value(card),
    async content(event, trigger, player) {
      const type = get.type2(event.cards[0]);
      if (type === "basic") await player.draw(2);
      else if (type === "equip") await player.recover();
      else player.addTempSkill("mt_styles_range", "phaseUseAfter");
    },
    ai: { order: 4, result: { player: 1 } },
    subSkill: { range: { charlotte: true, mod: { cardUsable(card, player, num) {
      if (card.name === "sha") return num + 1;
    }, targetInRange(card) {
      if (card.name === "sha") return true;
    } } } }
  },
  mt_rescue: {
    trigger: { global: "dying" },
    round: 1,
    filter: (event, player) => event.player !== player && event.player.isIn() && event.player.hp <= 0 && player.hp > 1,
    check: (event, player) => get.attitude(player, event.player) > 0,
    async content(event, trigger, player) {
      await player.loseHp();
      const target = trigger.player;
      if (!target.isIn()) return;
      await target.recover();
      if (!player.isIn() || !target.isIn() || target.maxHp >= player.maxHp) return;
      const result = await player.chooseBool("\u6551\u63F4\uFF1A\u5C06\u4F60\u76841\u70B9\u4F53\u529B\u4E0A\u9650\u8F6C\u79FB\u7ED9\u8BE5\u89D2\u8272\uFF0C\u7136\u540E\u6478\u4E00\u5F20\u724C\uFF1F").set("ai", () => player.maxHp > 2 && get.attitude(player, target) > 0).forResult();
      if (result.bool) {
        await player.loseMaxHp();
        if (target.isIn()) await target.gainMaxHp();
        if (player.isIn()) await player.draw();
      }
    }
  },
  mt_swordking: {
    trigger: { source: "damageBegin1" },
    usable: 1,
    filter: (event, player) => attack(event) && player.isPhaseUsing() && event.player.hp >= player.hp && event.player !== player,
    forced: true,
    async content(event, trigger) {
      trigger.num++;
    }
  },
  mt_training: {
    trigger: { player: "phaseZhunbeiBegin" },
    usable: 1,
    filter: (event, player) => player.countCards("he") > 0 && game.hasPlayer((target) => target !== player && !target.hasSkill("mt_training_intent")),
    async cost(event, trigger, player) {
      const discard = await player.chooseToDiscard("he", "\u6388\u5251\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u6388\u4E88\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u5251\u610F").set("chooseonly", true).forResult();
      if (!discard.bool) {
        event.result = { bool: false };
        return;
      }
      const target = await player.chooseTarget("\u6388\u5251\uFF1A\u9009\u62E9\u4E00\u540D\u6CA1\u6709\u5251\u610F\u7684\u5176\u4ED6\u89D2\u8272", (card, source, target2) => target2 !== source && !target2.hasSkill("mt_training_intent")).set("ai", (target2) => get.attitude(player, target2)).forResult();
      event.result = { bool: target.bool, cards: discard.cards, targets: target.targets };
    },
    async content(event, trigger, player) {
      await player.discard(event.cards);
      const target = event.targets[0];
      if (!target.isIn()) return;
      target.storage.mt_training_intent = { teacher: player, active: false };
      target.addTempSkill("mt_training_intent", { player: "phaseAfter" });
    },
    subSkill: { intent: {
      charlotte: true,
      mark: true,
      marktext: "\u5251",
      intro: { content: "\u4E0B\u4E2A\u56DE\u5408\u7B2C\u4E00\u5F20\u6740\u4F24\u5BB3+1\uFF1B\u9020\u6210\u4F24\u5BB3\u540E\u6388\u4E88\u8005\u6478\u4E00\u5F20\u724C\u3002\u4E0D\u53E0\u52A0\u3002" },
      onremove: true,
      forced: true,
      popup: false,
      trigger: { player: ["phaseBegin", "useCard1"], source: ["damageBegin1", "damageSource"] },
      filter(event, player) {
        const state = player.storage.mt_training_intent;
        if (!state) return false;
        if (event.name === "phase") return true;
        if (event.name === "useCard") return state.active && !state.card && attack(event);
        return !!state.card && event.card === state.card && event.name === "damage" && event.num > 0;
      },
      async content(event, trigger, player) {
        const state = player.storage.mt_training_intent;
        if (trigger.name === "phase") state.active = true;
        else if (trigger.name === "useCard") state.card = trigger.card;
        else if (event.triggername === "damageBegin1") trigger.num++;
        else if (!state.rewarded) {
          state.rewarded = true;
          if (state.teacher.isIn()) await state.teacher.draw();
        }
      }
    } }
  },
  mt_ghislaine_guard: {
    trigger: { player: "damageBegin4" },
    usable: 1,
    filter: (event) => event.num > 0,
    check: (event, player) => player.hp > 1 || event.num > 1,
    async content(event, trigger, player) {
      trigger.cancel();
      await player.loseHp();
      if (player.isIn()) await player.draw(2);
    }
  }
};
var skill_default = skills;

// game/resources/app/src/character/mushoku/translate.js
var translate_default = {
  mushoku: "\u4E8C\u6B21\u5143",
  th_mokou: "\u85E4\u539F\u59B9\u7EA2",
  th_penglai: "\u84EC\u83B1",
  th_penglai_info: "\u9501\u5B9A\u6280\u3002\u2460\u4F60\u7684\u624B\u724C\u4E0A\u9650+2\uFF0C\u4F60\u8BA1\u7B97\u4E0E\u5176\u4ED6\u89D2\u8272\u7684\u8DDD\u79BB\u65F6-1\u3002\u2461\u6478\u724C\u9636\u6BB5\uFF0C\u82E5\u4F60\u7684\u624B\u724C\u6570\u4E0D\u5927\u4E8E2\u6216\u4F60\u5DF2\u53D7\u4F24\uFF0C\u4F60\u591A\u6478\u4E00\u5F20\u724C\u3002\u2462\u5F53\u4F60\u8FDB\u5165\u6FD2\u6B7B\u72B6\u6001\u65F6\uFF0C\u4F60\u6478\u4E24\u5F20\u724C\u3002",
  th_fengyi: "\u51E4\u7FFC",
  th_fengyi_info: "\u4F60\u53EF\u4EE5\u5C06\u4E00\u81F3\u4E24\u5F20\u540C\u82B1\u8272\u7684\u724C\u6309\u4EE5\u4E0B\u89C4\u5219\u4F7F\u7528\u6216\u6253\u51FA\uFF1A\u2665\u5F53\u3010\u6843\u3011\uFF1B\u2666\u5F53\u706B\u3010\u6740\u3011\uFF1B\u2663\u5F53\u3010\u95EA\u3011\uFF1B\u2660\u5F53\u3010\u65E0\u61C8\u53EF\u51FB\u3011\u3002\u82E5\u4F60\u4EE5\u6B64\u6CD5\u4F7F\u7528\u7684\u724C\u5BF9\u5E94\u4E24\u5F20\u5B9E\u4F53\u724C\uFF0C\u5219\u6B64\u724C\u4E0D\u53EF\u88AB\u54CD\u5E94\uFF0C\u4E14\u6839\u636E\u5176\u989C\u8272\u6267\u884C\u4EE5\u4E0B\u6548\u679C\uFF1A\u7EA2\u8272\uFF0C\u6B64\u724C\u7684\u56DE\u590D\u503C\u6216\u4F24\u5BB3\u503C+1\uFF1B\u9ED1\u8272\uFF0C\u4F60\u5F03\u7F6E\u5F53\u524D\u56DE\u5408\u89D2\u8272\u7684\u4E00\u5F20\u724C\u3002\uFF08\u53EF\u9009\u624B\u724C\u3001\u88C5\u5907\u724C\u53CA\u53EF\u4F7F\u7528\u7684\u7279\u6B8A\u624B\u724C\uFF1B\u4EC5\u6253\u51FA\u4E0D\u89E6\u53D1\u5F3A\u5316\u3002\uFF09",
  "#th_penglai1": "\u6B64\u8EAB\u4E0D\u706D\uFF0C\u6B64\u706B\u4E0D\u7184\u3002",
  "#th_fengyi1": "\u770B\u6E05\u695A\u4E86\u2014\u2014\u51E4\u51F0\uFF0C\u662F\u8FD9\u6837\u6D74\u706B\u91CD\u751F\u7684\uFF01",
  "#th_mokou:die": "\u4E0D\u8FC7\u662F\u2026\u2026\u518D\u7761\u4E00\u4F1A\u513F\u3002",
  ac_yuu: "\u4E59\u5742\u6709\u5B87",
  ac_heyun: "\u5408\u97F5",
  ac_heyun_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E24\u6B21\uFF0C\u4F60\u53EF\u9009\u62E9\u4E00\u540D\u4E0E\u4F60\u6709\u76F8\u540C\u6280\u80FD\u7684\u89D2\u8272\uFF0C\u7136\u540E\u4F60\u5931\u53BB\u4E00\u4E2A\u6280\u80FD\u5E76\u4EE4\u5176\u6478\u4E24\u5F20\u724C\u3002",
  ac_yinhui: "\u97F3\u6D04",
  ac_yinhui_info: "\u6BCF\u8F6E\u5F00\u59CB\u65F6\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\uFF1A\u6E05\u9664\u4F60\u901A\u8FC7\u3010\u97F3\u6D04\u3011\u83B7\u5F97\u7684\u6280\u80FD\uFF0C\u7136\u540E\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u5F53\u524D\u62E5\u6709\u7684\u4E00\u4E2A\u6280\u80FD\u83B7\u5F97\u4E4B\u3002\uFF08\u4F60\u901A\u8FC7\u3010\u97F3\u6D04\u3011\u6700\u591A\u4FDD\u75591\u4E2A\u7A83\u53D6\u6765\u7684\u6280\u80FD\uFF1B\u4F60\u62E5\u6709\u6B64\u7A83\u53D6\u6280\u80FD\u671F\u95F4\uFF0C\u4E0D\u80FD\u518D\u6B21\u53D1\u52A8\u3010\u97F3\u6D04\u3011\u83B7\u53D6\u5176\u4ED6\u6280\u80FD\uFF1B\u4E0D\u53EF\u91CD\u590D\u83B7\u5F97\u5DF2\u6709\u6280\u80FD\uFF0C\u4E0D\u542B\u9690\u85CF\u53CA\u7CFB\u7EDF\u8F85\u52A9\u6280\u80FD\u3002\uFF09",
  mt_rudeus: "\u9C81\u8FEA\u4E4C\u65AF",
  mt_roxy: "\u6D1B\u742A\u5E0C",
  mt_sylphie: "\u5E0C\u9732\u83F2",
  mt_eris: "\u827E\u8389\u4E1D",
  mt_orsted: "\u5965\u5C14\u65AF\u5E1D\u5FB7",
  mt_ruijerd: "\u6770\u8DEF\u5FB7",
  mt_paul: "\u4FDD\u7F57",
  mt_ghislaine: "\u57FA\u5217\u5974",
  mt_voiceless: "\u65E0\u548F",
  mt_voiceless_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4E00\u5F20\u57FA\u672C\u624B\u724C\u6216\u9526\u56CA\u624B\u724C\u5F53\u706B\u3010\u6740\u3011\u4F7F\u7528\uFF08\u6D88\u8017\u6240\u9009\u5B9E\u4F53\u724C\uFF0C\u8BA1\u5165\u3010\u6740\u3011\u7684\u4F7F\u7528\u6B21\u6570\uFF1B\u5E76\u975E\u8F6C\u6362\u6280\uFF09\u3002\u82E5\u4F60\u4EE5\u6B64\u6CD5\u6D88\u8017\u7684\u662F\u9526\u56CA\u724C\uFF0C\u6B64\u3010\u6740\u3011\u6BCF\u6B21\u9020\u6210\u4F24\u5BB3\u540E\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C\u3002",
  mt_foresight: "\u9884\u89C1",
  mt_foresight_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u6210\u4E3A\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u3010\u6740\u3011\u7684\u76EE\u6807\u540E\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u724C\u5BF9\u4F60\u65E0\u6548\u3002\u82E5\u4F60\u7684\u4F53\u529B\u4E0D\u5927\u4E8E2\uFF0C\u6B64\u6280\u80FD\u4E5F\u53EF\u5BF9\u4F24\u5BB3\u7C7B\u9526\u56CA\u724C\u53D1\u52A8\u3002",
  mt_study: "\u7814\u4E60",
  mt_study_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u7684\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u4F7F\u7528\u8FC7\u9526\u56CA\u724C\u4E14\u7814\u4E60\u4E0D\u8DB34\uFF0C\u4F60\u83B7\u5F971\u679A\u201C\u7814\u201D\u3002\u7814\u4E60\u9996\u6B21\u8FBE\u52302\u30014\u65F6\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002\u4F60\u7684\u624B\u724C\u4E0A\u9650\u589E\u52A0\u7814\u4E60\u6570\u7684\u4E00\u534A\uFF08\u5411\u4E0B\u53D6\u6574\uFF09\u3002",
  mt_water: "\u6C34\u672F",
  mt_water_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u9ED1\u8272\u724C\uFF0C\u4EE4\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u9009\u62E9\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u6216\u53D7\u5230\u4F60\u9020\u6210\u76841\u70B9\u4F24\u5BB3\u3002\u7814\u4E60\u81F3\u5C11\u4E3A2\u65F6\uFF0C\u987B\u5F03\u7F6E\u4E24\u5F20\u724C\uFF1B\u7814\u4E60\u4E3A4\u65F6\uFF0C\u6B64\u4F24\u5BB3\u6539\u4E3A\u96F7\u7535\u4F24\u5BB3\u3002",
  mt_mentor: "\u6388\u4E1A",
  mt_mentor_info: "\u6BCF\u8F6E\u9650\u4E00\u6B21\uFF0C\u5F53\u5176\u4ED6\u89D2\u8272\u4E8E\u5176\u56DE\u5408\u5185\u4F7F\u7528\u3010\u6740\u3011\u7ED3\u7B97\u7ED3\u675F\u540E\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u5176\u6478\u4E00\u5F20\u724C\u3002\u82E5\u8BE5\u89D2\u8272\u672C\u56DE\u5408\u4F7F\u7528\u8FC7\u975E\u5EF6\u65F6\u9526\u56CA\u724C\uFF0C\u4F60\u989D\u5916\u6478\u4E00\u5F20\u724C\u3002\uFF08\u9526\u56CA\u8F6C\u5316\u6210\u3010\u6740\u3011\u4F7F\u7528\u4E0D\u8BA1\u4E3A\u4F7F\u7528\u8FC7\u9526\u56CA\u724C\u3002\uFF09",
  mt_heal: "\u6CBB\u6108",
  mt_heal_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u7EA2\u8272\u724C\uFF0C\u4EE4\u4E00\u540D\u5DF2\u53D7\u4F24\u89D2\u8272\u56DE\u590D1\u70B9\u4F53\u529B\uFF1B\u82E5\u5F03\u7F6E\u7684\u662F\u9526\u56CA\u724C\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002",
  mt_guard: "\u5B88\u62A4",
  mt_guard_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u5176\u4ED6\u89D2\u8272\u5373\u5C06\u53D7\u5230\u4F24\u5BB3\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u4F24\u5BB3\u51CF\u5C111\u70B9\u3002",
  mt_sword: "\u70C8\u5251",
  mt_sword_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F60\u4E8E\u51FA\u724C\u9636\u6BB5\u4F7F\u7528\u4EC5\u6307\u5B9A\u4E00\u4E2A\u76EE\u6807\u7684\u3010\u6740\u3011\u6307\u5B9A\u76EE\u6807\u540E\uFF0C\u4F60\u53EF\u4EE5\u5931\u53BB1\u70B9\u4F53\u529B\uFF0C\u4EE4\u8BE5\u76EE\u6807\u4E0D\u80FD\u54CD\u5E94\u6B64\u3010\u6740\u3011\u3002",
  mt_resolve: "\u51B3\u610F",
  mt_resolve_info: "\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u9020\u6210\u8FC7\u4F24\u5BB3\uFF0C\u4F60\u53EF\u4EE5\u6478X\u5F20\u724C\uFF08X\u4E3A\u4F60\u672C\u56DE\u5408\u9020\u6210\u7684\u4F24\u5BB3\u603B\u70B9\u6570\uFF09\uFF1B\u82E5\u4F60\u7684\u4F53\u529B\u4E0D\u5927\u4E8E2\uFF0C\u6539\u4E3A\u6478\u4E24\u5F20\u724C\u3002",
  mt_dragon: "\u9F99\u529B",
  mt_dragon_info: "\u9996\u6B21\u83B7\u5F97\u6B64\u6280\u80FD\u65F6\uFF0C\u4F60\u83B7\u5F973\u70B9\u9F99\u529B\uFF08\u4E0A\u96503\uFF09\u3002\u4F60\u4F7F\u7528\u3010\u6740\u3011\u65E0\u8DDD\u79BB\u9650\u5236\u3002\u6BCF\u56DE\u5408\u5404\u9650\u4E00\u6B21\uFF1A\u2460\u4F60\u4E8E\u51FA\u724C\u9636\u6BB5\u4EE5\u3010\u6740\u3011\u5BF9\u5176\u4ED6\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u65F6\uFF0C\u53EF\u4EE5\u6D88\u80171\u70B9\u9F99\u529B\u4EE4\u4F24\u5BB3+1\uFF1B\u2461\u4F60\u53D7\u5230\u4F24\u5BB3\u65F6\uFF0C\u53EF\u4EE5\u6D88\u80171\u70B9\u9F99\u529B\u4EE4\u4F24\u5BB3-1\u3002\u9501\u5B9A\u6280\uFF0C\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u672A\u9020\u6210\u8FC7\u4F24\u5BB3\uFF0C\u4F60\u56DE\u590D1\u70B9\u9F99\u529B\uFF08\u81F3\u591A3\uFF09\u3002",
  mt_dragon_strike: "\u9F99\u529B\xB7\u653B",
  mt_dragon_defend: "\u9F99\u529B\xB7\u5B88",
  mt_dragon_rest: "\u9F99\u529B\xB7\u606F",
  mt_dragonlord: "\u9F99\u76DF",
  mt_dragonlord_info: "\u4E3B\u516C\u6280\uFF0C\u51C6\u5907\u9636\u6BB5\uFF0C\u82E5\u4F60\u662F\u4E3B\u516C\u4E14\u6B64\u6280\u80FD\u6709\u6548\uFF0C\u4F60\u56DE\u590D1\u70B9\u9F99\u529B\uFF08\u81F3\u591A3\uFF09\uFF1B\u7136\u540E\u4F60\u53EF\u4EE5\u4EE4\u4E00\u540D\u5176\u4ED6\u5E7B\u6216\u795E\u52BF\u529B\u89D2\u8272\u6478\u4E00\u5F20\u724C\uFF0C\u82E5\u5982\u6B64\u505A\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002\u8BE5\u9009\u62E9\u4E0D\u5224\u5B9A\u6216\u516C\u5F00\u5BF9\u65B9\u8EAB\u4EFD\u3002",
  mt_eye: "\u7B2C\u4E09\u773C",
  mt_eye_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u8BA1\u7B97\u4E0E\u5176\u4ED6\u89D2\u8272\u7684\u8DDD\u79BB-1\uFF1B\u4F53\u529B\u22642\u65F6\u6539\u4E3A-2\u3002",
  mt_protect: "\u62A4\u5E7C",
  mt_protect_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5176\u4ED6\u89D2\u8272\u53D7\u4F24\u540E\uFF0C\u82E5\u5176\u4F53\u529B\u4E0D\u5927\u4E8E\u4F60\uFF0C\u4F60\u53EF\u5F03\u4E00\u5F20\u724C\uFF1A\u25C6\u5176\u4F53\u529B\uFF1E1\uFF1A\u4EE4\u5176\u6478\u4E24\u5F20\u724C\uFF1B\u25C6\u5176\u4F53\u529B\u22641\uFF1A\u4EE4\u5176\u56DE\u590D1\u70B9\u4F53\u529B\u3001\u6478\u4E00\u5F20\u724C\u3002\uFF08\u4F53\u529B\u6761\u4EF6\u4E3A\u4FDD\u62A4\u5F31\u8005\u7684\u73A9\u6CD5\u62BD\u8C61\uFF0C\u4E0D\u4EE3\u8868\u89D2\u8272\u5E74\u9F84\u3002\uFF09",
  mt_spear: "\u6218\u77DB",
  mt_spear_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u5BF9\u8DDD\u79BB\u5185\u4E00\u540D\u89D2\u8272\u989D\u5916\u89C6\u4E3A\u4F7F\u7528\u3010\u6740\u3011\uFF1B\u82E5\u4F60\u7684\u4F53\u529B\u22641\u65F6\uFF0C\u6B64\u3010\u6740\u3011\u4E0D\u53EF\u95EA\u907F\u3002",
  mt_styles: "\u4E09\u6D41",
  mt_styles_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF1A\u57FA\u672C\u724C\uFF0C\u4F60\u6478\u4E24\u5F20\u724C\uFF1B\u88C5\u5907\u724C\uFF0C\u4F60\u56DE\u590D1\u70B9\u4F53\u529B\uFF1B\u9526\u56CA\u724C\uFF0C\u672C\u9636\u6BB5\u4F60\u4F7F\u7528\u3010\u6740\u3011\u7684\u6B21\u6570\u4E0A\u9650+1\u4E14\u65E0\u8DDD\u79BB\u9650\u5236\u3002",
  mt_styles_range: "\u4E09\u6D41\xB7\u8FDB",
  mt_rescue: "\u6551\u63F4",
  mt_rescue_info: "\u6BCF\u8F6E\u9650\u4E00\u6B21\uFF0C\u5F53\u5176\u4ED6\u89D2\u8272\u8FDB\u5165\u6FD2\u6B7B\u72B6\u6001\u65F6\uFF0C\u82E5\u4F60\u7684\u4F53\u529B\u5927\u4E8E1\uFF0C\u4F60\u53EF\u4EE5\u5931\u53BB1\u70B9\u4F53\u529B\uFF0C\u4EE4\u5176\u56DE\u590D1\u70B9\u4F53\u529B\u3002\u82E5\u8BE5\u89D2\u8272\u7684\u4F53\u529B\u4E0A\u9650\u5C0F\u4E8E\u4F60\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4F60\u76841\u70B9\u4F53\u529B\u4E0A\u9650\u8F6C\u79FB\u7ED9\u8BE5\u89D2\u8272\uFF0C\u7136\u540E\u4F60\u6478\u4E00\u5F20\u724C\u3002\u6B64\u56DE\u590D\u4E0D\u4FDD\u8BC1\u5176\u8131\u79BB\u6FD2\u6B7B\u3002",
  mt_swordking: "\u5251\u738B",
  mt_swordking_info: "\u9501\u5B9A\u6280\uFF0C\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F60\u4E8E\u51FA\u724C\u9636\u6BB5\u4EE5\u3010\u6740\u3011\u5BF9\u4F53\u529B\u4E0D\u5C0F\u4E8E\u4F60\u7684\u5176\u4ED6\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u65F6\uFF0C\u6B64\u4F24\u5BB3+1\u3002",
  mt_training: "\u6388\u5251",
  mt_training_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u51C6\u5907\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u4E00\u540D\u6CA1\u6709\u201C\u5251\u610F\u201D\u7684\u5176\u4ED6\u89D2\u8272\u83B7\u5F97\u4E00\u679A\u201C\u5251\u610F\u201D\u6807\u8BB0\u3002\u8BE5\u89D2\u8272\u4E8E\u5176\u4E0B\u4E2A\u56DE\u5408\u5185\u4F7F\u7528\u7684\u7B2C\u4E00\u5F20\u3010\u6740\u3011\u9020\u6210\u7684\u4F24\u5BB3+1\u3002\u82E5\u8BE5\u3010\u6740\u3011\u9020\u6210\u4E86\u4F24\u5BB3\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\uFF08\u6BCF\u679A\u5251\u610F\u4EC5\u6478\u4E00\u6B21\uFF09\u3002\u5251\u610F\u4E0D\u53E0\u52A0\uFF0C\u4E8E\u8BE5\u89D2\u8272\u7684\u4E0B\u4E2A\u56DE\u5408\u7ED3\u675F\u540E\u79FB\u9664\uFF1B\u9996\u5F20\u3010\u6740\u3011\u672A\u9020\u6210\u4F24\u5BB3\u4E5F\u4E0D\u987A\u5EF6\u3002",
  mt_ghislaine_guard: "\u5B88\u62A4",
  mt_ghislaine_guard_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u53D7\u5230\u4F24\u5BB3\u65F6\uFF0C\u4F60\u53EF\u4EE5\u9632\u6B62\u6B64\u4F24\u5BB3\uFF0C\u7136\u540E\u5931\u53BB1\u70B9\u4F53\u529B\uFF0C\u5E76\u6478\u4E24\u5F20\u724C\u3002"
};

// game/resources/app/src/character/mushoku/intro.js
var intro_default = {
  th_mokou: "\u85E4\u539F\u59B9\u7EA2\uFF0C\u4E1C\u65B9Project\u89D2\u8272\uFF0C\u79F0\u53F7\u4E0D\u6B7B\u7684\u70DF\u706B\u3002\u795E\u52BF\u529B\uFF0C2/2\u4F53\u529B\uFF1B\u84EC\u83B1\u63D0\u4F9B\u751F\u5B58\u8D44\u6E90\uFF0C\u51E4\u7FFC\u4EE5\u82B1\u8272\u8F6C\u5316\u724C\u3002\u53F0\u8BCD\u5DF2\u767B\u8BB0\u4E3A\u6587\u672C\u5E76\u5728\u6280\u80FD\u4F7F\u7528\u6216\u9635\u4EA1\u65F6\u663E\u793A\uFF0C\u672A\u751F\u6210\u914D\u97F3\u3002",
  ac_yuu: "\u4E59\u5742\u6709\u5B87\uFF0C\u300ACharlotte\u300B\u89D2\u8272\u3002\u901A\u8FC7\u97F3\u6D04\u83B7\u5F97\u5176\u4ED6\u89D2\u8272\u7684\u6280\u80FD\uFF0C\u518D\u4EE5\u5408\u97F5\u820D\u5F03\u6280\u80FD\u6362\u53D6\u6478\u724C\uFF1B\u53EF\u4EE5\u9009\u62E9\u81EA\u5DF1\u4F5C\u4E3A\u5408\u97F5\u76EE\u6807\u3002",
  mt_rudeus: "\u9C81\u8FEA\u4E4C\u65AF\xB7\u683C\u96F7\u62C9\u7279\u3002\u81EA\u5E7C\u5B66\u4E60\u9B54\u672F\uFF0C\u64C5\u957F\u65E0\u548F\u5531\u65BD\u6CD5\u3002\u9884\u89C1\u6765\u81EA\u9B54\u773C\u80FD\u529B\uFF0C\u724C\u9762\u5C06\u5176\u62BD\u8C61\u4E3A\u6709\u4EE3\u4EF7\u7684\u9632\u5FA1\u3002",
  mt_roxy: "\u6D1B\u742A\u5E0C\xB7\u7C73\u683C\u8DEF\u8FEA\u4E9A\u3002\u6301\u7EED\u7CBE\u8FDB\u7684\u6C34\u7CFB\u9B54\u672F\u5E08\u3002\u6388\u4E1A\u652F\u63F4\u5176\u4ED6\u89D2\u8272\u7684\u6740\uFF1B\u5148\u4F7F\u7528\u975E\u5EF6\u65F6\u9526\u56CA\u53EF\u83B7\u5F97\u989D\u5916\u6536\u76CA\uFF0C\u4E0D\u9650\u5B9A\u89D2\u8272\u3002\u7814\u4E60\u662F\u73A9\u6CD5\u6210\u957F\uFF0C\u4E0D\u8868\u793A\u5176\u5F00\u5C40\u662F\u65B0\u624B\uFF1B\u6EE1\u7814\u96F7\u7535\u6548\u679C\u53C2\u8003\u6C34\u738B\u7EA7\u9B54\u672F\u201C\u96F7\u5149\u201D\u3002",
  mt_sylphie: "\u5E0C\u9732\u83F2\u53F6\u7279\u3002\u9C81\u8FEA\u4E4C\u65AF\u7684\u9752\u6885\u7AF9\u9A6C\uFF0C\u65E0\u548F\u5531\u9B54\u672F\u4F7F\u7528\u8005\uFF0C\u66FE\u62C5\u4EFB\u7231\u4E3D\u513F\u7684\u5B88\u62A4\u672F\u5E08\u3002\u6CBB\u6108\u4E0E\u4FDD\u62A4\u6784\u6210\u724C\u9762\u4E3B\u9898\u3002",
  mt_eris: "\u827E\u8389\u4E1D\xB7\u4F2F\u96F7\u4E9A\u65AF\xB7\u683C\u96F7\u62C9\u7279\u3002\u6027\u683C\u76F4\u63A5\uFF0C\u523B\u82E6\u953B\u70BC\u5251\u672F\u3002\u70C8\u5251\u4EE5\u4F53\u529B\u6362\u53D6\u538B\u5236\uFF0C\u51B3\u610F\u6839\u636E\u4F24\u5BB3\u603B\u91CF\u6216\u4F4E\u4F53\u529B\u72B6\u6001\u8865\u5145\u624B\u724C\u3002",
  mt_orsted: "\u5965\u5C14\u65AF\u5E1D\u5FB7\uFF0C\u9F99\u795E\u3002\u795E\u52BF\u529B\uFF0C4\u4F53\u529B\uFF0C\u5B9A\u4F4D\u4E3A\u8FDC\u7A0B\u5A01\u538B\u3001\u8D44\u6E90\u653B\u9632\u4E0E\u4F11\u6574\u7EED\u822A\u3002\u9F99\u529B\u4E0A\u9650\u4E3A3\uFF0C\u8FDB\u653B\u4E0E\u9632\u5B88\u5171\u4EAB\u8D44\u6E90\uFF1B\u672A\u9020\u6210\u4F24\u5BB3\u7684\u56DE\u5408\u7ED3\u675F\u65F6\u7F13\u6162\u6062\u590D\u3002\u4E3B\u516C\u6280\u9F99\u76DF\u53EF\u8054\u7ED3\u5E7B\u4E0E\u795E\u52BF\u529B\uFF0C\u662F\u5408\u4F5C\u4E3B\u9898\u7684\u73A9\u6CD5\u6539\u7F16\u3002",
  mt_ruijerd: "\u745E\u6770\u8DEF\u5FB7\xB7\u65AF\u4F69\u8DEF\u8FEA\u4E9A\u3002\u65AF\u4F69\u8DEF\u5FB7\u65CF\u6218\u58EB\uFF0C\u7B2C\u4E09\u773C\u8D4B\u4E88\u611F\u77E5\u80FD\u529B\uFF0C\u91CD\u89C6\u4FDD\u62A4\u5B69\u5B50\u3002\u62A4\u5E7C\u7684\u4F53\u529B\u6761\u4EF6\u4EC5\u7528\u4E8E\u89C4\u5219\u5E73\u8861\u3002",
  mt_paul: "\u4FDD\u7F57\xB7\u683C\u96F7\u62C9\u7279\u3002\u638C\u63E1\u591A\u79CD\u5251\u672F\u6D41\u6D3E\u3002\u6551\u63F4\u53EF\u5411\u4F53\u529B\u4E0A\u9650\u66F4\u4F4E\u7684\u89D2\u8272\u8F6C\u79FB\u4F53\u529B\u4E0A\u9650\uFF0C\u4EE5\u81EA\u8EAB\u8D44\u6E90\u589E\u5F3A\u53D7\u63F4\u8005\u751F\u5B58\u80FD\u529B\uFF0C\u4E0D\u9650\u5B9A\u89D2\u8272\u3002",
  mt_ghislaine: "\u57FA\u5217\u5974\xB7\u6CF0\u5FB7\u8DEF\u8FEA\u4E9A\u3002\u517D\u65CF\u5251\u738B\u3002\u6388\u5251\u901A\u8FC7\u5251\u610F\u652F\u63F4\u5176\u4ED6\u89D2\u8272\u7684\u4E0B\u4E00\u56DE\u5408\u9996\u5F20\u6740\uFF1B\u5B88\u62A4\u5C06\u4F24\u5BB3\u6539\u4E3A\u5931\u53BB\u4F53\u529B\u5E76\u8865\u5145\u624B\u724C\uFF0C\u964D\u4F4E\u4F53\u529B\u53EF\u914D\u5408\u5251\u738B\u7684\u89E6\u53D1\u6761\u4EF6\u3002"
};

// game/resources/app/src/character/mushoku/crossover.js
import { lib as lib2, game as game2, get as get2 } from "noname";
var visibleSkills = (player) => player.getSkills(null, false, false).filter((id) => {
  const info = lib2.skill[id];
  return info && !info.charlotte && !info.hiddenSkill && lib2.translate[id + "_info"];
});
var learnable = (player, target) => visibleSkills(target).filter((id) => !player.hasSkill(id));
var crossover_default = {
  ac_heyun: {
    enable: "phaseUse",
    usable: 2,
    filter(event, player) {
      return visibleSkills(player).length > 0 && game2.hasPlayer((target) => visibleSkills(player).some((id) => target.hasSkill(id)));
    },
    filterTarget(card, player, target) {
      return visibleSkills(player).some((id) => target.hasSkill(id));
    },
    async content(event, trigger, player) {
      const list = visibleSkills(player);
      if (!list.length) return;
      const result = await player.chooseControl(list).set("prompt", "\u5408\u97F5\uFF1A\u5931\u53BB\u4E00\u4E2A\u6280\u80FD\uFF0C\u7136\u540E\u4EE4\u6240\u9009\u89D2\u8272\u6478\u4E24\u5F20\u724C").set("ai", () => list.find((id) => (player.additionalSkills.ac_yinhui || []).includes(id)) || list[0]).forResult();
      if (!list.includes(result.control)) return;
      await player.removeSkills(result.control);
      if (event.target.isIn()) await event.target.draw(2);
    },
    ai: { order: 1, result: { target: 1, player(player) {
      return (player.additionalSkills.ac_yinhui || []).length ? 1 : -1;
    } } }
  },
  ac_yinhui: {
    trigger: { global: "roundStart" },
    filter(event, player) {
      return (player.additionalSkills.ac_yinhui || []).length > 0 || game2.hasPlayer((target) => target !== player && learnable(player, target).length > 0);
    },
    async content(event, trigger, player) {
      if ((player.additionalSkills.ac_yinhui || []).length) {
        const clear = await player.chooseBool("\u97F3\u6D04\uFF1A\u662F\u5426\u6E05\u9664\u901A\u8FC7\u97F3\u6D04\u83B7\u5F97\u7684\u6280\u80FD\u5E76\u91CD\u65B0\u9009\u62E9\uFF1F\u82E5\u4FDD\u7559\u5219\u4E0D\u80FD\u83B7\u5F97\u5176\u4ED6\u6280\u80FD\u3002").set("ai", () => false).forResult();
        if (!clear.bool) return;
        player.removeAdditionalSkill("ac_yinhui");
      }
      if (!game2.hasPlayer((target) => target !== player && learnable(player, target).length > 0)) return;
      const chosen = await player.chooseTarget("\u97F3\u6D04\uFF1A\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u83B7\u5F97\u5176\u4E00\u4E2A\u5F53\u524D\u6280\u80FD", true, (card, source, target) => target !== source && learnable(source, target).length > 0).set("ai", (target) => Math.max(0, ...learnable(player, target).map((id) => get2.skillRank(id)))).forResult();
      if (!chosen.bool) return;
      const list = learnable(player, chosen.targets[0]);
      if (!list.length) return;
      const result = await player.chooseControl(list).set("prompt", "\u97F3\u6D04\uFF1A\u9009\u62E9\u8981\u83B7\u5F97\u7684\u6280\u80FD").set("ai", () => list.reduce((best, id) => get2.skillRank(id) > get2.skillRank(best) ? id : best)).forResult();
      if (!(player.additionalSkills.ac_yinhui || []).length && list.includes(result.control) && !player.hasSkill(result.control)) player.addAdditionalSkill("ac_yinhui", result.control);
    }
  }
};

// game/resources/app/src/character/mushoku/mokou.js
import { game as game3, get as get3, ui, _status as _status2 } from "noname";
var bySuit = { heart: { name: "tao" }, diamond: { name: "sha", nature: "fire" }, club: { name: "shan" }, spade: { name: "wuxie" } };
var converted = (card, player) => bySuit[get3.suit(card, player)];
var isDoubleUse = (event) => event.name === "useCard" && event.skill === "th_fengyi" && event.cards?.length === 2;
var mokou_default = {
  th_penglai: {
    locked: true,
    forced: true,
    trigger: { player: ["phaseDrawBegin2", "dying"] },
    filter(event, player) {
      return event.name === "dying" || !event.numFixed && (player.countCards("h") <= 2 || player.isDamaged());
    },
    async content(event, trigger, player) {
      player.chat("\u6B64\u8EAB\u4E0D\u706D\uFF0C\u6B64\u706B\u4E0D\u7184\u3002");
      if (trigger.name === "dying") await player.draw(2);
      else trigger.num++;
    },
    mod: {
      maxHandcard(player, num) {
        return num + 2;
      },
      globalFrom(from, to, distance) {
        return distance - 1;
      }
    },
    group: "th_penglai_death",
    subSkill: { death: { charlotte: true, forced: true, popup: false, forceDie: true, trigger: { player: "dieBegin" }, async content(event, trigger, player) {
      player.chat("\u4E0D\u8FC7\u662F\u2026\u2026\u518D\u7761\u4E00\u4F1A\u513F\u3002");
    } } }
  },
  th_fengyi: {
    enable: ["chooseToUse", "chooseToRespond"],
    position: "hes",
    selectCard: [1, 2],
    complexCard: true,
    prompt: "\u5C06\u4E00\u81F3\u4E24\u5F20\u540C\u82B1\u8272\u7684\u724C\u4F7F\u7528\u6216\u6253\u51FA\uFF1A\u2665\u6843\u3001\u2666\u706B\u6740\u3001\u2663\u95EA\u3001\u2660\u65E0\u61C8\u53EF\u51FB\u3002\u53EA\u6709\u4F7F\u7528\u4E24\u5F20\u724C\u65F6\u89E6\u53D1\u5F3A\u5316\u3002",
    viewAs(cards, player) {
      if (!cards.length) return null;
      const info = converted(cards[0], player);
      return info ? { ...info } : null;
    },
    filter(event, player) {
      return player.getCards("hes").some((card) => {
        const info = converted(card, player);
        return info && event.filterCard(get3.autoViewAs(info, "unsure"), player, event);
      });
    },
    filterCard(card, player, event) {
      const selected = ui.selected.cards;
      if (selected.length) return get3.suit(card, player) === get3.suit(selected[0], player);
      event ||= _status2.event;
      const info = converted(card, player);
      return !!info && event._backup.filterCard(get3.autoViewAs(info, "unsure"), player, event);
    },
    check(card) {
      return 8 - get3.value(card);
    },
    hiddenCard(player, name) {
      return Object.entries(bySuit).some(([suit, info]) => info.name === name && player.countCards("hes", { suit }) > 0);
    },
    precontent(event, trigger, player) {
      player.chat("\u770B\u6E05\u695A\u4E86\u2014\u2014\u51E4\u51F0\uFF0C\u662F\u8FD9\u6837\u6D74\u706B\u91CD\u751F\u7684\uFF01");
    },
    ai: {
      order: 6,
      respondSha: true,
      respondShan: true,
      save: true,
      skillTagFilter(player, tag) {
        const suit = { respondSha: "diamond", respondShan: "club", save: "heart" }[tag];
        return !!suit && player.countCards("hes", { suit }) > 0;
      }
    },
    group: ["th_fengyi_empower", "th_fengyi_discard"],
    subSkill: {
      empower: {
        charlotte: true,
        forced: true,
        popup: false,
        firstDo: true,
        trigger: { player: "useCard" },
        filter: isDoubleUse,
        async content(event, trigger) {
          trigger.directHit.addArray(game3.players);
          trigger.nowuxie = true;
          if (["tao", "sha"].includes(trigger.card.name)) trigger.baseDamage = (trigger.baseDamage ?? 1) + 1;
        }
      },
      discard: {
        charlotte: true,
        forced: true,
        popup: false,
        trigger: { player: "useCardAfter" },
        filter(event, player) {
          return isDoubleUse(event) && ["shan", "wuxie"].includes(event.card.name) && _status2.currentPhase?.isIn() && _status2.currentPhase.countDiscardableCards(player, "he") > 0;
        },
        async content(event, trigger, player) {
          await player.discardPlayerCard(_status2.currentPhase, "he", true);
        }
      }
    }
  }
};

// game/resources/app/src/character/mushoku/expansion.js
import { lib as lib3, game as game4, get as get4, _status as _status3 } from "noname";
var discardable = (card, player) => lib3.filter.cardDiscardable(card, player, "ac_haodu");
var suits = (cards) => new Set(cards.map((card) => get4.suit(card, false)).filter((suit) => ["heart", "diamond", "club", "spade"].includes(suit))).size;
var replayTargets = (player) => player.getStorage("ac_xuju");
var expansion_default = {
  ac_haodu: {
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player, target) {
      return target !== player;
    },
    async content(event, trigger, player) {
      const target = event.target;
      const results = await player.chooseCardOL([player, target], "he", [0, Infinity], true, "\u8C6A\u8D4C\uFF1A\u79D8\u5BC6\u9009\u62E9\u8981\u5F03\u7F6E\u7684\u724C\uFF0C\u53EF\u9009\u62E9\u96F6\u5F20", discardable).set("ai", (card) => 4 - get4.value(card)).forResult();
      const chosen = [player, target].map((who, i) => [who, (results[i]?.cards || []).filter((card) => who.getCards("he").includes(card) && discardable(card, who))]);
      const counts = chosen.map(([, cards]) => ({ count: cards.length, suits: suits(cards) }));
      if (chosen.some(([, cards]) => cards.length)) await game4.loseAsync({ lose_list: chosen.filter(([, cards]) => cards.length) }).setContent("discardMultiple");
      const limit = Number(counts[0].count >= counts[1].count) + Number(counts[0].suits >= counts[1].suits);
      player.storage.ac_haodu_last = { count: counts[0].count, last: null };
      player.syncStorage("ac_haodu_last");
      const remaining = ["\u4F24\u5BB3", "\u6478\u724C"];
      for (let i = 0; i < limit && player.isIn(); i++) {
        const options = remaining.filter((option) => option !== "\u4F24\u5BB3" || target.isIn());
        if (!options.length) break;
        const result = await player.chooseControl([...options, "cancel2"]).set("prompt", `\u8C6A\u8D4C\uFF1A\u8FD8\u53EF\u4F9D\u6B21\u6267\u884C${limit - i}\u9879\uFF08\u4F24\u5BB3\uFF1A\u5BF9\u76EE\u6807\u9020\u62101\u70B9\u4F24\u5BB3\uFF1B\u6478\u724C\uFF1A\u81EA\u5DF1\u6478\u4E09\u5F20\u724C\uFF09`).set("ai", () => options.includes("\u4F24\u5BB3") && get4.attitude(player, target) < 0 ? "\u4F24\u5BB3" : "\u6478\u724C").forResult();
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
      return !!last?.last && player.countCards("he", (card) => lib3.filter.cardDiscardable(card, player, "ac_xuju")) >= last.count && game4.hasPlayer((target) => target.isDamaged() && !replayTargets(player).includes(target));
    },
    async content(event, trigger, player) {
      const last = { ...player.storage.ac_haodu_last };
      const result = await player.chooseTarget(`\u7EED\u5C40\uFF1A\u5F03\u7F6E${last.count}\u5F20\u724C\uFF0C\u4EE4\u4E00\u540D\u5DF2\u53D7\u4F24\u4E14\u672A\u7EED\u5C40\u7684\u89D2\u8272${last.last === "draw" ? "\u6478\u4E09\u5F20\u724C" : "\u53D7\u5230\u4F60\u9020\u6210\u76841\u70B9\u4F24\u5BB3"}`, (card, source, target2) => target2.isDamaged() && !source.getStorage("ac_xuju").includes(target2)).set("ai", (target2) => get4.attitude(player, target2) * (last.last === "draw" ? 1 : -1)).forResult();
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
      return player.countCards("he") > 0 && game4.hasPlayer((target) => target !== player && target.countCards("h") > 0);
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
      return !player.hasSkill("ac_tuiyan_draw") || !player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game4.hasPlayer((target) => target !== player);
    },
    async content(event, trigger, player) {
      const choices = [];
      if (!player.hasSkill("ac_tuiyan_draw")) choices.push("\u8865\u5145\u624B\u724C");
      if (!player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game4.hasPlayer((target) => target !== player)) choices.push("\u4EA4\u4ED8\u624B\u724C");
      if (!choices.length) return;
      const result = await player.chooseControl(choices).set("prompt", "\u63A8\u6F14\uFF1A\u6BCF\u9879\u6BCF\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21").set("ai", () => choices[0]).forResult();
      if (result.control === "\u8865\u5145\u624B\u724C") {
        player.addTempSkill("ac_tuiyan_draw", { player: "phaseUseAfter" });
        await player.drawTo(player.maxHp);
      } else if (result.control === "\u4EA4\u4ED8\u624B\u724C") {
        const num = player.countCards("h") - player.hp;
        if (num <= 0) return;
        const selected = await player.chooseTarget("\u63A8\u6F14\uFF1A\u9009\u62E9\u63A5\u6536\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272", true, (card, source, target) => target !== source).set("ai", (target) => get4.attitude(player, target)).forResult();
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
        return !player.storage.mc_fengcang && event.card.name === "sha" && get4.color(event.card) === "black";
      }, async content(event, trigger) {
        trigger.directHit.addArray(game4.players);
      } },
      red: { charlotte: true, forced: true, trigger: { target: "useCardToTargeted" }, filter(event, player) {
        return !!player.storage.mc_fengcang && event.player !== player && event.card.name === "sha" && get4.color(event.card) === "red";
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
      return event.num > 1 || get4.attitude(player, event.player) > 0 || event.player.countCards("e") > 0;
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
      return get4.type(card) === "equip";
    },
    viewAs: { name: "jiu" },
    viewAsFilter(player) {
      return player.countCards("hes", (card) => get4.type(card) === "equip") > 0;
    },
    check(card) {
      return 6 - get4.value(card);
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

// game/resources/app/src/character/mushoku/index.js
game5.import("character", () => ({ name: "mushoku", connect: true, character: character_default, skill: { ...skill_default, ...crossover_default, ...mokou_default, ...Object.fromEntries(Object.entries(expansion_default).filter(([id]) => !id.startsWith("mc_"))) }, translate: { ...translate_default, ...Object.fromEntries(Object.entries(expansion_translate_default).filter(([id]) => !id.startsWith("mc_"))) }, characterIntro: { ...intro_default, ac_yumeko: "\u6DF1\u6E0A\u8D4C\u5F92\u3002\u4EE5\u724C\u4E0E\u547D\u8FD0\u4E0B\u6CE8\uFF0C\u8FFD\u9010\u80DC\u8D1F\u8FB9\u7F18\u7684\u523A\u6FC0\u3002", ac_kaito: "\u6708\u4E0B\u9B54\u672F\u5E08\u3002\u4EE5\u969C\u773C\u6CD5\u5728\u4F17\u76EE\u777D\u777D\u4E4B\u4E0B\u593A\u53D6\u5B9D\u7269\u3002", ac_chatgpt: "\u4E07\u8A00\u4E4B\u955C\u3002\u4E8E\u4E07\u5343\u53EF\u80FD\u4E2D\u63A8\u6F14\u7B54\u6848\uFF0C\u5C06\u77E5\u8BC6\u4EA4\u4ED8\u4ED6\u4EBA\u3002" }, characterTitle: { th_mokou: "\u4E0D\u6B7B\u7684\u70DF\u706B", ac_yumeko: "\u6DF1\u6E0A\u8D4C\u5F92", ac_kaito: "\u6708\u4E0B\u9B54\u672F\u5E08", ac_chatgpt: "\u4E07\u8A00\u4E4B\u955C" } }));
