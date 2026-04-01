import { escapeHtml } from "./utils.js";
import { getDefaultBranch, rewriteMarkdownImagePaths, rewriteHtmlAssetUrls } from "./github.js";

let readmePurifyHooked = false;

function ensureReadmePurifyHooks() {
  if (readmePurifyHooked || typeof DOMPurify === "undefined") return;
  readmePurifyHooked = true;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const src = node.getAttribute("src") || "";
    const ok =
      /^(https?:)?\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//i.test(src) ||
      /^https:\/\/player\.vimeo\.com\/video\//i.test(src);
    if (!ok) node.parentNode?.removeChild(node);
  });
}

function sanitizeReadmeHtml(html) {
  if (typeof DOMPurify === "undefined") return html;
  ensureReadmePurifyHooks();
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["video", "source", "iframe"],
    ADD_ATTR: [
      "controls",
      "preload",
      "playsinline",
      "poster",
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "title",
      "type",
      "src",
    ],
  });
}

function parseYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function enhanceReadmeMediaInContainer(root) {
  if (!root) return;
  const vidRe = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || !/^https?:\/\//i.test(href)) return;

    if (/youtube\.com\/watch|youtu\.be\//i.test(href)) {
      const id = parseYouTubeId(href);
      if (!id) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}`;
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("title", "Video");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );
      a.replaceWith(iframe);
      return;
    }

    if (!vidRe.test(href)) return;
    const v = document.createElement("video");
    v.className = "readme-media__video";
    v.controls = true;
    v.preload = "metadata";
    v.playsInline = true;
    const s = document.createElement("source");
    s.src = href;
    s.type = href.toLowerCase().includes(".webm") ? "video/webm" : "video/mp4";
    v.appendChild(s);
    a.replaceWith(v);
  });

  root.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || !vidRe.test(src)) return;
    const v = document.createElement("video");
    v.className = "readme-media__video";
    v.controls = true;
    v.preload = "metadata";
    v.playsInline = true;
    const s = document.createElement("source");
    s.src = src;
    s.type = "video/mp4";
    v.appendChild(s);
    img.replaceWith(v);
  });
}

export async function renderMarkdownToHtml(md, owner, repo, branch) {
  const br = branch || (await getDefaultBranch(owner, repo));
  let text = rewriteMarkdownImagePaths(md || "", owner, repo, br);

  if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
    return `<pre class="readme-sheet__fallback">${escapeHtml(text)}</pre>`;
  }
  try {
    let raw = marked.parse(text, { async: false });
    if (raw instanceof Promise) raw = await raw;
    let html = String(raw);
    html = rewriteHtmlAssetUrls(html, owner, repo, br);
    html = sanitizeReadmeHtml(html);
    return html;
  } catch {
    return `<pre class="readme-sheet__fallback">${escapeHtml(text)}</pre>`;
  }
}
