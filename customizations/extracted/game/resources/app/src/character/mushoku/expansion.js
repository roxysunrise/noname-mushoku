import { lib, game, get, _status } from "noname";
const discardable = (card, player) => lib.filter.cardDiscardable(card, player, "ac_haodu");
const suits = cards => new Set(cards.map(card => get.suit(card, false)).filter(suit => ["heart", "diamond", "club", "spade"].includes(suit))).size;
const replayTargets = player => player.getStorage("ac_xuju");
export default {
 ac_haodu: {
  enable: "phaseUse", usable: 1,
  filterTarget(card, player, target) { return target !== player; },
  async content(event, trigger, player) {
   const target = event.target;
   // Collect sealed choices before moving either player's cards (including zero-card bids).
   const results = await player.chooseCardOL([player, target], "he", [0, Infinity], true, "豪赌：秘密选择要弃置的牌，可选择零张", discardable)
    .set("ai", card => 4 - get.value(card)).forResult();
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
     .set("ai", () => options.includes("伤害") && get.attitude(player, target) < 0 ? "伤害" : "摸牌").forResult();
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
    .set("ai", target => get.attitude(player, target) * (last.last === "draw" ? 1 : -1)).forResult();
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
   const result = await player.chooseControl(choices).set("prompt", "推演：每项每出牌阶段限一次").set("ai", () => choices[0]).forResult();
   if (result.control === "补充手牌") {
    player.addTempSkill("ac_tuiyan_draw", { player: "phaseUseAfter" });
    await player.drawTo(player.maxHp);
   } else if (result.control === "交付手牌") {
    const num = player.countCards("h") - player.hp;
    if (num <= 0) return;
    const selected = await player.chooseTarget("推演：选择接收手牌的其他角色", true, (card, source, target) => target !== source).set("ai", target => get.attitude(player, target)).forResult();
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
};
