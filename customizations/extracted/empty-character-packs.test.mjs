import test from 'node:test';
import assert from 'node:assert/strict';
import { installMushokuCompatibility } from './game/resources/app/noname/init/mushoku-compatibility.js';
import { characterPacks } from './game/resources/app/noname/init/mushoku-rosters.js';

function state(mode = 'identity') {
 return { config: { mode, characters: ['standard', ...characterPacks.filter(id => id !== 'western')], defaultcharacters: ['standard', ...characterPacks], all: { characters: ['standard','refresh',...characterPacks], cards:['standard'] } }, character: {}, characterPack: { standard:{caocao:{}},refresh:{},mode_boss:{} }, group:[],connectCharacterPack:['standard'],skill:{wushuang:{forced:true}} };
}
test('empty original pack entries disappear from registry and menu configuration', () => {
 const lib=state();installMushokuCompatibility(lib);
 assert.deepEqual(Object.keys(lib.characterPack).sort(), [...characterPacks].sort());
 assert.deepEqual(lib.config.all.characters,characterPacks);
 assert.deepEqual(lib.config.defaultcharacters,characterPacks);
 assert.deepEqual(lib.config.characters,characterPacks.filter(id=>id!=='western'));
 assert.deepEqual(lib.config.all.cards,['standard']);
 assert.ok(lib.skill.wushuang);
 for(const pack of characterPacks)assert.ok(Object.keys(lib.characterPack[pack]).length,pack);
 installMushokuCompatibility(lib);
 assert.deepEqual(Object.keys(lib.characterPack).sort(), [...characterPacks].sort());
});
test('boss challenge retains its populated dedicated boss pack', () => {
 const lib=state('boss');installMushokuCompatibility(lib);
 assert.ok(Object.keys(lib.characterPack.mode_boss).length>0);
 assert.equal(lib.characterPack.standard,undefined);
});
