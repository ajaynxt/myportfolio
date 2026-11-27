/* Generate smaller responsive versions of actual portfolio images.
   Original files remain unchanged. Only link variants that exist and save bytes. */
const fs=require("node:fs/promises");
const path=require("node:path");
const sharp=require("sharp");
(async()=>{
 const root=process.cwd(), homepage=path.join(root,"index.html");
 let html=await fs.readFile(homepage,"utf8");
 const originals=[...new Set([...html.matchAll(/<img\b[^>]*\bsrc="(\/assets\/(?:client-previews|demo-previews|images\/films|social-media)\/[^"\s]+\.webp)"[^>]*>/g)].map(m=>m[1]))];
 if(originals.length<28)throw new Error("Expected the complete homepage image collection, found "+originals.length);
 let files=0, saved=0, updated=0;
 for(const url of originals){
  const input=path.join(root,url.slice(1)), meta=await sharp(input).metadata(), original=(await fs.stat(input)).size;
  if(!meta.width||!meta.height)throw new Error("Missing image dimensions: "+url);
  const social=url.includes("/social-media/"), client=url.includes("/client-previews/"), film=url.includes("/films/");
  const widths=social?[240,360,480]:[480,800,1080];
  const srcset=[];
  for(const width of widths){
   if(width>=meta.width)continue;
   const destUrl=url.replace(/\.webp$/,"-"+width+"w.webp");
   const dest=path.join(root,destUrl.slice(1));
   const buffer=await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:social?76:78,effort:5}).toBuffer();
   if(buffer.length>=original*.90)continue;
   await fs.writeFile(dest,buffer);files++;
   srcset.push(destUrl+" "+width+"w");
   if(width===widths[0])saved+=original-buffer.length;
  }
  if(!srcset.length)continue;
  srcset.push(url+" "+meta.width+"w");
  const sizes=social?"(max-width: 760px) 150px, 160px":client?"(max-width: 760px) calc(100vw - 66px), 33vw":film?"(max-width: 760px) 82vw, (max-width: 1000px) 46vw, 32vw":"(max-width: 760px) 78vw, (max-width: 1000px) 46vw, 32vw";
  html=html.replace(/<img\b[^>]*>/g,tag=>{
   if(!tag.includes('src="'+url+'"'))return tag;
   updated++;
   return tag.replace(/\s(?:srcset|sizes|width|height)="[^"]*"/g,"").replace(/>$/, ' width="'+meta.width+'" height="'+meta.height+'" srcset="'+srcset.join(", ")+'" sizes="'+sizes+'">');
  });
 }
 if(updated<20||files<20)throw new Error("Not enough responsive images generated; refusing to publish partial output");
 await fs.writeFile(homepage,html);
 console.log(JSON.stringify({originalImages:originals.length,responsiveImages:updated,variants:files,smallestVariantPotentialSavingsBytes:saved}));
})().catch(error=>{console.error(error);process.exitCode=1;});
