import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const root = new URL('./game/resources/app/', import.meta.url);
const lib = { skill: {}, translate: {} };
const ui = { selected: { cards: [] } }, _status = {};
const game = { import(type, fn) { const pack = fn(); Object.assign(lib.skill, pack.skill); Object.assign(lib.translate, pack.translate); return pack; } };
const get = { type: card => card.type, type2: card => card.type, tag: (card, tag) => card[tag], value: () => 1,
 is: { damageCard: card => !!card.damage }, suit: card => card.suit, name: card => card.name, autoViewAs: card => card };
const packs = {};
for (const name of ['mushoku', 'minecraft']) {
 const source = (await readFile(new URL(`character/${name}.js`, root), 'utf8')).replace(/^import \{(.*?)\} from "noname";/gm, (_, names) => `const {${names.replace(/ as /g, ': ')}} = runtime;`);
 vm.runInNewContext(source, { runtime: { lib, ui, _status, game: new Proxy(game, { get(target, key) { return key === 'import' ? (type, fn) => { packs[name] = game.import(type, fn); } : target[key]; } }), get } });
}
const skill = lib.skill;
const choice = result => ({ set() { return this; }, async forResult() { return result; } });
get.attitude = () => 1;

test('Mentor supports any other player only during their own turn; only real non-delay tricks grant bonus', async () => {
 const s=skill.mt_mentor; assert.equal(s.round,1); assert.equal(s.limited,undefined);
 let history=[], own=0, other=0;
 const p={isIn:()=>true,draw:async()=>own++};
 const target={isIn:()=>true,draw:async()=>other++,getHistory:(type,fn)=>history.filter(fn)};
 const e={card:{name:'sha'},player:target}; _status.currentPhase=target;
 assert.ok(s.filter(e,p));
 await s.content({},e,p); assert.equal(other,1); assert.equal(own,0);
 history=[{card:{name:'sha',type:'basic'},cards:[{type:'trick'}]}];
 await s.content({},e,p); assert.equal(own,0);
 history=[{card:{type:'delay'}}]; await s.content({},e,p); assert.equal(own,0);
 history=[{card:{type:'trick'}}]; await s.content({},e,p); assert.equal(own,1);
 _status.currentPhase=p; assert.equal(s.filter(e,p),false);
 _status.currentPhase=target; assert.equal(s.filter(e,target),false); _status.currentPhase=null;
});

test('Voiceless grants optional draw only after its own trick-funded attack actually damages', async () => {
 const s=skill.mt_voiceless.subSkill.draw;
 const e={num:1,cards:[{type:'trick'}],getParent:()=>({skill:'mt_voiceless'})};
 assert.ok(s.filter(e));
 assert.equal(s.filter({...e,cards:[{type:'basic'}]}),false);
 assert.equal(s.filter({...e,num:0}),false);
 assert.equal(s.filter({...e,getParent:()=>({skill:'other'})}),false);
 let drawn=0; const target={draw:async()=>drawn++};
 const p={chooseTarget:()=>choice({bool:true,targets:[target]}),logSkill(){}};
 await s.content({},e,p); assert.equal(drawn,1);
 p.chooseTarget=()=>choice({bool:false}); await s.content({},e,p); assert.equal(drawn,1);
});

test('Rescue spends HP and optionally transfers max HP only to a lower-max recipient', async () => {
 const s=skill.mt_rescue; assert.equal(s.round,1); assert.equal(s.limited,undefined);
 for (const [maxHp,accept,expected] of [[3,true,['loseHp','recover','loseMaxHp','gainMaxHp','draw']],[3,false,['loseHp','recover']],[4,true,['loseHp','recover']]]) {
  const actions=[];
  const target={hp:0,maxHp,isIn:()=>true,recover:async()=>actions.push('recover'),gainMaxHp:async()=>{target.maxHp++;actions.push('gainMaxHp');}};
  const p={hp:4,maxHp:4,isIn:()=>true,loseHp:async()=>{p.hp--;actions.push('loseHp');},loseMaxHp:async()=>{p.maxHp--;actions.push('loseMaxHp');},
   draw:async()=>actions.push('draw'),chooseBool:()=>choice({bool:accept})};
  assert.ok(s.filter({player:target},p)); await s.content({},{player:target},p); assert.deepEqual(actions,expected);
  if(accept&&maxHp===3) assert.equal(p.maxHp+target.maxHp,7);
  p.hp=1; assert.equal(s.filter({player:target},p),false);
 }
});

test('Training pays discard, forbids stacking, and buffs only the next-turn first Sha with one reward', async () => {
 const s=skill.mt_training, intent=s.subSkill.intent; let drawn=0,discarded=0;
 const teacher={isIn:()=>true,discard:async()=>discarded++,draw:async()=>drawn++};
 const target={storage:{},isIn:()=>true,addTempSkill:(id,expiry)=>{assert.equal(id,'mt_training_intent');assert.equal(expiry.player,'phaseAfter');}};
 await s.content({cards:[{}],targets:[target]},{},teacher); assert.equal(discarded,1);
 const first={name:'sha'}, second={name:'sha'};
 assert.equal(!!intent.filter({name:'useCard',card:first},target),false);
 await intent.content({}, {name:'phase'},target);
 assert.ok(intent.filter({name:'useCard',card:first},target));
 await intent.content({}, {name:'useCard',card:first},target);
 assert.equal(intent.filter({name:'useCard',card:second},target),false);
 assert.equal(intent.filter({name:'damage',card:second,num:1},target),false);
 const damage={name:'damage',card:first,num:1};
 assert.ok(intent.filter(damage,target)); await intent.content({triggername:'damageBegin1'},damage,target); assert.equal(damage.num,2);
 await intent.content({triggername:'damageSource'},damage,target); await intent.content({triggername:'damageSource'},damage,target); assert.equal(drawn,1);
 let targetFilter;
 const owner={countCards:()=>1,chooseToDiscard:()=>choice({bool:true,cards:[{}]}),chooseTarget:(prompt,filter)=>{targetFilter=filter;return choice({bool:false});}};
 const cost={}; await s.cost(cost,{},owner); assert.equal(cost.result.bool,false); assert.equal(discarded,1);
 assert.equal(targetFilter(null,owner,{hasSkill:()=>true}),false);
 assert.equal(targetFilter(null,owner,{hasSkill:()=>false}),true);
});

test('Ghislaine guard cancels damage before losing HP, with two-card draw and independent Sylphie guard', async () => {
 const s=skill.mt_ghislaine_guard; const actions=[];
 assert.equal(s.usable,1); assert.equal(skill.mt_guard.trigger.global,'damageBegin4');
 assert.ok(packs.mushoku.character.mt_ghislaine.skills.includes('mt_ghislaine_guard'));
 await s.content({}, {cancel:()=>actions.push('cancel')}, {isIn:()=>true,loseHp:async()=>actions.push('loseHp'),draw:async n=>actions.push(n)});
 assert.deepEqual(actions,['cancel','loseHp',2]);
});

test('Eris pays HP without discarding; resolve sums damage points and low-health branch overrides total', async () => {
 const hits=[]; let hp=4;
 const p={get hp(){return hp;},loseHp:async()=>hp--,isPhaseUsing:()=>true};
 const e={card:{name:'sha'},targets:[{}],target:{},getParent:()=>({directHit:{add:t=>hits.push(t)}})};
 assert.ok(skill.mt_sword.filter(e,p)); await skill.mt_sword.content({},e,p); assert.equal(hp,3); assert.deepEqual(hits,[e.target]);
 for(const [health,damage,expected] of [[4,[1,3],4],[3,[1],1],[2,[5],2],[1,[1],2]]) {
  let drawn=0; const owner={hp:health,getHistory:()=>damage.map(num=>({num})),draw:async n=>drawn+=n};
  assert.ok(skill.mt_resolve.filter({},owner)); await skill.mt_resolve.content({}, {},owner); assert.equal(drawn,expected);
 }
 assert.equal(skill.mt_resolve.filter({},{getHistory:()=>[]}),false);
});
test('Mokou stats, Penglai hand limit, distance, conditional draw and dying draw', async () => {
 const info = packs.mushoku.character.th_mokou;
 assert.equal(info.group, 'shen'); assert.equal(info.hp, 2); assert.equal(info.maxHp, 2);
 const s = skill.th_penglai;
 assert.equal(s.mod.maxHandcard({}, 2), 4); assert.equal(s.mod.globalFrom({}, {}, 3), 2);
 let count = 3, damaged = false, drawn = 0;
 const p = { countCards: () => count, isDamaged: () => damaged, chat() {}, draw: async n => drawn += n };
 const draw = { name: 'phaseDraw', num: 2 };
 assert.equal(s.filter(draw,p), false); count = 2; assert.ok(s.filter(draw,p));
 count = 3; damaged = true; assert.ok(s.filter(draw,p));
 await s.content({},draw,p); assert.equal(draw.num,3);
 assert.equal(s.filter({ ...draw, numFixed: true },p),false);
 await s.content({}, {name:'dying'}, p); assert.equal(drawn,2);
});
test('Fengyi maps all suits and accepts only one or two of matching suit', () => {
 const s = skill.th_fengyi;
 for (const [suit,name] of [['heart','tao'],['diamond','sha'],['club','shan'],['spade','wuxie']]) {
  assert.equal(s.viewAs([{suit}],{}).name,name);
  const e = { _backup: { filterCard: card => card.name === name } };
  ui.selected.cards = []; assert.ok(s.filterCard({suit},{},e));
  ui.selected.cards = [{suit}]; assert.ok(s.filterCard({suit},{},e));
  assert.equal(s.filterCard({suit:'none'},{},e),false);
 }
 ui.selected.cards = []; assert.equal(s.viewAs([{suit:'diamond'}],{}).nature,'fire');
 assert.deepEqual(Array.from(s.selectCard),[1,2]);
});
test('Fengyi empowers only double-card USE, adds red base value and blocks responses', async () => {
 game.players = [{},{}];
 const s = skill.th_fengyi.subSkill.empower;
 for (const name of ['sha','tao','shan','wuxie']) {
  const hit = []; const e = {name:'useCard',skill:'th_fengyi',cards:[{},{}],card:{name},baseDamage:1,directHit:{addArray: ps => hit.push(...ps)}};
  assert.ok(s.filter(e)); await s.content({},e);
  assert.equal(hit.length,2); assert.equal(e.nowuxie,true);
  assert.equal(e.baseDamage,['sha','tao'].includes(name)?2:1);
  assert.equal(s.filter({...e,name:'respond'}),false);
  assert.equal(s.filter({...e,cards:[{}]}),false);
 }
});
test('Fengyi black discard permits current player self, rejects response-only and red', async () => {
 const s = skill.th_fengyi.subSkill.discard; let discarded=0;
 const p = {isIn:()=>true,countDiscardableCards:()=>1,discardPlayerCard:async target=>{assert.equal(target,p);discarded++;}};
 _status.currentPhase=p;
 const e = {name:'useCard',skill:'th_fengyi',cards:[{},{}],card:{name:'wuxie'}};
 assert.ok(s.filter(e,p)); await s.content({},e,p); assert.equal(discarded,1);
 assert.equal(s.filter({...e,name:'respond'},p),false);
 assert.equal(s.filter({...e,card:{name:'tao'}},p),false);
 _status.currentPhase=null; assert.equal(!!s.filter(e,p),false);
});
test('two packs expose fifteen distinct characters and complete skill descriptions', () => {
 const characters = { ...packs.mushoku.character, ...packs.minecraft.character };
 assert.equal(Object.keys(characters).length, 15);
 assert.equal(packs.mushoku.translate.mushoku, '二次元');
 assert.equal(packs.minecraft.character.mc_dream.group, 'wang');
 assert.equal(packs.mushoku.character.ac_yuu.hp, 3);
 for (const info of Object.values(characters)) for (const id of info.skills) { assert.ok(skill[id]); assert.ok(lib.translate[id + '_info']); }
});
test('Rudeus converts basics/tricks but not equipment; low-health foresight includes damaging tricks only', () => {
 assert.ok(skill.mt_voiceless.filterCard({ type: 'basic' }));
 assert.ok(skill.mt_voiceless.filterCard({ type: 'trick' }));
 assert.equal(skill.mt_voiceless.filterCard({ type: 'equip' }), false);
 const player = { hp: 2 }, event = { player: {}, card: { type: 'trick', damage: 1 } };
 assert.ok(skill.mt_foresight.filter(event, player));
 player.hp = 3; assert.equal(skill.mt_foresight.filter(event, player), false);
 player.hp = 2; event.card.damage = 0; assert.equal(!!skill.mt_foresight.filter(event, player), false);
});
test('healing gives exactly one bonus card for a trick and resolve uses health threshold', async () => {
 let healed = 0, drawn = 0;
 const player = { isIn: () => true, draw: async (n = 1) => { drawn += n; }, hp: 2 };
 await skill.mt_heal.content({ target: { recover: async () => healed++ }, cards: [{ type: 'trick' }] }, {}, player);
 assert.equal(healed, 1); assert.equal(drawn, 1);
 await skill.mt_resolve.content({}, {}, player); assert.equal(drawn, 3);
});
test('Orsted is god faction with bounded shared power, unrestricted Sha range and conditional rest', async () => {
 assert.equal(packs.mushoku.character.mt_orsted.group, 'shen');
 assert.equal(packs.mushoku.character.mt_orsted.hp, 4);
 const s = skill.mt_dragon; let power = 0, damageHistory = [];
 const p = { storage: {}, addMark: (id,n) => power += n, removeMark: (id,n) => power -= n, countMark: () => power, getHistory: () => damageHistory, isPhaseUsing: () => true };
 s.init(p); s.init(p); assert.equal(power,3);
 assert.equal(s.mod.targetInRange({name:'sha'}),true);
 assert.equal(s.mod.targetInRange({name:'shunshou'}),undefined);
 const attack = {card:{name:'sha'},player:{},num:1};
 assert.ok(s.subSkill.strike.filter(attack,p)); await s.subSkill.strike.content({},attack,p);
 assert.equal(attack.num,2); assert.equal(power,2);
 const hit = {num:1}; assert.ok(s.subSkill.defend.filter(hit,p));
 await s.subSkill.defend.content({},hit,p); assert.equal(hit.num,0); assert.equal(power,1);
 damageHistory = [{}]; assert.equal(s.subSkill.rest.filter({},p),false);
 damageHistory = []; assert.ok(s.subSkill.rest.filter({},p));
 await s.subSkill.rest.content({}, {},p); assert.equal(power,2);
 power=3; assert.equal(s.subSkill.rest.filter({},p),false);
 power=0; assert.equal(s.subSkill.strike.filter(attack,p),false); assert.equal(s.subSkill.defend.filter({num:1},p),false);
});
test('Dragon alliance requires lord identity and accepts only other illusion or god factions', async () => {
 const s=skill.mt_dragonlord; let power=2, drawn=0;
 const ally={group:'shen',draw:async()=>drawn++};
 const p={identity:'zhu',hasZhuSkill:()=>true,countMark:()=>power,addMark:(id,n)=>power+=n,isIn:()=>true,draw:async()=>drawn++,chooseTarget:(prompt,filter)=>{
  assert.ok(filter(null,p,ally)); assert.ok(filter(null,p,{group:'huan'}));
  assert.equal(filter(null,p,{group:'wang'}),false); assert.equal(filter(null,p,p),false);
  return choice({bool:true,targets:[ally]});
 }};
 assert.ok(s.filter({},p)); p.identity='fan'; assert.equal(s.filter({},p),false); p.identity='zhu';
 await s.content({}, {},p); assert.equal(power,3); assert.equal(drawn,2);
 await s.content({}, {},p); assert.equal(power,3);
});
test('Dream starts full at 0/0 and grows cap after drawing, charges by number of non-damage losses', async () => {
 let cap = 0, current = 0, draws = 0;
 const player = { countCharge: remaining => remaining ? cap-current : current, getMaxCharge: () => cap,
 draw: async () => draws++, addMark: (id, num) => cap += num, markSkill() {}, addCharge: n => { current = Math.min(cap, current+n); } };
 assert.ok(skill.mc_choumou.filter({ name: 'phase' }, player));
 await skill.mc_choumou.content({}, { name: 'phase' }, player);
 assert.equal(cap, 1); assert.equal(draws, 1);
 const loss = { name: 'lose', getl: () => ({ cards2: [{}, {}, { damage: 1 }] }) };
 assert.ok(skill.mc_choumou.filter(loss, player));
 cap = 5; await skill.mc_choumou.content({}, loss, player); assert.equal(current, 2);
 assert.equal(skill.mc_choumou.filter({ name: 'phase' }, player), false);
});
test('Xianyi uses cumulative 4/6/8 thresholds and skips missing discard cards', async () => {
 const cards = ['wuzhong', 'wuxie', 'wugu'].map(name => ({ name }));
 get.discardPile = fn => cards.find(fn);
 for (const [num, expected] of [[3,0], [4,1], [5,1], [6,2], [7,2], [8,3]]) {
  let count = 0;
  if (skill.mc_xianyi.filter({ markName: 'charge', num })) await skill.mc_xianyi.content({}, { num }, { gain: async c => count += c.length });
  assert.equal(count, expected);
 }
 get.discardPile = () => undefined;
 await skill.mc_xianyi.content({}, { num: 7 }, { gain: () => assert.fail('no cards should be gained') });
});
test('Choumou spends selected amount once and grants one heart per selected living recipient', async () => {
 let spent = 0, gains = 0;
 const targets = [1,2].map(() => ({ isIn: () => true, gain: async () => gains++ }));
 game.countPlayer = () => 3;
 get.cardPile = fn => { const card = { suit: 'heart' }; assert.ok(fn(card)); return card; };
 const player = { countCharge: () => 5, removeCharge: n => spent += n,
 chooseNumbers: () => choice({ bool: true, numbers: [3] }), chooseTarget: () => choice({ bool: true, targets }) };
 await skill.mc_choumou.subSkill.spend.content({}, {}, player);
 assert.equal(spent, 3); assert.equal(gains, 2);
});
test('Xianzhui requires targeted AND damaged this turn, ignores charge cap, enforces legality and discard payment', async () => {
 const target = { isIn: () => true, getHistory: () => [{num:1}] }, other = { isIn: () => true, getHistory: () => [] }, dead = { isIn: () => false };
 let discarded = 0, use;
 const current = { isIn: () => true, countDiscardableCards: () => 1 };
 const second = { isIn: () => true, getHistory: () => [{num:2,source:other}] };
 const player = { getMaxCharge: () => 0, getHistory: () => [{ targets: [target, target, dead, other, second] }],
 canUse: (card, target) => target !== dead, discardPlayerCard: p => { assert.equal(p, current); discarded++; return choice({bool:true}); },
 chooseUseTarget: options => { use = options; return { set() { return this; } }; } };
 assert.ok(skill.mc_xianzhui.filter({ player: current }, player));
 await skill.mc_xianzhui.content({}, { player: current }, player);
 assert.equal(discarded, 1); assert.equal(use.selectTarget[1], 2);
 assert.ok(use.filterTarget({}, player, target)); assert.equal(use.filterTarget({}, player, other), false);
 assert.ok(use.filterTarget({}, player, second));
 use=undefined;player.discardPlayerCard=()=>choice({bool:false});
 await skill.mc_xianzhui.content({}, {player:current}, player);assert.equal(use,undefined);
 player.getHistory=()=>[{targets:[other]}];assert.equal(skill.mc_xianzhui.filter({player:current},player),false);
});
test('Heyun can target self and discards a skill before drawing two', async () => {
 const actions = [];
 const player = { getSkills: () => ['ac_heyun'], hasSkill: id => id === 'ac_heyun', additionalSkills: {},
 chooseControl: () => choice({ control: 'ac_heyun' }), removeSkills: async id => actions.push(id), isIn: () => true, draw: async n => actions.push(n) };
 assert.ok(skill.ac_heyun.filterTarget(null, player, player));
 await skill.ac_heyun.content({ target: player }, {}, player);
 assert.deepEqual(actions, ['ac_heyun', 2]);
});
test('Yinhui clears only its own borrowed skills and then learns a currently held skill', async () => {
 let cleared, learned;
 const target = { getSkills: () => ['mt_heal', 'internal'] };
 lib.skill.internal = { charlotte: true };
 const player = { additionalSkills: { ac_yinhui: ['mt_eye'] }, hasSkill: () => false,
 chooseBool: () => choice({ bool: true }), removeAdditionalSkill: key => { cleared = key; delete player.additionalSkills[key]; },
 chooseTarget: () => choice({ bool: true, targets: [target] }), chooseControl: () => choice({ control: 'mt_heal' }),
 addAdditionalSkill: (key, id, keep) => learned = [key, id, keep] };
 game.hasPlayer = fn => fn(target);
 await skill.ac_yinhui.content({}, {}, player);
 assert.equal(cleared, 'ac_yinhui'); assert.deepEqual(learned, ['ac_yinhui', 'mt_heal', undefined]);
});

test('Yinhui retaining a stolen skill prevents choosing or gaining any other skill', async () => {
 const p = { additionalSkills: { ac_yinhui: ['mt_eye'] }, chooseBool: () => choice({bool:false}),
  chooseTarget: () => assert.fail('must keep existing skill only'), addAdditionalSkill: () => assert.fail('must not stack skills') };
 await skill.ac_yinhui.content({}, {}, p);
 assert.deepEqual(p.additionalSkills.ac_yinhui, ['mt_eye']);
});

test('Yinhui excludes owned, hidden and helper skills; can learn again after losing its stolen skill', async () => {
 lib.skill.test_hidden = { hiddenSkill: true }; lib.translate.test_hidden_info = 'hidden';
 lib.skill.test_helper = { charlotte: true }; lib.translate.test_helper_info = 'helper';
 const target = { getSkills: () => ['mt_eye', 'mt_heal', 'test_hidden', 'test_helper'] };
 const p = { additionalSkills: {}, hasSkill: id => id === 'mt_eye',
  chooseTarget: () => choice({bool:true,targets:[target]}),
  chooseControl: list => { assert.deepEqual(Array.from(list), ['mt_heal']); return choice({control:'mt_heal'}); },
  addAdditionalSkill: (key,id,keep) => { assert.equal(keep,undefined); p.additionalSkills[key] = [id]; } };
 game.hasPlayer = fn => fn(target);
 assert.ok(skill.ac_yinhui.filter({},p));
 await skill.ac_yinhui.content({}, {}, p);
 assert.deepEqual(p.additionalSkills.ac_yinhui, ['mt_heal']);
});

test('Ruijerd has three skills and Third Eye modifies general distance at the health boundary', () => {
 assert.equal(lib.translate.mt_ruijerd, '杰路德');
 assert.deepEqual(Array.from(packs.mushoku.character.mt_ruijerd.skills), ['mt_eye','mt_protect','mt_spear']);
 for (const [hp, expected] of [[4,3],[3,3],[2,2],[1,2]]) assert.equal(skill.mt_eye.mod.globalFrom({hp},{},4),expected);
});

test('Protect heals low-health recipients before drawing one, otherwise draws two; excludes self and stronger targets', async () => {
 const s = skill.mt_protect;
 const p = {hp:4,countCards:()=>1,discard:async()=>{}};
 for (const [hp, expected] of [[3,['draw:2']],[2,['draw:2']],[1,['recover','draw:1']],[0,['recover','draw:1']]]) {
  const actions=[];
  const target={hp,isIn:()=>true,recover:async()=>{actions.push('recover');target.hp++;},draw:async(n=1)=>actions.push(`draw:${n}`)};
  assert.ok(s.filter({player:target},p));
  await s.content({cards:[{}]},{player:target},p);
  assert.deepEqual(actions,expected);
 }
 p.isIn=()=>true;
 assert.equal(s.filter({player:p},p),false);
 assert.equal(s.filter({player:{hp:5,isIn:()=>true}},p),false);
 assert.equal(s.filter({player:{hp:1,isIn:()=>false}},p),false);
});

test('Spear checks range and legality without normal Sha quota, and forces a hit only at HP <= 1', async () => {
 const s=skill.mt_spear;
 assert.equal(s.usable,1); assert.equal(s.enable,'phaseUse');
 for (const hp of [4,2,1,0]) {
  const target={isIn:()=>true}, far={isIn:()=>true}; let used;
  const p={hp,canUse:(card,t,distance,quota)=>{assert.equal(card.name,'sha');assert.equal(distance,undefined);assert.equal(quota,false);return t===target;},
   useCard:(card,t,addCount)=>{used={card,t,addCount};return used;}};
  game.hasPlayer=fn=>fn(target);
  assert.ok(s.filter({},p)); assert.ok(s.filterTarget(null,p,target));
  assert.equal(s.filterTarget(null,p,far),false); assert.equal(s.filterTarget(null,p,p),false);
  await s.content({target},{},p);
  assert.equal(used.addCount,false); assert.equal(used.directHit?.includes(target) ?? false,hp<=1);
  used=undefined; await s.content({target:far},{},p); assert.equal(used,undefined);
 }
});
test('compatibility preserves both packs, respects disabling one, and rejects duplicate roster shortages', async () => {
 const { installMushokuCompatibility, getMushokuRestriction } = await import(new URL('noname/init/mushoku-compatibility.js', root));
 const state = { character: {}, characterPack: { standard: {} }, config: { characters: ['mushoku', 'minecraft'] }, group: [], connectCharacterPack: [] };
 installMushokuCompatibility(state); assert.equal(Object.keys(state.character).length, 15);
 assert.equal(Object.keys(state.characterPack.minecraft).length, 2);
 state.config.characters = ['mushoku']; installMushokuCompatibility(state);
 assert.equal(Object.keys(state.character).length, 13); assert.equal(state.character.mc_dream, undefined);
 const config = { player_number: 8, double_character: true };
 assert.match(getMushokuRestriction(state, { config: key => config[key] }, 'identity'), /16/);
});
