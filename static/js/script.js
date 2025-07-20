document.addEventListener("DOMContentLoaded", () => {
  // WAVE TEXT ANIMATION
  document.querySelectorAll('.wave-text').forEach((el) => {
    const originalText = el.textContent.trim();
    el.innerHTML = '';

    originalText.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.animationDelay = `${i * 0.05}s`;
      span.classList.add('wave-char');
      el.appendChild(span);
    });
  });

  // BUBBLE AND BLURB LOGIC
  const container = document.getElementById("bubble-container");
  if (container) {
    const bubbles = Array.from(container.querySelectorAll(".bubble-wrapper"));
    const startX = 40;
    const startY = 40;
    const spacingY = 120;
    const isMobile = window.innerWidth < 768;

    bubbles.forEach((bubble, i) => {
      const iconTop = startY + i * spacingY;
      const iconLeft = startX;

      bubble.style.position = "absolute";

      if (isMobile) {
        bubble.style.top = `${iconTop}px`;
        bubble.style.left = `${iconLeft}px`;
        bubble.classList.add("settled");
      } else {
        const randomTop = Math.random() * (container.clientHeight - 60);
        const randomLeft = Math.random() * (container.clientWidth - 60);

        bubble.style.top = `${randomTop}px`;
        bubble.style.left = `${randomLeft}px`;
      }

      const blurb = document.createElement("div");
      blurb.className = "blurb";
      blurb.textContent = bubble.dataset.desc || bubble.dataset.label;
      blurb.style.position = "absolute";
      blurb.style.pointerEvents = "none";
      blurb.style.top = `${iconTop + 6}px`;
      blurb.style.left = `${iconLeft + 70}px`;
      blurb.style.opacity = isMobile ? "1" : "0";
      if (!isMobile) blurb.style.transition = "opacity 0.4s ease";

      container.appendChild(blurb);

      if (!isMobile) {
        bubble.addEventListener("mouseenter", () => {
          bubble.style.top = `${iconTop}px`;
          bubble.style.left = `${iconLeft}px`;
          bubble.classList.add("settled");
          blurb.style.opacity = "1";
        });

        bubble.addEventListener("mouseleave", () => {
          blurb.style.opacity = "0";
        });
      }

      bubble.addEventListener("click", () => {
        const url = bubble.dataset.url;
        if (url) {
          window.open(url, "_blank");
        }
      });
    });
  }

  // FETCH REPOS
  const repoContainer = document.getElementById("repos");
  if (repoContainer) {
    fetch("http://48.217.68.14:8080/repos.json")
      .then(res => res.json())
      .then(repos => {
        repos.forEach(repo => {
          const card = document.createElement("div");
          card.className = "bg-white shadow-md p-4 rounded-lg";

          const title = document.createElement("h3");
          title.className = "text-xl font-semibold text-emerald-800";
          title.textContent = repo.name;

          const desc = document.createElement("p");
          desc.className = "text-sm text-gray-700 mt-1";
          desc.textContent = repo.description || "No description";

          const link = document.createElement("a");
          link.href = repo.download_url;
          link.target = "_blank";
          link.className = "inline-block mt-3 text-emerald-700 underline";
          link.textContent = "Download ZIP";

          const view = document.createElement("a");
          view.href = `${repo.view_url}`;
          view.target = "_blank";
          view.className = "inline-block mt-2 text-blue-700 underline ml-4";
          view.textContent = "View Source";

          card.append(title, desc, link, view);
          repoContainer.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Failed to fetch repos:", err);
      });
  }
});

// NAVBAR SCROLL EFFECT
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("main-navbar");
  if (!navbar) return;

  const scrollY = window.scrollY;

  if (scrollY > 40) {
    navbar.classList.add("bg-emerald-950", "backdrop-blur", "shadow-md");
  } else {
    navbar.classList.remove("bg-emerald-950", "backdrop-blur", "shadow-md");
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
