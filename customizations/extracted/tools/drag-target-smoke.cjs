// Exercise the shipped and source drag handlers against Chromium's real zoomed DOM.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../game/resources/app');
const legacyScrollGuard = process.argv.includes('--legacy-scroll-guard');
const output = path.join(__dirname, legacyScrollGuard ? 'drag-target-legacy-smoke.log' : 'drag-target-smoke.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
app.setPath('userData', path.join(app.getPath('temp'), `noname-drag-${Date.now()}`));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async () => {
 const win = new BrowserWindow({ show: false, width: 960, height: 540, webPreferences: { backgroundThrottling: false } });
 try {
  await win.loadURL('data:text/html,' + encodeURIComponent(`<!doctype html><style>
   html,body{margin:0;width:100%;height:100%;overflow:hidden}body{transform-origin:0 0}
   #arena{position:absolute;left:20px;top:30px;width:1100px;height:620px}
   .player{position:absolute;width:100px;height:180px;zoom:var(--character-size)}
   .avatar{position:absolute;inset:0 0 50%;background:#555}.name{position:absolute;inset:50% 0 0;background:#888}
   #me{position:absolute;left:0;top:280px;width:300px;height:180px}
   #hand{zoom:.85}.card{position:absolute;left:30px;top:10px;width:100px;height:130px;background:#ccc}
   canvas{pointer-events:none}
   </style><body><div id="arena"><div id="me"><div><div id="hand"><div class="card"></div></div></div></div><canvas></canvas></div>`));
  const results = [];
  for (const variant of ['noname', 'src/noname']) {
   const initSource = fs.readFileSync(path.join(root, variant, 'init/index.'+(variant==='noname'?'js':'ts')), 'utf8');
   const touchFilterSource = initSource.slice(initSource.indexOf('function createTouchDraggedFilter() {'), initSource.indexOf('async function tryLoadCustomStyle'));
   const text = fs.readFileSync(path.join(root, variant, 'ui/click/index.js'), 'utf8');
   let code = text.slice(text.indexOf('class Click')).split('\nexport {')[0];
   if (legacyScrollGuard) code = code.replace('cardtouchstart(e) {', 'cardtouchstart(e) { if (this.parentNode?.parentNode?.classList.contains("scrollh")) return;');
   const result = await win.webContents.executeJavaScript(`(async () => {try {
    Array.prototype.add=function(x){if(!this.includes(x))this.push(x);return this};
    Array.prototype.remove=function(x){const i=this.indexOf(x);if(i>=0)this.splice(i,1);return this};
    const arena=document.getElementById('arena'),card=document.querySelector('.card');
    arena.querySelectorAll('.player').forEach(p=>p.remove());
    const target=document.createElement('div');target.className='player';target.innerHTML='<div class="avatar"></div><div class="name"></div>';arena.append(target);target.unprompt=()=>{};
    card.updateTransform=()=>{};
    const ui={arena,window:document.body,me:document.getElementById('me'),selected:{cards:[],targets:[],buttons:[]},touchlines:[],canvas:document.querySelector('canvas')};
    ui.ctx=ui.canvas.getContext('2d');
    const lib={config:{enable_drag:true,enable_dragline:true,enable_touchdragline:true}};
    const _status={lastdragchange:[]};let committed;
    const get={itemtype:item=>item===card?'card':item===target?'player':undefined,utc:()=>Date.now(),select:n=>[n,n],card:()=>ui.selected.cards[0],info:()=>({}),is:{phoneLayout:()=>false}};
    const game={documentZoom:1,check:()=>ui.selected.cards.length===1&&ui.selected.targets.length===1,uncheck(){for(const item of [...ui.selected.cards,...ui.selected.targets])item.classList.remove('selected');ui.selected.cards.length=0;ui.selected.targets.length=0;}};
    const Click=new Function('ui','lib','_status','get','game',${JSON.stringify(code)}+';return Click;')(ui,lib,_status,get,game);ui.click=new Click();
    ui.click.ok=()=>{committed={card:ui.selected.cards[0]?.name,targets:ui.selected.targets.slice()}};
    const checks=[];
    const check=(name,ok)=>{checks.push({name,ok:!!ok});};
    const reset=async(name,zoom,size,left,top)=>{
     game.uncheck();Object.assign(_status,{event:{name:'chooseToUse',isMine:()=>true,filterCard:()=>true,filterTarget:()=>true,selectCard:1,selectTarget:1},clicked:false,dragged:false,mousedragging:null,mouseleft:false,mousedragorigin:null,dragstatuschanged:null,selectionfull:false,lastdragchange:[]});
     committed=undefined;card.name=name;card.className='card selectable';target.className='player selectable';target.style.left=left+'px';target.style.top=top+'px';
     document.body.style.width=960/zoom+'px';document.body.style.height=540/zoom+'px';document.body.style.transform='scale('+zoom+')';document.documentElement.style.setProperty('--character-size',size);game.documentZoom=zoom;arena.classList.add('selecting');
     await new Promise(resolve=>setTimeout(resolve,20));
    };
    const point=(element,x=.5,y=.5)=>{const r=element.getBoundingClientRect();return {clientX:r.left+r.width*x,clientY:r.top+r.height*y}};
    const start=(mode)=>{const p=point(card);if(mode==='mouse')ui.click.windowmousedown({...p,button:0});else{ui.click.cardtouchstart.call(card,{touches:[p]});ui.click.cardtouchmove.call(card,{touches:[p],preventDefault(){}});}};
    const move=(mode,p)=>{if(mode==='mouse')ui.click.windowmousemove({...p,button:0,preventDefault(){}});else ui.click.windowtouchmove({touches:[p],preventDefault(){}})};
    const end=mode=>{if(mode==='mouse')ui.click.windowmouseup({button:0});else ui.click.windowtouchend({touches:[]})};
    // Use the same bubbling order as real touch input, including touchend on the origin card.
    const listeners=[];
    const fakeDocument={body:{addEventListener(type,fn){const bound=fn.bind(document.body);document.body.addEventListener(type,bound);listeners.push([document.body,type,bound]);}}};
    new Function('document','game','_status',${JSON.stringify(touchFilterSource)}+';createTouchDraggedFilter();')(fakeDocument,game,_status);
    const listen=(node,type,fn)=>{node.addEventListener(type,fn);listeners.push([node,type,fn]);};
    listen(card,'touchstart',ui.click.cardtouchstart);listen(card,'touchmove',ui.click.cardtouchmove);listen(card,'touchend',ui.click.card);
    listen(document,'touchmove',ui.click.windowtouchmove);listen(document,'touchend',ui.click.windowtouchend);
    const touchEvent=(type,p)=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:type==='touchend'?[]:[p]});card.dispatchEvent(event);};
    await reset('sha',1,1,400,60);touchEvent('touchstart',point(card));touchEvent('touchmove',point(target));check('bubbling touch selects target',ui.selected.targets.includes(target));touchEvent('touchend',point(target));check('bubbling touch commits Sha',committed?.card==='sha');
    const handContainer=card.parentNode.parentNode;
    listen(handContainer,'touchstart',ui.click.touchStart);listen(handContainer,'touchmove',ui.click.touchScroll);
    for(const name of ['sha','juedou']){
     await reset(name,1,1,400,60);handContainer.classList.add('scrollh');const p=point(card);touchEvent('touchstart',p);touchEvent('touchmove',{clientX:p.clientX,clientY:p.clientY-20});touchEvent('touchmove',point(target));check(name+' scrollable hand vertical selects',ui.selected.targets.includes(target));touchEvent('touchend',point(target));check(name+' scrollable hand vertical commits',committed?.card===name);
     await reset(name,1,1,400,60);touchEvent('touchstart',p);touchEvent('touchmove',{clientX:p.clientX+50,clientY:p.clientY});check(name+' horizontal hand scroll does not select',!_status.mousedragging&&ui.selected.cards.length===0);touchEvent('touchend',p);
     handContainer.classList.remove('scrollh');
    }
    listeners.forEach(([node,type,fn])=>node.removeEventListener(type,fn));
    for(const mode of ['mouse','touch'])for(const name of ['sha','juedou']){
     await reset(name,1,1,400,60);ui.click.card.call(card);_status.clicked=false;start(mode);move(mode,point(target));check(mode+'/'+name+' preselected target',ui.selected.targets.includes(target));end(mode);check(mode+'/'+name+' preselected commit',committed?.card===name);
    }
    for(const mode of ['mouse','touch'])for(const name of ['sha','juedou'])for(const [zoom,size,left,top] of [[1,1,400,60],[.8,.8,300,100],[.65,.6,600,50],[1,1.4,280,20],[1.25,.8,600,50]])for(const y of [.15,.55,.9]){
     const label=[mode,name,zoom,size,left,y].join('/');await reset(name,zoom,size,left,top);start(mode);move(mode,point(target,.5,y));
     check(label+' selected',ui.selected.targets.includes(target));move(mode,point(target,.5,y));check(label+' stable',ui.selected.targets.length===1);end(mode);
     check(label+' committed',committed?.card===name&&committed.targets.length===1&&committed.targets[0]===target);check(label+' cleanup',!_status.mousedragging&&_status.lastdragchange.length===0);
    }
    for(const mode of ['mouse','touch']){
     await reset('sha',.8,.8,300,100);target.classList.remove('selectable');start(mode);move(mode,point(target));end(mode);check(mode+' illegal target',!committed&&ui.selected.targets.length===0);
     await reset('juedou',.8,.8,300,100);start(mode);move(mode,point(arena,.05,.4));end(mode);check(mode+' empty release',!committed&&ui.selected.targets.length===0);
     await reset('sha',.8,.8,300,100);start(mode);move(mode,point(target));move(mode,point(card));end(mode);check(mode+' return cancels',!committed&&ui.selected.targets.length===0);
     await reset('sha',.8,.8,300,100);_status.event.selectTarget=-1;start(mode);move(mode,point(target));check(mode+' fixed targets unchanged',ui.selected.targets.length===0);end(mode);
    }
    return {checks,failed:checks.filter(c=>!c.ok)};
    } catch(error) {return {error:error.stack}};
   })()`);
   if(result.error)throw Error(result.error);
   results.push({variant,count:result.checks.length,failed:result.failed});
  }
  fs.appendFileSync(output, JSON.stringify(results, null, 2)+'\n');
  assert.ok(results.every(result=>result.failed.length===0),'Drag regression: '+JSON.stringify(results.filter(result=>result.failed.length)));
  fs.appendFileSync(output, 'PASS\n');
 } catch (error) { fs.appendFileSync(output, 'FAIL '+error.stack+'\n');process.exitCode=1; }
 finally { win.destroy();app.exit(process.exitCode||0); }
});
setTimeout(()=>{fs.appendFileSync(output,'FAIL timeout\n');app.exit(2)},60000).unref();
