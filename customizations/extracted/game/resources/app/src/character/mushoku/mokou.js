import { game, get, ui, _status } from "noname";
const bySuit = { heart: { name: "tao" }, diamond: { name: "sha", nature: "fire" }, club: { name: "shan" }, spade: { name: "wuxie" } };
const converted = (card, player) => bySuit[get.suit(card, player)];
const isDoubleUse = event => event.name === "useCard" && event.skill === "th_fengyi" && event.cards?.length === 2;
export default {
 th_penglai: {
  locked: true, forced: true,
  trigger: { player: ["phaseDrawBegin2", "dying"] },
  filter(event, player) { return event.name === "dying" || (!event.numFixed && (player.countCards("h") <= 2 || player.isDamaged())); },
  async content(event, trigger, player) {
   player.chat("此身不灭，此火不熄。");
   if (trigger.name === "dying") await player.draw(2);
   else trigger.num++;
  },
  mod: {
   maxHandcard(player, num) { return num + 2; },
   globalFrom(from, to, distance) { return distance - 1; },
  },
  group: "th_penglai_death",
  subSkill: { death: { charlotte: true, forced: true, popup: false, forceDie: true, trigger: { player: "dieBegin" }, async content(event, trigger, player) { player.chat("不过是……再睡一会儿。"); } } },
 },
 th_fengyi: {
  enable: ["chooseToUse", "chooseToRespond"],
  position: "hes", selectCard: [1, 2], complexCard: true,
  prompt: "将一至两张同花色的牌使用或打出：♥桃、♦火杀、♣闪、♠无懈可击。只有使用两张牌时触发强化。",
  viewAs(cards, player) {
   if (!cards.length) return null;
   const info = converted(cards[0], player);
   return info ? { ...info } : null;
  },
  filter(event, player) { return player.getCards("hes").some(card => { const info = converted(card, player); return info && event.filterCard(get.autoViewAs(info, "unsure"), player, event); }); },
  filterCard(card, player, event) {
   const selected = ui.selected.cards;
   if (selected.length) return get.suit(card, player) === get.suit(selected[0], player);
   event ||= _status.event;
   const info = converted(card, player);
   return !!info && event._backup.filterCard(get.autoViewAs(info, "unsure"), player, event);
  },
  check(card) { return 8 - get.value(card); },
  hiddenCard(player, name) { return Object.entries(bySuit).some(([suit, info]) => info.name === name && player.countCards("hes", { suit }) > 0); },
  precontent(event, trigger, player) { player.chat("看清楚了——凤凰，是这样浴火重生的！"); },
  ai: {
   order: 6, respondSha: true, respondShan: true, save: true,
   skillTagFilter(player, tag) { const suit = { respondSha: "diamond", respondShan: "club", save: "heart" }[tag]; return !!suit && player.countCards("hes", { suit }) > 0; },
  },
  group: ["th_fengyi_empower", "th_fengyi_discard"],
  subSkill: {
   empower: {
    charlotte: true, forced: true, popup: false, firstDo: true,
    trigger: { player: "useCard" }, filter: isDoubleUse,
    async content(event, trigger) {
     trigger.directHit.addArray(game.players);
     trigger.nowuxie = true;
     if (["tao", "sha"].includes(trigger.card.name)) trigger.baseDamage = (trigger.baseDamage ?? 1) + 1;
    },
   },
   discard: {
    charlotte: true, forced: true, popup: false,
    trigger: { player: "useCardAfter" },
    filter(event, player) { return isDoubleUse(event) && ["shan", "wuxie"].includes(event.card.name) && _status.currentPhase?.isIn() && _status.currentPhase.countDiscardableCards(player, "he") > 0; },
    async content(event, trigger, player) { await player.discardPlayerCard(_status.currentPhase, "he", true); },
   },
  },
 },
};
