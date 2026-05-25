/** Hover decode scramble for tile typography (one rAF loop per tile). */

const GLYPHS = "01ABCDEFabcdef@#$%&*\\/|<>.:;_-";
const DECODE_SEL =
  ".tile__greeting, .tile__tagline, .tile__heading, .tile__blurb, .tile__tag, .tile__mini-label, .tile--live-commit__repo, .tile--live-commit__msg";

const active = new WeakMap();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cacheTarget(el) {
  if (!el.dataset.decodeText) {
    el.dataset.decodeText = el.textContent || "";
  }
  return el.dataset.decodeText;
}

function scrambleFrame(target, progress) {
  const len = target.length;
  const resolved = Math.floor(progress * len);
  let out = "";
  for (let i = 0; i < len; i++) {
    const ch = target[i];
    if (ch === "\n") {
      out += ch;
      continue;
    }
    if (i < resolved) {
      out += ch;
    } else if (ch === " ") {
      out += " ";
    } else {
      out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
  }
  return out;
}

function runDecode(tile) {
  const els = [...tile.querySelectorAll(DECODE_SEL)].filter(
    (el) => (el.textContent || "").trim().length > 0
  );
  if (!els.length) return;

  const targets = els.map((el) => cacheTarget(el));
  const duration = 380;
  const start = performance.now();
  let raf = 0;

  const prev = active.get(tile);
  if (prev?.cancel) prev.cancel();

  tile.classList.add("is-decoding");

  const state = {
    cancel() {
      if (raf) cancelAnimationFrame(raf);
      tile.classList.remove("is-decoding");
    },
  };
  active.set(tile, state);

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const progress = 1 - (1 - t) ** 3;

    for (let i = 0; i < els.length; i++) {
      els[i].textContent =
        progress >= 1 ? targets[i] : scrambleFrame(targets[i], progress);
    }

    if (t < 1) {
      raf = requestAnimationFrame(frame);
    } else {
      for (let i = 0; i < els.length; i++) els[i].textContent = targets[i];
      tile.classList.remove("is-decoding");
      if (active.get(tile) === state) active.delete(tile);
    }
  }

  raf = requestAnimationFrame(frame);
}

function restoreTile(tile) {
  const prev = active.get(tile);
  if (prev?.cancel) prev.cancel();
  active.delete(tile);
  tile.classList.remove("is-decoding");
  tile.querySelectorAll(DECODE_SEL).forEach((el) => {
    if (el.dataset.decodeText) el.textContent = el.dataset.decodeText;
  });
}

export function initTextDecodeHover() {
  if (prefersReducedMotion()) return;

  const tiles = document.querySelectorAll(
    "button.tile, a.tile, section.tile, .tile--live-commit"
  );

  tiles.forEach((tile) => {
    tile.addEventListener("mouseenter", () => runDecode(tile), { passive: true });
    tile.addEventListener("mouseleave", () => restoreTile(tile), { passive: true });
  });
}
