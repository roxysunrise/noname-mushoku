import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import expansion from "../mushoku/expansion.js";
import expansionTranslate from "../mushoku/expansion-translate.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";
game.import("character", () => ({ name: "minecraft", connect: true, character, skill: { ...skill, ...Object.fromEntries(Object.entries(expansion).filter(([id]) => id.startsWith("mc_"))) }, translate: { ...translate, ...Object.fromEntries(Object.entries(expansionTranslate).filter(([id]) => id.startsWith("mc_"))) },
 characterTitle: titlesForPack("minecraft"),
 characterIntro: { mc_dream: "Dream，猎人游戏传奇。筹谋积蓄物资，险逸在绝境中寻找转机。", mc_netherite: "余烬之锋。自下界烈焰中熔铸而生的利刃，攻守随阴阳转换。", mc_chicken: "方块斗士。灰色鸟头、红色西装与黑领带的方块战士，异势力，4体力。近身战将手牌转化为杀并提升攻击距离；换血强化本回合下一张杀；连击在自己接下来两个回合开始时压制同一目标，并跳过自己下一个回合的摸牌阶段。" },
}));
