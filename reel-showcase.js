/* Instagram's supported public embed renderer. Loaded only after a visitor chooses content. */
(() => {
  "use strict";
  const fitEmbeds = () => { for(const box of document.querySelectorAll(".compact-embed-frame")){if(box.hidden)continue;const width=box.clientWidth;if(!width)continue;const scale=width/360;box.style.setProperty("--embed-scale",String(scale));box.style.height=Math.round(Number(box.dataset.embedHeight)*scale)+"px";} };
  fitEmbeds();
  if("ResizeObserver" in window){const observer=new ResizeObserver(fitEmbeds);document.querySelectorAll(".compact-embed-frame").forEach(box=>observer.observe(box));}else window.addEventListener("resize",fitEmbeds,{passive:true});
  const dialog = document.getElementById("reel-player");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const frame = dialog.querySelector("[data-reel-frame]");
  const title = dialog.querySelector("#reel-player-title");
  const external = dialog.querySelector("[data-reel-external]");
  const status = dialog.querySelector("[data-instagram-status]");
  let trigger = null, scriptPromise = null, generation = 0, timer;
  const localMedia = new Map();
  const allowedPath = value => typeof value === 'string' && /^\/assets\/social-media\/[A-Za-z0-9_-]+\.(webp|jpg|jpeg|png|mp4|webm)$/.test(value);
  fetch('/assets/social-media/manifest.json').then(r=>r.ok?r.json():{}).then(items=>{for(const link of document.querySelectorAll('[data-reel-id]')){const item=items[link.dataset.reelId];if(!item||typeof item!=='object')continue;const media={poster:allowedPath(item.poster)&&! /\.(mp4|webm)$/.test(item.poster)?item.poster:null,video:allowedPath(item.video)&&/\.(mp4|webm)$/.test(item.video)?item.video:null};if(!media.poster&&!media.video)continue;localMedia.set(link.dataset.reelId,media);if(media.poster){const img=new Image();img.loading='lazy';img.decoding='async';img.alt='';img.onload=()=>{link.prepend(img);link.dataset.mediaReady='true';const inline=link.parentElement.querySelector('.compact-embed-frame');if(inline&&(media.video||link.dataset.instagramKind==='p')){inline.hidden=true;inline.querySelector('iframe')?.remove();}};img.src=media.poster;}}}).catch(()=>{});
  function loadInstagram() {
    if (window.instgrm?.Embeds?.process) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => window.instgrm?.Embeds?.process ? resolve() : reject(new Error("Embed unavailable"));
      script.onerror = () => reject(new Error("Instagram script unavailable"));
      document.head.appendChild(script);
    }).catch(error => { scriptPromise = null; throw error; });
    return scriptPromise;
  }
  for (const link of document.querySelectorAll("[data-reel-id]")) {
    link.addEventListener("click", async event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const id = link.dataset.reelId;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      const kind = link.dataset.instagramKind === "p" ? "p" : "reel";
      const permalink = "https://www.instagram.com/" + kind + "/" + id + "/";
      event.preventDefault();
      const current = ++generation;
      trigger = link;
      title.textContent = "Instagram " + (kind === "p" ? "post " : "reel ") + link.dataset.reelNumber;
      external.href = permalink;
      status.textContent = "Loading Instagram content…";
      const media=localMedia.get(id);
      if(media?.video || (kind==="p" && media?.poster)){
        const element=document.createElement(media.video?"video":"img");
        element.src=media.video||media.poster;
        if(media.video){element.controls=true;element.playsInline=true;element.preload="metadata";if(media.poster)element.poster=media.poster;}
        else element.alt=title.textContent;
        element.addEventListener("error",()=>{status.textContent="Local media unavailable. Open the original link below.";});
        frame.replaceChildren(element);status.textContent="";dialog.showModal();if(media.video)element.play().catch(()=>{});return;
      }
      const embed = document.createElement("blockquote");
      embed.className = "instagram-media";
      embed.setAttribute("data-instgrm-permalink", permalink);
      embed.setAttribute("data-instgrm-version", "14");
      const original = document.createElement("a");
      original.href = permalink; original.target = "_blank"; original.rel = "noopener noreferrer";
      original.textContent = "View on Instagram ↗";
      embed.append(original);
      frame.replaceChildren(embed);
      dialog.showModal();
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (current === generation && dialog.open) status.textContent = "If the content is not visible or playable, Instagram may require sign-in or disallow embedding. Use the original link below.";
      }, 12000);
      try {
        await loadInstagram();
        if (current !== generation || !dialog.open) return;
        window.instgrm.Embeds.process();
        status.textContent = "Tap the play button inside Instagram to watch a video.";
      } catch {
        if (current !== generation || !dialog.open) return;
        const iframe = document.createElement("iframe");
        iframe.title = title.textContent;
        iframe.src = permalink + "embed/";
        iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        frame.replaceChildren(iframe);
        status.textContent = "Trying Instagram’s embedded player. If unavailable, open the original post.";
      }
    });
  }
  dialog.querySelector("[data-reel-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    ++generation; clearTimeout(timer); frame.replaceChildren(); trigger?.focus(); trigger = null;
  });
})();
