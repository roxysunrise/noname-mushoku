import characters from "./mushoku-characters.js";
import { characterPacks, packForCharacter } from "./mushoku-rosters.js";
import { bossCharacters, createBossSkills, bossTranslate } from "./mushoku-boss.js";
import { onlineModes, prepareOnlineMode } from "./mushoku-online-modes.js";
const sourceRevision = "b17a619841f9162b60bc50ffa88a8962c1618b63";
const rosterIds = Object.freeze(Object.keys(characters));
const rosterSet = new Set(rosterIds);
const categories = ["huan", "xu", "wang", "qi", "yi", "shen"];
const packFor = packForCharacter;
const packs = characterPacks;
function installMushokuCompatibility(lib) {
  const isBossMode = lib.config.mode === "boss";
  const hiddenPacks = Object.keys(lib.characterPack).filter((pack) => !packs.includes(pack) && !(isBossMode && pack === "mode_boss"));
  for (const id of Object.keys(lib.character)) if (!rosterSet.has(id) && !(isBossMode && bossCharacters[id])) delete lib.character[id];
  if (isBossMode) lib.characterPack.mode_boss = { ...bossCharacters };
  for (const pack of hiddenPacks) lib.characterPack[pack] = {};
  let availableCount = 0;
  for (const [id, info] of Object.entries(characters)) {
    if (lib.config.characters.includes(packFor(id))) { lib.character[id] = { ...info, skills: info.skills.slice() }; availableCount++; }
    else delete lib.character[id];
  }
  for (const pack of packs) lib.characterPack[pack] = Object.fromEntries(Object.entries(characters).filter(([id]) => packFor(id) === pack).map(([id, info]) => [id, { ...info, skills: info.skills.slice() }]));
  for (const key of Object.keys(lib.characterSort || {})) delete lib.characterSort[key];
  for (const key of Object.keys(lib.characterReplace || {})) delete lib.characterReplace[key];
  if (Array.isArray(lib.config.continue_name)) lib.config.continue_name = [...new Set(lib.config.continue_name.filter((id) => rosterSet.has(id)))];
  if (lib.config.test_game && lib.config.test_game !== "_" && !rosterSet.has(lib.config.test_game)) delete lib.config.test_game;
  lib.group.splice(0, lib.group.length, ...categories);
  // Custom god characters have a fixed faction; do not open vanilla faction reassignment.
  if (lib.selectGroup) lib.selectGroup = lib.selectGroup.filter(group => group !== "shen");
  if (lib.connectCharacterPack) lib.connectCharacterPack.splice(0, lib.connectCharacterPack.length, ...packs);
  lib.mushokuCompatibility = { active: false, strict: true, packs: hiddenPacks, slots: availableCount };
}
function getMushokuRestriction(lib, get, modeName = lib.config.mode, checkAvailability = true) {
  const config = (key) => get.config(key, modeName);
  const double = !!config("double_character");
  let required;
  if (modeName === "connect") return null;
  if (modeName === "identity") {
    if ((config("identity_mode") || "normal") !== "normal") return "此身份玩法依赖额外阵营或专属规则，当前角色池暂不支持。请使用标准身份局。";
    const seats = Number(config("player_number") || 8);
    if (!Number.isInteger(seats) || seats < 2 || seats > 8) return "禁止角色重复上场：标准身份局仅支持 2 至 8 人。";
    required = seats * (double ? 2 : 1);
  } else if (modeName === "doudizhu") {
    if ((config("doudizhu_mode") || "normal") !== "normal") return "此斗地主玩法需要更大的候选池或固定阵营，当前仅开放休闲斗地主。";
    required = 3 * (double ? 2 : 1);
  } else if (modeName === "versus") {
    if ((config("versus_mode") || "two") !== "two") return "当前仅开放欢乐 2 对 2；其他对决玩法需要固定名单、阵营或更大的替补池。";
    if (config("replace_character_two")) return "禁止重复上场：欢乐对决的替补分配尚未适配当前角色池，请关闭替补。";
    if (config("two_assign")) return "禁止重复上场：代替队友选将的原版分配可能与对手重复，请关闭代替队友选将。";
    required = 4;
  } else if (modeName === "boss") {
    if (double) return "Boss挑战当前仅支持单将，请关闭双将。";
    required = 3;
  } else {
    const reasons = {
      guozhan: "国战需要同阵营双将及多阵营规则；当前角色池的阵营分布尚不足以支持原国战玩法。",
      boss: "挑战需要专属 Boss、阶段技能和随从；当前未适配所需的专属角色。",
      stone: "炉石需要职业角色、随从和召唤技能；当前未适配所需的专属角色。",
      tafang: "塔防需要机关单位及持续增援角色；当前未适配所需的专属角色。",
      single: "单挑需要较大的选将及替补池，当前禁止重复约束尚未适配原版选将。",
      chess: "战棋包含专属单位、宝物及可变替补池，尚未满足当前角色池不重复的完整规则约束。",
      brawl: "乱斗包含固定剧情角色、动态角色及随机技能，当前角色池限制下暂时禁用。"
    };
    return reasons[modeName] || "该扩展模式尚未验证当前技能及禁止重复约束，暂时禁用。";
  }
  const available = checkAvailability ? rosterIds.filter((id) => lib.character[id] && !lib.filter?.characterDisabled?.(id)).length : rosterIds.length;
  if (available < required) return `禁止角色重复上场：此配置需要 ${required} 名可用角色，当前启用且未禁用的角色只有 ${available} 名。请减少人数、关闭双将或解除禁将。`;
  return null;
}
function showMushokuRestriction(reason, lib, game, ui, status = {}) {
  status.connectMode = false;
  if (!ui.arena) ui.create.arena();
  lib.init.onfree();
  const panel = ui.create.div(".mushoku-restriction", ui.arena);
  panel.style.cssText = "position:absolute;left:12%;top:22%;width:76%;box-sizing:border-box;padding:28px;background:rgba(15,20,28,.94);border:1px solid #bba16b;border-radius:12px;text-align:center;font-size:20px;line-height:1.8;z-index:100";
  const title = ui.create.div("", panel);
  title.textContent = "当前玩法暂不可用";
  title.style.cssText = "position:static;transform:none;width:auto;height:auto;white-space:normal;font-size:28px;color:#e6c889;margin:0 0 12px";
  for (const text of [reason, "仅使用二次元、AI 与 Minecraft 分类中已启用的角色，禁止重复上场。可通过选项调整玩法配置。"]) {
    const line = ui.create.div("", panel);
    line.textContent = text;
    line.style.cssText = "position:static;transform:none;display:block;width:auto;height:auto;white-space:normal;margin:8px 0";
  }
  const back = ui.create.div(".pointerdiv", panel);
  back.textContent = "返回标准八人身份局";
  back.style.cssText = "position:static;transform:none;width:auto;height:auto;white-space:normal;display:inline-block;margin-top:20px;padding:8px 20px;border:1px solid #bba16b;border-radius:6px;cursor:pointer";
  back.addEventListener("click", () => {
    game.saveConfig("mode", "identity");
    game.saveConfig("identity_mode", "normal", "identity");
    game.saveConfig("player_number", "8", "identity");
    game.saveConfig("double_character", false, "identity");
    localStorage.removeItem(lib.configprefix + "directstart");
    game.reload();
  });
  delete lib.init.start;
  delete lib.init.startBefore;
}
function prepareMushokuMode(mode, lib, get, game) {
  const result = { ...mode, characterSort: {} };
  for (const key of ["character", "characterSingle", "yingbian_guozhan", "jiangeboss", "characterPack"]) if (mode[key]) result[key] = {};
  if (mode.name === "boss") {
    result.characterPack = { mode_boss: { ...bossCharacters } };
    result.skill = { ...mode.skill, ...createBossSkills(game, get) };
    result.translate = { ...mode.translate, ...bossTranslate };
    result.boss = { global: { loopType: 1, chongzheng: 0 }, ...Object.fromEntries(Object.keys(bossCharacters).map(id => [id, {}])) };
  }
  // Online configuration is populated by switchMode after this loader returns.
  // The room validator handles bans and roster capacity when the server starts.
  const online = lib.config.mode === "connect" && onlineModes.includes(mode.name);
  const reason = online ? null : getMushokuRestriction(lib, get, mode.name, !!lib.mushokuCompatibility);
  if (reason) {
    delete result.init;
    delete result.startBefore;
    result.start = () => lib.mushokuShowRestriction?.(reason);
  }
  return online ? prepareOnlineMode(result, lib, get, game) : result;
}
export {
  getMushokuRestriction,
  installMushokuCompatibility,
  prepareMushokuMode,
  rosterIds,
  showMushokuRestriction,
  sourceRevision
};
