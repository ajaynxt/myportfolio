/* Pinterest base tag. Advertising measurement is opt-in, independent of GTM. */
(()=>{"use strict";
if(window.ajaynxtPinterestConsentLoaded)return;
window.ajaynxtPinterestConsentLoaded=true;
const key="ajaynxt-pinterest-consent-v1";
let choice=null,started=false;
const lastLead=new Map();
const leadTypes=new Set(["WhatsApp contact click","Email contact click","Phone contact click","WhatsApp enquiry handoff","Email enquiry handoff"]);
try{choice=localStorage.getItem(key);}catch{}
function remember(value){choice=value;try{localStorage.setItem(key,value);}catch{}}
function eventId(){
 if(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function")return crypto.randomUUID();
 return Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
}
function track(event,properties={}){
 if(choice!=="allow"||!started||typeof window.pintrk!=="function")return;
 try{window.pintrk("track",event,{event_id:eventId(),...properties});}catch{}
}
window.ajaynxtPinterestLead=function(type){
 if(choice!=="allow"||!started||!leadTypes.has(type))return;
 const now=Date.now();if(now-(lastLead.get(type)||0)<2000)return;
 lastLead.set(type,now);
 track("lead",{lead_type:type});
};
function start(){
 if(started||choice!=="allow")return;
 started=true;
 if(!window.pintrk){const tracker=function(){tracker.queue.push(Array.prototype.slice.call(arguments));};tracker.queue=[];tracker.version="3.0";window.pintrk=tracker;const script=document.createElement("script");script.async=true;script.src="https://s.pinimg.com/ct/core.js";document.head.appendChild(script);}
 window.pintrk("load","2612996266005");
 window.pintrk("page");
 track("pagevisit");
}
function init(){
 document.addEventListener("click",event=>{
   const anchor=event.target instanceof Element?event.target.closest("a[href]"):null;
   if(!anchor)return;
   const raw=anchor.getAttribute("href")||"";
   let url;try{url=new URL(raw,location.href);}catch{return;}
   if((url.hostname==="wa.me"&&url.pathname.replace(/\/$/,"")==="/919929562585")||(url.hostname==="api.whatsapp.com"&&url.searchParams.get("phone")==="919929562585"))window.ajaynxtPinterestLead("WhatsApp contact click");
   else if(url.protocol==="mailto:"&&url.pathname.toLowerCase()==="ajayx3neha@gmail.com")window.ajaynxtPinterestLead("Email contact click");
   else if(url.protocol==="tel:"&&url.pathname.replace(/[^0-9]/g,"").endsWith("9929562585"))window.ajaynxtPinterestLead("Phone contact click");
 },{capture:true,passive:true});
 const panel=document.createElement("section");panel.className="nx-pinterest-consent";panel.setAttribute("aria-label","Pinterest advertising preferences");panel.hidden=true;
 const title=document.createElement("strong");title.textContent="Advertising preferences";
 const info=document.createElement("p");info.textContent="Allow Pinterest to measure page visits and contact interactions for advertising performance? This is optional. You can change your choice at any time.";
 const link=document.createElement("a");link.href="https://policy.pinterest.com/en/privacy-policy";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Pinterest privacy policy";
 const actions=document.createElement("div");actions.className="nx-consent-actions";
 const allow=document.createElement("button"),deny=document.createElement("button");allow.type=deny.type="button";allow.textContent="Allow";deny.textContent="Decline";
 const manage=document.createElement("button");manage.type="button";manage.className="nx-consent-manage";manage.textContent="Ad preferences";manage.setAttribute("aria-expanded","false");
 const show=()=>{panel.hidden=false;manage.setAttribute("aria-expanded","true");};
 const hide=()=>{panel.hidden=true;manage.setAttribute("aria-expanded","false");};
 allow.addEventListener("click",()=>{remember("allow");start();hide();manage.focus();});
 deny.addEventListener("click",()=>{remember("deny");if(started){location.reload();return;}hide();manage.focus();});
 manage.addEventListener("click",()=>panel.hidden?show():hide());
 actions.append(deny,allow);panel.append(title,info,link,actions);
 const footer=document.querySelector("footer");if(footer)footer.append(manage);else document.body.append(manage);
 document.body.append(panel);
 if(choice==="allow")start();else if(choice!=="deny")show();
}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();