// Real event dispatcher and physical cards, isolated save profile and hidden window.
const {app,BrowserWindow}=require('electron');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const bossAudit=process.argv.includes('--boss-roster');
const output=path.join(__dirname,bossAudit?'boss-roster-audit.log':'sixteen-engine-smoke.log');
fs.writeFileSync(output,`RUN ${new Date().toISOString()}\n`);
const log=text=>fs.appendFileSync(output,text+'\n');
app.setPath('userData',path.join(app.getPath('temp'),'noname-sixteen-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async()=>{
 const w=new BrowserWindow({show:false,webPreferences:{nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});
 const run=code=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until=async(code,label)=>{for(let i=0;i<220;i++){if(await run(code).catch(()=>false))return;await new Promise(r=>setTimeout(r,200));}throw Error('Timeout '+label+' '+await run(`return JSON.stringify({event:_status.event?.name,text:document.body.innerText.slice(-300)});`));};
 w.webContents.on('console-message',(_e,level,message)=>{if(level>=3)log('CONSOLE '+message);});
 try{
  await w.loadURL('http://127.0.0.1:8092/');await until('return !!ui.arena;','load');
  await run(`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode',${JSON.stringify(bossAudit?'boss':'doudizhu')});await game.promises.saveConfig('connect_doudizhu_mode','normal','doudizhu');game.reload();`);
  await until('return !!ui.connectStartButton && !!_status.waitingForPlayer;','lobby');await run('ui.connectStartButton.click();');
  await until('return !!game.me && !!ui.auto;','auto');await run('if(!_status.auto)ui.click.auto();');
  await until('return game.phaseNumber>0 && game.players.every(p=>p.name);','start');await run('game.pause();');
  await run(`window.qaDone=false;const next=game.createEvent('sixteenQA',false);next.player=game.me;next.setContent(async event=>{
   const checks=[];const check=(name,ok)=>{checks.push({name,ok:!!ok});if(!ok)throw Error(name);};
   try{
    const [p,t,u]=game.players;
    const roster=(await import('./noname/init/mushoku-characters.js')).default;
    const {bossCharacters}=await import('./noname/init/mushoku-boss.js');
    const allCharacters=${bossAudit?'({...roster,...bossCharacters})':'roster'}, inspected=new Set();
    const inspectSkill=key=>{
     if(inspected.has(key))return;inspected.add(key);
     const info=lib.skill[key];check('skill registered '+key,!!info);
     if(typeof info.content==='function'){
      const compiled=new lib.element.GameEvent(key,false);compiled.setContent(info.content);
      check('skill content compiles '+key,typeof compiled.content==='function');
     }
     for(const dependency of [info.group||[]].flat())inspectSkill(dependency);
     for(const child of Object.keys(info.subSkill||{}))inspectSkill(key+'_'+child);
    };
    for(const [id,character] of Object.entries(allCharacters)){
     check('full roster registered '+id,!!lib.character[id]);
     for(const key of character.skills){check('skill text '+key,!!lib.translate[key+'_info']);inspectSkill(key);}
    }
    window.qaRosterCount=Object.keys(allCharacters).length;
    if(${bossAudit}){window.qaResult={checks,rosterCount:window.qaRosterCount,skillCount:inspected.size,errorFlag:!!_status.withError};window.qaDone=true;game.pause();return;}
    for(const key of ['ac_return','ac_cannon','ac_fateduel']){
     const compiled=new lib.element.GameEvent(key,false);compiled.setContent(lib.skill[key].content);
     check('content compilation '+key,typeof compiled.content==='function');
    }
    const ids=['ac_hulk','ac_gojo','ac_doraemon','ac_joker','ac_spiderman','ac_wonderwoman','ac_ken','ac_batman','ac_santa','ac_captain','ac_totoro','ac_light','ac_kirby','ac_gandalf','ac_mustang','ac_vader'];
    for(const id of ids){p.init(id);check('registered '+id,p.getSkills().length>0&&lib.character[id].skills.every(key=>lib.skill[key]&&!lib.skill[key].charlotte));}
    for(const actor of game.players){actor.removeSkill(actor.getSkills());actor.hp=actor.maxHp=30;actor.hujia=0;await actor.discard(actor.getCards('hej'));}
    p.addSkill('ac_return');const cardsBeforeReturn=p.countCards('h');
    check('return with no missiles eligible',lib.skill.ac_return.filter({},p));
    const ending=game.createEvent('returnPhaseEndQA',false);ending.player=p;ending.setContent(async ev=>{await ev.trigger('phaseEnd');});await ending;
    check('return real phaseEnd draws two',p.countCards('h')===cardsBeforeReturn+2);p.removeSkill('ac_return');
    p.addMark('ac_mount',1,false);check('return with missiles is ineligible',!lib.skill.ac_return.filter({},p));p.removeMark('ac_mount',1,false);
    p.addSkill('ac_cannon');const beforeCannon=t.hp;await t.damage(1,p);check('cannon real damage adds one',t.hp===beforeCannon-2);p.removeSkill('ac_cannon');
    p.addSkill('ac_fateduel');lib.skill.ac_fateduel.check=()=>true;p.hp=t.hp=30;const beforeFate=p.countCards('h');
    const fateAttack=p.useCard({name:'sha',isCard:true},t,false);fateAttack.directHit=[t];await fateAttack;
    check('fateduel real Sha target draws one',p.countCards('h')===beforeFate+1);p.removeSkill('ac_fateduel');
    p.addSkill('ac_rageburst');let use=p.useCard({name:'sha',isCard:true},t,false);use.directHit=[t];await use;
    check('Hulk dispatcher doubles Shan',use.customArgs[t.playerid].shanRequired===2);p.removeSkill('ac_rageburst');
    p.addSkill('ac_fuki');const adjacent=game.players.find(actor=>actor!==p&&get.distance(actor,p)===1);check('adjacent target exists',adjacent);
    use=p.useCard({name:'sha',isCard:true},adjacent,false);await use;check('Gojo Fuki forbids responses',use.directHit.includes(adjacent));p.removeSkill('ac_fuki');
    p.addSkill('ac_jiaozi');await p.gain(game.createCard('shan'),'gain2');const beforeJiaozi=t.hp;use=p.useCard({name:'sha',isCard:true},t,false);use.directHit=[t];await use;check('Gojo Jiaozi adds damage when uniquely max hand',t.hp===beforeJiaozi-2);
    const beforeJiaoziTaken=p.hp;await p.damage(1,t);check('Gojo Jiaozi adds received damage',p.hp===beforeJiaoziTaken-2);
    await p.discard(p.getCards('h'));await t.discard(t.getCards('h'));await p.gain(game.createCard('shan'),'gain2');await t.gain(game.createCard('shan'),'gain2');check('Gojo Jiaozi does not activate on tied hands',!lib.skill.ac_jiaozi.filter({name:'damageBegin3'},p));p.removeSkill('ac_jiaozi');await t.discard(t.getCards('h'));
    p.addSkill('ac_forcebind_damage');const hp=t.hp;use=p.useCard({name:'sha',isCard:true},t,false);use.directHit=[t];await use;check('Vader Sha damage +1',t.hp===hp-2);p.removeSkill('ac_forcebind_damage');
    p.addSkill('ac_warstock');await t.damage(2,p);await p.damage(1,t);check('Mustang dealt/taken damage marks',p.countMark('ac_warstock')===3);p.removeSkill('ac_warstock');
    t.addSkill('ac_forestwatch_hand');t.addMark('ac_forestwatch_hand',2,false);check('Totoro hand limit modifier',t.getHandcardLimit()===t.hp+2);t.removeSkill('ac_forestwatch_hand');
    t.addSkill('ac_sijian_discard');t.addMark('ac_sijian_discard',1,false);await t.gain(game.createCard('shan'),'gain2');
    use=t.useCard({name:'sha',isCard:true},u,false);use.directHit=[u];await use;check('Santa next-card penalty settles and removes',!t.hasSkill('ac_sijian_discard')&&t.countCards('h')===0);
    const held=game.createCard('shan');await t.gain(held,'gain2');const move=t.addToExpansion([held],'giveAuto');move.gaintag.add('ac_forcebind_return');await move;t.addSkill('ac_forcebind_return');
    check('Vader held card in real expansion',t.getExpansions('ac_forcebind_return').includes(held));
    await lib.skill.ac_forcebind_return.content({}, {},t);check('Vader card returned',t.getCards('h').includes(held)&&!t.hasSkill('ac_forcebind_return'));
    check('helper registration independent of roster roots',['ac_hundredfists_block','ac_swallowrecycle_watch','ac_whitepact_settle','ac_giftdelivery_settle'].every(key=>lib.skill[key]));
    const savedCurrent=_status.currentPhase;
    const play=game.createEvent('phaseUse',false);play.player=p;play.setContent(async()=>{
     _status.currentPhase=p;p.addSkill('ac_crimecycle');lib.skill.ac_crimecycle.check=()=>true;
     const card=game.createCard('wuzhong'),max=p.maxHp;await p.gain(card,'gain2');await p.useCard(card,p);
     check('Joker real ordering-discard recovery',p.maxHp===max-1&&p.getCards('h').includes(card));p.removeSkill('ac_crimecycle');p.removeSkill('ac_crimecycle_used');
    });await play;
    const nextTurn=game.createEvent('phase',false);nextTurn.player=t;nextTurn.setContent(async turn=>{
     _status.currentPhase=t;p.storage.ac_swallowrecycle_watch={target:t,turn,count:0};p.addSkill('ac_swallowrecycle_watch');
     const phaseUse=game.createEvent('phaseUse',false);phaseUse.player=t;phaseUse.setContent(async()=>{
      const card=game.createCard('wuzhong');await t.gain(card,'gain2');await t.useCard(card,t);
      check('Kirby real ordering-discard recycling',p.getCards('h').includes(card)&&p.storage.ac_swallowrecycle_watch.count===1);
     });await phaseUse;p.removeSkill('ac_swallowrecycle_watch');
    });await nextTurn;_status.currentPhase=savedCurrent;
    for(const actor of game.players)await actor.discard(actor.getCards('h'));
    check('Anydoor filter registered',typeof lib.skill.ac_anydoor.filter==='function');
    window.qaResult={checks,rosterCount:window.qaRosterCount,skillCount:inspected.size,errorFlag:!!_status.withError};
   }catch(error){window.qaResult={checks,error:error.stack};}window.qaDone=true;game.pause();
  });game.resume();`);
  await until('return window.qaDone;','checks');const result=await run('return window.qaResult;');log(JSON.stringify(result));assert.ok(!result.error,result.error);assert.ok(!result.errorFlag);assert.ok(result.checks.every(c=>c.ok));log('PASS');w.destroy();app.exit(0);
 }catch(error){log('FAIL '+error.stack);w.destroy();app.exit(1);}
});
setTimeout(()=>{log('FAIL watchdog');app.exit(2);},140000).unref();

