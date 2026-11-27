/* Auto-advancing compact rails. Pause when interacting or offscreen; honor reduced motion. */
(() => {
  "use strict";
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  for (const rail of document.querySelectorAll("[data-media-slider]")) {
    const track = rail.querySelector(".media-track");
    const prev = rail.querySelector("[data-slide-prev]");
    const next = rail.querySelector("[data-slide-next]");
    const toggle = rail.querySelector("[data-slide-toggle]");
    if(!track||!prev||!next||!toggle) continue;
    let paused = motion.matches, visible = !("IntersectionObserver" in window), hover = false, touching = false, holdUntil = 0;
    const sync = () => {
      const overflow = track.scrollWidth > track.clientWidth + 2;
      prev.disabled = next.disabled = toggle.disabled = !overflow;
      toggle.textContent = paused ? "Play" : "Pause";
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Resume automatic scrolling" : "Pause automatic scrolling");
    };
    const step = direction => {
      const max = track.scrollWidth - track.clientWidth;
      if(max <= 2) return;
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const distance = card.getBoundingClientRect().width + gap;
      let destination = track.scrollLeft + distance * direction;
      if(direction > 0 && track.scrollLeft >= max - 3) destination = 0;
      else if(direction < 0 && track.scrollLeft <= 3) destination = max;
      track.scrollTo({left:Math.max(0,Math.min(max,destination)),behavior:motion.matches?"instant":"smooth"});
    };
    const hold = () => { holdUntil = Date.now() + 5000; };
    prev.addEventListener("click",()=>{hold();step(-1);});
    next.addEventListener("click",()=>{hold();step(1);});
    toggle.addEventListener("click",()=>{paused=!paused;sync();});
    rail.addEventListener("mouseenter",()=>{hover=true;});
    rail.addEventListener("mouseleave",()=>{hover=false;});
    track.addEventListener("touchstart",()=>{touching=true;hold();},{passive:true});
    track.addEventListener("touchend",()=>{touching=false;hold();},{passive:true});
    track.addEventListener("touchcancel",()=>{touching=false;hold();},{passive:true});
    track.addEventListener("wheel",hold,{passive:true});
    track.addEventListener("keydown",event=>{if(event.target!==track)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();hold();step(event.key==="ArrowLeft"?-1:1);}});
    if("IntersectionObserver" in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:0.15}).observe(rail);
    if("ResizeObserver" in window)new ResizeObserver(sync).observe(track);else window.addEventListener("resize",sync,{passive:true});
    motion.addEventListener?.("change",()=>{paused=motion.matches;sync();});
    setInterval(()=>{if(!paused&&visible&&!hover&&!touching&&!document.hidden&&!rail.contains(document.activeElement)&&!document.querySelector("dialog[open]")&&Date.now()>holdUntil)step(1);},3000);
    sync();
  }
})();
