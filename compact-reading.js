/* Progressive reading navigation. Every original paragraph, link and form remains available. */
(() => {
  "use strict";
  const main=document.querySelector("main.wrap");
  if(!main)return;
  const panels=[];
  const titleOf=(el)=>el.querySelector("h2,h3")?.textContent.trim()||"Details";
  function add(parent,nodes,label){
    if(!nodes.length)return;
    const box=document.createElement("div");box.className="reading-panel";box.dataset.readingLabel=label;
    parent.insertBefore(box,nodes[0]);nodes.forEach(node=>box.appendChild(node));panels.push(box);
  }
  function split(parent,initial="Overview"){
    const children=Array.from(parent.children);
    let group=[],label=initial;
    const flush=()=>{add(parent,group,label);group=[];label="Details";};
    for(const child of children){
      if(child.matches("article")&&parent===main){flush();split(child,"Overview");}
      else if(child.matches("div.copy,section.copy.keyword-context")){flush();split(child,child.querySelector("figure")?"Project preview":"Details");}
      else if(child.matches("section.tool,section.faq,section.related-services,.grid")){flush();add(parent,[child],child.matches(".grid")?"Explore collection":titleOf(child));}
      else if(child.tagName==="H2"){flush();label=child.textContent.trim();group.push(child);}
      else group.push(child);
    }
    flush();
  }
  split(main);
  if(panels.length<2)return;
  const nav=document.createElement("nav");
  nav.className="reading-navigation";nav.setAttribute("aria-label","Browse page sections");
  nav.innerHTML='<button type="button" data-reading-prev aria-label="Previous section">←</button><select aria-label="Choose section"></select><span data-reading-count aria-live="polite"></span><button type="button" data-reading-next>Next →</button><button type="button" data-reading-all aria-pressed="false">Read all</button>';
  main.prepend(nav);
  const select=nav.querySelector("select"),prev=nav.querySelector("[data-reading-prev]"),next=nav.querySelector("[data-reading-next]"),count=nav.querySelector("[data-reading-count]"),all=nav.querySelector("[data-reading-all]");
  panels.forEach((panel,i)=>{const option=document.createElement("option");option.value=String(i);option.textContent=panel.dataset.readingLabel;select.append(option);});
  let active=0,expanded=false;
  function show(index,focus=false){
    active=Math.max(0,Math.min(panels.length-1,index));
    panels.forEach((panel,i)=>panel.hidden=!expanded&&i!==active);
    select.value=String(active);select.disabled=expanded;prev.disabled=expanded||active===0;next.disabled=expanded||active===panels.length-1;count.textContent=expanded?"All":(active+1)+" / "+panels.length;
    all.textContent=expanded?"One section":"Read all";all.setAttribute("aria-pressed",String(expanded));
    if(focus&&!expanded){panels[active].tabIndex=-1;panels[active].focus({preventScroll:true});window.scrollTo({top:0,behavior:"auto"});}
  }
  prev.addEventListener("click",()=>show(active-1,true));next.addEventListener("click",()=>show(active+1,true));select.addEventListener("change",()=>show(Number(select.value),true));all.addEventListener("click",()=>{expanded=!expanded;show(active,false);});
  function activateHash(){const id=location.hash.slice(1);if(!id)return false;let target;try{target=document.getElementById(decodeURIComponent(id));}catch{return false;}const index=panels.findIndex(p=>p.contains(target));if(index<0)return false;show(index);return true;}
  window.addEventListener("hashchange",activateHash);
  if(!activateHash())show(0);
})();
