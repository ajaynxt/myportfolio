const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const VERSION = 3, dir = 'assets/showcase-first-frames';
const source = fs.readFileSync('showcase.html','utf8');
const ids = [...new Set([...source.matchAll(/data-demo="([a-z0-9-]+)"/g)].map(m=>m[1]))].filter(id=>fs.existsSync(id+'.html'));
fs.mkdirSync(dir,{recursive:true});
const manifest = fs.existsSync(dir+'/manifest.json') ? JSON.parse(fs.readFileSync(dir+'/manifest.json','utf8')) : {};
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
function timeout(p,ms){let t;return Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error('Capture timeout')),ms)})]).finally(()=>clearTimeout(t))}
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const url=id=>'http://127.0.0.1:8765/'+id+'.html?showcase_preview=1';
async function ready(page){
 return page.evaluate(()=>{
  const w=innerWidth,h=innerHeight;
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>4&&r.height>4&&r.bottom>0&&r.right>0&&r.top<h&&r.left<w&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>.15};
  const root=document.getElementById('root');
  const media=[...document.querySelectorAll('img,video')].filter(visible);
  const pending=media.filter(e=>e.tagName==='IMG'?(!e.complete||!e.naturalWidth):(e.currentSrc&&e.readyState<2)).length;
  const loaders=[...document.querySelectorAll('[id*="loader"],[class*="loader"],[id*="loading"],[class*="loading"],[aria-busy="true"]')].filter(e=>{const r=e.getBoundingClientRect();return visible(e)&&r.width>w*.55&&r.height>h*.55&&getComputedStyle(e).position==='fixed'}).length;
  return {mounted:!root||root.childElementCount>0,pending,loaders,fonts:document.fonts.status==='loaded',text:document.body.innerText.trim().length};
 });
}
async function capture(page,id){
 await page.goto(url(id),{waitUntil:'domcontentloaded',timeout:30000}).catch(e=>console.warn(id,'navigation:',e.message));
 await page.locator('body').waitFor({timeout:12000});
 await page.addStyleTag({content:'#nx-demo-credit,#nx-back-home,.nx-return,.nx-back,a.back[href="https://ajaynxt.com/"]{display:none!important}'});
 await timeout(page.evaluate(()=>document.fonts.ready.then(()=>true)),2500).catch(()=>{});
 const cdp=await page.context().newCDPSession(page);let best=null;
 const start=Date.now();
 // Sample the settled first screen, not a random loading frame. Longer intro designs are allowed to finish.
 for(const target of [2500,5000,8000,11500]){
  await sleep(Math.max(0,target-(Date.now()-start)));
  if(id==='hiven') await page.evaluate(()=>window.hiven?.go(0,true)).catch(()=>{});
  const state=await timeout(ready(page),5000).catch(()=>null);
  if(!state||!state.mounted||state.loaders)continue;
  try{
   const shot=await timeout(cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false}),12000);
   const buf=Buffer.from(shot.data,'base64');
   const stats=await sharp(buf).stats();
   const sd=stats.channels.slice(0,3).reduce((a,c)=>a+c.stdev,0)/3;
   if(stats.entropy<.18||sd<3)continue;
   // Reward real visual detail and loaded media; avoid blank screens and prefer complete late frames.
   const score=stats.entropy+Math.min(sd,65)*.035+(state.fonts?1:0)-state.pending*1.8+(state.text>20?.4:0)+target/20000;
   if(!best||score>best.score)best={buf,score,state,target};
  }catch(e){console.warn(id,'sample:',e.message)}
 }
 if(!best)throw Error('No nonblank rendered candidate');
 if(best.state.pending>0)throw Error('Visible media incomplete: '+best.state.pending);
 return best;
}
(async()=>{
 let browser,failed=0;
 try{
  await sleep(600);
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const queue=ids.filter(id=>manifest[id]?.captureVersion!==VERSION||!fs.existsSync(dir+'/'+id+'.webp')).sort((a,b)=>Number(!!manifest[a])-Number(!!manifest[b]));
  async function worker(){
   while(queue.length){
    const id=queue.shift();let best;
    for(let attempt=0;attempt<2&&!best;attempt++){
     const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference'});
     page.on('pageerror',e=>console.warn(id,'page error:',e.message));
     try{best=await capture(page,id)}catch(e){console.warn(id,'attempt',attempt+1,e.message)}finally{await page.close().catch(()=>{})}
    }
    if(!best){failed++;console.warn('Preserving existing image if any:',id);continue}
    const path=dir+'/'+id+'.webp';
    await sharp(best.buf).resize({width:960}).webp({quality:86}).toFile(path+'.tmp.webp');
    fs.renameSync(path+'.tmp.webp',path);
    manifest[id]={path:'/'+path,captureVersion:VERSION,score:Number(best.score.toFixed(2)),capturedAtMs:best.target};
    console.log('Selected',id,'at',best.target,'ms, score',best.score.toFixed(2));
   }
  }
  await Promise.all([worker(),worker()]);
  fs.writeFileSync(dir+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
  console.log('Available:',ids.filter(id=>manifest[id]&&fs.existsSync(dir+'/'+id+'.webp')).length,'/',ids.length,'; failed captures:',failed);
  if(failed)process.exitCode=1;
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1});
