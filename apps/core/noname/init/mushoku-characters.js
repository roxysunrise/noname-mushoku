// Shared canonical roster for the game loader and the separately bundled character pack.
const characters = {
 mt_rudeus: { sex: "male", group: "huan", hp: 3, skills: ["mt_voiceless", "mt_foresight"] },
 mt_roxy: { sex: "female", group: "huan", hp: 3, skills: ["mt_study", "mt_water", "mt_mentor"] },
 mt_sylphie: { sex: "female", group: "huan", hp: 3, skills: ["mt_heal", "mt_guard"] },
 mt_eris: { sex: "female", group: "huan", hp: 4, skills: ["mt_sword", "mt_resolve"] },
 mt_orsted: { sex: "male", group: "huan", hp: 4, isZhugong: true, skills: ["mt_dragon", "mt_dragonlord"] },
 mt_ruijerd: { sex: "male", group: "huan", hp: 4, skills: ["mt_eye", "mt_protect"] },
 mt_paul: { sex: "male", group: "huan", hp: 4, skills: ["mt_styles", "mt_rescue"] },
 mt_ghislaine: { sex: "female", group: "huan", hp: 4, skills: ["mt_swordking", "mt_training"] },
};
for (const [id, character] of Object.entries(characters)) character.img = `image/character/${id}.jpg`;
export default characters;
