import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createAiSkills } from './game/resources/app/src/character/ai/mechanics.js';
import { packForCharacter, characterTitles } from './game/resources/app/src/noname/init/mushoku-rosters.js';
import { availableCharacters } from './game/resources/app/noname/init/mushoku-online-modes.js';
import { roomError } from './game/resources/app/noname/init/mushoku-online.js';
const get={color:c=>c?.color,type2:c=>c.type,attitude:()=>1,value:()=>1};
const game={hasPlayer:fn=>fn({})};
const lib={filter:{cardDiscardable:()=>true}};
get.infoFuncOL=info=>vm.runInNewContext(`(${info.slice(13)})`,{lib,get,_status:{}});
const s=createAiSkills(game,get,lib);
const choice=result=>({set(){return this;},forResult:async()=>result});
test('AI is a separate legal online pack with five characters; GPT never leaks into anime',()=>{
 const ids=availableCharacters({characterPack:['ai']});
 assert.equal(ids.length,5); assert.ok(ids.includes('ac_chatgpt'));
 assert.equal(packForCharacter('ac_chatgpt'),'ai');
 assert.equal(availableCharacters({characterPack:['mushoku']}).includes('ac_chatgpt'),false);
 assert.equal(roomError({}, {mode:'versus',characterPack:['ai']}),null);
 assert.match(roomError({}, {mode:'identity',number:8,characterPack:['ai']}),/8/);
 assert.ok(characterTitles.th_mokou.includes('不灭的烟火'));
 for(const id of ids) assert.ok(characterTitles[id]?.includes('<span'));
});
test('Doubao support needs a real two-card gain and offers bounded resource-based synergy',async()=>{
 let own=0,other=0;
 const target={isIn:()=>true,countCards:()=>5,draw:async()=>other++};
 const p={isIn:()=>true,countCards:()=>2,draw:async()=>own++};
 assert.equal(s.ai_banda.usable,1);
 assert.equal(s.ai_banda.filter({player:target,cards:[{}]},p),false);
 assert.equal(s.ai_banda.filter({player:target,cards:[{},{}]},p),true);
 assert.equal(s.ai_banda.filter({player:p,cards:[{},{}]},p),false);
 await s.ai_banda.content({}, {player:target},p);
 assert.equal(own,1); assert.equal(other,1);
 let given=false; p.give=async()=>{given=true;};target.hp=5;
 await s.ai_qingyu.content({cards:[{}],target},{},p);assert.ok(given);assert.equal(other,2);
});
test('DeepSeek rewards equal draw colors, excludes colorless pairs, and heals only after transfer',async()=>{
 let extra=0;
 for(const [colors,expected] of [[['red','red'],1],[['red','black'],0],[['none','none'],0]]){
  extra=0;const p={draw(n){if(n===2)return choice(colors.map(color=>({color})));extra++;return Promise.resolve();}};
  await s.ai_shensuan.content({}, {},p);assert.equal(extra,expected);
 }
 const order=[];const target={isIn:()=>true,isDamaged:()=>true,recover:async()=>order.push('heal')};
 const p={chooseCardTarget:()=>choice({bool:true,cards:[{}],targets:[target]}),logSkill(){},give:async()=>order.push('give')};
 await s.ai_chengsi.content({}, {},p);assert.deepEqual(order,['give','heal']);
});
test('Claude blocks matching-color damage only and counts card categories correctly',async()=>{
 const p={countCards:(zone,filter)=>[{color:'red'}].filter(filter).length};
 assert.equal(s.ai_shenshen.filter({num:1,card:{color:'red'}},p),true);
 assert.equal(s.ai_shenshen.filter({num:1,card:{color:'black'}},p),false);
 assert.equal(s.ai_shenshen.filter({num:1},p),false);
 let discarded=0;const damage={num:1};await s.ai_shenshen.content({cards:[{}]},damage,{discard:async()=>discarded++});
 assert.equal(damage.num,0);assert.equal(discarded,1);
 assert.equal(s.ai_chengzhang.filter({}, {getHistory:()=>[{card:{type:'trick'}},{card:{type:'trick'}}]}),false);
 assert.equal(s.ai_chengzhang.filter({}, {getHistory:()=>[{card:{type:'basic'}},{card:{type:'trick'}}]}),true);
});
test('Grok remote discard filter survives serialization and declines cause one damage',async()=>{
 let hits=0,callback,props={};
 const target={isIn:()=>true,damage:async()=>hits++,chooseToDiscard(...args){callback=args[2];return {set(k,v){props[k]=v;return this;},forResult:async()=>({bool:false})};}};
 await s.ai_ruiwen.content({target,cards:[{color:'black'}]}, {},{});
 assert.equal(hits,1);
 const remote=card=>vm.runInNewContext(`(${callback.toString()})(card)`,{card,get,_status:{event:props},window:{}});
 assert.equal(remote({color:'black'}),true);assert.equal(remote({color:'red'}),false);
 assert.equal(s.ai_zhuiwen.usable,1);assert.equal(s.ai_zhuiwen.trigger.player,'shaMiss');
});
