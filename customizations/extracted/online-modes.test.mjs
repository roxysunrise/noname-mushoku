import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateChoices, roomSeats, prepareOnlineMode } from './game/resources/app/noname/init/mushoku-online-modes.js';
import { roomError, findAiSeat, installMushokuOnline } from './game/resources/app/noname/init/mushoku-online.js';
import characters from './game/resources/app/noname/init/mushoku-characters.js';

test('candidate pools remain disjoint and nonempty for every legal roster size, including AI fallback', () => {
  for (let seats = 3; seats <= 4; seats++) for (let count = seats; count <= 15; count++) {
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
test('Boss stays AI during takeover and dead/occupied challengers cannot be claimed', () => {
  const host={}, boss={isIn:()=>true}, dead={isIn:()=>false}, taken={isIn:()=>true,ws:{closed:false}}, open={isIn:()=>true};
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
test('Boss lobby reserves the fourth slot even during concurrent handshakes', () => {
  const lib={config:{},configOL:{mode:'boss'},node:{clients:[],banned:[]},message:{server:{init(){},changeRoomConfig(){}}}};
  const game={createServer(){},switchMode(){}};
  const ui={create:{connectPlayers(){}}};
  installMushokuOnline(lib,game,ui,{config:()=>false},{waitingForPlayer:true});
  game.createServer();
  const make=()=>({sent:[],send(...a){this.sent.push(a)},close(){this.closed=true}});
  for(let i=0;i<3;i++) {
    const c=make();lib.node.clients.push(c);
    lib.message.server.init.call(c,lib.versionOL,{nickname:'guest'},'');
    assert.equal(!!c.closed,i===2);
  }
});
