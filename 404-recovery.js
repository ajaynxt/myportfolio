(() => {
  "use strict";
  const path = document.querySelector("[data-missing-path]");
  if (path) {
    let value = window.location.pathname;
    try { value = decodeURIComponent(value); } catch {}
    path.textContent = value.length > 180 ? value.slice(0, 177) + "…" : value;
  }
  const search = document.querySelector("[data-page-search]");
  const links = [...document.querySelectorAll("[data-recovery-link]")];
  const status = document.querySelector("[data-search-status]");
  if (search && status) {
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      for (const link of links) {
        const haystack = (link.textContent + " " + link.dataset.recoveryLink).toLowerCase();
        link.hidden = !query.split(/\s+/).every(word => haystack.includes(word));
        if (!link.hidden) visible++;
      }
      status.textContent = query ? (visible ? visible + (visible === 1 ? " page found." : " pages found.") : "No matching pages. Try another word or return home.") : "";
    };
    search.addEventListener("input", filter);
  }
  const scene = document.querySelector("[data-scene]");
  const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (scene) {
    const reset = () => { scene.style.removeProperty("--rx"); scene.style.removeProperty("--ry"); };
    scene.addEventListener("pointermove", event => {
      if (!motion.matches) return;
      const rect = scene.getBoundingClientRect();
      scene.style.setProperty("--rx", ((0.5 - (event.clientY - rect.top) / rect.height) * 10).toFixed(2) + "deg");
      scene.style.setProperty("--ry", (((event.clientX - rect.left) / rect.width - 0.5) * 12).toFixed(2) + "deg");
    });
    scene.addEventListener("pointerleave", reset);
    motion.addEventListener?.("change", reset);
  }
})();
