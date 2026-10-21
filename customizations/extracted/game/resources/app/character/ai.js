// game/resources/app/src/character/ai/index.js
import { game as game3 } from "noname";

// game/resources/app/src/noname/init/mushoku-characters.js
var characters = {
  ac_yumeko: { sex: "female", group: "huan", hp: 4, maxHp: 4, skills: ["ac_haodu", "ac_xuju"], img: "image/character/ac_yumeko.jpg" },
  ac_kaito: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_zhangyan"], img: "image/character/ac_kaito.jpg" },
  ac_chatgpt: { sex: "female", group: "xu", hp: 4, maxHp: 4, skills: ["ac_tuiyan"], img: "image/character/ac_chatgpt.jpg" },
  ai_doubao: { sex: "female", group: "xu", hp: 3, skills: ["ai_qiaoda", "ai_banxing"], img: "image/character/ai_doubao.jpg" },
  ai_deepseek: { sex: "female", group: "xu", hp: 3, skills: ["ai_tuili", "ai_yansuan"], img: "image/character/ai_deepseek.jpg" },
  ai_claude: { sex: "female", group: "xu", hp: 3, skills: ["ai_bianyi", "ai_tiaoshi"], img: "image/character/ai_claude.jpg" },
  ai_grok: { sex: "female", group: "xu", hp: 4, skills: ["ai_dongcha", "ai_zhiyan"], img: "image/character/ai_grok.jpg" },
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
  ai_doubao: [["\u4E07\u8C61\u5DE7\u7B54", "#ffc49d"], ["\u6696\u5FC3\u4F34\u884C", "#ffadca"]],
  ai_deepseek: [["\u6DF1\u6D77\u6C42\u7D22", "#9acfff"], ["\u6B65\u6B65\u6C42\u8BC1", "#93e4e2"]],
  ai_claude: [["\u4EE3\u7801\u7EC7\u5320", "#efbf9c"], ["\u5BA1\u614E\u6C42\u8BC1", "#cfb7ef"]],
  ai_grok: [["\u5B9E\u65F6\u6D1E\u5BDF", "#c1d3f7"], ["\u950B\u8292\u76F4\u8A00", "#f1a4ca"]]
};
var characterTitles = Object.fromEntries(Object.entries(labels).map(([id, values]) => [id, values.map(([text, color]) => badge(text, color)).join(" ")]));
var titlesForPack = (pack) => Object.fromEntries(Object.entries(characterTitles).filter(([id]) => packForCharacter(id) === pack));

// game/resources/app/src/character/ai/character.js
var character_default = Object.fromEntries(Object.entries(mushoku_characters_default).filter(([id]) => packForCharacter(id) === "ai"));

// game/resources/app/src/character/ai/skill.js
import { game, get, lib, ui, _status } from "noname";

// game/resources/app/src/character/ai/mechanics.js
function createAiSkills(game4, get3, lib3, ui2, status) {
  const remote = (source) => get3.infoFuncOL("_noname_func:" + source);
  const conversion = (card) => ({ basic: "shan", trick: "tao", equip: "sha" })[get3.type2(card)];
  const program = (player) => player.getExpansions("ai_bianyi")[0];
  const colored = (card) => ["red", "black"].includes(get3.color(card));
  return {
    ai_qiaoda: {
      enable: ["chooseToUse", "chooseToRespond"],
      position: "h",
      selectCard: 1,
      filter(event, player) {
        return !player.hasSkill("ai_qiaoda_used") && player.getCards("h").some((card) => {
          const name = conversion(card);
          return name && event.filterCard(get3.autoViewAs({ name }, "unsure"), player, event);
        });
      },
      viewAs(cards) {
        const name = cards.length && conversion(cards[0]);
        return name ? { name } : null;
      },
      filterCard(card, player, event) {
        event ||= status.event;
        const name = conversion(card);
        return !!name && event._backup.filterCard(get3.autoViewAs({ name }, "unsure"), player, event);
      },
      hiddenCard(player, name) {
        return !player.hasSkill("ai_qiaoda_used") && player.getCards("h").some((card) => conversion(card) === name);
      },
      precontent(event, trigger, player) {
        player.addTempSkill("ai_qiaoda_used", { global: "phaseAfter" });
      },
      check: (card) => 8 - get3.value(card),
      ai: { order: 5, respondSha: true, respondShan: true, save: true, skillTagFilter(player, tag) {
        const name = { respondSha: "sha", respondShan: "shan", save: "tao" }[tag];
        return !!name && !player.hasSkill("ai_qiaoda_used") && player.getCards("h").some((card) => conversion(card) === name);
      } },
      subSkill: { used: { charlotte: true, mark: true, marktext: "\u7B54", intro: { content: "\u672C\u56DE\u5408\u5DF2\u53D1\u52A8\u5DE7\u7B54\u3002" } } }
    },
    ai_banxing: {
      trigger: { player: ["useCardAfter", "respondAfter"] },
      direct: true,
      filter(event, player) {
        return status.currentPhase !== player && !player.hasSkill("ai_banxing_used") && event.cards?.some((card) => player.getHistory("lose").some((loss) => loss.hs?.includes(card) && loss.getParent() === event)) && game4.hasPlayer((target) => target !== player);
      },
      async content(event, trigger, player) {
        const result = await player.chooseTarget("\u4F34\u884C\uFF1A\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u624B\u724C\u8F83\u5C11\u7684\u4E00\u65B9\u6478\u4E00\u5F20\uFF08\u76F8\u7B49\u5219\u4F60\u6478\uFF09", (card, source, target2) => source !== target2).set("ai", remote("target => get.attitude(_status.event.player,target)")).forResult();
        if (!result.bool) return;
        const target = result.targets[0];
        player.logSkill("ai_banxing", target);
        player.addTempSkill("ai_banxing_used", { global: "phaseAfter" });
        if (target.countCards("h") < player.countCards("h")) await target.draw();
        else await player.draw();
      },
      subSkill: { used: { charlotte: true } }
    },
    ai_tuili: {
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        const remaining = get3.cards(3);
        await game4.cardsGotoOrdering(remaining);
        player.addTempSkill("ai_yansuan_record", { global: "phaseAfter" });
        player.storage.ai_yansuan_record ||= [];
        for (let step = 0; step < 3 && remaining.length && player.isIn(); step++) {
          let paid;
          if (step) {
            const result = await player.chooseToDiscard("h", `\u63A8\u7406\uFF1A\u5F03\u7F6E\u4E00\u5F20\u624B\u724C\uFF0C\u7EE7\u7EED\u7B2C${step + 1}\u6B65\uFF1B\u53D6\u6D88\u5219\u7ED3\u675F`).set("ai", remote("card => 6-get.value(card)")).forResult();
            if (!result.bool) break;
            paid = result.cards[0];
          }
          const choice = await player.chooseButton(["\u63A8\u7406\uFF1A\u9009\u62E9\u83B7\u5F97\u4E00\u5F20\u724C", remaining], true).set("aiTuiliColor", step === 2 ? get3.color(paid, false) : null).set("ai", remote("button => get.value(button.link)+(get.color(button.link,false)===_status.event.aiTuiliColor?3:0)")).forResult();
          const card = choice.links?.[0] || remaining[0];
          remaining.splice(remaining.indexOf(card), 1);
          player.storage.ai_yansuan_record.push(card);
          player.syncStorage("ai_yansuan_record");
          await player.gain(card, "gain2");
          if (step === 2 && colored(paid) && get3.color(paid, false) === get3.color(card, false)) await player.draw();
        }
        if (remaining.length) {
          let bottom = remaining;
          if (remaining.length > 1 && player.isIn()) {
            const result = await player.chooseToMove("\u63A8\u7406\uFF1A\u6392\u5217\u5269\u4F59\u724C\u7F6E\u4E8E\u724C\u5806\u5E95\uFF08\u5DE6\u4FA7\u5148\u88AB\u6478\u5230\uFF09", true).set("list", [["\u724C\u5806\u5E95", remaining]]).set("processAI", remote("list => [list[0][1].slice()]")).forResult();
            if (result.bool) bottom = result.moved[0];
          }
          await game4.cardsGotoPile(bottom);
        }
      },
      ai: { order: 7, result: { player: 1 } }
    },
    ai_yansuan: {
      trigger: { player: "useCardAfter" },
      direct: true,
      filter(event, player) {
        return !player.hasSkill("ai_yansuan_used") && event.cards?.length === 1 && !get3.is.convertedCard(event.card) && !get3.is.virtualCard(event.card) && (player.storage.ai_yansuan_record || []).includes(event.cards[0]) && player.getHistory("lose").some((loss) => loss.hs?.includes(event.cards[0]) && loss.getParent() === event) && !player.getHistory("sourceDamage", (damage) => damage.getParent("useCard") === event).length;
      },
      async content(event, trigger, player) {
        const result = await player.chooseTarget("\u9A8C\u7B97\uFF1A\u4EE4\u4E00\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C").set("ai", remote("target => get.attitude(_status.event.player,target)")).forResult();
        if (!result.bool) return;
        player.logSkill("ai_yansuan", result.targets);
        player.addTempSkill("ai_yansuan_used", { global: "phaseAfter" });
        await result.targets[0].draw();
      },
      subSkill: { used: { charlotte: true }, record: { charlotte: true, onremove: true } }
    },
    ai_bianyi: {
      enable: "phaseUse",
      usable: 1,
      position: "h",
      selectCard: 1,
      filterCard: true,
      discard: false,
      lose: false,
      delay: false,
      filter(event, player) {
        return !program(player) && player.countCards("h") > 0;
      },
      check: (card) => 7 - get3.value(card),
      async content(event, trigger, player) {
        const next = player.addToExpansion(event.cards, player, "give");
        next.gaintag.add("ai_bianyi");
        await next;
      },
      marktext: "\u7801",
      intro: { content: "expansion", markcount: "expansion" },
      onremove(player, skill) {
        const cards = player.getExpansions(skill);
        if (cards.length) player.loseToDiscardpile(cards);
      },
      ai: { order: 8, result: { player: 1 } },
      group: "ai_bianyi_execute",
      subSkill: {
        execute: {
          trigger: { player: "useCardAfter" },
          filter(event, player) {
            const card = program(player);
            return !!card && get3.type2(event.card) === get3.type2(card);
          },
          prompt: "\u7F16\u8BD1\uFF1A\u6D88\u8017\u7A0B\u5E8F\uFF0C\u6478\u4E24\u5F20\u724C\u5E76\u6267\u884C\u5BF9\u5E94\u6548\u679C\uFF1F",
          async content(event, trigger, player) {
            const card = program(player);
            if (!card) return;
            const type = get3.type2(card);
            await player.loseToDiscardpile(card);
            await player.draw(2);
            if (type === "basic") {
              player.addTempSkill("ai_bianyi_sha", { global: "phaseAfter" });
              player.addMark("ai_bianyi_sha", 1, false);
            } else if (type === "trick") {
              const result = await player.chooseTarget("\u7F16\u8BD1\uFF1A\u53EF\u4EE5\u5F03\u7F6E\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u533A\u57DF\u5185\u7684\u4E00\u5F20\u724C", (card2, source, target) => source !== target && target.countDiscardableCards(source, "hej") > 0).set("ai", remote("target => -get.attitude(_status.event.player,target)")).forResult();
              if (result.bool) await player.discardPlayerCard(result.targets[0], "hej", true);
            } else if (type === "equip") {
              const result = await player.chooseTarget("\u7F16\u8BD1\uFF1A\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u56DE\u590D1\u70B9\u4F53\u529B", (card2, source, target) => target.isDamaged()).set("ai", remote("target => get.attitude(_status.event.player,target)")).forResult();
              if (result.bool) await result.targets[0].recover();
            }
          }
        },
        sha: { charlotte: true, onremove: true, mark: true, marktext: "\u8BD1", intro: { content: "\u672C\u56DE\u5408\u4F7F\u7528\u6740\u7684\u6B21\u6570\u4E0A\u9650+#\u3002" }, mod: { cardUsable(card, player, num) {
          if (card.name === "sha") return num + player.countMark("ai_bianyi_sha");
        } } }
      }
    },
    ai_tiaoshi: {
      trigger: { global: "damageBegin4" },
      usable: 1,
      filter(event, player) {
        const card = program(player);
        return event.num > 0 && !!card && colored(event.card) && get3.color(card) === get3.color(event.card);
      },
      check(event, player) {
        return get3.attitude(player, event.player) > 0;
      },
      prompt: "\u8C03\u8BD5\uFF1A\u6D88\u8017\u540C\u989C\u8272\u7A0B\u5E8F\uFF0C\u4EE4\u6B64\u4F24\u5BB3\uFF0D1\uFF1F",
      async content(event, trigger, player) {
        const card = program(player);
        if (!card) return;
        await player.loseToDiscardpile(card);
        trigger.num--;
      }
    },
    ai_dongcha: {
      enable: "phaseUse",
      usable: 1,
      filterTarget: (card, player, target) => target !== player && target.countCards("h") > 0,
      async content(event, trigger, player) {
        const target = event.target;
        const result = await player.chooseControl("\u57FA\u672C\u724C", "\u9526\u56CA\u724C", "\u88C5\u5907\u724C").set("prompt", "\u6D1E\u5BDF\uFF1A\u58F0\u660E\u4E00\u79CD\u7C7B\u522B\uFF0C\u518D\u89C2\u770B\u968F\u673A\u4E24\u5F20\u624B\u724C").set("ai", remote("() => 0")).forResult();
        const type = ["basic", "trick", "equip"][result.index], cards = target.getCards("h").randomGets(2);
        const shown = await player.chooseButton(["\u6D1E\u5BDF\uFF1A\u547D\u4E2D\u58F0\u660E\u5219\u9009\u62E9\u83B7\u5F97\u5BF9\u5E94\u724C", cards], true).set("aiDongchaType", type).set("filterButton", remote("button => {const cards=_status.event.dialog.buttons.map(button=>button.link);return !cards.some(card=>get.type2(card)===_status.event.aiDongchaType)||get.type2(button.link)===_status.event.aiDongchaType;}")).set("ai", remote("button => get.value(button.link)")).forResult();
        const selected = shown.links?.[0];
        if (selected && get3.type2(selected) === type && target.getCards("h").includes(selected)) await player.gain(selected, target, "giveAuto");
        else await player.draw();
        if (target.isIn() && player.countCards("h")) await player.chooseToGive(target, "h", 1, true);
      },
      ai: { order: 6, result: { player: 1, target: -0.3 } }
    },
    ai_zhiyan: {
      trigger: { player: "useCardToPlayered" },
      direct: true,
      filter(event, player) {
        return event.card.name === "sha" && !player.hasSkill("ai_zhiyan_used") && event.target !== player && event.target.isIn() && player.getCards("h").some(colored);
      },
      async content(event, trigger, player) {
        const shown = await player.chooseCard("h", "\u76F4\u8A00\uFF1A\u5C55\u793A\u4E00\u5F20\u6709\u989C\u8272\u7684\u624B\u724C\uFF0C\u4EE4\u76EE\u6807\u5F03\u540C\u8272\u724C\u6216\u6B64\u6740\u5BF9\u5176\u4F24\u5BB3\uFF0B1", remote("card => ['red','black'].includes(get.color(card))")).set("ai", remote("card => 6-get.value(card)")).forResult();
        if (!shown.bool) return;
        player.logSkill("ai_zhiyan", trigger.target);
        player.addTempSkill("ai_zhiyan_used", { global: "phaseAfter" });
        await player.showCards(shown.cards, "\u76F4\u8A00");
        const result = await trigger.target.chooseToDiscard("h", "\u76F4\u8A00\uFF1A\u5F03\u7F6E\u540C\u989C\u8272\u624B\u724C\uFF0C\u5426\u5219\u6B64\u6740\u5BF9\u4F60\u7684\u4F24\u5BB3\uFF0B1", remote("card => get.color(card)===_status.event.aiZhiyanColor")).set("chooseonly", true).set("aiZhiyanColor", get3.color(shown.cards[0])).set("ai", remote("card => 8-get.value(card)")).forResult();
        if (result.bool) {
          await trigger.target.showCards(result.cards, "\u76F4\u8A00\uFF1A\u5C55\u793A\u5E76\u5F03\u7F6E");
          await trigger.target.discard(result.cards);
        } else {
          const use = trigger.getParent();
          use.customArgs ||= {};
          const args = use.customArgs[trigger.target.playerid] ||= {};
          args.extraDamage = (args.extraDamage || 0) + 1;
        }
      },
      subSkill: { used: { charlotte: true } }
    }
  };
}

// game/resources/app/src/character/ai/skill.js
var skill_default = createAiSkills(game, get, lib, ui, _status);

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
  ai_qiaoda: "\u5DE7\u7B54",
  ai_qiaoda_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u9700\u8981\u4F7F\u7528\u6216\u6253\u51FA\u6740\u3001\u95EA\u6216\u6843\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4E00\u5F20\u624B\u724C\u8F6C\u5316\uFF1A\u57FA\u672C\u724C\u5F53\u95EA\uFF0C\u9526\u56CA\u724C\u5F53\u6843\uFF0C\u88C5\u5907\u724C\u5F53\u666E\u901A\u6740\u3002\u4ECD\u987B\u7B26\u5408\u6B63\u5E38\u4F7F\u7528\u6761\u4EF6\u3002",
  ai_qiaoda_used: "\u5DE7\u7B54",
  ai_banxing: "\u4F34\u884C",
  ai_banxing_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u4E8E\u56DE\u5408\u5916\u4F7F\u7528\u6216\u6253\u51FA\u624B\u724C\u7ED3\u7B97\u7ED3\u675F\u540E\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF1A\u82E5\u5176\u624B\u724C\u6570\u5C0F\u4E8E\u4F60\uFF0C\u5176\u6478\u4E00\u5F20\u724C\uFF1B\u5426\u5219\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002",
  ai_tuili: "\u63A8\u7406",
  ai_tuili_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u89C2\u770B\u724C\u5806\u9876\u4E09\u5F20\u724C\uFF0C\u4F9D\u6B21\u6267\u884C\uFF1A\u2460\u83B7\u5F97\u5176\u4E2D\u4E00\u5F20\uFF1B\u2461\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u624B\u724C\uFF0C\u518D\u83B7\u5F97\u5176\u4E2D\u4E00\u5F20\uFF1B\u2462\u82E5\u6267\u884C\u4E86\u2461\uFF0C\u53EF\u4EE5\u518D\u5F03\u7F6E\u4E00\u5F20\u624B\u724C\uFF0C\u83B7\u5F97\u6700\u540E\u4E00\u5F20\uFF0C\u82E5\u6B64\u6B21\u5F03\u724C\u4E0E\u83B7\u5F97\u724C\u989C\u8272\u76F8\u540C\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002\u5269\u4F59\u724C\u7531\u4F60\u4EE5\u4EFB\u610F\u987A\u5E8F\u7F6E\u4E8E\u724C\u5806\u5E95\u3002",
  ai_yansuan: "\u9A8C\u7B97",
  ai_yansuan_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u4F7F\u7528\u5B9E\u4F53\u624B\u724C\u7ED3\u7B97\u7ED3\u675F\u540E\uFF0C\u82E5\u6B64\u724C\u662F\u4F60\u672C\u56DE\u5408\u901A\u8FC7\u63A8\u7406\u83B7\u5F97\u7684\u724C\uFF0C\u4E14\u672A\u9020\u6210\u4F24\u5BB3\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C\u3002",
  ai_bianyi: "\u7F16\u8BD1",
  ai_bianyi_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u82E5\u4F60\u6CA1\u6709\u7A0B\u5E8F\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4E00\u5F20\u624B\u724C\u6B63\u9762\u7F6E\u4E8E\u6B66\u5C06\u724C\u4E0A\uFF0C\u79F0\u4E3A\u7A0B\u5E8F\uFF08\u81F3\u591A\u4E00\u5F20\uFF0C\u4FDD\u7559\u81F3\u88AB\u6D88\u8017\uFF09\u3002\u4F60\u4F7F\u7528\u4E0E\u7A0B\u5E8F\u7C7B\u522B\u76F8\u540C\u7684\u724C\u7ED3\u7B97\u7ED3\u675F\u540E\uFF0C\u53EF\u4EE5\u5C06\u7A0B\u5E8F\u7F6E\u5165\u5F03\u724C\u5806\uFF0C\u6478\u4E24\u5F20\u724C\uFF0C\u5E76\u6309\u5176\u7C7B\u522B\u6267\u884C\uFF1A\u57FA\u672C\u724C\uFF0C\u672C\u56DE\u5408\u4F7F\u7528\u6740\u7684\u6B21\u6570\u4E0A\u9650+1\uFF1B\u9526\u56CA\u724C\uFF0C\u53EF\u4EE5\u5F03\u7F6E\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u533A\u57DF\u5185\u7684\u4E00\u5F20\u724C\uFF1B\u88C5\u5907\u724C\uFF0C\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u56DE\u590D1\u70B9\u4F53\u529B\u3002\u666E\u901A\u9526\u56CA\u4E0E\u5EF6\u65F6\u9526\u56CA\u89C6\u4E3A\u540C\u7C7B\u3002",
  ai_bianyi_execute: "\u7F16\u8BD1",
  ai_bianyi_sha: "\u7F16\u8BD1",
  ai_tiaoshi: "\u8C03\u8BD5",
  ai_tiaoshi_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4E00\u540D\u89D2\u8272\u53D7\u5230\u6709\u989C\u8272\u7684\u724C\u9020\u6210\u7684\u4F24\u5BB3\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4E0E\u8BE5\u724C\u989C\u8272\u76F8\u540C\u7684\u7A0B\u5E8F\u7F6E\u5165\u5F03\u724C\u5806\uFF0C\u4EE4\u6B64\u4F24\u5BB3-1\u3002",
  ai_dongcha: "\u6D1E\u5BDF",
  ai_dongcha_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u6709\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272\uFF0C\u58F0\u660E\u57FA\u672C\u724C\u3001\u9526\u56CA\u724C\u6216\u88C5\u5907\u724C\uFF0C\u7136\u540E\u89C2\u770B\u5176\u968F\u673A\u4E24\u5F20\u624B\u724C\uFF08\u4E0D\u8DB3\u5219\u5168\u90E8\uFF09\u3002\u82E5\u5176\u4E2D\u6709\u58F0\u660E\u7C7B\u522B\uFF0C\u4F60\u83B7\u5F97\u5176\u4E2D\u4E00\u5F20\u8BE5\u7C7B\u522B\u7684\u724C\uFF0C\u7136\u540E\u4EA4\u7ED9\u5176\u4E00\u5F20\u624B\u724C\uFF1B\u5426\u5219\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\uFF0C\u7136\u540E\u4EA4\u7ED9\u5176\u4E00\u5F20\u624B\u724C\u3002\u666E\u901A\u9526\u56CA\u4E0E\u5EF6\u65F6\u9526\u56CA\u89C6\u4E3A\u540C\u7C7B\u3002",
  ai_zhiyan: "\u76F4\u8A00",
  ai_zhiyan_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u5BF9\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u6740\u6307\u5B9A\u76EE\u6807\u540E\uFF0C\u4F60\u53EF\u4EE5\u5C55\u793A\u4E00\u5F20\u6709\u989C\u8272\u7684\u624B\u724C\uFF0C\u4EE4\u5176\u9009\u62E9\uFF1A\u5C55\u793A\u5E76\u5F03\u7F6E\u4E00\u5F20\u540C\u989C\u8272\u624B\u724C\uFF1B\u6216\u4EE4\u6B64\u6740\u5BF9\u5176\u9020\u6210\u7684\u4F24\u5BB3+1\u3002"
};

// game/resources/app/src/character/mushoku/expansion.js
import { lib as lib2, game as game2, get as get2, _status as _status2 } from "noname";
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
