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
   Interactive AI Assistant Logic (Knowledge & Response Engine)
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

  const knowledgeBase = {
    services: `Ajay provides end-to-end digital solutions:<br>
      • <strong>Web Design & Development</strong> (High-speed, luxury aesthetic, custom responsive websites)<br>
      • <strong>Cinematic Video Editing</strong> (Commercials, brand films, wedding highlights, YouTube & reels)<br>
      • <strong>UI/UX Design & AI Workflows</strong> (Modern interactive web experiences & automation)<br>
      <br>👉 <a href="projects.html">Explore 25+ Live Demo Websites</a>`,

    tech: `Ajay's core engineering & creative stack:<br>
      • <strong>Frontend:</strong> Modern JavaScript (ES6+), React, Next.js, HTML5/CSS3, Tailwind CSS<br>
      • <strong>Backend & Cloud:</strong> Node.js, Python, Firebase, GCP Cloud Architecture<br>
      • <strong>Video & Motion:</strong> Adobe Premiere Pro, After Effects, DaVinci Resolve, Motion Graphics`,

    films: `Ajay creates cinematic, story-driven films with meticulous pacing, color grading and sound design. Featured categories include:<br>
      • <strong>Haldi & Wedding Highlights</strong><br>
      • <strong>Commercial Brand Stories</strong><br>
      • <strong>Automotive & High-Energy Edits</strong><br>
      <br>👉 <a href="#films">Watch featured films above</a>`,

    location: `📍 <strong>Location:</strong> Sikar, Rajasthan, India (Serving clients worldwide across India, USA, UK, Europe & UAE).<br><br>
      ⏱️ <strong>Typical Timelines:</strong><br>
      • Landing pages & portfolios: 3–5 days<br>
      • Full multi-page web applications: 1–2 weeks`,

    contact: `You can reach Ajay directly for project discussions:<br>
      • 📱 <strong>WhatsApp:</strong> <a href="https://wa.me/919929562585" target="_blank">+91 99295 62585</a><br>
      • 📧 <strong>Email:</strong> <a href="mailto:ajayx3neha@gmail.com">ajayx3neha@gmail.com</a><br>
      • 📅 <strong>Book Online:</strong> <a href="#book">Fill the project booking form</a>`
  };

  const getSmartReply = (query) => {
    const q = query.toLowerCase();
    if (q.includes("service") || q.includes("work") || q.includes("website") || q.includes("develop") || q.includes("kya krte ho")) {
      return knowledgeBase.services;
    }
    if (q.includes("tech") || q.includes("stack") || q.includes("language") || q.includes("code") || q.includes("react") || q.includes("python")) {
      return knowledgeBase.tech;
    }
    if (q.includes("video") || q.includes("film") || q.includes("edit") || q.includes("premiere") || q.includes("camera")) {
      return knowledgeBase.films;
    }
    if (q.includes("location") || q.includes("where") || q.includes("kahan") || q.includes("time") || q.includes("timeline") || q.includes("sikar") || q.includes("rajasthan")) {
      return knowledgeBase.location;
    }
    if (q.includes("contact") || q.includes("hire") || q.includes("call") || q.includes("phone") || q.includes("whatsapp") || q.includes("number") || q.includes("book") || q.includes("price") || q.includes("cost") || q.includes("budget")) {
      return knowledgeBase.contact;
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("namaste")) {
      return "Hello! How can I assist you with your next web development or video editing project?";
    }
    return `Ajay specializes in high-converting websites and cinematic video editing. Would you like to check <a href="projects.html">25+ Live Demo Websites</a> or <a href="https://wa.me/919929562585" target="_blank">Chat with Ajay on WhatsApp</a>?`;
  };

  const handleUserQuery = (text, key = "") => {
    appendMsg(text, "user");
    const typing = showTyping();
    window.setTimeout(() => {
      typing.remove();
      const reply = key && knowledgeBase[key] ? knowledgeBase[key] : getSmartReply(text);
      appendMsg(reply, "bot", true);
    }, 450);
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

