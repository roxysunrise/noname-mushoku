import { game } from "noname";
import character from "./character.js";
import skill from "./skill.js";
import translate from "./translate.js";
import expansion from "../mushoku/expansion.js";
import expansionTranslate from "../mushoku/expansion-translate.js";
import { titlesForPack } from "../../noname/init/mushoku-rosters.js";
game.import("character", () => ({ name: "minecraft", connect: true, character, skill: { ...skill, ...Object.fromEntries(Object.entries(expansion).filter(([id]) => id.startsWith("mc_"))) }, translate: { ...translate, ...Object.fromEntries(Object.entries(expansionTranslate).filter(([id]) => id.startsWith("mc_"))) },
 characterTitle: titlesForPack("minecraft"),
 characterIntro: { mc_dream: "Dream，猎人游戏传奇。筹谋积蓄物资，险逸在绝境中寻找转机。", mc_netherite: "余烬之锋。自下界烈焰中熔铸而生的利刃，攻守随阴阳转换。", mc_chicken: "方块斗士。来自Minecraft的鸡仔战士，异势力，4体力。近身战将任意手牌转化为杀且攻击距离+3；换血以自伤换取下一张杀的伤害增幅；连击为限定技，选定一名角色后全局每回合造成持续压制，以跳过摸牌阶段为代价。" },
}));
