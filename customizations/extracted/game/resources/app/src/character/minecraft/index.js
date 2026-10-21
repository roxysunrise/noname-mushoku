import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import expansion from "../mushoku/expansion.js";
import expansionTranslate from "../mushoku/expansion-translate.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";
game.import("character", () => ({ name: "minecraft", connect: true, character, skill: { ...skill, ...Object.fromEntries(Object.entries(expansion).filter(([id]) => id.startsWith("mc_"))) }, translate: { ...translate, ...Object.fromEntries(Object.entries(expansionTranslate).filter(([id]) => id.startsWith("mc_"))) },
 characterTitle: titlesForPack("minecraft"),
 characterIntro: { mc_dream: "Dream，猎人游戏传奇。筹谋积蓄物资，险逸在绝境中寻找转机，衔追持续追猎。", mc_netherite: "余烬之锋。自下界烈焰中熔铸而生的利刃，攻守随阴阳转换。" },
}));
