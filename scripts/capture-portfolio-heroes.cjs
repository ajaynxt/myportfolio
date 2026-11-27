/* Capture public project homepages, not browser chrome. Existing manually uploaded screenshots are preserved. */
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("node:fs/promises");
const path = require("node:path");
const projects = [
  {
    "name": "Diamond Restaurants",
    "url": "https://diamondrestaurants.com/",
    "file": "assets/client-previews/diamond-home.webp"
  },
  {
    "name": "Wedding Shedding",
    "url": "https://weddingshedding.in/",
    "file": "assets/client-previews/wedding-shedding-home.webp"
  },
  {
    "name": "Safar Sathi",
    "url": "https://safarsathi.in/",
    "file": "assets/client-previews/safar-sathi-home.webp"
  },
  {
    "name": "Celestique Jewellery",
    "url": "https://jewellery.ajaynxt.com/",
    "file": "assets/demo-previews/demo-04.webp"
  },
  {
    "name": "Rajmahal Lake Palace",
    "url": "https://hotel.ajaynxt.com/",
    "file": "assets/demo-previews/demo-05.webp"
  },
  {
    "name": "Mediora Diagnostics",
    "url": "https://diagnostic.ajaynxt.com/",
    "file": "assets/demo-previews/demo-06.webp"
  },
  {
    "name": "Stonecrest Developers",
    "url": "https://construction.ajaynxt.com/",
    "file": "assets/demo-previews/demo-07.webp"
  },
  {
    "name": "CasaForma Living",
    "url": "https://furniture.ajaynxt.com/",
    "file": "assets/demo-previews/demo-08.webp"
  },
  {
    "name": "Solvanta Energy",
    "url": "https://solar.ajaynxt.com/",
    "file": "assets/demo-previews/demo-09.webp"
  },
  {
    "name": "Aurevia Retreat & Spa",
    "url": "https://stay.ajaynxt.com/",
    "file": "assets/demo-previews/demo-10.webp"
  },
  {
    "name": "Velora Health Institute",
    "url": "https://health.ajaynxt.com/",
    "file": "assets/demo-previews/demo-11.webp"
  },
  {
    "name": "Arclune Estates",
    "url": "https://realty.ajaynxt.com/",
    "file": "assets/demo-previews/demo-12.webp"
  },
  {
    "name": "Velune Skin",
    "url": "https://shop.ajaynxt.com/",
    "file": "assets/demo-previews/demo-13.webp"
  },
  {
    "name": "Nexora Academy",
    "url": "https://academy.2.ajaynxt.com/",
    "file": "assets/demo-previews/demo-14.webp"
  },
  {
    "name": "Meroza Kitchen",
    "url": "https://food.ajaynxt.com/",
    "file": "assets/demo-previews/demo-15.webp"
  },
  {
    "name": "Aureon Motors",
    "url": "https://auto.2.ajaynxt.com/",
    "file": "assets/demo-previews/demo-16.webp"
  },
  {
    "name": "Real Estate / Property",
    "url": "https://estate.ajaynxt.com/",
    "file": "assets/demo-previews/demo-17.webp"
  },
  {
    "name": "Wedding Planner / Photographer",
    "url": "https://wedding.ajaynxt.com/",
    "file": "assets/demo-previews/demo-18.webp"
  },
  {
    "name": "Salon / Spa / Beauty",
    "url": "https://salon.ajaynxt.com/",
    "file": "assets/demo-previews/demo-19.webp"
  },
  {
    "name": "Travel / Homestay",
    "url": "https://travel.ajaynxt.com/",
    "file": "assets/demo-previews/demo-20.webp"
  },
  {
    "name": "Interior Designer / Architect",
    "url": "https://interior.ajaynxt.com/",
    "file": "assets/demo-previews/demo-21.webp"
  },
  {
    "name": "Fashion / Product Store",
    "url": "https://store.ajaynxt.com/",
    "file": "assets/demo-previews/demo-22.webp"
  },
  {
    "name": "SaaS / Business Software",
    "url": "https://saas.ajaynxt.com/",
    "file": "assets/demo-previews/demo-23.webp"
  },
  {
    "name": "Restaurant / Cafe",
    "url": "https://restaurant.ajaynxt.com/",
    "file": "assets/demo-previews/demo-24.webp"
  },
  {
    "name": "Fitness / Gym",
    "url": "https://fitness.ajaynxt.com/",
    "file": "assets/demo-previews/demo-25.webp"
  },
  {
    "name": "Clinic / Doctor",
    "url": "https://clinic.ajaynxt.com/",
    "file": "assets/demo-previews/demo-26.webp"
  },
  {
    "name": "Lawyer / Legal Consultant",
    "url": "https://legal.ajaynxt.com/",
    "file": "assets/demo-previews/demo-27.webp"
  },
  {
    "name": "Eye Care Website",
    "url": "https://eye.ajaynxt.com/",
    "file": "assets/demo-previews/demo-28.webp"
  }
];
/* These two demos have independently checked public source repositories.
   When their custom domain is unavailable, render the real project source locally. */
const { execFileSync } = require("node:child_process");
const http = require("node:http");
const os = require("node:os");
const fallbackSources = {
  "assets/demo-previews/demo-05.webp": {repo:"https://github.com/ajaynxt/hotel.git",heading:/Where the lake\s*holds the palace/i,title:/Rajmahal Lake Palace/i},
  "assets/demo-previews/demo-07.webp": {repo:"https://github.com/ajaynxt/construction.git",heading:/Building places\s*that move life forward/i,title:/Stonecrest Developers/i}
};
const types={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",".gif":"image/gif",".woff":"font/woff",".woff2":"font/woff2",".mp4":"video/mp4",".ico":"image/x-icon"};
async function captureFromSource(project,browser) {
  const spec=fallbackSources[project.file]; if(!spec)return false;
  const root=await fs.mkdtemp(path.join(os.tmpdir(),"ajaynxt-demo-"));
  let server,context;
  try{
    execFileSync("git",["clone","--depth","1","--branch","main",spec.repo,root],{timeout:60000,stdio:"inherit"});
    server=http.createServer(async(req,res)=>{
      try{
        const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
        let file=path.resolve(root,"."+pathname);
        if(file!==root&&!file.startsWith(root+path.sep))throw Error("Invalid path");
        if((await fs.stat(file)).isDirectory())file=path.join(file,"index.html");
        const bytes=await fs.readFile(file);res.writeHead(200,{"Content-Type":types[path.extname(file).toLowerCase()]||"application/octet-stream"});res.end(bytes);
      }catch{res.writeHead(404);res.end("Not found");}
    });
    await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
    context=await browser.newContext({viewport:{width:1440,height:814},deviceScaleFactor:1,reducedMotion:"reduce"});
    const page=await context.newPage();
    const response=await page.goto("http://127.0.0.1:"+server.address().port+"/",{waitUntil:"domcontentloaded",timeout:30000});
    if(!response?.ok())throw Error("Source server returned an error");
    await page.waitForLoadState("load",{timeout:15000}).catch(()=>{});
    await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3500))])).catch(()=>{});
    const title=await page.title();const heading=await page.locator("h1").first().innerText({timeout:10000});
    if(!spec.title.test(title)||!spec.heading.test(heading.replace(/\s+/g," ")))throw Error("Source does not match expected project");
    await page.waitForTimeout(2500);await page.evaluate(()=>window.scrollTo(0,0));
    const png=await page.screenshot({type:"png",fullPage:false,animations:"disabled",timeout:15000});
    const output=await sharp(png).webp({quality:84}).toBuffer();
    const stats=await sharp(output).stats();if(stats.entropy<2)throw Error("Source capture appears blank");
    await fs.writeFile(project.file,output);console.log("Captured verified original project source:",project.name,output.length+" bytes");return true;
  }catch(error){console.warn("Source fallback unavailable:",project.name,error.message);return false;}
  finally{if(context)await context.close();if(server)await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true});}
}

async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
(async () => {
  await fs.mkdir("assets/client-previews", {recursive:true});
  await fs.mkdir("assets/demo-previews", {recursive:true});
  const browser = await chromium.launch({headless:true});
  let completed = 0;
  try {
    for (const project of projects) {
      if (await exists(project.file)) { completed++; console.log("Preserving existing:",project.name); continue; }
      const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:"reduce",ignoreHTTPSErrors:false});
      try {
        const page = await context.newPage();
        const response = await page.goto(project.url,{waitUntil:"domcontentloaded",timeout:25000});
        if (!response || response.status() >= 400) throw Error("HTTP "+(response?.status() ?? "unknown"));
        const final = new URL(page.url()); const requested = new URL(project.url);
        if(final.protocol !== "https:" || final.hostname.replace(/^www\./,"") !== requested.hostname.replace(/^www\./,"")) throw Error("Unexpected redirect");
        await page.waitForLoadState("load",{timeout:12000}).catch(()=>{});
        await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2500))])).catch(()=>{});
        await page.waitForTimeout(1800);
        const title=await page.title();
        const body=(await page.locator("body").innerText({timeout:3000})).trim();
        if(body.length<100 || /^(just a moment|access denied|attention required|403 forbidden|404 not found|site not found|domain parked)/i.test(title.trim()) || /^(checking your browser|verify you are human|access denied)/i.test(body)) throw Error("Possible error or access challenge");
        await page.evaluate(()=>window.scrollTo(0,0));
        const png=await page.screenshot({type:"png",fullPage:false,animations:"disabled",timeout:12000});
        const target=await sharp(png).resize(1440,900,{fit:"inside",withoutEnlargement:true}).webp({quality:84}).toBuffer();
        const stats=await sharp(target).stats();if(stats.entropy<2)throw Error("Screenshot appears blank");
        await fs.writeFile(project.file,target);
        completed++;console.log("Captured",project.name,target.length+" bytes");
      } catch(error) { console.warn("Live capture failed",project.name,error.message); if(await captureFromSource(project,browser))completed++; }
      finally {await context.close();}
    }
  } finally {await browser.close();}
  const available=[];for(const project of projects)if(await exists(project.file))available.push("/"+project.file);
  await fs.writeFile("assets/client-previews/available-screenshots.json",JSON.stringify(available,null,2)+"\n");
  console.log("Available screenshots:",completed,"/",projects.length);
})().catch(error=>{console.error(error);process.exitCode=1;});
