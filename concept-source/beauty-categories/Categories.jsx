import React, { useEffect, useRef, useState } from "react";
import "./categories.css";

const categories = [
  { name: "face", video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203023_87a26602-2898-4acc-a396-c7a2b5ad84fd.mp4" },
  { name: "beauty tools", video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203415_b86e3f19-2aec-46cd-9a86-b64c40118e38.mp4" },
  { name: "body", video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203051_85fee398-ea01-4aa0-972b-137a74213be5.mp4" }
];

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) { setIsVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setIsVisible(true);
        observer.unobserve(node);
      }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

function CategoryVideo({ url }) {
  const video = useRef(null);
  useEffect(() => {
    const node = video.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    function sync() {
      if (reduced.matches || document.hidden || !inView) node.pause();
      else node.play().catch(() => {});
    }
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); })
      : null;
    observer?.observe(node);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer?.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      node.pause();
    };
  }, []);
  return React.createElement("video", { ref: video, src: url, autoPlay: true, loop: true, muted: true, playsInline: true, preload: "metadata", "aria-hidden": true, className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" });
}

export default function Categories({ onShop }) {
  const { ref, isVisible } = useInView(0.1);
  const h = React.createElement;
  return h("section", { id: "categories", "aria-label": "Beauty categories", className: "categories bg-white text-white min-h-screen flex flex-col justify-center w-full" },
    h("div", { ref, className: "category-grid grid grid-cols-1 md:grid-cols-3 transition-all duration-1000 ease-out " + (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12") },
      categories.map((category, index) => h("article", {
        key: category.name, className: "category-card group relative flex flex-col justify-between items-start p-6 sm:p-8 md:p-12 min-h-[400px] sm:min-h-[500px] md:min-h-[750px] overflow-hidden transition-all duration-1000 ease-out " + (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"),
        style: { transitionDelay: index * 150 + "ms" }
      },
        h(CategoryVideo, { url: category.video }),
        h("div", { className: "category-overlay absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500", "aria-hidden": true }),
        h("h2", { className: "category-name relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium group-hover:-translate-y-2 transition-transform duration-500", style: { writingMode: "vertical-lr", transform: "rotate(180deg)" } }, category.name),
        h("button", { type: "button", className: "btn-primary relative z-10 mt-auto px-8 py-3 bg-white text-black rounded-full text-sm", onClick: () => onShop?.(category.name) }, "shop " + category.name)
      ))
    )
  );
}