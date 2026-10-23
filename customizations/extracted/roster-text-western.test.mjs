import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import characters from './game/resources/app/src/noname/init/mushoku-characters.js';
import translations from './game/resources/app/src/character/mushoku/translate.js';
import intros from './game/resources/app/src/character/mushoku/intro.js';
import { characterPacks, westernCharacterIds, packForCharacter } from './game/resources/app/noname/init/mushoku-rosters.js';
import { installMushokuCompatibility } from './game/resources/app/noname/init/mushoku-compatibility.js';

const root = new URL('./game/resources/app/', import.meta.url);
const packs = {};
const runtime = { lib: { skill: {}, translate: {} }, get: {}, ui: {}, _status: {},
  game: { import(type, create) { const pack = create(); packs[pack.name] = pack; } } };
for (const pack of characterPacks) {
  const source = readFileSync(new URL(`character/${pack}.js`, root), 'utf8')
    .replace(/^import \{(.*?)\} from "noname";/gm,
      (_, names) => `const {${names.replace(/ as /g, ': ')}}=runtime;`);
  vm.runInNewContext(source, { runtime });
}

test('every custom character has a nonempty introduction in its built pack',()=>{
 for(const [name,pack] of Object.entries(packs))for(const id of Object.keys(pack.character)){
  assert.ok(typeof pack.characterIntro[id]==='string'&&pack.characterIntro[id].trim().length>10,`${name}/${id}`);
 }
});

test('all sixteen additions have executable skills rather than registration placeholders', () => {
 for (const id of Object.keys(characters).slice(0,16)) {
  const pack = packs[packForCharacter(id)];
  for (const key of characters[id].skills) {
   const skill = pack.skill[key];
   assert.ok(skill && (skill.trigger || skill.enable || skill.mod || skill.group || skill.inherit), `${id}/${key} is inert`);
  }
 }
});

test('all 16 characters retain every supplied skill text verbatim in built packs', () => {
  const document = readFileSync(new URL('./output/角色更名换势力与技能名-2026-10-21.md', import.meta.url), 'utf8');
  const sections = [...document.matchAll(/^## [幻异]·(.+?)（[^\r\n]+）\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  assert.equal(sections.length, 16);
  let count = 0;
  for (const [, name, body] of sections) {
    const id = Object.keys(characters).find(id => translations[id] === name);
    const pack = packs[packForCharacter(id)];
    assert.ok(pack.character[id], id);
    assert.ok(intros[id] && pack.characterIntro[id], `${id} description`);
    const rules = [...body.matchAll(/^### ([^\r\n]+)\r?\n\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)];
    assert.equal(rules.length, characters[id].skills.length);
    for (const [, name, text] of rules) {
      const skill = characters[id].skills.find(skill => translations[skill] === name);
      assert.ok(skill);
      assert.equal(translations[skill + '_info'], text.trim(), `${skill} source`);
      assert.equal(pack.translate[skill + '_info'], text.trim(), `${skill} built`);
      assert.equal(pack.translate[skill + '_ab'], name, `${skill} full display name`);
      assert.ok(pack.skill[skill], `${skill} registration`);
      count++;
    }
  }
  assert.equal(count, 28);
});

test('western is an independent seven-character pack, without duplicate roster entries', () => {
  assert.equal(packs.western.translate.western, '欧美影视');
  assert.deepEqual(Object.keys(packs.western.character).sort(), [...westernCharacterIds].sort());
  const all = Object.values(packs).flatMap(pack => Object.keys(pack.character));
  assert.equal(all.length, new Set(all).size);
  assert.deepEqual(all.sort(), Object.keys(characters).sort());
  for (const id of westernCharacterIds) assert.equal(packs.mushoku.character[id], undefined);
  for (const id of westernCharacterIds) {
    for (const skill of packs.western.character[id].skills) {
      assert.ok(packs.western.skill[skill], `${id}/${skill} implementation`);
      assert.ok(packs.western.translate[skill], `${id}/${skill} name`);
      assert.ok(packs.western.translate[`${skill}_info`], `${id}/${skill} rules`);
    }
  }
  assert.equal(Object.values(packs).filter(pack => pack.character.ac_santa).length, 1);
});

test('compatibility exposes all four packs and disabling western removes only its characters', () => {
  const lib = { config: { mode: 'identity', characters: [...characterPacks] },
    character: {}, characterPack: {}, group: [], connectCharacterPack: [] };
  installMushokuCompatibility(lib);
  assert.equal(Object.keys(lib.character).length, Object.keys(characters).length);
  assert.deepEqual(lib.connectCharacterPack, characterPacks);
  lib.config.characters = characterPacks.filter(pack => pack !== 'western');
  installMushokuCompatibility(lib);
  assert.equal(Object.keys(lib.character).length, Object.keys(characters).length - 7);
  for (const id of westernCharacterIds) assert.equal(lib.character[id], undefined);
});
