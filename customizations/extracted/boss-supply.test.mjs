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

test('Alucard starts 3/3 and draws with max HP, preserving bonuses and fixed counts', async () => {
 assert.equal(bossCharacters.boss_alucard.hp, 3);
 assert.equal(bossCharacters.boss_alucard.maxHp, 3);
 const skills = createBossSkills({}, {});
 const extra = skills.al_king.subSkill.supply;
 for (const maxHp of [1, 3, 4, 5]) {
  const p = { hp: 1, maxHp };
  const draw = { num: 2 };
  await skills.mt_boss_supply.content({}, draw);
  if (extra.filter(draw, p)) await extra.content({}, draw, p);
  assert.equal(draw.num, Math.max(3, maxHp));
  assert.equal(extra.filter({ numFixed: true }, p), false);
 }
 const draw = { num: 4 };
 await extra.content({}, draw, { maxHp: 5 });
 assert.equal(draw.num, 6);
});
