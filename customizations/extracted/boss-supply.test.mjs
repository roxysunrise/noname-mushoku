import test from 'node:test';
import assert from 'node:assert/strict';
import { bossCharacters, createBossSkills } from './game/resources/app/noname/init/mushoku-boss.js';

test('each registered boss inherits three-card draw and plus-two hand limit', async () => {
 const skills = createBossSkills({}, {});
 for (const character of Object.values(bossCharacters)) {
  assert.ok(character.skills.includes('mt_boss_supply'));
 }
 const supply = skills.mt_boss_supply;
 const draw = { num: 2 };
 assert.ok(supply.filter(draw));
 await supply.content({}, draw);
 assert.equal(draw.num, 3);
 assert.equal(supply.mod.maxHandcard({}, 4), 6);
 assert.equal(supply.filter({ num: 2, numFixed: true }), false);
 // Preserve modifiers from other skills rather than replacing the final count.
 const bonus = { num: 4 };
 await supply.content({}, bonus);
 assert.equal(bonus.num, 5);
});

test('Alucard Boss v6 starts 6/6 and uses the shared Leader supply exactly once', async () => {
 assert.equal(bossCharacters.boss_alucard.hp, 6);
 assert.equal(bossCharacters.boss_alucard.maxHp, 6);
 const skills = createBossSkills({}, {});
 assert.ok(bossCharacters.boss_alucard.skills.includes('mt_boss_supply'));
 assert.equal(skills.al_life.subSkill.supply, undefined);
 const draw = { num: 1 };
 await skills.mt_boss_supply.content({}, draw);
 assert.equal(draw.num, 2);
 assert.equal(skills.mt_boss_supply.mod.maxHandcard({}, 8), 10);
});
