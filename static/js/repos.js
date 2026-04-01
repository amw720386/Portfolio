import { GITHUB_USER, REPO_ENDPOINT, GH_HEADERS, FEATURED_NAMES } from "./config.js";
import { escapeHtml } from "./utils.js";
import { fetchReadmeExcerpt } from "./github.js";

const FALLBACK_REPOS = [
  {
    name: "Portfolio",
    description: "This portfolio site: Flask, repo cards, README previews.",
    html_url: `https://github.com/${GITHUB_USER}/Portfolio`,
    language: "HTML",
  },
  {
    name: "RickAndMordle",
    description: "Wordle with a Rick and Morty twist.",
    html_url: `https://github.com/${GITHUB_USER}/RickAndMordle`,
    language: "CSS",
  },
  {
    name: "A-Dollar-Through-The-2000s",
    description: "Data across the 2000s, visualized.",
    html_url: `https://github.com/${GITHUB_USER}/A-Dollar-Through-The-2000s`,
    language: "TypeScript",
  },
  {
    name: "InteractivePortfolio",
    description: "Interactive portfolio experiments.",
    html_url: `https://github.com/${GITHUB_USER}/InteractivePortfolio`,
    language: "TypeScript",
  },
];

async function enrichReposWithReadme(repos) {
  const out = [];
  for (const r of repos) {
    const readmeExcerpt = await fetchReadmeExcerpt(GITHUB_USER, r.name);
    out.push({ ...r, readmeExcerpt });
  }
  return out;
}

function pickDescription(repo) {
  if (repo.readmeExcerpt && repo.readmeExcerpt.trim()) return { text: repo.readmeExcerpt.trim(), fromReadme: true };
  if (repo.description && repo.description.trim()) return { text: repo.description.trim(), fromReadme: false };
  return { text: "Open the repository for full detail.", fromReadme: false };
}

function buildCard(repo, index) {
  const { text, fromReadme } = pickDescription(repo);
  const lang = repo.language ? `<span class="repo-card__meta">${escapeHtml(repo.language)}</span>` : "";
  const badge = fromReadme ? `<span class="repo-card__badge" title="Preview from README">README</span>` : "";

  return `
    <li class="repo-card" style="transition-delay: ${Math.min(index * 40, 320)}ms">
      <a class="repo-card__link" href="${escapeHtml(repo.html_url)}" rel="noopener noreferrer" target="_blank">
        <div class="repo-card__top">
          <h3 class="repo-card__name">${escapeHtml(repo.name)}</h3>
          ${badge}
        </div>
        <p class="repo-card__desc">${escapeHtml(text)}</p>
        ${lang}
      </a>
    </li>
  `;
}

function filterOutFeatured(repos) {
  return repos.filter((r) => r && r.name && !FEATURED_NAMES.has(String(r.name).toLowerCase()));
}

function renderList(grid, repos) {
  grid.innerHTML = repos.map((repo, i) => buildCard(repo, i)).join("");
}

let reposLoadStarted = false;

export async function loadRepos() {
  const grid = document.getElementById("project-grid");
  const status = document.getElementById("repo-status");
  if (!grid || !status) return;
  if (reposLoadStarted) return;
  reposLoadStarted = true;

  status.textContent = "Loading repositories…";

  try {
    const res = await fetch(REPO_ENDPOINT, { headers: GH_HEADERS });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    const repos = Array.isArray(data) ? data.filter((r) => r && !r.fork && !r.archived) : [];

    if (!repos.length) {
      status.textContent = "Could not load live data. Showing highlights.";
      const enriched = await enrichReposWithReadme(filterOutFeatured(FALLBACK_REPOS));
      renderList(grid, enriched);
      status.textContent = "";
      return;
    }

    const filtered = filterOutFeatured(repos);
    status.textContent = "Pulling README previews…";
    const enriched = await enrichReposWithReadme(filtered);
    status.textContent = "";
    renderList(grid, enriched);
  } catch {
    status.textContent = "Showing cached highlights.";
    try {
      const enriched = await enrichReposWithReadme(filterOutFeatured(FALLBACK_REPOS));
      renderList(grid, enriched);
    } catch {
      renderList(
        grid,
        FALLBACK_REPOS.map((r) => ({ ...r, readmeExcerpt: null })).filter((r) => !FEATURED_NAMES.has(r.name.toLowerCase()))
      );
    }
    status.textContent = "";
  }
}
