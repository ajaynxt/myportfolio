import { firebaseReady, db, collection, getDocs, query, where } from "./firebase-client.js";

const grid = document.getElementById("design-grid");
const emptyState = document.getElementById("empty-state");
const count = document.getElementById("result-count");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav-links");
let designs = [];
let activeFilter = "All";
let searchEventSent = false;
const seen = new Set();

const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

const safeImage = (value) => {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
};

function requestUrl(item) {
  const message = `Hi AJAYNXT, I saw the "${item.title}" design on your showcase. Please share the prompt and details for this design.`;
  return "https://wa.me/919929562585?text=" + encodeURIComponent(message);
}

function trackImpressions() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const id = card.dataset.designId;
      if (id && !seen.has(id)) {
        seen.add(id);
        window.trackAJAYNXT?.("showcase_design_view", {
          design_id: id,
          design_category: card.dataset.category || "unknown",
          industry: card.dataset.industry || "unknown"
        });
      }
      observer.unobserve(card);
    });
  }, { threshold: 0.45 });
  grid.querySelectorAll(".design-card").forEach((card) => observer.observe(card));
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const sort = sortSelect.value;
  const filtered = designs.filter((item) => {
    const typeOk = activeFilter === "All" || item.category === activeFilter;
    const text = [item.title,item.summary,item.industry,item.category].join(" ").toLowerCase();
    return typeOk && text.includes(term);
  });

  filtered.sort((a,b) => {
    if (sort === "featured" && Boolean(a.featured) !== Boolean(b.featured)) return Number(Boolean(b.featured))-Number(Boolean(a.featured));
    if (sort === "newest") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    if (sort === "oldest") return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    if (sort === "az") return a.title.localeCompare(b.title);
    return (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) || a.title.localeCompare(b.title);
  });

  count.textContent = `${filtered.length} DESIGN ${filtered.length === 1 ? "CONCEPT" : "CONCEPTS"}`;
  grid.innerHTML = "";
  emptyState.hidden = filtered.length !== 0;

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "design-card";
    card.dataset.designId = item.id;
    card.dataset.category = item.category;
    card.dataset.industry = item.industry || "General";
    const image = safeImage(item.imageUrl);
    card.innerHTML = `
      <div class="visual">
        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)} design preview" loading="lazy" decoding="async">` : '<div class="visual-placeholder" aria-label="Preview image not set">AJAYNXT / VISUAL</div>'}
        <span class="visual-badge">${escapeHTML(item.category)}</span>
        ${item.featured ? '<span class="visual-featured">FEATURED</span>' : ""}
      </div>
      <div class="card-content">
        <div class="card-meta"><span>${escapeHTML(item.industry || "Design concept")}</span><span>AJAYNXT LIBRARY</span></div>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.summary || "A design concept from the AJAYNXT visual library.")}</p>
        <div class="card-actions"><span class="industry">${escapeHTML(item.category)}</span>
          <a class="request-link" data-showcase-request data-design-id="${escapeHTML(item.id)}" data-design-category="${escapeHTML(item.category)}" href="${requestUrl(item)}" target="_blank" rel="noopener noreferrer">Message for prompt <span>↗</span></a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  trackImpressions();
}

async function init() {
  if (!firebaseReady) {
    count.textContent = "SHOWCASE SETUP REQUIRED";
    grid.innerHTML = '<div class="error-state">The Firebase project details have not been added yet. Once configured, published design previews will appear here.</div>';
    emptyState.hidden = true;
    return;
  }
  try {
    const snapshot = await getDocs(query(collection(db, "showcase_public"), where("active", "==", true)));
    designs = snapshot.docs.map((item) => ({ id:item.id, ...item.data() }));
    render();
  } catch (error) {
    console.error("[AJAYNXT Showcase]", error);
    count.textContent = "SHOWCASE TEMPORARILY UNAVAILABLE";
    grid.innerHTML = '<div class="error-state">The visual library could not be loaded. Please try again later or contact AJAYNXT on WhatsApp.</div>';
    emptyState.hidden = true;
  }
}

filterButtons.forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach((item) => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  window.trackAJAYNXT?.("showcase_filter", { design_category: activeFilter });
  render();
}));
searchInput.addEventListener("input", () => {
  const hasQuery = Boolean(searchInput.value.trim());
  if (hasQuery && !searchEventSent) {
    window.trackAJAYNXT?.("showcase_search", { search_used: true });
    searchEventSent = true;
  }
  if (!hasQuery) searchEventSent = false;
  render();
});
sortSelect.addEventListener("change", render);
menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

init();
