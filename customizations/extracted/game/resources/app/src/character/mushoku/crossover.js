import { lib, game, get } from "noname";
const visibleSkills = player => player.getSkills(null, false, false).filter(id => {
 const info = lib.skill[id];
 return info && !info.charlotte && !info.hiddenSkill && lib.translate[id + "_info"];
});
const learnable = (player, target) => visibleSkills(target).filter(id => !player.hasSkill(id));
export default {
 ac_heyun: {
  enable: "phaseUse", usable: 2,
  filter(event, player) { return visibleSkills(player).length > 0 && game.hasPlayer(target => visibleSkills(player).some(id => target.hasSkill(id))); },
  filterTarget(card, player, target) { return visibleSkills(player).some(id => target.hasSkill(id)); },
  async content(event, trigger, player) {
   const list = visibleSkills(player);
   if (!list.length) return;
   const result = await player.chooseControl(list).set("prompt", "合韵：失去一个技能，然后令所选角色摸两张牌").set("ai", () => list.find(id => (player.additionalSkills.ac_yinhui || []).includes(id)) || list[0]).forResult();
   if (!list.includes(result.control)) return;
   await player.removeSkills(result.control);
   if (event.target.isIn()) await event.target.draw(2);
  },
  ai: { order: 1, result: { target: 1, player(player) { return (player.additionalSkills.ac_yinhui || []).length ? 1 : -1; } } },
 },
 ac_yinhui: {
  trigger: { global: "roundStart" },
  filter(event, player) { return (player.additionalSkills.ac_yinhui || []).length > 0 || game.hasPlayer(target => target !== player && learnable(player, target).length > 0); },
  async content(event, trigger, player) {
   if ((player.additionalSkills.ac_yinhui || []).length) {
    const clear = await player.chooseBool("音洄：是否清除通过音洄获得的技能并重新选择？若保留则不能获得其他技能。").set("ai", () => false).forResult();
    if (!clear.bool) return;
    player.removeAdditionalSkill("ac_yinhui");
   }
   if (!game.hasPlayer(target => target !== player && learnable(player, target).length > 0)) return;
   const chosen = await player.chooseTarget("音洄：选择一名其他角色，获得其一个当前技能", true, (card, source, target) => target !== source && learnable(source, target).length > 0).set("ai", target => Math.max(0, ...learnable(player, target).map(id => get.skillRank(id)))).forResult();
   if (!chosen.bool) return;
   const list = learnable(player, chosen.targets[0]);
   if (!list.length) return;
   const result = await player.chooseControl(list).set("prompt", "音洄：选择要获得的技能").set("ai", () => list.reduce((best, id) => get.skillRank(id) > get.skillRank(best) ? id : best)).forResult();
   if (!(player.additionalSkills.ac_yinhui || []).length && list.includes(result.control) && !player.hasSkill(result.control)) player.addAdditionalSkill("ac_yinhui", result.control);
  },
 },
};
