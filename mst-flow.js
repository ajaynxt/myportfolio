(() => {
  "use strict";
  const root = document.documentElement;
  const body = document.body;
  if (!body || body.dataset.mstPremium === "1") return;
  body.dataset.mstPremium = "1";
  body.classList.add("mst-shell");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Flow-field canvas: lightweight ambient motion, no video request/network dependency.
  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const canvas = document.createElement("canvas");
    canvas.className = "mst-flow-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const wash = document.createElement("div");
    wash.className = "mst-flow-wash";
    wash.setAttribute("aria-hidden", "true");
    const grain = document.createElement("div");
    grain.className = "mst-film-grain";
    grain.setAttribute("aria-hidden", "true");
    hero.prepend(canvas, wash, grain);

    const ctx = canvas.getContext("2d", { alpha: true });
    const blobs = [
      { x: .70, y: .31, r: .19, hue: 348, phase: .2 },
      { x: .82, y: .63, r: .17, hue: 8, phase: 2.6 },
      { x: .56, y: .78, r: .14, hue: 38, phase: 4.1 }
    ];
    let w = 0, h = 0, dpr = 1, raf = 0;

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.00016;
      blobs.forEach((b, i) => {
        const x = (b.x + Math.sin(t * (1.2 + i*.11) + b.phase) * .045) * w;
        const y = (b.y + Math.cos(t * (1.05 + i*.09) + b.phase) * .06) * h;
        const r = b.r * Math.min(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const alpha = i === 0 ? .11 : .075;
        g.addColorStop(0, `hsla(${b.hue},72%,60%,${alpha})`);
        g.addColorStop(.48, `hsla(${b.hue},72%,60%,${alpha*.42})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // A soft flowing ribbon made from quadratic curves.
      ctx.save();
      ctx.globalAlpha = .075;
      ctx.lineWidth = Math.max(1, Math.min(2, w / 900));
      ctx.strokeStyle = "#9f2638";
      for (let k = 0; k < 3; k++) {
        const base = h * (.30 + k*.17);
        ctx.beginPath();
        ctx.moveTo(-40, base);
        for (let x = 0; x <= w + 80; x += Math.max(80, w/9)) {
          const wobble = Math.sin(t * (1.2 + k*.18) + x*.008 + k) * (18 + k*8);
          const y = base + wobble;
          const mid = x + Math.max(40, w/18);
          ctx.quadraticCurveTo(mid - 18, y - 24, mid, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(draw);
    window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
  }

  // Pointer parallax for the portrait stage.
  if (hero && !reduce && window.matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      hero.style.setProperty("--mst-parallax-x", `${x * 7}px`);
      hero.style.setProperty("--mst-parallax-y", `${y * 5}px`);
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--mst-parallax-x", "0px");
      hero.style.setProperty("--mst-parallax-y", "0px");
    });
  }

  // Cursor-position spotlight for grids.
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".project-card, .service-card, .process-list li").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mst-x", `${event.clientX - r.left}px`);
        card.style.setProperty("--mst-y", `${event.clientY - r.top}px`);
      });
    });
  }

  // Magnetic feel on primary CTAs, restrained for touch and accessibility.
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".hero-actions .button, .view-more .button, .booking-form .button, .archive-cta .button, .three-page .btn").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const r = button.getBoundingClientRect();
        const dx = (event.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (event.clientY - (r.top + r.height / 2)) / r.height;
        button.style.transform = `translate3d(${dx * 6}px,${dy * 5}px,0)`;
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }

  /* ==========================================================================
     1. Live Indian Standard Time (IST) Clock (Dennis Snellenberg style)
     ========================================================================== */
  const clockEls = document.querySelectorAll("[data-live-clock]");
  if (clockEls.length > 0) {
    const updateLiveClock = () => {
      try {
        const now = new Date();
        const istFormatter = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        const formatted = istFormatter.format(now) + " IST";
        clockEls.forEach((el) => { el.textContent = formatted; });
      } catch (e) {
        // Fallback for older browsers
        const now = new Date();
        clockEls.forEach((el) => { el.textContent = now.toLocaleTimeString() + " IST"; });
      }
    };
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
  }

  /* ==========================================================================
     2. Award-Winning Custom Magnetic Cursor (Dennis Snellenberg / Olivier Larose)
     ========================================================================== */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dot = document.createElement("div");
    dot.className = "mst-cursor-dot";
    dot.setAttribute("aria-hidden", "true");

    const ring = document.createElement("div");
    ring.className = "mst-cursor-ring";
    ring.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "mst-cursor-label";
    ring.appendChild(label);

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isVisible = false;

    window.addEventListener("pointermove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      isVisible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });

    // Smooth lerp loop for outer ring
    const renderCursor = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.22;
        ringY += (mouseY - ringY) * 0.22;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Contextual Hover Detection
    document.addEventListener("pointerover", (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const projectCard = target.closest(".project-card");
      const filmCard = target.closest(".film-card");
      const clickable = target.closest("a, button, [data-menu-toggle], [data-role-toggle], input[type='submit']");

      if (projectCard) {
        document.body.classList.add("cursor-preview");
        document.body.classList.remove("cursor-hover");
        label.textContent = "VIEW ↗";
      } else if (filmCard) {
        document.body.classList.add("cursor-preview");
        document.body.classList.remove("cursor-hover");
        label.textContent = "PLAY ▶";
      } else if (clickable) {
        document.body.classList.add("cursor-hover");
        document.body.classList.remove("cursor-preview");
      } else {
        document.body.classList.remove("cursor-hover", "cursor-preview");
      }
    }, { passive: true });
  }

  /* ==========================================================================
     3. Emil Kowalski Style Micro-Toast & Smart Clipboard Copy
     ========================================================================== */
  const toast = document.createElement("div");
  toast.className = "mst-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `<span class="mst-toast-icon">✓</span> <span class="mst-toast-msg">Copied to clipboard!</span>`;
  document.body.appendChild(toast);

  let toastTimer = null;
  const showToast = (message) => {
    const msgEl = toast.querySelector(".mst-toast-msg");
    if (msgEl) msgEl.textContent = message;
    toast.classList.add("is-active");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-active");
    }, 2400);
  };

  // One-click clipboard copy for email / telephone links
  document.querySelectorAll("a[href^='mailto:'], a[href^='tel:'], .social-card.email").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      let copyValue = "";
      if (href.startsWith("mailto:")) {
        copyValue = href.replace("mailto:", "").trim();
      } else if (href.startsWith("tel:")) {
        copyValue = href.replace("tel:", "").trim();
      }
      if (copyValue && navigator.clipboard) {
        navigator.clipboard.writeText(copyValue).then(() => {
          showToast(`Copied ${copyValue} to clipboard! 📋`);
        }).catch(() => {});
      }
    });
  });

  /* ==========================================================================
     4. Bruno Simon Global Keyboard Navigation (Desktop Power Users)
     ========================================================================== */
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }
    const key = e.key.toLowerCase();
    if (key === "p") {
      if (!window.location.pathname.includes("projects.html")) {
        showToast("Navigating to Projects... [P]");
        window.location.href = "projects.html";
      }
    } else if (key === "3") {
      if (!window.location.pathname.includes("3d.html")) {
        showToast("Entering 3D World... [3]");
        window.location.href = "3d.html";
      }
    } else if (key === "h") {
      if (window.location.pathname.includes("projects.html") || window.location.pathname.includes("3d.html")) {
        showToast("Navigating Home... [H]");
        window.location.href = "index.html";
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (key === "w") {
      showToast("Opening WhatsApp... [W]");
      window.open("https://wa.me/919929562585", "_blank");
    } else if (key === "t") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
})();
