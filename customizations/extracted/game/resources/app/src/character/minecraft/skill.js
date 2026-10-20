import { game, get } from "noname";
const hunted = player => [...new Set(player.getHistory("useCard").flatMap(evt => evt.targets || []))].filter(target => target !== player && target.isIn() && target.getHistory("damage").some(evt => evt.num > 0));
export default {
 mc_choumou: {
  chargeSkill: 0, forced: true, locked: false,
  trigger: { player: "loseAfter", global: ["loseAsyncAfter", "gainAfter", "addToExpansionAfter", "addJudgeAfter", "equipAfter", "phaseBegin"] },
  filter(event, player) {
   if (event.name === "phase") return player.countCharge() === player.getMaxCharge();
   return player.countCharge(true) > 0 && (event.getl?.(player)?.cards2 || []).some(card => !get.is.damageCard(card));
  },
  async content(event, trigger, player) {
   if (trigger.name === "phase") {
    await player.draw();
    player.addMark("mc_choumou", 1, false);
    player.markSkill("charge");
   } else {
    const count = trigger.getl(player).cards2.filter(card => !get.is.damageCard(card)).length;
    player.addCharge(count);
   }
  },
  mod: { maxCharge(player, num) { return num + player.countMark("mc_choumou"); } },
  group: "mc_choumou_spend",
  subSkill: {
   spend: {
    enable: "phaseUse", usable: 1,
    filter(event, player) { return player.countCharge() > 0; },
    async content(event, trigger, player) {
     const result = await player.chooseNumbers("筹谋：选择消耗的蓄力点数", [{ prompt: "消耗点数", min: 1, max: player.countCharge() }]).set("processAI", () => [Math.min(player.countCharge(), 8)]).forResult();
     if (!result.bool || !result.numbers?.length) return;
     const num = result.numbers[0];
     if (!Number.isInteger(num) || num < 1 || num > player.countCharge()) return;
     player.removeCharge(num);
     const chosen = await player.chooseTarget(`筹谋：令至多${num}名角色各获得一张红桃牌`, [1, Math.min(num, game.countPlayer())], true).set("ai", target => get.attitude(player, target)).forResult();
     if (!chosen.bool) return;
     for (const target of chosen.targets) {
      if (!target.isIn()) continue;
      const card = get.cardPile(card => get.suit(card) === "heart", undefined, "random");
      if (card) await target.gain(card, "gain2");
     }
    },
    ai: { order: 8, result: { player: 1 } },
   },
  },
 },
 mc_xianyi: {
  forced: true, trigger: { player: "removeMark" },
  filter(event) { return event.markName === "charge" && event.num >= 4; },
  async content(event, trigger, player) {
   const cards = [];
   for (const [threshold, name] of [[4, "wuzhong"], [6, "wuxie"], [8, "wugu"]]) {
    if (trigger.num < threshold) continue;
    const card = get.discardPile(card => get.name(card) === name);
    if (card) cards.push(card);
   }
   if (cards.length) await player.gain(cards, "gain2");
  },
 },
 mc_xianzhui: {
  trigger: { global: "phaseEnd" },
  filter(event, player) { return hunted(player).length > 0 && event.player.isIn() && event.player.countDiscardableCards(player, "he") > 0; },
  check(event, player) { return get.attitude(player, event.player) < 0 || hunted(player).some(target => get.effect(target, { name: "shunshou" }, player, player) > 0); },
  async content(event, trigger, player) {
   const payment = await player.discardPlayerCard(trigger.player, "he", true).forResult();
   if (!payment.bool) return;
   const card = get.autoViewAs({ name: "shunshou", isCard: true });
   const targets = hunted(player).filter(target => player.canUse(card, target, false));
   const max = targets.length;
   if (!max) return;
   await player.chooseUseTarget({
    card, prompt: `衔追：对至多${max}名本回合曾指定的其他角色使用无距离限制的【顺手牵羊】`,
    selectTarget: [1, max], forced: true,
    filterTarget(card, source, target) { return targets.includes(target) && source.canUse(card, target, false); },
   }).set("nodistance", true);
  },
 },
};
