/* AJAYNXT shared editorial text motion: no dependencies, no hidden content. */
(()=>{"use strict";if(window.ajaynxtEditorialMotionLoaded)return;window.ajaynxtEditorialMotionLoaded=true;
function init(){
const body=document.body,reduce=matchMedia("(prefers-reduced-motion: reduce)"),active=new Set();let disabled=false;try{disabled=localStorage.getItem("nx-motion-off")==="1"}catch{}const off=()=>reduce.matches||disabled||body.classList.contains("nx-motion-off");
const style=document.createElement("style");style.textContent=`
@media(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
body:not(.nx-motion-off) :is(.navlinks,.nav-links,.desktop-nav) a:not(.btn):not(.nav-cta):not(.navcta){text-underline-offset:5px;text-decoration-thickness:1px;transition:color .18s ease,text-decoration-color .18s ease}
body:not(.nx-motion-off) :is(.navlinks,.nav-links,.desktop-nav) a:not(.btn):not(.nav-cta):not(.navcta):hover{text-decoration-line:underline;text-decoration-color:#a67d58}
body:not(.nx-motion-off) :is(.textlink,.request-link,.card-actions a,.project-card>a:not(.site-preview):not(.demo-capture)){text-underline-offset:4px;transition:color .18s ease}
body:not(.nx-motion-off) :is(.textlink,.request-link,.card-actions a,.project-card>a:not(.site-preview):not(.demo-capture)):hover{text-decoration:underline;text-decoration-color:#a67d58}
}
`;document.head.append(style);
function cancel(){for(const a of active)a.cancel();active.clear()}
reduce.addEventListener?.("change",()=>{if(off())cancel()});
addEventListener("storage",e=>{if(e.key==="nx-motion-off"){disabled=e.newValue==="1";if(off())cancel()}});
new MutationObserver(()=>{try{disabled=localStorage.getItem("nx-motion-off")==="1"}catch{}if(off())cancel()}).observe(body,{attributes:true,attributeFilter:["class"]});
if(off()||!("IntersectionObserver" in window)||!Element.prototype.animate)return;
const isHome=body.classList.contains("compact-flow");
const list=[...document.querySelectorAll("main h1, main h2, main .reel-heading h3, main .eyebrow, main .ey, .three-page .hero-title")].filter(el=>{
 if(el.closest("dialog,[hidden],.project-card,.design-card,.demo-tile,.service,.card,.ugc-grid,.planning-grid,.nx-circle-ring,.nx-accordion-panel,.faq details"))return false;
 if(isHome&&el.closest("#home"))return false;
 if(el.matches(".eyebrow,.ey")&&!el.closest(".section-head,.hero,main.wrap,.archive-hero,.nx-circle-section"))return false;
 return el.textContent.trim().length>0;
});
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);if(off()||!el.getClientRects().length)continue;
 const small=el.matches(".ey,.eyebrow");const isTitle=el.matches("h1,.hero-title");const animation=el.animate([
 {opacity:small?.88:.68,filter:small?"blur(0px)":"blur(3px)",translate:small?"0 3px":"0 8px"},
 {opacity:1,filter:"blur(0px)",translate:"0 0"}
 ],{duration:small?300:isTitle?650:520,delay:small?0:55,easing:"cubic-bezier(.22,.8,.25,1)",fill:"none"});
 active.add(animation);animation.finished.then(()=>active.delete(animation),()=>active.delete(animation));
 }
},{threshold:.08});list.forEach(el=>observer.observe(el));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();