export function initInteractiveTeaser() {
  const el = document.getElementById("interactive-teaser");
  const closeBtn = document.getElementById("interactive-teaser-close");
  if (!el || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    el.hidden = true;
  });
}
