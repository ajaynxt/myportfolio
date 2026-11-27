/* Retrieve media explicitly exposed by the supplied public Instagram posts.
   Do not log in, bypass access controls, or guess media URLs. Preserve existing local assets. */
const fs = require("node:fs/promises");
const sharp = require("sharp");
const {load} = require("cheerio");
const dir = "assets/social-media";
const items = [
["reel","DgPDFX9h240"],["reel","DfRI-RZyx7I"],["reel","De61V3ZTwM8"],["reel","De9IvY1zz9e"],["reel","De3z-KDhHGA"],["reel","De_CPNDyiNb"],
["p","DbhaRAjzwR8"],["p","DcP0FKvzbcN"],["p","DbW8dI9Tbas"],["p","DbaX88bzEFX"]
];
function safeMedia(url) {
  try { const u=new URL(url); return u.protocol==="https:" && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(u.hostname) && !u.username && !u.password; }catch{return false;}
}
async function getMedia(url,limit,type){
  if(!safeMedia(url))throw Error("No trusted public media URL");
  const response=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(25000)});
  if(!response.ok||!(response.headers.get("content-type")||"").startsWith(type))throw Error("Public media unavailable");
  const length=Number(response.headers.get("content-length")||0);if(length>limit)throw Error("Media too large");
  const chunks=[];let total=0;
  for await(const chunk of response.body){total+=chunk.length;if(total>limit)throw Error("Media too large");chunks.push(Buffer.from(chunk));}
  return Buffer.concat(chunks);
}
(async()=>{
  await fs.mkdir(dir,{recursive:true});
  const manifest=JSON.parse(await fs.readFile(dir+"/manifest.json","utf8"));
  for(const [kind,id] of items){
    const existing=manifest[id]||{};
    if(existing.poster&&(kind==="p"||existing.video))continue;
    try{
      const response=await fetch("https://www.instagram.com/"+kind+"/"+id+"/",{redirect:"follow",signal:AbortSignal.timeout(18000)});
      if(!response.ok)throw Error("Public page unavailable");
      const final=new URL(response.url);if(final.hostname!=="www.instagram.com"||!final.pathname.includes("/"+id+"/"))throw Error("Unexpected redirect");
      const $=load(await response.text());
      const meta=name=>$('meta[property="'+name+'"]').attr("content")||"";
      const canonical=meta("og:url")||$('link[rel="canonical"]').attr("href")||"";
      let verified=false;try{const u=new URL(canonical);verified=u.hostname==="www.instagram.com"&&u.pathname.includes("/"+id+"/");}catch{}
      if(!verified||!meta("og:title")||/^(instagram|login|log in|sign up)$/i.test(meta("og:title").trim()))throw Error("No matching public post metadata");
      const entry={...existing};
      if(!entry.poster&&safeMedia(meta("og:image"))){
        const bytes=await getMedia(meta("og:image"),8*1024*1024,"image/");
        const image=sharp(bytes);const info=await image.metadata();
        if((info.width||0)<320||(info.height||0)<320)throw Error("Image too small");
        const file=dir+"/"+id+".webp";await image.rotate().resize(640,960,{fit:"inside",withoutEnlargement:true}).webp({quality:82}).toFile(file);entry.poster="/"+file;
      }
      const video=meta("og:video:secure_url")||meta("og:video:url")||meta("og:video");
      if(!entry.video&&meta("og:video:type")==="video/mp4"&&safeMedia(video)){
        try{const bytes=await getMedia(video,24*1024*1024,"video/mp4");if(bytes.subarray(4,8).toString()!=="ftyp")throw Error("Not MP4");const file=dir+"/"+id+".mp4";await fs.writeFile(file,bytes);entry.video="/"+file;}catch(e){console.warn(id,"video unavailable",e.message);}
      }
      if(entry.poster||entry.video){manifest[id]=entry;console.log(id,"public media saved");}
    }catch(e){console.warn(id,e.message);}
    await new Promise(r=>setTimeout(r,1000));
  }
  await fs.writeFile(dir+"/manifest.json",JSON.stringify(manifest,null,2)+"\n");
  console.log("Local media entries:",Object.keys(manifest).length,"/ 10");
})().catch(e=>{console.error(e);process.exitCode=1;});
