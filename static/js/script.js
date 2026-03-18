// NAVBAR SCROLL EFFECT
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("main-navbar");
  if (!navbar) return;

  const scrollY = window.scrollY;

  if (scrollY > 40) {
    navbar.classList.add("bg-slate-950", "backdrop-blur", "shadow-md");
  } else {
    navbar.classList.remove("bg-slate-950", "backdrop-blur", "shadow-md");
  }
});

// CURSOR GLOW
document.addEventListener("mousemove", (e) => {
  const glow = document.getElementById("cursor-glow");
  if (glow) {
    glow.style.top = `${e.clientY}px`;
    glow.style.left = `${e.clientX}px`;
  }
});
