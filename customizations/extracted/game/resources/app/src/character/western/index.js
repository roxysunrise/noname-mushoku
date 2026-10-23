import { game } from "noname";
import character from "./character.js";
import allSkills from "../mushoku/skill.js";
import allTranslations from "../mushoku/translate.js";
import expansionSkills from "../mushoku/expansion.js";
import expansionTranslations from "../mushoku/expansion-translate.js";
import allIntros from "../mushoku/intro.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";

const ids = Object.keys(character);
const skillIds = ids.flatMap(id => character[id].skills);
const skills = { ...allSkills, ...expansionSkills };
const translations = { ...allTranslations, ...expansionTranslations };
const keys = new Set([...ids, ...ids.map(id => id + "_ab"), ...skillIds, ...skillIds.map(id => id + "_info"), ...skillIds.map(id => id + "_ab")]);
game.import("character", () => ({
 name: "western", connect: true, character,
 skill: Object.fromEntries(skillIds.filter(id => skills[id]).map(id => [id, skills[id]])),
 translate: { western: "欧美影视", ...Object.fromEntries(Object.entries(translations).filter(([id]) => keys.has(id))) },
 characterIntro: Object.fromEntries(ids.map(id => [id, allIntros[id]])),
 characterTitle: titlesForPack("western"),
}));
