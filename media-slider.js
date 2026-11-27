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
    let paused = motion.matches, visible = !("IntersectionObserver" in window), hover = false, touching = false, holdUntil = 0, max = 0, distance = 0, timer = 0, resizeFrame = 0;
    const sync = () => {
      const overflow = max > 2;
      prev.disabled = next.disabled = toggle.disabled = !overflow;
      toggle.textContent = paused ? "Play" : "Pause";
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Resume automatic scrolling" : "Pause automatic scrolling");
    };
    const step = direction => {
      if(max <= 2 || distance <= 0) return;
      let destination = track.scrollLeft + distance * direction;
      if(direction > 0 && track.scrollLeft >= max - 3) destination = 0;
      else if(direction < 0 && track.scrollLeft <= 3) destination = max;
      track.scrollTo({left:Math.max(0,Math.min(max,destination)),behavior:motion.matches?"auto":"smooth"});
    };
    const hold = () => { holdUntil = Date.now() + 3000; };
    prev.addEventListener("click",()=>{hold();step(-1);});
    next.addEventListener("click",()=>{hold();step(1);});
    toggle.addEventListener("click",()=>{paused=!paused;sync();schedule();});
    rail.addEventListener("pointerenter",event=>{if(event.pointerType==="mouse")hover=true;});
    rail.addEventListener("pointerleave",()=>{hover=false;});
    track.addEventListener("touchstart",()=>{touching=true;hold();},{passive:true});
    track.addEventListener("touchend",()=>{touching=false;hold();},{passive:true});
    track.addEventListener("touchcancel",()=>{touching=false;hold();},{passive:true});
    track.addEventListener("wheel",hold,{passive:true});
    track.addEventListener("keydown",event=>{if(event.target!==track)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();hold();step(event.key==="ArrowLeft"?-1:1);}});
    const measure = () => {
      resizeFrame = 0;
      max = track.scrollWidth - track.clientWidth;
      distance = (track.firstElementChild?.getBoundingClientRect().width || 0) + (parseFloat(getComputedStyle(track).columnGap) || 0);
      sync();
    };
    const scheduleMeasure = () => {if(!resizeFrame)resizeFrame=requestAnimationFrame(measure);};
    const tick = () => {if(!paused&&visible&&!hover&&!touching&&!document.hidden&&!track.contains(document.activeElement)&&!document.querySelector("dialog[open]")&&Date.now()>holdUntil)step(1);};
    const schedule = () => {if(timer){clearInterval(timer);timer=0;}if(visible&&!paused&&!document.hidden)timer=setInterval(tick,2200);};
    if("IntersectionObserver" in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)scheduleMeasure();schedule();},{threshold:0.15}).observe(rail);
    if("ResizeObserver" in window){const ro=new ResizeObserver(scheduleMeasure);ro.observe(track);if(track.firstElementChild)ro.observe(track.firstElementChild);}else window.addEventListener("resize",scheduleMeasure,{passive:true});
    motion.addEventListener?.("change",()=>{paused=motion.matches;sync();schedule();});
    document.addEventListener("visibilitychange",schedule);
    scheduleMeasure();schedule();
  }
})();
