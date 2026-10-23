import test from 'node:test';
import assert from 'node:assert/strict';
import { roomError, findAiSeat, installMushokuOnline } from './game/resources/app/noname/init/mushoku-online.js';
import { getMushokuRestriction, prepareMushokuMode } from './game/resources/app/noname/init/mushoku-compatibility.js';
import characters from './game/resources/app/noname/init/mushoku-characters.js';
function fixture() {
 const host={playerid:'host',isIn:()=>true};
 const ai=Array.from({length:3},(_,i)=>({playerid:`ai${i}`,hp:3,name:`role${i}`,hand:[i],isIn:()=>true,setNickname(){}}));
 const calls=[];
 const status={waitingForPlayer:true};
 const lib={config:{},configOL:{mode:'identity',identity_mode:'normal',number:4,characterPack:['mushoku','minecraft']},node:{banned:[],clients:[]},playerOL:Object.fromEntries(ai.map(p=>[p.playerid,p])),message:{server:{
  init(version,config){calls.push(['init',config.nickname]);},changeRoomConfig(config){calls.push(['config',config]);}
 }}};
 const game={me:host,players:[host,...ai],phaseNumber:1,createServer(){calls.push(['server']);},broadcast(){},getState:()=>({}),log(){}};
 const ui={create:{connectPlayers(){game.connectPlayers=[host,...ai].map(()=>({node:{nameol:{}}}));}}};
 const get={config:()=>false,plainText:s=>s,arenaState:()=>({players:Object.keys(lib.playerOL)})};
 lib.connectCardPack=['standard','jiubian'];
 game.switchMode=function(mode){calls.push(['switch',mode,[...lib.connectCardPack]]);};
 lib.message.client={updateWaiting(){game.connectPlayers.forEach(p=>p.node.nameol.textContent='');}};
 installMushokuOnline(lib,game,ui,get,status);
 game.createServer();
 const client=()=>({id:'new',sent:[],send(...args){this.sent.push(args);},close(){this.closed=true;}});
 const join=(c,config={nickname:'guest'})=>lib.message.server.init.call(c,lib.versionOL,config,'test');
 return {lib,game,ui,get,status,ai,calls,client,join};
}
test('room validates mode, single-general, seat count, bans and enabled roster',()=>{
 const f=fixture(); const c=f.lib.configOL;
 assert.equal(roomError(f.lib),null);
 for(const bad of [{mode:'stone'},{identity_mode:'purple'},{double_character:true},{number:9},{number:1},{number:2.5},{characterPack:['standard']},{number:8,banned:Object.keys(characters).slice(0,-7)}]) assert.ok(roomError(f.lib,{...c,...bad}));
 assert.equal(getMushokuRestriction({}, {config:()=>false}, 'connect'),null);
});
test('online mode loading defers room checks until switchMode has populated configOL',()=>{
 const start=()=>{};
 const lib={config:{mode:'connect'},configOL:{},mushokuCompatibility:{},filter:{characterDisabled(){throw Error('room not initialized');}}};
 const mode=prepareMushokuMode({name:'identity',start},lib,{config:()=>false});
 assert.equal(mode.start,start);
});

test('identity rooms exclude guozhan-only Jiubian cards before mode configuration',()=>{
 const f=fixture();f.game.switchMode('identity');
 assert.deepEqual(f.calls.at(-1),['switch','identity',['standard']]);
 assert.ok(roomError(f.lib,{...f.lib.configOL,cardPack:['standard','jiubian']}));
});

test('AI labels survive lobby refresh',()=>{
 const f=fixture();f.ui.create.connectPlayers();
 f.lib.message.client.updateWaiting();
 assert.ok(f.game.connectPlayers.every(p=>p.node.nameol.textContent.includes('AI')));
});
test('room keeps configured total seats with one human and labels open seats as AI',()=>{
 const f=fixture(); assert.equal(f.lib.configOL.number,4);assert.equal(f.lib.configOL.mushokuAiRoom,true);
 f.ui.create.connectPlayers(); assert.ok(f.game.connectPlayers.every(p=>p.node.nameol.textContent.includes('AI')));
 const c=f.client(); f.join(c); assert.deepEqual(f.calls.at(-1),['init','guest']);
});
test('late joins sequentially replace distinct AI seats without changing game state; full room rejects',()=>{
 const f=fixture(); f.status.waitingForPlayer=false;
 for(let i=0;i<3;i++){
  const c=f.client(); const seat=f.ai[i],hand=seat.hand;
  f.join(c,{nickname:`player${i}`});
  assert.equal(c.id,seat.playerid); assert.equal(seat.ws,c); assert.equal(seat.hp,3); assert.equal(seat.hand,hand);assert.equal(seat.name,`role${i}`);
  assert.equal(c.sent[0][0] instanceof Function,true); assert.equal(c.sent[1][0],'reinit'); assert.equal(c.inited,undefined);
 }
 const extra=f.client();f.join(extra);assert.equal(extra.sent[0][1],'number');assert.ok(extra.closed);
});
test('disconnected seats become AI candidates and reconnect uses native handshake without taking a second seat',()=>{
 const f=fixture();f.status.waitingForPlayer=false; const first=f.client();f.join(first);first.closed=true;
 assert.equal(findAiSeat(f.game),f.ai[0]);
 const reconnect=f.client();f.join(reconnect,{nickname:'return',id:f.ai[0].playerid});assert.equal(f.calls.at(-1)[0],'init');
 const next=f.client();f.join(next); assert.equal(f.ai[0].ws,next);
 const steal=f.client();f.join(steal,{nickname:'other',id:f.ai[0].playerid});assert.ok(steal.closed); assert.equal(f.ai[0].ws,next);
});
test('wrong protocol, bans, dead seats and game-over never grant AI control',()=>{
 const f=fixture();f.status.waitingForPlayer=false;
 const wrong=f.client();f.lib.message.server.init.call(wrong,27,{nickname:'old'},'test');assert.ok(wrong.closed);assert.equal(wrong.sent[0][1],'version');
 f.lib.node.banned.push('ban');const banned=f.client();f.lib.message.server.init.call(banned,f.lib.versionOL,{nickname:'bad'},'ban');assert.ok(banned.closed);
 f.ai[0].isIn=()=>false;const good=f.client();f.join(good);assert.equal(good.id,'ai1');
 f.status.over=true;const ended=f.client();f.join(ended);assert.equal(f.calls.at(-1)[0],'init');assert.equal(f.ai[2].ws,undefined);
});
test('room configuration changes reject unsupported modes and shortages',()=>{
 const f=fixture();f.lib.message.server.changeRoomConfig.call({}, {double_character:true});assert.notEqual(f.calls.at(-1)[0],'config');
 f.lib.message.server.changeRoomConfig.call({}, {choose_timeout:'30'});assert.equal(f.calls.at(-1)[0],'config');
});
