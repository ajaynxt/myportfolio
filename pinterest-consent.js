/* Pinterest base tag. Advertising measurement is opt-in, independent of GTM. */
(()=>{"use strict";
if(window.ajaynxtPinterestConsentLoaded)return;
window.ajaynxtPinterestConsentLoaded=true;
const key="ajaynxt-pinterest-consent-v1";
let choice=null,started=false;
try{choice=localStorage.getItem(key);}catch{}
function remember(value){choice=value;try{localStorage.setItem(key,value);}catch{}}
function start(){
 if(started||choice!=="allow")return;
 started=true;
 if(!window.pintrk){const tracker=function(){tracker.queue.push(Array.prototype.slice.call(arguments));};tracker.queue=[];tracker.version="3.0";window.pintrk=tracker;const script=document.createElement("script");script.async=true;script.src="https://s.pinimg.com/ct/core.js";document.head.appendChild(script);}
 window.pintrk("load","2614394817874");
 window.pintrk("page");
}
function init(){
 const panel=document.createElement("section");panel.className="nx-pinterest-consent";panel.setAttribute("aria-label","Pinterest advertising preferences");panel.hidden=true;
 const title=document.createElement("strong");title.textContent="Advertising preferences";
 const info=document.createElement("p");info.textContent="Allow Pinterest to measure visits and advertising performance? This is optional. You can change your choice at any time.";
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