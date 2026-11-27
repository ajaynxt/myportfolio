/* Pinterest base tag. Advertising measurement is opt-in, independent of GTM. */
(()=>{"use strict";
if(window.ajaynxtPinterestConsentLoaded)return;
window.ajaynxtPinterestConsentLoaded=true;
const key="ajaynxt-pinterest-consent-v1";
let choice=null,started=false,analyticsChoice=null;
const analyticsKey="ajaynxt-analytics-consent-v1";
try{analyticsChoice=localStorage.getItem(analyticsKey);}catch{}
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
 const panel=document.createElement("section");panel.className="nx-pinterest-consent";panel.setAttribute("aria-label","Analytics and advertising preferences");panel.hidden=true;
 const title=document.createElement("strong");title.textContent="Your privacy choices";
 const info=document.createElement("p");info.textContent="Optional analytics and advertising cookies help us improve this site.";
 const link=document.createElement("a");link.href="/privacy/";link.textContent="Privacy notice";
 const actions=document.createElement("div");actions.className="nx-consent-actions";
 const allow=document.createElement("button"),deny=document.createElement("button");allow.type=deny.type="button";allow.textContent="Save choices";deny.textContent="Reject all";
 const analytics=document.createElement("input"),ads=document.createElement("input");analytics.type=ads.type="checkbox";
 const analyticsLabel=document.createElement("label"),adsLabel=document.createElement("label");analyticsLabel.append(analytics,document.createTextNode(" Google Analytics — visits and contact interactions"));adsLabel.append(ads,document.createTextNode(" Pinterest — advertising measurement"));
 const choices=document.createElement("div");choices.className="nx-privacy-choices";choices.hidden=true;choices.append(analyticsLabel,adsLabel); const accept=document.createElement("button"),custom=document.createElement("button");accept.type=custom.type="button";accept.textContent="Accept all";custom.textContent="Customize";custom.className="nx-consent-custom";allow.hidden=true;
 const saveAnalytics=value=>{analyticsChoice=value;try{localStorage.setItem(analyticsKey,value);}catch{}window.dispatchEvent(new CustomEvent("ajaynxt-analytics-consent",{detail:value}));};
 const manage=document.createElement("button");manage.type="button";manage.className="nx-consent-manage";manage.textContent="Privacy preferences";manage.setAttribute("aria-expanded","false");
 const show=(detailed=false)=>{analytics.checked=analyticsChoice==="allow";ads.checked=choice==="allow";choices.hidden=!detailed;allow.hidden=!detailed;accept.hidden=detailed;custom.hidden=detailed;panel.hidden=false;manage.setAttribute("aria-expanded","true");};
 const hide=()=>{panel.hidden=true;manage.setAttribute("aria-expanded","false");};
 allow.addEventListener("click",()=>{const reload=(started&&!ads.checked)||(analyticsChoice==="allow"&&!analytics.checked);remember(ads.checked?"allow":"deny");saveAnalytics(analytics.checked?"allow":"deny");if(reload){location.reload();return;}start();hide();manage.focus();});
 deny.addEventListener("click",()=>{const reload=started||analyticsChoice==="allow";remember("deny");saveAnalytics("deny");if(reload){location.reload();return;}hide();manage.focus();});
 accept.addEventListener("click",()=>{remember("allow");saveAnalytics("allow");start();hide();});custom.addEventListener("click",()=>{show(true);analytics.focus();});manage.addEventListener("click",()=>panel.hidden?show(true):hide());
 actions.append(deny,accept,allow);panel.append(title,info,actions,choices,custom,link);
 const footer=document.querySelector("footer");if(footer)footer.append(manage);else document.body.append(manage);
 document.body.append(panel);
 if(choice==="allow")start();if(!["allow","deny"].includes(choice)||!["allow","deny"].includes(analyticsChoice))show();
}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
/* Shared navigation control loads independently of optional tracking choices. */
(()=>{if(document.querySelector('script[src="/back-to-top.js"]'))return;const script=document.createElement("script");script.src="/back-to-top.js";script.defer=true;document.head.append(script);})();

/* Editorial animations are independent of analytics and advertising consent. */
(()=>{if(document.querySelector('script[src="/editorial-motion.js"]'))return;const script=document.createElement("script");script.src="/editorial-motion.js";script.defer=true;document.head.append(script);})();
