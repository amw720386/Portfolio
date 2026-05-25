/** Global cursor spotlight + per-tile gloss (throttled, respects reduced motion). */

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setGlobalCursor(root, x, y) {
  root.style.setProperty("--cursor-x", `${x}px`);
  root.style.setProperty("--cursor-y", `${y}px`);
  root.style.setProperty(
    "--cursor-x-pct",
    `${(x / Math.max(window.innerWidth, 1)) * 100}%`
  );
  root.style.setProperty(
    "--cursor-y-pct",
    `${(y / Math.max(window.innerHeight, 1)) * 100}%`
  );
}

function bindSpotlight(el) {
  let moveRaf = 0;
  el.addEventListener("mouseenter", () => el.classList.add("is-cursor-hover"));
  el.addEventListener("mouseleave", () => {
    el.classList.remove("is-cursor-hover");
    el.style.removeProperty("--spot-x");
    el.style.removeProperty("--spot-y");
    el.style.removeProperty("--tilt-x");
    el.style.removeProperty("--tilt-y");
  });
  el.addEventListener(
    "mousemove",
    (e) => {
      if (prefersReducedMotion()) return;
      if (moveRaf) return;
      moveRaf = requestAnimationFrame(() => {
        moveRaf = 0;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
        const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
        el.style.setProperty("--spot-x", `${x}%`);
        el.style.setProperty("--spot-y", `${y}%`);

        if (!el.classList.contains("tile")) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rotX = ((e.clientY - cy) / rect.height) * -2.5;
        const rotY = ((e.clientX - cx) / rect.width) * 2.5;
        el.style.setProperty("--tilt-x", `${rotX}deg`);
        el.style.setProperty("--tilt-y", `${rotY}deg`);
      });
    },
    { passive: true }
  );
}

export function initCursorEffects() {
  if (prefersReducedMotion()) return;

  const root = document.documentElement;
  let raf = 0;

  document.addEventListener(
    "mousemove",
    (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setGlobalCursor(root, e.clientX, e.clientY);
      });
    },
    { passive: true }
  );

  document
    .querySelectorAll("button.tile, a.tile, .theme-dot, .bubble-btn")
    .forEach(bindSpotlight);
}
