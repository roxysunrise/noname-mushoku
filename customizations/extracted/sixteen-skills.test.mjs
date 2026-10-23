import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const choice = result => ({ state: {}, set(key,value) { this.state[key]=value;status.event=this.state;return this; }, forResult: async () => result });
const list = (...items) => Object.assign(items, { remove(item) { const i=this.indexOf(item); if(i>=0)this.splice(i,1); }, addArray(items) { for(const i of items)if(!this.includes(i))this.push(i); }, randomGet() { return this[0]; } });
const lib = { skill: {}, translate: {}, filter: { cardDiscardable: c=>!c.protected, cardEnabled: ()=>true, cardUsable: ()=>true, targetEnabled2: (c,p,t)=>!t.immune, targetInRange: ()=>true } };
const get = { type:c=>c.type, type2:c=>c.type==='delay'?'trick':c.type, position:c=>c.position, color:c=>c.color, number:c=>c.number, name:c=>c.name, distance:(a,b)=>a.distanceTo?.get(b)??2, translation:()=>'', rand:()=>2 };
get.infoFuncOL = info => vm.runInNewContext(`(${info.slice(13)})`, {lib,get,_status:status});
const game = { players: [], dead: [], hasPlayer(fn){return this.players.some(fn);},filterPlayer(fn){return this.players.filter(fn||(()=>true));},cardsGotoOrdering(cards){for(const c of cards)c.position='o';},import(type,fn){const pack=fn();Object.assign(lib.skill,pack.skill);Object.assign(lib.translate,pack.translate);} };
const ui = { selected: { cards:[],targets:[] },cardPile:{childNodes:[]} }, status={};
for (const name of ['mushoku','western']) {
 const code = readFileSync(new URL(`./game/resources/app/character/${name}.js`,import.meta.url),'utf8').replace(/^import \{(.*?)\} from "noname";/gm,(_,names)=>`const {${names.replace(/ as /g,': ')}}=runtime;`);
 vm.runInNewContext('Array.prototype.randomGet=function(){return this[0];};\n'+code,{runtime:{lib,get,game,ui,_status:status}});
}
const s=lib.skill;
function person(h=3,e=0) {
 const p={ hp:3,maxHp:4,hand:Array.from({length:h},()=>({type:'basic'})),equip:Array.from({length:e},()=>({type:'equip'})),storage:{},marks:{},skills:new Set(),drawn:0,damageTaken:0,
  countCards(pos,filter){const cards=this.getCards(pos);return filter?cards.filter(typeof filter==='function'?filter:c=>c.name===filter).length:cards.length;},
  getCards(pos){return [...(pos.includes('h')?this.hand:[]),...(pos.includes('e')?this.equip:[])];},getGainableCards(owner,pos){return list(...this.getCards(pos));},countGainableCards(owner,pos){return this.countCards(pos);},countDiscardableCards(owner,pos){return this.countCards(pos);},
  countMark(key){return this.marks[key]||0;},addMark(key,n){this.marks[key]=(this.marks[key]||0)+n;},removeMark(key,n){this.marks[key]-=n;},
  isIn:()=>true,isDying:()=>false,isPhaseUsing:()=>true,inRange:()=>true,canUse:()=>true,logSkill(){},
  addSkill(key){this.skills.add(key);},addTempSkill(key,expiry){this.skills.add(key);this.expiry=expiry;},removeSkill(key){this.skills.delete(key);},hasSkill(key){return this.skills.has(key);},
  async draw(n=1){this.drawn+=n;this.hand.push(...Array.from({length:n},()=>({})));},async recover(){this.hp++;},async loseHp(n=1){this.hp-=n;},async loseMaxHp(){this.maxHp--;},async damage(n=1,...args){this.damageTaken+=n;this.damageArgs=args;},
  async give(cards,target){this.hand=this.hand.filter(c=>!cards.includes(c));target.hand.push(...cards);},async gain(cards){this.gained=Array.isArray(cards)?cards:[cards];},async discard(cards){this.discarded=cards;},
  chooseTarget:()=>choice({bool:false}),chooseBool:()=>choice({bool:false}),chooseControl:()=>choice({control:'取消'}),chooseToGive:()=>choice({bool:false}),
  chooseToDiscard(...args){this.discardArgs=args;return choice({bool:true});},discardPlayerCard(target,pos){this.discardTarget=target;return choice({bool:true});},gainPlayerCard:()=>choice({bool:true,cards:[{type:'basic'}]}),
  getHistory:()=>[],getStat:()=>({}),isMaxHandcard(only){const hand=this.countCards('h');return game.players.every(other=>other===this||(only?other.countCards('h')<hand:other.countCards('h')<=hand));},showCards:async()=>{},isLinked(){return !!this.linked;},async link(){this.linked=true;},async turnOver(){this.turned=true;},awakenSkill(key){this.awakened=key;},
 };return p;
}
function discardEvent(use,cards=use.cards){return {name:'cardsDiscard',cards,getParent:()=>({name:'orderingDiscard',relatedEvent:use})};}

test('Hulk: Sha requires two Shan and duel doubles only the opponent response in both directions',()=>{
 const p=person(),t=person();p.playerid='p';t.playerid='t';const use={customArgs:{}};
 const hit={player:p,target:t,card:{name:'sha'},getParent:()=>use};s.ac_rageburst.content({},hit,p);assert.equal(use.customArgs.t.shanRequired,2);
 hit.card.name='juedou';s.ac_rageburst.content({},hit,p);assert.equal(use.customArgs.t.shaReq.t,2);
 hit.player=t;hit.target=p;s.ac_rageburst.content({},hit,p);assert.equal(use.customArgs.p.shaReq.t,2);assert.equal(use.customArgs.p.shaReq.p,undefined);
});
test('Hulk: stealing a non-equipment compensates the victim; equipment instead starts designated duel',async()=>{
 const p=person(),v=person(),t=person();game.players=[p,v,t];await s.ac_gammasteal.content({}, {player:v},p);assert.equal(v.drawn,1);
 p.gainPlayerCard=()=>choice({bool:true,cards:[{type:'equip'}]});v.chooseTarget=()=>choice({bool:true,targets:[t]});p.useCard=async(card,target)=>{assert.equal(card.name,'juedou');assert.equal(target,t);};
 await s.ac_gammasteal.content({}, {player:v},p);assert.equal(v.drawn,1);
});

test('Hulk: no gamma duel selection without legal opponents or after equipment loss removes either participant',async()=>{
 for(const mode of ['no-target','owner-left','victim-left']) {
  const p=person(),v=person(),t=person();game.players=[p,v,t];
  p.canUse=()=>false;
  p.gainPlayerCard=()=>{if(mode==='owner-left')p.isIn=()=>false;if(mode==='victim-left')v.isIn=()=>false;return choice({bool:true,cards:[{type:'equip'}]});};
  v.chooseTarget=()=>{throw Error('cannot choose a duel target here');};
  await s.ac_gammasteal.content({}, {player:v},p);
 }
});

test('Hulk: gamma respects cancellation and rechecks duel legality after target selection',async()=>{
 for(const mode of ['cancel','illegal','left','outsider']) {
  const p=person(),v=person(),t=person(),outside=person();game.players=[p,v,t];
  p.gainPlayerCard=()=>choice({bool:true,cards:[{type:'equip'}]});
  p.useCard=()=>{throw Error('invalid or cancelled gamma duel');};
  v.chooseTarget=()=>{if(mode==='illegal')p.canUse=()=>false;if(mode==='left')t.isIn=()=>false;return choice(mode==='cancel'?{bool:false}:{bool:true,targets:[mode==='outsider'?outside:t]});};
  await s.ac_gammasteal.content({}, {player:v},p);
 }
});
test('Gojo Fuki: adjacent other characters cannot respond to cards used by Gojo',()=>{
 const p=person(),near=person(),far=person();near.distanceTo=new Map([[p,1]]);far.distanceTo=new Map([[p,2]]);game.players=[p,near,far];const use={directHit:list()};
 s.ac_fuki.content({},use,p);assert.deepEqual([...use.directHit],[near]);
});
test('Gojo Jiaozi: increases dealt and received damage only while Gojo uniquely has the most hand cards',async()=>{
 assert.equal(lib.translate.ac_fuki,'伏骑');assert.equal(lib.translate.ac_jiaozi,'骄恣');
 assert.equal(lib.translate.ac_fuki_info,'锁定技，在你使用牌时，某其他角色到你的距离为1，则他不能使用或打出牌响应你使用的牌。');
 assert.equal(lib.translate.ac_jiaozi_info,'锁定技，若你的手牌数为全场唯一最多，你造成或受到的伤害值+1。');
 const p=person(3),other=person(2);game.players=[p,other];
 for(const name of ['damageBegin1','damageBegin3']) {
  const trigger={name,num:1};assert.equal(s.ac_jiaozi.filter(trigger,p),true);await s.ac_jiaozi.content({},trigger);assert.equal(trigger.num,2);
 }
 other.hand.push({type:'basic'});assert.equal(s.ac_jiaozi.filter({name:'damageBegin1'},p),false);
 other.hand.push({type:'basic'});assert.equal(s.ac_jiaozi.filter({name:'damageBegin3'},p),false);
 assert.equal(s.ac_limitless,undefined);assert.equal(s.ac_domain,undefined);
});
test('Doraemon: hand adjustment rewards equality and allows a gift',async()=>{
 const p=person(),t=person(2);game.players=[p,t];p.chooseTarget=()=>choice({bool:true,targets:[t]});p.chooseControl=()=>choice({control:'摸牌'});let gift=false;p.chooseToGive=()=>{gift=true;return choice({bool:false});};
 await s.ac_timestore.content({}, {},p);assert.equal(t.hand.length,t.hp);assert.equal(p.drawn,1);assert.equal(gift,true);
});
test('Doraemon: only normal tricks; cannot remove the sole target, can add then remove another',async()=>{
 const p=person(),t=person();const use={targets:list(p),excluded:new Set()};const trigger={card:{type:'trick'},player:t,getParent:()=>use};
 assert.equal(s.ac_anydoor.filter({card:{type:'delay'}}),false);
 p.chooseTarget=(prompt,filter)=>{const next=choice({bool:true,targets:[t]});next.forResult=async()=>{status.event=next.state;assert.equal(filter(null,p,p),use.targets.length>1);return {bool:true,targets:[t]};};return next;};
 await s.ac_anydoor.content({},trigger,p);assert.equal(use.targets.length,2);await s.ac_anydoor.content({},trigger,p);assert.equal(use.targets.length,1);assert.ok(use.excluded.has(t));
});
test('Joker: preparation damage uses random 0–2; crime recovery triggers after physical discard only once per play phase',async()=>{
 const p=person(),t=person();p.chooseTarget=()=>choice({bool:true,targets:[t]});await s.ac_chaoslaugh.content({}, {},p);assert.equal(t.damageTaken,2);
 const card={position:'d'},use={name:'useCard',player:p,card:{type:'trick'},cards:[card]},event=discardEvent(use);
 assert.ok(s.ac_crimecycle.filter(event,p));await s.ac_crimecycle.content({},event,p);assert.equal(p.maxHp,3);assert.equal(p.gained[0],card);assert.equal(s.ac_crimecycle.filter(event,p),false);assert.equal(p.expiry,'phaseUseAfter');
 p.skills.clear();card.position='o';assert.equal(s.ac_crimecycle.filter(event,p),false);
});
test('Spiderman: cancelling does not spend the turn limit; backwater performs both effects and replaces the target',async()=>{
 const p=person(),a=person(),t=person();const use={targets:list(t),triggeredTargets1:list(t),triggeredTargets2:list(t)};const trigger={player:a,target:t,targets:use.targets,card:{name:'sha'},getParent:()=>use,untrigger(){this.stopped=true;}};
 assert.ok(s.ac_spidersense.filter(trigger,p));await s.ac_spidersense.content({},trigger,p);assert.equal(p.skills.size,0);
 p.chooseControl=()=>choice({control:'背水'});await s.ac_spidersense.content({},trigger,p);assert.equal(p.drawn,1);assert.equal(p.discardTarget,a);assert.deepEqual([...use.targets],[p]);assert.equal(trigger.stopped,true);assert.equal(s.ac_spidersense.filter(trigger,p),false);assert.equal(p.expiry,'phaseAfter');
});
test('Wonder Woman: equipment-zone theft does not grant own draw; non-equipment-zone theft does',async()=>{
 const p=person(),a=person(),b=person(3,1),card=b.equip[0];a.gainPlayerCard=()=>choice({bool:true,cards:[card]});p.chooseBool=()=>choice({bool:false});await s.ac_lasso.content({targets:[a,b]}, {},p);assert.equal(p.drawn,0);
 a.gainPlayerCard=()=>choice({bool:true,cards:[{type:'equip'}]});await s.ac_lasso.content({targets:[a,b]}, {},p);assert.equal(p.drawn,1);
});
test('Wonder Woman: death gift still has forceDie enabled, draws three then heals',async()=>{
 const p=person(),t=person();p.chooseTarget=()=>choice({bool:true,targets:[t]});assert.equal(s.ac_amazonlegacy.forceDie,true);await s.ac_amazonlegacy.content({}, {},p);assert.equal(t.drawn,3);assert.equal(t.hp,4);
});
test('Ken: escalating cost, unrestricted normal Sha and damage disables further activations through turn end',async()=>{
 const p=person(),t=person();game.players=[p,t];game.dead=[];p.getStat=()=>({ac_hundredfists:2});p.chooseControl=()=>choice({control:'流失体力'});let use;
 p.useCard=(card,target,addCount)=>{assert.deepEqual(card.name,'sha');assert.equal(card.nature,undefined);assert.equal(target,t);assert.equal(addCount,false);return use={};};
 t.getHistory=()=>[{getParent:()=>use}];await s.ac_hundredfists.content({target:t}, {},p);assert.equal(p.hp,1);assert.equal(p.expiry,'phaseAfter');assert.equal(s.ac_hundredfists.filter({},p),false);
 assert.ok(s.ac_fateduel.filter({card:{name:'sha'},player:t,target:p},person(3)));assert.equal(s.ac_fateduel.filter({card:{name:'sha'},player:t,target:p},{hp:2}),false);
});
test('Batman: skip conditions include ties, require equipment for discard skip, and prey uses all skipped phases',async()=>{
 const p=person(),t=person(2);game.players=[p,t];assert.ok(s.ac_nightstalk.filter({name:'phaseDraw'},p));assert.ok(s.ac_nightstalk.filter({name:'phaseUse'},p));assert.equal(s.ac_nightstalk.filter({name:'phaseDiscard'},p),false);
 p.getHistory=()=>['phaseDraw','phaseUse'];p.chooseTarget=()=>choice({bool:true,targets:[t]});const equip={type:'equip'};ui.cardPile.childNodes=[equip];await s.ac_batprey.content({}, {},p);assert.equal(t.damageTaken,1);assert.equal(p.gained[0],equip);
});
test('Santa: gifts settle at turn end; maximal hand draws, otherwise discards from recipient',async()=>{
 const p=person(5),t=person(1);game.players=[p,t];await s.ac_giftdelivery.content({cards:p.hand.slice(0,2),target:t}, {},p);await s.ac_giftdelivery.subSkill.settle.content({}, {},p);assert.equal(p.drawn,1);assert.equal(p.storage.ac_giftdelivery_targets,undefined);
 p.storage.ac_giftdelivery_targets=[t];t.hand=[];t.equip=[{}];await s.ac_giftdelivery.subSkill.settle.content({}, {},p);assert.equal(p.discardTarget,t);
});
test('Santa: last-hand loss includes async/give/equip events; next-card penalties clear only after settling',async()=>{
 const p=person(0);assert.ok(s.ac_sijian.trigger.global.includes('loseAsyncAfter'));assert.ok(s.ac_sijian.filter({name:'gain',getl:()=>({hs:[{}]})},p));assert.equal(s.ac_sijian.filter({name:'lose',getl:()=>({hs:[]})},p),false);
 p.addSkill('ac_sijian_discard');p.addMark('ac_sijian_discard',2);let discarded=0;p.hand=[{},{}];p.chooseToDiscard=()=>{discarded++;return choice({bool:true});};await s.ac_sijian.subSkill.discard.content({}, {},p);assert.equal(discarded,2);assert.equal(p.hasSkill('ac_sijian_discard'),false);
});
test('Captain: declined command allows damage in commanded player range; used Sha grants capped damage+1 draw',async()=>{
 const p=person(),t=person(),v=person();game.players=[p,t,v];p.chooseCardTarget=()=>choice({bool:true,cards:[p.hand[0]],targets:[t]});t.chooseToUse=()=>choice({bool:false});p.chooseTarget=()=>choice({bool:true,targets:[v]});await s.ac_freedomcommand.content({}, {},p);assert.equal(v.damageTaken,1);
 const activation={},use={getParent:()=>activation};t.chooseToUse=()=>choice({bool:true});t.getHistory=(name,filter)=>name==='useCard'?[use]:[];v.getHistory=(name,filter)=>[{num:7,getParent:()=>use}].filter(filter);await s.ac_freedomcommand.content(activation, {},p);assert.equal(p.drawn,5);
});
test('Captain: cancelled command does not open a stale target choice after the commanded player leaves',async()=>{
 const p=person(),t=person(),v=person();game.players=[p,t,v];p.chooseCardTarget=()=>choice({bool:true,cards:[p.hand[0]],targets:[t]});t.chooseToUse=()=>choice({bool:false});t.isIn=()=>false;
 let targetChoice=false;p.chooseTarget=()=>{targetChoice=true;return choice({bool:true,targets:[v]});};
 await s.ac_freedomcommand.content({}, {},p);assert.equal(targetChoice,false);assert.equal(v.damageTaken,0);
});
test('Captain: the fallback target filter excludes the captain and keeps valid enemies selectable',async()=>{
 const p=person(),t=person(),v=person();game.players=[p,t,v];p.chooseCardTarget=()=>choice({bool:true,cards:[p.hand[0]],targets:[t]});t.chooseToUse=()=>choice({bool:false});let filter;
 p.chooseTarget=(prompt,fn)=>{filter=fn;return choice({bool:true,targets:[v]});};await s.ac_freedomcommand.content({}, {},p);
 assert.equal(filter(null,p,p),false);assert.equal(filter(null,p,v),true);assert.equal(v.damageTaken,1);
});
test('Totoro: two recipients gain independent permanent hand-limit marks',async()=>{
 const p=person(),t=person();p.chooseTarget=()=>choice({bool:true,targets:[p,t]});await s.ac_forestwatch.content({}, {},p);assert.equal(p.drawn,1);assert.equal(t.drawn,1);assert.equal(s.ac_forestwatch.subSkill.hand.mod.maxHandcard(t,3),4);
});
test('Light: zero-card judgment is legal; flip/draw branch and deathnote recovery only on unpaid response',async()=>{
 const p=person(),t=person();t.chooseControl=()=>choice({control:'弃牌并失去体力'});await s.ac_kirajudgment.content({cards:[],target:t}, {},p);assert.equal(t.hp,2);
 t.chooseControl=()=>choice({control:'翻面并摸牌'});await s.ac_kirajudgment.content({cards:[{},{}],target:t}, {},p);assert.equal(t.turned,true);assert.equal(t.drawn,2);
 p.chooseCard=()=>choice({bool:true,cards:[{type:'basic'}]});t.chooseToDiscard=()=>choice({bool:false});await s.ac_deathnote.content({}, {source:t},p);assert.equal(p.hp,4);t.chooseToDiscard=()=>choice({bool:true});await s.ac_deathnote.content({}, {source:t},p);assert.equal(p.hp,4);
});
test('Kirby: only cards <=8 replace normal draw, then random theft',async()=>{
 const p=person(),t=person(),cards=[{number:3},{number:8},{number:9}];get.cards=()=>cards;
 p.chooseButton=([prompt,pool])=>{assert.equal(pool.length,2);return choice({bool:true,links:pool});};p.chooseTarget=()=>choice({bool:true,targets:[t]});const trigger={cancel(){this.cancelled=true;}};
 await s.ac_copyability.content({},trigger,p);assert.equal(trigger.cancelled,true);assert.equal(p.gained.length,1);assert.equal(p.gained[0],t.hand[0]);
});
test('Kirby: deferred recycling follows the chosen next turn, requires discarded physical cards, stops at three',async()=>{
 const p=person(),t=person(),turn={name:'phase',player:t};p.storage.ac_swallowrecycle_watch={target:t,turn:null,count:0};const watch=s.ac_swallowrecycle.subSkill.watch;
 const card={position:'d'},use={name:'useCard',player:t,cards:[card],getParent:name=>name==='phase'?turn:{name:'phaseUse'}};const event=discardEvent(use);
 assert.equal(!!watch.filter(event,p),false);await watch.content({triggername:'phaseBegin'},turn,p);
 for(let i=0;i<3;i++){assert.ok(watch.filter(event,p));await watch.content({triggername:'cardsDiscardAfter'},event,p);}assert.equal(watch.filter(event,p),false);
 await watch.content({triggername:'phaseAfter'},turn,p);assert.equal(p.hasSkill('ac_swallowrecycle_watch'),false);
});
test('Gandalf: pact adjusts twice; drawing is capped at five, discarding matches owner exactly',async()=>{
 const p=person(7),t=person(1);p.storage.ac_whitepact_settle=[{target:t,own:false}];const settle=s.ac_whitepact.subSkill.settle;
 await settle.content({}, {player:p},p);assert.equal(t.hand.length,5);p.hand=[];await settle.content({}, {player:t},p);assert.equal(t.discardArgs[1],5);assert.equal(p.storage.ac_whitepact_settle.length,0);
});
test('Mustang: damage gains full marks, odd/even tactics differ, limited flame clears all marks and gear',async()=>{
 const p=person(),t=person(3,2);game.players=[p,t];s.ac_warstock.content({}, {num:3},p);assert.equal(p.countMark('ac_warstock'),3);
 p.chooseTarget=()=>choice({bool:true,targets:[t]});await s.ac_alchemytactic.content({}, {},p);assert.equal(t.damageTaken,1);p.addMark('ac_warstock',1);await s.ac_alchemytactic.content({}, {},p);assert.equal(t.linked,true);assert.equal(p.discardTarget,t);
 await s.ac_flamealchemy.content({targets:[t]}, {},p);assert.equal(p.countMark('ac_warstock'),0);assert.equal(p.awakened,'ac_flamealchemy');assert.equal(t.discarded.length,2);assert.equal(t.damageTaken,2);assert.equal(t.damageArgs[0],'fire');
});

test('Mustang: no forced flame choice when equipment loss removes all targets or the owner',async()=>{
 for(const ownerLeaves of [false,true]) {
  const p=person(),t=person(3,1);let ownerAlive=true,targetAlive=true;
  p.isIn=()=>ownerAlive;t.isIn=()=>targetAlive;
  t.discard=async()=>{if(ownerLeaves)ownerAlive=false;else targetAlive=false;};
  p.chooseTarget=()=>{throw Error('forced choice without a living owner or target');};
  await s.ac_flamealchemy.content({targets:[t]}, {},p);
  assert.equal(t.damageTaken,0);
 }
});

test('Mustang: flame ignores departed choices and never damages an unselected target',async()=>{
 const p=person(),t=person(),outsider=person();
 p.chooseTarget=()=>choice({bool:true,targets:[outsider]});
 await s.ac_flamealchemy.content({targets:[t]}, {},p);
 assert.equal(outsider.damageTaken,0);
 p.chooseTarget=()=>{t.isIn=()=>false;return choice({bool:true,targets:[t]});};
 await s.ac_flamealchemy.content({targets:[t]}, {},p);
 assert.equal(t.damageTaken,0);
});

test('Mustang: remaining selected target still takes fire damage after another leaves on equipment loss',async()=>{
 const p=person(),gone=person(3,1),alive=person(3,1);let present=true,offered;
 gone.isIn=()=>present;gone.discard=async()=>{present=false;};
 p.chooseTarget=()=>({set(key,value){if(key==='acFlameTargets')offered=value;return this;},forResult:async()=>({bool:true,targets:[alive]})});
 await s.ac_flamealchemy.content({targets:[gone,alive]}, {},p);
 assert.equal(offered.length,1);assert.equal(offered[0],alive);
 assert.equal(gone.damageTaken,0);assert.equal(alive.discarded.length,1);
 assert.equal(alive.damageTaken,1);assert.equal(alive.damageArgs[0],'fire');
});
test('Vader: cards remain in expansion until global turn end; damage compares both hand and equipment counts',async()=>{
 const p=person(3,2),t=person(2,1),cards=[t.hand[0]];p.choosePlayerCard=()=>choice({bool:true,cards});
 t.addToExpansion=(actual)=>{assert.equal(actual,cards);return {gaintag:{add(tag){t.expansionTag=tag;}}};};t.getExpansions=()=>cards;
 await s.ac_forcebind.content({}, {target:t},p);assert.equal(t.expansionTag,'ac_forcebind_return');assert.ok(t.hasSkill('ac_forcebind_return'));
 await s.ac_forcebind.subSkill.return.content({}, {},t);assert.equal(t.gained,cards);assert.equal(t.hasSkill('ac_forcebind_return'),false);
 assert.ok(s.ac_forcebind.subSkill.damage.filter({card:{name:'sha'},player:t},p));t.equip.push({},{});assert.equal(s.ac_forcebind.subSkill.damage.filter({card:{name:'sha'},player:t},p),false);
});

test('recovery never takes unrelated cards from the same ordering discard event',async()=>{
 const p=person(),t=person(),owned={position:'d'},unrelated={position:'d'},turn={name:'phase'};
 const use={name:'useCard',player:p,card:{type:'trick'},cards:[owned],getParent:name=>name==='phase'?turn:{name:'phaseUse'}};
 const event=discardEvent(use,[owned,unrelated]);await s.ac_crimecycle.content({},event,p);assert.equal(p.gained.length,1);assert.equal(p.gained[0],owned);
 use.player=t;p.storage.ac_swallowrecycle_watch={target:t,turn,count:0};await s.ac_swallowrecycle.subSkill.watch.content({triggername:'cardsDiscardAfter'},event,p);assert.equal(p.gained.length,1);assert.equal(p.gained[0],owned);
});

test('Santa backwater is unavailable during anyone dying and its lifetime cost increases',async()=>{
 const p=person(),t=person();game.players=[p,t];status.currentPhase=t;let offers=0;
 p.chooseControl=(options)=>{assert.equal(options.includes('背水'),!t.isDying());if(options.includes('背水'))offers++;return choice({control:options.includes('背水')?'背水':'摸牌'});};
 p.chooseTarget=()=>choice({bool:true,targets:[t]});p.chooseBool=()=>{throw Error('backwater must be its own control');};
 const costs=[];p.loseHp=async n=>{assert.ok(n>0);costs.push(n);p.hp-=n;};
 await s.ac_sijian.content({}, {},p);assert.equal(p.hp,3);assert.equal(t.drawn,2);assert.equal(p.storage.ac_sijian_backwater,1);
 await s.ac_sijian.content({}, {},p);assert.equal(p.hp,2);assert.equal(t.drawn,4);assert.equal(p.storage.ac_sijian_backwater,2);assert.deepEqual(costs,[1]);assert.equal(t.countMark('ac_sijian_discard'),2);
 t.isDying=()=>true;await s.ac_sijian.content({}, {},p);assert.equal(offers,2);assert.equal(t.drawn,6);
});

test('Santa: ordinary options execute only themselves and never charge backwater',async()=>{
 for(const control of ['弃牌','摸牌']) {
  const p=person(),t=person();game.players=[p,t];status.currentPhase=t;
  p.chooseControl=()=>choice({control});p.chooseTarget=()=>choice({bool:true,targets:[t]});
  p.chooseBool=()=>{throw Error('ordinary choice must not ask for backwater');};
  await s.ac_sijian.content({}, {},p);
  assert.equal(t.drawn,control==='摸牌'?2:0);assert.equal(t.countMark('ac_sijian_discard'),control==='弃牌'?1:0);
  assert.equal(p.hp,3);assert.equal(p.storage.ac_sijian_backwater,undefined);
 }
});

test('Santa: backwater resolves both options before HP cost and skips unavailable targets',async()=>{
 const p=person(),t=person();game.players=[p,t];status.currentPhase=t;
 const steps=[];p.storage.ac_sijian_backwater=1;
 p.chooseControl=()=>choice({control:'背水'});p.chooseTarget=()=>{steps.push('target');return choice({bool:true,targets:[t]});};
 t.draw=async()=>{steps.push('draw');};p.loseHp=async n=>{steps.push(`hp:${n}`);};
 await s.ac_sijian.content({}, {},p);assert.deepEqual(steps,['target','draw','hp:1']);
 game.players=[p];status.currentPhase=p;p.draw=async()=>{steps.push('own draw');};
 p.chooseTarget=()=>{throw Error('no other players');};
 await s.ac_sijian.content({}, {},p);assert.equal(steps.at(-2),'own draw');assert.equal(steps.at(-1),'hp:2');
});

test('Spiderman: backwater does not duplicate a target added by nested draw effects',async()=>{
 const p=person(),a=person(),t=person();const use={targets:list(t)};
 const trigger={player:a,target:t,targets:use.targets,getParent:()=>use,untrigger(){throw Error('target already replaced');}};
 p.chooseControl=()=>choice({control:'背水'});p.draw=async()=>{use.targets.push(p);};
 await s.ac_spidersense.content({},trigger,p);assert.equal(use.targets.filter(target=>target===p).length,1);assert.equal(p.discardTarget,a);
});
