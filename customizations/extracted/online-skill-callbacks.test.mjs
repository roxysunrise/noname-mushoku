import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the shipped bundle: bundling renames imported lib/get bindings,
// while the network protocol sends function text without its module closure.
const lib = { skill: {}, translate: {}, filter: { cardDiscardable: card => !card.protected } };
const get = { value: () => 1, skillRank: id => id === 'strong' ? 5 : 1, attitude: () => -1 };
get.infoFuncOL = info => vm.runInNewContext(`(${info.slice(13)})`, {lib,get,_status:{}});
const game = { import(type, factory) { const pack = factory(); Object.assign(lib.skill, pack.skill); Object.assign(lib.translate, pack.translate); } };
const source = (await readFile(new URL('./game/resources/app/character/mushoku.js', import.meta.url), 'utf8'))
 .replace(/^import \{(.*?)\} from "noname";/gm, (_, names) => `const {${names.replace(/ as /g, ': ')}} = runtime;`);
vm.runInNewContext(source, { runtime: { lib, get, game, _status: {}, ui: {} } });
const callbacks = [];
const remoteCall = (callback, event, ...args) => vm.runInNewContext(`(${callback.toString()})(...args)`, {
 args, lib, get, _status: { event }, window: {},
});
function choose(result, args = []) {
 const event = { controls: args[0] };
 return { event, set(key, value) { event[key] = value; return this; }, async forResult() { callbacks.push({ args, event }); return result; } };
}

test('bundled Yinhui target filter and AI survive remote function serialization', async () => {
 callbacks.length = 0;
 lib.skill.strong = {}; lib.translate.strong_info = 'Strong';
 const target = { playerid: 'remote', getSkills: () => ['strong'] };
 const player = { playerid: 'host', additionalSkills: {}, hasSkill: () => false,
  chooseTarget: (...args) => choose({ bool: true, targets: [target] }, args),
  chooseControl: (...args) => choose({ control: 'strong' }, args),
  addAdditionalSkill(key, skill) { this.additionalSkills[key] = [skill]; } };
 game.hasPlayer = filter => filter(target);
 game.filterPlayer = filter => [player, target].filter(filter);
 await lib.skill.ac_yinhui.content({}, {}, player);
 const [targetChoice, skillChoice] = callbacks;
 targetChoice.event.player = player;
 assert.equal(remoteCall(targetChoice.args[2], targetChoice.event, null, player, target), true);
 assert.equal(remoteCall(targetChoice.args[2], targetChoice.event, null, player, player), false);
 assert.equal(typeof remoteCall(targetChoice.event.ai, targetChoice.event, target), 'number');
 assert.equal(remoteCall(skillChoice.event.ai, skillChoice.event), 'strong');
 assert.deepEqual(player.additionalSkills.ac_yinhui, ['strong']);
});

test('bundled Haodu card filter and AI survive serialization and retain zero bids', async () => {
 callbacks.length = 0;
 const target = { isIn: () => true, getCards: () => [], damage: async () => {} };
 const player = { storage: {}, isIn: () => true, getCards: () => [], syncStorage() {},
  chooseCardOL: (...args) => choose([{ cards: [] }, { cards: [] }], args),
  chooseControl: (...args) => choose({ control: 'cancel2' }, args) };
 await lib.skill.ac_haodu.content({ target }, {}, player);
 const [cards, effect] = callbacks;
 assert.equal(cards.args[2][0], 0);
 assert.equal(remoteCall(cards.args[5], cards.event, { protected: false }, player), true);
 assert.equal(remoteCall(cards.args[5], cards.event, { protected: true }, player), false);
 assert.equal(remoteCall(cards.event.ai, cards.event, {}), 3);
 assert.equal(remoteCall(effect.event.ai, effect.event), '伤害');
 assert.equal(player.storage.ac_haodu_last.count, 0);
});
