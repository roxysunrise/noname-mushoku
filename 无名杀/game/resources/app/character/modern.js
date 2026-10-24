// game/resources/app/src/character/modern/index.js
import { game as game4 } from "noname";

// game/resources/app/src/noname/init/mushoku-characters.js
var characters = {
  ac_hulk: { sex: "male", group: "yi", hp: 5, maxHp: 5, skills: ["ac_rageburst", "ac_gammasteal"], img: "image/character/ac_hulk.jpg" },
  ac_gojo: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_fuki", "ac_jiaozi"], img: "image/character/ac_gojo.jpg" },
  ac_doraemon: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_timestore", "ac_anydoor"], img: "image/character/ac_doraemon.jpg" },
  ac_joker: { sex: "male", group: "yi", hp: 4, maxHp: 6, skills: ["ac_chaoslaugh", "ac_crimecycle"], img: "image/character/ac_joker.jpg" },
  ac_spiderman: { sex: "male", group: "yi", hp: 3, maxHp: 3, skills: ["ac_spidersense"], img: "image/character/ac_spiderman.jpg" },
  ac_wonderwoman: { sex: "female", group: "yi", hp: 3, maxHp: 3, skills: ["ac_lasso", "ac_amazonlegacy"], img: "image/character/ac_wonderwoman.jpg" },
  ac_ken: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_hundredfists", "ac_fateduel"], img: "image/character/ac_ken.jpg" },
  ac_batman: { sex: "male", group: "yi", hp: 4, maxHp: 4, skills: ["ac_nightstalk", "ac_batprey"], img: "image/character/ac_batman.jpg" },
  ac_santa: { sex: "male", group: "yi", hp: 3, maxHp: 3, skills: ["ac_giftdelivery", "ac_sijian"], img: "image/character/ac_santa.jpg" },
  ac_captain: { sex: "male", group: "yi", hp: 4, maxHp: 4, skills: ["ac_freedomcommand"], img: "image/character/ac_captain.jpg" },
  ac_totoro: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_forestwatch"], img: "image/character/ac_totoro.jpg" },
  ac_light: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_kirajudgment", "ac_deathnote"], img: "image/character/ac_light.jpg" },
  ac_kirby: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_copyability", "ac_swallowrecycle"], img: "image/character/ac_kirby.jpg" },
  ac_gandalf: { sex: "male", group: "yi", hp: 4, maxHp: 4, skills: ["ac_whitepact"], img: "image/character/ac_gandalf.jpg" },
  ac_mustang: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_warstock", "ac_alchemytactic", "ac_flamealchemy"], img: "image/character/ac_mustang.jpg" },
  ac_vader: { sex: "male", group: "yi", hp: 4, maxHp: 4, skills: ["ac_forcebind"], img: "image/character/ac_vader.jpg" },
  ac_yumeko: { sex: "female", group: "huan", hp: 4, maxHp: 4, skills: ["ac_haodu", "ac_xuju"], img: "image/character/ac_yumeko.jpg" },
  ac_kaito: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_zhangyan"], img: "image/character/ac_kaito.jpg" },
  ac_chatgpt: { sex: "female", group: "xu", hp: 4, maxHp: 4, skills: ["ac_tuiyan"], img: "image/character/ac_chatgpt.jpg" },
  ai_doubao: { sex: "female", group: "xu", hp: 3, skills: ["ai_qiaoda", "ai_banxing"], img: "image/character/ai_doubao.jpg" },
  ai_deepseek: { sex: "female", group: "xu", hp: 3, skills: ["ai_tuili", "ai_yansuan"], img: "image/character/ai_deepseek.jpg" },
  ai_claude: { sex: "female", group: "xu", hp: 3, skills: ["ai_bianyi", "ai_tiaoshi"], img: "image/character/ai_claude.jpg" },
  ai_grok: { sex: "female", group: "xu", hp: 4, skills: ["ai_dongcha", "ai_zhiyan"], img: "image/character/ai_grok.jpg" },
  mc_netherite: { sex: "none", group: "qi", hp: 4, maxHp: 4, skills: ["mc_fengcang", "mc_xiejia", "mc_rongzhu"], img: "image/character/mc_netherite.jpg" },
  th_mokou: { sex: "female", group: "huan", hp: 2, maxHp: 2, skills: ["th_penglai", "th_fengyi"], img: "image/character/th_mokou.jpg" },
  ac_yuu: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_heyun", "ac_yinhui"], img: "image/character/ac_yuu.jpg" },
  mc_dream: { sex: "male", group: "wang", hp: 4, skills: ["mc_choumou", "mc_xianyi"], img: "image/character/mc_dream.jpg" },
  ac_alucard: { sex: "male", group: "huan", hp: 4, maxHp: 4, skills: ["ac_life", "ac_river", "ac_jackal"], img: "image/character/ac_alucard.jpg" },
  ac_okabe: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_observe", "ac_mail", "ac_worldline"], img: "image/character/ac_okabe.jpg" },
  ac_fighter: { sex: "none", group: "qi", hp: 4, maxHp: 4, skills: ["ac_zhikong", "ac_youji", "ac_guibi"], img: "image/character/ac_fighter.jpg" },
  ac_tank: { sex: "none", group: "qi", hp: 4, maxHp: 4, skills: ["ac_zhuangjia", "ac_paoji", "ac_gushou"], img: "image/character/ac_tank.jpg" },
  mc_chicken: { sex: "male", group: "yi", hp: 4, skills: ["mc_jinshen", "mc_huanxue", "mc_lianji"] },
  mt_rudeus: { sex: "male", group: "huan", hp: 3, skills: ["mt_voiceless", "mt_foresight"] },
  mt_roxy: { sex: "female", group: "huan", hp: 3, skills: ["mt_roxy_mana", "mt_roxy_water", "mt_roxy_spirit", "mt_roxy_rain"] },
  mt_sylphie: { sex: "female", group: "huan", hp: 3, skills: ["mt_heal", "mt_guard"] },
  mt_eris: { sex: "female", group: "huan", hp: 4, skills: ["mt_sword", "mt_resolve"] },
  mt_orsted: { sex: "male", group: "huan", hp: 4, isZhugong: true, skills: ["mt_dragon", "mt_dragonlord"] },
  mt_ruijerd: { sex: "male", group: "huan", hp: 4, skills: ["mt_eye", "mt_protect", "mt_spear"] },
  mt_paul: { sex: "male", group: "huan", hp: 4, skills: ["mt_styles", "mt_rescue"] },
  mt_ghislaine: { sex: "female", group: "huan", hp: 4, skills: ["mt_swordking", "mt_training", "mt_ghislaine_guard"] }
};
for (const [id, character] of Object.entries(characters)) character.img ??= `image/character/${id}.${id.startsWith("ac_") || id.startsWith("mc_") ? "svg" : "jpg"}`;
var mushoku_characters_default = characters;

// game/resources/app/src/noname/init/mushoku-rosters.js
var westernCharacterIds = Object.freeze(["ac_hulk", "ac_joker", "ac_spiderman", "ac_wonderwoman", "ac_batman", "ac_captain", "ac_vader"]);
var modernCharacterIds = Object.freeze(["ac_fighter", "ac_tank", "ac_santa"]);
var characterGroups = Object.freeze(["huan", "xu", "wang", "qi", "yi"]);
var packForCharacter = (id) => modernCharacterIds.includes(id) ? "modern" : westernCharacterIds.includes(id) ? "western" : id === "ac_chatgpt" || id.startsWith("ai_") ? "ai" : id.startsWith("mc_") ? "minecraft" : "mushoku";
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
  ac_alucard: [["\u65E0\u751F\u4E4B\u738B", "#9b8cff"], ["\u547D\u6CB3\u541B\u4E34", "#d8b4ff"]],
  boss_alucard: [["\u65E0\u751F\u4E4B\u738B", "#A62D40"], ["\u4E0D\u6B7B", "#7651A8"], ["\u730E\u6740", "#C43D32"], ["\u89E3\u653E", "#A66B12"]],
  ac_okabe: [["\u72C2\u6C14\u79D1\u5B66\u5BB6", "#e5b86b"], ["\u4E16\u754C\u7EBF\u89C2\u6D4B\u8005", "#a7c7ff"]],
  ac_fighter: [["\u63A0\u7A7A\u4E4B\u7FFC", "#a7d8ff"], ["\u673A\u68B0\u5929\u7A79", "#b8c5d6"]],
  ac_tank: [["\u94A2\u94C1\u58C1\u5792", "#aab7c4"], ["\u91CD\u88C5\u5821\u5792", "#d2a679"]],
  boss_johan: [["\u65E0\u540D\u7684\u602A\u7269", "#c7b7cf"], ["\u5B8C\u7F8E\u72AF\u7F6A", "#be8b91"]],
  ac_hulk: [["\u6012\u610F\u5DE8\u795E", "#d66b5d"], ["\u4F3D\u9A6C\u72C2\u6F6E", "#8fd36d"]],
  ac_gojo: [["\u516D\u773C\u672F\u5E08", "#a8c7ff"], ["\u65E0\u91CF\u9886\u57DF", "#d1b4ff"]],
  ac_doraemon: [["\u672A\u6765\u4F19\u4F34", "#77bde8"], ["\u5947\u8FF9\u53E3\u888B", "#f0c46c"]],
  ac_joker: [["\u6DF7\u6C8C\u7B11\u5320", "#d889aa"], ["\u7F6A\u6076\u5FAA\u73AF", "#9c8caf"]],
  ac_spiderman: [["\u57CE\u5E02\u86DB\u7F51", "#e56d6d"]],
  ac_wonderwoman: [["\u4E9A\u9A6C\u900A\u4E4B\u76FE", "#dfb071"], ["\u771F\u8A00\u6301\u5B88", "#91b8e8"]],
  ac_ken: [["\u5317\u6597\u795E\u62F3", "#e58b72"], ["\u5BBF\u547D\u5F3A\u8005", "#d8b77e"]],
  ac_batman: [["\u54E5\u8C2D\u6697\u5F71", "#9ba8c9"], ["\u8759\u8760\u730E\u624B", "#c2a8d7"]],
  ac_santa: [["\u51AC\u591C\u4F7F\u8005", "#e97979"], ["\u613F\u671B\u6210\u771F", "#9ed39c"]],
  ac_captain: [["\u81EA\u7531\u5148\u950B", "#87aee8"]],
  ac_totoro: [["\u68EE\u6797\u7CBE\u7075", "#91c89e"]],
  ac_light: [["\u57FA\u62C9\u4E4B\u540D", "#b8a7d9"], ["\u6B7B\u4EA1\u88C1\u51B3", "#8b8b9e"]],
  ac_kirby: [["\u661F\u4E4B\u541E\u566C\u8005", "#ed9bb8"], ["\u4E07\u8C61\u590D\u5236", "#a8c8f0"]],
  ac_gandalf: [["\u767D\u888D\u8D24\u8005", "#d8d0bc"]],
  ac_mustang: [["\u7130\u4E4B\u70BC\u91D1\u672F\u5E08", "#e79265"], ["\u519B\u7565\u711A\u57CE", "#d9b37b"]],
  ac_vader: [["\u5E1D\u56FD\u9ED1\u5F71", "#9a9aa8"]],
  ai_doubao: [["\u4E07\u8C61\u5DE7\u7B54", "#ffc49d"], ["\u6696\u5FC3\u4F34\u884C", "#ffadca"]],
  ai_deepseek: [["\u6DF1\u6D77\u6C42\u7D22", "#9acfff"], ["\u6B65\u6B65\u6C42\u8BC1", "#93e4e2"]],
  ai_claude: [["\u4EE3\u7801\u7EC7\u5320", "#efbf9c"], ["\u5BA1\u614E\u6C42\u8BC1", "#cfb7ef"]],
  ai_grok: [["\u5B9E\u65F6\u6D1E\u5BDF", "#c1d3f7"], ["\u950B\u8292\u76F4\u8A00", "#f1a4ca"]],
  mc_chicken: [["\u65B9\u5757\u6597\u58EB", "#f5a623"], ["\u8FD1\u6218\u731B\u79BD", "#d94f4f"]]
};
var characterTitles = Object.fromEntries(Object.entries(labels).map(([id, values]) => [id, values.map(([text, color]) => badge(text, color)).join(" ")]));
var titlesForPack = (pack) => Object.fromEntries(Object.entries(characterTitles).filter(([id]) => packForCharacter(id) === pack));

// game/resources/app/src/character/modern/character.js
var character_default = Object.fromEntries(Object.entries(mushoku_characters_default).filter(([id]) => packForCharacter(id) === "modern"));

// game/resources/app/src/character/mushoku/skill.js
import { lib as lib2, game as game2, get as get2, _status as _status2 } from "noname";

// game/resources/app/src/character/mushoku/sixteen.js
import { lib, game, get, ui, _status } from "noname";
var other = (card, player, target) => target !== player;
var remoteChoice = (source) => get.infoFuncOL("_noname_func:" + source);
var inDiscard = (cards) => (cards || []).filter((card) => get.position(card, true) === "d");
var discardedUse = (event) => {
  const ordering = event.getParent();
  if (ordering.name !== "orderingDiscard") return null;
  const use = ordering.relatedEvent || ordering.getParent();
  return use.name === "useCard" ? use : null;
};
var maximal = (player, value) => !game.hasPlayer((target) => value(target) > value(player));
var chooseTarget = async (player, prompt, filter = other, range) => {
  const next = range ? player.chooseTarget(prompt, range, filter) : player.chooseTarget(prompt, filter);
  return next.forResult();
};
var adjustHand = async (owner, target) => {
  if (!owner.isIn() || !target.isIn()) return;
  const n = owner.countCards("h"), h = target.countCards("h");
  if (h > n) await target.chooseToDiscard("h", h - n, true);
  else if (h < Math.min(5, n)) await target.draw(Math.min(5, n) - h);
};
var fuki = {
  trigger: { player: "useCard" },
  forced: true,
  content(event, trigger, player) {
    trigger.directHit.addArray(game.filterPlayer((target) => target !== player && get.distance(target, player) === 1));
  }
};
var sixteen_default = {
  ac_rageburst: {
    forced: true,
    trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
    filter: (event, player) => event.card.name === "juedou" || event.player === player && event.card.name === "sha",
    content(event, trigger, player) {
      const map = trigger.getParent().customArgs, id = trigger.target.playerid;
      const args = map[id] ||= {};
      if (trigger.card.name === "sha") args.shanRequired = (args.shanRequired || 1) + 1;
      else {
        const opponent = (trigger.player === player ? trigger.target : trigger.player).playerid;
        args.shaReq ||= {};
        args.shaReq[opponent] = (args.shaReq[opponent] || 1) + 1;
      }
    }
  },
  ac_gammasteal: {
    trigger: { source: "damageSource" },
    filter: (event, player) => event.card?.name === "sha" && event.getParent("useCard")?.player === player && event.player !== player && event.player.isIn() && event.player.countGainableCards(player, "hej") > 0,
    async content(event, trigger, player) {
      const target = trigger.player;
      if (!player.isIn() || !target.isIn() || !target.countGainableCards(player, "hej")) return;
      const result = await player.gainPlayerCard(target, "hej", true).forResult();
      if (!result.bool || !result.cards?.length) return;
      if (get.type(result.cards[0]) !== "equip") {
        if (target.isIn()) await target.draw();
        return;
      }
      if (!player.isIn() || !target.isIn()) return;
      const duel = { name: "juedou", isCard: true };
      const targets = game.filterPlayer((candidate) => candidate !== target && candidate !== player && candidate.isIn() && player.canUse(duel, candidate));
      if (!targets.length) return;
      const choice = await target.chooseTarget(
        "\u4F3D\u9A6C\u63A0\u593A\uFF1A\u6307\u5B9A\u51B3\u6597\u76EE\u6807",
        remoteChoice("(card, source, candidate) => candidate.isIn() && _status.event.acGammaTargets.includes(candidate)")
      ).set("acGammaTargets", targets).forResult();
      const chosen = choice.targets?.[0];
      if (choice.bool && player.isIn() && target.isIn() && targets.includes(chosen) && chosen.isIn() && player.canUse(duel, chosen)) await player.useCard(duel, chosen);
    }
  },
  ac_fuki: { ...fuki },
  ac_jiaozi: {
    trigger: { source: "damageBegin1", player: "damageBegin3" },
    forced: true,
    filter: (event, player) => player.isMaxHandcard(true),
    async content(event, trigger) {
      trigger.num++;
    }
  },
  ac_timestore: {
    trigger: { player: "phaseUseEnd" },
    direct: true,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u65F6\u5149\u6574\u7406\uFF1A\u9009\u62E9\u624B\u724C\u6570\u4E0D\u7B49\u4E8E\u4F53\u529B\u503C\u7684\u89D2\u8272", (card, source, target2) => target2.countCards("h") !== target2.hp);
      if (!result.bool) return;
      const target = result.targets[0];
      player.logSkill("ac_timestore", target);
      const options = target.countCards("h") ? ["\u5F03\u7F6E\u624B\u724C", "\u6478\u724C"] : ["\u6478\u724C"];
      const choice = await player.chooseControl(options).forResult();
      if (choice.control === "\u5F03\u7F6E\u624B\u724C") await target.chooseToDiscard("h", 1, true);
      else await target.draw();
      if (target.countCards("h") === target.hp) {
        await player.draw();
        if (target !== player) await player.chooseToGive(target, "he", 1, "\u65F6\u5149\u6574\u7406\uFF1A\u53EF\u4EE5\u4EA4\u7ED9\u5176\u4E00\u5F20\u724C");
      }
    }
  },
  ac_anydoor: {
    trigger: { target: "useCardToTargeted" },
    direct: true,
    filter(event, player) {
      if (get.type(event.card) !== "trick" || get.subtype(event.card) === "delay") return false;
      const use = event.getParent();
      if (use.targets.length > 1) return true;
      return game.hasPlayer((target) => !use.targets.includes(target) && lib.filter.targetEnabled2(event.card, event.player, target) && lib.filter.targetInRange(event.card, event.player, target));
    },
    async content(event, trigger, player) {
      const use = trigger.getParent();
      const result = await player.chooseTarget(
        "\u4EFB\u610F\u95E8\uFF1A\u589E\u52A0\u6216\u51CF\u5C11\u4E00\u4E2A\u76EE\u6807\uFF08\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\uFF09",
        remoteChoice("(card, source, target) => { const event = _status.event; return event.acAnydoorTargets.includes(target) ? event.acAnydoorTargets.length > 1 : lib.filter.targetEnabled2(event.acAnydoorCard, event.acAnydoorSource, target) && lib.filter.targetInRange(event.acAnydoorCard, event.acAnydoorSource, target); }")
      ).set("acAnydoorTargets", use.targets).set("acAnydoorCard", trigger.card).set("acAnydoorSource", trigger.player).forResult();
      if (!result.bool) return;
      const target = result.targets[0];
      player.logSkill("ac_anydoor", target);
      if (use.targets.includes(target)) {
        use.targets.remove(target);
        use.excluded.add(target);
      } else use.targets.push(target);
    }
  },
  ac_chaoslaugh: {
    trigger: { player: "phaseZhunbeiBegin" },
    direct: true,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u6DF7\u4E71\u72C2\u7B11\uFF1A\u5BF9\u4E00\u540D\u4F53\u529B\u4E0D\u5927\u4E8E\u4F60\u7684\u5176\u4ED6\u89D2\u8272\u9020\u62100\u20132\u70B9\u968F\u673A\u4F24\u5BB3", (card, source, target) => target !== source && target.hp <= source.hp);
      if (result.bool) {
        player.logSkill("ac_chaoslaugh", result.targets);
        const n = get.rand(0, 2);
        if (n) await result.targets[0].damage(n, player);
      }
    }
  },
  ac_crimecycle: {
    trigger: { global: "cardsDiscardAfter" },
    filter(event, player) {
      const use = discardedUse(event);
      return !player.hasSkill("ac_crimecycle_used") && player.isPhaseUsing() && use?.player === player && get.type2(use.card) === "trick" && inDiscard(event.cards).some((card) => use.cards.includes(card));
    },
    async content(event, trigger, player) {
      player.addTempSkill("ac_crimecycle_used", "phaseUseAfter");
      const use = discardedUse(trigger), cards = inDiscard(trigger.cards).filter((card) => use.cards.includes(card));
      await player.loseMaxHp();
      if (player.isIn() && inDiscard(cards).length) await player.gain(inDiscard(cards), "gain2");
    },
    subSkill: { used: { charlotte: true } }
  },
  ac_spidersense: {
    trigger: { global: "useCardToTarget" },
    direct: true,
    filter: (event, player) => !player.hasSkill("ac_spidersense_used") && event.player !== player && (event.card.name === "sha" || get.type(event.card) === "delay") && (event.target === player || player.inRange(event.target)),
    async content(event, trigger, player) {
      const canDiscard = trigger.player.isIn() && trigger.player.countDiscardableCards(player, "h") > 0;
      const canReplace = trigger.target !== player && !trigger.targets.includes(player) && trigger.target.isIn();
      const controls = [];
      if (canDiscard) controls.push("\u9009\u9879\u4E00");
      controls.push("\u9009\u9879\u4E8C");
      if (canReplace) controls.push("\u80CC\u6C34\uFF01");
      controls.push("cancel2");
      const result = await player.chooseControl({
        controls,
        choiceList: [
          `\u5F03\u7F6E${get.translation(trigger.player)}\u7684\u4E00\u5F20\u624B\u724C`,
          "\u6478\u4E00\u5F20\u724C",
          "\u80CC\u6C34\uFF01\u6267\u884C\u4E0A\u8FF0\u6240\u6709\u9009\u9879\uFF0C\u7136\u540E\u4EE3\u66FF\u5176\u6210\u4E3A\u6B64\u724C\u76EE\u6807"
        ],
        prompt: "\u8718\u86DB\u611F\u5E94\uFF1A\u9009\u62E9\u4E00\u9879\uFF1B\u80CC\u6C34\u6267\u884C\u4E24\u9879\u5E76\u4EE3\u66FF\u76EE\u6807"
      }).forResult();
      if (result.control === "cancel2" || !controls.includes(result.control)) return;
      player.addTempSkill("ac_spidersense_used", "phaseAfter");
      player.logSkill("ac_spidersense");
      if ((result.control === "\u9009\u9879\u4E00" || result.control === "\u80CC\u6C34\uFF01") && canDiscard) await player.discardPlayerCard(trigger.player, "h", true);
      if ((result.control === "\u9009\u9879\u4E8C" || result.control === "\u80CC\u6C34\uFF01") && player.isIn()) await player.draw();
      if (result.control === "\u80CC\u6C34\uFF01" && player.isIn() && canReplace) {
        const use = trigger.getParent();
        if (!use.targets.includes(trigger.target) || use.targets.includes(player)) return;
        use.targets.remove(trigger.target);
        use.targets.push(player);
        use.triggeredTargets1?.remove(trigger.target);
        use.triggeredTargets2?.remove(trigger.target);
        trigger.untrigger();
      }
    },
    subSkill: { used: { charlotte: true } }
  },
  ac_lasso: {
    enable: "phaseUse",
    usable: 1,
    selectTarget: 2,
    multitarget: true,
    filterTarget(card, player, target) {
      return target !== player && (!ui.selected.targets.length || target.countGainableCards(ui.selected.targets[0], "hej") > 0);
    },
    async content(event, trigger, player) {
      const [a, b] = event.targets, equips = b.getCards("e");
      const gained = await a.gainPlayerCard(b, "hej", true).forResult();
      if (!gained.bool) return;
      if (!equips.includes(gained.cards[0])) await player.draw();
      if (a.countCards("h") !== b.countCards("h")) {
        const poor = a.countCards("h") < b.countCards("h") ? a : b;
        if ((await player.chooseBool(`\u771F\u8A00\u5957\u7D22\uFF1A\u662F\u5426\u4EE4${get.translation(poor)}\u6478\u4E00\u5F20\u724C\uFF1F`).forResult()).bool) await poor.draw();
      }
    },
    ai: { order: 6, result: { player: 1 } }
  },
  ac_amazonlegacy: {
    trigger: { player: "die" },
    forceDie: true,
    direct: true,
    async content(event, trigger, player) {
      const result = await player.chooseTarget("\u4E9A\u9A6C\u900A\u9057\u5FD7\uFF1A\u4EE4\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u6478\u4E09\u5F20\u724C\u5E76\u56DE\u590D1\u70B9\u4F53\u529B", other).set("forceDie", true).forResult();
      if (result.bool) {
        player.logSkill("ac_amazonlegacy", result.targets);
        await result.targets[0].draw(3);
        await result.targets[0].recover();
      }
    }
  },
  ac_hundredfists: {
    enable: "phaseUse",
    filter: (event, player) => !player.hasSkill("ac_hundredfists_block"),
    filterTarget: (card, player, target) => target !== player && player.canUse({ name: "sha", isCard: true }, target, false),
    async content(event, trigger, player) {
      const n = player.getStat("skill").ac_hundredfists || 1;
      const options = ["\u6D41\u5931\u4F53\u529B"];
      if (player.countCards("he", (card) => lib.filter.cardDiscardable(card, player, "ac_hundredfists")) >= n) options.unshift("\u5F03\u7F6E\u724C");
      const result = await player.chooseControl(options).set("prompt", `\u5317\u6597\u767E\u88C2\u62F3\uFF1A\u5F03\u7F6E${n}\u5F20\u724C\u6216\u6D41\u5931${n}\u70B9\u4F53\u529B`).forResult();
      if (result.control === "\u5F03\u7F6E\u724C") await player.chooseToDiscard("he", n, true);
      else await player.loseHp(n);
      if (!player.isIn() || !event.target.isIn()) return;
      const use = player.useCard({ name: "sha", isCard: true }, event.target, false);
      use.ac_hundredfists = true;
      await use;
      if ([...game.players, ...game.dead].some((target) => target.getHistory("damage", (damage) => damage.getParent("useCard") === use).length > 0)) player.addTempSkill("ac_hundredfists_block", "phaseAfter");
    },
    subSkill: { block: { charlotte: true } },
    ai: { order: 5, result: { target: -1 } }
  },
  ac_fateduel: {
    trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
    filter: (event, player) => event.card.name === "sha" && (event.player === player ? event.target !== player && event.target.hp === player.hp : event.player.hp === player.hp),
    async content(event, trigger, player) {
      await player.draw();
    }
  },
  ac_nightstalk: {
    trigger: { player: ["phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore"] },
    filter(event, player) {
      if (event.name === "phaseDraw") return maximal(player, (p) => p.countCards("h"));
      if (event.name === "phaseUse") return maximal(player, (p) => p.hp);
      return player.countCards("e") > 0 && maximal(player, (p) => p.countCards("e"));
    },
    content(event, trigger) {
      trigger.cancel();
    }
  },
  ac_batprey: {
    trigger: { player: "phaseAfter" },
    direct: true,
    filter: (event, player) => player.getHistory("skipped").length > 0,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u8759\u8760\u8FFD\u730E\uFF1A\u9009\u62E9\u53D7\u52301\u70B9\u4F24\u5BB3\u7684\u5176\u4ED6\u89D2\u8272", other, [1, player.getHistory("skipped").length]);
      if (!result.bool) return;
      player.logSkill("ac_batprey", result.targets);
      for (const target of result.targets) if (target.isIn()) await target.damage(1, player);
      const cards = Array.from(ui.cardPile.childNodes).filter((card) => get.type(card) === "equip");
      if (cards.length) await player.gain(cards.randomGet(), "gain2");
    }
  },
  ac_giftdelivery: {
    enable: "phaseUse",
    usable: 1,
    position: "h",
    filterCard: true,
    selectCard: [2, Infinity],
    discard: false,
    lose: false,
    delay: false,
    filter: (event, player) => player.countCards("h") >= 2,
    filterTarget: other,
    async content(event, trigger, player) {
      await player.give(event.cards, event.target);
      player.storage.ac_giftdelivery_targets ||= [];
      player.storage.ac_giftdelivery_targets.push(event.target);
      player.addTempSkill("ac_giftdelivery_settle", "phaseAfter");
    },
    subSkill: { settle: {
      charlotte: true,
      trigger: { global: "phaseEnd" },
      forced: true,
      onremove(player) {
        delete player.storage.ac_giftdelivery_targets;
      },
      async content(event, trigger, player) {
        const targets = player.storage.ac_giftdelivery_targets || [];
        delete player.storage.ac_giftdelivery_targets;
        for (const target of targets) if (target.isIn()) {
          if (maximal(target, (p) => p.countCards("h"))) await player.draw();
          else if (target.countDiscardableCards(player, "hej")) await player.discardPlayerCard(target, "hej", true);
        }
      }
    } },
    ai: { order: 4, result: { target: 1 } }
  },
  ac_freedomcommand: {
    trigger: { player: "phaseUseBegin" },
    direct: true,
    filter: (event, player) => player.countCards("he") > 0,
    async content(event, trigger, player) {
      const result = await player.chooseCardTarget({ prompt: "\u81EA\u7531\u53F7\u4EE4\uFF1A\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4E00\u5F20\u724C", position: "he", filterCard: true, filterTarget: other }).forResult();
      if (!result?.bool || !result.cards?.length || !result.targets?.length) return;
      const target = result.targets[0];
      if (!target?.isIn?.() || !player.isIn?.()) return;
      player.logSkill("ac_freedomcommand", target);
      await player.give(result.cards, target);
      const used = await target.chooseToUse({ prompt: "\u81EA\u7531\u53F7\u4EE4\uFF1A\u662F\u5426\u4F7F\u7528\u4E00\u5F20\u975E\u9ED1\u8272\u7684\u6740\uFF1F", filterCard(card, player2) {
        return get.name(card) === "sha" && get.color(card) !== "black" && lib.filter.cardEnabled(card, player2) && lib.filter.cardUsable(card, player2);
      } }).forResult();
      if (used?.bool) {
        const use = target.getHistory("useCard").findLast((evt) => evt.getParent("ac_freedomcommand") === event);
        let damage = 0;
        if (use) for (const victim of [...game.players, ...game.dead]) for (const hit of victim.getHistory("damage", (evt) => evt.getParent("useCard") === use)) damage += hit.num;
        await player.draw(Math.min(5, damage + 1));
      } else {
        if (!player.isIn() || !target.isIn()) return;
        const canHit = (candidate) => candidate?.isIn?.() && candidate !== player && (candidate === target || target.inRange(candidate));
        if (!game.hasPlayer(canHit)) return;
        const chosen = await player.chooseTarget(
          "\u81EA\u7531\u53F7\u4EE4\uFF1A\u53EF\u4EE5\u5BF9\u5176\u6216\u5176\u653B\u51FB\u8303\u56F4\u5185\u7684\u4E00\u540D\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3",
          remoteChoice("(card, source, candidate) => { const commanded = _status.event.acCommanded; return commanded.isIn() && candidate.isIn() && candidate !== source && (candidate === commanded || commanded.inRange(candidate)); }")
        ).set("acCommanded", target).forResult();
        if (chosen?.bool && chosen.targets?.[0] && canHit(chosen.targets[0])) await chosen.targets[0].damage(1, player);
      }
    }
  },
  ac_forestwatch: {
    trigger: { player: "phaseBegin" },
    direct: true,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u68EE\u6797\u5B88\u671B\uFF1A\u81F3\u591A\u4E24\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C\u5E76\u589E\u52A0\u4E00\u70B9\u624B\u724C\u4E0A\u9650", () => true, [1, 2]);
      if (!result.bool) return;
      player.logSkill("ac_forestwatch", result.targets);
      for (const target of result.targets) {
        target.addSkill("ac_forestwatch_hand");
        target.addMark("ac_forestwatch_hand", 1, false);
        await target.draw();
      }
    },
    subSkill: { hand: { charlotte: true, mark: true, marktext: "\u68EE", intro: { content: "\u624B\u724C\u4E0A\u9650+#" }, mod: { maxHandcard: (player, num) => num + player.countMark("ac_forestwatch_hand") } } }
  },
  ac_kirajudgment: {
    enable: "phaseUse",
    usable: 1,
    position: "h",
    filterCard: true,
    selectCard: [0, Infinity],
    filterTarget: other,
    async content(event, trigger, player) {
      const target = event.target, n = event.cards.length;
      const options = ["\u7FFB\u9762\u5E76\u6478\u724C"];
      if (target.countCards("he", (card) => lib.filter.cardDiscardable(card, target, "ac_kirajudgment")) >= n) options.unshift("\u5F03\u724C\u5E76\u5931\u53BB\u4F53\u529B");
      const choice = await target.chooseControl(options).set("prompt", `\u57FA\u62C9\u5BA1\u5224\uFF1A\u5F03${n}\u5F20\u724C\u5E76\u5931\u53BB1\u70B9\u4F53\u529B\uFF0C\u6216\u7FFB\u9762\u5E76\u6478${n}\u5F20\u724C`).forResult();
      if (choice.control === "\u5F03\u724C\u5E76\u5931\u53BB\u4F53\u529B") {
        if (n) await target.chooseToDiscard("he", n, true);
        await target.loseHp();
      } else {
        await target.turnOver();
        if (n) await target.draw(n);
      }
    },
    ai: { order: 5, result: { target: -1 } }
  },
  ac_deathnote: {
    trigger: { player: "damageEnd" },
    direct: true,
    filter: (event, player) => player.countCards("h") > 0,
    async content(event, trigger, player) {
      const result = await player.chooseCard("h", "\u6B7B\u4EA1\u7B14\u8BB0\uFF1A\u5C55\u793A\u4E00\u5F20\u624B\u724C").forResult();
      if (!result.bool) return;
      player.logSkill("ac_deathnote");
      await player.showCards(result.cards);
      const source = trigger.source, type = get.type2(result.cards[0]);
      let paid = false;
      if (source?.isIn()) {
        const candidates = source.getCards("h", (card) => get.type2(card) !== type);
        if (candidates.length) {
          paid = (await source.chooseToDiscard("h", remoteChoice("card => get.type2(card) !== _status.event.acDeathnoteType"), "\u6B7B\u4EA1\u7B14\u8BB0\uFF1A\u5F03\u7F6E\u4E0D\u540C\u7C7B\u522B\u7684\u624B\u724C\uFF0C\u5426\u5219\u5176\u56DE\u590D1\u70B9\u4F53\u529B").set("acDeathnoteType", type).forResult()).bool;
        }
      }
      if (!paid) await player.recover();
    }
  },
  ac_copyability: {
    trigger: { player: "phaseDrawBegin1" },
    forced: true,
    async content(event, trigger, player) {
      const cards = get.cards(3);
      game.cardsGotoOrdering(cards);
      await player.showCards(cards, "\u590D\u5236\u80FD\u529B");
      const eligible = cards.filter((card) => get.number(card) <= 8);
      if (!eligible.length) return;
      const result = await player.chooseButton(["\u590D\u5236\u80FD\u529B\uFF1A\u53EF\u4EE5\u83B7\u5F97\u70B9\u6570\u4E0D\u5927\u4E8E8\u7684\u724C\uFF0C\u5E76\u653E\u5F03\u6478\u724C", eligible], [1, eligible.length]).forResult();
      if (!result.bool) return;
      trigger.cancel();
      await player.gain(result.links, "gain2");
      const chosen = await chooseTarget(player, "\u590D\u5236\u80FD\u529B\uFF1A\u968F\u673A\u83B7\u5F97\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u7684\u4E00\u5F20\u724C", (card, source, target) => target !== source && target.countGainableCards(source, "hej") > 0);
      if (chosen.bool) {
        const target = chosen.targets[0], pool = target.getGainableCards(player, "hej");
        if (pool.length) await player.gain(pool.randomGet(), target, "giveAuto");
      }
    }
  },
  ac_swallowrecycle: {
    trigger: { player: "phaseDiscardEnd" },
    direct: true,
    filter: (event, player) => player.getHistory("lose", (evt) => evt.type === "discard" && evt.getParent("phaseDiscard") === event).flatMap((evt) => evt.cards2 || []).filter((card) => get.color(card, false) === "black").length >= 2,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u541E\u566C\u56DE\u6536\uFF1A\u9009\u62E9\u4E0B\u56DE\u5408\u51FA\u724C\u9636\u6BB5\u56DE\u6536\u7528\u724C\u7684\u89D2\u8272");
      if (result.bool) {
        player.logSkill("ac_swallowrecycle", result.targets);
        player.storage.ac_swallowrecycle_watch = { target: result.targets[0], turn: null, count: 0 };
        player.addSkill("ac_swallowrecycle_watch");
      }
    },
    subSkill: { watch: {
      charlotte: true,
      trigger: { global: ["phaseBegin", "phaseUseBegin", "cardsDiscardAfter", "phaseAfter"] },
      forced: true,
      popup: false,
      onremove: true,
      filter(event, player) {
        const state = player.storage.ac_swallowrecycle_watch;
        if (!state) return false;
        if (event.name === "phase") return event.player === state.target;
        if (event.name === "phaseUse") return event.player === state.target && event.getParent("phase") === state.turn;
        const use = discardedUse(event);
        return use?.player === state.target && state.turn && use.getParent("phase") === state.turn && use.getParent("phaseUse")?.name === "phaseUse" && state.count < 3 && inDiscard(event.cards).some((card) => use.cards.includes(card));
      },
      async content(event, trigger, player) {
        const state = player.storage.ac_swallowrecycle_watch;
        if (event.triggername === "phaseBegin") state.turn = trigger;
        else if (event.triggername === "phaseUseBegin") state.count = 0;
        else if (event.triggername === "phaseAfter") player.removeSkill("ac_swallowrecycle_watch");
        else {
          state.count++;
          const use = discardedUse(trigger);
          await player.gain(inDiscard(trigger.cards).filter((card) => use.cards.includes(card)), "gain2");
        }
      }
    } }
  },
  ac_whitepact: {
    trigger: { player: "phaseJieshuBegin" },
    direct: true,
    async content(event, trigger, player) {
      const result = await chooseTarget(player, "\u767D\u888D\u76DF\u7EA6\uFF1A\u9009\u62E9\u8C03\u6574\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272");
      if (result.bool) {
        player.logSkill("ac_whitepact", result.targets);
        player.storage.ac_whitepact_settle ||= [];
        player.storage.ac_whitepact_settle.push({ target: result.targets[0], own: false });
        player.addSkill("ac_whitepact_settle");
      }
    },
    subSkill: { settle: {
      charlotte: true,
      trigger: { global: "phaseAfter" },
      forced: true,
      popup: false,
      onremove: true,
      async content(event, trigger, player) {
        const pending = player.storage.ac_whitepact_settle || [];
        for (const state of [...pending]) {
          if (!state.target.isIn()) {
            pending.splice(pending.indexOf(state), 1);
            continue;
          }
          if (!state.own && trigger.player === player) {
            state.own = true;
            await adjustHand(player, state.target);
          } else if (state.own && trigger.player === state.target) {
            await adjustHand(player, state.target);
            pending.splice(pending.indexOf(state), 1);
          }
        }
        if (!pending.length) player.removeSkill("ac_whitepact_settle");
      }
    } }
  },
  ac_warstock: {
    trigger: { player: "damageEnd", source: "damageSource" },
    forced: true,
    mark: true,
    marktext: "\u7565",
    intro: { content: "\u519B\u7565\uFF1A#" },
    content(event, trigger, player) {
      player.addMark("ac_warstock", trigger.num);
    }
  },
  ac_alchemytactic: {
    trigger: { player: "phaseUseBegin" },
    direct: true,
    async content(event, trigger, player) {
      const n = player.countMark("ac_warstock");
      const result = await chooseTarget(player, n % 2 ? "\u70BC\u6210\u6218\u672F\uFF1A\u53EF\u4EE5\u5BF9\u4E00\u540D\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3" : "\u70BC\u6210\u6218\u672F\uFF1A\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u6A2A\u7F6E\u5E76\u5F03\u7F6E\u5176\u533A\u57DF\u91CC\u7684\u4E00\u5F20\u724C", () => true);
      if (result.bool) {
        player.logSkill("ac_alchemytactic", result.targets);
        const target = result.targets[0];
        if (n % 2) await target.damage(1, player);
        else {
          if (!target.isLinked()) await target.link(true);
          if (target.countDiscardableCards(player, "hej")) await player.discardPlayerCard(target, "hej", true);
        }
      }
      if (player.countMark("ac_warstock") > 7 && (await player.chooseBool("\u70BC\u6210\u6218\u672F\uFF1A\u79FB\u53BB\u5168\u90E8\u519B\u7565\uFF0C\u5BF9\u6240\u6709\u5176\u4ED6\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3\uFF1F").forResult()).bool) {
        player.removeMark("ac_warstock", player.countMark("ac_warstock"));
        for (const target of game.filterPlayer((target2) => target2 !== player)) if (target.isIn()) await target.damage(1, player);
      }
    }
  },
  ac_flamealchemy: {
    enable: "phaseUse",
    limited: true,
    skillAnimation: true,
    animationColor: "fire",
    filter: (event, player) => player.countMark("ac_warstock") > 0 && game.hasPlayer((target) => target.isLinked()),
    filterTarget: (card, player, target) => target.isLinked(),
    selectTarget: () => [1, _status.event.player.countMark("ac_warstock")],
    multitarget: true,
    async content(event, trigger, player) {
      player.awakenSkill("ac_flamealchemy");
      player.removeMark("ac_warstock", player.countMark("ac_warstock"));
      for (const target2 of event.targets) if (target2.isIn() && target2.countCards("e")) await target2.discard(target2.getCards("e"));
      const targets = event.targets.filter((target2) => target2.isIn());
      if (!player.isIn() || !targets.length) return;
      const result = await player.chooseTarget(
        true,
        "\u7130\u4E4B\u70BC\u91D1\u672F\uFF1A\u5BF9\u5176\u4E2D\u4E00\u540D\u89D2\u8272\u9020\u62101\u70B9\u706B\u7130\u4F24\u5BB3",
        remoteChoice("(card, source, target) => target.isIn() && _status.event.acFlameTargets.includes(target)")
      ).set("acFlameTargets", targets).forResult();
      const target = result.targets?.[0];
      if (result.bool && player.isIn() && targets.includes(target) && target.isIn()) await target.damage(1, "fire", player);
    },
    ai: { order: 7, result: { target: -1 } }
  },
  ac_forcebind: {
    trigger: { player: "useCardToPlayered" },
    direct: true,
    group: "ac_forcebind_damage",
    filter: (event) => event.card.name === "sha" && event.target.hp > 0 && event.target.countCards("he") > 0,
    async content(event, trigger, player) {
      const target = trigger.target;
      const result = await player.choosePlayerCard(target, "he", [1, Math.max(1, target.hp)], "\u539F\u529B\u675F\u7F1A\uFF1A\u6263\u7F6E\u81F3\u591A\u5176\u4F53\u529B\u503C\u5F20\u724C").forResult();
      if (!result.bool) return;
      player.logSkill("ac_forcebind", target);
      const move = target.addToExpansion(result.cards, "giveAuto");
      move.gaintag.add("ac_forcebind_return");
      await move;
      target.addSkill("ac_forcebind_return");
    },
    subSkill: {
      damage: { trigger: { source: "damageBegin1" }, forced: true, filter: (event, player) => event.card?.name === "sha" && event.player.countCards("h") <= player.countCards("h") && event.player.countCards("e") <= player.countCards("e"), content(event, trigger) {
        trigger.num++;
      } },
      return: {
        charlotte: true,
        mark: true,
        intro: { content: "expansion", markcount: "expansion" },
        trigger: { global: "phaseAfter" },
        forced: true,
        popup: false,
        async content(event, trigger, player) {
          const cards = player.getExpansions("ac_forcebind_return");
          if (cards.length) await player.gain(cards, "gain2");
          player.removeSkill("ac_forcebind_return");
        },
        onremove(player) {
          const cards = player.getExpansions("ac_forcebind_return");
          if (cards.length) player.loseToDiscardpile(cards);
        }
      }
    }
  }
};

// game/resources/app/src/character/mushoku/skill.js
var attack = (event) => event.card?.name === "sha";
var level = (player) => Math.min(4, player.countMark("mt_study"));
var remoteChoice2 = (source) => get2.infoFuncOL("_noname_func:" + source);
var skills = {
  mt_voiceless: {
    enable: "phaseUse",
    usable: 1,
    position: "h",
    filterCard: (card) => get2.type(card) === "basic" || get2.type2(card) === "trick",
    viewAs: { name: "sha", nature: "fire" },
    check: (card) => 6 - get2.value(card),
    ai: { order: 5 },
    group: "mt_voiceless_draw",
    subSkill: { draw: {
      trigger: { source: "damageSource" },
      direct: true,
      filter: (event) => event.num > 0 && event.getParent("useCard")?.skill === "mt_voiceless" && event.cards?.some((card) => get2.type2(card, false) === "trick"),
      async content(event, trigger, player) {
        const result = await player.chooseTarget("\u65E0\u548F\uFF1A\u53EF\u4EE5\u4EE4\u4E00\u540D\u89D2\u8272\u6478\u4E00\u5F20\u724C", (card, source, target) => target.isIn()).set("ai", remoteChoice2("target => get.attitude(_status.event.player, target)")).forResult();
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
    filter: (event, player) => event.player !== player && (attack(event) || player.hp <= 2 && get2.type2(event.card) === "trick" && get2.tag(event.card, "damage")),
    async cost(event, trigger, player) {
      event.result = await player.chooseToDiscard("he", "\u9884\u89C1\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u724C\u5BF9\u4F60\u65E0\u6548").set("ai", remoteChoice2("card => 7 - get.value(card)")).set("chooseonly", true).forResult();
    },
    async content(event, trigger, player) {
      await player.discard(event.cards);
      trigger.getParent().excluded.add(player);
    }
  },
  mt_study: {
    trigger: { player: "phaseJieshuBegin" },
    forced: true,
    filter: (event, player) => level(player) < 4 && player.getHistory("useCard", (evt) => get2.type2(evt.card) === "trick").length > 0,
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
    filterCard: (card) => get2.color(card) === "black",
    filterTarget: (card, player, target) => target !== player,
    check: (card) => 6 - get2.value(card),
    async content(event, trigger, player) {
      const target = event.target;
      const count = level(player) >= 2 ? 2 : 1;
      const result = await target.chooseToDiscard(count, "he", `\u6C34\u672F\uFF1A\u5F03\u7F6E${count}\u5F20\u724C\uFF0C\u5426\u5219\u53D7\u52301\u70B9${level(player) === 4 ? "\u96F7\u7535" : "\u666E\u901A"}\u4F24\u5BB3`).set("ai", remoteChoice2("card => 7 - get.value(card)")).forResult();
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
    filter: (event, player) => attack(event) && event.player !== player && event.player === _status2.currentPhase && event.player.isIn(),
    check: (event, player) => get2.attitude(player, event.player) > 0,
    async content(event, trigger, player) {
      const bonus = trigger.player.getHistory("useCard", (evt) => get2.type(evt.card) === "trick").length > 0;
      await trigger.player.draw();
      if (bonus && player.isIn()) await player.draw();
    }
  },
  mt_heal: {
    enable: "phaseUse",
    usable: 1,
    position: "he",
    selectCard: 1,
    filterCard: (card) => get2.color(card) === "red",
    filterTarget: (card, player, target) => target.isDamaged(),
    check: (card) => 7 - get2.value(card),
    async content(event, trigger, player) {
      await event.target.recover();
      if (get2.type2(event.cards[0]) === "trick" && player.isIn()) await player.draw();
    },
    ai: { order: 7, result: { target: 2 } }
  },
  mt_guard: {
    trigger: { global: "damageBegin4" },
    usable: 1,
    filter: (event, player) => event.player !== player && event.player.isIn() && player.countCards("he") > 0 && event.num > 0,
    async cost(event, trigger, player) {
      const good = get2.attitude(player, trigger.player) > 0;
      event.result = await player.chooseToDiscard("he", "\u5B88\u62A4\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u6B21\u4F24\u5BB3-1").set("chooseonly", true).set("mtGuardGood", good).set("ai", remoteChoice2("card => _status.event.mtGuardGood ? 6 - get.value(card) : 0")).forResult();
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
    check: (event, player) => player.hp > 1 && get2.attitude(player, event.target) < 0,
    async content(event, trigger, player) {
      await player.loseHp();
      trigger.getParent().directHit.add(trigger.target);
    }
  },
  mt_resolve: {
    trigger: { player: "phaseJieshuBegin" },
    filter: (event, player) => player.hp <= 2 || player.getHistory("sourceDamage").length > 0,
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
        check: (event, player) => get2.attitude(player, event.player) < 0,
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
      const result = await player.chooseTarget("\u9F99\u76DF\uFF1A\u53EF\u4EE4\u4E00\u540D\u5176\u4ED6\u5E7B\u52BF\u529B\u89D2\u8272\u6478\u4E00\u5F20\u724C\uFF0C\u7136\u540E\u4F60\u6478\u4E00\u5F20\u724C", (card, source, target) => target !== source && target.group === "huan").set("ai", remoteChoice2("target => get.attitude(_status.event.player, target)")).forResult();
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
      const good = get2.attitude(player, trigger.player) > 0;
      event.result = await player.chooseToDiscard("he", "\u62A4\u5E7C\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u53D7\u4F24\u89D2\u8272\u4F53\u529B\u5927\u4E8E1\u65F6\u6478\u4E24\u5F20\u724C\uFF0C\u5426\u5219\u56DE\u590D1\u70B9\u4F53\u529B\u5E76\u6478\u4E00\u5F20\u724C").set("chooseonly", true).set("mtProtectGood", good).set("ai", remoteChoice2("card => _status.event.mtProtectGood ? 7 - get.value(card) : 0")).forResult();
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
      return game2.hasPlayer((target) => target !== player && player.canUse({ name: "sha", isCard: true }, target, void 0, false));
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
    check: (card) => 5 - get2.value(card),
    async content(event, trigger, player) {
      const type = get2.type2(event.cards[0]);
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
    check: (event, player) => get2.attitude(player, event.player) > 0,
    async content(event, trigger, player) {
      await player.loseHp();
      const target = trigger.player;
      if (!target.isIn()) return;
      await target.recover();
      if (!player.isIn() || !target.isIn() || target.maxHp >= player.maxHp) return;
      const result = await player.chooseBool("\u6551\u63F4\uFF1A\u5C06\u4F60\u76841\u70B9\u4F53\u529B\u4E0A\u9650\u8F6C\u79FB\u7ED9\u8BE5\u89D2\u8272\uFF0C\u7136\u540E\u6478\u4E00\u5F20\u724C\uFF1F").set("mtRescueTarget", target).set("ai", remoteChoice2("() => _status.event.player.maxHp > 2 && get.attitude(_status.event.player, _status.event.mtRescueTarget) > 0")).forResult();
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
    filter: (event, player) => player.countCards("he") > 0 && game2.hasPlayer((target) => target !== player && !target.hasSkill("mt_training_intent")),
    async cost(event, trigger, player) {
      const discard = await player.chooseToDiscard("he", "\u6388\u5251\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u6388\u4E88\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u5251\u610F").set("chooseonly", true).forResult();
      if (!discard.bool) {
        event.result = { bool: false };
        return;
      }
      const target = await player.chooseTarget("\u6388\u5251\uFF1A\u9009\u62E9\u4E00\u540D\u6CA1\u6709\u5251\u610F\u7684\u5176\u4ED6\u89D2\u8272", (card, source, target2) => target2 !== source && !target2.hasSkill("mt_training_intent")).set("ai", remoteChoice2("target => get.attitude(_status.event.player, target)")).forResult();
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
  },
  ...sixteen_default
};
var skill_default = skills;

// game/resources/app/src/character/mushoku/translate.js
var translate_default = {
  ac_hulk: "\u7EFF\u5DE8\u4EBA\u6D69\u514B",
  ac_rageburst: "\u6012\u610F\u7206\u53D1",
  ac_rageburst_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u4F7F\u7528\u7684\u3010\u6740\u3011\u9700\u4E24\u5F20\u3010\u95EA\u3011\u624D\u80FD\u62B5\u6D88\uFF1B\u4E0E\u4F60\u8FDB\u884C\u3010\u51B3\u6597\u3011\u7684\u89D2\u8272\u6BCF\u6B21\u9700\u6253\u51FA\u4E24\u5F20\u3010\u6740\u3011\u3002",
  ac_rageburst_ab: "\u6012\u610F\u7206\u53D1",
  ac_gammasteal: "\u4F3D\u9A6C\u63A0\u593A",
  ac_gammasteal_info: "\u5F53\u4F60\u4F7F\u7528\u3010\u6740\u3011\u5BF9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u540E\uFF0C\u4F60\u53EF\u83B7\u5F97\u7684\u5176\u533A\u57DF\u91CC\u7684\u4E00\u5F20\u724C\u3002\u7136\u540E\u82E5\u83B7\u5F97\u7684\u724C\u4E0D\u662F\u88C5\u5907\u724C\uFF0C\u5176\u6478\u4E00\u5F20\u724C\uFF1B\u82E5\u83B7\u5F97\u7684\u724C\u662F\u88C5\u5907\u724C\uFF0C\u5219\u89C6\u4E3A\u4F60\u5BF9\u7531\u5176\u6307\u5B9A\u7684\u53E6\u4E00\u540D\u89D2\u8272\u4F7F\u7528\u4E00\u5F20\u3010\u51B3\u6597\u3011\u3002",
  ac_gammasteal_ab: "\u4F3D\u9A6C\u63A0\u593A",
  ac_gojo: "\u4E94\u6761\u609F",
  ac_fuki: "\u4F0F\u9A91",
  ac_fuki_info: "\u9501\u5B9A\u6280\uFF0C\u5728\u4F60\u4F7F\u7528\u724C\u65F6\uFF0C\u67D0\u5176\u4ED6\u89D2\u8272\u5230\u4F60\u7684\u8DDD\u79BB\u4E3A1\uFF0C\u5219\u4ED6\u4E0D\u80FD\u4F7F\u7528\u6216\u6253\u51FA\u724C\u54CD\u5E94\u4F60\u4F7F\u7528\u7684\u724C\u3002",
  ac_fuki_ab: "\u4F0F\u9A91",
  ac_jiaozi: "\u9A84\u6063",
  ac_jiaozi_info: "\u9501\u5B9A\u6280\uFF0C\u82E5\u4F60\u7684\u624B\u724C\u6570\u4E3A\u5168\u573A\u552F\u4E00\u6700\u591A\uFF0C\u4F60\u9020\u6210\u6216\u53D7\u5230\u7684\u4F24\u5BB3\u503C+1\u3002",
  ac_jiaozi_ab: "\u9A84\u6063",
  ac_doraemon: "\u54C6\u5566A\u68A6",
  ac_timestore: "\u65F6\u5149\u6574\u7406",
  ac_timestore_info: "\u51FA\u724C\u9636\u6BB5\u7ED3\u675F\u65F6\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u624B\u724C\u6570\u4E0D\u7B49\u4E8E\u4F53\u529B\u503C\u7684\u4E00\u540D\u89D2\u8272\u5F03\u7F6E\u4E00\u5F20\u624B\u724C\u6216\u6478\u4E00\u5F20\u724C\u3002\u7136\u540E\u82E5\u5176\u624B\u724C\u6570\u7B49\u4E8E\u4F53\u529B\u503C\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\uFF0C\u4E14\u53EF\u4EE5\u4EA4\u7ED9\u8BE5\u89D2\u8272\u4E00\u5F20\u724C\u3002",
  ac_timestore_ab: "\u65F6\u5149\u6574\u7406",
  ac_anydoor: "\u4EFB\u610F\u95E8",
  ac_anydoor_info: "\u5F53\u4F60\u6210\u4E3A\u4E00\u5F20\u666E\u901A\u9526\u56CA\u724C\u7684\u76EE\u6807\u65F6\uFF0C\u4F60\u53EF\u4EE5\u4E3A\u6B64\u724C\u589E\u52A0\u4E00\u4E2A\u76EE\u6807\u6216\u51CF\u5C11\u4E00\u4E2A\u76EE\u6807\uFF08\u76EE\u6807\u6570\u81F3\u5C11\u4E3A\u4E00\uFF09\u3002",
  ac_anydoor_ab: "\u4EFB\u610F\u95E8",
  ac_joker: "\u5C0F\u4E11",
  ac_chaoslaugh: "\u6DF7\u4E71\u72C2\u7B11",
  ac_chaoslaugh_info: "\u51C6\u5907\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u5BF9\u4E00\u540D\u4F53\u529B\u4E0D\u5927\u4E8E\u4F60\u7684\u5176\u4ED6\u89D2\u8272\u9020\u62100-2\u70B9\u968F\u673A\u4F24\u5BB3\u3002",
  ac_chaoslaugh_ab: "\u6DF7\u4E71\u72C2\u7B11",
  ac_crimecycle: "\u72AF\u7F6A\u5FAA\u73AF",
  ac_crimecycle_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u4F7F\u7528\u7684\u9526\u56CA\u724C\u8FDB\u5165\u5F03\u724C\u5806\u65F6\uFF0C\u4F60\u53EF\u4EE5\u51CF1\u70B9\u4F53\u529B\u4E0A\u9650\uFF0C\u4ECE\u5F03\u724C\u5806\u83B7\u5F97\u4E4B\u3002",
  ac_crimecycle_ab: "\u72AF\u7F6A\u5FAA\u73AF",
  ac_spiderman: "\u8718\u86DB\u4FA0",
  ac_spidersense: "\u8718\u86DB\u611F\u5E94",
  ac_spidersense_info: "\u6BCF\u540D\u89D2\u8272\u7684\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u6216\u4F60\u653B\u51FB\u8303\u56F4\u5185\u7684\u4E00\u540D\u89D2\u8272\u6210\u4E3A\u3010\u6740\u3011\u6216\u5EF6\u65F6\u9526\u56CA\u724C\u7684\u76EE\u6807\u65F6\uFF0C\u82E5\u4F60\u4E0D\u662F\u6B64\u724C\u7684\u4F7F\u7528\u8005\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u9879\uFF1A1. \u5F03\u7F6E\u6B64\u724C\u4F7F\u7528\u8005\u7684\u4E00\u5F20\u624B\u724C\uFF1B2. \u6478\u4E00\u5F20\u724C\u3002\u80CC\u6C34\uFF1A\u6267\u884C\u4E0A\u8FF0\u6240\u6709\u9009\u9879\uFF0C\u7136\u540E\u4F60\u4EE3\u66FF\u5176\u6210\u4E3A\u6B64\u724C\u7684\u76EE\u6807\u3002",
  ac_spidersense_ab: "\u8718\u86DB\u611F\u5E94",
  ac_wonderwoman: "\u795E\u5947\u5973\u4FA0",
  ac_lasso: "\u771F\u8A00\u5957\u7D22",
  ac_lasso_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u4EE4\u5176\u83B7\u5F97\u53E6\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u7684\u4E00\u5F20\u724C\u3002\u82E5\u5176\u83B7\u5F97\u7684\u724C\u4E0D\u662F\u6765\u81EA\u88C5\u5907\u533A\u7684\u724C\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002\u5176\u83B7\u5F97\u724C\u540E\u4F60\u53EF\u4EE5\u8BA9\u4E8C\u8005\u624B\u724C\u8F83\u5C11\u7684\u89D2\u8272\u6478\u4E00\u5F20\u724C\u3002",
  ac_lasso_ab: "\u771F\u8A00\u5957\u7D22",
  ac_amazonlegacy: "\u4E9A\u9A6C\u900A\u9057\u5FD7",
  ac_amazonlegacy_info: "\u5F53\u4F60\u6B7B\u4EA1\u65F6\uFF0C\u4F60\u53EF\u4EE5\u4EE4\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u6478\u4E09\u5F20\u724C\u3002\u82E5\u5982\u6B64\u505A\uFF0C\u8BE5\u89D2\u8272\u56DE\u590D1\u70B9\u4F53\u529B\u3002",
  ac_amazonlegacy_ab: "\u4E9A\u9A6C\u900A\u9057\u5FD7",
  ac_ken: "\u62F3\u56DB\u90CE",
  ac_hundredfists: "\u5317\u6597\u767E\u88C2\u62F3",
  ac_hundredfists_info: "\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u9879\uFF1A1. \u5F03\u7F6EX+1\u5F20\u724C\uFF1B2. \u6D41\u5931X+1\u70B9\u4F53\u529B\uFF08X\u4E3A\u4F60\u672C\u56DE\u5408\u5DF2\u53D1\u52A8\u201C\u5317\u6597\u767E\u88C2\u62F3\u201D\u7684\u6B21\u6570\uFF09\u3002\u82E5\u5982\u6B64\u505A\uFF0C\u4F60\u89C6\u4E3A\u5BF9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u4E00\u5F20\u4E0D\u53D7\u6B21\u6570\u548C\u8DDD\u79BB\u9650\u5236\u7684\u666E\u901A \u3010\u6740\u3011\u3002\u82E5\u6B64\u3010\u6740\u3011\u9020\u6210\u4F24\u5BB3\uFF0C\u5219\u6B64\u6280\u80FD\u5931\u6548\uFF0C\u76F4\u5230\u56DE\u5408\u7ED3\u675F\u3002",
  ac_hundredfists_ab: "\u5317\u6597\u767E\u88C2\u62F3",
  ac_fateduel: "\u5BBF\u547D\u5BF9\u51B3",
  ac_fateduel_info: "\u5F53\u4F60\u4F7F\u7528\u3010\u6740\u3011\u6307\u5B9A\u5176\u4ED6\u89D2\u8272\u4E3A\u76EE\u6807\u65F6\u6216\u5F53\u4F60\u6210\u4E3A\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u7684\u3010\u6740\u3011\u7684\u76EE\u6807\u65F6\uFF0C\u82E5\u4F60\u4E0E\u5176\u4F53\u529B\u503C\u76F8\u7B49\uFF0C\u5219\u4F60\u53EF\u4EE5\u6478\u4E00\u5F20\u724C\u3002",
  ac_fateduel_ab: "\u5BBF\u547D\u5BF9\u51B3",
  ac_batman: "\u8759\u8760\u4FA0",
  ac_nightstalk: "\u6697\u591C\u6F5C\u884C",
  ac_nightstalk_info: "\u82E5\u4F60\u7684\u624B\u724C\u6570\u4E3A\u5168\u573A\u6700\u591A\uFF0C\u4F60\u53EF\u4EE5\u8DF3\u8FC7\u6478\u724C\u9636\u6BB5\uFF1B\u82E5\u4F60\u7684\u4F53\u529B\u503C\u4E3A\u5168\u573A\u6700\u591A\uFF0C\u4F60\u53EF\u4EE5\u8DF3\u8FC7\u51FA\u724C\u9636\u6BB5\uFF1B\u82E5\u4F60\u7684\u88C5\u5907\u533A\u91CC\u6709\u724C\u4E14\u6570\u91CF\u4E3A\u5168\u573A\u6700\u591A\uFF0C\u4F60\u53EF\u4EE5\u8DF3\u8FC7\u5F03\u724C\u9636\u6BB5\u3002",
  ac_nightstalk_ab: "\u6697\u591C\u6F5C\u884C",
  ac_batprey: "\u8759\u8760\u8FFD\u730E",
  ac_batprey_info: "\u56DE\u5408\u7ED3\u675F\u540E\uFF0C\u4F60\u53EF\u4EE5\u5BF9\u81F3\u591AX\u540D\u5176\u4ED6\u89D2\u8272\u5404\u9020\u62101\u70B9\u4F24\u5BB3\uFF08X\u4E3A\u4F60\u672C\u56DE\u5408\u8DF3\u8FC7\u7684\u9636\u6BB5\u6570\uFF09\uFF0C\u82E5\u5982\u6B64\u505A\uFF0C\u4F60\u4ECE\u724C\u5806\u4E2D\u968F\u673A\u83B7\u5F97\u4E00\u5F20\u88C5\u5907\u724C\u3002",
  ac_batprey_ab: "\u8759\u8760\u8FFD\u730E",
  ac_santa: "\u5723\u8BDE\u8001\u4EBA",
  ac_giftdelivery: "\u793C\u7269\u6D3E\u9001",
  ac_giftdelivery_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5C06\u81F3\u5C11\u4E24\u5F20\u624B\u724C\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u3002\u56DE\u5408\u7ED3\u675F\u65F6\uFF0C\u82E5\u5176\u624B\u724C\u6570\uFF1A\u4E3A\u5168\u573A\u6700\u591A\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\uFF1B\u4E0D\u4E3A\u5168\u573A\u6700\u591A\uFF0C\u4F60\u5F03\u7F6E\u5176\u533A\u57DF\u91CC\u7684\u4E00\u5F20\u724C\u3002",
  ac_giftdelivery_ab: "\u793C\u7269\u6D3E\u9001",
  ac_sijian: "\u6B7B\u8C0F",
  ac_sijian_info: "\u6BCF\u56DE\u5408\u9650\u4E24\u6B21\uFF0C\u5F53\u4F60\u5931\u53BB\u6700\u540E\u4E00\u5F20\u624B\u724C\u540E\uFF0C\u6216\u8005\u5F53\u4F60\u8FDB\u5165\u6FD2\u6B7B\u72B6\u6001\u65F6\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u9879\uFF1A1.\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u5176\u4F7F\u7528\u4E0B\u4E00\u5F20\u724C\u540E\u9700\u5F03\u7F6E\u4E00\u5F20\u724C\u30022.\u4EE4\u5F53\u524D\u56DE\u5408\u89D2\u8272\u6478\u4E24\u5F20\u724C\u3002\u82E5\u6B64\u65F6\u6CA1\u6709\u89D2\u8272\u5904\u4E8E\u6FD2\u6B7B\u72B6\u6001\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u201C\u80CC\u6C34\u201D\uFF1A\u6267\u884C\u4E0A\u8FF0\u6240\u6709\u9009\u9879\uFF0C\u7136\u540E\u5931\u53BBX\u70B9\u4F53\u529B\uFF08X\u4E3A\u6B64\u524D\u6B64\u6280\u80FD\u53D1\u52A8\u8FC7\u80CC\u6C34\u7684\u6B21\u6570\uFF0C\u9996\u6B21\u4E3A0\uFF09\u3002",
  ac_sijian_ab: "\u6B7B\u8C0F",
  ac_captain: "\u7F8E\u56FD\u961F\u957F",
  ac_freedomcommand: "\u81EA\u7531\u53F7\u4EE4",
  ac_freedomcommand_info: "\u51FA\u724C\u9636\u6BB5\u5F00\u59CB\u65F6\uFF0C\u4F60\u53EF\u4EE5\u4EA4\u7ED9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u4E00\u5F20\u724C\uFF0C\u7136\u540E\u4EE4\u5176\u9009\u62E9\u662F\u5426\u4F7F\u7528\u4E00\u5F20\u975E\u9ED1\u8272\u7684\u3010\u6740\u3011\uFF0C\u4E14\u6B64\u3010\u6740\u3011\u7ED3\u7B97\u7ED3\u675F\u540E\u4F60\u6478X\u5F20\u724C\uFF08X\u4E3A\u6B64\u3010\u6740\u3011\u9020\u6210\u7684\u4F24\u5BB3\u503C+1\u4E14\u81F3\u591A\u4E3A5\uFF09\uFF1B\u82E5\u5176\u4E0D\u6267\u884C\uFF0C\u4F60\u53EF\u4EE5\u5BF9\u5176\u6216\u5176\u653B\u51FB\u8303\u56F4\u5185\u7684\u4E00\u540D\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3\u3002",
  ac_freedomcommand_ab: "\u81EA\u7531\u53F7\u4EE4",
  ac_totoro: "\u9F99\u732B",
  ac_forestwatch: "\u68EE\u6797\u5B88\u671B",
  ac_forestwatch_info: "\u56DE\u5408\u5F00\u59CB\u65F6,\u4F60\u53EF\u4EE5\u9009\u62E9\u81F3\u591A2\u540D\u89D2\u8272\u5404\u6478\u4E00\u5F20\u724C\u5E76\u589E\u52A0\u4E00\u70B9\u624B\u724C\u4E0A\u9650\u3002",
  ac_forestwatch_ab: "\u68EE\u6797\u5B88\u671B",
  ac_light: "\u591C\u795E\u6708",
  ac_kirajudgment: "\u57FA\u62C9\u5BA1\u5224",
  ac_kirajudgment_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4EFB\u610F\u5F20\u624B\u724C\u5E76\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u7136\u540E\u4EE4\u5176\u9009\u62E9\u4E00\u9879\uFF1A1.\u5F03\u7F6E\u7B49\u91CF\u724C\u5E76\u5931\u53BB1\u70B9\u4F53\u529B\uFF1B2.\u7FFB\u9762\uFF0C\u7136\u540E\u6478\u7B49\u91CF\u7684\u724C\u3002",
  ac_kirajudgment_ab: "\u57FA\u62C9\u5BA1\u5224",
  ac_deathnote: "\u6B7B\u4EA1\u7B14\u8BB0",
  ac_deathnote_info: "\u5F53\u4F60\u53D7\u5230\u4F24\u5BB3\u540E\uFF0C\u4F60\u53EF\u4EE5\u5C55\u793A\u4E00\u5F20\u624B\u724C\u3002\u82E5\u5982\u6B64\u505A\uFF0C\u9664\u975E\u4F24\u5BB3\u6765\u6E90\u5F03\u7F6E\u4E0E\u4F60\u5C55\u793A\u7684\u724C\u7C7B\u522B\u4E0D\u540C\u7684\u4E00\u5F20\u624B\u724C\uFF0C\u5426\u5219\u4F60\u56DE\u590D1\u70B9\u4F53\u529B\u3002",
  ac_deathnote_ab: "\u6B7B\u4EA1\u7B14\u8BB0",
  ac_kirby: "\u5361\u6BD4",
  ac_copyability: "\u590D\u5236\u80FD\u529B",
  ac_copyability_info: "\u6478\u724C\u9636\u6BB5\u5F00\u59CB\u65F6\uFF0C\u4F60\u4EAE\u51FA\u724C\u5806\u9876\u4E09\u5F20\u724C\uFF0C\u7136\u540E\u4F60\u53EF\u83B7\u5F97\u5176\u4E2D\u70B9\u6570\u4E0D\u5927\u4E8E8\u7684\u724C\uFF0C\u82E5\u5982\u6B64\u505A\uFF0C\u4F60\u653E\u5F03\u6478\u724C\u3002\u82E5\u4F60\u4EE5\u6B64\u6CD5\u83B7\u5F97\u4E86\u724C\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u968F\u673A\u83B7\u5F97\u5176\u4E00\u5F20\u724C\u3002",
  ac_copyability_ab: "\u590D\u5236\u80FD\u529B",
  ac_swallowrecycle: "\u541E\u566C\u56DE\u6536",
  ac_swallowrecycle_info: "\u5F03\u724C\u9636\u6BB5\u7ED3\u675F\u65F6\uFF0C\u82E5\u4F60\u4E8E\u6B64\u9636\u6BB5\u5185\u5F03\u7F6E\u8FC7\u81F3\u5C11\u4E24\u5F20\u9ED1\u8272\u724C\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u5176\u4E0B\u4E2A\u56DE\u5408\u51FA\u724C\u9636\u6BB5\u5185\u4F7F\u7528\u7684\u724C\u7ED3\u7B97\u7ED3\u675F\u540E\uFF0C\u82E5\u6B64\u724C\u4ECD\u5728\u5F03\u724C\u5806\u4E2D\uFF0C\u4F60\u83B7\u5F97\u4E4B\uFF08\u672C\u9636\u6BB5\u4F60\u81F3\u591A\u4EE5\u6B64\u6CD5\u83B7\u5F97\u4E09\u6B21\u724C\uFF09\u3002",
  ac_swallowrecycle_ab: "\u541E\u566C\u56DE\u6536",
  ac_gandalf: "\u7518\u9053\u592B",
  ac_whitepact: "\u767D\u888D\u76DF\u7EA6",
  ac_whitepact_info: "\u7ED3\u675F\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u4F60\u7684\u56DE\u5408\u7ED3\u675F\u540E\u548C\u8BE5\u89D2\u8272\u7684\u4E0B\u4E2A\u56DE\u5408\u7ED3\u675F\u540E\uFF0C\u5176\u5C06\u624B\u724C\u6478\u81F3\u6216\u5F03\u81F3\u4E0E\u4F60\u624B\u724C\u6570\u76F8\u540C\uFF08\u6700\u591A\u6478\u81F3\u4E94\u5F20\uFF09\u3002",
  ac_whitepact_ab: "\u767D\u888D\u76DF\u7EA6",
  ac_mustang: "\u7F57\u4F0A\xB7\u9A6C\u65AF\u5766",
  ac_warstock: "\u6218\u706B\u79EF\u84C4",
  ac_warstock_info: "\u9501\u5B9A\u6280\uFF0C\u6BCF\u5F53\u4F60\u53D7\u5230\u6216\u9020\u62101\u70B9\u4F24\u5BB3\u540E\uFF0C\u4F60\u83B7\u5F97\u4E00\u4E2A\u201C\u519B\u7565\u201D\u6807\u8BB0\u3002",
  ac_warstock_ab: "\u6218\u706B\u79EF\u84C4",
  ac_alchemytactic: "\u70BC\u6210\u6218\u672F",
  ac_alchemytactic_info: "\u51FA\u724C\u9636\u6BB5\u5F00\u59CB\u65F6\uFF0C\u82E5\u201C\u519B\u7565\u201D\u6570\u91CF\u4E3A\u5947\u6570\uFF0C\u4F60\u53EF\u4EE5\u5BF9\u4E00\u540D\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3\uFF1B\u82E5\u201C\u519B\u7565\u201D\u6570\u91CF\u4E3A\u5076\u6570\uFF0C\u4F60\u53EF\u4EE5\u8BA9\u4E00\u540D\u89D2\u8272\u8FDB\u5165\u8FDE\u73AF\u72B6\u6001\u5E76\u5F03\u7F6E\u5176\u533A\u57DF\u91CC\u7684\u4E00\u5F20\u724C\u3002\u82E5\u201C\u519B\u7565\u201D\u6570\u91CF\u8D85\u8FC77\u4E2A\uFF0C\u4F60\u53EF\u4EE5\u79FB\u53BB\u5168\u90E8\u201C\u519B\u7565\u201D\u6807\u8BB0\u5E76\u5BF9\u6240\u6709\u5176\u4ED6\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3\u3002",
  ac_alchemytactic_ab: "\u70BC\u6210\u6218\u672F",
  ac_flamealchemy: "\u7130\u4E4B\u70BC\u91D1\u672F",
  ac_flamealchemy_info: "\u9650\u5B9A\u6280\uFF0C\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u79FB\u53BB\u5168\u90E8\u201C\u519B\u7565\u201D\u6807\u8BB0\uFF0C\u4EE4\u81F3\u591A\u7B49\u91CF\u7684\u5904\u4E8E\u8FDE\u73AF\u72B6\u6001\u7684\u89D2\u8272\u5F03\u7F6E\u6240\u6709\u88C5\u5907\u533A\u91CC\u7684\u724C\uFF0C\u7136\u540E\u5BF9\u5176\u4E2D1\u540D\u89D2\u8272\u9020\u62101\u70B9\u706B\u7130\u4F24\u5BB3\u3002",
  ac_flamealchemy_ab: "\u7130\u4E4B\u70BC\u91D1\u672F",
  ac_vader: "\u8FBE\u65AF\xB7\u7EF4\u8FBE",
  ac_forcebind: "\u539F\u529B\u675F\u7F1A",
  ac_forcebind_info: "\u5F53\u4F60\u4F7F\u7528\u3010\u6740\u3011\u6307\u5B9A\u4E00\u4E2A\u76EE\u6807\u540E\uFF0C\u4F60\u53EF\u4EE5\u53D1\u52A8\u6B64\u6280\u80FD\uFF0C\u5C06\u5176\u81F3\u591AX\u5F20\u724C\u6263\u7F6E\u4E8E\u8BE5\u89D2\u8272\u7684\u6B66\u5C06\u724C\u65C1\uFF08X\u4E3A\u5176\u4F53\u529B\u503C\uFF09\uFF1B\u82E5\u5982\u6B64\u505A\uFF0C\u5F53\u524D\u56DE\u5408\u7ED3\u675F\u540E\uFF0C\u8BE5\u89D2\u8272\u83B7\u5F97\u8FD9\u4E9B\u724C\u3002\u4F60\u4F7F\u7528\u3010\u6740\u3011\u5BF9\u624B\u724C\u6570\u4E0E\u88C5\u5907\u6570\u5747\u4E0D\u5927\u4E8E\u4F60\u7684\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u65F6\uFF0C\u6B64\u4F24\u5BB3+1\u3002",
  ac_forcebind_ab: "\u539F\u529B\u675F\u7F1A",
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
  mt_resolve_info: "\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u7684\u4F53\u529B\u4E0D\u5927\u4E8E2\uFF0C\u4F60\u53EF\u4EE5\u6478\u4E24\u5F20\u724C\uFF1B\u5426\u5219\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u9020\u6210\u8FC7\u4F24\u5BB3\uFF0C\u4F60\u53EF\u4EE5\u6478X\u5F20\u724C\uFF08X\u4E3A\u4F60\u672C\u56DE\u5408\u9020\u6210\u7684\u4F24\u5BB3\u603B\u70B9\u6570\uFF09\u3002",
  mt_dragon: "\u9F99\u529B",
  mt_dragon_info: "\u9996\u6B21\u83B7\u5F97\u6B64\u6280\u80FD\u65F6\uFF0C\u4F60\u83B7\u5F973\u70B9\u9F99\u529B\uFF08\u4E0A\u96503\uFF09\u3002\u4F60\u4F7F\u7528\u3010\u6740\u3011\u65E0\u8DDD\u79BB\u9650\u5236\u3002\u6BCF\u56DE\u5408\u5404\u9650\u4E00\u6B21\uFF1A\u2460\u4F60\u4E8E\u51FA\u724C\u9636\u6BB5\u4EE5\u3010\u6740\u3011\u5BF9\u5176\u4ED6\u89D2\u8272\u9020\u6210\u4F24\u5BB3\u65F6\uFF0C\u53EF\u4EE5\u6D88\u80171\u70B9\u9F99\u529B\u4EE4\u4F24\u5BB3+1\uFF1B\u2461\u4F60\u53D7\u5230\u4F24\u5BB3\u65F6\uFF0C\u53EF\u4EE5\u6D88\u80171\u70B9\u9F99\u529B\u4EE4\u4F24\u5BB3-1\u3002\u9501\u5B9A\u6280\uFF0C\u7ED3\u675F\u9636\u6BB5\uFF0C\u82E5\u4F60\u672C\u56DE\u5408\u672A\u9020\u6210\u8FC7\u4F24\u5BB3\uFF0C\u4F60\u56DE\u590D1\u70B9\u9F99\u529B\uFF08\u81F3\u591A3\uFF09\u3002",
  mt_dragon_strike: "\u9F99\u529B\xB7\u653B",
  mt_dragon_defend: "\u9F99\u529B\xB7\u5B88",
  mt_dragon_rest: "\u9F99\u529B\xB7\u606F",
  mt_dragonlord: "\u9F99\u76DF",
  mt_dragonlord_info: "\u4E3B\u516C\u6280\uFF0C\u51C6\u5907\u9636\u6BB5\uFF0C\u82E5\u4F60\u662F\u4E3B\u516C\u4E14\u6B64\u6280\u80FD\u6709\u6548\uFF0C\u4F60\u56DE\u590D1\u70B9\u9F99\u529B\uFF08\u81F3\u591A3\uFF09\uFF1B\u7136\u540E\u4F60\u53EF\u4EE5\u4EE4\u4E00\u540D\u5176\u4ED6\u5E7B\u52BF\u529B\u89D2\u8272\u6478\u4E00\u5F20\u724C\uFF0C\u82E5\u5982\u6B64\u505A\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002\u8BE5\u9009\u62E9\u4E0D\u5224\u5B9A\u6216\u516C\u5F00\u5BF9\u65B9\u8EAB\u4EFD\u3002",
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

// game/resources/app/src/character/mushoku/expansion.js
import { lib as lib3, game as game3, get as get3, ui as ui2, _status as _status3 } from "noname";
var foreignSkillEffect = (event, player) => {
  let parent = event;
  for (let depth = 0; parent && depth < 40; depth++, parent = parent.getParent?.()) {
    if (parent.name === "useCard") return false;
    if ((parent.skill || lib3.skill[parent.name]) && parent.player) return parent.player !== player;
  }
  return false;
};
var discardable = (card, player) => lib3.filter.cardDiscardable(card, player, "ac_haodu");
var suits = (cards) => new Set(cards.map((card) => get3.suit(card, false)).filter((suit) => ["heart", "diamond", "club", "spade"].includes(suit))).size;
var replayTargets = (player) => player.getStorage("ac_xuju");
var remoteChoice3 = (source) => get3.infoFuncOL("_noname_func:" + source);
var expansion_default = {
  ac_haodu: {
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player, target) {
      return target !== player;
    },
    async content(event, trigger, player) {
      const target = event.target;
      const results = await player.chooseCardOL([player, target], "he", [0, Infinity], true, "\u8C6A\u8D4C\uFF1A\u79D8\u5BC6\u9009\u62E9\u8981\u5F03\u7F6E\u7684\u724C\uFF0C\u53EF\u9009\u62E9\u96F6\u5F20", remoteChoice3('(card, owner) => lib.filter.cardDiscardable(card, owner, "ac_haodu")')).set("ai", remoteChoice3("card => 4 - get.value(card)")).forResult();
      const chosen = [player, target].map((who, i) => [who, (results[i]?.cards || []).filter((card) => who.getCards("he").includes(card) && discardable(card, who))]);
      const counts = chosen.map(([, cards]) => ({ count: cards.length, suits: suits(cards) }));
      if (chosen.some(([, cards]) => cards.length)) await game3.loseAsync({ lose_list: chosen.filter(([, cards]) => cards.length) }).setContent("discardMultiple");
      const limit = Number(counts[0].count >= counts[1].count) + Number(counts[0].suits >= counts[1].suits);
      player.storage.ac_haodu_last = { count: counts[0].count, last: null };
      player.syncStorage("ac_haodu_last");
      const remaining = ["\u4F24\u5BB3", "\u6478\u724C"];
      for (let i = 0; i < limit && player.isIn(); i++) {
        const options = remaining.filter((option) => option !== "\u4F24\u5BB3" || target.isIn());
        if (!options.length) break;
        const result = await player.chooseControl([...options, "cancel2"]).set("prompt", `\u8C6A\u8D4C\uFF1A\u8FD8\u53EF\u4F9D\u6B21\u6267\u884C${limit - i}\u9879\uFF08\u4F24\u5BB3\uFF1A\u5BF9\u76EE\u6807\u9020\u62101\u70B9\u4F24\u5BB3\uFF1B\u6478\u724C\uFF1A\u81EA\u5DF1\u6478\u4E09\u5F20\u724C\uFF09`).set("acHaoduPreferred", options.includes("\u4F24\u5BB3") && get3.attitude(player, target) < 0 ? "\u4F24\u5BB3" : "\u6478\u724C").set("ai", remoteChoice3("() => _status.event.acHaoduPreferred")).forResult();
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
      return !!last?.last && player.countCards("he", (card) => lib3.filter.cardDiscardable(card, player, "ac_xuju")) >= last.count && game3.hasPlayer((target) => target.isDamaged() && !replayTargets(player).includes(target));
    },
    async content(event, trigger, player) {
      const last = { ...player.storage.ac_haodu_last };
      const result = await player.chooseTarget(`\u7EED\u5C40\uFF1A\u5F03\u7F6E${last.count}\u5F20\u724C\uFF0C\u4EE4\u4E00\u540D\u5DF2\u53D7\u4F24\u4E14\u672A\u7EED\u5C40\u7684\u89D2\u8272${last.last === "draw" ? "\u6478\u4E09\u5F20\u724C" : "\u53D7\u5230\u4F60\u9020\u6210\u76841\u70B9\u4F24\u5BB3"}`, (card, source, target2) => target2.isDamaged() && !source.getStorage("ac_xuju").includes(target2)).set("acXujuDraw", last.last === "draw").set("ai", remoteChoice3("target => get.attitude(_status.event.player, target) * (_status.event.acXujuDraw ? 1 : -1)")).forResult();
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
      return player.countCards("he") > 0 && game3.hasPlayer((target) => target !== player && target.countCards("h") > 0);
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
      return !player.hasSkill("ac_tuiyan_draw") || !player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game3.hasPlayer((target) => target !== player);
    },
    async content(event, trigger, player) {
      const choices = [];
      if (!player.hasSkill("ac_tuiyan_draw")) choices.push("\u8865\u5145\u624B\u724C");
      if (!player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game3.hasPlayer((target) => target !== player)) choices.push("\u4EA4\u4ED8\u624B\u724C");
      if (!choices.length) return;
      const result = await player.chooseControl(choices).set("prompt", "\u63A8\u6F14\uFF1A\u6BCF\u9879\u6BCF\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21").set("ai", remoteChoice3("() => _status.event.controls[0]")).forResult();
      if (result.control === "\u8865\u5145\u624B\u724C") {
        player.addTempSkill("ac_tuiyan_draw", { player: "phaseUseAfter" });
        await player.drawTo(player.maxHp);
      } else if (result.control === "\u4EA4\u4ED8\u624B\u724C") {
        const num = player.countCards("h") - player.hp;
        if (num <= 0) return;
        const selected = await player.chooseTarget("\u63A8\u6F14\uFF1A\u9009\u62E9\u63A5\u6536\u624B\u724C\u7684\u5176\u4ED6\u89D2\u8272", true, (card, source, target) => target !== source).set("ai", remoteChoice3("target => get.attitude(_status.event.player, target)")).forResult();
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
        return !player.storage.mc_fengcang && event.card.name === "sha" && get3.color(event.card) === "black";
      }, async content(event, trigger) {
        trigger.directHit.addArray(game3.players);
      } },
      red: { charlotte: true, forced: true, trigger: { target: "useCardToTargeted" }, filter(event, player) {
        return !!player.storage.mc_fengcang && event.player !== player && event.card.name === "sha" && get3.color(event.card) === "red";
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
      return event.num > 1 || get3.attitude(player, event.player) > 0 || event.player.countCards("e") > 0;
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
      return get3.type(card) === "equip";
    },
    viewAs: { name: "jiu" },
    viewAsFilter(player) {
      return player.countCards("hes", (card) => get3.type(card) === "equip") > 0;
    },
    check(card) {
      return 6 - get3.value(card);
    },
    mod: { maxHandcard(player, num) {
      return num + player.countCards("e");
    } },
    ai: { order: 5 }
  },
  ac_life: {
    mark: true,
    marktext: "\u547D",
    intro: { content: "\u547D\uFF1A#/\u221E\u3002\u6BCF\u56DE\u5408\u9996\u6B21\u4F7F\u7528\u3010\u6740\u3011\u9020\u6210\u4F24\u5BB3\u540E\u6478\u4E00\u5F20\u724C\uFF1B\u53EF\u62B5\u6D88\u4E00\u6B21\u81F4\u547D\u4F24\u5BB3\u3002" },
    init(player) {
      if (!player.storage.ac_life_init) {
        player.storage.ac_life_init = true;
        player.addMark("ac_life", 2);
      }
    },
    trigger: { player: "damageBegin4", global: "dieAfter" },
    forced: true,
    filter(event, player) {
      if (event.name === "die") return event.source === player && event.player !== player;
      const armor = event.nohujia || player.hasSkillTag?.("nohujia") ? 0 : player.hujia || 0;
      return event.num > 0 && event.num >= player.hp + armor && player.countMark("ac_life") > 0;
    },
    async content(event, trigger, player) {
      if (trigger.name === "die") player.addMark("ac_life", 1);
      else if ((await player.chooseBool("\u547D\u6570\uFF1A\u79FB\u53BB1\u679A\u547D\uFF0C\u9632\u6B62\u6B64\u6B21\u4F24\u5BB3\uFF1F").set("ai", () => true).forResult()).bool) {
        player.removeMark("ac_life", 1);
        trigger.cancel();
      }
    },
    group: "ac_life_draw",
    subSkill: { draw: { charlotte: true, trigger: { source: "damageSource" }, usable: 1, forced: true, filter(event, player) {
      return event.card?.name === "sha" && event.getParent("useCard")?.player === player;
    }, async content(event, trigger, player) {
      await player.draw();
    } } }
  },
  ac_river: {
    enable: "phaseUse",
    limited: true,
    skillAnimation: true,
    animationColor: "purple",
    filter(event, player) {
      return player.countMark("ac_life") > 0;
    },
    async content(event, trigger, player) {
      const x = player.countMark("ac_life");
      player.awakenSkill("ac_river");
      player.removeMark("ac_life", x);
      player.storage.ac_river_bonus = x;
      await player.draw(x);
      player.addTempSkill("ac_river_effect", { player: "phaseBegin" });
      player.addTempSkill("ac_river_guard", { player: "phaseBegin" });
      player.addSkill("ac_river_permanent");
    },
    subSkill: {
      effect: { charlotte: true, onremove(player) {
        delete player.storage.ac_river_bonus;
      }, mod: { targetEnabled(card, source, target) {
        if (source !== target) return false;
      } }, trigger: { source: "damageBegin1" }, forced: true, filter(event) {
        return event.num > 0;
      }, content(event, trigger, player) {
        trigger.num += player.storage.ac_river_bonus || 0;
      } },
      guard: { charlotte: true, trigger: { player: ["damageBefore", "loseHpBefore", "loseMaxHpBefore"] }, forced: true, priority: 100, filter: foreignSkillEffect, content(event, trigger) {
        trigger.cancel();
      } },
      permanent: { charlotte: true, trigger: { source: "damageSource" }, direct: true, filter(event, player) {
        return !player.hasSkill("ac_river_used") && event.num > 0 && event.card?.name === "sha" && event.getParent("useCard")?.player === player && _status3.currentPhase === player && event.player?.isIn() && event.player.maxHp > 2;
      }, async content(event, trigger, player) {
        const target = trigger.player;
        if (!(await player.chooseBool("\u6B7B\u6CB3\uFF1A\u662F\u5426\u4EE4\u53D7\u4F24\u89D2\u8272\u51CF\u5C111\u70B9\u4F53\u529B\u4E0A\u9650\uFF1F").set("ai", remoteChoice3("() => get.attitude(_status.event.player, _status.event.getTrigger().player) < 0")).forResult()).bool) return;
        if (target.isIn() && target.maxHp > 2) {
          player.addTempSkill("ac_river_used", { global: "phaseAfter" });
          player.logSkill("ac_river", target);
          await target.loseMaxHp(1);
        }
      } },
      used: { charlotte: true }
    }
  },
  ac_jackal: {
    mod: { cardUsable(card, player, num) {
      if (card.name === "sha") return num + 1;
    }, targetInRange(card) {
      if (card.name === "sha") return true;
    } },
    trigger: { player: "useCard2" },
    direct: true,
    filter(event, player) {
      return !player.hasSkill("ac_jackal_used") && _status3.currentPhase === player && event.card?.name === "sha" && event.targets?.some((target) => target.isIn());
    },
    async content(event, trigger, player) {
      const use = trigger;
      const targets = (use.targets || []).filter((target2) => target2.isIn());
      if (!targets.length) return;
      const result = await player.chooseTarget("\u8C7A\u72FC\uFF1A\u9009\u62E9\u6B64\u6740\u7684\u4E00\u540D\u76EE\u6807\uFF0C\u5176\u987B\u4F7F\u7528\u4E24\u5F20\u3010\u95EA\u3011\u62B5\u6D88", remoteChoice3("(card, source, target) => target.isIn() && _status.event.acJackalTargets.includes(target)")).set("acJackalTargets", targets).set("ai", remoteChoice3("target => get.attitude(_status.event.player, target) < 0 ? 1 : 0")).forResult();
      const target = result.targets?.[0];
      if (!result.bool || !targets.includes(target) || !target.isIn()) return;
      player.addTempSkill("ac_jackal_used", { global: "phaseAfter" });
      player.logSkill("ac_jackal", target);
      const args = use.customArgs ??= {}, targetArgs = args[target.playerid] ??= {};
      targetArgs.shanRequired = Math.max(2, targetArgs.shanRequired ?? 1);
    },
    subSkill: { used: { charlotte: true } }
  },
  ac_observe: {
    locked: true,
    forced: true,
    trigger: { target: "useCardToTargeted" },
    filter(event, player) {
      return !player.hasSkill("ac_observe_draw") && (event.card?.name === "sha" || get3.type(event.card) === "trick");
    },
    async content(event, trigger, player) {
      if ((await player.chooseBool("\u547D\u8FD0\u63A2\u77E5\uFF1A\u6478\u4E00\u5F20\u724C\uFF1F").set("ai", () => true).forResult()).bool) {
        player.addTempSkill("ac_observe_draw", { global: "phaseAfter" });
        await player.draw();
      }
    },
    subSkill: { draw: { charlotte: true } }
  },
  ac_mail: {
    locked: true,
    mod: { targetEnabled(card) {
      if (get3.type(card) === "delay") return false;
    } },
    group: ["ac_mail_gain", "ac_mail_replace", "ac_mail_guard"],
    subSkill: {
      guard: { charlotte: true, forced: true, trigger: { global: "executeDelayCardEffect" }, filter(event, player) {
        return event.target === player && get3.type(event.card) === "delay";
      }, content(event, trigger) {
        trigger.cancel();
      } },
      gain: {
        charlotte: true,
        trigger: { global: "judgeEnd" },
        forced: true,
        filter(event) {
          return !!event.result?.card && get3.position(event.result.card, true) === "o";
        },
        async content(event, trigger, player) {
          await player.gain(trigger.result.card, "gain2");
        }
      },
      replace: { charlotte: true, trigger: { global: "judge" }, direct: true, filter(event, player) {
        return event.player !== player && player.countCards("h") > 0;
      }, async content(event, trigger, player) {
        const result = await player.chooseCard("Dmail\uFF1A\u53EF\u6253\u51FA\u4E00\u5F20\u624B\u724C\u66FF\u4EE3\u5176\u4ED6\u89D2\u8272\u7684\u5224\u5B9A\u724C", "h").forResult();
        if (!result.bool) return;
        player.logSkill("ac_mail", trigger.player);
        const response = player.respond({ cards: result.cards, skill: "ac_mail", highlight: true, noOrdering: true });
        await response;
        if (!response.cards?.length) return;
        const old = trigger.player.judging[0];
        game3.broadcastAll((card) => {
          card.clone?.classList.remove("thrownhighlight");
        }, old);
        await game3.cardsDiscard(old);
        trigger.player.judging[0] = response.cards[0];
        trigger.orderingCards.addArray(response.cards);
      }, ai: { rejudge: true, tag: { rejudge: 1 } } }
    }
  },
  ac_worldline: {
    trigger: { player: "dying" },
    limited: true,
    skillAnimation: true,
    animationColor: "blue",
    async content(event, trigger, player) {
      player.awakenSkill("ac_worldline");
      await player.recoverTo(2);
      for (const target of game3.filterPlayer()) {
        const cards2 = target.getCards("ej");
        if (cards2.length) await target.discard(cards2);
      }
      const living = game3.filterPlayer((target) => target.isIn()).sortBySeat(player);
      const drawn = await player.draw(living.length + 2).forResult();
      const cards = (drawn?.cards || []).filter((card) => player.getCards("h").includes(card));
      for (let i = 1; i < living.length && cards.length > 1; i++) if (living[i].isIn()) await player.give(cards.splice(1, 1), living[i]);
      player.storage.ac_worldline_turns = 2;
      player.storage.ac_worldline_counting = false;
      player.disableSkill("ac_worldline", "ac_mail");
      player.addSkill("ac_worldline_restore");
    },
    subSkill: { restore: { charlotte: true, group: "ac_worldline_start", trigger: { player: "phaseAfter" }, forced: true, popup: false, async content(event, trigger, player) {
      if (!player.storage.ac_worldline_counting) {
        player.storage.ac_worldline_counting = true;
        return;
      }
      if (--player.storage.ac_worldline_turns <= 0) {
        player.enableSkill("ac_worldline");
        player.removeSkill("ac_worldline_restore");
      }
    } }, start: { charlotte: true, trigger: { player: "phaseBegin" }, forced: true, popup: false, content(event, trigger, player) {
      player.storage.ac_worldline_counting = true;
    } } }
  },
  ac_zhikong: { locked: true, mod: { targetInRange(card) {
    if (card.name === "sha") return true;
  }, globalTo(from, to, distance) {
    return distance + 1;
  } } },
  ac_youji: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: true, filter(event, player) {
    return player.countCards("he") > 0 && game3.hasPlayer((target) => target !== player && target.countCards("h") > 0);
  }, filterTarget(card, player, target) {
    return target !== player && target.countCards("h") > 0;
  }, async content(event, trigger, player) {
    const target = event.target;
    if (!target.isIn() || !target.countCards("h")) return;
    await player.viewHandcards(target);
    if (!target.isIn() || !target.countCards("h")) return;
    await player.gainPlayerCard(target, "h", true, "visible");
  }, ai: { order: 5, result: { target: -1 } } },
  ac_guibi: { trigger: { target: "useCardToTargeted" }, usable: 1, filter(event, player) {
    return event.card?.name === "sha" && player.countCards("he") > 0;
  }, async cost(event, trigger, player) {
    event.result = await player.chooseToDiscard("he", "\u89C4\u907F\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u6740\u5BF9\u4F60\u65E0\u6548").set("chooseonly", true).set("ai", remoteChoice3("card => 6 - get.value(card)")).forResult();
  }, async content(event, trigger, player) {
    await player.discard(event.cards);
    trigger.getParent().excluded.add(player);
  } },
  ac_sijian: {
    trigger: { player: ["loseAfter", "dying"], global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"] },
    usable: 2,
    filter(event, player) {
      if (event.name === "dying") return true;
      const lost = event.getl?.(player);
      return player.countCards("h") === 0 && !!lost?.hs?.length;
    },
    async cost(event, trigger, player) {
      event.result = { bool: false };
      const canDiscard = game3.hasPlayer((target) => target !== player && target.isIn());
      const canDraw = !!_status3.currentPhase?.isIn();
      if (!canDiscard && !canDraw) return;
      const count = player.storage.ac_sijian_backwater || 0;
      const controls = [];
      if (canDiscard) controls.push("\u9009\u9879\u4E00");
      if (canDraw) controls.push("\u9009\u9879\u4E8C");
      if (controls.length && !game3.hasPlayer((target) => target.isDying?.())) controls.push("\u80CC\u6C34\uFF01");
      controls.push("cancel2");
      const result = await player.chooseControl({
        controls,
        choiceList: [
          "\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u5176\u4F7F\u7528\u4E0B\u4E00\u5F20\u724C\u540E\u9700\u5F03\u7F6E\u4E00\u5F20\u724C",
          "\u4EE4\u5F53\u524D\u56DE\u5408\u89D2\u8272\u6478\u4E24\u5F20\u724C",
          `\u80CC\u6C34\uFF01\u6267\u884C\u4E0A\u8FF0\u6240\u6709\u9009\u9879\uFF0C\u7136\u540E\u5931\u53BB${count}\u70B9\u4F53\u529B`
        ],
        prompt: `\u6B7B\u8C0F\uFF1A\u9009\u62E9\u4E00\u9879\uFF1B\u80CC\u6C34\u6267\u884C\u5168\u90E8\u9009\u9879\uFF0C\u7136\u540E\u5931\u53BB${count}\u70B9\u4F53\u529B`
      }).forResult();
      if (typeof result?.control === "string" && result.control !== "cancel2" && controls.includes(result.control)) {
        event.result = { bool: true, cost_data: result.control };
      }
    },
    async content(event, trigger, player) {
      const control = event.cost_data;
      const backwater = control === "\u80CC\u6C34\uFF01";
      const count = player.storage.ac_sijian_backwater || 0;
      if (backwater) player.storage.ac_sijian_backwater = count + 1;
      if ((control === "\u9009\u9879\u4E00" || backwater) && player.isIn() && game3.hasPlayer((target) => target !== player && target.isIn())) {
        const chosen = await player.chooseTarget("\u6B7B\u8C0F\uFF1A\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\uFF0C\u5176\u4F7F\u7528\u4E0B\u4E00\u5F20\u724C\u540E\u9700\u5F03\u7F6E\u4E00\u5F20\u724C", true, (card, owner, target2) => target2 !== owner && target2.isIn()).set("ai", remoteChoice3("target => -get.attitude(_status.event.player, target)")).forResult();
        const target = chosen.targets?.[0];
        if (chosen.bool && target !== player && target?.isIn()) {
          target.addSkill("ac_sijian_discard");
          target.addMark("ac_sijian_discard", 1, false);
        }
      }
      if ((control === "\u9009\u9879\u4E8C" || backwater) && player.isIn()) {
        const current = _status3.currentPhase;
        if (current?.isIn()) await current.draw(2);
      }
      if (backwater && count > 0 && player.isIn()) await player.loseHp(count);
    },
    subSkill: { discard: { charlotte: true, forced: true, popup: false, onremove: true, trigger: { player: "useCardAfter" }, async content(event, trigger, player) {
      const count = player.countMark("ac_sijian_discard");
      player.removeSkill("ac_sijian_discard");
      for (let i = 0; i < count && player.countCards("he") > 0; i++) await player.chooseToDiscard("he", 1, true, "\u6B7B\u8C0F\uFF1A\u5F03\u7F6E\u4E00\u5F20\u724C");
    } } }
  },
  ac_zhuangjia: { locked: true, trigger: { player: "damageBegin4" }, forced: true, filter: (event) => event.num > 0, async content(event, trigger) {
    trigger.num = Math.max(1, trigger.num - 1);
  }, mod: { maxHandcard(player, num) {
    return num + 2;
  } } },
  ac_paoji: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: (card) => get3.type(card) === "equip", filter(event, player) {
    return player.countCards("he", (card) => get3.type(card) === "equip") > 0;
  }, filterTarget(card, player, target) {
    return target !== player;
  }, async content(event, trigger, player) {
    if (event.target.isIn()) await event.target.damage(1, player);
  }, ai: { order: 6, result: { target: -1 } } },
  ac_gushou: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: true, async content(event, trigger, player) {
    player.addTempSkill("ac_gushou_buff", { player: "phaseBegin" });
  }, ai: { order: 3, result: { player: 1 } }, subSkill: { buff: { charlotte: true, mark: true, marktext: "\u5B88", intro: { content: "\u5176\u4ED6\u89D2\u8272\u8BA1\u7B97\u4E0E\u4F60\u7684\u8DDD\u79BB+1\uFF1B\u6210\u4E3A\u6740\u7684\u76EE\u6807\u65F6\u6478\u4E00\u5F20\u724C\u3002" }, mod: { globalTo(from, to, distance) {
    return distance + 1;
  } }, trigger: { target: "useCardToTargeted" }, forced: true, filter(event, player) {
    return event.card?.name === "sha";
  }, async content(event, trigger, player) {
    await player.draw();
  } } } },
  mc_jinshen: { enable: "phaseUse", position: "h", filterCard: true, viewAs: { name: "sha" }, check: (card) => 5 - get3.value(card), ai: { order: 5 }, mod: { attackRange(player, range) {
    return range + 3;
  } } },
  mc_huanxue: { enable: "phaseUse", usable: 1, filter(event, player) {
    return player.hp > 0;
  }, async content(event, trigger, player) {
    await player.loseHp();
    if (!player.isIn()) return;
    player.addTempSkill("mc_huanxue_buff", { player: "phaseUseAfter" });
    player.storage.mc_huanxue_buff = true;
  }, ai: { order: 3, result: { player: 1 } }, subSkill: { buff: { charlotte: true, onremove: true, trigger: { source: "damageBegin1" }, filter(event, player) {
    return player.storage.mc_huanxue_buff && event.card?.name === "sha" && event.getParent("useCard")?.player === player && event.num > 0;
  }, async content(event, trigger, player) {
    trigger.num++;
    player.storage.mc_huanxue_buff = false;
    player.removeSkill("mc_huanxue_buff");
  } } } },
  mc_lianji: { enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "orange", filterTarget(card, player, target) {
    return target !== player;
  }, async content(event, trigger, player) {
    player.awakenSkill("mc_lianji");
    player.storage.mc_lianji = { target: event.target, active: true, rounds: 2 };
    player.addSkill("mc_lianji_dot");
    player.addSkill("mc_lianji_counter");
    player.addSkill("mc_lianji_ondeath");
    player.addSkill("mc_lianji_nodraw");
  }, subSkill: { dot: { charlotte: true, trigger: { global: "phaseBegin" }, forced: true, popup: false, filter(event, player) {
    const s = player.storage.mc_lianji;
    return s?.active && s.target?.isIn() && player.isIn();
  }, async content(event, trigger, player) {
    const target = player.storage.mc_lianji.target;
    if (!target?.isIn()) return;
    player.logSkill("mc_lianji", target);
    await target.damage(1, player);
  } }, counter: { charlotte: true, trigger: { global: "roundStart" }, forced: true, popup: false, filter(event, player) {
    const s = player.storage.mc_lianji;
    return s?.active && s.rounds > 0;
  }, async content(event, trigger, player) {
    player.storage.mc_lianji.rounds--;
    if (player.storage.mc_lianji.rounds <= 0) {
      player.storage.mc_lianji.active = false;
      player.removeSkill("mc_lianji_dot");
      player.removeSkill("mc_lianji_counter");
      player.storage.mc_lianji.nodraw_pending = true;
    }
  } }, ondeath: { charlotte: true, trigger: { player: "dieAfter" }, forced: true, popup: false, filter(event, player) {
    return player.storage.mc_lianji?.active;
  }, async content(event, trigger, player) {
    player.storage.mc_lianji.active = false;
    player.removeSkill("mc_lianji_dot");
    player.removeSkill("mc_lianji_counter");
    player.removeSkill("mc_lianji_ondeath");
    player.removeSkill("mc_lianji_nodraw");
    delete player.storage.mc_lianji;
  } }, nodraw: { charlotte: true, trigger: { player: "phaseDrawBegin1" }, forced: true, filter(event, player) {
    return player.storage.mc_lianji?.nodraw_pending;
  }, async content(event, trigger, player) {
    trigger.cancel();
    delete player.storage.mc_lianji;
    player.removeSkill("mc_lianji_nodraw");
  } } } }
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
  mc_rongzhu_info: "\u4F60\u53EF\u4EE5\u5C06\u4E00\u5F20\u88C5\u5907\u724C\u5F53\u9152\u4F7F\u7528\u3002\u4F60\u7684\u624B\u724C\u4E0A\u9650+X\uFF08X\u4E3A\u4F60\u88C5\u5907\u533A\u91CC\u7684\u724C\u6570\uFF09\u3002",
  ac_alucard: "\u963F\u5361\u591A",
  ac_alucard_ab: "\u963F\u5361\u591A",
  ac_life: "\u547D\u6570",
  ac_life_info: "\u6E38\u620F\u5F00\u59CB\u65F6\u83B7\u5F972\u679A\u547D\uFF08\u65E0\u4E0A\u9650\uFF09\u3002\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F60\u4F7F\u7528\u3010\u6740\u3011\u9020\u6210\u4F24\u5BB3\u540E\uFF0C\u6478\u4E00\u5F20\u724C\u3002\u51FB\u6740\u5176\u4ED6\u89D2\u8272\u540E\u83B7\u5F971\u679A\u547D\u3002\u53D7\u5230\u81F4\u547D\u4F24\u5BB3\u65F6\uFF0C\u53EF\u4EE5\u79FB\u53BB1\u679A\u547D\uFF0C\u9632\u6B62\u6B64\u6B21\u4F24\u5BB3\u3002",
  ac_river: "\u6B7B\u6CB3",
  ac_river_info: "\u9650\u5B9A\u6280\uFF0C\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u79FB\u53BB\u5168\u90E8\u547D\uFF08\u81F3\u5C111\u679A\uFF09\uFF0C\u6478\u7B49\u91CF\u7684\u724C\u3002\u76F4\u5230\u4F60\u7684\u4E0B\u56DE\u5408\u5F00\u59CB\uFF0C\u4F60\u4E0D\u80FD\u6210\u4E3A\u5176\u4ED6\u89D2\u8272\u4F7F\u7528\u724C\u7684\u76EE\u6807\uFF0C\u514D\u75AB\u5176\u4ED6\u89D2\u8272\u6280\u80FD\u76F4\u63A5\u9020\u6210\u7684\u4F24\u5BB3\u3001\u4F53\u529B\u6D41\u5931\u548C\u4F53\u529B\u4E0A\u9650\u51CF\u5C11\uFF1B\u4F60\u9020\u6210\u7684\u4F24\u5BB3\uFF0BX\uFF08X\u4E3A\u79FB\u53BB\u7684\u547D\u6570\uFF09\u3002\u53D1\u52A8\u540E\u6C38\u4E45\u6FC0\u6D3B\uFF1A\u6BCF\u4E2A\u81EA\u5DF1\u7684\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F60\u4EE5\u3010\u6740\u3011\u9020\u6210\u4F24\u5BB3\u540E\uFF0C\u53EF\u4EE5\u4EE4\u53D7\u4F24\u89D2\u8272\u51CF\u5C111\u70B9\u4F53\u529B\u4E0A\u9650\uFF08\u6700\u4F4E\u51CF\u81F32\uFF09\u3002",
  ac_jackal: "\u8C7A\u72FC",
  ac_jackal_info: "\u4F60\u4F7F\u7528\u3010\u6740\u3011\u65E0\u8DDD\u79BB\u9650\u5236\uFF0C\u6B21\u6570\u4E0A\u9650\uFF0B1\u3002\u6BCF\u4E2A\u81EA\u5DF1\u7684\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u4F7F\u7528\u3010\u6740\u3011\u6307\u5B9A\u76EE\u6807\u540E\uFF0C\u53EF\u4EE5\u4EE4\u5176\u4E2D\u4E00\u540D\u76EE\u6807\u987B\u4F7F\u7528\u4E24\u5F20\u3010\u95EA\u3011\u62B5\u6D88\u3002",
  ac_okabe: "\u5188\u90E8\u4F26\u592A\u90CE",
  ac_okabe_ab: "\u5188\u90E8",
  ac_observe: "\u547D\u8FD0\u63A2\u77E5",
  ac_observe_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u6210\u4E3A\u3010\u6740\u3011\u6216\u666E\u901A\u9526\u56CA\u724C\u7684\u76EE\u6807\u540E\uFF0C\u4F60\u53EF\u4EE5\u6478\u4E00\u5F20\u724C\u3002",
  ac_mail: "Dmail",
  ac_mail_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u4E0D\u53D7\u5EF6\u65F6\u9526\u56CA\u724C\u7684\u6548\u679C\u5F71\u54CD\u3002\u6240\u6709\u89D2\u8272\u7684\u5224\u5B9A\u724C\u751F\u6548\u540E\uFF0C\u4F60\u83B7\u5F97\u4E4B\u3002\u5176\u4ED6\u89D2\u8272\u5224\u5B9A\u524D\uFF0C\u4F60\u53EF\u4EE5\u6253\u51FA\u4E00\u5F20\u624B\u724C\u4EE3\u66FF\u5176\u5224\u5B9A\u724C\uFF08\u539F\u5224\u5B9A\u724C\u5F03\u7F6E\uFF09\u3002",
  ac_worldline: "\u4E16\u754C\u7EBF\u8DF3\u8DC3",
  ac_worldline_info: "\u9650\u5B9A\u6280\uFF0C\u5F53\u4F60\u6FD2\u6B7B\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4F53\u529B\u56DE\u590D\u81F32\uFF0C\u5F03\u7F6E\u573A\u4E0A\u6240\u6709\u88C5\u5907\u533A\u548C\u5224\u5B9A\u533A\u7684\u724C\uFF0C\u7136\u540E\u6478X\u5F20\u724C\uFF08X\u4E3A\u5B58\u6D3B\u89D2\u8272\u6570+2\uFF09\uFF0C\u4ECE\u4F60\u5F00\u59CB\u6309\u5EA7\u6B21\u7ED9\u6BCF\u540D\u5B58\u6D3B\u89D2\u8272\u5404\u4E00\u5F20\uFF0C\u5269\u4F59\u5F52\u4F60\u3002\u7ED3\u7B97\u540E\uFF0C\u4F60\u7684Dmail\u5931\u6548\uFF0C\u76F4\u5230\u4F60\u7684\u4E0B\u4E24\u4E2A\u56DE\u5408\u7ED3\u675F\u3002",
  ac_fighter: "\u6218\u6597\u673A",
  ac_fighter_ab: "\u6218\u6597\u673A",
  ac_zhikong: "\u5236\u7A7A",
  ac_zhikong_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u4F7F\u7528\u3010\u6740\u3011\u65E0\u8DDD\u79BB\u9650\u5236\u3002\u5176\u4ED6\u89D2\u8272\u8BA1\u7B97\u4E0E\u4F60\u7684\u8DDD\u79BB+1\u3002",
  ac_youji: "\u6E38\u51FB",
  ac_youji_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u89C2\u770B\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u7684\u624B\u724C\u5E76\u5F03\u7F6E\u5176\u4E2D\u4E00\u5F20\u3002",
  ac_guibi: "\u89C4\u907F",
  ac_guibi_info: "\u6BCF\u56DE\u5408\u9650\u4E00\u6B21\uFF0C\u5F53\u4F60\u6210\u4E3A\u3010\u6740\u3011\u7684\u76EE\u6807\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\uFF0C\u4EE4\u6B64\u3010\u6740\u3011\u5BF9\u4F60\u65E0\u6548\u3002",
  ac_tank: "\u5766\u514B",
  ac_tank_ab: "\u5766\u514B",
  ac_zhuangjia: "\u88C5\u7532",
  ac_zhuangjia_info: "\u9501\u5B9A\u6280\uFF0C\u4F60\u53D7\u5230\u7684\u4F24\u5BB3-1\uFF08\u6700\u4F4E\u4E3A1\uFF09\u3002\u624B\u724C\u4E0A\u9650+2\u3002",
  ac_paoji: "\u70AE\u51FB",
  ac_paoji_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u88C5\u5907\u724C\uFF0C\u5BF9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u9020\u62101\u70B9\u4F24\u5BB3\u3002",
  ac_gushou: "\u56FA\u5B88",
  ac_gushou_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u53EF\u4EE5\u5F03\u7F6E\u4E00\u5F20\u724C\u3002\u76F4\u5230\u4F60\u7684\u4E0B\u56DE\u5408\u5F00\u59CB\uFF0C\u5176\u4ED6\u89D2\u8272\u8BA1\u7B97\u4E0E\u4F60\u7684\u8DDD\u79BB+1\uFF1B\u5F53\u4F60\u6210\u4E3A\u3010\u6740\u3011\u7684\u76EE\u6807\u65F6\uFF0C\u4F60\u6478\u4E00\u5F20\u724C\u3002",
  mc_chicken: "\u9E21\u4ED4",
  mc_chicken_ab: "\u9E21\u4ED4",
  mc_jinshen: "\u8FD1\u8EAB\u6218",
  mc_jinshen_info: "\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u5C06\u4EFB\u610F\u4E00\u5F20\u624B\u724C\u5F53\u505A\u3010\u6740\u3011\u4F7F\u7528\uFF08\u8BA1\u5165\u6B21\u6570\u9650\u5236\uFF0C\u65E0\u53D1\u52A8\u6B21\u6570\u9650\u5236\u610F\u4E3A\u53EF\u591A\u6B21\u8F6C\u5316\uFF09\u3002\u653B\u51FB\u8DDD\u79BB+3\u3002",
  mc_huanxue: "\u6362\u8840",
  mc_huanxue_info: "\u51FA\u724C\u9636\u6BB5\u9650\u4E00\u6B21\uFF0C\u4F60\u5931\u53BB1\u70B9\u4F53\u529B\uFF0C\u672C\u56DE\u5408\u4F60\u4F7F\u7528\u7684\u4E0B\u4E00\u5F20\u3010\u6740\u3011\u4F24\u5BB3+1\u3002",
  mc_lianji: "\u8FDE\u51FB",
  mc_lianji_info: "\u9650\u5B9A\u6280\uFF0C\u51FA\u724C\u9636\u6BB5\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E00\u540D\u5176\u4ED6\u89D2\u8272\u3002\u6BCF\u56DE\u5408\u5F00\u59CB\u65F6\u5BF9\u5176\u9020\u62101\u70B9\u666E\u901A\u4F24\u5BB3\uFF0C\u6301\u7EED\u4E24\u8F6E\u3002\u82E5\u4E2D\u9014\u4F60\u6B7B\u4EA1\u5219\u7EC8\u6B62\uFF1B\u4F60\u7684\u4E0B\u4E00\u4E2A\u56DE\u5408\u8DF3\u8FC7\u6478\u724C\u9636\u6BB5\u3002"
};

// game/resources/app/src/character/mushoku/intro.js
var intro_default = {
  ac_vader: "\u300A\u661F\u7403\u5927\u6218\u300B\u4E2D\u7684\u897F\u65AF\u4EBA\u7269\uFF0C\u4EE5\u539F\u529B\u4E0E\u538B\u8FEB\u611F\u8457\u79F0\u3002\u672C\u7A3F\u901A\u8FC7\u6682\u65F6\u6263\u7F6E\u76EE\u6807\u7684\u724C\u5E76\u5BF9\u8D44\u6E90\u5F31\u52BF\u8005\u589E\u4F24\u3002",
  ac_mustang: "\u300A\u94A2\u4E4B\u70BC\u91D1\u672F\u5E08\u300B\u4E2D\u7684\u7130\u4E4B\u70BC\u91D1\u672F\u5E08\u3002\u672C\u7A3F\u4EE5\u4F24\u5BB3\u79EF\u7D2F\u8D44\u6E90\uFF0C\u518D\u8FDB\u884C\u6218\u672F\u63A7\u5236\u4E0E\u706B\u7130\u7206\u53D1\u3002",
  ac_gandalf: "\u300A\u6307\u73AF\u738B\u300B\u4E2D\u5F15\u5BFC\u4F19\u4F34\u5BF9\u6297\u9ED1\u6697\u7684\u5DEB\u5E08\u3002\u672C\u7A3F\u4EE5\u6307\u5B9A\u4F19\u4F34\u4E0E\u81EA\u5DF1\u8C03\u6574\u81F3\u76F8\u540C\u624B\u724C\u6570\u4F53\u73B0\u540C\u884C\u4E0E\u534F\u8C03\u3002",
  ac_kirby: "\u300A\u661F\u4E4B\u5361\u6BD4\u300B\u7684\u4E3B\u89D2\uFF0C\u4EE5\u5438\u5165\u4E0E\u590D\u5236\u80FD\u529B\u95FB\u540D\u3002\u672C\u7A3F\u4EE5\u7B5B\u9009\u724C\u5806\u548C\u56DE\u6536\u5176\u4ED6\u89D2\u8272\u7528\u8FC7\u7684\u724C\u8868\u73B0\u6536\u96C6\u7279\u5F81\u3002",
  ac_light: "\u300A\u6B7B\u4EA1\u7B14\u8BB0\u300B\u4E2D\u8BD5\u56FE\u4EE5\u57FA\u62C9\u8EAB\u4EFD\u652F\u914D\u79E9\u5E8F\u7684\u4EBA\u7269\u3002\u672C\u7A3F\u901A\u8FC7\u8FEB\u4F7F\u5BF9\u624B\u9009\u62E9\u4EE3\u4EF7\u548C\u5C55\u793A\u624B\u724C\u5E94\u5BF9\u4F24\u5BB3\u4F53\u73B0\u5FC3\u7406\u535A\u5F08\u3002",
  ac_totoro: "\u5409\u535C\u529B\u7535\u5F71\u300A\u9F99\u732B\u300B\u4E2D\u7684\u68EE\u6797\u7CBE\u7075\u3002\u672C\u7A3F\u4EE5\u56DE\u5408\u5F00\u59CB\u65F6\u7684\u6478\u724C\u4E0E\u624B\u724C\u4E0A\u9650\u589E\u52A0\u4F53\u73B0\u6E29\u548C\u5E87\u62A4\u3002",
  ac_captain: "\u6F2B\u5A01\u4E2D\u7684\u8D85\u7EA7\u82F1\u96C4\uFF0C\u5E38\u4EE5\u56E2\u961F\u9886\u8896\u8EAB\u4EFD\u884C\u52A8\u3002\u672C\u7A3F\u901A\u8FC7\u4EA4\u724C\u53D1\u51FA\u8FDB\u653B\u53F7\u4EE4\uFF0C\u518D\u4F9D\u636E\u6267\u884C\u60C5\u51B5\u7ED3\u7B97\u3002",
  ac_santa: "\u5723\u8BDE\u6587\u5316\u4E2D\u6D3E\u9001\u793C\u7269\u7684\u4F20\u7EDF\u5F62\u8C61\u3002\u793C\u7269\u6D3E\u9001\u4F53\u73B0\u9988\u8D60\uFF0C\u6B7B\u8C0F\u5219\u5728\u5931\u53BB\u6700\u540E\u4E00\u5F20\u624B\u724C\u6216\u6FD2\u6B7B\u65F6\u4F5C\u51FA\u6289\u62E9\u3002",
  ac_batman: "DC\u4F5C\u54C1\u4E2D\u4EE5\u4FA6\u67E5\u3001\u88C5\u5907\u548C\u7B56\u7565\u884C\u52A8\u7684\u54E5\u8C2D\u5B88\u62A4\u8005\u3002\u672C\u7A3F\u4EE5\u653E\u5F03\u9636\u6BB5\u79EF\u84C4\u56DE\u5408\u5916\u8FFD\u51FB\u673A\u4F1A\u3002",
  ac_ken: "\u300A\u5317\u6597\u795E\u62F3\u300B\u7684\u4E3B\u89D2\uFF0C\u4EE5\u5317\u6597\u795E\u62F3\u8FCE\u6218\u5F3A\u654C\u3002\u672C\u7A3F\u8868\u73B0\u4ED8\u51FA\u9012\u589E\u4EE3\u4EF7\u6301\u7EED\u51FA\u62F3\uFF0C\u4EE5\u53CA\u4E0E\u540C\u4F53\u529B\u5BF9\u624B\u4EA4\u950B\u3002",
  ac_wonderwoman: "DC\u4F5C\u54C1\u4E2D\u7684\u4E9A\u9A6C\u900A\u82F1\u96C4\uFF0C\u4EE5\u52C7\u6C14\u4E0E\u5B88\u62A4\u7CBE\u795E\u8457\u79F0\u3002\u672C\u7A3F\u901A\u8FC7\u8C03\u914D\u8D44\u6E90\u6276\u52A9\u4ED6\u4EBA\uFF0C\u5E76\u5728\u6B7B\u4EA1\u65F6\u7559\u4E0B\u63F4\u52A9\u3002",
  ac_spiderman: "\u6F2B\u5A01\u4E2D\u7684\u8D85\u7EA7\u82F1\u96C4\uFF0C\u4EE5\u8718\u86DB\u611F\u5E94\u548C\u4FDD\u62A4\u4ED6\u4EBA\u4E3A\u9C9C\u660E\u7279\u5F81\u3002\u672C\u7A3F\u56F4\u7ED5\u5E72\u6270\u653B\u51FB\u8005\u4E0E\u4EE3\u66FF\u53D7\u51FB\u8005\u627F\u62C5\u76EE\u6807\u3002",
  ac_joker: "DC\u4F5C\u54C1\u4E2D\u7684\u72AF\u7F6A\u53CD\u6D3E\uFF0C\u4EE5\u6DF7\u4E71\u4E0E\u5371\u9669\u7684\u6E38\u620F\u611F\u8457\u79F0\u3002\u672C\u7A3F\u56F4\u7ED5\u968F\u673A\u4F24\u5BB3\u548C\u727A\u7272\u4F53\u529B\u4E0A\u9650\u56DE\u6536\u9526\u56CA\u3002",
  ac_doraemon: "\u6765\u81EA\u672A\u6765\u7684\u732B\u578B\u673A\u5668\u4EBA\uFF0C\u4F9D\u9760\u9053\u5177\u5E2E\u52A9\u4F19\u4F34\u3002\u672C\u7A3F\u4EE5\u8C03\u6574\u624B\u724C\u548C\u9526\u56CA\u76EE\u6807\u4F53\u73B0\u7075\u6D3B\u5E94\u5BF9\u3002",
  ac_gojo: "\u300A\u5492\u672F\u56DE\u6218\u300B\u4E2D\u7684\u5492\u672F\u5E08\uFF0C\u4EE5\u8FD1\u8DDD\u79BB\u5C01\u9501\u4E0E\u624B\u724C\u4F18\u52BF\u538B\u5236\u654C\u4EBA\u3002\u672C\u7A3F\u4EE5\u8FD1\u8DDD\u79BB\u65E0\u6CD5\u54CD\u5E94\u548C\u4F18\u52BF\u4F24\u5BB3\u4F53\u73B0\u538B\u5236\u611F\u3002",
  ac_hulk: "\u6F2B\u5A01\u4E2D\u7684\u4F3D\u9A6C\u53D8\u5F02\u82F1\u96C4\uFF0C\u4EE5\u6124\u6012\u4E0E\u5F3A\u5927\u529B\u91CF\u8457\u79F0\u3002\u672C\u7A3F\u4FA7\u91CD\u53CC\u91CD\u54CD\u5E94\u538B\u529B\u548C\u547D\u4E2D\u540E\u7684\u63A0\u593A\u8FFD\u51FB\u3002",
  ac_alucard: "\u65E0\u751F\u4E4B\u738B\u3002\u6B64\u4E3A4\u4F53\u529B\u666E\u901A\u6B66\u5C06\u7248\u672C\uFF0C\u4E0EBoss\u963F\u5361\u591A\u72EC\u7ACB\u3002\u547D\u6570\u62B5\u6321\u81F4\u547D\u4F24\u5BB3\uFF0C\u6B7B\u6CB3\u91CA\u653E\u50A8\u5907\u540E\u5F3A\u5316\u8F93\u51FA\u5E76\u6C38\u4E45\u89E3\u9501\u6740\u540E\u7684\u4F53\u529B\u4E0A\u9650\u524A\u51CF\uFF0C\u8C7A\u72FC\u589E\u5F3A\u6740\u7684\u5C04\u7A0B\u4E0E\u54CD\u5E94\u538B\u529B\u3002",
  ac_okabe: "\u5188\u90E8\u4F26\u592A\u90CE\uFF0C\u72C2\u6C14\u79D1\u5B66\u5BB6\u3002\u4EE5Dmail\u5E72\u9884\u5224\u5B9A\uFF0C\u4EE5\u4E16\u754C\u7EBF\u8DF3\u8DC3\u91CD\u6574\u573A\u4E0A\u88C5\u5907\u4E0E\u5224\u5B9A\u724C\uFF1B\u8DF3\u8DC3\u540E\u6682\u65F6\u5931\u53BBDmail\u80FD\u529B\u3002",
  ac_fighter: "\u63A0\u7A7A\u4E4B\u7FFC\u3002\u7FA4\u52BF\u529B\uFF0C\u673A\u68B0\u5355\u4F4D\uFF0C\u65E0\u6027\u522B\uFF0C4\u4F53\u529B\u3002\u5236\u7A7A\u63D0\u4F9B\u6740\u65E0\u8DDD\u79BB\u9650\u5236\u4E0E\u9632\u5FA1\u8DDD\u79BB\uFF1B\u6E38\u51FB\u5F03\u724C\u7AA5\u89C6\u5E76\u62D4\u9664\u654C\u65B9\u624B\u724C\uFF1B\u89C4\u907F\u4EE5\u5F03\u724C\u4EE3\u4EF7\u4EE4\u6740\u65E0\u6548\u3002",
  ac_tank: "\u94A2\u94C1\u58C1\u5792\u3002\u7FA4\u52BF\u529B\uFF0C\u673A\u68B0\u5355\u4F4D\uFF0C\u65E0\u6027\u522B\uFF0C4\u4F53\u529B\u3002\u88C5\u7532\u51CF\u8F7B\u4F24\u5BB3\u5E76\u63D0\u5347\u624B\u724C\u5BB9\u91CF\uFF1B\u70AE\u51FB\u6D88\u8017\u88C5\u5907\u8F6C\u5316\u4E3A\u76F4\u63A5\u4F24\u5BB3\uFF1B\u56FA\u5B88\u5C55\u5F00\u9632\u5FA1\u59FF\u6001\u6301\u7EED\u83B7\u5F97\u8DDD\u79BB\u4F18\u52BF\u5E76\u4EE5\u6740\u4E3A\u8BF1\u9975\u6478\u724C\u3002",
  mc_chicken: "\u65B9\u5757\u6597\u58EB\u3002\u6765\u81EAMinecraft\u7684\u9E21\u4ED4\u6218\u58EB\uFF0C\u5F02\u52BF\u529B\uFF0C4\u4F53\u529B\u3002\u8FD1\u8EAB\u6218\u5C06\u4EFB\u610F\u624B\u724C\u8F6C\u5316\u4E3A\u6740\u4E14\u653B\u51FB\u8DDD\u79BB+3\uFF1B\u6362\u8840\u4EE5\u81EA\u4F24\u6362\u53D6\u4E0B\u4E00\u5F20\u6740\u7684\u4F24\u5BB3\u589E\u5E45\uFF1B\u8FDE\u51FB\u4E3A\u9650\u5B9A\u6280\uFF0C\u9009\u5B9A\u4E00\u540D\u89D2\u8272\u540E\u5168\u5C40\u6BCF\u56DE\u5408\u9020\u6210\u6301\u7EED\u538B\u5236\uFF0C\u4EE5\u8DF3\u8FC7\u6478\u724C\u9636\u6BB5\u4E3A\u4EE3\u4EF7\u3002",
  boss_johan: "\u300AMONSTER\u300B\uFF08\u300A\u602A\u7269\u300B\uFF09\u4E2D\u7684\u7EA6\u7FF0\xB7\u674E\u8D1D\u7279\uFF0C\u6C89\u9759\u806A\u6167\uFF0C\u5584\u4E8E\u6D1E\u5BDF\u5E76\u64CD\u7EB5\u4EBA\u5FC3\u3002\u4ED6\u662F\u8D2F\u7A7F\u4F5C\u54C1\u7684\u6838\u5FC3\u8C1C\u56E2\uFF0C\u4EA6\u88AB\u79F0\u4F5C\u201C\u65E0\u540D\u7684\u602A\u7269\u201D\u3002\u672C\u89D2\u8272\u4EE5\u5FC3\u7406\u538B\u8FEB\u548C\u64CD\u63A7\u6218\u573A\u5448\u73B0\u5176Boss\u5B9A\u4F4D\u3002",
  th_mokou: "\u85E4\u539F\u59B9\u7EA2\uFF0C\u4E1C\u65B9Project\u89D2\u8272\uFF0C\u79F0\u53F7\u4E0D\u6B7B\u7684\u70DF\u706B\u3002\u5E7B\u52BF\u529B\uFF0C2/2\u4F53\u529B\uFF1B\u84EC\u83B1\u63D0\u4F9B\u751F\u5B58\u8D44\u6E90\uFF0C\u51E4\u7FFC\u4EE5\u82B1\u8272\u8F6C\u5316\u724C\u3002\u53F0\u8BCD\u5DF2\u767B\u8BB0\u4E3A\u6587\u672C\u5E76\u5728\u6280\u80FD\u4F7F\u7528\u6216\u9635\u4EA1\u65F6\u663E\u793A\uFF0C\u672A\u751F\u6210\u914D\u97F3\u3002",
  ac_yuu: "\u4E59\u5742\u6709\u5B87\uFF0C\u300ACharlotte\u300B\u89D2\u8272\u3002\u901A\u8FC7\u97F3\u6D04\u83B7\u5F97\u5176\u4ED6\u89D2\u8272\u7684\u6280\u80FD\uFF0C\u518D\u4EE5\u5408\u97F5\u820D\u5F03\u6280\u80FD\u6362\u53D6\u6478\u724C\uFF1B\u53EF\u4EE5\u9009\u62E9\u81EA\u5DF1\u4F5C\u4E3A\u5408\u97F5\u76EE\u6807\u3002",
  mt_rudeus: "\u9C81\u8FEA\u4E4C\u65AF\xB7\u683C\u96F7\u62C9\u7279\u3002\u81EA\u5E7C\u5B66\u4E60\u9B54\u672F\uFF0C\u64C5\u957F\u65E0\u548F\u5531\u65BD\u6CD5\u3002\u9884\u89C1\u6765\u81EA\u9B54\u773C\u80FD\u529B\uFF0C\u724C\u9762\u5C06\u5176\u62BD\u8C61\u4E3A\u6709\u4EE3\u4EF7\u7684\u9632\u5FA1\u3002",
  mt_roxy: "\u300A\u65E0\u804C\u8F6C\u751F\u300B\u4E2D\u7684\u6D1B\u742A\u5E0C\xB7\u7C73\u683C\u8DEF\u8FEA\u4E9A\uFF0C\u6301\u7EED\u7CBE\u8FDB\u7684\u6C34\u7CFB\u9B54\u672F\u5E08\uFF0C\u4E5F\u662F\u9C81\u8FEA\u4E4C\u65AF\u7684\u542F\u8499\u8001\u5E08\u3002\u4EE5\u6C34\u548F\u79EF\u84C4\u9B54\u529B\uFF0C\u6C34\u88AD\u538B\u5236\u5BF9\u624B\u3001\u6C34\u7075\u6062\u590D\u81EA\u8EAB\uFF0C\u5E76\u4EE5\u53EF\u88AB\u4F24\u5BB3\u6253\u65AD\u7684\u8C6A\u96E8\u541F\u5531\u53EC\u6765\u96F7\u7535\u3002",
  mt_sylphie: "\u5E0C\u9732\u83F2\u53F6\u7279\u3002\u9C81\u8FEA\u4E4C\u65AF\u7684\u9752\u6885\u7AF9\u9A6C\uFF0C\u65E0\u548F\u5531\u9B54\u672F\u4F7F\u7528\u8005\uFF0C\u66FE\u62C5\u4EFB\u7231\u4E3D\u513F\u7684\u5B88\u62A4\u672F\u5E08\u3002\u6CBB\u6108\u4E0E\u4FDD\u62A4\u6784\u6210\u724C\u9762\u4E3B\u9898\u3002",
  mt_eris: "\u827E\u8389\u4E1D\xB7\u4F2F\u96F7\u4E9A\u65AF\xB7\u683C\u96F7\u62C9\u7279\u3002\u6027\u683C\u76F4\u63A5\uFF0C\u523B\u82E6\u953B\u70BC\u5251\u672F\u3002\u70C8\u5251\u4EE5\u4F53\u529B\u6362\u53D6\u538B\u5236\uFF0C\u51B3\u610F\u6839\u636E\u4F24\u5BB3\u603B\u91CF\u6216\u4F4E\u4F53\u529B\u72B6\u6001\u8865\u5145\u624B\u724C\u3002",
  mt_orsted: "\u5965\u5C14\u65AF\u5E1D\u5FB7\uFF0C\u9F99\u795E\u3002\u5E7B\u52BF\u529B\uFF0C4\u4F53\u529B\uFF0C\u5B9A\u4F4D\u4E3A\u8FDC\u7A0B\u5A01\u538B\u3001\u8D44\u6E90\u653B\u9632\u4E0E\u4F11\u6574\u7EED\u822A\u3002\u9F99\u529B\u4E0A\u9650\u4E3A3\uFF0C\u8FDB\u653B\u4E0E\u9632\u5B88\u5171\u4EAB\u8D44\u6E90\uFF1B\u672A\u9020\u6210\u4F24\u5BB3\u7684\u56DE\u5408\u7ED3\u675F\u65F6\u7F13\u6162\u6062\u590D\u3002\u4E3B\u516C\u6280\u9F99\u76DF\u53EF\u8054\u7ED3\u5E7B\u52BF\u529B\uFF0C\u662F\u5408\u4F5C\u4E3B\u9898\u7684\u73A9\u6CD5\u6539\u7F16\u3002",
  mt_ruijerd: "\u745E\u6770\u8DEF\u5FB7\xB7\u65AF\u4F69\u8DEF\u8FEA\u4E9A\u3002\u65AF\u4F69\u8DEF\u5FB7\u65CF\u6218\u58EB\uFF0C\u7B2C\u4E09\u773C\u8D4B\u4E88\u611F\u77E5\u80FD\u529B\uFF0C\u91CD\u89C6\u4FDD\u62A4\u5B69\u5B50\u3002\u62A4\u5E7C\u7684\u4F53\u529B\u6761\u4EF6\u4EC5\u7528\u4E8E\u89C4\u5219\u5E73\u8861\u3002",
  mt_paul: "\u4FDD\u7F57\xB7\u683C\u96F7\u62C9\u7279\u3002\u638C\u63E1\u591A\u79CD\u5251\u672F\u6D41\u6D3E\u3002\u6551\u63F4\u53EF\u5411\u4F53\u529B\u4E0A\u9650\u66F4\u4F4E\u7684\u89D2\u8272\u8F6C\u79FB\u4F53\u529B\u4E0A\u9650\uFF0C\u4EE5\u81EA\u8EAB\u8D44\u6E90\u589E\u5F3A\u53D7\u63F4\u8005\u751F\u5B58\u80FD\u529B\uFF0C\u4E0D\u9650\u5B9A\u89D2\u8272\u3002",
  mt_ghislaine: "\u57FA\u5217\u5974\xB7\u6CF0\u5FB7\u8DEF\u8FEA\u4E9A\u3002\u517D\u65CF\u5251\u738B\u3002\u6388\u5251\u901A\u8FC7\u5251\u610F\u652F\u63F4\u5176\u4ED6\u89D2\u8272\u7684\u4E0B\u4E00\u56DE\u5408\u9996\u5F20\u6740\uFF1B\u5B88\u62A4\u5C06\u4F24\u5BB3\u6539\u4E3A\u5931\u53BB\u4F53\u529B\u5E76\u8865\u5145\u624B\u724C\uFF0C\u964D\u4F4E\u4F53\u529B\u53EF\u914D\u5408\u5251\u738B\u7684\u89E6\u53D1\u6761\u4EF6\u3002"
};

// game/resources/app/src/character/modern/index.js
var ids = Object.keys(character_default);
var skillIds = ids.flatMap((id) => character_default[id].skills);
var skills2 = { ...skill_default, ...expansion_default };
var translations = { ...translate_default, ...expansion_translate_default };
var keys = /* @__PURE__ */ new Set([...ids, ...ids.map((id) => id + "_ab"), ...skillIds, ...skillIds.map((id) => id + "_info"), ...skillIds.map((id) => id + "_ab")]);
game4.import("character", () => ({
  name: "modern",
  connect: true,
  character: character_default,
  skill: Object.fromEntries(skillIds.filter((id) => skills2[id]).map((id) => [id, skills2[id]])),
  translate: { modern: "\u73B0\u4EE3", ...Object.fromEntries(Object.entries(translations).filter(([id]) => keys.has(id))) },
  characterIntro: Object.fromEntries(ids.map((id) => [id, intro_default[id]])),
  characterTitle: titlesForPack("modern")
}));
