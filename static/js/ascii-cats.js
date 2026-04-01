import { normalizeAscii, prefersReducedMotion } from "./utils.js";

const FALLBACK_CAT_ASCII = [
  " /\\_/\\\n( o.o )\n > ^ <",
  " |\\__/\n |   w    purrr\n  \\____",
  "    |\\__/|\n   /     \\\n  |  o  o  |\n   \\  ~  /\n    -----",
  "  ^~^\n ( o o)\n  > ^ <",
  "    ∩∩\n   (´･ω･`)\n    U U",
  "  ♪  ∧＿∧\n    (  ´∀`)σ\n    /     ノ",
  "     .｡*ﾟ+.*.｡\n      ﾟ｡(っ◕‿◕)っ\n        ''''",
  "       |\n   /|／￣ﾉ\n  ﾉﾉ―､―､'",
];

let asciiCatsModulePromise = null;

function loadAsciiCatsModule() {
  if (!asciiCatsModulePromise) {
    asciiCatsModulePromise = import("https://esm.sh/ascii-cats@1.1.1")
      .then((m) => m.default ?? m)
      .catch(() => null);
  }
  return asciiCatsModulePromise;
}

function asciiFromPackage(mod) {
  if (!mod) return null;
  if (typeof mod === "function") {
    try {
      const r = mod();
      const s = typeof r === "string" ? r : r != null ? String(r) : "";
      const n = normalizeAscii(s);
      return n || null;
    } catch {
      return null;
    }
  }
  if (typeof mod.random === "function") {
    try {
      return normalizeAscii(String(mod.random())) || null;
    } catch {
      return null;
    }
  }
  if (Array.isArray(mod) && mod.length) {
    return normalizeAscii(String(mod[Math.floor(Math.random() * mod.length)])) || null;
  }
  return null;
}

async function pickCatAscii() {
  const mod = await loadAsciiCatsModule();
  const fromPkg = asciiFromPackage(mod);
  if (fromPkg) return fromPkg;
  return FALLBACK_CAT_ASCII[Math.floor(Math.random() * FALLBACK_CAT_ASCII.length)];
}

const ASCII_MODAL_ENTER_CLASSES = [
  "ascii-modal__card--enter-pop",
  "ascii-modal__card--enter-swing",
  "ascii-modal__card--enter-flip",
  "ascii-modal__card--enter-bounce",
];

let asciiModalOpen = false;
let asciiModalResizeObs = null;
let asciiModalEatNextClick = false;

export function isAsciiModalOpen() {
  return asciiModalOpen;
}

function fitAsciiModalPre(pre, wrap) {
  if (!pre || !wrap) return;
  const minPx = 5.25;
  pre.style.removeProperty("font-size");
  const cs = window.getComputedStyle(pre);
  let px = parseFloat(cs.fontSize) || 12;
  let guard = 48;
  while (guard-- > 0) {
    pre.style.fontSize = `${px}px`;
    const w = pre.scrollWidth - wrap.clientWidth;
    const h = pre.scrollHeight - wrap.clientHeight;
    if (w <= 1 && h <= 1) break;
    px -= 0.4;
    if (px < minPx) {
      pre.style.fontSize = `${minPx}px`;
      break;
    }
  }
}

export function closeAsciiModalImmediate() {
  const modal = document.getElementById("ascii-modal");
  const card = document.getElementById("ascii-modal-card");
  const pre = document.getElementById("ascii-modal-pre");
  if (!modal || !asciiModalOpen) return;
  asciiModalOpen = false;
  modal.classList.remove("ascii-modal--open");
  ASCII_MODAL_ENTER_CLASSES.forEach((c) => card?.classList.remove(c));
  if (pre) pre.style.removeProperty("font-size");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  asciiModalResizeObs?.disconnect();
  asciiModalResizeObs = null;
}

function openAsciiModal(rawText) {
  const modal = document.getElementById("ascii-modal");
  const card = document.getElementById("ascii-modal-card");
  const wrap = document.getElementById("ascii-modal-pre-wrap");
  const pre = document.getElementById("ascii-modal-pre");
  if (!modal || !card || !wrap || !pre) return;

  pre.textContent = normalizeAscii(rawText);
  ASCII_MODAL_ENTER_CLASSES.forEach((c) => card.classList.remove(c));
  if (!prefersReducedMotion()) {
    card.classList.add(
      ASCII_MODAL_ENTER_CLASSES[Math.floor(Math.random() * ASCII_MODAL_ENTER_CLASSES.length)]
    );
  }

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  asciiModalOpen = true;

  if (typeof ResizeObserver !== "undefined") {
    asciiModalResizeObs?.disconnect();
    asciiModalResizeObs = new ResizeObserver(() => {
      if (asciiModalOpen) fitAsciiModalPre(pre, wrap);
    });
    asciiModalResizeObs.observe(wrap);
  }

  requestAnimationFrame(() => {
    modal.classList.add("ascii-modal--open");
    requestAnimationFrame(() => {
      fitAsciiModalPre(pre, wrap);
    });
  });
}

function onAsciiModalOutsidePointerDown(e) {
  if (!asciiModalOpen) return;
  const card = document.getElementById("ascii-modal-card");
  if (!card || card.contains(e.target)) return;
  asciiModalEatNextClick = true;
  window.setTimeout(() => {
    asciiModalEatNextClick = false;
  }, 400);
  e.preventDefault();
  e.stopPropagation();
  closeAsciiModalImmediate();
}

function onAsciiModalSuppressOrphanClick(e) {
  if (!asciiModalEatNextClick) return;
  asciiModalEatNextClick = false;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

async function runCatBoop() {
  const tile = document.getElementById("cat-boop-tile");
  tile?.classList.add("is-boop");
  window.setTimeout(() => tile?.classList.remove("is-boop"), 420);

  const ascii = await pickCatAscii();
  openAsciiModal(ascii);
}

export async function initTileAsciiPreview() {
  const el = document.getElementById("tile-ascii-preview");
  if (!el) return;
  try {
    const full = normalizeAscii(await pickCatAscii());
    const lines = full.split("\n");
    el.textContent = lines.slice(0, 6).join("\n");
  } catch {
    el.textContent = normalizeAscii(FALLBACK_CAT_ASCII[0]).split("\n").slice(0, 6).join("\n");
  }
}

export function initCatBoop() {
  const tile = document.getElementById("cat-boop-tile");
  tile?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    void runCatBoop();
  });
  document.addEventListener("pointerdown", onAsciiModalOutsidePointerDown, true);
  document.addEventListener("click", onAsciiModalSuppressOrphanClick, true);
}
