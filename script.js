"use strict";

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("[data-header]");
const progressBar = document.querySelector("[data-scroll-progress]");
const goTop = document.querySelector("[data-go-top]");

let scrollFrame = 0;
const updateScrollUi = () => {
  const top = window.scrollY;
  const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, top / total));
  header?.classList.toggle("is-scrolled", top > 18);
  goTop?.classList.toggle("is-visible", top > 680);
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  scrollFrame = 0;
};

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUi);
}, { passive: true });
updateScrollUi();

goTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
});

const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

const setMenu = (open) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  if (open) mobileMenu.querySelector("a")?.focus();
};

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1100) setMenu(false);
});

const roleWord = document.querySelector("[data-role-word]");
const roleToggle = document.querySelector("[data-role-toggle]");
if (roleWord) {
  if (reducedMotion.matches) {
    roleWord.textContent = "Developer & Video Editor";
    roleToggle?.setAttribute("hidden", "");
  } else {
    const roles = ["Developer", "Video Editor"];
    let roleIndex = 0;
    let roleTimer = 0;
    const rotateRole = () => {
      roleWord.classList.add("is-changing");
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleWord.textContent = roles[roleIndex];
        roleWord.classList.toggle("tone-1", roleIndex === 1);
        window.requestAnimationFrame(() => roleWord.classList.remove("is-changing"));
      }, 250);
    };
    const stopRoles = () => {
      if (!roleTimer) return;
      window.clearInterval(roleTimer);
      roleTimer = 0;
    };
    const startRoles = () => {
      if (!roleTimer) roleTimer = window.setInterval(rotateRole, 2700);
    };
    startRoles();
    roleToggle?.addEventListener("click", () => {
      const paused = roleToggle.getAttribute("aria-pressed") !== "true";
      roleToggle.setAttribute("aria-pressed", String(paused));
      roleToggle.setAttribute("aria-label", paused ? "Resume rotating roles" : "Pause rotating roles");
      const controlLabel = roleToggle.querySelector("[data-role-control-label]");
      if (controlLabel) controlLabel.textContent = paused ? "Resume roles" : "Pause roles";
      if (paused) stopRoles(); else startRoles();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopRoles();
      else if (roleToggle?.getAttribute("aria-pressed") !== "true") startRoles();
    });
  }
}

const revealItems = [...document.querySelectorAll(".reveal")];
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const filmRail = document.querySelector("[data-film-rail]");
const scrollFilms = (direction) => {
  if (!filmRail) return;
  const amount = Math.max(280, filmRail.clientWidth * 0.78) * direction;
  filmRail.scrollBy({ left: amount, behavior: reducedMotion.matches ? "auto" : "smooth" });
};
document.querySelector("[data-film-prev]")?.addEventListener("click", () => scrollFilms(-1));
document.querySelector("[data-film-next]")?.addEventListener("click", () => scrollFilms(1));

const filmCards = [...document.querySelectorAll("[data-film]")];
const videoModal = document.querySelector("[data-video-modal]");
const videoFrame = videoModal?.querySelector("[data-video-frame]");
const videoTitle = videoModal?.querySelector("[data-video-title]");
let filmIndex = 0;
let modalTrigger = null;

const safeDrivePreview = (value) => {
  try {
    const url = new URL(value);
    const validPath = /^\/file\/d\/[A-Za-z0-9_-]+\/preview\/?$/.test(url.pathname);
    if (url.protocol === "https:" && url.hostname === "drive.google.com" && validPath) return url.href;
  } catch {
    return "";
  }
  return "";
};

const openFilm = (index) => {
  if (!videoModal || !videoFrame || !filmCards.length) return;
  filmIndex = (index + filmCards.length) % filmCards.length;
  const card = filmCards[filmIndex];
  const source = safeDrivePreview(card.dataset.video || "");
  if (!source) return;
  modalTrigger = document.activeElement;
  if (videoTitle) videoTitle.textContent = card.dataset.title || "Film";
  videoFrame.src = source;
  if (!videoModal.open) {
    videoModal.showModal();
    videoModal.querySelector("[data-video-close]")?.focus();
  }
};

const closeFilm = () => {
  if (!videoModal) return;
  videoModal.close();
  videoFrame?.removeAttribute("src");
  if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
};

filmCards.forEach((card, index) => card.addEventListener("click", () => openFilm(index)));
videoModal?.querySelector("[data-video-close]")?.addEventListener("click", closeFilm);
videoModal?.querySelector("[data-video-prev]")?.addEventListener("click", () => openFilm(filmIndex - 1));
videoModal?.querySelector("[data-video-next]")?.addEventListener("click", () => openFilm(filmIndex + 1));
videoModal?.addEventListener("click", (event) => {
  if (event.target === videoModal) closeFilm();
});
videoModal?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeFilm();
});

const bookingForm = document.querySelector("[data-booking-form]");
const bookingDate = document.querySelector("#book-date");
if (bookingDate instanceof HTMLInputElement) {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  bookingDate.min = localDate;
}

const bookingDetails = document.querySelector("#book-details");
const charCount = document.querySelector("[data-char-count]");
const updateCount = () => {
  if (charCount && bookingDetails instanceof HTMLTextAreaElement) charCount.textContent = `${bookingDetails.value.length} / 500`;
};
bookingDetails?.addEventListener("input", updateCount);
updateCount();

const fieldMessage = (field) => {
  const label = bookingForm?.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() || "This field";
  if (field.validity.valueMissing) return `${label} is required.`;
  if (field.validity.tooShort) return `${label} needs a little more detail.`;
  if (field.validity.tooLong) return `${label} is too long.`;
  if (field.validity.rangeUnderflow) return `${label} must be at least ${field.min}.`;
  if (field.validity.rangeOverflow) return `${label} is above the allowed limit.`;
  if (field.validity.typeMismatch || field.validity.badInput) return `Enter a valid ${label.toLowerCase()}.`;
  return "";
};

const validateField = (field) => {
  const error = bookingForm?.querySelector(`[data-error-for="${field.id}"]`);
  const message = field.validity.valid ? "" : fieldMessage(field);
  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message;
  return !message;
};

if (bookingForm instanceof HTMLFormElement) {
  const requiredFields = [...bookingForm.querySelectorAll("[required]")];
  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("change", () => validateField(field));
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalidFields = requiredFields.filter((field) => !validateField(field));
    const summary = bookingForm.querySelector("[data-error-summary]");
    const summaryList = summary?.querySelector("ul");

    if (invalidFields.length) {
      summaryList?.replaceChildren();
      invalidFields.forEach((field) => {
        const message = fieldMessage(field);
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${field.id}`;
        link.textContent = message;
        item.append(link);
        summaryList?.append(item);
      });
      if (summary) {
        summary.hidden = false;
        summary.focus();
      }
      return;
    }

    if (summary) summary.hidden = true;
    const data = new FormData(bookingForm);
    const dateValue = String(data.get("date") || "");
    const formattedDate = dateValue
      ? new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "Not selected";
    const lines = [
      "Hello Ajay, I would like to book a project call.",
      "",
      `Name: ${String(data.get("name") || "").trim()}`,
      `Service: ${String(data.get("service") || "")}`,
      `Preferred date: ${formattedDate}`,
      `Preferred time: ${String(data.get("time") || "")} IST`,
      `Estimated budget: ${String(data.get("currency") || "INR")} ${String(data.get("budget") || "")}`,
      "",
      "Project details:",
      String(data.get("details") || "").trim(),
      "",
      "Please confirm whether this time is available."
    ];
    const bookingUrl = `https://wa.me/919929562585?text=${encodeURIComponent(lines.join("\n"))}`;
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.firstChild?.nodeValue || "Prepare WhatsApp booking ";
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      if (submitButton.firstChild) submitButton.firstChild.nodeValue = "Opening WhatsApp… ";
    }
    window.location.assign(bookingUrl);
    window.setTimeout(() => {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
        if (submitButton.firstChild) submitButton.firstChild.nodeValue = originalText;
      }
    }, 900);
  });
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-category]")];
const projectCount = document.querySelector("[data-project-count]");

const applyFilter = (filter) => {
  let visible = 0;
  archiveCards.forEach((card) => {
    const categories = (card.dataset.category || "").split(" ");
    const show = filter === "all" || categories.includes(filter);
    card.hidden = !show;
    if (show) visible += 1;
  });
  filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
  if (projectCount) projectCount.textContent = `${visible} projects shown`;
};

filterButtons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter || "all")));
if (archiveCards.length) applyFilter("all");

// Keep portfolio counters accurate without implying the showcased edits are the total body of work.
const heroStats = [...document.querySelectorAll(".hero-stats > div")];
if (heroStats[0]) {
  const value = heroStats[0].querySelector("strong");
  if (value) value.textContent = "25+";
}
if (heroStats[2]) {
  const label = heroStats[2].querySelector("span");
  if (label) label.textContent = "Featured edits";
}

const viewMoreDemoCount = document.querySelector(".view-more .button span");
if (viewMoreDemoCount) viewMoreDemoCount.textContent = "25+ live demos";

const filmsIntro = document.querySelector("#films .section-head p:last-child");
if (filmsIntro) filmsIntro.textContent = "Nine selected cinematic edits from a much larger body of video work. Select any film to watch.";

// Correct and polish the third showcased film: it is a Haldi edit, not a pregnancy announcement.
const thirdFilmCard = filmCards[2];
if (thirdFilmCard) {
  thirdFilmCard.dataset.title = "Haldi Glow";
  thirdFilmCard.setAttribute("aria-label", "Play Haldi Glow wedding highlight");
  const cover = thirdFilmCard.querySelector(".film-cover");
  if (cover) cover.alt = "Haldi Glow wedding highlight film cover";
  const category = thirdFilmCard.querySelector("small");
  if (category) category.textContent = "Wedding highlight";
  const title = thirdFilmCard.querySelector("strong");
  if (title) title.textContent = "Haldi Glow";
  const subtitle = thirdFilmCard.querySelector("b");
  if (subtitle) subtitle.textContent = "Golden rituals, timeless memories";
}

/* ==========================================================================
   Interactive AI Assistant Logic (Comprehensive Knowledge & Response Engine)
   ========================================================================== */
const aiWidget = document.querySelector("[data-ai-widget]");
const aiToggle = document.querySelector("[data-ai-toggle]");
const aiModal = document.querySelector("[data-ai-modal]");
const aiClose = document.querySelector("[data-ai-close]");
const aiMessages = document.querySelector("[data-ai-messages]");
const aiForm = document.querySelector("[data-ai-form]");
const aiInput = document.querySelector("[data-ai-input]");
const aiSuggestions = document.querySelector("[data-ai-suggestions]");

if (aiWidget && aiToggle && aiModal && aiMessages) {
  const toggleAi = (open) => {
    aiModal.hidden = !open;
    aiToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      aiInput?.focus();
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  };

  aiToggle.addEventListener("click", () => toggleAi(aiModal.hidden));
  aiClose?.addEventListener("click", () => toggleAi(false));

  const appendMsg = (text, sender = "bot", isHtml = false) => {
    const msg = document.createElement("div");
    msg.className = `ai-msg ai-msg-${sender}`;
    if (isHtml) msg.innerHTML = text;
    else msg.textContent = text;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return msg;
  };

  const showTyping = () => {
    const typing = document.createElement("div");
    typing.className = "ai-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    aiMessages.appendChild(typing);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return typing;
  };

  const demoCatalog = [
    { title: "Diamond Restaurants", category: "Client Work", url: "https://diamondrestaurants.com/", desc: "Restaurant, bakery & sweets full ordering platform." },
    { title: "Celestique Jewellery", category: "Luxury Retail", url: "https://jewellery.ajaynxt.com/", desc: "Editorial luxury storefront for fine jewelry." },
    { title: "Rajmahal Lake Palace", category: "Luxury Hospitality", url: "https://hotel.ajaynxt.com/", desc: "Heritage luxury palace hotel guest experience." },
    { title: "Mediora Diagnostics", category: "Healthcare", url: "https://diagnostic.ajaynxt.com/", desc: "Patient-first medical lab & diagnostic booking." },
    { title: "Stonecrest Developers", category: "Construction & Real Estate", url: "https://construction.ajaynxt.com/", desc: "Corporate construction & commercial developer showcase." },
    { title: "CasaForma Living", category: "Furniture & Interiors", url: "https://furniture.ajaynxt.com/", desc: "Crafted living, bespoke furniture & contemporary spaces." },
    { title: "Solvanta Energy", category: "Clean Tech & Solar", url: "https://solar.ajaynxt.com/", desc: "Solar panel energy solutions & quotation funnels." },
    { title: "Aurevia Retreat & Spa", category: "Resort & Wellness", url: "https://stay.ajaynxt.com/", desc: "Luxury wellness resort, spa & sanctuary stays." },
    { title: "Velora Health Institute", category: "Hospital & Care", url: "https://health.ajaynxt.com/", desc: "Multi-speciality hospital with department booking." },
    { title: "Arclune Estates", category: "Luxury Real Estate", url: "https://realty.ajaynxt.com/", desc: "High-end luxury estates and residential property portal." },
    { title: "Velune Skin", category: "D2C E-commerce", url: "https://shop.ajaynxt.com/", desc: "Skincare, cosmetics & beauty online storefront." },
    { title: "Nexora Academy", category: "Education & Coaching", url: "https://academy.2.ajaynxt.com/", desc: "Modern academy for courses, learning & admissions." },
    { title: "Meroza Kitchen", category: "Food & Dining", url: "https://food.ajaynxt.com/", desc: "Fast online food ordering & gourmet menu experience." },
    { title: "Aureon Motors", category: "Automotive", url: "https://auto.2.ajaynxt.com/", desc: "High-performance automotive dealership & supercar showcase." },
    { title: "Real Estate Property", category: "Property Listing", url: "https://estate.ajaynxt.com/", desc: "Property buy/sell/rent marketplace portal." },
    { title: "Wedding Planner & Films", category: "Wedding & Events", url: "https://wedding.ajaynxt.com/", desc: "Cinematic weddings, photography & event coordination." },
    { title: "Salon, Spa & Beauty", category: "Beauty & Grooming", url: "https://salon.ajaynxt.com/", desc: "Luxury salon appointments & premium beauty packages." },
    { title: "Travel & Homestay", category: "Travel & Hospitality", url: "https://travel.ajaynxt.com/", desc: "Destination vacations, homestays & guided travel." },
    { title: "Interior Designer & Architect", category: "Architecture", url: "https://interior.ajaynxt.com/", desc: "Architectural portfolio & luxury interior planning." },
    { title: "Fashion Store", category: "Fashion E-commerce", url: "https://store.ajaynxt.com/", desc: "Contemporary apparel, clothing & fashion brand." },
    { title: "SaaS Business Software", category: "Tech & Software", url: "https://saas.ajaynxt.com/", desc: "Product-led SaaS conversion landing page." },
    { title: "Restaurant & Cafe", category: "Dining & Cafe", url: "https://restaurant.ajaynxt.com/", desc: "Artisan cafe and dining experience." },
    { title: "Fitness & Gym", category: "Fitness & Training", url: "https://fitness.ajaynxt.com/", desc: "High-energy gym, trainers & membership plans." },
    { title: "Clinic & Doctor", category: "Healthcare Practice", url: "https://clinic.ajaynxt.com/", desc: "Doctor appointments & specialist medical care." },
    { title: "Lawyer & Legal Consultant", category: "Legal Services", url: "https://legal.ajaynxt.com/", desc: "Corporate law, legal consultations & dispute practice." },
    { title: "Eye Care Clinic", category: "Optometry & Health", url: "https://eye.ajaynxt.com/", desc: "Ophthalmology, vision testing & eye surgery care." }
  ];

  const knowledgeBase = {
    services: `Ajay provides end-to-end digital & creative solutions:<br>
      • <strong>Web Design & Engineering:</strong> Ultra-fast, responsive custom websites, landing pages, luxury portfolios & e-commerce stores.<br>
      • <strong>Cinematic Video Editing:</strong> Commercial brand films, wedding/haldi highlights, high-energy automotive edits, YouTube & reels.<br>
      • <strong>UI/UX Design & AI Workflows:</strong> Modern interactive prototypes, AI chatbots, automated business pipelines.<br>
      <br>👉 <a href="projects.html">Explore 25+ Live Demo Websites</a>`,

    tech: `Ajay's full engineering & creative technology stack:<br>
      • <strong>Frontend:</strong> React, Next.js, Modern JavaScript (ES6+), HTML5, CSS3 (Grid & Flexbox), Tailwind CSS<br>
      • <strong>Backend & Cloud:</strong> Node.js, Python, Firebase Hosting & Firestore, Google Cloud Platform (GCP)<br>
      • <strong>Video & Motion Graphics:</strong> Adobe Premiere Pro, After Effects, DaVinci Resolve, Color Grading (Log/LUTs), Sound Design<br>
      • <strong>Performance & SEO:</strong> 100% Mobile Responsive, Core Web Vitals Optimization, Schema.org JSON-LD SEO`,

    films: `Ajay creates cinematic, story-driven films with meticulous pacing, cinematic color grading, and custom sound design:<br>
      • <strong>Haldi Glow:</strong> Golden rituals, wedding highlights & joyful celebrations<br>
      • <strong>Himalayan Escapes:</strong> Cinematic mountain landscapes & travel visuals<br>
      • <strong>Crimson Drift:</strong> High-energy automotive motion & sound design<br>
      • <strong>The Royal Heritage:</strong> Timeless palace architectures & heritage stories<br>
      <br>👉 <a href="index.html#films">Watch featured films with live player</a>`,

    location: `📍 <strong>Headquarters:</strong> Sikar, Rajasthan, India.<br>
      🌍 <strong>Global Reach:</strong> Serving clients worldwide across India, United States, United Kingdom, Europe & UAE.<br><br>
      ⏱️ <strong>Turnaround Timelines:</strong><br>
      • Single-page Landing Pages & Portfolios: <strong>3–5 Days</strong><br>
      • Multi-page Business Websites & E-commerce: <strong>1–2 Weeks</strong><br>
      • Video Editing & Social Campaigns: <strong>24–72 Hours</strong>`,

    pricing: `💰 <strong>Transparent & Value-Driven Pricing:</strong><br>
      • <strong>Landing Pages / Portfolio Sites:</strong> ₹12,000 – ₹25,000 ($200 – $400 USD)<br>
      • <strong>Full Business / Multi-Page Websites:</strong> ₹25,000 – ₹60,000 ($400 – $900 USD)<br>
      • <strong>E-Commerce / Custom Web Apps:</strong> ₹45,000+ ($700+ USD)<br>
      • <strong>Video Editing (Reels, Commercials, Films):</strong> Per project or monthly retainer<br>
      <em>Multi-currency accepted: INR (₹), USD ($), EUR (€), GBP (£), AED (د.إ).</em><br>
      <br>👉 <a href="https://wa.me/919929562585" target="_blank">Get a custom instant quote on WhatsApp</a>`,

    contact: `Connect directly with Ajay Saini:<br>
      • 📱 <strong>WhatsApp:</strong> <a href="https://wa.me/919929562585" target="_blank">+91 99295 62585</a><br>
      • 📧 <strong>Email:</strong> <a href="mailto:ajayx3neha@gmail.com">ajayx3neha@gmail.com</a><br>
      • 📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/ajay_nxt_/" target="_blank">@ajay_nxt_</a><br>
      • 💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ajaynxt/" target="_blank">linkedin.com/in/ajaynxt</a><br>
      • 📅 <strong>Book a Call:</strong> <a href="index.html#book">Fill the project booking form</a>`,

    demos: `Ajay has built a live archive of <strong>25+ specialized industry demos</strong>:<br><br>
      🏢 <strong>Real Estate & Construction:</strong><br>
      • <a href="https://realty.ajaynxt.com/" target="_blank">Arclune Estates ↗</a> · <a href="https://estate.ajaynxt.com/" target="_blank">Property Portal ↗</a> · <a href="https://construction.ajaynxt.com/" target="_blank">Stonecrest Developers ↗</a><br><br>
      🏨 <strong>Hospitality & Resorts:</strong><br>
      • <a href="https://hotel.ajaynxt.com/" target="_blank">Rajmahal Lake Palace ↗</a> · <a href="https://stay.ajaynxt.com/" target="_blank">Aurevia Spa Resort ↗</a> · <a href="https://travel.ajaynxt.com/" target="_blank">Travel Homestay ↗</a><br><br>
      🛍️ <strong>E-Commerce & Luxury Retail:</strong><br>
      • <a href="https://jewellery.ajaynxt.com/" target="_blank">Celestique Jewellery ↗</a> · <a href="https://shop.ajaynxt.com/" target="_blank">Velune Skin ↗</a> · <a href="https://store.ajaynxt.com/" target="_blank">Fashion Store ↗</a><br><br>
      🏥 <strong>Healthcare & Clinics:</strong><br>
      • <a href="https://health.ajaynxt.com/" target="_blank">Velora Hospital ↗</a> · <a href="https://diagnostic.ajaynxt.com/" target="_blank">Mediora Diagnostics ↗</a> · <a href="https://clinic.ajaynxt.com/" target="_blank">Doctor Clinic ↗</a><br><br>
      🍽️ <strong>Food & Dining:</strong><br>
      • <a href="https://diamondrestaurants.com/" target="_blank">Diamond Restaurants (Live Client) ↗</a> · <a href="https://restaurant.ajaynxt.com/" target="_blank">Restaurant & Cafe ↗</a><br><br>
      👉 <a href="projects.html">View all 25+ demo websites here</a>`
  };

  const findMatchingDemos = (query) => {
    const q = query.toLowerCase();
    return demoCatalog.filter((item) => {
      const matchText = `${item.title} ${item.category} ${item.desc} ${item.url}`.toLowerCase();
      const words = q.split(" ").filter((w) => w.length > 2);
      return words.some((word) => matchText.includes(word));
    });
  };

  const getSmartReply = (query) => {
    const q = query.toLowerCase();

    // Industry & Specific Demo queries
    const matchedDemos = findMatchingDemos(q);
    if (matchedDemos.length > 0 && (q.includes("demo") || q.includes("example") || q.includes("sample") || q.includes("website") || q.includes("link") || q.includes("show") || matchedDemos.length <= 4)) {
      let reply = `Here are the matching live demo websites built by Ajay:<br><br>`;
      matchedDemos.slice(0, 5).forEach((d) => {
        reply += `🔗 <strong><a href="${d.url}" target="_blank">${d.title}</a></strong> (${d.category})<br><em>${d.desc}</em><br><br>`;
      });
      reply += `👉 <a href="projects.html">See all 25+ live demo websites</a> or <a href="https://wa.me/919929562585" target="_blank">WhatsApp Ajay for custom work</a>.`;
      return reply;
    }

    if (q.includes("all demo") || q.includes("list demo") || q.includes("projects") || q.includes("portfolio") || q.includes("kya banaya")) {
      return knowledgeBase.demos;
    }
    if (q.includes("price") || q.includes("cost") || q.includes("budget") || q.includes("rate") || q.includes("charge") || q.includes("kitna") || q.includes("paisa")) {
      return knowledgeBase.pricing;
    }
    if (q.includes("service") || q.includes("work") || q.includes("develop") || q.includes("kya krte") || q.includes("offer")) {
      return knowledgeBase.services;
    }
    if (q.includes("tech") || q.includes("stack") || q.includes("language") || q.includes("code") || q.includes("react") || q.includes("next") || q.includes("python") || q.includes("skill")) {
      return knowledgeBase.tech;
    }
    if (q.includes("video") || q.includes("film") || q.includes("edit") || q.includes("premiere") || q.includes("davinci") || q.includes("haldi") || q.includes("reel")) {
      return knowledgeBase.films;
    }
    if (q.includes("location") || q.includes("where") || q.includes("kahan") || q.includes("time") || q.includes("timeline") || q.includes("sikar") || q.includes("rajasthan") || q.includes("kitne din")) {
      return knowledgeBase.location;
    }
    if (q.includes("contact") || q.includes("hire") || q.includes("call") || q.includes("phone") || q.includes("whatsapp") || q.includes("number") || q.includes("book") || q.includes("email") || q.includes("talk")) {
      return knowledgeBase.contact;
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("namaste") || q.includes("kaise ho")) {
      return "Namaste! How can I assist you today? You can ask me about Ajay's <strong>25+ live demo websites</strong>, web development services, video editing, pricing, or project timelines!";
    }

    return `Ajay specializes in high-converting custom websites and cinematic video editing with over 25+ live demos across multiple industries.<br><br>
      • <a href="projects.html">Explore 25+ Live Demo Websites</a><br>
      • <a href="index.html#book">Book a project call</a><br>
      • <a href="https://wa.me/919929562585" target="_blank">Chat with Ajay on WhatsApp</a>`;
  };

  const handleUserQuery = (text, key = "") => {
    appendMsg(text, "user");
    const typing = showTyping();
    window.setTimeout(() => {
      typing.remove();
      const reply = key && knowledgeBase[key] ? knowledgeBase[key] : getSmartReply(text);
      appendMsg(reply, "bot", true);
    }, 400);
  };

  aiSuggestions?.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qKey = btn.dataset.question || "";
      handleUserQuery(btn.textContent.trim(), qKey);
    });
  });

  aiForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!aiInput) return;
    const text = aiInput.value.trim();
    if (!text) return;
    aiInput.value = "";
    handleUserQuery(text);
  });
}

/* ==========================================================================
   Cookie Consent Banner Logic
   ========================================================================== */
const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieAccept = document.querySelector("[data-cookie-accept]");
const cookieDecline = document.querySelector("[data-cookie-decline]");

if (cookieBanner) {
  const consent = localStorage.getItem("ajay_cookie_consent");
  if (!consent) {
    window.setTimeout(() => {
      cookieBanner.hidden = false;
    }, 1200);
  }

  cookieAccept?.addEventListener("click", () => {
    localStorage.setItem("ajay_cookie_consent", "accepted");
    cookieBanner.hidden = true;
  });

  cookieDecline?.addEventListener("click", () => {
    localStorage.setItem("ajay_cookie_consent", "declined");
    cookieBanner.hidden = true;
  });
}

