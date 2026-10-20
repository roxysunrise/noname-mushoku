import roster from "../../noname/init/mushoku-characters.js";
export default Object.fromEntries(Object.entries(roster).filter(([id]) => id.startsWith("mc_")));
