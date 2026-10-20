// Only choice callbacks cross the network. Keep those independent of module closures.
export function createAiSkills(game, get, lib) {
 const remoteChoice = source => get.infoFuncOL("_noname_func:" + source);
 return {
  ai_banda: {
   trigger: { global: "gainAfter" }, usable: 1,
   filter: (event, player) => event.player !== player && event.player.isIn() && event.cards?.length >= 2,
   check: (event, player) => get.attitude(player, event.player) > 0,
   async content(event, trigger, player) {
    await trigger.player.draw();
    if (player.isIn() && player.countCards("h") < trigger.player.countCards("h")) await player.draw();
   },
  },
  ai_qingyu: {
   enable: "phaseUse", usable: 1, position: "h", selectCard: 1, discard: false, lose: false, delay: false,
   filterCard: true, filterTarget: (card, player, target) => target !== player,
   check: card => 6 - get.value(card),
   async content(event, trigger, player) {
    await player.give(event.cards, event.target);
    if (event.target.isIn() && event.target.countCards("h") <= event.target.hp) await event.target.draw();
   },
   ai: { order: 3, result: { target: 1 } },
  },
  ai_shensuan: {
   enable: "phaseUse", usable: 1, position: "h", selectCard: 1, filterCard: true,
   check: card => 6 - get.value(card),
   async content(event, trigger, player) {
    const cards = await player.draw(2).forResult();
    const drawn = Array.isArray(cards) ? cards : cards?.cards;
    if (drawn?.length === 2 && ["red", "black"].includes(get.color(drawn[0], false)) && get.color(drawn[0], false) === get.color(drawn[1], false)) await player.draw();
   },
   ai: { order: 5, result: { player: 1 } },
  },
  ai_chengsi: {
   trigger: { player: "phaseJieshuBegin" }, direct: true,
   filter: (event, player) => player.countCards("h") >= 3 && game.hasPlayer(target => target !== player),
   async content(event, trigger, player) {
    const result = await player.chooseCardTarget({
     prompt: "澄思：交给一名其他角色一张手牌，若其已受伤则回复1点体力",
     position: "h", selectCard: 1, filterCard: true,
     filterTarget: (card, source, target) => source !== target,
     ai1: remoteChoice("card => 6 - get.value(card)"),
     ai2: remoteChoice("target => get.attitude(_status.event.player, target) * (target.isDamaged() ? 2 : 1)"),
    }).forResult();
    if (!result.bool) return;
    const target = result.targets[0]; player.logSkill("ai_chengsi", target);
    await player.give(result.cards, target);
    if (target.isIn() && target.isDamaged()) await target.recover();
   },
  },
  ai_shenshen: {
   trigger: { global: "damageBegin4" }, usable: 1,
   filter(event, player) {
    const color = get.color(event.card);
    return event.num > 0 && ["red", "black"].includes(color) && player.countCards("h", card => get.color(card) === color && lib.filter.cardDiscardable(card, player, "ai_shenshen")) > 0;
   },
   async cost(event, trigger, player) {
    event.result = await player.chooseToDiscard("h", "审慎：弃置同颜色手牌，令伤害-1", remoteChoice("card => get.color(card) === _status.event.aiDamageColor"))
     .set("aiDamageColor", get.color(trigger.card)).set("aiProtect", get.attitude(player, trigger.player) > 0)
     .set("chooseonly", true).set("ai", remoteChoice("card => _status.event.aiProtect ? 8 - get.value(card) : 0")).forResult();
   },
   async content(event, trigger, player) { await player.discard(event.cards); trigger.num--; },
  },
  ai_chengzhang: {
   trigger: { player: "phaseJieshuBegin" }, forced: true,
   filter: (event, player) => new Set(player.getHistory("useCard").map(evt => get.type2(evt.card)).filter(type => ["basic", "trick", "equip"].includes(type))).size >= 2,
   async content(event, trigger, player) { await player.draw(2); },
  },
  ai_ruiwen: {
   enable: "phaseUse", usable: 1, position: "h", selectCard: 1,
   filterCard: card => ["red", "black"].includes(get.color(card)),
   filterTarget: (card, player, target) => target !== player,
   check: card => 6 - get.value(card),
   async content(event, trigger, player) {
    const target = event.target, color = get.color(event.cards[0], false);
    const result = await target.chooseToDiscard("h", "锐问：弃置同颜色手牌，否则受到1点伤害", remoteChoice("card => get.color(card) === _status.event.aiRuiwenColor"))
     .set("aiRuiwenColor", color).set("ai", remoteChoice("card => 7 - get.value(card)")).forResult();
    if (!result.bool && target.isIn()) await target.damage(1, player);
   },
   ai: { order: 6, result: { target: -1 } },
  },
  ai_zhuiwen: {
   trigger: { player: "shaMiss" }, usable: 1, frequent: true,
   async content(event, trigger, player) { await player.draw(); },
  },
 };
}
