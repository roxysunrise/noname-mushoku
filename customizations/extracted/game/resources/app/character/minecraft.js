// game/resources/app/src/character/minecraft/index.js
import { game as game2 } from "noname";

// game/resources/app/src/noname/init/mushoku-characters.js
var characters = {
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

// game/resources/app/src/character/minecraft/index.js
game2.import("character", () => ({
  name: "minecraft",
  connect: true,
  character: character_default,
  skill: skill_default,
  translate: translate_default,
  characterTitle: { mc_dream: "\u9010\u730E\u5E7B\u8E2A" },
  characterIntro: { mc_dream: "Dream\uFF0C\u730E\u4EBA\u6E38\u620F\u4F20\u5947\u3002\u7B79\u8C0B\u79EF\u84C4\u7269\u8D44\uFF0C\u9669\u9038\u5728\u7EDD\u5883\u4E2D\u5BFB\u627E\u8F6C\u673A\uFF0C\u8854\u8FFD\u6301\u7EED\u8FFD\u730E\u3002" }
}));
