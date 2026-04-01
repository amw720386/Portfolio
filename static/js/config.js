export const GITHUB_USER = "amw720386";
export const REPO_ENDPOINT = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=14&type=owner`;
export const PUSHED_REPO_ENDPOINT = `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=1&type=owner`;
export const FEATURED_NAMES = new Set(["internflow", "reelreddit"]);
export const GH_HEADERS = { Accept: "application/vnd.github+json" };
export const INTERACTIVE_PORTFOLIO_URL = "https://interactive.ahamedwajibu.com";
export const THEME_STORAGE_KEY = "portfolioTheme";
