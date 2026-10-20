import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import characters from "../apps/core/character/mushoku/character.js";
import { sourceRevision, rosterIds, installMushokuCompatibility, getMushokuRestriction, prepareMushokuMode, showMushokuRestriction } from "../apps/core/noname/init/mushoku-compatibility.js";

const plain = value => JSON.parse(JSON.stringify(value));
function library(mode = "identity", settings = {}) {
 const lib = { config: { mode, characters: ["mushoku"], mode_config: { [mode]: settings } }, character: {}, characterPack: { standard: { caocao: { hp: 4, skills: ["jianxiong"] } } }, characterSort: { standard: { old: ["caocao"] } }, characterReplace: { caocao: ["caocao"] }, group: ["wei"], connectCharacterPack: ["standard"], filter: { characterDisabled: () => false } };
 const get = { config: (key, selectedMode = mode) => lib.config.mode_config[selectedMode]?.[key] };
 installMushokuCompatibility(lib);
 return { lib, get };
}

test("every mode installs exactly eight existing characters and unchanged skill sets", () => {
 for (const mode of ["identity", "doudizhu", "versus", "guozhan", "boss", "stone", "chess", "tafang", "single", "brawl", "connect", "extension"]) {
  const { lib } = library(mode);
  assert.deepEqual(Object.keys(lib.character), rosterIds, mode);
  assert.deepEqual(plain(lib.character), plain(characters), mode);
  assert.deepEqual(lib.characterPack.standard, {});
  assert.deepEqual(Object.keys(lib.characterPack.mushoku), rosterIds);
  assert.deepEqual(lib.characterSort, {});
  assert.deepEqual(lib.characterReplace, {});
  assert.deepEqual(lib.group, ["huan", "xu", "wang", "qi", "yi"]);
  assert.deepEqual(lib.connectCharacterPack, ["mushoku"]);
 }
});
test("extension injection and mutations cannot survive the final roster pass", () => {
 const { lib } = library();
 lib.character.caocao = { hp: 99, skills: ["jianxiong"] };
 lib.character.mt_roxy.skills.push("jianxiong");
 lib.characterPack.extension = { caocao: lib.character.caocao };
 installMushokuCompatibility(lib);
 assert.deepEqual(plain(lib.character), plain(characters));
 assert.deepEqual(lib.characterPack.extension, {});
});
test("disabled custom pack stays disabled and cannot restore stock characters", () => {
 const { lib, get } = library();
 lib.config.characters = [];
 installMushokuCompatibility(lib);
 assert.deepEqual(Object.keys(lib.character), []);
 assert.match(getMushokuRestriction(lib, get), /只有 0/);
});
test("identity counts actual unique slots including double generals and bans", () => {
 for (let seats = 2; seats <= 8; seats++) {
  for (const double of [false, true]) {
   const { lib, get } = library("identity", { player_number: seats, double_character: double });
   assert.equal(!!getMushokuRestriction(lib, get), seats * (double ? 2 : 1) > 8);
  }
 }
 const { lib, get } = library("identity", { player_number: 8 });
 lib.filter.characterDisabled = id => id === "mt_roxy";
 assert.match(getMushokuRestriction(lib, get), /只有 7/);
 for (const number of [0, 1, 9, 10, "bad", 3.5]) {
  lib.config.mode_config.identity.player_number = String(number);
  assert.ok(getMushokuRestriction(lib, get));
 }
});
test("special identity variants are blocked instead of restoring factions", () => {
 for (const identity_mode of ["purple", "zhong", "stratagem"]) {
  const { lib, get } = library("identity", { identity_mode });
  assert.ok(getMushokuRestriction(lib, get));
 }
});
test("only supported landlord and versus configurations pass", () => {
 for (const double_character of [false, true]) {
  const { lib, get } = library("doudizhu", { double_character });
  assert.equal(getMushokuRestriction(lib, get), null);
 }
 for (const doudizhu_mode of ["kaihei", "huanle", "binglin", "online"]) {
  const { lib, get } = library("doudizhu", { doudizhu_mode });
  assert.ok(getMushokuRestriction(lib, get));
 }
 const { lib, get } = library("versus", { versus_mode: "two" });
 assert.equal(getMushokuRestriction(lib, get), null);
 lib.config.mode_config.versus.replace_character_two = true;
 assert.ok(getMushokuRestriction(lib, get));
 lib.config.mode_config.versus = { versus_mode: "two", two_assign: true };
 assert.ok(getMushokuRestriction(lib, get));
 for (const versus_mode of ["four", "three", "jiange", "siguo", "guandu", "standard"]) {
  lib.config.mode_config.versus = { versus_mode };
  assert.ok(getMushokuRestriction(lib, get));
 }
});
test("unsupported mode init, startBefore and start never execute, including async switches", () => {
 for (const name of ["guozhan", "boss", "stone", "chess", "tafang", "single", "brawl", "extension"]) {
  const { lib, get } = library(name);
  let displayed;
  lib.mushokuShowRestriction = reason => { displayed = reason; };
  const fail = () => assert.fail("original mode must not run");
  const mode = { name, init: fail, startBefore: fail, start: fail, character: { boss: { skills: ["boss"] } }, characterPack: { stock: {} }, characterSingle: { old: {} }, yingbian_guozhan: { old: {} }, jiangeboss: { old: {} } };
  const adapted = prepareMushokuMode(mode, lib, get);
  assert.equal(adapted.init, undefined);
  assert.equal(adapted.startBefore, undefined);
  adapted.start();
  assert.ok(displayed, name);
  for (const key of ["character", "characterPack", "characterSingle", "yingbian_guozhan", "jiangeboss"]) assert.deepEqual(adapted[key], {});
 }
});
test("Sakura address screen starts without accessing uninitialized room ban filters", () => {
 const { lib, get } = library("connect");
 lib.filter.characterDisabled = () => assert.fail("room filters are not ready before a lobby starts");
 assert.equal(getMushokuRestriction(lib, get), null);
});
test("pre-character-load guard does not suppress supported mode initialization", () => {
 const { lib, get } = library();
 delete lib.mushokuCompatibility;
 lib.character = {};
 const init = () => {}, start = () => {};
 const adapted = prepareMushokuMode({ name: "identity", init, start }, lib, get);
 assert.equal(adapted.init, init);
 assert.equal(adapted.start, start);
});
test("blocked screen has a working recovery action and preserves system menu", () => {
 const nodes = [], saved = [];
 let onfree = 0, arena = 0, reload = 0;
 const lib = { configprefix: "test_", init: { start() {}, startBefore() {}, onfree: () => onfree++ } };
 const game = { saveConfig: (...args) => saved.push(args), reload: () => reload++ };
 const ui = { create: { arena: () => { arena++; ui.arena = {}; }, div: () => { const node = { style: {}, addEventListener: (name, fn) => { node[name] = fn; } }; nodes.push(node); return node; } } };
 globalThis.localStorage = { removeItem: key => assert.equal(key, "test_directstart") };
 try {
  const status = { connectMode: true };
  showMushokuRestriction("reason", lib, game, ui, status);
  assert.equal(status.connectMode, false);
  assert.equal(arena, 1);
  assert.equal(onfree, 1);
  assert.ok(nodes.some(node => node.textContent === "reason"));
  nodes.find(node => node.click).click();
  assert.equal(reload, 1);
  assert.ok(saved.some(args => args[0] === "mode" && args[1] === "identity"));
  assert.equal(lib.init.start, undefined);
 } finally { delete globalThis.localStorage; }
});
test("gameplay mode and card rules remain equal to pinned upstream; connect UI is separate", async () => {
 const files = execFileSync("git", ["ls-tree", "-r", "--name-only", sourceRevision, "apps/core/card", "apps/core/mode"], { encoding: "utf8" }).trim().split(/\r?\n/);
 for (const file of files.filter(file => file !== "apps/core/mode/connect.js")) {
  const before = execFileSync("git", ["show", `${sourceRevision}:${file}`], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }).replace(/\r\n/g, "\n");
  assert.equal((await readFile(new URL(`../${file}`, import.meta.url), "utf8")).replace(/\r\n/g, "\n"), before, file);
 }
});
test("boot checks restrictions after extensions and before starting selection", async () => {
 const source = await readFile(new URL("../apps/core/noname/init/index.ts", import.meta.url), "utf8");
 assert.ok(source.indexOf("const rosterRestriction") > source.indexOf("lib.extensions.map(loadExtension)"));
 assert.ok(source.indexOf("const rosterRestriction") < source.indexOf("if (lib.init.startBefore)"));
 assert.ok(!source.includes("hasMushokuSourceCharacter"));
});
