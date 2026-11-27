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
      } catch(error) { console.warn("Skipped",project.name,error.message); }
      finally {await context.close();}
    }
  } finally {await browser.close();}
  const available=[];for(const project of projects)if(await exists(project.file))available.push("/"+project.file);
  await fs.writeFile("assets/client-previews/available-screenshots.json",JSON.stringify(available,null,2)+"\n");
  console.log("Available screenshots:",completed,"/",projects.length);
})().catch(error=>{console.error(error);process.exitCode=1;});
