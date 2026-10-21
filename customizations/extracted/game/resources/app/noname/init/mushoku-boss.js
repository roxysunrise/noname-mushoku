import { alucardCharacters, createAlucardSkills, alucardTranslate } from "./mushoku-alucard.js";
const mana = player => player.countMark("mt_boss_mana");
const addMana = (player, amount) => {
 const gain = Math.min(amount, 8 - mana(player));
 if (gain > 0) player.addMark("mt_boss_mana", gain);
};
const spend = (player, amount) => player.removeMark("mt_boss_mana", amount);
const bossRoster = {
 ...alucardCharacters,
 boss_mt_roxy: { sex: "female", group: "huan", hp: 10, maxHp: 10,
  skills: ["mt_boss_mana", "mt_boss_shield", "mt_boss_water", "mt_boss_rain", "mt_boss_resolve", "mt_boss_spirit"],
  isBoss: true, img: "image/character/boss_mt_roxy.jpg" },
};
// All current and future bosses registered here inherit the shared boss rules.
export const bossCharacters = Object.fromEntries(Object.entries(bossRoster).map(([id, character]) => [id, {
 ...character, skills: [...new Set([...character.skills, "mt_boss_supply"])],
}]));
export function createBossSkills(game, get) { return {
 ...createAlucardSkills(game, get),
 mt_boss_supply: {
  locked: true, forced: true, trigger: { player: "phaseDrawBegin1" },
  filter(event) { return !event.numFixed; },
  async content(event, trigger) { trigger.num += 1; },
  mod: { maxHandcard(player, num) { return num + 2; } },
 },
 mt_boss_mana: {
  mark: true, marktext: "魔", intro: { content: "魔力：#/8" },
  init(player) {
   if (!player.storage.mt_boss_mana_initialized) {
    player.storage.mt_boss_mana_initialized = true;
    addMana(player, 4);
   }
  },
  trigger: { global: "roundStart" }, forced: true,
  async content(event, trigger, player) { addMana(player, 3); },
  group: "mt_boss_mana_trick",
  subSkill: { trick: {
   trigger: { player: "useCardAfter" }, forced: true, usable: 1,
   filter(event, player) { return get.type(event.card) === "trick" && mana(player) < 8; },
   async content(event, trigger, player) { addMana(player, 1); },
  } },
 },
 mt_boss_shield: {
  trigger: { player: "damageBegin4" },
  filter(event, player) { return event.num >= 2 && mana(player) >= 2 && !player.hasSkill("mt_boss_shield_used"); },
  check: () => true,
  async content(event, trigger, player) {
   spend(player, 2);
   trigger.num--;
   player.addTempSkill("mt_boss_shield_used", { global: "roundStart" });
  },
  subSkill: { used: { charlotte: true } },
 },
 mt_boss_water: {
  enable: "phaseUse", position: "h", filterCard: card => get.color(card) === "black",
  selectCard: 1,
  filter(event, player) {
   return mana(player) >= 1 && (player.getStat("skill").mt_boss_water || 0) < (player.storage.mt_boss_resolved ? 3 : 2) && player.countCards("h", card => get.color(card) === "black") > 0;
  },
  filterTarget(card, player, target) { return target !== player && !(player.storage.mt_boss_water_targets || []).includes(target); },
  async content(event, trigger, player) {
   spend(player, 1);
   const target = event.target;
   if (!player.hasSkill("mt_boss_water_targets")) {
    player.addTempSkill("mt_boss_water_targets", { player: "phaseUseAfter" });
    player.storage.mt_boss_water_targets = [];
   }
   player.markAuto("mt_boss_water_targets", [target]);
   const result = await target.chooseToDiscard("h", 2, "水袭：受到2点伤害；可弃置两张手牌将伤害减为1点").set("ai", card => 5 - get.value(card)).forResult();
   if (target.isIn()) await target.damage(result.bool ? 1 : 2, player);
  },
  ai: { order: 7, result: { target: -1 } },
  subSkill: { targets: { charlotte: true, onremove: true } },
 },
 mt_boss_spirit: {
  enable: "phaseUse", usable: 2,
  filter(event, player) { return mana(player) >= 2; },
  async content(event, trigger, player) {
   spend(player, 2);
   await player.recover();
   await player.draw();
  },
  ai: { order: 6, result: { player: player => player.isDamaged() ? 2 : 0.4 } },
 },
 mt_boss_rain: {
  trigger: { player: "phaseJieshuBegin" }, direct: true,
  filter(event, player) { return mana(player) >= 3 && !player.storage.mt_boss_chant; },
  async content(event, trigger, player) {
   const result = await player.chooseBool("豪雨：消耗3点魔力，吟唱至下回合开始；期间累计受到4点实际伤害会中断").set("ai", () => true).forResult();
   if (!result.bool) return;
   player.logSkill("mt_boss_rain");
   spend(player, 3);
   player.storage.mt_boss_chant = { damage: 0 };
   player.markSkill("mt_boss_rain");
  },
  marktext: "咏", intro: { content(storage, player) { return "豪雨吟唱中，累计受伤：" + (player.storage.mt_boss_chant?.damage || 0) + "/4"; } },
  group: ["mt_boss_rain_release", "mt_boss_rain_interrupt"],
  subSkill: {
   release: {
    trigger: { player: "phaseBegin" }, forced: true,
    filter(event, player) { return !!player.storage.mt_boss_chant; },
    async content(event, trigger, player) {
     delete player.storage.mt_boss_chant;
     player.unmarkSkill("mt_boss_rain");
     const damage = player.storage.mt_boss_resolved ? 2 : 1;
     const targets = game.filterPlayer(target => target !== player).sortBySeat(player);
     for (const target of targets) {
      if (!player.isIn()) break;
      if (!target.isIn()) continue;
      const result = await target.chooseToDiscard("he", 2, `豪雨：弃置两张牌，否则受到${damage}点伤害`)
       .set("ai", card => get.event().mt_boss_rain_threat - get.value(card))
       .set("mt_boss_rain_threat", 6 + damage * 2).forResult();
      if (!result.bool && target.isIn()) await target.damage(damage, player);
     }
    },
   },
   interrupt: {
    trigger: { player: "damageEnd" }, forced: true,
    filter(event, player) { return !!player.storage.mt_boss_chant && event.num > 0; },
    async content(event, trigger, player) {
     player.storage.mt_boss_chant.damage += trigger.num;
     if (player.storage.mt_boss_chant.damage < 4) { player.markSkill("mt_boss_rain"); return; }
     delete player.storage.mt_boss_chant;
     player.unmarkSkill("mt_boss_rain");
     await player.draw(2);
     addMana(player, 1);
    },
   },
  },
 },
 mt_boss_resolve: {
  trigger: { player: "changeHp" }, forced: true,
  filter(event, player) { return player.hp <= 5 && !player.storage.mt_boss_resolved; },
  async content(event, trigger, player) {
   player.storage.mt_boss_resolved = true;
   player.markSkill("mt_boss_resolve");
   await player.recover(2);
   addMana(player, 2);
  },
  marktext: "决", intro: { content: "水袭每阶段至多三次，豪雨造成2点伤害。" },
 },
}; }
export const bossTranslate = {
 ...alucardTranslate,
 mt_boss_supply: "Boss补给", mt_boss_supply_info: "锁定技，摸牌阶段的基础摸牌数为3，手牌上限+2。固定摸牌数不受影响。",
 boss_mt_roxy: "洛琪希", boss_mt_roxy_ab: "洛琪希", boss_mt_roxy_info: "未知级／幻。三名挑战者对战；按座次依次行动。",
 mt_boss_mana: "水咏", mt_boss_mana_info: "锁定技，初始拥有4点魔力，每轮开始获得3点魔力，上限为8。每回合限一次，你使用普通锦囊牌结算后获得1点魔力。",
 mt_boss_shield: "水幕", mt_boss_shield_info: "每轮限一次，受到至少2点伤害时，你可以消耗2点魔力，令此次伤害减少1。",
 mt_boss_water: "水袭", mt_boss_water_info: "出牌阶段限两次（每名角色限选一次），你可以消耗1点魔力并弃置一张黑色手牌，对一名其他角色造成2点伤害；其可以弃置两张手牌，将此伤害减为1点。",
 mt_boss_spirit: "水灵", mt_boss_spirit_info: "出牌阶段限两次，你可以消耗2点魔力，回复1点体力并摸一张牌。",
 mt_boss_rain: "豪雨", mt_boss_rain_info: "结束阶段，你可以消耗3点魔力开始吟唱，至下回合开始时，每名其他角色依次选择：弃置两张牌，或受到1点伤害。吟唱期间累计受到至少4点实际伤害时中断，你摸两张牌并获得1点魔力。",
 mt_boss_resolve: "决意", mt_boss_resolve_info: "锁定技，每局限一次，体力降至5或以下时，回复2点体力并获得2点魔力。此后水袭每阶段限三次，豪雨伤害改为2点。",
};
