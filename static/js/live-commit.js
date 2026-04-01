import { GITHUB_USER, PUSHED_REPO_ENDPOINT, GH_HEADERS } from "./config.js";
import { formatCommitAge } from "./utils.js";

async function fetchLatestCommitLive() {
  try {
    const r1 = await fetch(PUSHED_REPO_ENDPOINT, { headers: GH_HEADERS });
    if (!r1.ok) return null;
    const repos = await r1.json();
    if (!Array.isArray(repos) || !repos[0]?.name) return null;
    const repoName = repos[0].name;
    const r2 = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${encodeURIComponent(repoName)}/commits?per_page=1`,
      { headers: GH_HEADERS }
    );
    if (!r2.ok) return null;
    const commits = await r2.json();
    const c = commits[0];
    if (!c?.sha || !c.html_url) return null;
    const msg = String(c.commit?.message || "").split("\n")[0].trim() || "(no message)";
    const date = c.commit?.author?.date || c.commit?.committer?.date || "";
    return {
      repo: repoName,
      shaShort: c.sha.slice(0, 7),
      message: msg,
      url: c.html_url,
      date,
    };
  } catch {
    return null;
  }
}

export async function initLiveCommitTile() {
  const tile = document.getElementById("live-commit-tile");
  const repoEl = document.getElementById("live-commit-repo");
  const msgEl = document.getElementById("live-commit-msg");
  const metaEl = document.getElementById("live-commit-meta");
  if (!tile || !repoEl || !msgEl || !metaEl) return;

  tile.classList.add("is-loading");
  const data = await fetchLatestCommitLive();
  tile.classList.remove("is-loading");

  if (!data) {
    tile.classList.add("is-error");
    repoEl.textContent = "";
    msgEl.textContent = "Couldn't load activity (GitHub limit or offline).";
    metaEl.textContent = "";
    tile.setAttribute("href", `https://github.com/${GITHUB_USER}`);
    tile.setAttribute("aria-label", "Open GitHub profile — could not load latest commit");
    return;
  }

  tile.classList.remove("is-error");
  repoEl.textContent = `${data.repo} · ${data.shaShort}`;
  msgEl.textContent = data.message;
  const age = formatCommitAge(data.date);
  metaEl.textContent = age ? `${age} · opens commit` : "opens commit";
  tile.setAttribute("href", data.url);
  tile.setAttribute(
    "aria-label",
    `Latest commit ${data.shaShort} in ${data.repo}: ${data.message}. Opens on GitHub.`
  );
}
