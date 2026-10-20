const blood = player => player.countMark("al_blood");
export const alucardCharacters = {
 boss_alucard: { sex: "male", group: "huan", hp: 1, maxHp: 1, isBoss: true, img: "image/character/boss_alucard.jpg", skills: ["al_immortal", "al_king", "al_erosion", "al_dualguns", "al_river"] },
};
export function createAlucardSkills(game, get) { return {
 al_blood: { charlotte: true, mark: true, marktext: "血", intro: { name: "嗜血", content: "mark" } },
 al_immortal: {
  locked: true, forced: true, firstDo: true, priority: 100,
  trigger: { player: ["damageBefore", "loseHpBefore"] },
  filter(event) { return event.name === "loseHp" || event.card?.name !== "sha"; },
  async content(event, trigger) { trigger.cancel(); },
  ai: { effect: { target(card) { if (card.name !== "sha" && get.tag(card, "damage")) return "zerotarget"; } } },
 },
 al_king: {
  locked: true,
  init(player) {
   if (!player.storage.al_initialized) {
    player.storage.al_initialized = true;
    if (!player.storage.al_released) player.addMark("al_blood", 2);
    player.storage.al_fallen = (game.dead || []).slice();
   }
  },
  mark: true, marktext: "王", intro: { content(storage, player) { return `杀伤害永久+${(player.storage.al_fallen || []).length}。${player.storage.al_released ? "已解放，不能再获得嗜血。" : "每次自己的准备阶段，嗜血少于2时获得1枚。"}`; } },
  trigger: { player: "phaseZhunbeiBegin" }, forced: true,
  filter(event, player) { return !player.storage.al_released && blood(player) < 2; },
  async content(event, trigger, player) { player.addMark("al_blood", 1); },
  group: ["al_king_shield", "al_king_death", "al_king_damage", "al_king_seal"],
  subSkill: {
   shield: { charlotte: true, trigger: { player: "damageBegin4" }, filter(event, player) { return event.card?.name === "sha" && event.num > 0 && blood(player) > 0; }, check: () => true,
    async content(event, trigger, player) { player.removeMark("al_blood", 1); trigger.cancel(); } },
   death: { charlotte: true, forced: true, trigger: { global: "dieAfter" }, filter(event, player) { return !(player.storage.al_fallen || []).includes(event.player); },
    async content(event, trigger, player) { player.markAuto("al_fallen", [trigger.player]); player.markSkill("al_king"); } },
   damage: { charlotte: true, forced: true, trigger: { source: "damageBegin1" }, filter(event, player) { return event.card?.name === "sha" && (player.storage.al_fallen || []).length > 0; },
    async content(event, trigger, player) { trigger.num += player.storage.al_fallen.length; } },
   seal: { charlotte: true, forced: true, firstDo: true, priority: 100, trigger: { player: "addMark" }, filter(event, player) { return !!player.storage.al_released && event.markName === "al_blood" && blood(player) > 0; },
    async content(event, trigger, player) { player.removeMark("al_blood", blood(player)); } },
  },
 },
 al_erosion: {
  locked: true, forced: true, trigger: { source: "damageSource" },
  filter(event) { return event.num > 0; },
  async content(event, trigger, player) {
   const amount = player.hasSkill("al_river_turn") ? 2 : 1;
   if (trigger.player.isIn()) await trigger.player.loseMaxHp(amount);
   if (player.isIn()) await player.gainMaxHp(amount);
  },
 },
 al_dualguns: {
  trigger: { player: "useCard2" }, direct: true,
  filter(event, player) { return event.card.name === "sha" && event.getParent("phaseUse")?.player === player && !player.hasSkill("al_dualguns_used"); },
  async content(event, trigger, player) {
   const activated = await player.chooseBool("黑犬双枪：强化此杀（每出牌阶段限一次），可以额外指定一名目标").set("ai", () => true).forResult();
   if (!activated.bool) return;
   player.logSkill("al_dualguns");
   player.addTempSkill("al_dualguns_used", { player: "phaseUseAfter" });
   trigger.al_dualguns = true;
   const legal = target => !trigger.targets.includes(target) && player.canUse(trigger.card, target);
   if (game.hasPlayer(legal)) {
    const selected = await player.chooseTarget("黑犬双枪：可额外指定一名目标", (card, source, target) => {
     const use = get.event().al_dualguns_use;
     return !use.targets.includes(target) && source.canUse(use.card, target);
    }).set("al_dualguns_use", { targets: trigger.targets, card: trigger.card }).set("ai", target => -get.attitude(player, target)).forResult();
    if (selected.bool) { trigger.targets.addArray(selected.targets); player.line(selected.targets); }
   }
   if (blood(player) >= 2) trigger.directHit.addArray(game.players);
  },
  group: "al_dualguns_steal",
  subSkill: {
   used: { charlotte: true },
   steal: { charlotte: true, trigger: { source: "damageSource" }, filter(event, player) { return event.card?.name === "sha" && !!event.getParent("useCard")?.al_dualguns && player.maxHp >= 4 && event.player.isIn() && event.player.countGainableCards(player, "h") > 0; },
    async content(event, trigger, player) { await player.gainPlayerCard(trigger.player, "h", true); } },
  },
 },
 al_river: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "fire",
  filter(event, player) { return !player.storage.al_released; },
  async content(event, trigger, player) {
   player.awakenSkill("al_river");
   player.storage.al_released = true;
   player.syncStorage("al_released");
   if (blood(player) > 0) player.removeMark("al_blood", blood(player));
   player.addTempSkill("al_river_turn", { player: "phaseAfter" });
   const targets = game.filterPlayer(target => target !== player).sortBySeat(player);
   for (const target of targets) {
    if (!player.isIn()) break;
    if (target.isIn()) await target.damage(2, player);
   }
  },
  ai: { order: 9, result: { player: 1 } },
  subSkill: { turn: { charlotte: true, mark: true, marktext: "零", intro: { content: "本回合杀无次数、距离限制，蚀血侵蚀翻倍。" }, mod: { cardUsable(card) { if (card.name === "sha") return Infinity; }, targetInRange(card) { if (card.name === "sha") return true; } } } },
 },
}; }
export const alucardTranslate = {
 boss_alucard: "阿卡多", boss_alucard_ab: "阿卡多", boss_alucard_info: "幻／男／Boss专属，1/1体力，初始拥有2枚嗜血。三名挑战者对战。",
 al_blood: "嗜血", al_blood_info: "可以消耗1枚，抵消一次杀造成的全部伤害。死河零式释放后永久不能再获得。", al_fallen: "阵亡记录",
 al_immortal: "不灭躯", al_immortal_info: "锁定技，Boss全局规则。你免疫所有体力流失及非【杀】造成的伤害。普通杀、火杀、雷杀等各类【杀】均可正常造成伤害。",
 al_king: "无生之王", al_king_info: "锁定技，你免疫体力流失。开局拥有2枚嗜血；每次自己的准备阶段，若嗜血少于2枚，获得1枚。受到【杀】伤害时，你可以消耗1枚嗜血抵消本次全部伤害。每有一名角色阵亡，你使用【杀】造成的伤害永久+1（同一角色不重复计算）。",
 al_erosion: "蚀血侵蚀", al_erosion_info: "锁定技，你造成伤害后，受伤角色永久减少1点体力上限，你永久增加1点体力上限。",
 al_dualguns: "黑犬双枪", al_dualguns_info: "出牌阶段限一次，你使用【杀】时可发动此技能，并可额外指定一名目标。若此时嗜血至少2枚，此【杀】不可被响应；此【杀】造成伤害后，若你的体力上限至少4，你可获得受伤目标一张手牌。",
 al_river: "死河零式", al_river_info: "限定技，出牌阶段，清空所有嗜血，对所有其他角色各造成2点伤害。本回合你使用【杀】无次数、无距离限制，蚀血侵蚀的增减体力上限数值改为2。此后永久不能通过任何途径获得嗜血。",
};
