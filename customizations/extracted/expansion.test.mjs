import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAlucardSkills, alucardCharacters } from './game/resources/app/noname/init/mushoku-alucard.js';
const root = new URL('./game/resources/app/', import.meta.url);
const lib = {skill:{},translate:{},filter:{cardDiscardable:c=>!c.protected}};
const get={suit:c=>c.suit,color:c=>c.color,type:c=>c.type,value:()=>1,attitude:()=>-1};
const game={players:[],dead:[],hasPlayer:fn=>game.players.some(fn),import(type,fn){const p=fn();Object.assign(lib.skill,p.skill);Object.assign(lib.translate,p.translate);}};
for(const pack of ['mushoku','minecraft']) {
 const source=(await readFile(new URL(`character/${pack}.js`,root),'utf8')).replace(/^import \{(.*?)\} from "noname";/gm,(_,names)=>`const {${names.replace(/ as /g,': ')}}=runtime;`);
 vm.runInNewContext(source,{runtime:{lib,game,get,ui:{selected:{cards:[]}},_status:{}}});
}
const s=lib.skill;
const choice=result=>({set(){return this;},forResult:async()=>result});
function person(){
 const p={storage:{},hp:4,maxHp:4,hand:[],equip:[],skills:new Set(),marks:{},drawn:0,hits:0,
  isIn:()=>true,isDamaged(){return this.hp<this.maxHp;},getCards(zone){return [...(zone.includes('h')?this.hand:[]),...(zone.includes('e')?this.equip:[])];},
  countCards(zone,fn){return this.getCards(zone).filter(c=>typeof fn!=='function'||fn(c)).length;},
  countGainableCards(source,zone){return this.countCards(zone);},
  getStorage(key){return this.storage[key]||[];},hasSkill(id){return this.skills.has(id);},
  addTempSkill(id,expiry){this.skills.add(id);this.expiry=expiry;},
  markAuto(key,items){this.storage[key]||=[];for(const item of items)if(!this.storage[key].includes(item))this.storage[key].push(item);},
  syncStorage(){},logSkill(){},markSkill(){},line(){},
  countMark(id){return this.marks[id]||0;},addMark(id,n){this.marks[id]=(this.marks[id]||0)+n;},removeMark(id,n){this.marks[id]-=n;},
  async draw(n){this.drawn+=n;},async drawTo(n){this.drawn+=Math.max(0,n-this.hand.length);},
  async recover(n=1){this.hp=Math.min(this.maxHp,this.hp+n);},
  async damage(n,source){this.hits+=n;this.source=source;},
  async loseMaxHp(n){this.maxHp=Math.max(0,this.maxHp-n);this.hp=Math.min(this.hp,this.maxHp);},async gainMaxHp(n){this.maxHp+=n;},
  awakenSkill(id){this.storage[id]=true;},canUse:()=>true};return p;
}
function bloodFixture(){const p=person();game.players=[p];game.dead=[];return {p,b:createAlucardSkills(game,get)};}

test('sealed gamble accepts zero bids and tie grants both distinct effects in selected order',async()=>{
 const p=person(),t=person();const sequence=[];p.chooseCardOL=(list,...args)=>{assert.equal(list[0],p);assert.equal(list[1],t);assert.equal(args[1][0],0);return choice([{cards:[]},{cards:[]}]);};
 const picks=['摸牌','伤害'];p.chooseControl=()=>choice({control:picks.shift()});p.draw=async n=>sequence.push(['draw',n]);t.damage=async n=>sequence.push(['damage',n]);
 await s.ac_haodu.content({target:t},{},p);assert.deepEqual(sequence,[['draw',3],['damage',1]]);assert.equal(p.storage.ac_haodu_last.count,0);assert.equal(p.storage.ac_haodu_last.last,'damage');
});
test('gamble compares count and distinct suits, waits for both choices then discards together',async()=>{
 const p=person(),t=person();p.hand=[{suit:'heart'},{suit:'heart'}];t.hand=[{suit:'spade'},{suit:'club'},{suit:'diamond'}];
 let collected=false,moved=false;p.chooseCardOL=()=>{collected=true;return choice([{cards:p.hand},{cards:t.hand}]);};
 game.loseAsync=({lose_list})=>{assert.equal(collected,true);assert.equal(lose_list.length,2);moved=true;return{setContent:async name=>assert.equal(name,'discardMultiple')};};
 p.chooseControl=()=>{throw Error('Neither condition met: no effect allowed');};
 await s.ac_haodu.content({target:t},{},p);assert.ok(moved);assert.equal(p.storage.ac_haodu_last.last,null);assert.equal(s.ac_xuju.filter({},p),false);
});
test('gamble can stop early, remembers last effect; one satisfied comparison permits only one',async()=>{
 const p=person(),t=person();p.hand=[{suit:'heart'},{suit:'heart'}];t.hand=[{suit:'spade'},{suit:'club'}];p.chooseCardOL=()=>choice([{cards:p.hand},{cards:t.hand}]);
 let options=0;p.chooseControl=()=>{options++;return choice({control:'摸牌'});};await s.ac_haodu.content({target:t},{},p);assert.equal(options,1);assert.equal(p.drawn,3);assert.equal(p.storage.ac_haodu_last.last,'draw');
 p.chooseControl=()=>choice({control:'cancel2'});await s.ac_haodu.content({target:t},{},p);assert.equal(p.storage.ac_haodu_last.last,null);
});
test('sequel supports self, zero-card cost, records each recipient once; requires wounded recipient',async()=>{
 const p=person();p.hp=2;p.storage.ac_haodu_last={count:0,last:'draw'};game.players=[p];assert.equal(s.ac_xuju.filter({},p),true);
 p.chooseTarget=()=>choice({bool:true,targets:[p]});p.chooseToDiscard=()=>{throw Error('Zero cost must not prompt');};await s.ac_xuju.content({}, {},p);assert.equal(p.drawn,3);assert.equal(s.ac_xuju.filter({},p),false);
 const t=person();t.hp=3;game.players=[p,t];p.storage.ac_haodu_last={count:2,last:'damage'};p.hand=[{},{}];p.chooseTarget=()=>choice({bool:true,targets:[t]});p.chooseToDiscard=()=>choice({bool:false});await s.ac_xuju.content({}, {},p);assert.equal(t.hits,0);assert.ok(!p.getStorage('ac_xuju').includes(t));
 p.chooseToDiscard=()=>choice({bool:true,cards:[{},{}]});await s.ac_xuju.content({}, {},p);assert.equal(t.hits,1);assert.equal(t.source,p);
});
test('Kaito privately shows own hand first, views opponent next, then gains visible hand card',async()=>{
 const p=person(),t=person();p.hand=[{}];t.hand=[{}];const calls=[];t.viewHandcards=async who=>{assert.equal(who,p);calls.push('show');};p.viewHandcards=async who=>{assert.equal(who,t);calls.push('view');};p.gainPlayerCard=async(...args)=>{assert.deepEqual(args,[t,'h',true,'visible']);calls.push('gain');};
 await s.ac_zhangyan.content({target:t},{},p);assert.deepEqual(calls,['show','view','gain']);assert.equal(s.ac_zhangyan.usable,1);assert.equal(s.ac_zhangyan.filterCard,true);
});
test('deduction draws to max HP, restricts other targets only until phase end; transfer remains legal',async()=>{
 const p=person(),t=person();p.hp=2;p.maxHp=4;p.hand=[{}];game.players=[p,t];p.chooseControl=()=>choice({control:'补充手牌'});await s.ac_tuiyan.content({}, {},p);assert.equal(p.drawn,3);assert.ok(p.hasSkill('ac_tuiyan_draw'));assert.equal(p.expiry.player,'phaseUseAfter');
 assert.equal(s.ac_tuiyan.subSkill.draw.mod.playerEnabled({},p,t),false);assert.equal(s.ac_tuiyan.subSkill.draw.mod.playerEnabled({},p,p),undefined);
 p.hand=[{},{},{},{},{}];p.chooseControl=()=>choice({control:'交付手牌'});p.chooseTarget=()=>choice({bool:true,targets:[t]});p.chooseToGive=(who,zone,num)=>{assert.equal(who,t);assert.equal(zone,'h');assert.equal(num,3);return choice({bool:true});};await s.ac_tuiyan.content({}, {},p);assert.equal(s.ac_tuiyan.filter({},p),false);
});
test('netherite changes at preparation/end, modifies only correct distance direction and Sha color',async()=>{
 const p=person(),t=person();p.changeZhuanhuanji=id=>p.storage[id]=!p.storage[id];
 await s.mc_fengcang.content({},{name:'phaseZhunbei'},p);assert.equal(s.mc_fengcang.mod.globalFrom(p,t,2),1);assert.equal(s.mc_fengcang.subSkill.black.filter({card:{name:'sha',color:'black'}},p),true);
 await s.mc_fengcang.content({},{name:'phaseJieshu'},p);assert.equal(s.mc_fengcang.mod.globalTo(t,p,2),3);assert.equal(s.mc_fengcang.mod.globalFrom(p,t,2),undefined);
 assert.equal(s.mc_fengcang.subSkill.red.filter({player:t,card:{name:'sha',color:'red'}},p),true);assert.equal(s.mc_fengcang.subSkill.red.filter({player:p,card:{name:'sha',color:'red'}},p),false);
 const hit=[];await s.mc_fengcang.subSkill.red.content({}, {getParent:()=>({directHit:{add:who=>hit.push(who)}})},p);assert.deepEqual(hit,[p]);
});
test('disarm reduces even a one-point hit to zero and gains equipment; forge accepts equipment only',async()=>{
 const p=person(),t=person();t.equip=[{}];const event={player:t,num:1};assert.equal(s.mc_xiejia.filter(event,p),true);let stolen=false;p.gainPlayerCard=async()=>stolen=true;await s.mc_xiejia.content({},event,p);assert.equal(event.num,0);assert.ok(stolen);
 p.equip=[{},{}];assert.equal(s.mc_rongzhu.mod.maxHandcard(p,4),6);assert.equal(s.mc_rongzhu.filterCard({type:'equip'}),true);assert.equal(s.mc_rongzhu.filterCard({type:'basic'}),false);assert.equal(s.mc_rongzhu.viewAs.name,'jiu');
});
test('Alucard is 3/3: immune to non-Sha damage and HP loss, permits all elemental Sha',async()=>{
 const {p,b}=bloodFixture();assert.equal(alucardCharacters.boss_alucard.hp,3);for(const nature of [undefined,'fire','thunder']) assert.equal(b.al_immortal.filter({name:'damage',card:{name:'sha',nature}}),false);
 for(const event of [{name:'loseHp'},{name:'damage'},{name:'damage',card:{name:'juedou'}}]){assert.equal(b.al_immortal.filter(event),true);let canceled=false;event.cancel=()=>canceled=true;await b.al_immortal.content({},event,p);assert.ok(canceled);}
});
test('blood initializes once, gains only on own Sha damage once per turn, and caps at four',async()=>{
 const {p,b}=bloodFixture(),t=person();b.al_king.init(p);b.al_king.init(p);assert.equal(p.countMark('al_blood'),2);
 const hit={num:1,card:{name:'sha'},player:t,getParent:()=>({player:p})};
 assert.equal(b.al_king.filter({...hit,num:0},p),false);assert.equal(b.al_king.filter({...hit,card:{name:'juedou'}},p),false);
 assert.equal(b.al_king.filter({...hit,getParent:()=>({player:t})},p),false);
 assert.equal(b.al_king.filter(hit,p),true);await b.al_king.content({},hit,p);assert.equal(p.countMark('al_blood'),3);assert.equal(b.al_king.filter(hit,p),false);
 p.skills.delete('al_king_fed');await b.al_king.content({},hit,p);assert.equal(p.countMark('al_blood'),4);
 p.skills.delete('al_king_fed');await b.al_king.content({},hit,p);assert.equal(p.countMark('al_blood'),4);
 let canceled=false;await b.al_king.subSkill.shield.content({}, {num:7,card:{name:'sha'},cancel(){canceled=true;}},p);assert.ok(canceled);assert.equal(p.countMark('al_blood'),3);
});
test('each distinct fallen character permanently amplifies Sha, never trick or skill damage',async()=>{
 const {p,b}=bloodFixture(),t=person();b.al_king.init(p);await b.al_king.subSkill.death.content({}, {player:t},p);assert.equal(b.al_king.subSkill.death.filter({player:t},p),false);assert.equal(b.al_king.subSkill.death.filter({player:person()},p),false);game.dead=[];const event={card:{name:'sha'},num:1};await b.al_king.subSkill.damage.content({},event,p);assert.equal(event.num,2);assert.equal(b.al_king.subSkill.damage.filter({card:{name:'juedou'}},p),false);
});
test('erosion once per victim on own turn, HP floor two, own cap five and heals once',async()=>{
 const {p,b}=bloodFixture(),t=person(),u=person();p.hp=p.maxHp=1;
 const hit={num:1,player:t,getParent:()=>({player:p})};assert.ok(b.al_erosion.filter(hit,p));await b.al_erosion.content({},hit,p);
 assert.equal(t.maxHp,3);assert.equal(p.maxHp,2);assert.equal(p.hp,2);assert.equal(b.al_erosion.filter(hit,p),false);
 assert.equal(b.al_erosion.filter({...hit,player:u,getParent:()=>({player:u})},p),false);
 p.skills.add('al_river_turn');await b.al_erosion.content({}, {...hit,player:u},p);assert.equal(u.maxHp,3);assert.equal(p.maxHp,3);assert.equal(p.hp,2);
 p.skills.delete('al_erosion_turn');delete p.storage.al_erosion_turn;p.maxHp=5;t.maxHp=3;await b.al_erosion.content({},hit,p);assert.equal(t.maxHp,2);assert.equal(p.maxHp,5);assert.equal(b.al_erosion.filter(hit,p),false);
});
test('dual guns spends one blood to direct-hit one target and steals only once per activation',async()=>{
 const {p,b}=bloodFixture(),t=person(),extra=person();game.players=[p,t,extra];b.al_king.init(p);p.chooseBool=()=>choice({bool:true});p.chooseTarget=()=>choice({bool:true,targets:[extra]});const targets=[t],direct=[];targets.addArray=items=>targets.push(...items);direct.addArray=items=>direct.push(...items);
 const event={card:{name:'sha'},targets,directHit:direct,getParent:()=>({player:p})};assert.equal(b.al_dualguns.filter(event,p),true);await b.al_dualguns.content({},event,p);assert.equal(targets.length,2);assert.equal(direct.length,1);assert.equal(p.countMark('al_blood'),1);assert.equal(event.al_dualguns,true);assert.equal(b.al_dualguns.filter(event,p),false);assert.equal(p.expiry.player,'phaseUseAfter');
 p.maxHp=4;t.hand=[{}];const hit={card:{name:'sha'},player:t,getParent:()=>event};assert.equal(b.al_dualguns.subSkill.steal.filter(hit,p),true);p.gainPlayerCard=async()=>{};await b.al_dualguns.subSkill.steal.content({},hit,p);assert.equal(b.al_dualguns.subSkill.steal.filter(hit,p),false);p.maxHp=3;assert.equal(b.al_dualguns.subSkill.steal.filter(hit,p),false);
});
test('dead river clears blood, permanently forbids regain, damages all others; turn bonus expires with turn',async()=>{
 const {p,b}=bloodFixture(),t=person(),u=person();b.al_king.init(p);game.roundNumber=2;assert.equal(b.al_river.filter({},p),false);game.roundNumber=3;assert.equal(b.al_river.filter({},p),true);game.filterPlayer=fn=>{const list=[p,t,u].filter(fn);list.sortBySeat=()=>list;return list;};await b.al_river.content({}, {},p);assert.equal(p.countMark('al_blood'),0);assert.equal(t.hits,1);assert.equal(u.hits,1);assert.equal(b.al_river.filter({},p),false);assert.equal(b.al_king.filter({num:0},p),false);assert.equal(p.expiry.player,'phaseAfter');
 assert.equal(b.al_river.subSkill.turn.mod.cardUsable({name:'sha'},p,1),3);assert.equal(b.al_river.subSkill.turn.mod.targetInRange({name:'sha'}),true);assert.equal(b.al_river.subSkill.turn.mod.targetInRange({name:'juedou'}),undefined);
 p.addMark('al_blood',5);assert.equal(b.al_king.subSkill.seal.filter({markName:'al_blood'},p),true);await b.al_king.subSkill.seal.content({}, {},p);assert.equal(p.countMark('al_blood'),0);
});
test('last stand prevents a lethal hit once, honors armor and cannot restore blood after river',async()=>{
 for(const released of [false,true]) {const {p,b}=bloodFixture();p.hp=1;p.hujia=1;p.storage.al_released=released;const hit={num:1,cancel(){this.canceled=true;}};assert.equal(b.al_king.subSkill.last_stand.filter(hit,p),false);hit.num=2;assert.equal(b.al_king.subSkill.last_stand.filter(hit,p),true);await b.al_king.subSkill.last_stand.content({},hit,p);assert.ok(hit.canceled);assert.equal(p.countMark('al_blood'),released?0:1);assert.equal(b.al_king.subSkill.last_stand.filter(hit,p),false);}
});
test('Night Banquet dynamically blocks all tricks for armorless others, including converted and delayed tricks',()=>{
 const {p,b}=bloodFixture(),t=person();p.skills.add('al_night');game.players=[p,t];p.getVEquip=t.getVEquip=()=>null;
 const enabled=b.al_night.subSkill.lock.mod.cardEnabled;
 for(const type of ['trick','delay']) {assert.equal(enabled({type},t),false);assert.equal(enabled({type},p),undefined);}
 assert.equal(enabled({type:'basic'},t),undefined);assert.equal(enabled({type:'equip'},t),undefined);
 t.getVEquip=()=>({});assert.equal(enabled({type:'trick'},t),undefined);t.getVEquip=()=>null;assert.equal(enabled({type:'trick'},t),false);
 p.skills.delete('al_night');assert.equal(enabled({type:'trick'},t),undefined);
});
