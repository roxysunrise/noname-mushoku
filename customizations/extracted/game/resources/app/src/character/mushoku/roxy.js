import { game, get } from "noname";

const mana = player => player.countMark("mt_roxy_mana");
const gainMana = (player, amount) => {
 const gain = Math.min(amount, Math.max(0, 6 - mana(player)));
 if (gain) player.addMark("mt_roxy_mana", gain);
};

export const roxyTranslate = {
 mt_roxy_chant: "豪雨吟唱",
 mt_roxy_mana: "水咏", mt_roxy_mana_info: "锁定技，游戏开始时获得2点魔力（上限6）。每轮开始时获得2点魔力。每回合限一次，你使用普通锦囊牌结算结束后，获得1点魔力并摸一张牌。",
 mt_roxy_water: "水袭", mt_roxy_water_info: "出牌阶段限两次，每名角色限选一次。你可以消耗1点魔力并弃置一张黑色手牌，对一名其他角色造成2点伤害；其可以弃置至多两张手牌，每弃置一张，此伤害－1。",
 mt_roxy_spirit: "水灵", mt_roxy_spirit_info: "出牌阶段限一次，你可以消耗2点魔力，回复1点体力并摸一张牌。",
 mt_roxy_rain: "豪雨", mt_roxy_rain_info: "限定技，结束阶段，你可以消耗4点魔力开始吟唱。下个回合开始时，对所有其他角色各造成1点雷电伤害。吟唱期间，你累计受到至少2点伤害时，吟唱中断，你摸两张牌。",
};

export default {
 mt_roxy_mana: {
  locked: true, mark: true, marktext: "魔", intro: { content: "魔力：#/6" },
  init(player) { if (!player.storage.mt_roxy_mana_initialized) { player.storage.mt_roxy_mana_initialized = true; gainMana(player, 2); } },
  trigger: { global: "roundStart" }, forced: true,
  async content(event, trigger, player) { gainMana(player, 2); },
  group: "mt_roxy_mana_trick",
  subSkill: { trick: {
   charlotte: true, trigger: { player: "useCardAfter" }, forced: true, usable: 1,
   filter(event) { return get.type(event.card) === "trick"; },
   async content(event, trigger, player) { gainMana(player, 1); await player.draw(); },
  } },
 },
 mt_roxy_water: {
  enable: "phaseUse", usable: 2, position: "h", selectCard: 1,
  filterCard(card) { return get.color(card) === "black"; },
  filter(event, player) { return mana(player) >= 1 && player.countCards("h", card => get.color(card) === "black") > 0; },
  filterTarget(card, player, target) { return target !== player && !(player.storage.mt_roxy_water_targets || []).includes(target); },
  check(card) { return 6 - get.value(card); },
  async content(event, trigger, player) {
   player.removeMark("mt_roxy_mana", 1);
   if (!player.hasSkill("mt_roxy_water_targets")) {
    player.addTempSkill("mt_roxy_water_targets", { player: "phaseUseAfter" });
    player.storage.mt_roxy_water_targets = [];
   }
   const target = event.target;
   player.markAuto("mt_roxy_water_targets", [target]);
   if (!target.isIn()) return;
   const result = await target.chooseToDiscard("h", [1, 2], "水袭：可以弃置至多两张手牌，每弃置一张，此伤害－1")
    .set("ai", get.infoFuncOL("_noname_func:card => 6 - get.value(card)")).forResult();
   const damage = Math.max(0, 2 - (result.bool ? result.cards.length : 0));
   if (damage && target.isIn()) await target.damage(damage, player);
  },
  ai: { order: 7, result: { target: -1 } },
  subSkill: { targets: { charlotte: true, onremove: true } },
 },
 mt_roxy_spirit: {
  enable: "phaseUse", usable: 1,
  filter(event, player) { return mana(player) >= 2; },
  async content(event, trigger, player) { player.removeMark("mt_roxy_mana", 2); await player.recover(); if (player.isIn()) await player.draw(); },
  ai: { order: 6, result: { player: player => player.isDamaged() ? 2 : 0.4 } },
 },
 mt_roxy_rain: {
  trigger: { player: "phaseJieshuBegin" }, direct: true, limited: true, skillAnimation: true, animationColor: "water",
  filter(event, player) { return mana(player) >= 4 && !player.storage.mt_roxy_rain_used; },
  async content(event, trigger, player) {
   const result = await player.chooseBool("豪雨：消耗4点魔力，吟唱至下回合开始？累计受到至少2点伤害时中断并摸两张牌。")
    .set("ai", () => true).forResult();
   if (!result.bool || mana(player) < 4 || player.storage.mt_roxy_rain_used) return;
   player.awakenSkill("mt_roxy_rain");
   player.storage.mt_roxy_rain_used = true;
   player.removeMark("mt_roxy_mana", 4);
   player.storage.mt_roxy_chant = { damage: 0 };
   player.syncStorage("mt_roxy_chant"); player.addSkill("mt_roxy_chant");
  },
 },
 mt_roxy_chant: {
  charlotte: true, mark: true, marktext: "咏", intro: { content(storage, player) { return `豪雨吟唱中；累计受到伤害：${player.storage.mt_roxy_chant?.damage || 0}/2。`; } },
  onremove(player) { delete player.storage.mt_roxy_chant; },
  group: ["mt_roxy_chant_release", "mt_roxy_chant_interrupt"],
  subSkill: {
   release: {
    charlotte: true, trigger: { player: "phaseBegin" }, forced: true,
    filter(event, player) { return !!player.storage.mt_roxy_chant; },
    async content(event, trigger, player) {
     player.removeSkill("mt_roxy_chant"); player.syncStorage("mt_roxy_chant");
     for (const target of game.filterPlayer(target => target !== player).sortBySeat(player)) {
      if (!player.isIn()) break;
      if (target.isIn()) await target.damage(1, player, "thunder");
     }
    },
   },
   interrupt: {
    charlotte: true, trigger: { player: "damageEnd" }, forced: true,
    filter(event, player) { return !!player.storage.mt_roxy_chant && event.num > 0; },
    async content(event, trigger, player) {
     player.storage.mt_roxy_chant.damage += trigger.num;
     if (player.storage.mt_roxy_chant.damage >= 2) {
      player.removeSkill("mt_roxy_chant");
      player.syncStorage("mt_roxy_chant"); await player.draw(2);
     } else { player.syncStorage("mt_roxy_chant"); player.markSkill("mt_roxy_chant"); }
    },
   },
  },
 },
};
