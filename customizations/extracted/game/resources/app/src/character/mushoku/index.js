import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import characterIntro from "./intro.js";
import crossover from "./crossover.js";
import mokou from "./mokou.js";
import expansion from "./expansion.js";
import expansionTranslate from "./expansion-translate.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";
// No characterSort: the five factions classify characters; old pack subgroups stay removed.
game.import("character", () => ({ name: "mushoku", connect: true, character,
 skill: { ...skill, ...crossover, ...mokou, ...Object.fromEntries(Object.entries(expansion).filter(([id]) => !id.startsWith("mc_") && id !== "ac_tuiyan")) },
 translate: { ...translate, ...Object.fromEntries(Object.entries(expansionTranslate).filter(([id]) => !id.startsWith("mc_") && !id.startsWith("ac_tuiyan") && id !== "ac_chatgpt")) },
 characterIntro: { ...characterIntro, ac_yumeko: "深渊赌徒。以牌与命运下注，追逐胜负边缘的刺激。", ac_kaito: "月下魔术师。以障眼法在众目睽睽之下夺取宝物。" },
 characterTitle: titlesForPack("mushoku"),
}));
