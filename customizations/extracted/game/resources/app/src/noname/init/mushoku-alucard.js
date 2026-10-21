const blood = player => player.countMark("al_blood");
const addBlood = (player, amount) => {
 if (!player.storage.al_released && blood(player) < 4) player.addMark("al_blood", Math.min(amount, 4 - blood(player)));
};
export const alucardCharacters = {
 boss_alucard: { sex: "male", group: "huan", hp: 3, maxHp: 3, isBoss: true, img: "image/character/boss_alucard.jpg", skills: ["al_immortal", "al_king", "al_erosion", "al_night", "al_dualguns", "al_river"] },
};
export function createAlucardSkills(game, get) { return {
 al_blood: { charlotte: true, mark: true, marktext: "血", intro: { name: "嗜血", content: "嗜血：#/4。可消耗1枚抵消一次杀造成的全部伤害。" } },
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
    addBlood(player, 2);
    player.storage.al_fallen = (game.dead || []).slice();
   }
  },
  mark: true, marktext: "王", intro: { content(storage, player) { return `杀伤害永久+${player.storage.al_fallen?.length ? 1 : 0}。致命伤害保护${player.storage.al_last_stand_used ? "已使用" : "未使用"}。${player.storage.al_released ? "已解放，不能再获得嗜血。" : "每回合首次使用杀造成伤害后获得1枚嗜血，上限4枚。"}`; } },
  trigger: { source: "damageSource" }, forced: true,
  filter(event, player) { return event.num > 0 && event.player !== player && event.card?.name === "sha" && event.getParent("useCard")?.player === player && !player.storage.al_released && !player.hasSkill("al_king_fed"); },
  async content(event, trigger, player) { player.addTempSkill("al_king_fed", { global: "phaseAfter" }); addBlood(player, 1); },
  group: ["al_king_supply", "al_king_shield", "al_king_last_stand", "al_king_death", "al_king_damage", "al_king_seal"],
  subSkill: {
   supply: { charlotte: true, forced: true, trigger: { player: "phaseDrawBegin2" },
    filter(event, player) { return !event.numFixed && player.maxHp > 3; },
    async content(event, trigger, player) { trigger.num += Math.max(0, player.maxHp - 3); } },
   fed: { charlotte: true },
   shield: { charlotte: true, priority: 10, trigger: { player: "damageBegin4" }, filter(event, player) { return event.card?.name === "sha" && event.num > 0 && blood(player) > 0; }, check: () => true,
    async content(event, trigger, player) { player.removeMark("al_blood", 1); trigger.cancel(); } },
   last_stand: { charlotte: true, forced: true, priority: -10, trigger: { player: "damageBegin4" },
    filter(event, player) { return event.num > 0 && event.num >= player.hp + (player.hujia || 0) && !player.storage.al_last_stand_used; },
    async content(event, trigger, player) { player.storage.al_last_stand_used = true; player.syncStorage("al_last_stand_used"); trigger.cancel(); addBlood(player, 1); player.markSkill("al_king"); } },
   death: { charlotte: true, forced: true, trigger: { global: "dieAfter" }, filter(event, player) { return event.player !== player && !(player.storage.al_fallen || []).length; },
    async content(event, trigger, player) { player.markAuto("al_fallen", [trigger.player]); player.markSkill("al_king"); } },
   damage: { charlotte: true, forced: true, trigger: { source: "damageBegin1" }, filter(event, player) { return event.card?.name === "sha" && (player.storage.al_fallen || []).length > 0; },
    async content(event, trigger) { trigger.num++; } },
   seal: { charlotte: true, forced: true, firstDo: true, priority: 100, trigger: { player: "addMark" }, filter(event, player) { return event.markName === "al_blood" && blood(player) > (player.storage.al_released ? 0 : 4); },
    async content(event, trigger, player) { player.removeMark("al_blood", blood(player) - (player.storage.al_released ? 0 : 4)); } },
  },
 },
 al_erosion: {
  locked: true, forced: true, trigger: { source: "damageSource" },
  filter(event, player) { return event.num > 0 && event.player !== player && event.player.isIn() && event.player.maxHp > 2 && event.getParent("phase")?.player === player && !player.storage.al_erosion_turn?.targets.includes(event.player); },
  async content(event, trigger, player) {
   if (!player.hasSkill("al_erosion_turn")) {
    player.addTempSkill("al_erosion_turn", { global: "phaseAfter" });
    player.storage.al_erosion_turn = { targets: [], healed: false };
   }
   const record = player.storage.al_erosion_turn;
   record.targets.push(trigger.player);
   player.syncStorage("al_erosion_turn");
   const before = trigger.player.maxHp;
   await trigger.player.loseMaxHp(Math.min(1, before - 2));
   if (trigger.player.maxHp >= before || !player.isIn()) return;
   if (player.maxHp < 5) await player.gainMaxHp(Math.min(1, 5 - player.maxHp));
   if (!record.healed) { record.healed = true; player.syncStorage("al_erosion_turn"); await player.recover(); }
  },
  subSkill: { turn: { charlotte: true, onremove: true } },
 },
 al_night: {
  locked: true, global: "al_night_lock",
  subSkill: { lock: { mod: { cardEnabled(card, player) {
   if (!["trick", "delay"].includes(get.type(card)) || player.getVEquip(2)) return;
   if (game.hasPlayer(current => current !== player && current.hasSkill("al_night"))) return false;
  } } } },
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
   if (blood(player) >= 2) {
    const selected = await player.chooseTarget("黑犬双枪：可消耗1枚嗜血，令其中一名目标不能响应此杀", (card, source, target) => get.event().al_dualguns_targets.includes(target))
     .set("al_dualguns_targets", trigger.targets).set("ai", target => -get.attitude(player, target)).forResult();
    if (selected.bool) { player.removeMark("al_blood", 1); trigger.directHit.addArray(selected.targets); }
   }
  },
  group: "al_dualguns_steal",
  subSkill: {
   used: { charlotte: true },
   steal: { charlotte: true, trigger: { source: "damageSource" }, filter(event, player) { const use = event.getParent("useCard"); return event.card?.name === "sha" && !!use?.al_dualguns && !use.al_dualguns_stolen && player.maxHp >= 4 && event.player.isIn() && event.player.countGainableCards(player, "h") > 0; }, check: () => true,
    async content(event, trigger, player) { trigger.getParent("useCard").al_dualguns_stolen = true; await player.gainPlayerCard(trigger.player, "h", true); } },
  },
 },
 al_river: {
  enable: "phaseUse", limited: true, skillAnimation: true, animationColor: "fire",
  filter(event, player) { return game.roundNumber >= 3 && !player.storage.al_released; },
  async content(event, trigger, player) {
   player.awakenSkill("al_river");
   player.storage.al_released = true;
   player.syncStorage("al_released");
   if (blood(player) > 0) player.removeMark("al_blood", blood(player));
   player.addTempSkill("al_river_turn", { player: "phaseAfter" });
   const targets = game.filterPlayer(target => target !== player).sortBySeat(player);
   for (const target of targets) {
    if (!player.isIn()) break;
    if (target.isIn()) await target.damage(1, player);
   }
  },
  ai: { order: 9, result: { player(player) { return blood(player) <= 1 && player.countCards("h", { name: "sha" }) >= 2 ? 1 : 0; } } },
  subSkill: { turn: { charlotte: true, mark: true, marktext: "零", intro: { content: "本回合杀无距离限制，使用次数上限+2。" }, mod: { cardUsable(card, player, num) { if (card.name === "sha") return num + 2; }, targetInRange(card) { if (card.name === "sha") return true; } } } },
 },
}; }
export const alucardTranslate = {
 boss_alucard: "阿卡多", boss_alucard_ab: "阿卡多", boss_alucard_info: "幻／男／Boss专属，3/3体力，初始拥有2枚嗜血，上限4枚。三名挑战者对战。",
 al_blood: "嗜血", al_blood_info: "上限4枚。可以消耗1枚，抵消一次杀造成的全部伤害。死河零式释放后永久不能再获得。", al_fallen: "阵亡记录",
 al_immortal: "不灭躯", al_immortal_info: "锁定技，Boss全局规则。你免疫所有体力流失及非【杀】造成的伤害。普通杀、火杀、雷杀等各类【杀】均可正常造成伤害。",
 al_king: "无生之王", al_king_info: "锁定技，摸牌阶段的基础摸牌数为你的体力上限（至少3张）。初始拥有2枚嗜血，上限4枚。每回合限一次，你使用【杀】对其他角色造成伤害后，获得1枚嗜血。受到【杀】伤害时，可消耗1枚嗜血抵消本次全部伤害。每局限一次，受到致命伤害时，防止该伤害并获得1枚嗜血。首次有其他角色阵亡后，你使用【杀】造成的伤害永久+1。死河解放后不能再获得嗜血。",
 al_erosion: "蚀血侵蚀", al_erosion_info: "锁定技，你的回合内，对每名其他角色限一次，你对其造成伤害后，令其体力上限减少1（不能以此减至2以下）。若实际减少，你增加1点体力上限（至多增加至5）；每个自己的回合首次成功削减上限后，你回复1点体力。",
 al_night: "暗影夜宴", al_night_info: "锁定技，其他角色没有装备防具时，不能使用锦囊牌（含普通锦囊、延时锦囊及转化锦囊；判定区已有延时锦囊正常结算）。",
 al_dualguns: "黑犬双枪", al_dualguns_info: "出牌阶段限一次，你使用【杀】时可额外指定一名合法目标。若此时嗜血至少2枚，可消耗1枚令其中一名目标不能响应此杀。此杀造成伤害后，若你的体力上限至少4，可获得受伤目标一张手牌，每次发动至多获得一张。",
 al_river: "死河零式", al_river_info: "限定技，第3轮起的出牌阶段，清空所有嗜血，对所有其他角色各造成1点伤害。本回合使用【杀】无距离限制，使用次数上限+2。此后永久不能获得嗜血；尚未使用的致命伤害保护仍有效。",
};
