const commitLink = document.getElementById("latest-commit");

async function showLatestCommit() {
  if (!commitLink) return;

  try {
    const headers = { Accept: "application/vnd.github+json" };
    const repoResponse = await fetch("https://api.github.com/users/amw720386/repos?sort=pushed&per_page=1&type=owner", { headers });
    if (!repoResponse.ok) return;
    const [repo] = await repoResponse.json();
    if (!repo?.name) return;

    const commitResponse = await fetch(`https://api.github.com/repos/amw720386/${encodeURIComponent(repo.name)}/commits?per_page=1`, { headers });
    if (!commitResponse.ok) return;
    const [commit] = await commitResponse.json();
    if (!commit?.sha || !commit.html_url?.startsWith("https://github.com/")) return;

    const message = String(commit.commit?.message || "").split("\n")[0].trim();
    if (!message) return;
    const date = commit.commit?.author?.date || commit.commit?.committer?.date;
    const parsedDate = date && new Date(date);

    document.getElementById("latest-commit-message").textContent = message;
    document.getElementById("latest-commit-repo").textContent = `${repo.name} · ${commit.sha.slice(0, 7)}`;
    document.getElementById("latest-commit-date").textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parsedDate)
      : "";
    commitLink.href = commit.html_url;
    commitLink.hidden = false;
  } catch {
    // Keep the page quiet when GitHub is unavailable or rate limited.
  }
}

showLatestCommit();
