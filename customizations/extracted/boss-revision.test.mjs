import test from 'node:test';
import assert from 'node:assert/strict';
import {createBossSkills,bossCharacters,bossCharacterIntro} from './game/resources/app/src/noname/init/mushoku-boss.js';
import {installMushokuCompatibility} from './game/resources/app/noname/init/mushoku-compatibility.js';
import {createAlucardSkills} from './game/resources/app/src/noname/init/mushoku-alucard.js';

test('punishment draws only once across victims and caps the full effect at two after awakening',async()=>{
 for(const awakened of [false,true]){
  const p={storage:{jh_monster_awakened:awakened},skills:new Set(),drawn:0,
   hasSkill(id){return this.skills.has(id);},addTempSkill(id,expiry){this.skills.add(id);this.expiry=expiry;},syncStorage(){},async draw(){this.drawn++;}};
  const skill=createBossSkills({},{}).jh_punishment;let discarded=0;
  for(let i=0;i<3;i++){
   const victim={countCards:()=>i%2,chooseToDiscard:async()=>discarded++};
   const hit={num:1,player:victim};
   const allowed=skill.filter(hit,p);assert.equal(allowed,!awakened||i<2);
   if(allowed)await skill.content({},hit,p);
   assert.equal(hit.num,i%2===0&&allowed?2:1);
  }
  assert.equal(p.drawn,1);assert.equal(discarded,1);assert.deepEqual(p.expiry,{global:'phaseAfter'});
  p.skills.delete('jh_punishment_turn');delete p.storage.jh_punishment_turn;
  assert.equal(skill.filter({},p),true);
  await skill.content({}, {num:1,player:{countCards:()=>0}},p);assert.equal(p.drawn,2);
 }
});

test('river conversion requires release and a hand card, accepts all suits and preserves native use/respond flow',()=>{
 const skills=createAlucardSkills({},{});const p={storage:{},countCards:()=>1};
 assert.deepEqual(skills.al_river_released.group,['al_river_sha','al_river_shan','al_river_bonus']);
 assert.equal(skills.al_river.group,undefined);
 for(const name of ['sha','shan']){
  const skill=skills.al_river.subSkill[name];
  assert.deepEqual(skill.enable,['chooseToUse','chooseToRespond']);
  assert.equal(skill.viewAsFilter(p),false);p.storage.al_released=true;
  assert.equal(skill.viewAsFilter(p),true);assert.equal(skill.hiddenCard(p,name),true);
  assert.equal(skill.viewAs.name,name);assert.equal(skill.position,'h');assert.equal(skill.filterCard,true);assert.equal(skill.selectCard,1);
  p.countCards=()=>0;assert.equal(skill.viewAsFilter(p),false);assert.equal(skill.hiddenCard(p,name),false);
  p.countCards=()=>1;p.storage.al_released=false;
 }
});

test('river grants no permanent double-Shan pressure in v6',()=>{
 const skills=createAlucardSkills({},{});
 assert.equal(skills.al_river.subSkill.pressure,undefined);
 assert.ok(!skills.al_river_released.group.includes('al_river_pressure'));
});

test('all Boss descriptions are installed in the character introduction registry',()=>{
 for(const id of ['boss_alucard','boss_mt_roxy','boss_johan']){assert.equal(bossCharacters[id].hp,6,id);assert.equal(bossCharacters[id].maxHp,6,id);}
 const monster=createBossSkills({},{}).jh_monster;
 assert.equal(monster.filter({}, {hp:3,storage:{}}),true);
 assert.equal(monster.filter({}, {hp:4,storage:{}}),false);
 const lib={config:{mode:'boss',characters:[]},character:{},characterPack:{},group:[]};
 installMushokuCompatibility(lib);
 for(const id of Object.keys(bossCharacters)){
  assert.ok(bossCharacterIntro[id]?.length>20,id);assert.equal(lib.characterIntro[id],bossCharacterIntro[id]);
 }
});
