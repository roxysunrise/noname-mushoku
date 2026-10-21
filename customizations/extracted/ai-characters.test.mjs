import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createAiSkills} from './game/resources/app/src/character/ai/mechanics.js';
import {packForCharacter,characterTitles} from './game/resources/app/src/noname/init/mushoku-rosters.js';
import roster from './game/resources/app/src/noname/init/mushoku-characters.js';
import translation from './game/resources/app/src/character/ai/translate.js';
import {availableCharacters} from './game/resources/app/noname/init/mushoku-online-modes.js';
import {roomError} from './game/resources/app/noname/init/mushoku-online.js';
const get={color:c=>c?.color,type2:c=>c?.type,attitude:()=>1,value:()=>1,autoViewAs:x=>x,is:{convertedCard:c=>!!c.converted,virtualCard:c=>!!c.virtual}};
const game={hasPlayer:fn=>fn({})},lib={filter:{cardDiscardable:()=>true}},status={};
get.infoFuncOL=info=>vm.runInNewContext(`(${info.slice(13)})`,{lib,get,_status:status});
const s=createAiSkills(game,get,lib,{},status);
const choice=result=>({set(){return this;},forResult:async()=>result});
const player=()=>({storage:{},skills:new Set(),hasSkill(name){return this.skills.has(name);},addTempSkill(name){this.skills.add(name);},logSkill(){},isIn:()=>true,syncStorage(){}});
test('AI roster has five separate characters with approved skill lists and colored titles',()=>{
 const ids=availableCharacters({characterPack:['ai']});assert.equal(ids.length,5);assert.equal(packForCharacter('ac_chatgpt'),'ai');
 assert.equal(availableCharacters({characterPack:['mushoku']}).includes('ac_chatgpt'),false);
 assert.equal(roomError({}, {mode:'versus',characterPack:['ai']}),null);
 assert.match(roomError({}, {mode:'identity',number:8,characterPack:['ai']}),/8/);
 assert.ok(characterTitles.th_mokou.includes('不灭的烟火'));
 for(const id of ids){assert.ok(characterTitles[id].includes('<span'));for(const skill of roster[id].skills)assert.ok(translation[skill+'_info']);}
 assert.deepEqual(roster.ac_chatgpt.skills,['ac_tuiyan']);assert.deepEqual(roster.ai_claude.skills,['ai_bianyi','ai_tiaoshi']);
});
test('Qiaoda maps card categories and shares one turn quota across sha shan and tao',()=>{
 const cards=['basic','trick','equip'].map(type=>({type})),p=player();p.getCards=()=>cards;
 for(const [i,name]of ['shan','tao','sha'].entries())assert.equal(s.ai_qiaoda.viewAs([cards[i]]).name,name);
 assert.equal(s.ai_qiaoda.filter({filterCard:c=>c.name==='tao'},p),true);assert.equal(s.ai_qiaoda.hiddenCard(p,'tao'),true);
 s.ai_qiaoda.precontent({}, {},p);assert.equal(s.ai_qiaoda.hiddenCard(p,'shan'),false);assert.equal(s.ai_qiaoda.filter({filterCard:()=>true},p),false);
});
test('Banxing requires out-of-turn hand use and draws for the lower hand, ties favor owner',async()=>{
 const p=player(),card={},evt={cards:[card]};p.getHistory=()=>[{hs:[card],getParent:()=>evt}];status.currentPhase={};
 assert.equal(s.ai_banxing.filter(evt,p),true);status.currentPhase=p;assert.equal(s.ai_banxing.filter(evt,p),false);status.currentPhase={};
 for(const [otherHand,who]of [[1,'target'],[2,'owner'],[3,'owner']]){
  p.skills.clear();let drawn;const target={countCards:()=>otherHand,draw:async()=>drawn='target'};p.countCards=()=>2;p.draw=async()=>drawn='owner';p.chooseTarget=()=>choice({bool:true,targets:[target]});
  await s.ai_banxing.content({},evt,p);assert.equal(drawn,who);assert.equal(s.ai_banxing.filter(evt,p),false);
 }
 p.skills.clear();p.getHistory=()=>[{es:[card],getParent:()=>evt}];assert.equal(s.ai_banxing.filter(evt,p),false);
});
async function reason({steps=3,lastColor='red'}={}){
 const cards=[{id:1,color:'black'},{id:2,color:'red'},{id:3,color:'red'}],p=player(),gained=[],bottom=[];let discarded=0,bonus=0;
 const localGet={...get,cards:()=>cards.slice()};const localGame={...game,cardsGotoOrdering:async()=>{},cardsGotoPile:async list=>bottom.push(...list)};
 const skills=createAiSkills(localGame,localGet,lib,{},status);
 p.gain=async card=>gained.push(card);p.draw=async()=>bonus++;
 p.chooseButton=args=>choice({bool:true,links:[args[1][0]]});
 p.chooseToDiscard=()=>choice(++discarded<steps?{bool:true,cards:[{color:lastColor}]}:{bool:false});
 p.chooseToMove=()=>choice({bool:true,moved:[[cards[2],cards[1]]]});
 await skills.ai_tuili.content({}, {},p);return {gained,bottom,bonus,p,discarded};
}
test('Tuili can stop after first free card and preserves custom bottom order',async()=>{
 const {gained,bottom,bonus,p}=await reason({steps:1});assert.deepEqual(gained.map(c=>c.id),[1]);assert.deepEqual(bottom.map(c=>c.id),[3,2]);assert.equal(bonus,0);assert.equal(p.storage.ai_yansuan_record.length,1);
});
test('Tuili charges two discards for depth three and rewards only the final matching color',async()=>{
 for(const color of ['red','black','none']){const r=await reason({lastColor:color});assert.equal(r.gained.length,3);assert.equal(r.discarded,2);assert.equal(r.bottom.length,0);assert.equal(r.bonus,color==='red'?1:0);}
});
test('Yansuan excludes converted, damaging, non-hand and earlier-turn cards',()=>{
 const p=player(),card={type:'trick'},evt={card:{type:'trick'},cards:[card]},loss={hs:[card],getParent:()=>evt};p.storage.ai_yansuan_record=[card];let damages=[];p.getHistory=(type,filter)=>{const rows=type==='lose'?[loss]:damages;return filter?rows.filter(filter):rows;};
 assert.equal(s.ai_yansuan.filter(evt,p),true);evt.card.converted=true;assert.equal(s.ai_yansuan.filter(evt,p),false);delete evt.card.converted;
 damages=[{getParent:()=>evt}];assert.equal(s.ai_yansuan.filter(evt,p),false);damages=[];
 loss.hs=[];assert.equal(s.ai_yansuan.filter(evt,p),false);loss.hs=[card];p.storage.ai_yansuan_record=[];assert.equal(s.ai_yansuan.filter(evt,p),false);
});
test('Bianyi stores exactly one program and shares the same consumable with debugging',async()=>{
 const p=player(),card={type:'basic',color:'red'};let cards=[],tag,drawn=0,marks=0;p.getExpansions=()=>cards;p.countCards=()=>2;
 p.addToExpansion=list=>{cards=list;const task=Promise.resolve();task.gaintag={add:name=>tag=name};return task;};
 assert.equal(s.ai_bianyi.filter({},p),true);await s.ai_bianyi.content({cards:[card]}, {},p);assert.equal(tag,'ai_bianyi');assert.equal(s.ai_bianyi.filter({},p),false);
 assert.equal(s.ai_bianyi.subSkill.execute.filter({card:{type:'basic'}},p),true);assert.equal(s.ai_bianyi.subSkill.execute.filter({card:{type:'trick'}},p),false);
 p.loseToDiscardpile=async()=>{cards=[];};p.draw=async n=>drawn+=n;p.addMark=(name,n)=>marks+=n;p.countMark=()=>marks;
 await s.ai_bianyi.subSkill.execute.content({}, {},p);assert.equal(drawn,2);assert.equal(marks,1);assert.equal(s.ai_bianyi.subSkill.sha.mod.cardUsable({name:'sha'},p,1),2);
 assert.equal(s.ai_tiaoshi.filter({num:1,card:{color:'red'}},p),false);
});
test('Claude trick program discards from hej and equip program offers one heal',async()=>{
 for(const type of ['trick','equip']){const p=player(),target={recover:async()=>effects++};let effects=0;const card={type};p.getExpansions=()=>[card];p.loseToDiscardpile=async()=>{};p.draw=async()=>{};p.chooseTarget=()=>choice({bool:true,targets:[target]});p.discardPlayerCard=async(t,zone)=>{assert.equal(zone,'hej');effects++;};await s.ai_bianyi.subSkill.execute.content({}, {},p);assert.equal(effects,1);}
});
test('Tiaoshi rejects wrong or absent color and consumes program to reduce damage only once',async()=>{
 const p=player();let cards=[{color:'red'}];p.getExpansions=()=>cards;p.loseToDiscardpile=async()=>{cards=[];};
 assert.equal(s.ai_tiaoshi.filter({num:1,card:{color:'red'}},p),true);assert.equal(s.ai_tiaoshi.filter({num:1,card:{color:'black'}},p),false);assert.equal(s.ai_tiaoshi.filter({num:1},p),false);
 const damage={num:1};await s.ai_tiaoshi.content({},damage,p);assert.equal(damage.num,0);assert.equal(cards.length,0);assert.equal(s.ai_tiaoshi.usable,1);
});
test('Dongcha hit takes matching revealed card; miss draws; both must give one hand card',async()=>{
 for(const hit of [true,false]){const p=player(),card={type:hit?'basic':'trick'},target={getCards:()=>({randomGets:()=>[card],includes:c=>c===card}),isIn:()=>true};let gains=0,draws=0,gives=0;
 p.chooseControl=()=>choice({index:0});p.chooseButton=()=>choice({links:[card]});p.gain=async()=>gains++;p.draw=async()=>draws++;p.countCards=()=>1;p.chooseToGive=async()=>gives++;
 await s.ai_dongcha.content({target},{},p);assert.equal(gains,hit?1:0);assert.equal(draws,hit?0:1);assert.equal(gives,1);}
});
test('Zhiyan refusal changes only the current target damage and preserves normal responses',async()=>{
 const p=player(),use={customArgs:{other:{extraDamage:2}}};let shown=0;p.chooseCard=()=>choice({bool:true,cards:[{color:'red'}]});p.showCards=async()=>shown++;
 const target={playerid:'victim',chooseToDiscard:()=>choice({bool:false})};await s.ai_zhiyan.content({}, {target,getParent:()=>use},p);
 assert.equal(use.customArgs.victim.extraDamage,1);assert.equal(use.customArgs.other.extraDamage,2);assert.equal(use.directHit,undefined);assert.equal(shown,1);assert.equal(p.hasSkill('ai_zhiyan_used'),true);
});
test('Zhiyan accepted payment is shown then discarded and does not boost damage',async()=>{
 const p=player(),order=[],use={};p.chooseCard=()=>choice({bool:true,cards:[{color:'black'}]});p.showCards=async()=>{};
 const target={chooseToDiscard:()=>choice({bool:true,cards:[{}]}),showCards:async()=>order.push('show'),discard:async()=>order.push('discard')};
 await s.ai_zhiyan.content({}, {target,getParent:()=>use},p);assert.deepEqual(order,['show','discard']);assert.equal(use.customArgs,undefined);
});
test('remote callbacks in new skills can execute with engine scope and without factory closures',async()=>{
 const callbacks=[];const localGet={...get,infoFuncOL:source=>{callbacks.push(source.slice(13));return get.infoFuncOL(source);}};
 const skills=createAiSkills(game,localGet,lib,{},status),p=player();p.chooseCard=()=>choice({bool:false});await skills.ai_zhiyan.content({}, {},p);
 for(const source of callbacks){const fn=vm.runInNewContext(`(${source})`,{get,lib,_status:{event:{}}});assert.equal(typeof fn,'function');}
 const filter=vm.runInNewContext(`(${callbacks[0]})`,{get,lib,_status:{event:{}}});assert.equal(filter({color:'red'}),true);assert.equal(filter({color:'none'}),false);
});
