import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { characterGroups } from './game/resources/app/noname/init/mushoku-rosters.js';

for (const base of ['noname','src/noname']) {
 test(`${base}: faction controls contain only populated current factions and toggle filtering`,()=>{
  const source=readFileSync(new URL(`./game/resources/app/${base}/ui/create/index.js`,import.meta.url),'utf8');
  const method=source.slice(source.indexOf('groupControl(dialog) {'),source.indexOf('cardDialog() {'));
  let controls;
  const lib={group:[...characterGroups]};
  const ui={create:{control(...args){controls=args;}}};
  const create=vm.runInNewContext(`({${method}})`,{lib,ui});
  const node=()=>{const classes=new Set();return {classList:{contains:key=>classes.has(key),add:key=>classes.add(key),remove:key=>classes.delete(key)}};};
  const a=Object.assign(node(),{group:'huan'}),b=Object.assign(node(),{group:'yi'});
  const dialog={buttons:[a,b]};create.groupControl(dialog);
  const callback=controls.pop();assert.deepEqual(controls,['huan','yi']);
  const button=node();callback('huan',button);assert.equal(a.classList.contains('nodisplay'),false);assert.equal(b.classList.contains('nodisplay'),true);
  callback('huan',button);assert.equal(dialog.currentgroup,null);assert.equal(b.classList.contains('nodisplay'),false);
 });
}
