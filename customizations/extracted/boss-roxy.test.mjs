import test from 'node:test';
import assert from 'node:assert/strict';
import { createBossSkills, bossCharacters, bossTranslate } from './game/resources/app/noname/init/mushoku-boss.js';
import { installMushokuCompatibility, prepareMushokuMode, getMushokuRestriction } from './game/resources/app/noname/init/mushoku-compatibility.js';
const choice = result => ({ set() { return this; }, async forResult() { return result; } });
function fixture() {
 let marks=0, draws=0, heals=0;
 const p={storage:{},hp:10,countMark:()=>marks,addMark:(id,n)=>marks+=n,removeMark:(id,n)=>marks-=n,
  markSkill(){},unmarkSkill(){},draw:async(n=1)=>draws+=n,recover:async()=>heals++,isIn:()=>true,
  chooseBool:()=>choice({bool:true}),logSkill(){},getStat:()=>({}),countCards:()=>1};
 const targets=[1,2,3].map(()=>({isIn:()=>true,hits:0,damage:async function(n,source){assert.equal(source,p);this.hits+=n;}}));
 const game={filterPlayer:fn=>{const list=targets.filter(fn);list.sortBySeat=()=>list;return list;}};
 const s=createBossSkills(game,{type:c=>c.type,color:c=>c.color});
 return {p,s,targets,get marks(){return marks;},get draws(){return draws;},get heals(){return heals;}};
}
test('boss is separate from eleven normal characters, opens 3v1 sequential challenge only',()=>{
 const lib={config:{mode:'boss',characters:['mushoku','minecraft']},character:{},characterPack:{standard:{}},group:[]};
 installMushokuCompatibility(lib);
 assert.equal(Object.keys(lib.character).length,11);
 assert.deepEqual(Object.keys(lib.characterPack.mode_boss),['boss_mt_roxy']);
 assert.equal(bossCharacters.boss_mt_roxy.hp,10);
 assert.equal(getMushokuRestriction(lib,{config:()=>false},'boss'),null);
 const mode=prepareMushokuMode({name:'boss',characterPack:{mode_boss:{stock:{}}}},lib,{config:()=>false},{});
 assert.equal(mode.boss.global.loopType,1); assert.equal(mode.boss.global.chongzheng,0);
 assert.deepEqual(Object.keys(mode.characterPack.mode_boss),['boss_mt_roxy']);
 assert.ok(getMushokuRestriction(lib,{config:k=>k==='double_character'},'boss'));
 lib.config.mode='identity';lib.character.boss_mt_roxy=bossCharacters.boss_mt_roxy;
 installMushokuCompatibility(lib);assert.equal(lib.character.boss_mt_roxy,undefined);
 assert.deepEqual(lib.characterPack.mode_boss,{});
 for(const id of Object.keys(createBossSkills({},{})))assert.ok(bossTranslate[id+'_info']);
});
test('mana initializes once, caps at eight, and trick recharge excludes delayed tricks',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);s.mt_boss_mana.init(p);assert.equal(f.marks,4);
 await s.mt_boss_mana.content({}, {},p);assert.equal(f.marks,7);
 assert.equal(s.mt_boss_mana.subSkill.trick.filter({card:{type:'delay'}},p),false);
 await s.mt_boss_mana.subSkill.trick.content({}, {},p);assert.equal(f.marks,8);
 await s.mt_boss_mana.content({}, {},p);assert.equal(f.marks,8);
});
test('water spirit spends exactly two, heals and draws even at full HP; no frequency limit',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);assert.equal(s.mt_boss_spirit.usable,undefined);
 for(let i=0;i<2;i++){assert.ok(s.mt_boss_spirit.filter({},p));await s.mt_boss_spirit.content({}, {},p);}
 assert.equal(f.marks,0);assert.equal(f.heals,2);assert.equal(f.draws,2);assert.equal(s.mt_boss_spirit.filter({},p),false);
});
test('rain interrupts at cumulative actual three damage and refunds only once',async()=>{
 const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);await s.mt_boss_rain.content({}, {},p);
 assert.equal(f.marks,1);const sub=s.mt_boss_rain.subSkill;
 assert.equal(sub.interrupt.filter({num:0},p),false);
 await sub.interrupt.content({}, {num:2},p);assert.equal(f.draws,0);assert.ok(p.storage.mt_boss_chant);
 await sub.interrupt.content({}, {num:1},p);assert.equal(f.draws,2);assert.equal(f.marks,2);
 assert.equal(sub.interrupt.filter({num:3},p),false);assert.equal(sub.release.filter({},p),false);
});
test('resolve only once at five HP, boosts rain damage and water attack quota',async()=>{
 const f=fixture(),{p,s,targets}=f;s.mt_boss_mana.init(p);assert.equal(s.mt_boss_resolve.filter({},p),false);
 p.getStat=()=>({mt_boss_water:2});assert.equal(s.mt_boss_water.filter({},p),false);
 p.hp=5;assert.ok(s.mt_boss_resolve.filter({},p));await s.mt_boss_resolve.content({}, {},p);
 assert.equal(s.mt_boss_resolve.filter({},p),false);assert.equal(f.marks,7);assert.ok(s.mt_boss_water.filter({},p));
 await s.mt_boss_rain.content({}, {},p);await s.mt_boss_rain.subSkill.release.content({}, {},p);
 assert.deepEqual(targets.map(t=>t.hits),[2,2,2]);assert.equal(p.storage.mt_boss_chant,undefined);
});
test('water attack permits discard defense and otherwise deals exactly one',async()=>{
 for(const defended of [false,true]){
  const f=fixture(),{p,s}=f;s.mt_boss_mana.init(p);let hits=0;
  const target={chooseToDiscard:()=>choice({bool:defended}),isIn:()=>true,damage:async(n,source)=>{assert.equal(source,p);hits+=n;}};
  await s.mt_boss_water.content({target},{},p);assert.equal(f.marks,2);assert.equal(hits,defended?0:1);
 }
});
