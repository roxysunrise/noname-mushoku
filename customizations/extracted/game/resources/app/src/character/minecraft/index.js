import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
game.import("character", () => ({ name: "minecraft", connect: true, character, skill, translate,
 characterTitle: { mc_dream: "逐猎幻踪" },
 characterIntro: { mc_dream: "Dream，猎人游戏传奇。筹谋积蓄物资，险逸在绝境中寻找转机，衔追持续追猎。" },
}));
