const path=require('node:path');
const {createRequire}=require('node:module');
window.__dirname=path.resolve(__dirname,'../game/resources/app');
window.require=createRequire(path.join(window.__dirname,'package.json'));
window.confirm=()=>true;
window.alert=(text)=>console.error('ALERT',text);
const priorError=console.error;
console.error=(...args)=>priorError(...args.map(x=>x?.stack||x));
