import { lib, game, get, _status } from "noname";
const attack = event => event.card?.name === "sha";
const level = player => Math.min(4, player.countMark("mt_study"));
const skills = {
 mt_voiceless: {
  enable: "phaseUse", usable: 1, position: "h",
  filterCard: card => get.type(card) === "basic" || get.type2(card) === "trick",
  viewAs: { name: "sha", nature: "fire" },
  check: card => 6 - get.value(card),
  ai: { order: 5 },
  group: "mt_voiceless_draw",
  subSkill: { draw: {
   trigger: { source: "damageSource" }, direct: true,
   filter: event => event.num > 0 && event.getParent("useCard")?.skill === "mt_voiceless" && event.cards?.some(card => get.type2(card, false) === "trick"),
   async content(event, trigger, player) {
    const result = await player.chooseTarget("无咏：可以令一名角色摸一张牌", (card, source, target) => target.isIn()).set("ai", target => get.attitude(player, target)).forResult();
    if (result.bool) { player.logSkill("mt_voiceless", result.targets); await result.targets[0].draw(); }
   },
  } },
 },
 mt_foresight: {
  trigger: { target: "useCardToTargeted" }, usable: 1,
  filter: (event, player) => event.player !== player && (attack(event) || (player.hp <= 2 && get.type2(event.card) === "trick" && get.tag(event.card, "damage"))),
  async cost(event, trigger, player) { event.result = await player.chooseToDiscard("he", "预见：弃置一张牌，令此牌对你无效").set("ai", card => 7 - get.value(card)).set("chooseonly", true).forResult(); },
  async content(event, trigger, player) { await player.discard(event.cards); trigger.getParent().excluded.add(player); },
 },
 mt_study: {
  trigger: { player: "phaseJieshuBegin" }, forced: true,
  filter: (event, player) => level(player) < 4 && player.getHistory("useCard", evt => get.type2(evt.card) === "trick").length > 0,
  async content(event, trigger, player) { player.addMark("mt_study", 1); if (level(player) === 2 || level(player) === 4) await player.draw(); },
  marktext: "研", intro: { content: "mark", name: "研习（上限4）" },
  mod: { maxHandcard(player, num) { return num + Math.floor(level(player) / 2); } },
 },
 mt_water: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1,
  filterCard: card => get.color(card) === "black",
  filterTarget: (card, player, target) => target !== player,
  check: card => 6 - get.value(card),
  async content(event, trigger, player) {
   const target = event.target;
   const count = level(player) >= 2 ? 2 : 1;
   const result = await target.chooseToDiscard(count, "he", `水术：弃置${count}张牌，否则受到1点${level(player) === 4 ? "雷电" : "普通"}伤害`).set("ai", card => 7 - get.value(card)).forResult();
   if (!result.bool) { if (level(player) === 4) await target.damage(1, player, "thunder"); else await target.damage(1, player); }
  },
  ai: { order: 6, result: { target: -1 } },
 },
 mt_mentor: {
  trigger: { global: "useCardAfter" }, round: 1,
  filter: (event, player) => attack(event) && event.player !== player && event.player === _status.currentPhase && event.player.isIn(),
  check: (event, player) => get.attitude(player, event.player) > 0,
  async content(event, trigger, player) {
   const bonus = trigger.player.getHistory("useCard", evt => get.type(evt.card) === "trick").length > 0;
   await trigger.player.draw();
   if (bonus && player.isIn()) await player.draw();
  },
 },
 mt_heal: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: card => get.color(card) === "red",
  filterTarget: (card, player, target) => target.isDamaged(),
  check: card => 7 - get.value(card),
  async content(event, trigger, player) { await event.target.recover(); if (get.type2(event.cards[0]) === "trick" && player.isIn()) await player.draw(); },
  ai: { order: 7, result: { target: 2 } },
 },
 mt_guard: {
  trigger: { global: "damageBegin4" }, usable: 1,
  filter: (event, player) => event.player !== player && event.player.isIn() && player.countCards("he") > 0 && event.num > 0,
  async cost(event, trigger, player) {
   const good = get.attitude(player, trigger.player) > 0;
   event.result = await player.chooseToDiscard("he", "守护：弃置一张牌，令此次伤害-1").set("chooseonly", true).set("ai", card => good ? 6 - get.value(card) : 0).forResult();
  },
  async content(event, trigger, player) { await player.discard(event.cards); trigger.num--; },
 },
 mt_sword: {
  trigger: { player: "useCardToPlayered" }, usable: 1,
  filter: (event, player) => attack(event) && player.isPhaseUsing() && event.targets.length === 1 && player.hp > 0,
  check: (event, player) => player.hp > 1 && get.attitude(player, event.target) < 0,
  async content(event, trigger, player) { await player.loseHp(); trigger.getParent().directHit.add(trigger.target); },
 },
 mt_resolve: {
  trigger: { player: "phaseJieshuBegin" },
  filter: (event, player) => player.getHistory("sourceDamage").length > 0,
  frequent: true, async content(event, trigger, player) { await player.draw(player.hp <= 2 ? 2 : player.getHistory("sourceDamage").reduce((sum, evt) => sum + evt.num, 0)); },
 },
 mt_dragon: {
  init(player) { if (!player.storage.mt_dragon_initialized) { player.storage.mt_dragon_initialized = true; player.addMark("mt_dragon", 3); } },
  marktext: "龙", intro: { content: "mark", name: "龙力（上限3）" },
  mod: { targetInRange(card) { if (card.name === "sha") return true; } },
  group: ["mt_dragon_strike", "mt_dragon_defend", "mt_dragon_rest"],
  subSkill: {
   rest: {
    trigger: { player: "phaseJieshuBegin" }, forced: true,
    filter: (event, player) => player.countMark("mt_dragon") < 3 && player.getHistory("sourceDamage").length === 0,
    async content(event, trigger, player) { player.addMark("mt_dragon", 1); },
   },
   strike: {
    trigger: { source: "damageBegin1" }, usable: 1,
    filter: (event, player) => attack(event) && player.isPhaseUsing() && event.player !== player && player.countMark("mt_dragon") > 0,
    check: (event, player) => get.attitude(player, event.player) < 0,
    async content(event, trigger, player) { player.removeMark("mt_dragon", 1); trigger.num++; },
   },
   defend: {
    trigger: { player: "damageBegin4" }, usable: 1,
    filter: (event, player) => event.num > 0 && player.countMark("mt_dragon") > 0,
    check: event => event.num > 0,
    async content(event, trigger, player) { player.removeMark("mt_dragon", 1); trigger.num--; },
   },
  },
 },
 mt_dragonlord: {
  zhuSkill: true, trigger: { player: "phaseZhunbeiBegin" }, forced: true,
  filter: (event, player) => player.identity === "zhu" && player.hasZhuSkill("mt_dragonlord"),
  async content(event, trigger, player) {
   if (player.countMark("mt_dragon") < 3) player.addMark("mt_dragon", 1);
   const result = await player.chooseTarget("龙盟：可令一名其他幻或神势力角色摸一张牌，然后你摸一张牌", (card, source, target) => target !== source && ["huan", "shen"].includes(target.group)).set("ai", target => get.attitude(player, target)).forResult();
   if (result.bool) { await result.targets[0].draw(); if (player.isIn()) await player.draw(); }
  },
 },
 mt_eye: { mod: { globalFrom(from, to, distance) { return distance - (from.hp <= 2 ? 2 : 1); } } },
 mt_protect: {
  trigger: { global: "damageEnd" }, usable: 1,
  filter: (event, player) => event.player !== player && event.player.isIn() && event.player.hp <= player.hp && player.countCards("he") > 0,
  async cost(event, trigger, player) { const good = get.attitude(player, trigger.player) > 0; event.result = await player.chooseToDiscard("he", "护幼：弃置一张牌，令受伤角色体力大于1时摸两张牌，否则回复1点体力并摸一张牌").set("chooseonly", true).set("ai", card => good ? 7 - get.value(card) : 0).forResult(); },
  async content(event, trigger, player) {
   await player.discard(event.cards);
   if (!trigger.player.isIn()) return;
   if (trigger.player.hp > 1) await trigger.player.draw(2);
   else { await trigger.player.recover(); if (trigger.player.isIn()) await trigger.player.draw(); }
  },
 },
 mt_spear: {
  enable: "phaseUse", usable: 1,
  filter(event, player) { return game.hasPlayer(target => target !== player && player.canUse({ name: "sha", isCard: true }, target, undefined, false)); },
  filterTarget(card, player, target) { return target !== player && player.canUse({ name: "sha", isCard: true }, target, undefined, false); },
  async content(event, trigger, player) {
   if (!event.target.isIn() || !player.canUse({ name: "sha", isCard: true }, event.target, undefined, false)) return;
   const use = player.useCard({ name: "sha", isCard: true }, event.target, false);
   if (player.hp <= 1) use.directHit = [event.target];
   await use;
  },
  ai: { order: 6, result: { target: -1 } },
 },
 mt_styles: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: true,
  check: card => 5 - get.value(card),
  async content(event, trigger, player) { const type = get.type2(event.cards[0]); if (type === "basic") await player.draw(2); else if (type === "equip") await player.recover(); else player.addTempSkill("mt_styles_range", "phaseUseAfter"); },
  ai: { order: 4, result: { player: 1 } },
  subSkill: { range: { charlotte: true, mod: { cardUsable(card, player, num) { if (card.name === "sha") return num + 1; }, targetInRange(card) { if (card.name === "sha") return true; } } } },
 },
 mt_rescue: {
  trigger: { global: "dying" }, round: 1,
  filter: (event, player) => event.player !== player && event.player.isIn() && event.player.hp <= 0 && player.hp > 1,
  check: (event, player) => get.attitude(player, event.player) > 0,
  async content(event, trigger, player) {
   await player.loseHp();
   const target = trigger.player;
   if (!target.isIn()) return;
   await target.recover();
   if (!player.isIn() || !target.isIn() || target.maxHp >= player.maxHp) return;
   const result = await player.chooseBool("救援：将你的1点体力上限转移给该角色，然后摸一张牌？").set("ai", () => player.maxHp > 2 && get.attitude(player, target) > 0).forResult();
   if (result.bool) { await player.loseMaxHp(); if (target.isIn()) await target.gainMaxHp(); if (player.isIn()) await player.draw(); }
  },
 },
 mt_swordking: {
  trigger: { source: "damageBegin1" }, usable: 1,
  filter: (event, player) => attack(event) && player.isPhaseUsing() && event.player.hp >= player.hp && event.player !== player,
  forced: true, async content(event, trigger) { trigger.num++; },
 },
 mt_training: {
  trigger: { player: "phaseZhunbeiBegin" }, usable: 1,
  filter: (event, player) => player.countCards("he") > 0 && game.hasPlayer(target => target !== player && !target.hasSkill("mt_training_intent")),
  async cost(event, trigger, player) {
   const discard = await player.chooseToDiscard("he", "授剑：弃置一张牌，授予一名其他角色剑意").set("chooseonly", true).forResult();
   if (!discard.bool) { event.result = { bool: false }; return; }
   const target = await player.chooseTarget("授剑：选择一名没有剑意的其他角色", (card, source, target) => target !== source && !target.hasSkill("mt_training_intent")).set("ai", target => get.attitude(player, target)).forResult();
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
   charlotte: true, mark: true, marktext: "剑", intro: { content: "下个回合第一张杀伤害+1；造成伤害后授予者摸一张牌。不叠加。" },
   onremove: true, forced: true, popup: false,
   trigger: { player: ["phaseBegin", "useCard1"], source: ["damageBegin1", "damageSource"] },
   filter(event, player) {
    const state = player.storage.mt_training_intent;
    if (!state) return false;
    if (event.name === "phase") return true;
    if (event.name === "useCard") return state.active && !state.card && attack(event);
    return !!state.card && event.card === state.card && (event.name === "damage") && (event.num > 0);
   },
   async content(event, trigger, player) {
    const state = player.storage.mt_training_intent;
    if (trigger.name === "phase") state.active = true;
    else if (trigger.name === "useCard") state.card = trigger.card;
    else if (event.triggername === "damageBegin1") trigger.num++;
    else if (!state.rewarded) { state.rewarded = true; if (state.teacher.isIn()) await state.teacher.draw(); }
   },
  } },
 },
 mt_ghislaine_guard: {
  trigger: { player: "damageBegin4" }, usable: 1,
  filter: event => event.num > 0,
  check: (event, player) => player.hp > 1 || event.num > 1,
  async content(event, trigger, player) { trigger.cancel(); await player.loseHp(); if (player.isIn()) await player.draw(2); },
 },
};
export default skills;
