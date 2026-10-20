import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../apps/core/noname/ui/create/menu/pages/characterPackMenu.js", import.meta.url), "utf8");
class Node {
 constructor(text = "") {
  this.innerHTML = text; this.childNodes = []; this.style = {};
  const classes = new Set();
  this.classList = { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) };
 }
 appendChild(n) { this.childNodes.push(n); n.parentNode = this; return n; }
 get firstChild() { return this.childNodes[0]; }
 get lastChild() { return this.childNodes.at(-1); }
 get children() { return this.childNodes; }
 get childElementCount() { return this.childNodes.length; }
 get nextSibling() { return this.parentNode?.childNodes[this.parentNode.childNodes.indexOf(this) + 1]; }
 querySelector(selector) { return this.childNodes.find(n => selector === ".active" && n.classList.contains("active")); }
}
function run({ favourite = [], banned = [], populated = true, lazy = true, baseline = false } = {}) {
 const left = new Node(), right = new Node(), start = new Node();
 start.appendChild(left); start.appendChild(right);
 const character = { skills: [] };
 const lib = {
  character: populated ? { mt_roxy: character } : {},
  characterPack: { empty: {}, mushoku: populated ? { mt_roxy: character } : {} },
  characterSort: {}, translate: {}, sort: { character: () => 0 }, connectCharacterPack: [],
  config: { show_favourite_menu: true, favouriteCharacter: favourite, show_ban_menu: true,
   identity_banned: banned, all: { mode: ["identity"], characters: ["empty", "mushoku"], sgscharacters: ["mushoku"] }, characters: ["mushoku"] },
 };
 const ui = { create: {
  div(...args) { const n = new Node(typeof args[1] === "string" ? args[1] : ""); args.find(x => x instanceof Node)?.appendChild(n); return n; },
  buttons: () => [],
 } };
 let updateActive;
 const context = { lib, ui, game: {}, get: { config: () => lazy, mode: () => "identity", is: { empty: o => Object.keys(o).length === 0 } },
  _status: {}, menux: {}, menuxpages: [start], createConfig: () => new Node(),
  setUpdateActive: fn => { updateActive = fn; }, updateActive: n => updateActive(n) };
 let code = source.replace(/^import .*;\r?\n/gm, "").replace("export const characterPackMenu", "const characterPackMenu");
 if (baseline) code = code.replace('if (!_info || (!Object.keys(_info).length && mode !== "mode_favourite" && mode !== "mode_banned")) return;', 'if (!_info || !Object.keys(_info).length) return;');
 vm.runInNewContext(`${code}\ncharacterPackMenu(false);`, context);
 return { left, right, ui, lib };
}
test("pre-fix empty-pack filter reproduces an undefined-node crash", () => {
 assert.throws(() => run({ baseline: true }), /Cannot read properties of undefined/);
});
for (const lazy of [true, false]) {
 test(`empty favourites and bans retain hidden nodes with lazy loading ${lazy}`, () => {
  const { left, ui, lib } = run({ lazy });
  assert.equal(ui.favouriteCharacter.node.style.display, "none");
  assert.equal(left.children.find(n => n.mode === "mode_banned").style.display, "none");
  assert.equal(left.children.some(n => n.mode === "empty"), false);
  assert.equal(left.querySelector(".active").mode, "mushoku");
  assert.equal("mode_favourite" in lib.characterPack, false);
 });
}
test("removed favourite and banned IDs are ignored", () => {
 const { ui, left } = run({ favourite: ["caocao"], banned: ["caocao"] });
 assert.equal(ui.favouriteCharacter.node.style.display, "none");
 assert.equal(left.children.find(n => n.mode === "mode_banned").style.display, "none");
});
test("valid favourite and banned entries create visible menus", () => {
 const { ui, left } = run({ favourite: ["mt_roxy"], banned: ["mt_roxy"] });
 assert.notEqual(ui.favouriteCharacter.node.style.display, "none");
 assert.notEqual(left.children.find(n => n.mode === "mode_banned").style.display, "none");
});
test("no characters at all shows the import hint without an active-node crash", () => {
 const { right } = run({ populated: false });
 assert.ok(right.children.some(n => n.innerHTML.includes("暂无角色")));
});
