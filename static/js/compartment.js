import { GITHUB_USER, INTERACTIVE_PORTFOLIO_URL } from "./config.js";
import { prefersReducedMotion } from "./utils.js";
import { readmeCache, fetchReadmeRaw, getDefaultBranch } from "./github.js";
import { renderMarkdownToHtml, enhanceReadmeMediaInContainer } from "./markdown.js";
import { loadRepos } from "./repos.js";

let compartmentOpen = false;
let interactiveRedirectTimer = null;
let interactiveFloodListener = null;

export function isCompartmentOpen() {
  return compartmentOpen;
}

function clearInteractiveRedirect() {
  window.clearTimeout(interactiveRedirectTimer);
  interactiveRedirectTimer = null;
  const flood = document.getElementById("compartment-flood");
  if (flood && interactiveFloodListener) {
    flood.removeEventListener("transitionend", interactiveFloodListener);
    interactiveFloodListener = null;
  }
}

function scheduleInteractiveRedirect() {
  clearInteractiveRedirect();
  const compartment = document.getElementById("compartment");
  const flood = document.getElementById("compartment-flood");

  const go = () => {
    clearInteractiveRedirect();
    window.location.assign(INTERACTIVE_PORTFOLIO_URL);
  };

  if (prefersReducedMotion()) {
    interactiveRedirectTimer = window.setTimeout(go, 320);
    return;
  }

  interactiveFloodListener = (e) => {
    if (e.propertyName !== "clip-path") return;
    if (!compartment?.classList.contains("is-open")) return;
    flood?.removeEventListener("transitionend", interactiveFloodListener);
    interactiveFloodListener = null;
    window.setTimeout(go, 100);
  };

  flood?.addEventListener("transitionend", interactiveFloodListener);
  interactiveRedirectTimer = window.setTimeout(go, 1400);
}

function setCompartmentOrigin(el) {
  const compartment = document.getElementById("compartment");
  if (!compartment || !el) return;
  const cRect = compartment.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const w = cRect.width || 1;
  const h = cRect.height || 1;
  const ox = ((rect.left + rect.width / 2 - cRect.left) / w) * 100;
  const oy = ((rect.top + rect.height / 2 - cRect.top) / h) * 100;
  compartment.style.setProperty("--ox", `${Math.max(0, Math.min(100, ox))}%`);
  compartment.style.setProperty("--oy", `${Math.max(0, Math.min(100, oy))}%`);
}

function mountResumeIframe() {
  const iframe = document.querySelector(".resume-embed[data-resume-src]");
  if (!iframe) return;
  const src = iframe.getAttribute("data-resume-src");
  if (!src) return;
  const cur = iframe.getAttribute("src") || "";
  if (cur === "about:blank" || cur === "") {
    iframe.setAttribute("src", src);
  }
}

function showSheet(id) {
  document.querySelectorAll(".compartment__sheet").forEach((s) => {
    const match = s.getAttribute("data-sheet") === id;
    s.hidden = !match;
  });
  const titleId = `compartment-title-${id}`;
  const panel = document.getElementById("compartment-panel");
  if (panel && document.getElementById(titleId)) {
    panel.setAttribute("aria-labelledby", titleId);
  }
  if (id === "repos") void loadRepos();
  if (id === "resume") mountResumeIframe();
}

async function ensureFeaturedReadmeRendered(sheetId) {
  const repo = sheetId === "internflow" ? "InternFlow" : sheetId === "reelreddit" ? "ReelReddit" : null;
  if (!repo) return;
  const el = document.querySelector(`[data-readme-body="${repo}"]`);
  if (!el || el.dataset.rendered === "1") return;

  el.setAttribute("aria-busy", "true");
  el.innerHTML = "<p class=\"compartment__loading\">Loading README…</p>";

  let md = readmeCache.has(repo) ? readmeCache.get(repo) : await fetchReadmeRaw(GITHUB_USER, repo);
  readmeCache.set(repo, md);

  if (!md) {
    el.innerHTML = "<p>Couldn't load README from GitHub.</p>";
    el.removeAttribute("aria-busy");
    return;
  }

  const br = await getDefaultBranch(GITHUB_USER, repo);
  el.innerHTML = await renderMarkdownToHtml(md, GITHUB_USER, repo, br);
  enhanceReadmeMediaInContainer(el);
  el.dataset.rendered = "1";
  el.removeAttribute("aria-busy");
}

function openCompartment(sheetId, originEl) {
  const compartment = document.getElementById("compartment");
  const stage = document.getElementById("bento-stage");
  const closeBtn = document.getElementById("compartment-close");
  if (!compartment) return;

  clearInteractiveRedirect();
  stage?.classList.add("bento-stage--open");

  compartment.hidden = false;
  compartment.setAttribute("aria-hidden", "false");
  document.body.classList.add("compartment-open");
  document.documentElement.classList.add("compartment-open");
  compartmentOpen = true;

  requestAnimationFrame(() => {
    setCompartmentOrigin(originEl);
    showSheet(sheetId);
    void ensureFeaturedReadmeRendered(sheetId);
    if (sheetId === "interactive") {
      scheduleInteractiveRedirect();
    }
    requestAnimationFrame(() => {
      compartment.classList.remove("is-closing");
      compartment.classList.add("is-open");
    });
    closeBtn?.focus();
  });
}

export function closeCompartment() {
  const compartment = document.getElementById("compartment");
  if (!compartment || !compartmentOpen) return;

  clearInteractiveRedirect();
  compartment.classList.remove("is-open");
  compartment.classList.add("is-closing");

  const flood = document.getElementById("compartment-flood");
  const stage = document.getElementById("bento-stage");
  let safetyId = 0;
  let floodHandler = null;

  const finish = () => {
    window.clearTimeout(safetyId);
    if (floodHandler && flood) flood.removeEventListener("transitionend", floodHandler);
    floodHandler = null;
    compartment.hidden = true;
    compartment.setAttribute("aria-hidden", "true");
    compartment.classList.remove("is-closing", "is-open");
    stage?.classList.remove("bento-stage--open");
    document.body.classList.remove("compartment-open");
    document.documentElement.classList.remove("compartment-open");
    compartmentOpen = false;
    document.querySelectorAll(".compartment__sheet").forEach((s) => {
      s.hidden = true;
    });
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }

  floodHandler = (e) => {
    if (e.propertyName !== "clip-path") return;
    finish();
  };

  safetyId = window.setTimeout(finish, 900);
  if (flood) flood.addEventListener("transitionend", floodHandler);
  else finish();
}

export function initCompartment() {
  const triggers = document.querySelectorAll("[data-open]");
  const closeBtn = document.getElementById("compartment-close");

  triggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      const id = el.getAttribute("data-open");
      if (!id) return;
      e.preventDefault();
      openCompartment(id, el);
    });
  });

  closeBtn?.addEventListener("click", () => closeCompartment());
}

export async function primeFeaturedReadmeCache() {
  for (const name of ["InternFlow", "ReelReddit"]) {
    if (readmeCache.has(name)) continue;
    const raw = await fetchReadmeRaw(GITHUB_USER, name);
    readmeCache.set(name, raw);
  }
}
