import { GITHUB_USER } from "./config.js";
import { prefersReducedMotion } from "./utils.js";
import { readmeCache, fetchReadmeRaw, getDefaultBranch } from "./github.js";
import { renderMarkdownToHtml, enhanceReadmeMediaInContainer } from "./markdown.js";

export function isReadmeSheetOpen() {
  const sheet = document.getElementById("readme-sheet");
  return sheet && !sheet.hidden;
}

export async function openReadmeSheet(repoName) {
  const sheet = document.getElementById("readme-sheet");
  const titleEl = document.getElementById("readme-sheet-title");
  const contentEl = document.getElementById("readme-sheet-content");
  if (!sheet || !titleEl || !contentEl) return;

  titleEl.textContent = repoName;
  contentEl.innerHTML = "<p>Loading…</p>";

  let md = readmeCache.has(repoName) ? readmeCache.get(repoName) : await fetchReadmeRaw(GITHUB_USER, repoName);
  readmeCache.set(repoName, md);

  if (!md) {
    contentEl.innerHTML = "<p>No README found for this repository.</p>";
  } else {
    const br = await getDefaultBranch(GITHUB_USER, repoName);
    contentEl.innerHTML = await renderMarkdownToHtml(md, GITHUB_USER, repoName, br);
    enhanceReadmeMediaInContainer(contentEl);
  }

  sheet.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => sheet.classList.add("is-open"));
  document.getElementById("readme-sheet-close")?.focus();
}

export function closeReadmeSheet() {
  const sheet = document.getElementById("readme-sheet");
  const contentEl = document.getElementById("readme-sheet-content");
  if (!sheet) return;
  sheet.classList.remove("is-open");
  const onEnd = (e) => {
    if (e.propertyName !== "transform") return;
    sheet.removeEventListener("transitionend", onEnd);
    sheet.hidden = true;
    sheet.setAttribute("aria-hidden", "true");
    if (contentEl) contentEl.innerHTML = "";
  };
  sheet.addEventListener("transitionend", onEnd);
  if (prefersReducedMotion()) {
    sheet.removeEventListener("transitionend", onEnd);
    sheet.hidden = true;
    sheet.setAttribute("aria-hidden", "true");
    if (contentEl) contentEl.innerHTML = "";
  }
}

export function initReadmeSheet() {
  const closeBtn = document.getElementById("readme-sheet-close");
  const backdrop = document.getElementById("readme-sheet-backdrop");

  closeBtn?.addEventListener("click", closeReadmeSheet);
  backdrop?.addEventListener("click", closeReadmeSheet);
}
