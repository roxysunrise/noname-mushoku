// Isolated real protocol test: two clients, manual choice events (auto disabled).
const {app,BrowserWindow}=require('electron');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const output=path.join(__dirname,'online-skills.log');fs.writeFileSync(output,`RUN ${new Date().toISOString()}\n`);
const log=(...args)=>fs.appendFileSync(output,args.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\n');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
app.setPath('userData',path.join(app.getPath('temp'),'noname-skills-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async()=>{
 const windows=[];
 const make=()=>{const w=new BrowserWindow({show:false,webPreferences:{partition:`skills-${Math.random()}`,nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});windows.push(w);w.webContents.on('console-message',(_e,level,message)=>{if(level>=2)log('CONSOLE',message)});return w;};
 const run=(w,code)=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until=async(w,code,label,timeout=35000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{if(await run(w,code))return;}catch{}await delay(200);}throw Error('Timeout '+label+' '+await run(w,`return JSON.stringify({event:_status.event?.name,phase:game.phaseNumber,text:document.body.innerText.slice(-1000)});`));};
 try{
  const host=make();await host.loadURL('http://127.0.0.1:8092/');await until(host,'return !!lib.config.mode;','load');
  await run(host,`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','doudizhu');await game.promises.saveConfig('connect_doudizhu_mode','normal','doudizhu');game.reload();`);
  await until(host,'return !!ui.connectStartButton && !!_status.waitingForPlayer;','lobby');
  await run(host,'ui.connectStartButton.click();');await until(host,'return !!game.me && !!ui.auto;','arena initialized');await run(host,'if(!_status.auto)ui.click.auto();');
  await until(host,'return game.phaseNumber>0 && game.players.every(p=>p.name);','start');await run(host,'game.pause();');
  const guest=make();await guest.loadURL('http://127.0.0.1:8092/');await until(guest,'return !!lib.config.mode;','guest');
  await run(guest,`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode');game.reload();`);
  await until(guest,'return !!ui.ipbutton;','guest connect');await run(guest,`game.connect('127.0.0.1:18080');`);
  await until(guest,'return !!game.me?.name && !!game.onlineID;','takeover');
  const guestId=await run(guest,'return game.me.playerid;');const hostId=await run(host,'return game.me.playerid;');
  async function schedule(ownerId,name,skill){
   for(const w of [host,guest])await run(w,`lib.config.auto_confirm=false;_status.clicked=false;`);
   await run(host,`window.qaDone=false;const owner=lib.playerOL[${JSON.stringify(ownerId)}];const other=owner===game.me?lib.playerOL[${JSON.stringify(guestId)}]:game.me;
    game.broadcastAll((a,b,name)=>{lib.playerOL[a].init(name);lib.playerOL[b].init('mt_eris');},owner.playerid,other.playerid,${JSON.stringify(name)});
    const next=game.createEvent('qaSkill',false);next.player=owner;next.qaSkill=${JSON.stringify(skill)};next.qaOther=other;
    next.setContent(async event=>{_status.auto=false;game.broadcast(()=>{_status.auto=false;});
      await lib.skill[event.qaSkill].content({target:event.qaOther}, {},event.player);
      window.qaDone=true;game.pause();});game.resume();`);
  }
  async function yinhui(ownerWindow,ownerId){
   await schedule(ownerId,'ac_yuu','ac_yinhui');
   await until(ownerWindow,`return _status.event?.name==='chooseTarget' && _status.imchoosing;`,'Yinhui target');
   await run(ownerWindow,`const target=game.players.find(p=>p!==game.me&&p.name==='mt_eris');ui.click.target.call(target);if(_status.event.name==='chooseTarget'&&ui.selected.targets.length)ui.click.ok();`);
   await until(ownerWindow,`return _status.event?.name==='chooseControl' && !!ui.controls.length;`,'Yinhui skill');
   await run(ownerWindow,`const node=[...document.querySelectorAll('.control>div')].find(n=>n.link==='mt_sword'||n.textContent==='剑袭');if(node)node.click();else ui.controls[0].firstChild.click();`);
   await until(host,'return window.qaDone;','Yinhui finish');
   const learned=await run(host,`return lib.playerOL[${JSON.stringify(ownerId)}].additionalSkills.ac_yinhui;`);
   assert.equal(learned.length,1);log('YINHUI_PASS',ownerId===hostId?'host':'remote',learned);
  }
  await yinhui(guest,guestId);
  await yinhui(host,hostId);
  await schedule(guestId,'ac_yumeko','ac_haodu');
  await until(guest,`return _status.event?.name==='chooseCard' && _status.imchoosing;`,'Haodu guest cards');
  await run(guest,`ui.click.ok();`);
  await until(host,`return _status.event?.name==='chooseCard' && _status.imchoosing;`,'Haodu host cards');
  await run(host,`ui.click.ok();`);
  await until(guest,`return _status.event?.name==='chooseControl' && ui.controls.length>0;`,'Haodu reward');
  await run(guest,`const node=[...document.querySelectorAll('.control>div')].find(n=>n.link==='cancel2');if(node)node.click();else ui.controls[0].lastChild.click();`);
  await until(host,'return window.qaDone;','Haodu finish');
  assert.equal(await run(host,`return lib.playerOL[${JSON.stringify(guestId)}].storage.ac_haodu_last.count;`),0);
  log('HAODU_ZERO_BID_REMOTE_PASS');
  await run(host,`window.qaDone=false;const owner=game.me;owner.init('ai_deepseek');const before=owner.countCards('h');
   const next=game.createEvent('qaDraw',false);next.player=owner;next.qaBefore=before;
   next.setContent(async event=>{
    for(const suit of ['spade','heart','diamond'])ui.cardPile.insertBefore(game.createCard('sha',suit,7),ui.cardPile.firstChild);
    await lib.skill.ai_shensuan.content({}, {},event.player);
    window.qaDrawGain=event.player.countCards('h')-event.qaBefore;window.qaDone=true;game.pause();
   });game.resume();`);
  await until(host,'return window.qaDone;','DeepSeek actual draw');
  assert.equal(await run(host,'return window.qaDrawGain;'),3);log('DEEPSEEK_REAL_DRAW_PASS');
  const roster=await run(host,`const expected=['ac_chatgpt','ai_doubao','ai_deepseek','ai_claude','ai_grok'];
   if(expected.some(id=>!lib.characterPack.ai[id]||lib.characterPack.mushoku[id]))throw Error('pack mismatch');
   for(const id of expected){const image=new Image();image.src='image/character/'+id+'.jpg';await image.decode();if(image.naturalWidth!==600)throw Error('portrait '+id);}
   if(!lib.characterTitle.th_mokou.includes('不灭的烟火'))throw Error('Mokou title');return expected;`);
  log('AI_REAL_ASSETS_PASS',roster);
  const deliverables=process.env.NONAME_QA_OUTPUT||path.resolve(__dirname,'../output/qa');
  fs.mkdirSync(deliverables,{recursive:true});
  host.setContentSize(1100,650);
  await run(host,`window.qaRosterDialog=ui.create.dialog('AI · 新武将',[${JSON.stringify(roster)},'character']);`);
  await delay(500);fs.writeFileSync(path.join(deliverables,'AI武将游戏内预览.png'),(await host.webContents.capturePage()).toPNG());
  await run(host,'window.qaRosterDialog.close();');
  guest.setContentSize(844,390);
  await run(guest,`game.saveConfig('handcard_size',85);game.saveConfig('character_size',80);ui.openDisplaySettings();
   for(const [label,value] of [['手牌尺寸',85],['选将与武将卡尺寸',80]]){const input=document.querySelector('input[aria-label="'+label+'"]');input.value=value;input.dispatchEvent(new Event('input'));}
   [...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='85%').click();
   [...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='保留缩放').click();`);
  await delay(200);fs.writeFileSync(path.join(deliverables,'显示与操作.png'),(await guest.webContents.capturePage()).toPNG());
  await run(guest,`document.querySelector('.accessibility-close').click();`);
  await run(host,`window.qaDone=false;const next=game.createEvent('qaCard',false);next.player=lib.playerOL[${JSON.stringify(guestId)}];
   next.setContent(async event=>{const result=await event.player.chooseCard('h',true).forResult();window.qaCardCount=result.cards.length;window.qaDone=true;game.pause();});game.resume();`);
  await until(guest,`return _status.event?.name==='chooseCard'&&_status.imchoosing;`,'scaled card');
  const point=await run(guest,`const card=game.me.getCards('h').find(card=>card.classList.contains('selectable'));if(!card)throw Error('no selectable card');
   const r=card.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+Math.min(20,r.height/2);const hit=document.elementFromPoint(x,y);
   if(!card.contains(hit))throw Error('card hit area blocked '+hit?.className);return {x:Math.round(x),y:Math.round(y)};`);
  guest.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});guest.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});
  await until(guest,'return ui.selected.cards.length===1;','scaled card click');await run(guest,'ui.click.ok();');
  await until(host,'return window.qaDone;','scaled card result');assert.equal(await run(host,'return window.qaCardCount;'),1);
  log('MOBILE_REAL_CARD_CLICK_PASS',point);
  fs.writeFileSync(path.join(deliverables,'手机横屏游戏内预览.png'),(await guest.webContents.capturePage()).toPNG());log('PASS');
  for(const w of windows)w.destroy();app.exit(0);
 }catch(error){log('FAIL',error.stack);for(const w of windows)w.destroy();app.exit(1);}
});
setTimeout(()=>{log('FAIL watchdog');app.exit(1)},180000).unref();
