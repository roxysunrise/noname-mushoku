import test from 'node:test';
import assert from 'node:assert/strict';
import { createBossSkills } from './game/resources/app/src/noname/init/mushoku-boss.js';

function fixture() {
 const player = { storage: {}, skills: new Set(),
  addTempSkill(id, expiry) { this.skills.add(id); this.expiry = expiry; },
  hasSkill(id) { return this.skills.has(id); },
  removeSkill(id) { this.skills.delete(id); delete this.storage[id]; },
  syncStorage() {}, markSkill() {}, getStorage(id) { return this.storage[id] || []; },
 };
 const selected = {}, other = {};
 return { player, selected, other, skills: createBossSkills({}, {}) };
}

test('perfect crime is activated during the play phase and targets another player', () => {
 const { player, selected, skills } = fixture();
 assert.equal(skills.jh_crime.enable, 'phaseUse');
 assert.equal(skills.jh_crime.usable, 1);
 assert.equal(skills.jh_crime.filterTarget({}, player, player), false);
 assert.equal(skills.jh_crime.filterTarget({}, player, selected), true);
});

test('selected source is protected only once; other and sourceless damage do not consume protection', async () => {
 const { player, selected, other, skills } = fixture();
 await skills.jh_crime.content({ target: selected }, {}, player);
 const guard = skills.jh_crime.subSkill.guard;
 assert.deepEqual(player.storage.jh_crime_guard, [selected]);
 assert.deepEqual(player.expiry, { player: 'phaseBegin' });
 assert.equal(guard.filter({ source: other, num: 1 }, player), false);
 assert.equal(guard.filter({ num: 1 }, player), false);
 assert.equal(guard.filter({ source: selected, num: 0 }, player), false);
 for (const nature of [undefined, 'fire', 'thunder']) {
  if (!player.hasSkill("jh_crime_guard")) await skills.jh_crime.content({ target: selected }, {}, player);
  const hit = { source: selected, num: 2, nature, cancel() { this.cancelled = true; } };
  assert.equal(guard.filter(hit, player), true);
  await guard.content({}, hit, player);
  assert.equal(hit.cancelled, true);
  assert.equal(guard.filter(hit, player), false);
  assert.equal(player.storage.jh_crime_guard, undefined);
 }
 assert.equal(guard.filter({ source: other, num: 1 }, player), false);
 assert.equal(guard.filter({ num: 1 }, player), false);
 assert.equal(guard.filter({ source: selected, num: 0 }, player), false);
});

test('perfect crime allows the same target three times total and never refunds consumed or expired protection',async()=>{
 const {player,selected,other,skills}=fixture();
 for(let i=0;i<3;i++){
  assert.equal(skills.jh_crime.filter({},player),true);
  assert.equal(skills.jh_crime.filterTarget({},player,selected),true);
  await skills.jh_crime.content({target:selected},{},player);
  assert.equal(player.storage.jh_crime_uses,i+1);
  player.removeSkill('jh_crime_guard');
 }
 assert.equal(skills.jh_crime.filter({},player),false);
 await skills.jh_crime.content({target:other},{},player);
 assert.equal(player.storage.jh_crime_uses,3);
 assert.equal(player.storage.jh_crime_guard,undefined);
 // Exhausting the active ability must not disable the passive retaliation.
 assert.equal(skills.jh_crime.group,'jh_crime_source');
});

test('extra play phase replaces the previous selected source and preserves retaliation',async()=>{
 const {player,selected,other,skills}=fixture();
 await skills.jh_crime.content({target:selected},{},player);
 await skills.jh_crime.content({target:other},{},player);
 assert.deepEqual(player.storage.jh_crime_guard,[other]);
 assert.equal(skills.jh_crime.subSkill.guard.filter({num:1,source:selected},player),false);
 assert.equal(skills.jh_crime.group,'jh_crime_source');
 let discarded=0;const source={isIn:()=>true,countCards:()=>1,chooseToDiscard:async(zone,n,forced)=>{assert.equal(zone,'he');assert.equal(forced,true);discarded+=n;}};
 const retaliation=skills.jh_crime.subSkill.source;
 assert.equal(retaliation.filter({source}),true);await retaliation.content({}, {source});assert.equal(discarded,1);
 assert.equal(!!retaliation.filter({}),false);
});

test('guard listens only for damage and cleans its target storage on removal', () => {
 const { skills } = fixture();
 const guard = skills.jh_crime.subSkill.guard;
 assert.deepEqual(guard.trigger, { player: 'damageBegin4' });
 assert.equal(guard.onremove, true);
});
