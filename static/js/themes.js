import { THEME_STORAGE_KEY } from "./config.js";

export function initThemes() {
  const dots = document.querySelectorAll(".theme-dot");
  const root = document.documentElement;

  function syncPressed(theme) {
    dots.forEach((d) => {
      const t = d.getAttribute("data-theme");
      d.setAttribute("aria-pressed", t === theme ? "true" : "false");
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const t = dot.getAttribute("data-theme") || "default";
      root.setAttribute("data-theme", t);
      syncPressed(t);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, t);
      } catch {
        /* ignore */
      }
    });
  });

  let initial = root.getAttribute("data-theme") || "default";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && ["default", "green", "blue", "mono"].includes(saved)) {
      initial = saved;
      root.setAttribute("data-theme", saved);
    }
  } catch {
    /* ignore */
  }
  syncPressed(initial);
}
