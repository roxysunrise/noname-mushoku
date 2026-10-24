import { lib, game, get, ui, _status } from "noname";
// The nearest skill/card boundary owns the effect; a triggered skill may itself be inside a card.
const foreignSkillEffect = (event, player) => {
 let parent = event;
 for (let depth = 0; parent && depth < 40; depth++, parent = parent.getParent?.()) {
  if (parent.name === "useCard") return false;
  if ((parent.skill || lib.skill[parent.name]) && parent.player) return parent.player !== player;
 }
 return false;
};
const discardable = (card, player) => lib.filter.cardDiscardable(card, player, "ac_haodu");
const suits = cards => new Set(cards.map(card => get.suit(card, false)).filter(suit => ["heart", "diamond", "club", "spade"].includes(suit))).size;
const hasDamageNature = (event, nature) => (Array.isArray(event.nature) ? event.nature : String(event.nature || "").split(lib.natureSeparator || "|")).includes(nature);
const replayTargets = player => player.getStorage("ac_xuju");
const remoteChoice = source => get.infoFuncOL("_noname_func:" + source);
export default {
 ac_haodu: {
  enable: "phaseUse", usable: 1,
  filterTarget(card, player, target) { return target !== player; },
  async content(event, trigger, player) {
   const target = event.target;
   // Collect sealed choices before moving either player's cards (including zero-card bids).
   // Parse through the engine's injected scope, not optional debug globals.
   const results = await player.chooseCardOL([player, target], "he", [0, Infinity], true, "豪赌：秘密选择要弃置的牌，可选择零张", remoteChoice('(card, owner) => lib.filter.cardDiscardable(card, owner, "ac_haodu")'))
    .set("ai", remoteChoice("card => 4 - get.value(card)")).forResult();
   const chosen = [player, target].map((who, i) => [who, (results[i]?.cards || []).filter(card => who.getCards("he").includes(card) && discardable(card, who))]);
   const counts = chosen.map(([, cards]) => ({ count: cards.length, suits: suits(cards) }));
   if (chosen.some(([, cards]) => cards.length)) await game.loseAsync({ lose_list: chosen.filter(([, cards]) => cards.length) }).setContent("discardMultiple");
   const limit = Number(counts[0].count >= counts[1].count) + Number(counts[0].suits >= counts[1].suits);
   player.storage.ac_haodu_last = { count: counts[0].count, last: null };
   player.syncStorage("ac_haodu_last");
   const remaining = ["伤害", "摸牌"];
   for (let i = 0; i < limit && player.isIn(); i++) {
    const options = remaining.filter(option => option !== "伤害" || target.isIn());
    if (!options.length) break;
    const result = await player.chooseControl([...options, "cancel2"]).set("prompt", `豪赌：还可依次执行${limit - i}项（伤害：对目标造成1点伤害；摸牌：自己摸三张牌）`)
     .set("acHaoduPreferred", options.includes("伤害") && get.attitude(player, target) < 0 ? "伤害" : "摸牌")
     .set("ai", remoteChoice("() => _status.event.acHaoduPreferred")).forResult();
    if (!options.includes(result.control)) break;
    remaining.splice(remaining.indexOf(result.control), 1);
    player.storage.ac_haodu_last.last = result.control === "伤害" ? "damage" : "draw";
    player.syncStorage("ac_haodu_last");
    if (result.control === "伤害") await target.damage(1, player);
    else await player.draw(3);
   }
  },
  ai: { order: 6, result: { player: 1, target: -1 } },
 },
 ac_xuju: {
  trigger: { player: "phaseJieshuBegin" }, direct: true,
  mark: true, marktext: "续", intro: { content: "已续局角色：$" },
  filter(event, player) {
   const last = player.storage.ac_haodu_last;
   return !!last?.last && player.countCards("he", card => lib.filter.cardDiscardable(card, player, "ac_xuju")) >= last.count && game.hasPlayer(target => target.isDamaged() && !replayTargets(player).includes(target));
  },
  async content(event, trigger, player) {
   const last = { ...player.storage.ac_haodu_last };
   const result = await player.chooseTarget(`续局：弃置${last.count}张牌，令一名已受伤且未续局的角色${last.last === "draw" ? "摸三张牌" : "受到你造成的1点伤害"}`, (card, source, target) => target.isDamaged() && !source.getStorage("ac_xuju").includes(target))
    .set("acXujuDraw", last.last === "draw").set("ai", remoteChoice("target => get.attitude(_status.event.player, target) * (_status.event.acXujuDraw ? 1 : -1)")).forResult();
   if (!result.bool) return;
   if (last.count > 0) {
    const paid = await player.chooseToDiscard("he", last.count, true, "续局：支付弃牌费用").forResult();
    if (!paid.bool || paid.cards?.length !== last.count) return;
   }
   const target = result.targets[0];
   player.logSkill("ac_xuju", target);
   player.markAuto("ac_xuju", [target]);
   if (!target.isIn()) return;
   if (last.last === "draw") await target.draw(3);
   else await target.damage(1, player);
  },
 },
 ac_zhangyan: {
  enable: "phaseUse", usable: 1, position: "he", filterCard: true,
  filter(event, player) { return player.countCards("he") > 0 && game.hasPlayer(target => target !== player && target.countCards("h") > 0); },
  filterTarget(card, player, target) { return target !== player && target.countCards("h") > 0; },
  async content(event, trigger, player) {
   const target = event.target;
   if (player.countCards("h")) await target.viewHandcards(player);
   if (!target.isIn() || !target.countCards("h")) return;
   await player.viewHandcards(target);
   await player.gainPlayerCard(target, "h", true, "visible");
  },
  ai: { order: 8, result: { target: -1 } },
 },
 ac_tuiyan: {
  enable: "phaseUse",
  filter(event, player) { return !player.hasSkill("ac_tuiyan_draw") || (!player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game.hasPlayer(target => target !== player)); },
  async content(event, trigger, player) {
   const choices = [];
   if (!player.hasSkill("ac_tuiyan_draw")) choices.push("补充手牌");
   if (!player.hasSkill("ac_tuiyan_give") && player.countCards("h") > player.hp && game.hasPlayer(target => target !== player)) choices.push("交付手牌");
   if (!choices.length) return;
   const result = await player.chooseControl(choices).set("prompt", "推演：每项每出牌阶段限一次").set("ai", remoteChoice("() => _status.event.controls[0]")).forResult();
   if (result.control === "补充手牌") {
    player.addTempSkill("ac_tuiyan_draw", { player: "phaseUseAfter" });
    await player.drawTo(player.maxHp);
   } else if (result.control === "交付手牌") {
    const num = player.countCards("h") - player.hp;
    if (num <= 0) return;
    const selected = await player.chooseTarget("推演：选择接收手牌的其他角色", true, (card, source, target) => target !== source).set("ai", remoteChoice("target => get.attitude(_status.event.player, target)")).forResult();
    if (!selected.bool) return;
    const given = await player.chooseToGive(selected.targets[0], "h", num, true).forResult();
    if (given.bool) player.addTempSkill("ac_tuiyan_give", { player: "phaseUseAfter" });
   }
  },
  ai: { order: 0.5, result: { player: 1 } },
  subSkill: {
   draw: { charlotte: true, mark: true, marktext: "演", intro: { content: "本出牌阶段不能对其他角色使用牌。" }, mod: { playerEnabled(card, player, target) { if (target !== player) return false; } } },
   give: { charlotte: true },
  },
 },
 mc_fengcang: {
  zhuanhuanji: true, locked: true, forced: true,
  mark: true, marktext: "锋", intro: { content(storage) { return storage ? "阴：其他角色至你的距离+1；不能响应其他角色的红色杀。" : "阳：你至其他角色的距离-1；黑色杀不可响应。"; } },
  trigger: { player: ["phaseZhunbeiBegin", "phaseJieshuBegin"] },
  async content(event, trigger, player) {
   const yin = trigger.name === "phaseJieshu";
   if (!!player.storage.mc_fengcang !== yin) player.changeZhuanhuanji("mc_fengcang");
  },
  mod: {
   globalFrom(from, to, distance) { if (!from.storage.mc_fengcang) return distance - 1; },
   globalTo(from, to, distance) { if (to.storage.mc_fengcang) return distance + 1; },
  },
  group: ["mc_fengcang_black", "mc_fengcang_red"],
  subSkill: {
   black: { charlotte: true, forced: true, trigger: { player: "useCard" }, filter(event, player) { return !player.storage.mc_fengcang && event.card.name === "sha" && get.color(event.card) === "black"; }, async content(event, trigger) { trigger.directHit.addArray(game.players); } },
   red: { charlotte: true, forced: true, trigger: { target: "useCardToTargeted" }, filter(event, player) { return !!player.storage.mc_fengcang && event.player !== player && event.card.name === "sha" && get.color(event.card) === "red"; }, async content(event, trigger, player) { trigger.getParent().directHit.add(player); } },
  },
 },
 mc_xiejia: {
  trigger: { source: "damageBegin2" },
  filter(event, player) { return event.player !== player && event.num > 0 && event.player.countGainableCards(player, "e") > 0; },
  check(event, player) { return event.num > 1 || get.attitude(player, event.player) > 0 || event.player.countCards("e") > 0; },
  async content(event, trigger, player) {
   trigger.num--;
   await player.gainPlayerCard(trigger.player, "e", true);
  },
 },
 mc_rongzhu: {
  enable: "chooseToUse", position: "hes", selectCard: 1,
  filterCard(card) { return get.type(card) === "equip"; }, viewAs: { name: "jiu" },
  viewAsFilter(player) { return player.countCards("hes", card => get.type(card) === "equip") > 0; },
  check(card) { return 6 - get.value(card); },
  mod: { maxHandcard(player, num) { return num + player.countCards("e"); } },
  ai: { order: 5 },
 },
 ac_life: {
  mark: true, marktext: "命", intro: { content: "命：#/∞。每回合首次使用【杀】造成伤害后摸一张牌；可抵消一次致命伤害。" },
  init(player) { if (!player.storage.ac_life_init) { player.storage.ac_life_init = true; player.addMark("ac_life", 2); } },
  trigger: { player: "damageBegin4", global: "dieAfter" }, forced: true,
  filter(event, player) { if (event.name === "die") return event.source === player && event.player !== player; const armor = event.nohujia || player.hasSkillTag?.("nohujia") ? 0 : player.hujia || 0; return event.num > 0 && event.num >= player.hp + armor && player.countMark("ac_life") > 0; },
  async content(event, trigger, player) { if (trigger.name === "die") player.addMark("ac_life", 1); else if ((await player.chooseBool("命数：移去1枚命，防止此次伤害？").set("ai", () => true).forResult()).bool) { player.removeMark("ac_life", 1); trigger.cancel(); } },
  group: "ac_life_draw",
  subSkill: { draw: { charlotte: true, trigger: { source: "damageSource" }, usable: 1, forced: true, filter(event, player) { return event.card?.name === "sha" && event.getParent("useCard")?.player === player; }, async content(event, trigger, player) { await player.draw(); } } },
 },
 ac_river: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "purple",
  filter(event, player) { return player.countMark("ac_life") > 0; },
  async content(event, trigger, player) { const x = player.countMark("ac_life"); player.awakenSkill("ac_river"); player.removeMark("ac_life", x); player.storage.ac_river_bonus = x; await player.draw(x); player.addTempSkill("ac_river_effect", { player: "phaseBegin" }); player.addTempSkill("ac_river_guard", { player: "phaseBegin" }); player.addSkill("ac_river_permanent"); },
  subSkill: {
   effect: { charlotte: true, onremove(player) { delete player.storage.ac_river_bonus; }, mod: { targetEnabled(card, source, target) { if (source !== target) return false; } }, trigger: { source: "damageBegin1" }, forced: true, filter(event) { return event.num > 0; }, content(event, trigger, player) { trigger.num += player.storage.ac_river_bonus || 0; } },
   guard: { charlotte: true, trigger: { player: ["damageBefore", "loseHpBefore", "loseMaxHpBefore"] }, forced: true, priority: 100, filter: foreignSkillEffect, content(event, trigger) { trigger.cancel(); } },
   permanent: { charlotte: true, trigger: { source: "damageSource" }, direct: true, filter(event, player) { return !player.hasSkill("ac_river_used") && event.num > 0 && event.card?.name === "sha" && event.getParent("useCard")?.player === player && _status.currentPhase === player && event.player?.isIn() && event.player.maxHp > 2; }, async content(event, trigger, player) { const target = trigger.player; if (!(await player.chooseBool("死河：是否令受伤角色减少1点体力上限？").set("ai", remoteChoice("() => get.attitude(_status.event.player, _status.event.getTrigger().player) < 0")).forResult()).bool) return; if (target.isIn() && target.maxHp > 2) { player.addTempSkill("ac_river_used", { global: "phaseAfter" }); player.logSkill("ac_river", target); await target.loseMaxHp(1); } } },
   used: { charlotte: true },
  },
 },
 ac_jackal: {
  mod: { cardUsable(card, player, num) { if (card.name === "sha") return num + 1; }, targetInRange(card) { if (card.name === "sha") return true; } },
  trigger: { player: "useCard2" }, direct: true,
  filter(event, player) { return !player.hasSkill("ac_jackal_used") && _status.currentPhase === player && event.card?.name === "sha" && event.targets?.some(target => target.isIn()); },
  async content(event, trigger, player) {
   const use = trigger;
   const targets = (use.targets || []).filter(target => target.isIn());
   if (!targets.length) return;
   const result = await player.chooseTarget("豺狼：选择此杀的一名目标，其须使用两张【闪】抵消", remoteChoice("(card, source, target) => target.isIn() && _status.event.acJackalTargets.includes(target)"))
    .set("acJackalTargets", targets).set("ai", remoteChoice("target => get.attitude(_status.event.player, target) < 0 ? 1 : 0")).forResult();
   const target = result.targets?.[0];
   if (!result.bool || !targets.includes(target) || !target.isIn()) return;
   player.addTempSkill("ac_jackal_used", { global: "phaseAfter" }); player.logSkill("ac_jackal", target);
   const args = (use.customArgs ??= {}), targetArgs = (args[target.playerid] ??= {});
   targetArgs.shanRequired = Math.max(2, targetArgs.shanRequired ?? 1);
  },
  subSkill: { used: { charlotte: true } },
 },
 ac_observe: {
  locked: true, forced: true,
  trigger: { target: "useCardToTargeted" },
  filter(event, player) { return !player.hasSkill("ac_observe_draw") && (event.card?.name === "sha" || get.type(event.card) === "trick"); },
  async content(event, trigger, player) { if ((await player.chooseBool("命运探知：摸一张牌？").set("ai", () => true).forResult()).bool) { player.addTempSkill("ac_observe_draw", { global: "phaseAfter" }); await player.draw(); } },
  subSkill: { draw: { charlotte: true } },
 },
 ac_mail: {
  locked: true,
  mod: { targetEnabled(card) { if (get.type(card) === "delay") return false; } },
  group: ["ac_mail_gain", "ac_mail_replace", "ac_mail_guard"],
  subSkill: {
   guard: { charlotte: true, forced: true, trigger: { global: "executeDelayCardEffect" }, filter(event, player) { return event.target === player && get.type(event.card) === "delay"; }, content(event, trigger) { trigger.cancel(); } },
   gain: { charlotte: true, trigger: { global: "judgeEnd" }, forced: true,
    filter(event) { return !!event.result?.card && get.position(event.result.card, true) === "o"; },
    async content(event, trigger, player) { await player.gain(trigger.result.card, "gain2"); },
   },
   replace: { charlotte: true, trigger: { global: "judge" }, direct: true, filter(event, player) { return event.player !== player && player.countCards("h") > 0; }, async content(event, trigger, player) {
   const result = await player.chooseCard("Dmail：可打出一张手牌替代其他角色的判定牌", "h").forResult();
   if (!result.bool) return;
   player.logSkill("ac_mail", trigger.player);
   const response = player.respond({ cards: result.cards, skill: "ac_mail", highlight: true, noOrdering: true });
   await response;
   if (!response.cards?.length) return;
   const old = trigger.player.judging[0];
   game.broadcastAll(card => { card.clone?.classList.remove("thrownhighlight"); }, old);
   await game.cardsDiscard(old);
   trigger.player.judging[0] = response.cards[0];
   trigger.orderingCards.addArray(response.cards);
  }, ai: { rejudge: true, tag: { rejudge: 1 } } },
  },
 },
 ac_worldline: {
  trigger: { player: "dying" }, limited: true, skillAnimation: true, animationColor: "blue",
  async content(event, trigger, player) {
   player.awakenSkill("ac_worldline"); await player.recoverTo(2);
   for (const target of game.filterPlayer()) { const cards = target.getCards("ej"); if (cards.length) await target.discard(cards); }
   const living = game.filterPlayer(target => target.isIn()).sortBySeat(player);
   // Draw only N+2 cards, then give one of these cards to each other survivor.
   const drawn = await player.draw(living.length + 2).forResult();
   const cards = (drawn?.cards || []).filter(card => player.getCards("h").includes(card));
   // The first card is already held by Okabe; the remaining two also stay with him.
   for (let i = 1; i < living.length && cards.length > 1; i++) if (living[i].isIn()) await player.give(cards.splice(1, 1), living[i]);
   player.storage.ac_worldline_turns = 2;
   player.storage.ac_worldline_counting = false;
   player.disableSkill("ac_worldline", "ac_mail"); player.addSkill("ac_worldline_restore");
  },
  subSkill: { restore: { charlotte: true, group: "ac_worldline_start", trigger: { player: "phaseAfter" }, forced: true, popup: false, async content(event, trigger, player) {
   // Do not count the turn in which the jump was activated.
   if (!player.storage.ac_worldline_counting) { player.storage.ac_worldline_counting = true; return; }
   if (--player.storage.ac_worldline_turns <= 0) { player.enableSkill("ac_worldline"); player.removeSkill("ac_worldline_restore"); }
  } }, start: { charlotte: true, trigger: { player: "phaseBegin" }, forced: true, popup: false, content(event, trigger, player) { player.storage.ac_worldline_counting = true; } } },
 },
 ac_zhikong: { locked: true, mod: { targetInRange(card) { if (card.name === "sha") return true; }, globalTo(from, to, distance) { return distance + 1; } } },
 ac_youji: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: true, filter(event, player) { return player.countCards("he") > 0 && game.hasPlayer(target => target !== player && target.countCards("h") > 0); }, filterTarget(card, player, target) { return target !== player && target.countCards("h") > 0; }, async content(event, trigger, player) { const target = event.target; if (!target.isIn() || !target.countCards("h")) return; await player.viewHandcards(target); if (!target.isIn() || !target.countCards("h")) return; await player.discardPlayerCard(target, "h", true, "visible"); }, ai: { order: 5, result: { target: -1 } } },
 ac_guibi: { trigger: { target: "useCardToTargeted" }, usable: 1, filter(event, player) { return event.card?.name === "sha" && player.countCards("he") > 0; }, async cost(event, trigger, player) { event.result = await player.chooseToDiscard("he", "规避：弃置一张牌，令此杀对你无效").set("chooseonly", true).set("ai", remoteChoice("card => 6 - get.value(card)")).forResult(); }, async content(event, trigger, player) { await player.discard(event.cards); trigger.getParent().excluded.add(player); } },
 ac_sijian: {
  trigger: { player: ["loseAfter", "dying"], global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"] }, usable: 2,
  filter(event, player) {
   if (event.name === "dying") return true;
   const lost = event.getl?.(player);
   return player.countCards("h") === 0 && !!lost?.hs?.length;
  },
  async cost(event, trigger, player) {
   event.result = { bool: false };
   const canDiscard = game.hasPlayer(target => target !== player && target.isIn());
   const canDraw = !!_status.currentPhase?.isIn();
   if (!canDiscard && !canDraw) return;
   const count = player.storage.ac_sijian_backwater || 0;
   const controls = [];
   if (canDiscard) controls.push("选项一");
   if (canDraw) controls.push("选项二");
   if (controls.length && !game.hasPlayer(target => target.isDying?.())) controls.push("背水！");
   controls.push("cancel2");
   const result = await player.chooseControl({
    controls,
    choiceList: [
     "选择一名其他角色，其使用下一张牌后需弃置一张牌",
     "令当前回合角色摸两张牌",
     `背水！执行上述所有选项，然后失去${count}点体力`,
    ],
    prompt: `死谏：选择一项；背水执行全部选项，然后失去${count}点体力`,
   }).forResult();
   if (typeof result?.control === "string" && result.control !== "cancel2" && controls.includes(result.control)) {
    event.result = { bool: true, cost_data: result.control };
   }
  },
  async content(event, trigger, player) {
   const control = event.cost_data;
   const backwater = control === "背水！";
   const count = player.storage.ac_sijian_backwater || 0;
   if (backwater) player.storage.ac_sijian_backwater = count + 1;
   if ((control === "选项一" || backwater) && player.isIn() && game.hasPlayer(target => target !== player && target.isIn())) {
    const chosen = await player.chooseTarget("死谏：选择一名其他角色，其使用下一张牌后需弃置一张牌", true, (card, owner, target) => target !== owner && target.isIn())
     .set("ai", remoteChoice("target => -get.attitude(_status.event.player, target)")).forResult();
    const target = chosen.targets?.[0];
    if (chosen.bool && target !== player && target?.isIn()) { target.addSkill("ac_sijian_discard"); target.addMark("ac_sijian_discard", 1, false); }
   }
   if ((control === "选项二" || backwater) && player.isIn()) {
    const current = _status.currentPhase;
    if (current?.isIn()) await current.draw(2);
   }
   if (backwater && count > 0 && player.isIn()) await player.loseHp(count);
  },
  subSkill: { discard: { charlotte: true, forced: true, popup: false, onremove: true, trigger: { player: "useCardAfter" }, async content(event, trigger, player) { const count = player.countMark("ac_sijian_discard"); player.removeSkill("ac_sijian_discard"); for (let i = 0; i < count && player.countCards("he") > 0; i++) await player.chooseToDiscard("he", 1, true, "死谏：弃置一张牌"); } } },
 },
 ac_zhuangjia: { locked: true, trigger: { player: "damageBegin4" }, forced: true, filter: event => event.num > 0, async content(event, trigger) { trigger.num = Math.max(1, trigger.num - 1); }, mod: { maxHandcard(player, num) { return num + 2; } } },
 ac_paoji: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: card => get.type(card) === "equip", filter(event, player) { return player.countCards("he", card => get.type(card) === "equip") > 0; }, filterTarget(card, player, target) { return target !== player; }, async content(event, trigger, player) { if (event.target.isIn()) await event.target.damage(1, player); }, ai: { order: 6, result: { target: -1 } } },
 ac_gushou: { enable: "phaseUse", usable: 1, position: "he", selectCard: 1, filterCard: true, async content(event, trigger, player) { player.addTempSkill("ac_gushou_buff", { player: "phaseBegin" }); }, ai: { order: 3, result: { player: 1 } }, subSkill: { buff: { charlotte: true, mark: true, marktext: "守", intro: { content: "其他角色计算与你的距离+1；成为杀的目标时摸一张牌。" }, mod: { globalTo(from, to, distance) { return distance + 1; } }, trigger: { target: "useCardToTargeted" }, forced: true, filter(event, player) { return event.card?.name === "sha"; }, async content(event, trigger, player) { await player.draw(); } } } },
 mc_jinshen: { enable: "phaseUse", position: "h", filterCard: true, viewAs: { name: "sha" }, check: card => 5 - get.value(card), ai: { order: 5 }, mod: { attackRange(player, range) { return range + 3; } } },
 mc_huanxue: {
  enable: "phaseUse", usable: 1,
  filter(event, player) { return player.hp > 0; },
  async content(event, trigger, player) {
   await player.loseHp();
   if (!player.isIn()) return;
   player.addTempSkill("mc_huanxue_buff", { global: "phaseAfter" });
  },
  ai: { order: 3, result: { player: 1 } },
  subSkill: { buff: {
   charlotte: true, trigger: { player: "useCard1" }, forced: true,
   filter(event) { return event.card?.name === "sha"; },
   async content(event, trigger, player) {
    trigger.baseDamage = (typeof trigger.baseDamage === "number" ? trigger.baseDamage : 1) + 1;
    player.removeSkill("mc_huanxue_buff");
   },
  } },
 },
 mc_lianji: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "orange",
  filterTarget(card, player, target) { return target !== player; },
  async content(event, trigger, player) {
   player.awakenSkill("mc_lianji");
   player.storage.mc_lianji = { target: event.target, remaining: 2 };
   player.addSkill("mc_lianji_dot");
   player.addSkill("mc_lianji_ondeath");
   player.addSkill("mc_lianji_nodraw");
  },
  subSkill: {
   dot: {
    charlotte: true, trigger: { player: "phaseBegin" }, forced: true, popup: false,
    async content(event, trigger, player) {
     const state = player.storage.mc_lianji;
     if (!state || !player.isIn()) return;
     state.remaining--;
     if (state.target?.isIn()) {
      player.logSkill("mc_lianji", state.target);
      await state.target.damage(1, player);
     }
     if (state.remaining <= 0) {
      delete player.storage.mc_lianji;
      player.removeSkill("mc_lianji_dot");
      player.removeSkill("mc_lianji_ondeath");
     }
    },
   },
   ondeath: {
    charlotte: true, trigger: { player: "dieAfter" }, forced: true, forceDie: true, popup: false,
    async content(event, trigger, player) {
     delete player.storage.mc_lianji;
     player.removeSkill("mc_lianji_dot");
     player.removeSkill("mc_lianji_ondeath");
     player.removeSkill("mc_lianji_nodraw");
    },
   },
   nodraw: {
    charlotte: true, trigger: { player: "phaseBegin" }, forced: true, popup: false,
    async content(event, trigger, player) { player.skip("phaseDraw"); player.removeSkill("mc_lianji_nodraw"); },
   },
  },
 },
};
