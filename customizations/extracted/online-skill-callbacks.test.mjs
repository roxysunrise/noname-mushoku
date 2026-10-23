import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAlucardSkills } from './game/resources/app/src/noname/init/mushoku-alucard.js';

// Exercise the shipped bundle: bundling renames imported lib/get bindings,
// while the network protocol sends function text without its module closure.
const lib = { skill: {}, translate: {}, filter: { cardDiscardable: card => !card.protected } };
const get = { value: () => 1, skillRank: id => id === 'strong' ? 5 : 1, attitude: () => -1 };
get.infoFuncOL = info => vm.runInNewContext(`(${info.slice(13)})`, {lib,get,_status:{}});
const game = { import(type, factory) { const pack = factory(); Object.assign(lib.skill, pack.skill); Object.assign(lib.translate, pack.translate); } };
const source = (await readFile(new URL('./game/resources/app/character/mushoku.js', import.meta.url), 'utf8'))
 .replace(/^import \{(.*?)\} from "noname";/gm, (_, names) => `const {${names.replace(/ as /g, ': ')}} = runtime;`);
vm.runInNewContext(source, { runtime: { lib, get, game, _status: {}, ui: {} } });
const minecraftSource = (await readFile(new URL('./game/resources/app/character/minecraft.js', import.meta.url), 'utf8'))
 .replace(/^import \{(.*?)\} from "noname";/gm, (_, names) => `const {${names.replace(/ as /g, ': ')}} = runtime;`);
vm.runInNewContext(minecraftSource, { runtime: { lib, get, game, _status: {}, ui: {} } });
const callbacks = [];
const remoteCall = (callback, event, ...args) => vm.runInNewContext(`(${callback.toString()})(...args)`, {
 args, lib, get, _status: { event }, window: {},
});
function choose(result, args = []) {
 const event = { controls: args[0] };
 return { event, set(key, value) { event[key] = value; return this; }, async forResult() { callbacks.push({ args, event }); return result; } };
}

test('Dream charge number and target AI survive remote serialization', async () => {
 callbacks.length = 0;
 const owner = { countCharge: () => 8, removeCharge() {},
  chooseNumbers: (...args) => choose({ bool: true, numbers: [4] }, args),
  chooseTarget: (...args) => choose({ bool: false }, args) };
 game.countPlayer = () => 3;
 await lib.skill.mc_choumou.subSkill.spend.content({}, {}, owner);
 const [numbers, targets] = callbacks;
 numbers.event.player = targets.event.player = owner;
 assert.deepEqual([...remoteCall(numbers.event.processAI, numbers.event)], [8]);
 assert.equal(typeof remoteCall(targets.event.ai, targets.event, {}), 'number');
});

for (const key of ['mt_voiceless_draw','mt_foresight','mt_guard','mt_dragonlord','mt_protect','mt_rescue','mt_training','ac_xuju','al_jackal']) {
 test('remote choice AI keeps its context: '+key, async () => {
  const target={isIn:()=>true,maxHp:2,recover:async()=>{}};
  const owner={isIn:()=>true,maxHp:4,storage:{ac_haodu_last:{last:'draw',count:0}},countMark:()=>3,
   loseHp:async()=>{},draw:async()=>{},addTempSkill(){},canUse:()=>true};
  let aiChecks=0;
  const select=(kind,args)=>{
   const next=choose({bool:false},args);next.event.player=owner;
   next.forResult=async()=>{
    if(next.event.ai){remoteCall(next.event.ai,next.event,kind==='card'?{}:target);aiChecks++;}
    return {bool:(key==='al_jackal'&&kind==='bool')||(key==='mt_training'&&kind==='card'),cards:[{}]};
   };return next;
  };
  owner.chooseTarget=(...args)=>select('target',args);
  owner.chooseToDiscard=(...args)=>select('card',args);
  owner.chooseBool=(...args)=>select('bool',args);
  game.hasPlayer=()=>true;get.event=()=>({});
  const use={targets:[],card:{name:'sha'}};
  const skill=key==='al_jackal'?createAlucardSkills(game,get).al_jackal:key==='mt_voiceless_draw'?lib.skill.mt_voiceless.subSkill.draw:lib.skill[key];
  await (skill.cost||skill.content)({},key==='al_jackal'?use:{player:target},owner);
  assert.ok(aiChecks>0);
 });
}

test('Anydoor target filter survives remote serialization and preserves one target', async () => {
 callbacks.length = 0;
 lib.filter.targetEnabled2 = () => true; lib.filter.targetInRange = () => true;
 const target = {}, added = {}, owner = { logSkill() {}, chooseTarget: (...args) => choose({ bool: false }, args) };
 const use = { targets: [target], excluded: new Set() };
 const trigger = { card: { name: 'juedou' }, player: {}, getParent: () => use };
 await lib.skill.ac_anydoor.content({}, trigger, owner);
 const selection = callbacks[0], filter = selection.args.find(arg => typeof arg === 'function');
 assert.equal(remoteCall(filter, selection.event, null, owner, target), false);
 assert.equal(remoteCall(filter, selection.event, null, owner, added), true);
 use.targets.push(added);
 assert.equal(remoteCall(filter, selection.event, null, owner, target), true);
});

test('Captain fallback filter survives remote serialization after declined Sha', async () => {
 callbacks.length = 0;
 const enemy = { isIn: () => true }, outside = { isIn: () => true };
 const commanded = { isIn: () => true, inRange: candidate => candidate === enemy, chooseToUse: () => choose({ bool: false }) };
 const owner = { isIn: () => true, logSkill() {}, give: async () => {},
  chooseCardTarget: () => choose({ bool: true, cards: [{}], targets: [commanded] }),
  chooseTarget: (...args) => choose({ bool: false }, args) };
 game.hasPlayer = filter => [owner, commanded, enemy].some(filter);
 await lib.skill.ac_freedomcommand.content({}, {}, owner);
 const selection = callbacks.at(-1), filter = selection.args.find(arg => typeof arg === 'function');
 assert.equal(remoteCall(filter, selection.event, null, owner, enemy), true);
 assert.equal(remoteCall(filter, selection.event, null, owner, commanded), true);
 assert.equal(remoteCall(filter, selection.event, null, owner, owner), false);
 assert.equal(remoteCall(filter, selection.event, null, owner, outside), false);
 commanded.isIn = () => false;
 assert.equal(remoteCall(filter, selection.event, null, owner, enemy), false);
});

test('Deathnote discard filter survives remote serialization and keeps declared category', async () => {
 callbacks.length = 0; get.type2 = card => card.type;
 const source = { isIn: () => true, getCards: () => [{ type: 'trick' }], chooseToDiscard: (...args) => choose({ bool: false }, args) };
 const owner = { logSkill() {}, showCards: async () => {}, recover: async () => {}, chooseCard: () => choose({ bool: true, cards: [{ type: 'basic' }] }) };
 await lib.skill.ac_deathnote.content({}, { source }, owner);
 const selection = callbacks.at(-1), filter = selection.args.find(arg => typeof arg === 'function');
 assert.equal(remoteCall(filter, selection.event, { type: 'basic' }), false);
 assert.equal(remoteCall(filter, selection.event, { type: 'trick' }), true);
});

test('Mustang flame target filter survives serialization and retains only selected living targets', async () => {
 callbacks.length = 0;
 const target = { isIn: () => true, countCards: () => 0, damage: async () => {} };
 const outsider = { isIn: () => true };
 const player = { isIn: () => true, awakenSkill() {}, countMark: () => 2, removeMark() {},
  chooseTarget: (...args) => choose({ bool: true, targets: [target] }, args) };
 await lib.skill.ac_flamealchemy.content({ targets: [target] }, {}, player);
 const selection = callbacks[0];
 assert.equal(remoteCall(selection.args[2], selection.event, null, player, target), true);
 assert.equal(remoteCall(selection.args[2], selection.event, null, player, outsider), false);
 target.isIn = () => false;
 assert.equal(remoteCall(selection.args[2], selection.event, null, player, target), false);
});

test('Hulk gamma duel target filter survives serialization for the victim choosing remotely', async () => {
 callbacks.length = 0;
 const candidate = { isIn: () => true };
 const victim = { isIn: () => true, countGainableCards: () => 1,
  chooseTarget: (...args) => choose({ bool: true, targets: [candidate] }, args) };
 const player = { isIn: () => true, canUse: (card, target) => target === candidate,
  gainPlayerCard: () => choose({ bool: true, cards: [{ type: 'equip' }] }), useCard: async () => {} };
 game.hasPlayer = filter => [player,victim,candidate].some(filter);
 game.filterPlayer = filter => [player,victim,candidate].filter(filter);
 get.type = card => card.type;
 await lib.skill.ac_gammasteal.content({}, { player: victim }, player);
 const selection = callbacks.at(-1);
 const filter = selection.args.find(arg => typeof arg === 'function');
 assert.equal(remoteCall(filter, selection.event, null, victim, candidate), true);
 assert.equal(remoteCall(filter, selection.event, null, victim, victim), false);
 assert.equal(remoteCall(filter, selection.event, null, victim, player), false);
 candidate.isIn = () => false;
 assert.equal(remoteCall(filter, selection.event, null, victim, candidate), false);
});

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
