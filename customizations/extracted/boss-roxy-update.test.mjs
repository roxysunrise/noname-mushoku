import test from 'node:test';
import assert from 'node:assert/strict';
import { bossCharacters, createBossSkills } from './game/resources/app/src/noname/init/mushoku-boss.js';

const choice = result => ({ set() { return this; }, async forResult() { return result; } });
function fixture(amount = 8) {
  const player = { storage: {}, skills: new Set(), hp: 8, maxHp: 8,
    countMark: () => amount, removeMark(id, n) { amount -= n; }, addMark(id, n) { amount += n; },
    hasSkill(id) { return this.skills.has(id); }, addTempSkill(id) { this.skills.add(id); },
    markAuto(id, items) { this.storage[id] ||= []; this.storage[id].push(...items); },
    markSkill() {}, unmarkSkill() {}, logSkill() {}, isIn: () => true,
    chooseControl(controls) { this.controls = controls; return choice({ control: this.control || 'cancel2' }); },
    draw: async function(n) { this.drawn = (this.drawn || 0) + n; },
    recover: async function(n) { this.hp = Math.min(this.maxHp, this.hp + n); },
  };
  const game = {};
  return { player, game, skills: createBossSkills(game, { value: () => 0 }), get mana() { return amount; } };
}

test('Roxy Boss starts with exactly six HP and six maximum HP', () => {
  assert.equal(bossCharacters.boss_mt_roxy.hp, 6);
  assert.equal(bossCharacters.boss_mt_roxy.maxHp, 6);
});

test('Roxy resolve threshold is reduced by one', () => {
  const skill = createBossSkills({}, {}).mt_boss_resolve;
  assert.equal(skill.filter({}, { hp: 2, storage: {} }), true);
  assert.equal(skill.filter({}, { hp: 3, storage: {} }), false);
});

test('water defense reduces damage by one per actually discarded hand card, down to zero', async () => {
  for (const discarded of [0, 1, 2]) {
    const f = fixture(4), { player, skills } = f;
    let damage = 0, calls = 0;
    const target = { isIn: () => true,
      chooseToDiscard(zone, range) {
        assert.equal(zone, 'h'); assert.deepEqual(range, [1, 2]);
        return choice({ bool: discarded > 0, cards: Array(discarded).fill({}) });
      },
      async damage(n, source) { damage += n; calls++; assert.equal(source, player); },
    };
    await skills.mt_boss_water.content({ target }, {}, player);
    assert.equal(damage, 2 - discarded);
    assert.equal(calls, discarded === 2 ? 0 : 1);
    assert.equal(f.mana, 3);
    assert.deepEqual(player.storage.mt_boss_water_targets, [target]);
  }
});

test('rain offers only affordable tiers and cancellation spends nothing', async () => {
  for (const amount of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
    const f = fixture(amount), { player, skills } = f;
    assert.equal(skills.mt_boss_rain.filter({}, player), amount >= 2);
    await skills.mt_boss_rain.content({}, {}, player);
    assert.equal(f.mana, amount);
    assert.equal(player.storage.mt_boss_chant, undefined);
    if (amount >= 2) assert.deepEqual(player.controls,
      [...[2, 4, 6, 8].filter(n => n <= amount).map(n => `${n}点魔力`), 'cancel2']);
  }
});

test('each chosen rain tier spends exactly its cost and stores that tier for release', async () => {
  for (const cost of [2, 4, 6, 8]) {
    const f = fixture(), { player, skills } = f;
    player.control = `${cost}点魔力`;
    await skills.mt_boss_rain.content({}, {}, player);
    assert.equal(f.mana, 8 - cost);
    assert.deepEqual(player.storage.mt_boss_chant, { damage: 0, cost });
    assert.equal(skills.mt_boss_rain.filter({}, player), false);
  }
});

test('all four rain tiers affect only living other characters, in discard-then-damage order', async () => {
  for (const cost of [2, 4, 6, 8]) {
    const f = fixture(), { player, skills, game } = f;
    const targets = [true, false].map(hasCard => ({ events: [], isIn: () => true,
      async chooseToDiscard(zone, n, forced) {
        assert.equal(zone, 'he'); assert.equal(n, 1); assert.equal(forced, true);
        this.events.push('discard'); return { bool: hasCard };
      },
      async damage(n, source) { assert.equal(source, player); this.events.push(`damage:${n}`); },
    }));
    const dead = { isIn: () => false, async damage() { assert.fail('dead target'); } };
    game.filterPlayer = fn => {
      const list = [player, ...targets, dead].filter(fn);
      list.sortBySeat = () => list;
      return list;
    };
    player.storage.mt_boss_chant = { damage: 0, cost };
    player.storage.mt_boss_resolved = true;
    await skills.mt_boss_rain.subSkill.release.content({}, {}, player);
    const expected = { 2: ['discard'], 4: ['damage:1'], 6: ['discard', 'damage:1'], 8: ['damage:2'] }[cost];
    for (const target of targets) assert.deepEqual(target.events, expected);
    assert.equal(player.storage.mt_boss_chant, undefined);
    assert.equal(skills.mt_boss_rain.subSkill.release.filter({}, player), false);
  }
});

test('rain skips the damage if its target leaves play while discarding', async () => {
  const { player, skills, game } = fixture();
  let alive = true;
  const target = { isIn: () => alive, async chooseToDiscard() { alive = false; },
    async damage() { assert.fail('departed target'); } };
  game.filterPlayer = () => { const list = [target]; list.sortBySeat = () => list; return list; };
  player.storage.mt_boss_chant = { damage: 0, cost: 6 };
  await skills.mt_boss_rain.subSkill.release.content({}, {}, player);
});

test('resolve triggers at two or less once, heals two, gains two mana and raises water quota', async () => {
  const f = fixture(0), { player, skills } = f;
  player.getStat = () => ({ skill: {} });
  for (const hp of [6, 4, 3]) { player.hp = hp; assert.equal(skills.mt_boss_resolve.filter({}, player), false); }
  player.hp = 2; assert.equal(skills.mt_boss_resolve.filter({}, player), true);
  await skills.mt_boss_resolve.content({}, {}, player);
  assert.equal(player.hp, 4); assert.equal(f.mana, 2);
  player.hp = 1; assert.equal(skills.mt_boss_resolve.filter({}, player), false);
  assert.ok(player.storage.mt_boss_resolved);
});

test('rain interrupts at four actual damage, clears the chosen tier, and refunds once', async () => {
  const f = fixture(), { player, skills } = f;
  player.control = '6点魔力';
  await skills.mt_boss_rain.content({}, {}, player);
  const interrupt = skills.mt_boss_rain.subSkill.interrupt;
  assert.equal(interrupt.filter({ num: 0 }, player), false);
  await interrupt.content({}, { num: 3 }, player);
  assert.equal(player.storage.mt_boss_chant.damage, 3);
  assert.equal(player.drawn, undefined);
  await interrupt.content({}, { num: 1 }, player);
  assert.equal(player.storage.mt_boss_chant, undefined);
  assert.equal(player.drawn, 2); assert.equal(f.mana, 3);
  assert.equal(interrupt.filter({ num: 1 }, player), false);
});
