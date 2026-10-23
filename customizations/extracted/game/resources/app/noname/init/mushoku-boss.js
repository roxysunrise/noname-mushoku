import { alucardCharacters, createAlucardSkills, alucardTranslate } from "./mushoku-alucard.js";
const mana = player => player.countMark("mt_boss_mana");
const addMana = (player, amount) => {
 const gain = Math.min(amount, 8 - mana(player));
 if (gain > 0) player.addMark("mt_boss_mana", gain);
};
const spend = (player, amount) => player.removeMark("mt_boss_mana", amount);
const rainCosts = [2, 4, 6, 8];
const rainEffects = {
 2: "所有其他角色各弃置一张牌。",
 4: "对所有其他角色各造成1点伤害。",
 6: "所有其他角色依次弃置一张牌，然后受到你造成的1点伤害。",
 8: "对所有其他角色各造成2点伤害。",
};
const bossRoster = {
 ...alucardCharacters,
 boss_mt_roxy: { sex: "female", group: "huan", hp: 6, maxHp: 6,
  skills: ["mt_boss_mana", "mt_boss_shield", "mt_boss_water", "mt_boss_rain", "mt_boss_resolve", "mt_boss_spirit"],
   isBoss: true, img: "image/character/boss_mt_roxy.jpg" },
  boss_johan: { sex: "male", group: "huan", hp: 6, maxHp: 6, isBoss: true, img: "image/character/boss_johan-v2.jpg", skills: ["jh_punishment", "jh_control", "jh_crime", "jh_monster"] },
};
// All current and future bosses registered here inherit the shared boss rules.
export const bossCharacters = Object.fromEntries(Object.entries(bossRoster).map(([id, character]) => [id, {
 ...character, skills: [...new Set([...character.skills, "mt_boss_supply"])],
}]));

export function resolveBossCharacter(config = {}, random = Math.random) {
  const selected = config.boss_character;
  if (selected && selected !== "random" && bossCharacters[selected]) return selected;
  const pool = Object.keys(bossCharacters);
  return pool[Math.floor(random() * pool.length) % pool.length];
}
export const bossCharacterIntro = {
 boss_alucard: "《HELLSING》中的阿卡多。无生之王，以亡者的生命抵御致命攻击，以双枪追猎并侵蚀敌人。解放死河后舍弃储命，转入持续进攻。",
 boss_mt_roxy: "《无职转生》中的洛琪希·米格路迪亚，出身魔族的水系魔术师，也是鲁迪乌斯的启蒙老师。此为Boss版本，以魔力储备、水幕防守与可被打断的豪雨吟唱组织战斗。",
 boss_johan: "《MONSTER》（《怪物》）中的约翰·李贝特，沉静聪慧、擅长洞察并操纵人心，被称作无名的怪物。此为初始6体力Boss版本，以操纵、天罚和短暂的完美犯罪保护营造心理压迫。",
};
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
   const result = await target.chooseToDiscard("h", [1, 2], "水袭：可以弃置至多两张手牌，每弃置一张，此次伤害-1（最低为0）").set("ai", card => 5 - get.value(card)).forResult();
   const damage = Math.max(0, 2 - (result.bool ? result.cards.length : 0));
   if (damage > 0 && target.isIn()) await target.damage(damage, player);
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
  filter(event, player) { return mana(player) >= 2 && !player.storage.mt_boss_chant; },
  async content(event, trigger, player) {
   const costs = rainCosts.filter(cost => cost <= mana(player));
   if (!costs.length) return;
   const controls = costs.map(cost => `${cost}点魔力`);
   const result = await player.chooseControl([...controls, "cancel2"])
    .set("prompt", "豪雨：选择消耗的魔力，吟唱至下回合开始；吟唱期间累计受到至少4点伤害时中断")
    .set("choiceList", costs.map(cost => `${cost}点魔力：${rainEffects[cost]}`))
    .set("mt_boss_rain_costs", costs)
    .set("ai", () => get.event().mt_boss_rain_costs.length - 1).forResult();
   const cost = costs[controls.indexOf(result.control)];
   if (!cost || mana(player) < cost) return;
   player.logSkill("mt_boss_rain");
   spend(player, cost);
   player.storage.mt_boss_chant = { damage: 0, cost };
   player.markSkill("mt_boss_rain");
  },
  marktext: "咏", intro: { content(storage, player) { const chant = player.storage.mt_boss_chant; return `豪雨吟唱中，已消耗${chant?.cost || 0}点魔力；累计受到伤害：${chant?.damage || 0}/4。`; } },
  group: ["mt_boss_rain_release", "mt_boss_rain_interrupt"],
  subSkill: {
   release: {
    trigger: { player: "phaseBegin" }, forced: true,
    filter(event, player) { return !!player.storage.mt_boss_chant; },
    async content(event, trigger, player) {
     const cost = player.storage.mt_boss_chant.cost;
     delete player.storage.mt_boss_chant;
     player.unmarkSkill("mt_boss_rain");
     if (!rainCosts.includes(cost)) return;
     const targets = game.filterPlayer(target => target !== player).sortBySeat(player);
     for (const target of targets) {
      if (!player.isIn()) break;
      if (!target.isIn()) continue;
      if (cost === 2 || cost === 6) await target.chooseToDiscard("he", 1, true, "豪雨：弃置一张牌");
      if (!target.isIn()) continue;
      if (cost === 4 || cost === 6) await target.damage(1, player);
      else if (cost === 8) await target.damage(2, player);
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
  filter(event, player) { return player.hp <= 2 && !player.storage.mt_boss_resolved; },
  async content(event, trigger, player) {
   player.storage.mt_boss_resolved = true;
   player.markSkill("mt_boss_resolve");
   await player.recover(2);
   addMana(player, 2);
  },
  marktext: "决", intro: { content: "决意已触发：水袭每个出牌阶段至多使用三次。" },
  },
  jh_punishment: {
   locked: true, trigger: { source: "damageBegin1" }, forced: true,
   filter(event, player) { return !player.storage.jh_monster_awakened || (player.storage.jh_punishment_turn?.count || 0) < 2; },
   async content(event, trigger, player) {
    if (!player.hasSkill("jh_punishment_turn")) {
     player.addTempSkill("jh_punishment_turn", { global: "phaseAfter" });
     player.storage.jh_punishment_turn = { count: 0, drawn: false };
    }
    const record = player.storage.jh_punishment_turn;
    record.count++;
    const draw = !record.drawn;
    record.drawn = true;
    player.syncStorage("jh_punishment_turn");
    if (trigger.player.countCards("he")) await trigger.player.chooseToDiscard("he", 1, true);
    else trigger.num++;
    if (draw) await player.draw();
   },
   subSkill: { turn: { charlotte: true, onremove: true } },
  },
  jh_control: { enable: "phaseUse", usable: 2, filter(event, player) { return (player.getStat("skill").jh_control || 0) < (player.storage.jh_monster_awakened ? 2 : 1); }, filterTarget: (card, player, target) => target !== player, async content(event, trigger, player) { const target = event.target; if (target.countCards("h")) await target.chooseToGive(player, "h", 1, true); else { const card = { name: "sha", isCard: true }; const others = game.filterPlayer(p => p !== player && p !== target && target.canUse(card, p, false)); if (others.length) await target.useCard(card, others, false); } }, ai: { order: 6, result: { target: -1 } } },
  jh_crime: {
   enable: "phaseUse", usable: 1,
   filter(event, player) { return (player.storage.jh_crime_uses || 0) < 3; },
   mark: true, marktext: "罪", intro: { content(storage, player) { return `完美犯罪剩余可发动次数：${Math.max(0, 3 - (player.storage.jh_crime_uses || 0))}/3。`; } },
   filterTarget: (card, player, target) => target !== player,
   async content(event, trigger, player) {
    if ((player.storage.jh_crime_uses || 0) >= 3) return;
    player.storage.jh_crime_uses = (player.storage.jh_crime_uses || 0) + 1;
    player.syncStorage("jh_crime_uses");
    player.markSkill("jh_crime");
    player.addTempSkill("jh_crime_guard", { player: "phaseBegin" });
    player.storage.jh_crime_guard = [event.target];
    player.syncStorage("jh_crime_guard");
    player.markSkill("jh_crime_guard");
   },
   ai: { order: 8, result: { target: -1, player: 1 } },
   group: "jh_crime_source",
   subSkill: {
    guard: {
     charlotte: true, onremove: true, mark: true, marktext: "罪", intro: { content: "players" },
     trigger: { player: "damageBegin4" }, forced: true,
     filter(event, player) { return event.num > 0 && player.getStorage("jh_crime_guard").includes(event.source); },
     async content(event, trigger, player) { trigger.cancel(); player.removeSkill("jh_crime_guard"); },
    },
    source: { trigger: { player: "damageEnd" }, forced: true, filter(event) { return event.source?.isIn() && event.source.countCards("he") > 0; }, async content(event, trigger) { await trigger.source.chooseToDiscard("he", 1, true); } },
   },
  },
  jh_monster: { juexingji: true, skillAnimation: true, animationColor: "gray", trigger: { player: "phaseZhunbeiBegin" }, forced: true, filter: (event, player) => player.hp <= 3 && !player.storage.jh_monster_awakened, async content(event, trigger, player) { player.awakenSkill("jh_monster"); player.storage.jh_monster_awakened = true; await player.gainMaxHp(2); await player.recover(1); player.addSkill("jh_terror"); } },
  jh_terror: { locked: true, global: "jh_terror_aura", subSkill: { aura: { mod: { maxHandcard(player, num) { return num - game.countPlayer(owner => owner !== player && owner.hasSkill("jh_terror")); } } } } },
 }; }
export const bossTranslate = {
 jh_crime_guard: "完美犯罪", jh_crime_guard_info: "直到你的下个回合开始时，防止所选角色对你造成的下一次伤害，然后移除此保护。",
 ...alucardTranslate,
 mt_boss_supply: "领袖", mt_boss_supply_info: "锁定技，摸牌阶段的基础摸牌数为3，手牌上限+2。固定摸牌数不受影响。",
 boss_mt_roxy: "洛琪希", boss_mt_roxy_ab: "洛琪希", boss_mt_roxy_info: "未知级／幻。三名挑战者对战；按座次依次行动。",
 mt_boss_mana: "水咏", mt_boss_mana_info: "锁定技，初始拥有4点魔力，每轮开始获得3点魔力，上限为8。每回合限一次，你使用普通锦囊牌结算后获得1点魔力。",
 mt_boss_shield: "水幕", mt_boss_shield_info: "每轮限一次，受到至少2点伤害时，你可以消耗2点魔力，令此次伤害减少1。",
 mt_boss_water: "水袭", mt_boss_water_info: "出牌阶段限两次（每名角色限选一次），你可以消耗1点魔力并弃置一张黑色手牌，对一名其他角色造成2点伤害；该角色可以弃置至多两张手牌，每弃置一张，令此次伤害-1（最低为0）。",
 mt_boss_spirit: "水灵", mt_boss_spirit_info: "出牌阶段限两次，你可以消耗2点魔力，回复1点体力并摸一张牌。",
 mt_boss_rain: "豪雨", mt_boss_rain_info: "结束阶段，你可以消耗2、4、6或8点魔力开始吟唱。你的下回合开始时，若吟唱未中断，按本次消耗的魔力结算：2点，所有其他角色各弃置一张牌；4点，你对所有其他角色各造成1点伤害；6点，所有其他角色依次弃置一张牌，然后受到你造成的1点伤害；8点，你对所有其他角色各造成2点伤害。吟唱期间，你累计受到至少4点伤害时，吟唱中断，你摸两张牌并获得1点魔力。",
  mt_boss_resolve: "决意", mt_boss_resolve_info: "锁定技，每局限一次，当你的体力降至2或以下时，你回复2点体力并获得2点魔力。此后，你的水袭每个出牌阶段限三次（每名角色仍限选一次）。",
  boss_johan: "约翰", boss_johan_ab: "约翰", boss_johan_info: "《MONSTER》（《怪物》）中的约翰·李贝特，沉静聪慧、擅长洞察与操纵人心，是贯穿作品的核心谜团，被称作“无名的怪物”。本角色为幻势力1v3 Boss。", jh_punishment: "天罚", jh_punishment_info: "锁定技，你造成伤害时，令受伤角色弃置一张牌；若其无牌可弃，此伤害+1，然后你摸一张牌（每回合限摸一次）。觉醒后，本技能的整个效果每回合限发动两次，摸牌仍每回合限一次。", jh_control: "操纵", jh_control_info: "出牌阶段限一次，令一名角色交给你一张手牌；若其没有手牌，则视为其对除你外所有角色使用一张无距离限制的杀。", jh_crime: "完美犯罪", jh_crime_info: "出牌阶段限一次，整局限三次，你可以选择一名其他角色（可连续选择同一名角色），直到你的下个回合开始时，防止该角色对你造成的下一次伤害。你受到伤害后，伤害来源弃置一张牌。", jh_monster: "怪物", jh_monster_info: "觉醒技，准备阶段，若体力不大于3，加2点体力上限并回复1点体力，然后获得恐怖，且操纵改为出牌阶段限两次，天罚的整个效果改为每回合限发动两次（摸牌仍每回合限一次）。", jh_terror: "恐怖", jh_terror_info: "锁定技，所有其他角色的手牌上限-1。",
};
