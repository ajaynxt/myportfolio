/* Progressive screen-by-screen homepage navigation. All content remains in original HTML. */
(() => {
  "use strict";
  const nav=document.getElementById("screen-navigation"),select=document.getElementById("screen-select"),prev=document.getElementById("screen-prev"),next=document.getElementById("screen-next"),count=document.getElementById("screen-count");
  if(!nav||!select||!prev||!next||!count)return;
  const ids=Array.from(select.options,o=>o.value),panels=ids.map(id=>document.getElementById(id));
  if(panels.some(p=>!p))return;
  let active=0;
  const activate=(id,focus=false)=>{
    const index=ids.indexOf(id==="top"||!id?"home":id);if(index<0)return false;
    active=index;panels.forEach((panel,i)=>{panel.hidden=i!==active;});
    const trust=document.querySelector("#main>.trustbar");if(trust)trust.hidden=true;
    select.value=ids[active];count.textContent=String(active+1).padStart(2,"0")+" / "+ids.length;prev.disabled=active===0;next.disabled=active===ids.length-1;
    if(focus){panels[active].setAttribute("tabindex","-1");panels[active].focus({preventScroll:true});}
    window.scrollTo({top:0,behavior:"instant"});window.dispatchEvent(new Event("resize"));return true;
  };
  const go=id=>{if(!ids.includes(id))return;history.pushState(null,"","#"+id);activate(id,true);};
  document.body.classList.add("screen-layout");nav.hidden=false;
  const hash=location.hash.slice(1);if(!activate(hash)){const target=document.getElementById(hash);const panel=target?.closest("#main>section");activate(panel?.id||"home");}
  select.addEventListener("change",()=>go(select.value));prev.addEventListener("click",()=>go(ids[active-1]));next.addEventListener("click",()=>go(ids[active+1]));
  document.addEventListener("click",event=>{if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=event.target.closest("a[href^='#']");if(!a)return;const id=a.getAttribute("href").slice(1);if(ids.includes(id)||id==="top"){event.preventDefault();go(id==="top"?"home":id);}});
  const onHistory=()=>{const id=location.hash.slice(1);if(!activate(id)){const panel=document.getElementById(id)?.closest("#main>section");if(panel)activate(panel.id);}};
  window.addEventListener("hashchange",onHistory);window.addEventListener("popstate",onHistory);
})();
