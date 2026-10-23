import test from 'node:test';
import assert from 'node:assert/strict';
import { createBossSkills, bossCharacters, bossTranslate } from './game/resources/app/noname/init/mushoku-boss.js';
import { installMushokuCompatibility, prepareMushokuMode, getMushokuRestriction } from './game/resources/app/noname/init/mushoku-compatibility.js';
import characters from './game/resources/app/noname/init/mushoku-characters.js';
import { characterPacks } from './game/resources/app/noname/init/mushoku-rosters.js';
const choice = result => ({ set() { return this; }, async forResult() { return result; } });
test('Johan punishment, selected-source protection, awakening and global terror',async()=>{
 const owner={storage:{},hp:4,maxHp:8,skills:new Set(),drawn:0,
  hasSkill(id){return this.skills.has(id);},addTempSkill(id,expiry){this.skills.add(id);this.expiry=expiry;},
  draw:async function(n=1){this.drawn+=n;},getStat:()=>({jh_control:1}),
  syncStorage(){},markSkill(){},getStorage(id){return this.storage[id]||[];},
  removeSkill(id){this.skills.delete(id);delete this.storage[id];},
  awakenSkill(){},gainMaxHp:async function(n){this.maxHp+=n;},recover:async function(n){this.hp+=n;},addSkill(id){this.skills.add(id);}};
 const enemy={countCards:()=>0,hasSkill:()=>false};const game={countPlayer:fn=>[owner,enemy].filter(fn).length};const s=createBossSkills(game,{});
 const hit={num:1,player:enemy,cancel(){this.cancelled=true;}};
 await s.jh_punishment.content({},hit,owner);assert.equal(hit.num,2);assert.equal(owner.drawn,1);
 await s.jh_crime.content({target:enemy},{},owner);hit.source=enemy;
 assert.equal(s.jh_crime.subSkill.guard.filter(hit,owner),true);await s.jh_crime.subSkill.guard.content({},hit,owner);
 assert.equal(hit.cancelled,true);assert.equal(s.jh_crime.subSkill.guard.filter(hit,owner),false);assert.equal(owner.expiry.player,'phaseBegin');
 assert.equal(s.jh_control.filter({},owner),false);await s.jh_monster.content({}, {},owner);
 assert.equal(owner.maxHp,10);assert.equal(owner.hp,5);assert.equal(s.jh_monster.filter({},owner),false);
 assert.equal(s.jh_control.filter({},owner),true);
 assert.equal(s.jh_terror.subSkill.aura.mod.maxHandcard(enemy,4),3);
 assert.equal(s.jh_terror.subSkill.aura.mod.maxHandcard(owner,6),6);
});

test('Johan control requires handover or attacks all legal other survivors without distance/count',async()=>{
 const owner={},victim={},other={},illegal={};let given=false,used;
 victim.countCards=()=>1;victim.chooseToGive=async(target,zone,n,forced)=>{assert.equal(target,owner);assert.equal(zone,'h');assert.equal(forced,true);given=true;};
 const game={filterPlayer:fn=>[owner,victim,other,illegal].filter(fn)};
 const s=createBossSkills(game,{});await s.jh_control.content({target:victim},{},owner);assert.equal(given,true);
 victim.countCards=()=>0;victim.canUse=(card,target,distance)=>{assert.equal(distance,false);return target!==illegal;};
 victim.useCard=async(card,targets,addCount)=>{used={card,targets,addCount};};
 await s.jh_control.content({target:victim},{},owner);assert.deepEqual(used.targets,[other]);assert.equal(used.addCount,false);
});
function fixture() {
 let marks=0, draws=0, heals=0;
 const p={storage:{},hp:8,countMark:()=>marks,addMark:(id,n)=>marks+=n,removeMark:(id,n)=>marks-=n,
  skills:new Set(),hasSkill(id){return this.skills.has(id);},addTempSkill(id){this.skills.add(id);},markAuto(id,items){this.storage[id]||=[];this.storage[id].push(...items);},
  markSkill(){},unmarkSkill(){},draw:async(n=1)=>draws+=n,recover:async(n=1)=>heals+=n,isIn:()=>true,
  chooseControl:()=>choice({control:'4点魔力'}),logSkill(){},getStat:()=>({}),countCards:()=>1};
 const targets=[1,2,3].map(()=>({isIn:()=>true,hits:0,chooseToDiscard:()=>choice({bool:false}),damage:async function(n,source){assert.equal(source,p);this.hits+=n;}}));
 const game={filterPlayer:fn=>{const list=targets.filter(fn);list.sortBySeat=()=>list;return list;}};
 const s=createBossSkills(game,{type:c=>c.type,color:c=>c.color});
 return {p,s,targets,get marks(){return marks;},get draws(){return draws;},get heals(){return heals;}};
}
test('boss is separate from normal characters, opens 3v1 sequential challenge only',()=>{
 const lib={config:{mode:'boss',characters:[...characterPacks]},character:{},characterPack:{standard:{}},group:[]};
 installMushokuCompatibility(lib);
 assert.equal(Object.keys(lib.character).length,Object.keys(characters).length);
 assert.deepEqual(Object.keys(lib.characterPack.mode_boss),['boss_alucard','boss_mt_roxy','boss_johan']);
 assert.equal(bossCharacters.boss_mt_roxy.hp,6);
 assert.equal(getMushokuRestriction(lib,{config:()=>false},'boss'),null);
 const mode=prepareMushokuMode({name:'boss',characterPack:{mode_boss:{stock:{}}}},lib,{config:()=>false},{});
 assert.equal(mode.boss.global.loopType,1); assert.equal(mode.boss.global.chongzheng,0);
 assert.deepEqual(Object.keys(mode.characterPack.mode_boss),['boss_alucard','boss_mt_roxy','boss_johan']);
 assert.ok(getMushokuRestriction(lib,{config:k=>k==='double_character'},'boss'));
 lib.config.mode='identity';lib.character.boss_mt_roxy=bossCharacters.boss_mt_roxy;
 installMushokuCompatibility(lib);assert.equal(lib.character.boss_mt_roxy,undefined);
 assert.deepEqual(lib.characterPack.mode_boss??{},{});
 for(const id of Object.keys(createBossSkills({},{})))assert.ok(bossTranslate[id+'_info']);
});
test('mana initializes once, caps at eight, and trick recharge excludes delayed tricks',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);s.mt_boss_mana.init(p);assert.equal(f.marks,4);
 await s.mt_boss_mana.content({}, {},p);assert.equal(f.marks,7);
 assert.equal(s.mt_boss_mana.subSkill.trick.filter({card:{type:'delay'}},p),false);
 await s.mt_boss_mana.subSkill.trick.content({}, {},p);assert.equal(f.marks,8);
 await s.mt_boss_mana.content({}, {},p);assert.equal(f.marks,8);
});
test('water spirit spends exactly two, heals and draws even at full HP; twice per play phase',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);assert.equal(s.mt_boss_spirit.usable,2);
 for(let i=0;i<2;i++){assert.ok(s.mt_boss_spirit.filter({},p));await s.mt_boss_spirit.content({}, {},p);}
 assert.equal(f.marks,0);assert.equal(f.heals,2);assert.equal(f.draws,2);assert.equal(s.mt_boss_spirit.filter({},p),false);
});
test('rain interrupts at cumulative actual four damage and refunds only once',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);await s.mt_boss_rain.content({}, {},p);
 assert.equal(f.marks,0);const sub=s.mt_boss_rain.subSkill;
 assert.equal(sub.interrupt.filter({num:0},p),false);
 await sub.interrupt.content({}, {num:2},p);assert.equal(f.draws,0);assert.ok(p.storage.mt_boss_chant);
 await sub.interrupt.content({}, {num:1},p);assert.equal(f.draws,0);assert.ok(p.storage.mt_boss_chant);
 await sub.interrupt.content({}, {num:1},p);assert.equal(f.draws,2);assert.equal(f.marks,1);
 assert.equal(sub.interrupt.filter({num:3},p),false);assert.equal(sub.release.filter({},p),false);
});
test('resolve only once at two HP boosts water quota while preserving fixed rain tiers',async()=>{
 const f=fixture(),{p,s,targets}=f;s.mt_boss_mana.init(p);assert.equal(s.mt_boss_resolve.filter({},p),false);
 p.getStat=()=>({mt_boss_water:2});assert.equal(s.mt_boss_water.filter({},p),false);
 p.hp=3;assert.equal(s.mt_boss_resolve.filter({},p),false);
 p.hp=2;assert.ok(s.mt_boss_resolve.filter({},p));await s.mt_boss_resolve.content({}, {},p);
 assert.equal(s.mt_boss_resolve.filter({},p),false);assert.equal(f.marks,6);assert.equal(f.heals,2);assert.ok(s.mt_boss_water.filter({},p));
 await s.mt_boss_rain.content({}, {},p);await s.mt_boss_rain.subSkill.release.content({}, {},p);
 assert.deepEqual(targets.map(t=>t.hits),[1,1,1]);assert.equal(p.storage.mt_boss_chant,undefined);
});
test('water curtain spends two mana to reduce large damage once per round',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);assert.equal(s.mt_boss_shield.filter({num:1},p),false);
 const hit={num:3};assert.ok(s.mt_boss_shield.filter(hit,p));await s.mt_boss_shield.content({},hit,p);assert.equal(hit.num,2);assert.equal(f.marks,2);assert.equal(s.mt_boss_shield.filter(hit,p),false);
 p.skills.delete('mt_boss_shield_used');assert.ok(s.mt_boss_shield.filter(hit,p));await s.mt_boss_shield.content({},hit,p);assert.equal(f.marks,0);
});
test('water attack cannot repeat its victim; six-mana rain discards then deals damage',async()=>{
 const f=fixture(),{p,s,targets}=f;s.mt_boss_mana.init(p);const t=targets[0];assert.ok(s.mt_boss_water.filterTarget({},p,t));await s.mt_boss_water.content({target:t},{},p);assert.equal(s.mt_boss_water.filterTarget({},p,t),false);assert.ok(s.mt_boss_water.filterTarget({},p,targets[1]));
 p.skills.delete('mt_boss_water_targets');delete p.storage.mt_boss_water_targets;assert.ok(s.mt_boss_water.filterTarget({},p,t));
 targets[0].hits=0;targets[0].chooseToDiscard=()=>choice({bool:true});p.storage.mt_boss_chant={damage:0,cost:6};await s.mt_boss_rain.subSkill.release.content({}, {},p);assert.deepEqual(targets.map(t=>t.hits),[1,1,1]);
});
test('water attack costs one mana and deals one through defense or two otherwise',async()=>{
 for(const defended of [false,true]){
  const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);let hits=0;
  const target={chooseToDiscard:()=>choice({bool:defended,cards:defended?[{}]:[]}),isIn:()=>true,damage:async(n,source)=>{assert.equal(source,p);hits+=n;}};
  await s.mt_boss_water.content({target},{},p);assert.equal(f.marks,3);assert.equal(hits,defended?1:2);
 }
});
