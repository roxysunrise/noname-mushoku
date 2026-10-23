import { lib, game, get, ui, _status } from "noname";

const other = (card, player, target) => target !== player;
// Networked choices serialize callbacks without their module closure.
const remoteChoice = source => get.infoFuncOL("_noname_func:" + source);
const inDiscard = cards => (cards || []).filter(card => get.position(card, true) === "d");
// Physical cards enter the discard pile in orderingDiscard, after useCardAfter.
const discardedUse = event => {
 const ordering = event.getParent();
 if (ordering.name !== "orderingDiscard") return null;
 const use = ordering.relatedEvent || ordering.getParent();
 return use.name === "useCard" ? use : null;
};
const maximal = (player, value) => !game.hasPlayer(target => value(target) > value(player));
const chooseTarget = async (player, prompt, filter = other, range) => {
 const next = range ? player.chooseTarget(prompt, range, filter) : player.chooseTarget(prompt, filter);
 return next.forResult();
};
const adjustHand = async (owner, target) => {
 if (!owner.isIn() || !target.isIn()) return;
 const n = owner.countCards("h"), h = target.countCards("h");
 if (h > n) await target.chooseToDiscard("h", h - n, true);
 else if (h < Math.min(5, n)) await target.draw(Math.min(5, n) - h);
};
const fuki = {
 trigger: { player: "useCard" }, forced: true,
 content(event, trigger, player) {
  trigger.directHit.addArray(game.filterPlayer(target => target !== player && get.distance(target, player) === 1));
 },
};

export default {
 ac_rageburst: {
  forced: true, trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
  filter: (event, player) => event.card.name === "juedou" || (event.player === player && event.card.name === "sha"),
  content(event, trigger, player) {
   const map = trigger.getParent().customArgs, id = trigger.target.playerid;
   const args = map[id] ||= {};
   if (trigger.card.name === "sha") args.shanRequired = (args.shanRequired || 1) + 1;
   else {
    const opponent = (trigger.player === player ? trigger.target : trigger.player).playerid;
    args.shaReq ||= {};
    args.shaReq[opponent] = (args.shaReq[opponent] || 1) + 1;
   }
  },
 },
 ac_gammasteal: {
  trigger: { source: "damageSource" },
  filter: (event, player) => event.card?.name === "sha" && event.getParent("useCard")?.player === player && event.player !== player && event.player.isIn() && event.player.countGainableCards(player, "hej") > 0,
  async content(event, trigger, player) {
   const target = trigger.player;
   if (!player.isIn() || !target.isIn() || !target.countGainableCards(player, "hej")) return;
   const result = await player.gainPlayerCard(target, "hej", true).forResult();
   if (!result.bool || !result.cards?.length) return;
   if (get.type(result.cards[0]) !== "equip") { if (target.isIn()) await target.draw(); return; }
   if (!player.isIn() || !target.isIn()) return;
   const duel = { name: "juedou", isCard: true };
   const targets = game.filterPlayer(candidate => candidate !== target && candidate !== player && candidate.isIn() && player.canUse(duel, candidate));
   if (!targets.length) return;
   const choice = await target.chooseTarget("伽马掠夺：指定决斗目标",
    remoteChoice("(card, source, candidate) => candidate.isIn() && _status.event.acGammaTargets.includes(candidate)"))
    .set("acGammaTargets", targets).forResult();
   const chosen = choice.targets?.[0];
   if (choice.bool && player.isIn() && target.isIn() && targets.includes(chosen) && chosen.isIn() && player.canUse(duel, chosen)) await player.useCard(duel, chosen);
  },
 },
 ac_fuki: { ...fuki },
 ac_jiaozi: {
  trigger: { source: "damageBegin1", player: "damageBegin3" }, forced: true,
  filter: (event, player) => player.isMaxHandcard(true),
  async content(event, trigger) { trigger.num++; },
 },
 ac_timestore: {
  trigger: { player: "phaseUseEnd" }, direct: true,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "时光整理：选择手牌数不等于体力值的角色", (card, source, target) => target.countCards("h") !== target.hp);
   if (!result.bool) return;
   const target = result.targets[0]; player.logSkill("ac_timestore", target);
   const options = target.countCards("h") ? ["弃置手牌", "摸牌"] : ["摸牌"];
   const choice = await player.chooseControl(options).forResult();
   if (choice.control === "弃置手牌") await target.chooseToDiscard("h", 1, true); else await target.draw();
   if (target.countCards("h") === target.hp) {
    await player.draw();
    if (target !== player) await player.chooseToGive(target, "he", 1, "时光整理：可以交给其一张牌");
   }
  },
 },
 ac_anydoor: {
  trigger: { target: "useCardToTargeted" }, direct: true,
  filter(event, player) {
   if (get.type(event.card) !== "trick" || get.subtype(event.card) === "delay") return false;
   const use = event.getParent();
   if (use.targets.length > 1) return true;
   return game.hasPlayer(target => !use.targets.includes(target) && lib.filter.targetEnabled2(event.card, event.player, target) && lib.filter.targetInRange(event.card, event.player, target));
  },
  async content(event, trigger, player) {
   const use = trigger.getParent();
   const result = await player.chooseTarget("任意门：增加或减少一个目标（至少保留一个）",
    remoteChoice("(card, source, target) => { const event = _status.event; return event.acAnydoorTargets.includes(target) ? event.acAnydoorTargets.length > 1 : lib.filter.targetEnabled2(event.acAnydoorCard, event.acAnydoorSource, target) && lib.filter.targetInRange(event.acAnydoorCard, event.acAnydoorSource, target); }"))
    .set("acAnydoorTargets", use.targets).set("acAnydoorCard", trigger.card).set("acAnydoorSource", trigger.player).forResult();
   if (!result.bool) return;
   const target = result.targets[0]; player.logSkill("ac_anydoor", target);
   if (use.targets.includes(target)) { use.targets.remove(target); use.excluded.add(target); }
   else use.targets.push(target);
  },
 },
 ac_chaoslaugh: {
  trigger: { player: "phaseZhunbeiBegin" }, direct: true,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "混乱狂笑：对一名体力不大于你的其他角色造成0–2点随机伤害", (card, source, target) => target !== source && target.hp <= source.hp);
   if (result.bool) { player.logSkill("ac_chaoslaugh", result.targets); const n = get.rand(0, 2); if (n) await result.targets[0].damage(n, player); }
  },
 },
 ac_crimecycle: {
  trigger: { global: "cardsDiscardAfter" },
  filter(event, player) { const use = discardedUse(event); return !player.hasSkill("ac_crimecycle_used") && player.isPhaseUsing() && use?.player === player && get.type2(use.card) === "trick" && inDiscard(event.cards).some(card => use.cards.includes(card)); },
  async content(event, trigger, player) { player.addTempSkill("ac_crimecycle_used", "phaseUseAfter"); const use = discardedUse(trigger), cards = inDiscard(trigger.cards).filter(card => use.cards.includes(card)); await player.loseMaxHp(); if (player.isIn() && inDiscard(cards).length) await player.gain(inDiscard(cards), "gain2"); },
  subSkill: { used: { charlotte: true } },
 },
 ac_spidersense: {
  trigger: { global: "useCardToTarget" }, direct: true,
  filter: (event, player) => !player.hasSkill("ac_spidersense_used") && event.player !== player && (event.card.name === "sha" || get.type(event.card) === "delay") && (event.target === player || player.inRange(event.target)),
  async content(event, trigger, player) {
   const options = ["摸一张牌"];
   if (trigger.player.countDiscardableCards(player, "h")) options.unshift("弃置使用者手牌");
   if (trigger.target !== player && !trigger.targets.includes(player)) options.push("背水");
   options.push("取消");
   const result = await player.chooseControl(options).set("prompt", "蜘蛛感应：背水执行两项并代替目标").forResult();
   if (!options.includes(result.control) || result.control === "取消") return;
   player.addTempSkill("ac_spidersense_used", "phaseAfter");
   player.logSkill("ac_spidersense");
   if (result.control !== "摸一张牌" && trigger.player.isIn() && trigger.player.countDiscardableCards(player, "h")) await player.discardPlayerCard(trigger.player, "h", true);
   if (result.control !== "弃置使用者手牌" && player.isIn()) await player.draw();
   if (result.control === "背水" && player.isIn() && trigger.target.isIn()) {
    const use = trigger.getParent();
    if (!use.targets.includes(trigger.target) || use.targets.includes(player)) return;
    use.targets.remove(trigger.target); use.targets.push(player);
    use.triggeredTargets1?.remove(trigger.target); use.triggeredTargets2?.remove(trigger.target);
    trigger.untrigger();
   }
  },
  subSkill: { used: { charlotte: true } },
 },
 ac_lasso: {
  enable: "phaseUse", usable: 1, selectTarget: 2, multitarget: true,
  filterTarget(card, player, target) { return target !== player && (!ui.selected.targets.length || target.countGainableCards(ui.selected.targets[0], "hej") > 0); },
  async content(event, trigger, player) {
   const [a, b] = event.targets, equips = b.getCards("e");
   const gained = await a.gainPlayerCard(b, "hej", true).forResult();
   if (!gained.bool) return;
   if (!equips.includes(gained.cards[0])) await player.draw();
   if (a.countCards("h") !== b.countCards("h")) {
    const poor = a.countCards("h") < b.countCards("h") ? a : b;
    if ((await player.chooseBool(`真言套索：是否令${get.translation(poor)}摸一张牌？`).forResult()).bool) await poor.draw();
   }
  }, ai: { order: 6, result: { player: 1 } },
 },
 ac_amazonlegacy: {
  trigger: { player: "die" }, forceDie: true, direct: true,
  async content(event, trigger, player) {
   const result = await player.chooseTarget("亚马逊遗志：令一名其他角色摸三张牌并回复1点体力", other).set("forceDie", true).forResult();
   if (result.bool) { player.logSkill("ac_amazonlegacy", result.targets); await result.targets[0].draw(3); await result.targets[0].recover(); }
  },
 },
 ac_hundredfists: {
  enable: "phaseUse", filter: (event, player) => !player.hasSkill("ac_hundredfists_block"),
  filterTarget: (card, player, target) => target !== player && player.canUse({ name: "sha", isCard: true }, target, false),
  async content(event, trigger, player) {
   const n = (player.getStat("skill").ac_hundredfists || 1);
   const options = ["流失体力"];
   if (player.countCards("he", card => lib.filter.cardDiscardable(card, player, "ac_hundredfists")) >= n) options.unshift("弃置牌");
   const result = await player.chooseControl(options).set("prompt", `北斗百裂拳：弃置${n}张牌或流失${n}点体力`).forResult();
   if (result.control === "弃置牌") await player.chooseToDiscard("he", n, true); else await player.loseHp(n);
   if (!player.isIn() || !event.target.isIn()) return;
   const use = player.useCard({ name: "sha", isCard: true }, event.target, false); use.ac_hundredfists = true; await use;
   if ([...game.players, ...game.dead].some(target => target.getHistory("damage", damage => damage.getParent("useCard") === use).length > 0)) player.addTempSkill("ac_hundredfists_block", "phaseAfter");
  },
  subSkill: { block: { charlotte: true } }, ai: { order: 5, result: { target: -1 } },
 },
 ac_fateduel: {
  trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
  filter: (event, player) => event.card.name === "sha" && (event.player === player ? event.target !== player && event.target.hp === player.hp : event.player.hp === player.hp),
  async content(event, trigger, player) { await player.draw(); },
 },
 ac_nightstalk: {
  trigger: { player: ["phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore"] },
  filter(event, player) {
   if (event.name === "phaseDraw") return maximal(player, p => p.countCards("h"));
   if (event.name === "phaseUse") return maximal(player, p => p.hp);
   return player.countCards("e") > 0 && maximal(player, p => p.countCards("e"));
  },
  content(event, trigger) { trigger.cancel(); },
 },
 ac_batprey: {
  trigger: { player: "phaseAfter" }, direct: true,
  filter: (event, player) => player.getHistory("skipped").length > 0,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "蝙蝠追猎：选择受到1点伤害的其他角色", other, [1, player.getHistory("skipped").length]);
   if (!result.bool) return;
   player.logSkill("ac_batprey", result.targets);
   for (const target of result.targets) if (target.isIn()) await target.damage(1, player);
   const cards = Array.from(ui.cardPile.childNodes).filter(card => get.type(card) === "equip");
   if (cards.length) await player.gain(cards.randomGet(), "gain2");
  },
 },
 ac_giftdelivery: {
  enable: "phaseUse", usable: 1, position: "h", filterCard: true, selectCard: [2, Infinity], discard: false, lose: false, delay: false,
  filter: (event, player) => player.countCards("h") >= 2, filterTarget: other,
  async content(event, trigger, player) {
   await player.give(event.cards, event.target);
   player.storage.ac_giftdelivery_targets ||= []; player.storage.ac_giftdelivery_targets.push(event.target);
   player.addTempSkill("ac_giftdelivery_settle", "phaseAfter");
  },
  subSkill: { settle: {
   charlotte: true, trigger: { global: "phaseEnd" }, forced: true, onremove(player) { delete player.storage.ac_giftdelivery_targets; },
   async content(event, trigger, player) {
    const targets = player.storage.ac_giftdelivery_targets || []; delete player.storage.ac_giftdelivery_targets;
    for (const target of targets) if (target.isIn()) {
     if (maximal(target, p => p.countCards("h"))) await player.draw();
     else if (target.countDiscardableCards(player, "hej")) await player.discardPlayerCard(target, "hej", true);
    }
   },
  } }, ai: { order: 4, result: { target: 1 } },
 },
 ac_freedomcommand: {
  trigger: { player: "phaseUseBegin" }, direct: true,
  filter: (event, player) => player.countCards("he") > 0,
  async content(event, trigger, player) {
   const result = await player.chooseCardTarget({ prompt: "自由号令：交给一名其他角色一张牌", position: "he", filterCard: true, filterTarget: other }).forResult();
   if (!result?.bool || !result.cards?.length || !result.targets?.length) return;
   const target = result.targets[0];
   if (!target?.isIn?.() || !player.isIn?.()) return;
   player.logSkill("ac_freedomcommand", target); await player.give(result.cards, target);
   const used = await target.chooseToUse({ prompt: "自由号令：是否使用一张非黑色的杀？", filterCard(card, player) { return get.name(card) === "sha" && get.color(card) !== "black" && lib.filter.cardEnabled(card, player) && lib.filter.cardUsable(card, player); } }).forResult();
   if (used?.bool) {
    const use = target.getHistory("useCard").findLast(evt => evt.getParent("ac_freedomcommand") === event);
    let damage = 0;
    if (use) for (const victim of [...game.players, ...game.dead]) for (const hit of victim.getHistory("damage", evt => evt.getParent("useCard") === use)) damage += hit.num;
    await player.draw(Math.min(5, damage + 1));
   } else {
    // 队友取消使用后仍需重新构造一次目标选择；目标离场时直接结束，避免
    // 使用已失效的角色对象调用 inRange，导致选择界面没有可完成的候选。
    if (!player.isIn() || !target.isIn()) return;
    const canHit = candidate => candidate?.isIn?.() && candidate !== player && (candidate === target || target.inRange(candidate));
    if (!game.hasPlayer(canHit)) return;
    const chosen = await player.chooseTarget("自由号令：可以对其或其攻击范围内的一名角色造成1点伤害",
     remoteChoice("(card, source, candidate) => { const commanded = _status.event.acCommanded; return commanded.isIn() && candidate.isIn() && candidate !== source && (candidate === commanded || commanded.inRange(candidate)); }"))
     .set("acCommanded", target).forResult();
    if (chosen?.bool && chosen.targets?.[0] && canHit(chosen.targets[0])) await chosen.targets[0].damage(1, player);
   }
  },
 },
 ac_forestwatch: {
  trigger: { player: "phaseBegin" }, direct: true,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "森林守望：至多两名角色摸一张牌并增加一点手牌上限", () => true, [1, 2]);
   if (!result.bool) return;
   player.logSkill("ac_forestwatch", result.targets);
   for (const target of result.targets) { target.addSkill("ac_forestwatch_hand"); target.addMark("ac_forestwatch_hand", 1, false); await target.draw(); }
  },
  subSkill: { hand: { charlotte: true, mark: true, marktext: "森", intro: { content: "手牌上限+#" }, mod: { maxHandcard: (player, num) => num + player.countMark("ac_forestwatch_hand") } } },
 },
 ac_kirajudgment: {
  enable: "phaseUse", usable: 1, position: "h", filterCard: true, selectCard: [0, Infinity], filterTarget: other,
  async content(event, trigger, player) {
   const target = event.target, n = event.cards.length;
   const options = ["翻面并摸牌"];
   if (target.countCards("he", card => lib.filter.cardDiscardable(card, target, "ac_kirajudgment")) >= n) options.unshift("弃牌并失去体力");
   const choice = await target.chooseControl(options).set("prompt", `基拉审判：弃${n}张牌并失去1点体力，或翻面并摸${n}张牌`).forResult();
   if (choice.control === "弃牌并失去体力") { if (n) await target.chooseToDiscard("he", n, true); await target.loseHp(); }
   else { await target.turnOver(); if (n) await target.draw(n); }
  }, ai: { order: 5, result: { target: -1 } },
 },
 ac_deathnote: {
  trigger: { player: "damageEnd" }, direct: true, filter: (event, player) => player.countCards("h") > 0,
  async content(event, trigger, player) {
   const result = await player.chooseCard("h", "死亡笔记：展示一张手牌").forResult();
   if (!result.bool) return;
   player.logSkill("ac_deathnote"); await player.showCards(result.cards);
   const source = trigger.source, type = get.type2(result.cards[0]);
   let paid = false;
   // 对方没有符合类别的手牌时，不能创建一个永远无法完成的弃牌选择。
   // 直接按“未能弃置”结算，避免濒死/死亡后留下卡住的等待事件。
   if (source?.isIn()) {
    const candidates = source.getCards("h", card => get.type2(card) !== type);
    if (candidates.length) {
     paid = (await source.chooseToDiscard("h", remoteChoice("card => get.type2(card) !== _status.event.acDeathnoteType"), "死亡笔记：弃置不同类别的手牌，否则其回复1点体力")
      .set("acDeathnoteType", type).forResult()).bool;
    }
   }
   if (!paid) await player.recover();
  },
 },
 ac_copyability: {
  trigger: { player: "phaseDrawBegin1" }, forced: true,
  async content(event, trigger, player) {
   const cards = get.cards(3); game.cardsGotoOrdering(cards); await player.showCards(cards, "复制能力");
   const eligible = cards.filter(card => get.number(card) <= 8);
   if (!eligible.length) return;
   const result = await player.chooseButton(["复制能力：可以获得点数不大于8的牌，并放弃摸牌", eligible], [1, eligible.length]).forResult();
   if (!result.bool) return;
   trigger.cancel(); await player.gain(result.links, "gain2");
   const chosen = await chooseTarget(player, "复制能力：随机获得一名其他角色的一张牌", (card, source, target) => target !== source && target.countGainableCards(source, "hej") > 0);
   if (chosen.bool) {
    const target = chosen.targets[0], pool = target.getGainableCards(player, "hej");
    if (pool.length) await player.gain(pool.randomGet(), target, "giveAuto");
   }
  },
 },
 ac_swallowrecycle: {
  trigger: { player: "phaseDiscardEnd" }, direct: true,
  filter: (event, player) => player.getHistory("lose", evt => evt.type === "discard" && evt.getParent("phaseDiscard") === event).flatMap(evt => evt.cards2 || []).filter(card => get.color(card, false) === "black").length >= 2,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "吞噬回收：选择下回合出牌阶段回收用牌的角色");
   if (result.bool) { player.logSkill("ac_swallowrecycle", result.targets); player.storage.ac_swallowrecycle_watch = { target: result.targets[0], turn: null, count: 0 }; player.addSkill("ac_swallowrecycle_watch"); }
  },
  subSkill: { watch: {
   charlotte: true, trigger: { global: ["phaseBegin", "phaseUseBegin", "cardsDiscardAfter", "phaseAfter"] }, forced: true, popup: false, onremove: true,
   filter(event, player) {
    const state = player.storage.ac_swallowrecycle_watch;
    if (!state) return false;
    if (event.name === "phase") return event.player === state.target;
    if (event.name === "phaseUse") return event.player === state.target && event.getParent("phase") === state.turn;
    const use = discardedUse(event);
    return use?.player === state.target && state.turn && use.getParent("phase") === state.turn && use.getParent("phaseUse")?.name === "phaseUse" && state.count < 3 && inDiscard(event.cards).some(card => use.cards.includes(card));
   },
   async content(event, trigger, player) {
    const state = player.storage.ac_swallowrecycle_watch;
    if (event.triggername === "phaseBegin") state.turn = trigger;
    else if (event.triggername === "phaseUseBegin") state.count = 0;
    else if (event.triggername === "phaseAfter") player.removeSkill("ac_swallowrecycle_watch");
    else { state.count++; const use = discardedUse(trigger); await player.gain(inDiscard(trigger.cards).filter(card => use.cards.includes(card)), "gain2"); }
   },
  } },
 },
 ac_whitepact: {
  trigger: { player: "phaseJieshuBegin" }, direct: true,
  async content(event, trigger, player) {
   const result = await chooseTarget(player, "白袍盟约：选择调整手牌的其他角色");
   if (result.bool) { player.logSkill("ac_whitepact", result.targets); player.storage.ac_whitepact_settle ||= []; player.storage.ac_whitepact_settle.push({ target: result.targets[0], own: false }); player.addSkill("ac_whitepact_settle"); }
  },
  subSkill: { settle: {
   charlotte: true, trigger: { global: "phaseAfter" }, forced: true, popup: false, onremove: true,
   async content(event, trigger, player) {
    const pending = player.storage.ac_whitepact_settle || [];
    for (const state of [...pending]) {
     if (!state.target.isIn()) { pending.splice(pending.indexOf(state), 1); continue; }
     if (!state.own && trigger.player === player) { state.own = true; await adjustHand(player, state.target); }
     else if (state.own && trigger.player === state.target) { await adjustHand(player, state.target); pending.splice(pending.indexOf(state), 1); }
    }
    if (!pending.length) player.removeSkill("ac_whitepact_settle");
   },
  } },
 },
 ac_warstock: {
  trigger: { player: "damageEnd", source: "damageSource" }, forced: true, mark: true, marktext: "略", intro: { content: "军略：#" },
  content(event, trigger, player) { player.addMark("ac_warstock", trigger.num); },
 },
 ac_alchemytactic: {
  trigger: { player: "phaseUseBegin" }, direct: true,
  async content(event, trigger, player) {
   const n = player.countMark("ac_warstock");
   const result = await chooseTarget(player, n % 2 ? "炼成战术：可以对一名角色造成1点伤害" : "炼成战术：可以令一名角色横置并弃置其区域里的一张牌", () => true);
   if (result.bool) {
    player.logSkill("ac_alchemytactic", result.targets); const target = result.targets[0];
    if (n % 2) await target.damage(1, player);
    else { if (!target.isLinked()) await target.link(true); if (target.countDiscardableCards(player, "hej")) await player.discardPlayerCard(target, "hej", true); }
   }
   if (player.countMark("ac_warstock") > 7 && (await player.chooseBool("炼成战术：移去全部军略，对所有其他角色造成1点伤害？").forResult()).bool) {
    player.removeMark("ac_warstock", player.countMark("ac_warstock"));
    for (const target of game.filterPlayer(target => target !== player)) if (target.isIn()) await target.damage(1, player);
   }
  },
 },
 ac_flamealchemy: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "fire",
  filter: (event, player) => player.countMark("ac_warstock") > 0 && game.hasPlayer(target => target.isLinked()),
  filterTarget: (card, player, target) => target.isLinked(), selectTarget: () => [1, _status.event.player.countMark("ac_warstock")], multitarget: true,
  async content(event, trigger, player) {
   player.awakenSkill("ac_flamealchemy"); player.removeMark("ac_warstock", player.countMark("ac_warstock"));
   for (const target of event.targets) if (target.isIn() && target.countCards("e")) await target.discard(target.getCards("e"));
   const targets = event.targets.filter(target => target.isIn());
   if (!player.isIn() || !targets.length) return;
   const result = await player.chooseTarget(true, "焰之炼金术：对其中一名角色造成1点火焰伤害",
    remoteChoice("(card, source, target) => target.isIn() && _status.event.acFlameTargets.includes(target)"))
    .set("acFlameTargets", targets).forResult();
   const target = result.targets?.[0];
   if (result.bool && player.isIn() && targets.includes(target) && target.isIn()) await target.damage(1, "fire", player);
  }, ai: { order: 7, result: { target: -1 } },
 },
 ac_forcebind: {
  trigger: { player: "useCardToPlayered" }, direct: true, group: "ac_forcebind_damage",
  filter: event => event.card.name === "sha" && event.target.hp > 0 && event.target.countCards("he") > 0,
  async content(event, trigger, player) {
   const target = trigger.target;
   const result = await player.choosePlayerCard(target, "he", [1, Math.max(1, target.hp)], "原力束缚：扣置至多其体力值张牌").forResult();
   if (!result.bool) return;
   player.logSkill("ac_forcebind", target);
   const move = target.addToExpansion(result.cards, "giveAuto"); move.gaintag.add("ac_forcebind_return"); await move;
   target.addSkill("ac_forcebind_return");
  },
  subSkill: {
   damage: { trigger: { source: "damageBegin1" }, forced: true, filter: (event, player) => event.card?.name === "sha" && event.player.countCards("h") <= player.countCards("h") && event.player.countCards("e") <= player.countCards("e"), content(event, trigger) { trigger.num++; } },
   return: {
    charlotte: true, mark: true, intro: { content: "expansion", markcount: "expansion" },
    trigger: { global: "phaseAfter" }, forced: true, popup: false,
    async content(event, trigger, player) { const cards = player.getExpansions("ac_forcebind_return"); if (cards.length) await player.gain(cards, "gain2"); player.removeSkill("ac_forcebind_return"); },
    onremove(player) { const cards = player.getExpansions("ac_forcebind_return"); if (cards.length) player.loseToDiscardpile(cards); },
   },
  },
 },
};
