import { GITHUB_USER, GH_HEADERS } from "./config.js";

const repoBranchCache = new Map();
export const readmeCache = new Map();

export async function getDefaultBranch(owner, repo) {
  const key = `${owner}/${repo}`.toLowerCase();
  if (repoBranchCache.has(key)) return repoBranchCache.get(key);
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: GH_HEADERS });
    if (!res.ok) {
      repoBranchCache.set(key, "main");
      return "main";
    }
    const data = await res.json();
    const b = data.default_branch || "main";
    repoBranchCache.set(key, b);
    return b;
  } catch {
    repoBranchCache.set(key, "main");
    return "main";
  }
}

export function rewriteMarkdownImagePaths(md, owner, repo, branch) {
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, path) => {
    const p = path.trim();
    if (/^https?:\/\//i.test(p)) return full;
    const clean = p.replace(/^\.\//, "").replace(/^\//, "");
    return `![${alt}](${base}${clean})`;
  });
}

export function rewriteHtmlAssetUrls(html, owner, repo, branch) {
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  return html
    .replace(/<img([^>]*?)\ssrc="([^"]+)"/gi, (m, pre, src) => {
      if (/^https?:\/\//i.test(src)) return m;
      const clean = src.replace(/^\//, "");
      return `<img${pre} src="${base}${clean}"`;
    })
    .replace(/<img([^>]*?)\ssrc='([^']+)'/gi, (m, pre, src) => {
      if (/^https?:\/\//i.test(src)) return m;
      const clean = src.replace(/^\//, "");
      return `<img${pre} src='${base}${clean}'`;
    });
}

export function decodeReadmeBase64(b64) {
  const clean = String(b64).replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

export async function fetchReadmeRaw(owner, repoName) {
  const url = `https://api.github.com/repos/${owner}/${repoName}/readme`;
  try {
    const res = await fetch(url, { headers: GH_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return decodeReadmeBase64(data.content);
  } catch {
    return null;
  }
}

function excerptFromReadme(md) {
  let t = String(md)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+.*/gm, " ")
    .replace(/^\s*[-*+]\s.*/gm, " ")
    .replace(/^\s*\d+\.\s.*/gm, " ")
    .replace(/[*_]{1,3}/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (t.length > 300) {
    t = t.slice(0, 300);
    const cut = Math.max(t.lastIndexOf(". "), t.lastIndexOf("? "), t.lastIndexOf("! "));
    if (cut > 100) t = t.slice(0, cut + 1).trim();
    else t = t.trimEnd() + "…";
  }
  return t || null;
}

export async function fetchReadmeExcerpt(owner, repoName) {
  const raw = await fetchReadmeRaw(owner, repoName);
  if (!raw) return null;
  return excerptFromReadme(raw);
}
