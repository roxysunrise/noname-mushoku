import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateChoices, allocateRoles, configureOnlineMenus, roomSeats, prepareOnlineMode } from './game/resources/app/noname/init/mushoku-online-modes.js';
import { roomError, findAiSeat, installMushokuOnline } from './game/resources/app/noname/init/mushoku-online.js';
import characters from './game/resources/app/noname/init/mushoku-characters.js';

test('candidate pools remain disjoint and nonempty for every legal roster size, including AI fallback', () => {
  for (let seats = 2; seats <= 4; seats++) for (let count = seats; count <= 15; count++) {
    const ids = Object.keys(characters).slice(0, count);
    const pools = allocateChoices(ids, Array.from({length:seats},(_,i)=>String(i)));
    assert.ok(Object.values(pools).every(p=>p.length > 0));
    const all = Object.values(pools).flat();
    assert.equal(new Set(all).size, all.length);
  }
});
test('new modes have fixed seat counts and validate subtype, roster and Boss registration', () => {
  for (const [mode, seats] of [['doudizhu',3],['versus',4],['boss',4]]) {
    assert.equal(roomSeats({mode,number:8,player_number:8}),seats);
    assert.equal(roomError({}, {mode}),null);
    assert.ok(roomError({}, {mode,double_character:true}));
  }
  assert.ok(roomError({}, {mode:'doudizhu',doudizhu_mode:'online'}));
  assert.ok(roomError({}, {mode:'versus',versus_mode:'4v4'}));
  assert.ok(roomError({}, {mode:'boss',boss_character:'boss_lvbu'}));
  const banned=Object.keys(characters).slice(2);
  assert.ok(roomError({}, {mode:'boss',banned}));
  assert.equal(roomError({}, {mode:'boss',banned:Object.keys(characters).slice(3)}),null);
});
test('Boss can be taken over and dead/occupied seats cannot be claimed', () => {
  const host={}, boss={isIn:()=>true}, dead={isIn:()=>false}, taken={isIn:()=>true,ws:{closed:false}}, open={isIn:()=>true};
  assert.equal(findAiSeat({me:host,boss,players:[host,boss,dead,taken,open]}),boss);
  boss.ws={closed:false};
  assert.equal(findAiSeat({me:host,boss,players:[host,boss,dead,taken,open]}),open);
});
test('Boss win and reconnect state preserve team and boss reference', () => {
  const boss={playerid:'b',identity:'zhu',side:true,isAlive:()=>true};
  const hero={playerid:'h',identity:'fan',side:false};
  const over=[];
  const lib={configOL:{mode:'boss'},playerOL:{b:boss,h:hero},character:{}};
  const game={me:hero,players:[boss,hero],dead:[],boss,mushokuOnlineContext:{ui:{},status:{}},hasPlayer:fn=>game.players.some(fn),over:r=>over.push(r)};
  const mode=prepareOnlineMode({name:'boss',game:{}},lib,{},game);
  assert.equal(mode.game.checkOnlineResult(hero),false);
  const snapshot=mode.game.getState();
  delete game.boss;
  boss.setIdentity=()=>{};hero.setIdentity=()=>{};
  mode.game.updateState(snapshot);
  assert.equal(game.boss,boss);assert.equal(hero.side,false);
  mode.game.checkResult();assert.equal(over.length,0);
  boss.isAlive=()=>false;
  mode.game.checkResult();assert.deepEqual(over,[true]);
  assert.equal(mode.game.checkOnlineResult(hero),true);
});
test('Boss lobby accepts three guests and rejects a fourth concurrent handshake', () => {
  const lib={config:{},configOL:{mode:'boss'},node:{clients:[],banned:[]},message:{server:{init(){},changeRoomConfig(){}}}};
  const game={createServer(){},switchMode(){}};
  const ui={create:{connectPlayers(){}}};
  installMushokuOnline(lib,game,ui,{config:()=>false},{waitingForPlayer:true});
  game.createServer();
  const make=()=>({sent:[],send(...a){this.sent.push(a)},close(){this.closed=true}});
  for(let i=0;i<4;i++) {
    const c=make();lib.node.clients.push(c);
    lib.message.server.init.call(c,lib.versionOL,{nickname:'guest'},'');
    assert.equal(!!c.closed,i===3);
  }
});

test('roles honor available preferences and resolve oversubscription without breaking capacities',()=>{
 const seats=['host','guest','ai1','ai2'];
 for(let i=0;i<100;i++){
  const roles=allocateRoles(seats,['zhu','fan','fan','fan'],{host:'zhu',guest:'zhu'});
  assert.equal(Object.values(roles).filter(r=>r==='zhu').length,1);
  assert.ok(roles.host==='zhu'||roles.guest==='zhu');
 }
 assert.equal(allocateRoles(seats,['zhu','fan','fan','fan'],{guest:'zhu'}).guest,'zhu');
 assert.throws(()=>allocateRoles(seats,['zhu']));
 const winners=new Set();
 for(let i=0;i<100;i++){const r=allocateRoles(seats,['zhu','fan','fan','fan']);winners.add(seats.find(id=>r[id]==='zhu'));}
 assert.equal(winners.size,4);
 const roles=allocateRoles(['host','guest'],['zhu','fan'],{host:'fan',guest:'zhu'});
 assert.deepEqual(roles,{guest:'zhu',host:'fan'});
 assert.equal(roomSeats({mode:'versus',versus_mode:'1v1',number:8}),2);
 assert.equal(roomError({}, {mode:'versus',versus_mode:'1v1'}),null);
 assert.ok(roomError({}, {mode:'boss',team_mode:'unknown'}));
});

test('saved 1v1 survives menu initialization and every online mode exposes allocation',()=>{
 const lib={config:{mode_config:{versus:{connect_versus_mode:'1v1'}}},mode:{identity:{connect:{}},doudizhu:{connect:{connect_doudizhu_mode:{},connect_double_character:{}}},versus:{connect:{connect_versus_mode:{}}},boss:{}}};
 const saves=[];configureOnlineMenus(lib,{saveConfig:(...a)=>saves.push(a)});
 assert.ok(!saves.some(a=>a[0]==='connect_versus_mode'));
 for(const m of Object.values(lib.mode))assert.deepEqual(Object.keys(m.connect.connect_team_mode.item),['random','free']);
});

test('human host Boss receives correct defeat and victory results',()=>{
 const boss={side:true,isAlive:()=>false};let outcome;
 const game={me:boss,boss,mushokuOnlineContext:{ui:{},status:{}},hasPlayer:()=>true,over:r=>outcome=r};
 const mode=prepareOnlineMode({name:'boss',game:{}},{character:{},configOL:{}},{},game);
 mode.game.checkResult();assert.equal(outcome,false);
 boss.isAlive=()=>true;game.hasPlayer=()=>false;
 mode.game.checkResult();assert.equal(outcome,true);
});

test('reconnect resolves all sides before rendering friend and enemy labels',()=>{
 const player=()=>({node:{identity:{firstChild:{},dataset:{}}}});
 const host=player(),guest=player();const game={me:guest,mushokuOnlineContext:{ui:{},status:{}}};
 const mode=prepareOnlineMode({name:'versus',game:{}},{configOL:{mode:'versus'},playerOL:{host,guest}},{},game);
 mode.game.updateState({host:{side:false,identity:'fan'},guest:{side:false,identity:'fan'}});
 assert.equal(host.node.identity.firstChild.textContent,'友');
 assert.equal(guest.node.identity.firstChild.textContent,'友');
});

test('1v1 lobby rejects a second guest and ignores capacity changes',()=>{
 const changes=[];const lib={config:{},configOL:{mode:'versus',versus_mode:'1v1'},node:{clients:[],banned:[]},message:{server:{init(){},changeRoomConfig:c=>changes.push(c)}}};
 const game={createServer(){},switchMode(){}};installMushokuOnline(lib,game,{create:{connectPlayers(){}}},{config:()=>false},{waitingForPlayer:true});game.createServer();
 for(let i=0;i<2;i++){const c={send(){},close(){this.closed=true;}};lib.node.clients.push(c);lib.message.server.init.call(c,lib.versionOL,{nickname:'guest'},'');assert.equal(!!c.closed,i===1);}
 lib.message.server.changeRoomConfig({versus_mode:'2v2'});assert.equal(changes.length,0);
 lib.message.server.changeRoomConfig({team_mode:'free'});assert.equal(changes.length,1);
});
