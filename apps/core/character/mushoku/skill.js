import { lib, game, get } from "noname";

const named = (player, name) => [player.name, player.name1, player.name2].includes(name);
const suits = ["spade", "heart", "club", "diamond"];
const level = player => Math.min(4, player.countMark("mt_study"));
const spell = card => card?.name === "sha" || get.type(card) === "trick";
const voiceless = (card, player) => ({ diamond: "huogong", club: "tiesuo" })[get.suit(card, player)];
const water = (card, player) => get.color(card, player) === "black" ? "guohe" : level(player) >= 2 && get.color(card, player) === "red" ? "shunshou" : null;
const style = card => ({ basic: "juedou", equip: "guohe", trick: "tiesuo" })[get.type2(card)];
// Preserve the original card filter for bans and response windows.
const allowed = (name, card, player, event) => {
 if (!name || !lib.inpile.includes(name)) return false;
 event ??= get.event();
 return !event?._backup?.filterCard || event._backup.filterCard(get.autoViewAs({ name }, [card]), player, event);
};
const newStudy = player => player.getHistory("useCard", evt => get.type2(evt.card) === "trick")
 .map(evt => get.suit(evt.card, player)).find(suit => suits.includes(suit) && !(player.storage.mt_study_suits || []).includes(suit));

const skills = {
 mt_voiceless: {
  enable: "phaseUse", usable: 1, position: "h", selectCard: 1,
  filterCard: (card, player, event) => allowed(voiceless(card, player), card, player, event),
  viewAs: (cards, player) => cards.length ? { name: voiceless(cards[0], player) } : null,
  prompt: "无咏：将一张方块手牌当【火攻】，或梅花手牌当【铁索连环】使用",
  check: card => 6 - get.value(card), ai: { order: 5 },
 },
 mt_foresight: {
  trigger: { target: "useCardToTargeted" }, usable: 1,
  filter: (event, player) => event.player !== player && spell(event.card) && suits.includes(get.suit(event.card)) && player.countCards("he", card => get.suit(card, player) === get.suit(event.card)) > 0,
  async cost(event, trigger, player) {
   event.result = await player.chooseToDiscard("he", "预见：弃置一张与来牌花色相同的牌，令此牌对你无效", card => get.suit(card) === get.event().suit)
    .set("suit", get.suit(trigger.card)).set("ai", card => 7 - get.value(card)).set("chooseonly", true).forResult();
  },
  async content(event, trigger, player) { await player.discard(event.cards); trigger.getParent().excluded.add(player); },
 },
 mt_study: {
  trigger: { player: "phaseJieshuBegin" }, forced: true, usable: 1,
  filter: (event, player) => level(player) < 4 && !!newStudy(player),
  async content(event, trigger, player) {
   const suit = newStudy(player);
   if (!suit || level(player) >= 4) return;
   (player.storage.mt_study_suits ??= []).push(suit);
   player.syncStorage("mt_study_suits");
   player.addMark("mt_study", 1);
  },
  marktext: "研", intro: { name: "研习", content: (storage, player) => `已研习：${(player.storage.mt_study_suits || []).map(suit => get.translation(suit)).join("、") || "无"}（每回合至多一种）` },
 },
 mt_water: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1,
  filterCard: (card, player, event) => (level(player) >= 4 || get.position(card) === "h") && allowed(water(card, player), card, player, event),
  viewAs: (cards, player) => cards.length ? { name: water(cards[0], player) } : null,
  prompt: "水术：黑色手牌当【过河拆桥】；研习2解锁红色手牌当【顺手牵羊】，研习4可使用装备区的牌",
  check: card => 6 - get.value(card), ai: { order: 6 },
 },
 mt_mentor: {
  trigger: { global: "phaseJieshuBegin" }, limited: true, skillAnimation: true, animationColor: "water",
  filter: (event, player) => !player.storage.mt_mentor && named(event.player, "mt_rudeus") && event.player !== player && event.player.isIn(),
  check: (event, player) => get.attitude(player, event.player) > 0,
  async content(event, trigger, player) { player.awakenSkill("mt_mentor"); player.storage.mt_mentor = true; await trigger.player.draw(); if (player.isIn()) await player.draw(); },
 },
 mt_heal: {
  enable: "chooseToUse", usable: 1, position: "he", selectCard: 1,
  filterCard: card => get.suit(card) === "heart", viewAs: { name: "tao" },
  viewAsFilter: player => player.countCards("he", { suit: "heart" }) > 0,
  prompt: "治愈：将一张红桃牌当【桃】使用（每回合限一次）",
  check: card => 7 - get.value(card), ai: { save: true, respondTao: true },
 },
 mt_guard: {
  trigger: { global: "damageBegin4" }, usable: 1,
  filter: (event, player) => event.player !== player && event.player.isIn() && player.countCards("he", { suit: "heart" }) > 0 && event.num > 0,
  async cost(event, trigger, player) {
   const good = get.attitude(player, trigger.player) > 0;
   event.result = await player.chooseCard("he", { suit: "heart" }, "守护：交给受伤角色一张红桃牌，令此次伤害-1").set("ai", card => good ? 7 - get.value(card) : 0).forResult();
  },
  async content(event, trigger, player) { await player.give(event.cards, trigger.player); trigger.num--; },
 },
 mt_sword: {
  trigger: { player: "useCardToPlayered" }, usable: 1,
  filter: (event, player) => event.card?.name === "sha" && player.isPhaseUsing() && event.targets.length === 1 && suits.includes(get.suit(event.card)) && player.countCards("he", card => get.suit(card, player) === get.suit(event.card)) > 0,
  async cost(event, trigger, player) {
   const good = get.attitude(player, trigger.target) < 0;
   event.result = await player.chooseToDiscard("he", "烈剑：弃置一张与此【杀】同花色的牌，令目标不能响应", card => get.suit(card) === get.event().suit)
    .set("suit", get.suit(trigger.card)).set("chooseonly", true).set("ai", card => good ? 6 - get.value(card) : 0).forResult();
  },
  async content(event, trigger, player) { await player.discard(event.cards); trigger.getParent().directHit.add(trigger.target); },
 },
 mt_resolve: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1,
  filterCard: card => get.type(card) === "equip", viewAs: { name: "juedou" },
  prompt: "决意：将一张装备牌当【决斗】使用", check: card => 6 - get.value(card), ai: { order: 5 },
 },
 mt_dragon: {
  init(player) { if (!player.storage.mt_dragon_initialized) { player.storage.mt_dragon_initialized = true; player.addMark("mt_dragon", 3); } },
  enable: "chooseToUse", usable: 1, position: "h", selectCard: 1,
  filterCard: card => get.type2(card) === "trick", viewAs: { name: "wuxie" },
  viewAsFilter: player => player.countMark("mt_dragon") > 0 && player.countCards("h", card => get.type2(card) === "trick") > 0,
  hiddenCard: (player, name) => name === "wuxie" && player.countMark("mt_dragon") > 0 && player.countCards("h", card => get.type2(card) === "trick") > 0,
  onuse(result, player) { player.removeMark("mt_dragon", 1); },
  prompt: "龙力：消耗1枚龙力，将一张锦囊手牌当【无懈可击】使用（每回合限一次）",
  marktext: "龙", intro: { content: "mark", name: "龙力（上限3）" },
  check: card => 7 - get.value(card), ai: { respondWuxie: true },
 },
 mt_dragonlord: {
  zhuSkill: true, trigger: { player: "phaseZhunbeiBegin" }, forced: true,
  filter: (event, player) => player.identity === "zhu" && player.hasZhuSkill("mt_dragonlord") && player.countMark("mt_dragon") < 3,
  async content(event, trigger, player) { if (player.countMark("mt_dragon") < 3) player.addMark("mt_dragon", 1); },
 },
 mt_eye: {
  trigger: { player: "phaseZhunbeiBegin" }, frequent: true,
  async content(event, trigger, player) { await player.chooseToGuanxing(2); },
 },
 mt_protect: {
  trigger: { global: "damageEnd" }, usable: 1,
  filter: (event, player) => event.player !== player && event.player.isIn() && event.player.hp <= player.hp && !!event.source?.isIn() && event.source !== player && event.source !== event.player && event.source.countCards("he") > 0,
  check: (event, player) => get.attitude(player, event.player) > 0 && get.attitude(player, event.source) < 0,
  async content(event, trigger, player) {
   const result = await player.gainPlayerCard(trigger.source, "he", true).forResult();
   const cards = (result.cards || []).filter(card => player.getCards("h").includes(card));
   if (result.bool && cards.length && trigger.player.isIn()) await player.give(cards, trigger.player);
  },
 },
 mt_styles: {
  enable: "phaseUse", usable: 1, position: "he", selectCard: 1,
  filterCard: (card, player, event) => allowed(style(card), card, player, event),
  viewAs: cards => cards.length ? { name: style(cards[0]) } : null,
  prompt: "三流：基本牌当【决斗】、装备牌当【过河拆桥】、锦囊牌当【铁索连环】使用",
  check: card => 6 - get.value(card), ai: { order: 5 },
 },
 mt_rescue: {
  trigger: { global: "dying" }, limited: true, skillAnimation: true,
  filter: (event, player) => !player.storage.mt_rescue && event.player !== player && event.player.isIn() && event.player.hp <= 0 && player.hp > 1,
  check: (event, player) => get.attitude(player, event.player) > 0,
  async content(event, trigger, player) { player.awakenSkill("mt_rescue"); player.storage.mt_rescue = true; await player.loseHp(); if (trigger.player.isIn()) { await trigger.player.recover(); if (named(trigger.player, "mt_rudeus") && player.isIn()) await player.draw(); } },
 },
 mt_swordking: {
  trigger: { player: "useCardToPlayered" }, usable: 1,
  filter: (event, player) => event.card?.name === "sha" && player.isPhaseUsing() && event.targets.length === 1 && event.target.countCards("e") > 0,
  check: (event, player) => get.attitude(player, event.target) < 0,
  async content(event, trigger, player) { await player.discardPlayerCard(trigger.target, "e", true); },
 },
 mt_training: {
  enable: "phaseUse", limited: true, skillAnimation: true,
  filter: (event, player) => !player.storage.mt_training && game.hasPlayer(current => current !== player && named(current, "mt_eris")) && player.countCards("he", card => get.type(card) === "equip") > 0,
  position: "he", selectCard: 1, filterCard: card => get.type(card) === "equip", discard: false, lose: false, delay: false,
  filterTarget: (card, player, target) => target !== player && named(target, "mt_eris"),
  async content(event, trigger, player) { player.awakenSkill("mt_training"); player.storage.mt_training = true; await player.give(event.cards, event.target); if (player.isIn()) await player.draw(); },
  check: card => 6 - get.value(card), ai: { order: 4, result: { target: 1 } },
 },
};
export default skills;
