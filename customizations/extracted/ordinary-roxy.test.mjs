import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import roster from './game/resources/app/src/noname/init/mushoku-characters.js';
const lib={skill:{},translate:{}},game={players:[],import(type,fn){const pack=fn();Object.assign(lib.skill,pack.skill);Object.assign(lib.translate,pack.translate);},filterPlayer(fn){const list=this.players.filter(fn);list.sortBySeat=()=>list;return list;}};
const get={type:c=>c.type,color:c=>c.color,value:()=>1};
get.infoFuncOL=src=>vm.runInNewContext(`(${src.slice(13)})`,{get});
const source=(await readFile(new URL('./game/resources/app/character/mushoku.js',import.meta.url),'utf8')).replace(/^import \{(.*?)\} from "noname";/gm,(_,names)=>`const {${names.replace(/ as /g,': ')}}=runtime;`);
vm.runInNewContext(source,{runtime:{lib,game,get,ui:{},_status:{}}});
const s=lib.skill,choice=result=>({set(){return this;},forResult:async()=>result});
function person(){return {storage:{},marks:0,skills:new Set(),drawn:0,hp:2,maxHp:3,hand:[{color:'black'}],
 countMark(){return this.marks;},addMark(id,n){this.marks+=n;},removeMark(id,n){this.marks-=n;},
 countCards(zone,fn){return this.hand.filter(fn||(()=>true)).length;},isIn:()=>true,isDamaged(){return this.hp<this.maxHp;},
 hasSkill(id){return this.skills.has(id);},addSkill(id){this.skills.add(id);},addTempSkill(id,expiry){this.addSkill(id);this.expiry=expiry;},
 removeSkill(id){this.skills.delete(id);s[id]?.onremove?.(this);},markAuto(id,items){this.storage[id].push(...items);},
 syncStorage(){},markSkill(){},unmarkSkill(){},awakenSkill(id){this.awakened=id;},chooseBool:()=>choice({bool:true}),
 async draw(n=1){this.drawn+=n;},async recover(){this.hp=Math.min(this.maxHp,this.hp+1);},async damage(n,source,nature){this.hit={n,source,nature};this.hp-=n;}
};}
test('ordinary Roxy registration replaces the old kit and keeps three HP and Huan faction',()=>{
 assert.equal(roster.mt_roxy.hp,3);assert.equal(roster.mt_roxy.group,'huan');
 assert.deepEqual(roster.mt_roxy.skills,['mt_roxy_mana','mt_roxy_water','mt_roxy_spirit','mt_roxy_rain']);
 const text={mt_roxy_mana:'锁定技，游戏开始时获得2点魔力（上限6）。每轮开始时获得2点魔力。每回合限一次，你使用普通锦囊牌结算结束后，获得1点魔力并摸一张牌。',mt_roxy_water:'出牌阶段限两次，每名角色限选一次。你可以消耗1点魔力并弃置一张黑色手牌，对一名其他角色造成2点伤害；其可以弃置至多两张手牌，每弃置一张，此伤害－1。',mt_roxy_spirit:'出牌阶段限一次，你可以消耗2点魔力，回复1点体力并摸一张牌。',mt_roxy_rain:'限定技，结束阶段，你可以消耗4点魔力开始吟唱。下个回合开始时，对所有其他角色各造成1点雷电伤害。吟唱期间，你累计受到至少2点伤害时，吟唱中断，你摸两张牌。'};
 for(const [id,body] of Object.entries(text))assert.equal(lib.translate[id+'_info'],body);
});
test('mana initializes once, gains two per round up to six, and tricks still draw at the cap',async()=>{
 const p=person();s.mt_roxy_mana.init(p);s.mt_roxy_mana.init(p);assert.equal(p.marks,2);
 for(let i=0;i<3;i++)await s.mt_roxy_mana.content({}, {},p);assert.equal(p.marks,6);
 const trick=s.mt_roxy_mana.subSkill.trick;assert.equal(trick.usable,1);
 for(const type of ['basic','delay'])assert.equal(trick.filter({card:{type}}),false);
 assert.equal(trick.filter({card:{type:'trick'}}),true);await trick.content({}, {},p);assert.equal(p.marks,6);assert.equal(p.drawn,1);
});
test('water costs one mana and hand discard; zero, one and two defensive discards cause two, one and zero damage',async()=>{
 assert.equal(s.mt_roxy_water.usable,2);assert.equal(s.mt_roxy_water.position,'h');
 for(let n=0;n<=2;n++){
  const p=person(),t=person();p.marks=2;
  t.chooseToDiscard=(zone,range)=>{assert.equal(zone,'h');assert.deepEqual(Array.from(range),[1,2]);return choice({bool:n>0,cards:Array(n).fill({})});};
  assert.equal(s.mt_roxy_water.filter({},p),true);assert.equal(s.mt_roxy_water.filterTarget({},p,t),true);
  await s.mt_roxy_water.content({target:t},{},p);assert.equal(p.marks,1);assert.equal(t.hit?.n||0,2-n);
  assert.equal(s.mt_roxy_water.filterTarget({},p,t),false);assert.equal(p.expiry.player,'phaseUseAfter');
  assert.equal(s.mt_roxy_water.filterTarget({},p,p),false);
 }
});
test('spirit spends two mana once per phase, heals and draws even when already healthy',async()=>{
 assert.equal(s.mt_roxy_spirit.usable,1);
 for(const hp of [2,3]){const p=person();p.hp=hp;p.marks=2;await s.mt_roxy_spirit.content({}, {},p);assert.equal(p.marks,0);assert.equal(p.hp,3);assert.equal(p.drawn,1);assert.equal(s.mt_roxy_spirit.filter({},p),false);}
});
test('rain can be declined, costs four once, and gives an independent chant after the limited skill awakens',async()=>{
 const p=person();p.marks=4;p.chooseBool=()=>choice({bool:false});await s.mt_roxy_rain.content({}, {},p);assert.equal(p.marks,4);assert.equal(p.awakened,undefined);
 p.chooseBool=()=>choice({bool:true});await s.mt_roxy_rain.content({}, {},p);assert.equal(p.marks,0);assert.equal(p.awakened,'mt_roxy_rain');assert.equal(p.hasSkill('mt_roxy_chant'),true);
 p.marks=6;assert.equal(s.mt_roxy_rain.filter({},p),false);assert.equal(s.mt_roxy_rain.group,undefined);
});
test('chant interrupts at two cumulative actual damage once, draws two, and prevents release',async()=>{
 for(const hits of [[1,1],[2],[3]]){
  const p=person();p.storage.mt_roxy_chant={damage:0};p.addSkill('mt_roxy_chant');
  const skill=s.mt_roxy_chant.subSkill.interrupt;
  assert.equal(skill.trigger.player,'damageEnd');assert.equal(skill.filter({num:0},p),false);
  for(const num of hits)await skill.content({}, {num},p);
  assert.equal(p.drawn,2);assert.equal(p.storage.mt_roxy_chant,undefined);assert.equal(skill.filter({num:1},p),false);assert.equal(s.mt_roxy_chant.subSkill.release.filter({},p),false);
 }
});
test('next-turn rain clears chant before dealing one thunder damage to each other living character',async()=>{
 const p=person(),a=person(),b=person(),out=person();out.isIn=()=>false;game.players=[p,a,b,out];p.storage.mt_roxy_chant={damage:1};p.addSkill('mt_roxy_chant');
 const release=s.mt_roxy_chant.subSkill.release;assert.equal(release.trigger.player,'phaseBegin');await release.content({}, {},p);
 assert.equal(p.hit,undefined);assert.equal(out.hit,undefined);for(const t of [a,b]){assert.equal(t.hit.n,1);assert.equal(t.hit.nature,'thunder');assert.equal(t.hit.source,p);}
 assert.equal(p.storage.mt_roxy_chant,undefined);assert.equal(p.drawn,0);assert.equal(p.hasSkill('mt_roxy_chant'),false);
});
