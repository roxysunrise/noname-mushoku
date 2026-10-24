import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAlucardSkills, alucardCharacters } from './game/resources/app/noname/init/mushoku-alucard.js';
import characterRoster from './game/resources/app/src/noname/init/mushoku-characters.js';
const root = new URL('./game/resources/app/', import.meta.url);
const lib = {skill:{},translate:{},filter:{cardDiscardable:c=>!c.protected}};
const _status={};
const get={suit:c=>c.suit,color:c=>c.color,type:c=>c.type,position:()=>"o",value:()=>1,attitude:()=>-1};
const game={players:[],dead:[],hasPlayer:fn=>game.players.some(fn),import(type,fn){const p=fn();Object.assign(lib.skill,p.skill);Object.assign(lib.translate,p.translate);}};
get.infoFuncOL = info => vm.runInNewContext(`(${info.slice(13)})`, {lib,get,_status:{}});
for(const pack of ['mushoku','minecraft','ai']) {
 const source=(await readFile(new URL(`character/${pack}.js`,root),'utf8')).replace(/^import \{(.*?)\} from "noname";/gm,(_,names)=>`const {${names.replace(/ as /g,': ')}}=runtime;`);
 vm.runInNewContext(source,{runtime:{lib,game,get,ui:{selected:{cards:[]}},_status}});
}
const s=lib.skill;
test('Dmail blocks delayed tricks, captures judgements, and replaces only another players judgement',async()=>{
 const skill=s.ac_mail,owner=person(),other=person(),delayed={type:'delay'},ordinary={type:'trick'};
 assert.equal(skill.mod.targetEnabled(delayed,other,owner),false);
 assert.equal(skill.mod.targetEnabled(ordinary,other,owner),undefined);
 assert.equal(skill.subSkill.guard.filter({target:owner,card:delayed},owner),true);
 assert.equal(skill.subSkill.guard.filter({target:other,card:delayed},owner),false);
 let canceled=false;skill.subSkill.guard.content({}, {cancel(){canceled=true;}});assert.equal(canceled,true);
 assert.equal(skill.subSkill.guard.filter({target:owner,card:ordinary},owner),false);
 let gained;owner.gain=async card=>gained=card;const judgment={id:'judgment'};
 assert.equal(skill.subSkill.gain.filter({result:{card:judgment}},owner),true);
 await skill.subSkill.gain.content({}, {result:{card:judgment}},owner);assert.equal(gained,judgment);
 const hand={id:'replacement'},old={id:'old'};owner.hand=[hand];owner.chooseCard=()=>choice({bool:true,cards:[hand]});owner.logSkill=()=>{};
 owner.respond=({cards})=>{const response=Promise.resolve();response.cards=cards;return response;};game.broadcastAll=()=>{};let discarded;game.cardsDiscard=async card=>discarded=card;
 const judgeOwner={judging:[old]};let ordered;const event={player:judgeOwner,orderingCards:{addArray(cards){ordered=cards[0];}}};
 assert.equal(skill.subSkill.replace.filter(event,owner),true);
 assert.equal(skill.subSkill.replace.filter({player:owner},owner),false);
 await skill.subSkill.replace.content({},event,owner);
 assert.equal(judgeOwner.judging[0],hand);assert.equal(ordered,hand);assert.equal(discarded,old);assert.equal(lib.translate.ac_mail,'Dmail');
});

test('worldline distributes actual drawn cards and restores Dmail after two future turns',async()=>{
 const p=person(),a=person(),b=person();game.players=[p,a,b];
 game.filterPlayer=fn=>{const list=game.players.filter(fn||(()=>true));list.sortBySeat=()=>list;return list;};
 p.recoverTo=async n=>p.hp=n;p.hp=0;
 const old={id:'old'};p.hand=[old];const drawn=Array.from({length:5},(_,id)=>({id}));
 p.draw=n=>{assert.equal(n,5);p.hand.push(...drawn);return {forResult:async()=>({bool:true,cards:drawn})};};
 p.give=async(cards,t)=>{for(const c of cards){p.hand.splice(p.hand.indexOf(c),1);t.hand.push(c);}};
 p.disableSkill=(key,id)=>p.disabled=id;p.addSkill=id=>p.skills.add(id);
 p.enableSkill=()=>p.disabled=null;p.removeSkill=id=>p.skills.delete(id);
 await s.ac_worldline.content({}, {}, p);
 assert.equal(p.hp,2);assert.equal(p.hand.length,4);assert.ok(p.hand.includes(old));
 assert.equal(a.hand[0],drawn[1]);assert.equal(b.hand[0],drawn[2]);assert.equal(p.disabled,'ac_mail');
 const restore=s.ac_worldline.subSkill.restore,start=s.ac_worldline.subSkill.start;
 await restore.content({}, {},p);assert.equal(p.storage.ac_worldline_turns,2);
 start.content({}, {},p);await restore.content({}, {},p);assert.equal(p.disabled,'ac_mail');
 start.content({}, {},p);await restore.content({}, {},p);assert.equal(p.disabled,null);
 // Activation outside Okabe's turn: the next phaseBegin starts the first counted turn.
 p.storage.ac_worldline_turns=2;p.storage.ac_worldline_counting=false;p.disabled='ac_mail';
 start.content({}, {},p);await restore.content({}, {},p);assert.equal(p.storage.ac_worldline_turns,1);
});

test('life starts at two without a cap, rewards only own kills, and lethal protection remains optional',async()=>{
 const character=characterRoster.ac_alucard;
 assert.equal(character.hp,4);assert.equal(character.maxHp,4);assert.deepEqual(character.skills,['ac_life','ac_river','ac_jackal']);
 assert.equal(lib.translate.ac_life_info,'游戏开始时获得2枚命（无上限）。每回合限一次，你使用【杀】造成伤害后，摸一张牌。击杀其他角色后获得1枚命。受到致命伤害时，可以移去1枚命，防止此次伤害。');
 const p=person(),other=person();s.ac_life.init(p);s.ac_life.init(p);assert.equal(p.countMark('ac_life'),2);
 assert.equal(s.ac_life.filter({name:'die',source:other,player:other},p),false);
 assert.equal(s.ac_life.filter({name:'die',source:p,player:other},p),true);
 p.addMark('ac_life',7);await s.ac_life.content({}, {name:'die'},p);assert.equal(p.countMark('ac_life'),10);
 const hit={name:'damage',num:4,cancel(){this.cancelled=true;}};
 assert.equal(s.ac_life.filter(hit,p),true);p.chooseBool=()=>choice({bool:false});
 await s.ac_life.content({},hit,p);assert.equal(hit.cancelled,undefined);
 p.chooseBool=()=>choice({bool:true});await s.ac_life.content({},hit,p);assert.equal(hit.cancelled,true);assert.equal(p.countMark('ac_life'),9);
 const draw=s.ac_life.subSkill.draw,use={player:p};
 const shaHit={num:1,card:{name:'sha'},player:other,getParent:name=>name==='useCard'?use:null};
 assert.equal(draw.usable,1);assert.equal(draw.filter(shaHit,p),true);await draw.content({},shaHit,p);assert.equal(p.drawn,1);
 assert.equal(draw.filter({...shaHit,card:{name:'juedou'}},p),false);
 assert.equal(draw.filter({...shaHit,getParent:()=>null},p),false);
 p.hujia=2;assert.equal(s.ac_life.filter(hit,p),false);assert.equal(s.ac_life.filter({...hit,nohujia:true},p),true);
});

test('jackal grants Sha range and one extra use, and chooses any target once on Alucard turn',async()=>{
 const p=person(),target={...person(),playerid:'victim'},other={...person(),playerid:'other'};game.players=[p,target,other];_status.currentPhase=p;
 assert.equal(lib.translate.ac_jackal_info,'你使用【杀】无距离限制，次数上限＋1。每个自己的回合限一次，使用【杀】指定目标后，可以令其中一名目标须使用两张【闪】抵消。');
 assert.equal(s.ac_jackal.mod.targetInRange({name:'sha'}),true);assert.equal(s.ac_jackal.mod.targetInRange({name:'shan'}),undefined);
 assert.equal(s.ac_jackal.mod.cardUsable({name:'sha'},p,1),2);assert.equal(s.ac_jackal.mod.cardUsable({name:'shan'},p,1),undefined);
 const use={card:{name:'sha'},targets:[target,other],customArgs:{}};
 p.chooseTarget=()=>choice({bool:false});await s.ac_jackal.content({},use,p);assert.equal(p.hasSkill('ac_jackal_used'),false);
 p.chooseTarget=(prompt,filter)=>{assert.match(prompt,/两张【闪】/);assert.equal(typeof filter,'function');return choice({bool:true,targets:[other]});};
 assert.equal(s.ac_jackal.filter(use,p),true);await s.ac_jackal.content({},use,p);
 assert.equal(use.customArgs.other.shanRequired,2);assert.equal(use.customArgs.victim,undefined);
 _status.currentPhase=target;assert.equal(s.ac_jackal.filter(use,p),false);
 _status.currentPhase=p;assert.equal(s.ac_jackal.filter({...use,card:{name:'juedou'}},p),false);
 assert.equal(s.ac_jackal.subSkill.convert,undefined);assert.equal(s.ac_jackal.filter(use,p),false);
});

test('river consumes all lives, draws the same number, grants turn-long protection and permanent Sha max-HP pressure',async()=>{
 const p=person(),target=person();p.addMark('ac_life',3);
 await s.ac_river.content({}, {},p);assert.equal(p.expiry.player,'phaseBegin');assert.equal(p.countMark('ac_life'),0);assert.equal(p.drawn,3);assert.equal(p.hasSkill('ac_river_permanent'),true);
 assert.equal(s.ac_river.filter({},p),false);
 assert.equal(s.ac_river.subSkill.effect.mod.targetEnabled({},target,p),false);
 assert.equal(s.ac_river.subSkill.effect.mod.targetEnabled({},p,p),undefined);
 const hit={num:1};s.ac_river.subSkill.effect.content({},hit,p);assert.equal(hit.num,4);s.ac_river.subSkill.effect.onremove(p);assert.equal(p.storage.ac_river_bonus,undefined);assert.equal(p.hasSkill('ac_river_permanent'),true);
 const otherSkill={name:'enemy_skill',skill:'enemy_skill',player:target,getParent:()=>null};
 assert.equal(s.ac_river.subSkill.guard.filter({getParent:()=>otherSkill},p),true);
 const ownSkill={name:'own_skill',skill:'own_skill',player:p,getParent:()=>null};
 assert.equal(s.ac_river.subSkill.guard.filter({getParent:()=>ownSkill},p),false);
 const cardUse={name:'useCard',player:target,getParent:()=>null};
 assert.equal(s.ac_river.subSkill.guard.filter({getParent:()=>cardUse},p),false);
 const passive=s.ac_river.subSkill.permanent;
 const passiveHit={num:1,card:{name:'sha'},player:target,getParent:name=>name==='useCard'?{player:p}:null};_status.currentPhase=p;
 assert.equal(passive.filter(passiveHit,p),true);p.chooseBool=()=>choice({bool:false});await passive.content({},passiveHit,p);assert.equal(p.hasSkill('ac_river_used'),false);
 p.chooseBool=()=>choice({bool:true});await passive.content({},passiveHit,p);assert.equal(target.maxHp,3);assert.equal(passive.filter(passiveHit,p),false);
 p.skills.delete('ac_river_used');target.maxHp=3;assert.equal(passive.filter(passiveHit,p),true);await passive.content({},passiveHit,p);assert.equal(target.maxHp,2);
 p.skills.delete('ac_river_used');assert.equal(passive.filter(passiveHit,p),false);
 _status.currentPhase=target;target.maxHp=3;assert.equal(passive.filter(passiveHit,p),false);
});

test('tank zhuangjia reduces damage by 1 (minimum 1) and adds +2 hand limit',async()=>{
 const p=person();p.maxHp=p.hp=4;
 const hit2={num:2};s.ac_zhuangjia.content({},hit2,p);assert.equal(hit2.num,1);
 const hit1={num:1};s.ac_zhuangjia.content({},hit1,p);assert.equal(hit1.num,1,'minimum 1');
 assert.equal(s.ac_zhuangjia.mod.maxHandcard(p,4),6);
});

test('tank paoji discards equip to deal 1 damage to another character',async()=>{
 const p=person(),t=person();
 assert.equal(s.ac_paoji.filterCard({type:'equip'}),true);
 assert.equal(s.ac_paoji.filterCard({type:'basic'}),false);
 p.hand=[{type:'equip'}];assert.equal(s.ac_paoji.filter({},p),true);
 await s.ac_paoji.content({target:t},{},p);assert.equal(t.hits,1);
});

test('tank gushou buff grants distance+1 and draw when targeted by sha',async()=>{
 const p=person();
 await s.ac_gushou.content({},{},p);
 assert.ok(p.hasSkill('ac_gushou_buff'));
 assert.equal(s.ac_gushou.subSkill.buff.mod.globalTo(p,p,1),2);
 const shaTarget={card:{name:'sha'}};
 assert.equal(s.ac_gushou.subSkill.buff.filter(shaTarget,p),true);
 await s.ac_gushou.subSkill.buff.content({},shaTarget,p);
 assert.equal(p.drawn,1);
});

test('fighter zhikong removes sha distance limit and grants +1 distance defense',async()=>{
 const p=person();
 assert.equal(s.ac_zhikong.mod.targetInRange({name:'sha'}),true);
 assert.equal(s.ac_zhikong.mod.targetInRange({name:'shan'}),undefined);
 assert.equal(s.ac_zhikong.mod.globalTo(p,p,1),2);
});

test('fighter youji views hand then discards one enemy card',async()=>{
 const p=person(),t=person();t.hand=[{}];p.hand=[{}];game.players=[p,t];
 let viewed=false,discarded=false;
 p.viewHandcards=async who=>{assert.equal(who,t);viewed=true;};
 p.discardPlayerCard=async(who,zone,sel,vis)=>{assert.equal(who,t);assert.equal(vis,'visible');discarded=true;};
 await s.ac_youji.content({target:t},{},p);
 assert.ok(viewed);assert.ok(discarded);
});

test('fighter guibi negates sha once per round by discarding one card',async()=>{
 const p=person();p.hand=[{}];p.chooseToDiscard=()=>choice({bool:true,cards:[{}]});p.discard=async()=>{};
 assert.equal(s.ac_guibi.filter({card:{name:'sha'}},p),true);
 assert.equal(s.ac_guibi.filter({card:{name:'shan'}},p),false);
 const parent={excluded:new Set()};const trig={card:{name:'sha'},getParent:()=>parent};
 await s.ac_guibi.content({cards:[{}]},trig,p);
 assert.ok(parent.excluded.has(p));
});

test('chicken jinshen converts hand to sha with +3 attack range',async()=>{
 const p=person();
 assert.equal(s.mc_jinshen.viewAs.name,'sha');
 assert.equal(s.mc_jinshen.mod.attackRange(p,1),4);
});

test('chicken huanxue loses 1 hp and boosts next sha base damage by 1',async()=>{
 const p=person();p.hp=3;p.loseHp=async()=>{p.hp--;};p.removeSkill=()=>p.skills.delete('mc_huanxue_buff');
 await s.mc_huanxue.content({},{},p);assert.equal(p.hp,2);assert.ok(p.hasSkill('mc_huanxue_buff'));
 const sha={card:{name:'sha'},baseDamage:1};
 await s.mc_huanxue.subSkill.buff.content({},sha,p);
 assert.equal(sha.baseDamage,2);assert.ok(!p.hasSkill('mc_huanxue_buff'));
});

test('chicken lianji marks a target then damages it on own next two phase begins',async()=>{
 const p=person(),t=person();p.removeSkill=()=>{};
 await s.mc_lianji.content({target:t},{},p);
 assert.equal(p.storage.mc_lianji.remaining,2);assert.equal(p.storage.mc_lianji.target,t);
 await s.mc_lianji.subSkill.dot.content({},{},p);assert.equal(t.hits,1);assert.equal(p.storage.mc_lianji.remaining,1);
 await s.mc_lianji.subSkill.dot.content({},{},p);assert.equal(t.hits,2);assert.equal(p.storage.mc_lianji,undefined);
});

test('chicken lianji nodraw skips the draw phase after two turns',async()=>{
 const p=person();p.removeSkill=()=>{};const ev={};p.skip=id=>{ev.cancel=true;};
 await s.mc_lianji.subSkill.nodraw.content({},ev,p);
 assert.equal(ev.cancel,true);
});
const choice=result=>({set(){return this;},forResult:async()=>result});
function person(){
 const p={storage:{},hp:4,maxHp:4,hand:[],equip:[],skills:new Set(),marks:{},drawn:0,hits:0,
  isIn:()=>true,isDamaged(){return this.hp<this.maxHp;},getCards(zone){return [...(zone.includes('h')?this.hand:[]),...(zone.includes('e')?this.equip:[])];},
  countCards(zone,fn){return this.getCards(zone).filter(c=>typeof fn!=='function'||fn(c)).length;},
  countGainableCards(source,zone){return this.countCards(zone);},
  getStorage(key){return this.storage[key]||[];},hasSkill(id){return this.skills.has(id);},
  addSkill(id){this.skills.add(id);},addTempSkill(id,expiry){this.skills.add(id);this.expiry=expiry;},
  markAuto(key,items){this.storage[key]||=[];for(const item of items)if(!this.storage[key].includes(item))this.storage[key].push(item);},
  syncStorage(){},logSkill(){},markSkill(){},line(){},
  countMark(id){return this.marks[id]||0;},addMark(id,n){this.marks[id]=(this.marks[id]||0)+n;},removeMark(id,n){this.marks[id]-=n;},
  async draw(n=1){this.drawn+=n;},async drawTo(n){this.drawn+=Math.max(0,n-this.hand.length);},
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
test('Alucard is 6/6: immune to non-Sha damage and HP loss, permits all elemental Sha',async()=>{
 const {p,b}=bloodFixture();assert.equal(alucardCharacters.boss_alucard.hp,6);for(const nature of [undefined,'fire','thunder']) assert.equal(b.al_immortal.filter({name:'damage',card:{name:'sha',nature}}),false);
 for(const event of [{name:'loseHp'},{name:'damage'},{name:'damage',card:{name:'juedou'}}]){assert.equal(b.al_immortal.filter(event),true);let canceled=false;event.cancel=()=>canceled=true;await b.al_immortal.content({},event,p);assert.ok(canceled);}
});
test('erosion is limited to once per own turn and respects its two-max-HP floor',async()=>{
 const b=createAlucardSkills(game,get),p=person(),t=person(),u=person();p.hp=3;
 const hit={num:1,card:{name:'sha'},player:t,getParent:name=>name==='phase'?{player:p}:null};
 assert.equal(b.al_erosion.filter(hit,p),true);await b.al_erosion.content({},hit,p);
 assert.equal(t.maxHp,3);assert.equal(p.hp,4);assert.equal(p.hasSkill('al_erosion_used'),true);
 assert.equal(b.al_erosion.filter({...hit,player:u},p),false);
 p.skills.delete('al_erosion_used');t.maxHp=2;assert.equal(b.al_erosion.filter(hit,p),false);
});
