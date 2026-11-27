/* Load only known successful local captures, while retaining existing client covers and concept links. */
(async()=>{"use strict";
let known=new Set();try{const response=await fetch("/assets/client-previews/available-screenshots.json",{cache:"no-cache"});if(response.ok){const data=await response.json();if(Array.isArray(data))known=new Set(data);}}catch{}
const nodes=[...document.querySelectorAll("img[data-screenshot],img[data-demo-screenshot]")];
const load=img=>{const source=img.dataset.screenshot||img.dataset.demoScreenshot;if(!known.has(source))return;const test=new Image();test.decoding="async";test.onload=()=>{img.src=source;img.alt=img.dataset.screenshotAlt;img.dataset.screenshotLoaded="true";img.width=test.naturalWidth;img.height=test.naturalHeight;img.hidden=false;const fallback=img.parentElement.querySelector(".demo-fallback");if(fallback)fallback.hidden=true;};test.src=source;};
if("IntersectionObserver" in window){const lazy=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;lazy.unobserve(entry.target);const img=entry.target.matches("img")?entry.target:entry.target.querySelector("img[data-demo-screenshot]");if(img)load(img);}},{rootMargin:"300px"});nodes.forEach(img=>lazy.observe(img.hidden?img.parentElement:img));}else nodes.forEach(load);
})().catch(()=>{});
