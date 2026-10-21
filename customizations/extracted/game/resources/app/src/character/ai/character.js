import roster from "../../noname/init/mushoku-characters.js";
import { packForCharacter } from "../../noname/init/mushoku-rosters.js";
export default Object.fromEntries(Object.entries(roster).filter(([id]) => packForCharacter(id) === "ai"));
