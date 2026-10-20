import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import characters from "../apps/core/character/mushoku/character.js";
import translate from "../apps/core/character/mushoku/translate.js";
const source = await readFile(new URL("../apps/core/character/mushoku/skill.js", import.meta.url), "utf8");
const game = { hasPlayer: fn => game.players.some(fn), players: [] };
let currentEvent = {};
const lib = { inpile: ["huogong", "tiesuo", "guohe", "shunshou", "juedou", "wuxie", "tao"] };
const get = {
 type: c => c?.type, type2: c => c?.type === "delay" ? "trick" : c?.type,
 suit: c => c?.suit || "none", color: c => ["heart", "diamond"].includes(c.suit) ? "red" : ["club", "spade"].includes(c.suit) ? "black" : "none",
 position: c => c.position || "h", attitude: () => 1, value: () => 1, event: () => currentEvent, translation: s => s,
 autoViewAs: (card, cards) => ({ ...card, cards }),
};
const skills = vm.runInNewContext(source.replace(/^import .*;\r?\n/, "").replace("export default skills;", "skills;"), { game, get, lib });
const card = (suit, type = "basic", position = "h") => ({ suit, type, position });
const choice = result => ({ set(key, value) { this[key] = value; return this; }, async forResult() { return result; } });
const matches = (c, filter) => !filter || (typeof filter === "function" ? filter(c) : Object.entries(filter).every(([k, v]) => c[k] === v));
function player(extra = {}) {
 return {
  storage: {}, marks: {}, hand: [], equips: [], history: [], hp: 3, drawn: 0, healed: 0, discarded: 0, given: [], identity: "fan", name: "test",
  countMark(k) { return this.marks[k] || 0; }, addMark(k, n) { this.marks[k] = this.countMark(k) + n; }, removeMark(k, n) { this.marks[k] = this.countMark(k) - n; },
  syncStorage() {}, async draw(n = 1) { this.drawn += n; }, async recover(n = 1) { this.healed += n; }, async loseHp() { this.hp--; }, async discard(cards) { this.discarded += cards.length; },
  async give(cards, target) { this.given.push({ cards, target }); }, awakenSkill(k) { this.storage[k] = true; },
  isIn: () => true, isPhaseUsing: () => true, hasZhuSkill: () => true,
  getCards(pos) { return [...(pos.includes("h") ? this.hand : []), ...(pos.includes("e") ? this.equips : [])]; },
  countCards(pos, filter) { return this.getCards(pos).filter(c => matches(c, filter)).length; },
  getHistory(type, filter) { return this.history.filter(evt => !filter || filter(evt)); }, ...extra,
 };
}

test("exactly eight huan characters have skills and matching descriptions", () => {
 assert.equal(Object.keys(characters).length, 8);
 for (const [id, c] of Object.entries(characters)) { assert.equal(c.group, "huan"); assert.ok(translate[id]); for (const s of c.skills) { assert.ok(skills[s]); assert.ok(translate[s + "_info"]); } }
 assert.equal(characters.mt_orsted.isZhugong, true);
});

test("voiceless uses two suits and respects disabled cards and the engine card filter", () => {
 const p = player(), s = skills.mt_voiceless;
 for (const [suit, name] of [["diamond", "huogong"], ["club", "tiesuo"]]) {
  const c = card(suit); assert.equal(s.filterCard(c, p, {}), true); assert.equal(s.viewAs([c], p).name, name);
  assert.equal(s.filterCard(c, p, { _backup: { filterCard: () => false } }), false);
 }
 assert.equal(s.filterCard(card("heart"), p, {}), false); assert.equal(s.viewAs([], p), null);
 lib.inpile = lib.inpile.filter(n => n !== "huogong");
 assert.equal(s.filterCard(card("diamond"), p, {}), false); lib.inpile.push("huogong");
});

test("Roxy learns only one new trick suit per own end, never from basic or suitless cards", async () => {
 const p = player();
 p.history = [{ card: card("heart") }, { card: card("none", "trick") }];
 assert.equal(skills.mt_study.filter({}, p), false);
 p.history = ["heart", "club", "diamond", "spade"].map(s => ({ card: card(s, "trick") }));
 await skills.mt_study.content({}, {}, p);
 assert.equal(p.countMark("mt_study"), 1); assert.deepEqual([...p.storage.mt_study_suits], ["heart"]);
 p.history = [{ card: card("heart", "trick") }]; assert.equal(skills.mt_study.filter({}, p), false);
 for (const suit of ["club", "diamond", "spade"]) { p.history = [{ card: card(suit, "delay") }]; assert.equal(skills.mt_study.filter({}, p), true); await skills.mt_study.content({}, {}, p); }
 assert.equal(p.countMark("mt_study"), 4); assert.equal(skills.mt_study.filter({}, p), false); assert.equal(p.drawn, 0);
 await skills.mt_study.content({}, {}, p); assert.equal(p.countMark("mt_study"), 4);
});

test("water unlocks red materials at two and equipped materials only at four without bypassing card rules", () => {
 const p = player(), s = skills.mt_water, black = card("spade"), red = card("heart"), equip = card("club", "equip", "e");
 assert.equal(s.filterCard(black, p, {}), true); assert.equal(s.viewAs([black], p).name, "guohe");
 assert.equal(s.filterCard(red, p, {}), false); assert.equal(s.filterCard(equip, p, {}), false);
 p.marks.mt_study = 2; assert.equal(s.filterCard(red, p, {}), true); assert.equal(s.viewAs([red], p).name, "shunshou"); assert.equal(s.filterCard(equip, p, {}), false);
 p.marks.mt_study = 4; assert.equal(s.filterCard(equip, p, {}), true);
 assert.equal(s.filterCard(black, p, { _backup: { filterCard: () => false } }), false);
 assert.equal(s.filterCard(card("none"), p, {}), false);
 assert.equal(s.filterTarget, undefined); assert.equal(s.mod, undefined);
});

test("foresight demands the incoming suit, excludes only owner and excludes delayed tricks", async () => {
 const p = player({ hand: [card("heart")] }), other = player(), parent = { excluded: new Set() };
 const trigger = { card: { ...card("heart", "trick"), name: "guohe" }, player: other, getParent: () => parent };
 assert.equal(skills.mt_foresight.filter(trigger, p), true);
 assert.equal(skills.mt_foresight.filter({ ...trigger, card: card("club", "trick") }, p), false);
 assert.equal(skills.mt_foresight.filter({ ...trigger, card: card("heart", "delay") }, p), false);
 assert.equal(skills.mt_foresight.filter({ ...trigger, card: card("none", "trick") }, p), false);
 let filter;
 p.chooseToDiscard = (...args) => { filter = args.find(a => typeof a === "function"); return currentEvent = choice({ bool: true, cards: p.hand }); };
 const event = {}; await skills.mt_foresight.cost(event, trigger, p);
 assert.equal(filter(card("heart")), true); assert.equal(filter(card("spade")), false);
 await skills.mt_foresight.content({ cards: p.hand }, trigger, p);
 assert.equal(p.discarded, 1); assert.equal(parent.excluded.size, 1); assert.ok(parent.excluded.has(p)); currentEvent = {};
});

test("Sylphie shares the heart-card budget for peach and protection, protection cannot target herself", async () => {
 const heart = card("heart"), p = player({ hand: [heart] }), victim = player();
 assert.equal(skills.mt_heal.filterCard(heart), true); assert.equal(skills.mt_heal.filterCard(card("diamond")), false);
 assert.equal(skills.mt_heal.viewAs.name, "tao"); assert.equal(skills.mt_heal.enable, "chooseToUse");
 const damage = { player: victim, num: 1 };
 assert.equal(skills.mt_guard.filter(damage, p), true); assert.equal(skills.mt_guard.filter({ ...damage, player: p }, p), false);
 await skills.mt_guard.content({ cards: [heart] }, damage, p);
 assert.equal(damage.num, 0); assert.equal(p.given[0].target, victim); assert.equal(p.given[0].cards[0], heart); assert.equal(p.discarded, 0);
});

test("Eris requires same-suit extra cost and a single sha target; equipment duel has a real material", async () => {
 const p = player({ hand: [card("club")] }), t = player(), parent = { directHit: new Set() };
 const e = { card: { ...card("club"), name: "sha" }, targets: [t], target: t, getParent: () => parent };
 assert.equal(skills.mt_sword.filter(e, p), true);
 assert.equal(skills.mt_sword.filter({ ...e, targets: [t, player()] }, p), false);
 assert.equal(skills.mt_sword.filter({ ...e, card: { ...card("heart"), name: "sha" } }, p), false);
 assert.equal(skills.mt_sword.filter({ ...e, card: { name: "sha" } }, p), false);
 await skills.mt_sword.content({ cards: p.hand }, e, p); assert.equal(p.discarded, 1); assert.equal(parent.directHit.size, 1); assert.ok(parent.directHit.has(t));
 assert.equal(skills.mt_resolve.filterCard(card("heart", "equip")), true); assert.equal(skills.mt_resolve.filterCard(card("heart")), false); assert.equal(skills.mt_resolve.viewAs.name, "juedou");
});

test("dragon counterspell spends finite resource only on confirmed use and cannot reset on reacquisition", () => {
 const p = player({ hand: [card("club", "delay")] }), s = skills.mt_dragon;
 s.init(p); s.init(p); assert.equal(p.countMark("mt_dragon"), 3); assert.equal(s.viewAs.name, "wuxie");
 assert.equal(s.viewAsFilter(p), true); assert.equal(p.countMark("mt_dragon"), 3);
 assert.equal(s.filterCard(card("heart")), false);
 for (let i = 0; i < 3; i++) s.onuse({}, p);
 assert.equal(s.viewAsFilter(p), false); assert.equal(s.hiddenCard(p, "wuxie"), false);
 s.init(p); assert.equal(p.countMark("mt_dragon"), 0);
});

test("lord replenishment requires actual lord and enabled skill, and caps at three", async () => {
 const p = player(); assert.equal(skills.mt_dragonlord.filter({}, p), false);
 p.identity = "zhu"; assert.equal(skills.mt_dragonlord.filter({}, p), true);
 p.hasZhuSkill = () => false; assert.equal(skills.mt_dragonlord.filter({}, p), false); p.hasZhuSkill = () => true;
 for (let i = 0; i < 8; i++) await skills.mt_dragonlord.content({}, {}, p);
 assert.equal(p.countMark("mt_dragon"), 3); assert.equal(skills.mt_dragonlord.filter({}, p), false); assert.equal(p.drawn, 0);
});

test("Ruijerd transfers only the actual gained card and never retaliates against himself", async () => {
 const stolen = card("spade"), unrelated = card("heart"), source = player({ hand: [stolen] }), victim = player({ hp: 2 });
 const p = player({ hand: [stolen, unrelated], gainPlayerCard: () => choice({ bool: true, cards: [stolen] }) });
 const e = { player: victim, source };
 assert.equal(skills.mt_protect.filter(e, p), true); assert.equal(skills.mt_protect.filter({ ...e, source: p }, p), false); assert.equal(skills.mt_protect.filter({ ...e, source: undefined }, p), false);
 await skills.mt_protect.content({}, e, p); assert.equal(p.given.length, 1); assert.equal(p.given[0].cards.length, 1); assert.equal(p.given[0].cards[0], stolen); assert.equal(p.given[0].target, victim);
 p.hand = [unrelated]; await skills.mt_protect.content({}, e, p); assert.equal(p.given.length, 1);
 let viewed = 0; p.chooseToGuanxing = async n => viewed = n; await skills.mt_eye.content({}, {}, p); assert.equal(viewed, 2);
});

test("Paul's three branches share one activation and use genuine tricks", () => {
 const p = player();
 for (const [type, name] of [["basic", "juedou"], ["equip", "guohe"], ["trick", "tiesuo"], ["delay", "tiesuo"]]) {
  const c = card("club", type); assert.equal(skills.mt_styles.filterCard(c, p, {}), true); assert.equal(skills.mt_styles.viewAs([c], p).name, name);
 }
 assert.equal(skills.mt_styles.usable, 1); assert.equal(skills.mt_styles.filterTarget, undefined);
});

test("swordking removes equipment without increasing damage", async () => {
 const t = player({ equips: [card("club", "equip", "e")] }); let removed;
 const p = player({ async discardPlayerCard(target, position, forced) { removed = { target, position, forced }; } });
 const e = { card: { name: "sha" }, target: t, targets: [t], num: 1 };
 assert.equal(skills.mt_swordking.filter(e, p), true); await skills.mt_swordking.content({}, e, p);
 assert.equal(removed.target, t); assert.equal(removed.position, "e"); assert.equal(e.num, 1);
 t.equips = []; assert.equal(skills.mt_swordking.filter(e, p), false);
});

test("all three bonds recognize their named recipient and are limited", async () => {
 const p = player(), rudeus = player({ name: "mt_rudeus" });
 assert.equal(skills.mt_mentor.filter({ player: player() }, p), false);
 await skills.mt_mentor.content({}, { player: rudeus }, p); assert.equal(p.drawn, 1); assert.equal(rudeus.drawn, 1); assert.equal(skills.mt_mentor.filter({ player: rudeus }, p), false);
 const rescuer = player(); rudeus.hp = 0; await skills.mt_rescue.content({}, { player: rudeus }, rescuer);
 assert.equal(rescuer.hp, 2); assert.equal(rudeus.healed, 1); assert.equal(rescuer.drawn, 1); assert.equal(skills.mt_rescue.filter({ player: rudeus }, rescuer), false);
 assert.equal(skills.mt_rescue.filter({ player: rudeus }, player({ hp: 1 })), false);
 const eris = player({ name: "mt_eris" }), gear = card("club", "equip"), teacher = player({ hand: [gear] }); game.players = [eris, teacher];
 assert.equal(skills.mt_training.filter({}, teacher), true); assert.equal(skills.mt_training.filterTarget({}, teacher, rudeus), false);
 await skills.mt_training.content({ cards: [gear], target: eris }, {}, teacher);
 assert.equal(teacher.given[0].target, eris); assert.equal(teacher.drawn, 1); assert.equal(skills.mt_training.filter({}, teacher), false);
 for (const name of ["mt_mentor", "mt_rescue", "mt_training"]) assert.equal(skills[name].limited, true);
});

test("repeatable conversion and reaction skills declare limits", () => {
 for (const s of ["mt_study", "mt_voiceless", "mt_water", "mt_heal", "mt_guard", "mt_protect", "mt_sword", "mt_resolve", "mt_styles", "mt_swordking", "mt_foresight", "mt_dragon"]) assert.equal(skills[s].usable, 1);
});
