import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import characterIntro from "./intro.js";
// No characterSort: the five factions classify characters; old pack subgroups stay removed.
game.import("character", () => ({ name: "mushoku", connect: true, character, skill, translate, characterIntro }));
