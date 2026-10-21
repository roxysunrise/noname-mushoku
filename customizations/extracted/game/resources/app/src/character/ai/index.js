import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";
import expansion from "../mushoku/expansion.js";
game.import("character", () => ({ name: "ai", connect: true, character, skill: { ...skill, ac_tuiyan: expansion.ac_tuiyan }, translate, characterTitle: titlesForPack("ai"),
 characterIntro: Object.fromEntries(Object.keys(character).map(id => [id, "由大模型产品风格启发的幻想角色。技能用于游戏创作，不代表模型能力排行或官方设定。"])),
}));
