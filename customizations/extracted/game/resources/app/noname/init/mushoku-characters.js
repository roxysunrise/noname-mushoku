// Shared canonical roster for the game loader and the separately bundled character pack.
const characters = {
 th_mokou: { sex: "female", group: "shen", hp: 2, maxHp: 2, skills: ["th_penglai", "th_fengyi"], img: "image/character/th_mokou.jpg" },
 ac_yuu: { sex: "male", group: "huan", hp: 3, maxHp: 3, skills: ["ac_heyun", "ac_yinhui"], img: "image/character/ac_yuu.jpg" },
 mc_dream: { sex: "male", group: "wang", hp: 4, skills: ["mc_choumou", "mc_xianyi", "mc_xianzhui"], img: "image/character/mc_dream.jpg" },
 mt_rudeus: { sex: "male", group: "huan", hp: 3, skills: ["mt_voiceless", "mt_foresight"] },
 mt_roxy: { sex: "female", group: "huan", hp: 3, skills: ["mt_study", "mt_water", "mt_mentor"] },
 mt_sylphie: { sex: "female", group: "huan", hp: 3, skills: ["mt_heal", "mt_guard"] },
 mt_eris: { sex: "female", group: "huan", hp: 4, skills: ["mt_sword", "mt_resolve"] },
 mt_orsted: { sex: "male", group: "shen", hp: 4, isZhugong: true, skills: ["mt_dragon", "mt_dragonlord"] },
 mt_ruijerd: { sex: "male", group: "huan", hp: 4, skills: ["mt_eye", "mt_protect", "mt_spear"] },
 mt_paul: { sex: "male", group: "huan", hp: 4, skills: ["mt_styles", "mt_rescue"] },
 mt_ghislaine: { sex: "female", group: "huan", hp: 4, skills: ["mt_swordking", "mt_training", "mt_ghislaine_guard"] },
};
for (const [id, character] of Object.entries(characters)) character.img ??= `image/character/${id}.${id.startsWith("ac_") || id.startsWith("mc_") ? "svg" : "jpg"}`;
export default characters;
