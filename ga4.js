/* AJAYNXT GA4: optional analytics, no form contents. */
(()=>{"use strict";
if(window.ajaynxtGA4Initialized)return;
window.ajaynxtGA4Initialized=true;
const id="G-YDCKPQYM3X",key="ajaynxt-analytics-consent-v1";
let choice=null,started=false;
try{choice=localStorage.getItem(key);}catch{}
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
const consent=value=>({analytics_storage:value,ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
window.gtag("consent","default",consent("denied"));
function start(){
 if(started||choice!=="allow")return;
 started=true;
 window.gtag("consent","update",consent("granted"));
 window.gtag("js",new Date());
 window.gtag("config",id,{send_page_view:true,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname});
 const tag=document.createElement("script");tag.async=true;tag.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(tag);
}
window.addEventListener("ajaynxt-analytics-consent",event=>{
 choice=event.detail==="allow"?"allow":"deny";
 if(choice==="allow")start();
 else if(started)window.gtag("consent","update",consent("denied"));
});
const types=new Set(["whatsapp_click","phone_click","email_click","enquiry_handoff","showcase_prompt_request","navigation_click","portfolio_item_click"]);
window.trackAJAYNXT=(name,params={})=>{
 if(!started||choice!=="allow"||!types.has(name))return;
 const safe={send_to:id};
 if(["whatsapp","email","phone"].includes(params.contact_method))safe.contact_method=params.contact_method;
 window.gtag("event",name,safe);
};
document.addEventListener("click",event=>{
 const el=event.target instanceof Element?event.target.closest("a[href],button"):null;
 if(!el)return;
 let url;try{url=new URL(el.getAttribute("href")||"",location.href);}catch{return;}
 if(el.matches("[data-showcase-request]"))window.trackAJAYNXT("showcase_prompt_request");
 else if((url.hostname==="wa.me"&&url.pathname.replace(/\/$/,"")==="/919929562585")||(url.hostname==="api.whatsapp.com"&&url.searchParams.get("phone")==="919929562585"))window.trackAJAYNXT("whatsapp_click",{contact_method:"whatsapp"});
 else if(url.protocol==="tel:"&&url.pathname.replace(/[^0-9]/g,"").endsWith("9929562585"))window.trackAJAYNXT("phone_click",{contact_method:"phone"});
 else if(url.protocol==="mailto:"&&url.pathname.toLowerCase()==="ajayx3neha@gmail.com")window.trackAJAYNXT("email_click",{contact_method:"email"});
 else if(el.closest("nav"))window.trackAJAYNXT("navigation_click");
 else if(el.closest(".project-card,.design-card,[data-project-item]"))window.trackAJAYNXT("portfolio_item_click");
},{passive:true});
start();
})();