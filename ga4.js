/* AJAYNXT Google Analytics 4.
   * Add the real Measurement ID (G-XXXXXXXXXX) below after creating/opening the GA4 web stream.
   * No form values, prompt content, email addresses or WhatsApp message text are sent to GA4.
   */
(() => {
  "use strict";
  const GA4_ID = "G-REPLACE_WITH_MEASUREMENT_ID";
  if (!/^G-[A-Z0-9]+$/.test(GA4_ID) || GA4_ID.includes("REPLACE")) {
    console.info("[AJAYNXT Analytics] Add the GA4 Measurement ID in ga4.js to activate Google Analytics.");
    window.trackAJAYNXT = () => {};
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: true });
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
  document.head.appendChild(tag);

  window.trackAJAYNXT = (eventName, parameters = {}) => {
    if (typeof window.gtag !== "function") return;
    const safe = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (value == null || typeof value === "boolean" || typeof value === "number") safe[key] = value;
      else if (typeof value === "string") safe[key] = value.slice(0, 100);
    }
    window.gtag("event", eventName, safe);
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a,button");
    if (!target) return;
    const href = target.getAttribute("href") || "";
    const label = (target.dataset.gaLabel || target.innerText || target.getAttribute("aria-label") || "link").trim().replace(/\s+/g, " ").slice(0, 70);
    if (target.matches("[data-showcase-request]")) {
      window.trackAJAYNXT("showcase_prompt_request", {
        design_id: target.dataset.designId || "unknown",
        design_category: target.dataset.designCategory || "unknown",
        link_text: "Message for prompt"
      });
    } else if (/wa\.me|whatsapp\.com/.test(href)) {
      window.trackAJAYNXT("whatsapp_click", { link_text: label });
    } else if (href.startsWith("tel:")) {
      window.trackAJAYNXT("phone_click", { link_text: label });
    } else if (href.startsWith("mailto:")) {
      window.trackAJAYNXT("email_click", { link_text: label });
    } else if (target.closest("nav")) {
      window.trackAJAYNXT("navigation_click", { link_text: label });
    } else if (target.closest(".project-card, .design-card, [data-project-item]")) {
      window.trackAJAYNXT("portfolio_item_click", { item_name: label });
    }
  }, { passive: true });
})();
