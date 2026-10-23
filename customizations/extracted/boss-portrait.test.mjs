import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { bossCharacters } from './game/resources/app/noname/init/mushoku-boss.js';

const app = new URL('./game/resources/app/', import.meta.url);
const source = readFileSync(new URL('noname/init/polyfill.js', app), 'utf8');
const start = source.indexOf('Reflect.defineProperty(HTMLDivElement.prototype, "setBackground",');
assert.ok(start >= 0);
const end = source.indexOf('\n});', start);
assert.ok(end > start);

function fixture(characters, skins = {}) {
  class Div {
    style = {};
    setBackgroundImage(value) { this.images = value; }
  }
  const lib = {
    characterPack: { mode_boss: characters },
    config: { skin: skins },
    characterDefaultPicturePath: 'image/character/default_silhouette_',
  };
  const get = { mode: () => 'boss', character: id => characters[id] };
  vm.runInNewContext(source.slice(start, end + 4), { HTMLDivElement: Div, lib, get });
  return id => { const node = new Div(); node.setBackground(id, 'character'); return node.images[0]; };
}

test('registered Boss portraits use their explicit assets, including Johan', () => {
  const resolve = fixture(bossCharacters);
  for (const [id, character] of Object.entries(bossCharacters)) {
    assert.equal(resolve(id), character.img, id);
    assert.ok(existsSync(new URL(character.img, app)), id);
  }
});

test('Boss without an explicit portrait keeps its mode asset path', () => {
  assert.equal(fixture({ boss_stock: { sex: 'male' } })('boss_stock'),
    'image/mode/boss/character/boss_stock.jpg');
});

test('explicit Boss portrait retains configured skin precedence', () => {
  assert.equal(fixture(bossCharacters, { boss_johan: [null, 'image/skin/johan.jpg'] })('boss_johan'),
    'image/skin/johan.jpg');
});
