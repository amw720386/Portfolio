const toggle = document.getElementById("theme-toggle");
const root = document.documentElement;
let animating = false;
const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.1 2.1a9.9 9.9 0 1 0 9.8 12.2 7.7 7.7 0 0 1-9.8-12.2Z"/></svg>';
const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6"/></svg>';

document.getElementById("year").textContent = new Date().getFullYear();

function setTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === "dark";
  document.querySelector('meta[name="theme-color"]').content = dark ? "#17291f" : "#f8f7f3";
  toggle.innerHTML = dark ? sunIcon : moonIcon;
  toggle.setAttribute("aria-label", "Switch to " + (dark ? "light" : "dark") + " mode");
  toggle.setAttribute("aria-pressed", String(dark));
  toggle.title = "Switch to " + (dark ? "light" : "dark") + " mode";
  try { localStorage.setItem("aw-theme", theme); } catch {}
}

setTheme(root.dataset.theme === "dark" ? "dark" : "light");

const header = document.querySelector(".site-header");
function updateHeader() {
  header.classList.toggle("is-scrolled", scrollY > 12);
}
window.addEventListener("scroll", updateHeader, { passive: true });
// Inspect restored scroll position after the initial styles have been laid out.
window.addEventListener("pageshow", updateHeader);

function commitTheme(theme) {
  root.classList.add("theme-switching");
  setTheme(theme);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

let pointerX = 0;
let pointerY = 0;
let pointerQueued = false;
document.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (pointerQueued) return;
  pointerQueued = true;
  requestAnimationFrame(() => {
    document.body.style.setProperty("--pointer-x", pointerX + "px");
    document.body.style.setProperty("--pointer-y", pointerY + "px");
    document.body.classList.add("pointer-active");
    pointerQueued = false;
  });
});
document.addEventListener("mouseleave", () => document.body.classList.remove("pointer-active"));
window.addEventListener("blur", () => document.body.classList.remove("pointer-active"));

toggle.addEventListener("click", async () => {
  if (animating) return;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    commitTheme(next);
    return;
  }

  animating = true;
  const rect = toggle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + 10;
  const preview = document.createElement("div");
  preview.className = "theme-reveal";
  preview.dataset.theme = next;
  preview.setAttribute("aria-hidden", "true");
  preview.inert = true;
  const page = document.querySelector(".page").cloneNode(true);
  page.style.transform = "translateY(-" + scrollY + "px)";
  page.querySelector(".site-header").style.visibility = "hidden";
  const previewHeader = header.cloneNode(true);
  previewHeader.querySelector("#theme-toggle").innerHTML = next === "dark" ? sunIcon : moonIcon;
  preview.append(page);
  preview.append(previewHeader);
  document.body.append(preview);

  try {
    const reveal = preview.animate([
      { clipPath: "circle(0px at " + x + "px " + y + "px)" },
      { clipPath: "circle(" + radius + "px at " + x + "px " + y + "px)" }
    ], { duration: 760, easing: "cubic-bezier(.18,.8,.22,1)", fill: "forwards" });
    await reveal.finished;
    commitTheme(next);
  } catch {
    commitTheme(next);
  } finally {
    preview.remove();
    animating = false;
  }
});
