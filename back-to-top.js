/* AJAYNXT shared back-to-top: independent of tracking consent. */
(()=>{"use strict";if(window.ajaynxtBackToTopLoaded)return;window.ajaynxtBackToTopLoaded=true;
function init(){let sheet=document.querySelector('link[data-nx-back-top-css]'),cssReady=false;
if(!sheet){sheet=document.createElement("link");sheet.rel="stylesheet";sheet.href="/back-to-top.css?v=2";sheet.setAttribute("data-nx-back-top-css","");document.head.append(sheet)}

const button=document.createElement("button");button.type="button";button.className="nx-back-top";button.hidden=true;button.setAttribute("aria-label","Back to top");button.innerHTML='<svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="20" stroke="#d9c5b0" stroke-width="1.4" opacity=".5"/><circle class="nx-progress-ring" cx="24" cy="24" r="20" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" stroke-width="2" stroke-linecap="round" transform="rotate(-90 24 24)"/><path class="nx-up-arrow" d="M24 33V15M16 23l8-8 8 8" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="nx-top-label" aria-hidden="true">Back to top</span>';document.body.append(button);
const ring=button.querySelector(".nx-progress-ring"),reduce=matchMedia("(prefers-reduced-motion: reduce)");const hero=document.querySelector("main > #home, main > .hero, main > .archive-hero, main > .intro, main > #flavors, main > .service-hero, main > .page-hero, body > .hero, main.hero, #hero");let pending=0;
function paint(){pending=0;const root=document.scrollingElement||document.documentElement,y=root.scrollTop,max=Math.max(0,root.scrollHeight-innerHeight);const introGone=hero?hero.getBoundingClientRect().bottom<=0:y>=Math.min(520,innerHeight*.65);button.hidden=!(cssReady&&max>100&&y>100&&introGone);ring.setAttribute("stroke-dashoffset",String(100-Math.min(100,y/Math.max(1,max)*100)))}
function schedule(){if(!pending)pending=requestAnimationFrame(paint)}
addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule,{passive:true});addEventListener("pageshow",schedule);if("ResizeObserver" in window)new ResizeObserver(schedule).observe(document.body);
function goTop(e){if(e)e.preventDefault();const root=document.scrollingElement||document.documentElement;const behavior=reduce.matches||document.body.classList.contains("nx-motion-off")?"auto":"smooth";try{root.scrollTo({top:0,left:0,behavior})}catch{root.scrollTop=0;window.scrollTo(0,0)}}
button.addEventListener("click",goTop);
document.querySelectorAll('footer a[href="#top"]').forEach(a=>a.addEventListener("click",goTop));
function ready(){cssReady=true;schedule()}sheet.addEventListener("load",ready,{once:true});sheet.addEventListener("error",()=>{button.hidden=true},{once:true});if(sheet.sheet)ready();paint();
}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();