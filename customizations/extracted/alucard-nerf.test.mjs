import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { alucardCharacters, createAlucardSkills, alucardTranslate } from './game/resources/app/src/noname/init/mushoku-alucard.js';

const game = { roundNumber: 3, dead: [], filterPlayer: () => { const players=[]; players.sortBySeat=()=>players; return players; } };
const get = { value: () => 1, tag: () => true, attitude: () => -1 };
get.infoFuncOL = info => vm.runInNewContext(`(${info.slice(13)})`, {get,_status:{}});

test('life protection accounts for bypassed armor and prevents the entire lethal hit', async () => {
 const skill=createAlucardSkills(game,get).al_life.subSkill.save;
 const p={hp:2,hujia:3,marks:2,countMark(){return this.marks;},hasSkillTag:()=>false,
  removeMark(id,n){this.marks-=n;},chooseBool(){return {set(){return this;},async forResult(){return {bool:true};}};}};
 assert.equal(skill.filter({num:2},p),false);
 assert.equal(skill.filter({num:5},p),true);
 assert.equal(skill.filter({num:2,nohujia:true},p),true);
 p.hasSkillTag=()=>true;
 assert.equal(skill.filter({num:2},p),true);
 const hit={num:7,cancel(){this.cancelled=true;}};
 await skill.content({},hit,p);
 assert.equal(hit.cancelled,true);assert.equal(p.marks,1);
});

test('released first Sha gains exactly one base damage and its once-per-turn marker is registered', async () => {
 const skills=createAlucardSkills(game,get), skill=skills.al_river.subSkill.bonus;
 const registry={...skills};
 for(const [id,info] of Object.entries(skills))for(const [key,value] of Object.entries(info.subSkill||{}))registry[`${id}_${key}`]=value;
 for(const [base,expected] of [[undefined,2],[0,1],[1,2],[3,4]]){
  const active=new Set();
  const p={storage:{al_released:true},hasSkill:id=>active.has(id),addTempSkill(id,expiry){assert.ok(registry[id],`unregistered: ${id}`);active.add(id);assert.deepEqual(expiry,{global:'phaseAfter'});}};
  const use={card:{name:'sha'},baseDamage:base};
  assert.equal(skill.filter(use,p),true);await skill.content({},use,p);
  assert.equal(use.baseDamage,expected);assert.equal(skill.filter(use,p),false);
  active.clear();assert.equal(skill.filter(use,p),true);
 }
});

test('Jackal applies double Shan to exactly one chosen target without weakening higher requirements', async () => {
 for(const prior of [undefined,4]){
  const target={playerid:'victim'}, other={playerid:'other'};
  const skills=createAlucardSkills({hasPlayer:()=>false},get);
  const use={card:{name:'sha'},targets:[target,other],customArgs:{victim:{shanRequired:prior}}};
  const p={chooseBool(){return {set(){return this;},async forResult(){return {bool:true};}};},
   addTempSkill(id,expiry){assert.equal(id,'al_jackal_used');assert.deepEqual(expiry,{global:'phaseAfter'});},
   chooseTarget(prompt,mandatory){assert.equal(mandatory,true);return {set(){return this;},async forResult(){return {bool:true,targets:[target]};}};}};
  await skills.al_jackal.content({},use,p);
  assert.equal(use.customArgs.victim.shanRequired,prior??2);
  assert.equal(use.customArgs.other,undefined);
 }
});

test('Boss v6 is 6/6, carries the shared Leader skill, and starts with two capped lives', () => {
 const character = alucardCharacters.boss_alucard;
 assert.equal(character.hp, 6); assert.equal(character.maxHp, 6);
 assert.deepEqual(character.skills, ['al_life','al_shadow','al_jackal','al_erosion','al_immortal','al_river']);
 const skills = createAlucardSkills(game, get);
 const p = { storage: {}, marks: 0, countMark() { return this.marks; }, addMark(id,n) { this.marks += n; } };
 skills.al_life.init(p); assert.equal(p.marks, 2);
 p.marks = 4; skills.al_life.init(p); assert.equal(p.marks, 4);
 assert.match(alucardTranslate.al_life_info, /击杀一名其他角色后，获得1枚命/);
});

test('life reward only follows this Boss killing another character and stops after release', () => {
 const skills = createAlucardSkills(game, get), p = { storage: {}, marks: 3, countMark() { return this.marks; } };
 const death = { name: 'die', player: {}, source: p };
 assert.equal(skills.al_life.filter(death,p), true);
 p.storage.al_released = true; assert.equal(skills.al_life.filter(death,p), false);
 assert.equal(skills.al_life.filter({name:'die',player:{},source:{}},p), false);
});

test('non-Sha damage is prevented while Sha passes; HP loss is not intercepted', async () => {
 const skills=createAlucardSkills(game,get);
 for(const card of [{name:'juedou'},{name:'sha'},{name:'sha',nature:'fire'},undefined]){
  const hit={card,cancel(){this.cancelled=true;}};
  if(card?.name==='sha') assert.equal(skills.al_immortal.filter(hit),false);
  else { assert.equal(skills.al_immortal.filter(hit),true); await skills.al_immortal.content({},hit); assert.equal(hit.cancelled,true); }
 }
 assert.equal(skills.al_immortal.trigger.player,'damageBefore');
});

test('river is available from round three with zero lives and clears stored lives on release', async () => {
 const skills=createAlucardSkills(game,get), p={storage:{},marks:0,awakenSkill(){},countMark(){return this.marks;},removeMark(id,n){this.marks-=n;},syncStorage(){},addSkill(id){this.skill=id;},addTempSkill(id){this.temp=id;},isIn(){return true;}};
 assert.equal(skills.al_river.filter({},p),true);
 await skills.al_river.content({}, {}, p);
 assert.equal(p.marks,0); assert.equal(p.storage.al_released,true); assert.equal(p.skill,'al_river_released');
 assert.equal(skills.al_river.subSkill.bonus.filter({card:{name:'sha'}},{...p,hasSkill:()=>false}),true);
});

test('full skill text and generated runtime stay aligned with the approved v6 rules', () => {
 assert.match(alucardTranslate.al_jackal_info,/次数上限\+1.*额外指定一名合法目标.*至少两张/);
 assert.match(alucardTranslate.al_erosion_info,/最低减至2/);
 assert.match(alucardTranslate.al_river_info,/第3轮起.*移去全部命.*每个回合首次.*伤害\+1/);
 assert.match(alucardTranslate.al_immortal_info,/不防止体力流失、体力上限减少及直接死亡/);
 assert.equal(readFileSync(new URL('./game/resources/app/src/noname/init/mushoku-alucard.js',import.meta.url),'utf8'),readFileSync(new URL('./game/resources/app/noname/init/mushoku-alucard.js',import.meta.url),'utf8'));
});

test('Boss river target protection lasts across opponents turns until the Boss next turn',async()=>{
 const skills=createAlucardSkills(game,get), expiring={};
 const p={storage:{},countMark:()=>0,awakenSkill(){},syncStorage(){},addSkill(){},addTempSkill(id,expiry){expiring[id]=expiry;},isIn:()=>true};
 await skills.al_river.content({}, {},p);
 assert.deepEqual(expiring.al_river_turn,{player:'phaseBegin'});
 assert.equal(skills.al_river.subSkill.turn.mod.targetEnabled({name:'sha'}, {},p),false);
 assert.equal(skills.al_river.subSkill.turn.mod.targetEnabled({name:'tao'}, p,p),undefined);
 assert.match(alucardTranslate.al_river_info,/直到你的下回合开始/);
});
