import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import characters from '../game/resources/app/src/noname/init/mushoku-characters.js';
import translations from '../game/resources/app/src/character/mushoku/translate.js';
import intros from '../game/resources/app/src/character/mushoku/intro.js';

const root = new URL('../', import.meta.url);
const document = readFileSync(new URL('output/角色更名换势力与技能名-2026-10-21.md', root), 'utf8');
const translationPath = new URL('game/resources/app/src/character/mushoku/translate.js', root);
const introPath = new URL('game/resources/app/src/character/mushoku/intro.js', root);
let source = readFileSync(translationPath, 'utf8');
let introSource = readFileSync(introPath, 'utf8');
const sections = [...document.matchAll(/^## [幻异]·(.+?)（[^\r\n]+）\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
assert.equal(sections.length, 16);
let skills = 0;
for (const [, name, body] of sections) {
  const id = Object.keys(characters).find(id => translations[id] === name);
  assert.ok(id, name);
  const entries = [...body.matchAll(/^### ([^\r\n]+)\r?\n\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)];
  assert.equal(entries.length, characters[id].skills.length, id);
  for (const [, skillName, text] of entries) {
    const skill = characters[id].skills.find(skill => translations[skill] === skillName);
    assert.ok(skill, skillName);
    const pattern = new RegExp('(' + skill + '_info\\s*:\\s*)"(?:[^"\\\\]|\\\\.)*"');
    assert.ok(pattern.test(source), skill);
    source = source.replace(pattern, (_, prefix) => prefix + JSON.stringify(text.trim()));
    if (!new RegExp('\\b' + skill + '_ab\\s*:').test(source)) {
      source = source.replace(pattern, match => match + ',' + skill + '_ab:' + JSON.stringify(skillName));
    }
    skills++;
  }
  const description = body.match(/^\*\*角色描述\*\*：([^\r\n]+)/m)?.[1];
  assert.ok(description, id);
  if (!intros[id]) introSource = introSource.replace('export default {', () =>
    'export default {\n ' + id + ': ' + JSON.stringify(description) + ',');
}
writeFileSync(translationPath, source);
writeFileSync(introPath, introSource);
console.log(`Restored ${sections.length} characters, ${skills} verbatim skill texts; added missing descriptions.`);
