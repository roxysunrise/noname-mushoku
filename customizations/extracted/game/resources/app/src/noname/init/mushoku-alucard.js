const lives = player => player.countMark("al_life");
const gainLife = (player, amount = 1) => {
 if (!player.storage.al_released && lives(player) < 4) player.addMark("al_life", Math.min(amount, 4 - lives(player)));
};
export const alucardCharacters = {
 boss_alucard: { sex: "male", group: "huan", hp: 6, maxHp: 6, isBoss: true, img: "image/character/boss_alucard.jpg", skills: ["al_life", "al_shadow", "al_jackal", "al_erosion", "al_immortal", "al_river"] },
};
export function createAlucardSkills(game, get) {
 const remoteChoice = source => get.infoFuncOL("_noname_func:" + source);
 return {
 al_life: {
  mark: true, marktext: "命", intro: { name: "命数", content: "命：#/4；每回合首次对其他角色造成伤害后摸一张牌。" },
  init(player) { if (!player.storage.al_life_initialized) { player.storage.al_life_initialized = true; gainLife(player, 2); } },
  trigger: { source: ["damageSource", "dieAfter"] }, forced: true,
  filter(event, player) {
   if (event.name === "die") return event.player !== player && event.source === player && !player.storage.al_released && lives(player) < 4;
   return event.num > 0 && event.player !== player && !player.hasSkill("al_life_drawn");
  },
  async content(event, trigger, player) {
   if (trigger.name === "die") gainLife(player);
   else { player.addTempSkill("al_life_drawn", { global: "phaseAfter" }); await player.draw(); }
  },
  group: "al_life_save",
  subSkill: {
   drawn: { charlotte: true },
   save: { charlotte: true, trigger: { player: "damageBegin4" }, direct: true,
    filter(event, player) {
     const armor = event.nohujia || player.hasSkillTag("nohujia") ? 0 : (player.hujia || 0);
     return event.num > 0 && event.num >= player.hp + armor && lives(player) > 0;
    },
    async content(event, trigger, player) { if ((await player.chooseBool("命数：移去1枚命，防止此次致命伤害？").set("ai", () => true).forResult()).bool) { player.removeMark("al_life", 1); trigger.cancel(); } },
   },
  },
 },
 al_shadow: {
  trigger: { player: "damageEnd" }, direct: true,
  filter(event, player) { return event.num > 0 && event.source && event.source !== player && !player.hasSkill("al_shadow_used"); },
  async content(event, trigger, player) {
   const source = trigger.source;
   if (!(await player.chooseBool("血影：获得伤害来源一张手牌并回复1点体力？").set("ai", () => true).forResult()).bool) return;
   player.addTempSkill("al_shadow_used", { global: "roundStart" });
   if (source.countCards("h") > 0 && source.isIn()) await player.gainPlayerCard(source, "h", true);
   await player.recover();
  },
  subSkill: { used: { charlotte: true } },
 },
 al_jackal: {
  locked: true,
  mod: { targetInRange(card) { if (card.name === "sha") return true; }, cardUsable(card, player, num) { if (card.name === "sha") return num + 1; } },
  trigger: { player: "useCard2" }, direct: true,
  filter(event, player) { return event.card.name === "sha" && event.getParent("phase")?.player === player && !player.hasSkill("al_jackal_used"); },
  async content(event, trigger, player) {
   if (!(await player.chooseBool("豺狼：此杀可额外指定一名合法目标，并令一名目标至少需要两张闪响应？").set("ai", () => true).forResult()).bool) return;
   player.addTempSkill("al_jackal_used", { global: "phaseAfter" });
   const use = trigger;
   const existing = [...use.targets];
   if (game.hasPlayer(target => target !== player && !existing.includes(target) && player.canUse(use.card, target))) {
    const result = await player.chooseTarget("豺狼：额外指定一名合法目标", (card, source, target) => {
     const current = get.event().al_jackal_use;
     return target !== source && !current.targets.includes(target) && source.canUse(current.card, target);
    }).set("al_jackal_use", { targets: existing, card: use.card }).set("ai", remoteChoice("target => -get.attitude(_status.event.player, target)")).forResult();
    if (result.bool) { use.targets.addArray(result.targets); player.line(result.targets); }
   }
   const result = await player.chooseTarget("豺狼：选择一名目标，其需使用两张【闪】抵消此杀", true, (card, source, target) => get.event().al_jackal_targets.includes(target))
    .set("al_jackal_targets", [...use.targets]).set("ai", remoteChoice("target => -get.attitude(_status.event.player, target)")).forResult();
   if (result.bool) {
    use.ac_jackal_double_shan = result.targets[0].playerid;
    const args = use.customArgs ??= {};
    const targetArgs = args[result.targets[0].playerid] ??= {};
    targetArgs.shanRequired = Math.max(2, targetArgs.shanRequired ?? 1);
   }
  },
  subSkill: { used: { charlotte: true } },
 },
 al_erosion: {
  trigger: { source: "damageSource" }, check: () => true,
  filter(event, player) { return event.num > 0 && event.card?.name === "sha" && event.player !== player && event.player.isIn() && event.player.maxHp > 2 && event.getParent("phase")?.player === player && !player.hasSkill("al_erosion_used"); },
  async content(event, trigger, player) {
   player.addTempSkill("al_erosion_used", { global: "phaseAfter" });
   const target = trigger.player, before = target.maxHp;
   await target.loseMaxHp(1);
   if (target.maxHp < before && player.isIn()) await player.recover();
  },
  subSkill: { used: { charlotte: true } },
 },
 al_immortal: {
  locked: true, forced: true, firstDo: true, priority: 100,
  trigger: { player: "damageBefore" }, filter(event) { return event.card?.name !== "sha"; },
  async content(event, trigger) { trigger.cancel(); },
  ai: { effect: { target(card) { if (card.name !== "sha" && get.tag(card, "damage")) return "zerotarget"; } } },
 },
 al_river: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "fire",
  filter(event, player) { return game.roundNumber >= 3 && !player.storage.al_released; },
  async content(event, trigger, player) {
   player.awakenSkill("al_river");
   const amount = lives(player);
   if (amount > 0) player.removeMark("al_life", amount);
   player.storage.al_released = true; player.syncStorage("al_released");
   player.addSkill("al_river_released");
   player.addTempSkill("al_river_turn", { player: "phaseBegin" });
   for (const target of game.filterPlayer(current => current !== player).sortBySeat(player)) {
    if (!player.isIn()) break;
    if (target.isIn()) await target.damage(1, player);
   }
  },
  ai: { order: 9, result: { player: () => 1 } },
  subSkill: {
   turn: { charlotte: true, mod: { targetEnabled(card, source, target) { if (source !== target) return false; } } },
   sha: { enable: ["chooseToUse", "chooseToRespond"], position: "h", selectCard: 1, filterCard: true, viewAs: { name: "sha" }, viewAsFilter(player) { return !!player.storage.al_released && player.countCards("h") > 0; }, hiddenCard(player, name) { return name === "sha" && !!player.storage.al_released && player.countCards("h") > 0; }, check(card) { return 6 - get.value(card); }, ai: { respondSha: true, skillTagFilter(player) { return !!player.storage.al_released && player.countCards("h") > 0; } } },
   shan: { enable: ["chooseToUse", "chooseToRespond"], position: "h", selectCard: 1, filterCard: true, viewAs: { name: "shan" }, viewAsFilter(player) { return !!player.storage.al_released && player.countCards("h") > 0; }, hiddenCard(player, name) { return name === "shan" && !!player.storage.al_released && player.countCards("h") > 0; }, check(card) { return 6 - get.value(card); }, ai: { respondShan: true, skillTagFilter(player) { return !!player.storage.al_released && player.countCards("h") > 0; } } },
   bonus_used: { charlotte: true },
   bonus: { charlotte: true, forced: true, trigger: { player: "useCard1" }, filter(event, player) { return !!player.storage.al_released && event.card.name === "sha" && !player.hasSkill("al_river_bonus_used"); }, async content(event, trigger, player) { player.addTempSkill("al_river_bonus_used", { global: "phaseAfter" }); trigger.baseDamage = (trigger.baseDamage ?? 1) + 1; } },
  },
 },
 al_river_released: { charlotte: true, mark: true, marktext: "河", intro: { content: "不能再获得命。你可将任意手牌当【杀】或【闪】使用或打出；每回合首次使用的【杀】伤害+1。" }, group: ["al_river_sha", "al_river_shan", "al_river_bonus"] },
}; }
export const alucardTranslate = {
 boss_alucard: "阿卡多｜Boss v6", boss_alucard_ab: "阿卡多", boss_alucard_info: "《HELLSING》｜幻｜6/6体力｜1对3。以亡者的生命抵御致命攻击，以双枪追猎并侵蚀敌人。解放死河后舍弃储命，转入持续进攻。",
 al_life: "命数", al_life_info: "游戏开始时获得2枚“命”（上限4枚）。你击杀一名其他角色后，获得1枚命。每个回合限一次，你对其他角色造成伤害后，摸一张牌。受到致命伤害时，可移去1枚命，防止此次伤害。",
 al_shadow: "血影", al_shadow_info: "每轮限一次，你受到其他角色造成的伤害后，可以获得其一张手牌，然后回复1点体力。",
 al_jackal: "豺狼", al_jackal_info: "你使用【杀】无距离限制且次数上限+1。每个自己的回合限一次，你使用【杀】时，可额外指定一名合法目标，并令其中一名目标须使用至少两张【闪】抵消此杀。",
 al_erosion: "蚀血", al_erosion_info: "每个自己的回合限一次，你以【杀】对其他角色造成伤害后，可令其减少1点体力上限（最低减至2）。若实际减少，你回复1点体力。",
 al_immortal: "不灭", al_immortal_info: "锁定技，防止你受到的非【杀】伤害。不防止体力流失、体力上限减少及直接死亡。",
 al_river: "死河零式", al_river_info: "限定技，第3轮起的出牌阶段，你可以移去全部命，对所有其他角色各造成1点伤害。直到你的下回合开始，你不能成为其他角色使用牌的目标。此后不能获得命，但可将任意手牌当【杀】或【闪】使用或打出，且你每个回合首次使用的【杀】伤害+1。无命也能发动，解放后不灭仍有效。",
 al_river_released: "死河解放", al_river_released_info: "不能再获得命。你可将任意手牌当【杀】或【闪】使用或打出；每回合首次使用的【杀】伤害+1。",
};
