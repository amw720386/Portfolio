/** Light canvas binary rain (theme-aware, throttled, respects reduced motion). */

function readThemeColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    ink: s.getPropertyValue("--ink-900").trim() || "#1a1612",
    accent: s.getPropertyValue("--honey-400").trim() || "#c4a574",
    wash: s.getPropertyValue("--cream-50").trim() || "#faf8f5",
  };
}

function resizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  return dpr;
}

function colorMix(color, alpha) {
  if (!color) return `rgba(26,22,18,${alpha})`;
  if (color.startsWith("#")) {
    const h = color.slice(1);
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }
  const rgb = color.match(/[\d.]+/g);
  if (rgb && rgb.length >= 3) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }
  return `rgba(26,22,18,${alpha})`;
}

export function initBinaryRain() {
  const canvas = document.getElementById("binary-rain");
  if (!canvas) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    drawStaticRain(canvas);
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let dpr = resizeCanvas(canvas);
  let columns = [];
  let colors = readThemeColors();
  let raf = 0;
  let lastFrame = 0;
  const FRAME_MS = 48;
  let running = true;

  function initColumns() {
    const colW = 32 * dpr;
    const count = Math.max(12, Math.ceil(canvas.width / colW));
    columns = Array.from({ length: count }, (_, i) => ({
      x: i * colW,
      y: Math.random() * canvas.height,
      speed: (0.25 + Math.random() * 0.45) * dpr,
      len: 4 + Math.floor(Math.random() * 6),
      bit: Math.random() > 0.5 ? "1" : "0",
    }));
  }

  function drawFrame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(drawFrame);
    if (ts - lastFrame < FRAME_MS) return;
    lastFrame = ts;

    ctx.fillStyle = colorMix(colors.wash, 0.1);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = 10 * dpr;
    ctx.font = `${fontSize}px ui-monospace, Consolas, monospace`;
    ctx.textBaseline = "top";

    for (const col of columns) {
      col.y += col.speed;
      if (col.y > canvas.height + col.len * fontSize) {
        col.y = -col.len * fontSize;
        col.len = 4 + Math.floor(Math.random() * 5);
      }

      if (Math.random() < 0.08) col.bit = col.bit === "1" ? "0" : "1";

      for (let i = 0; i < col.len; i++) {
        const y = col.y - i * fontSize;
        if (y < -fontSize || y > canvas.height) continue;
        const head = i === 0;
        const trail = 1 - i / col.len;
        ctx.fillStyle = head
          ? colorMix(colors.accent, 0.35 + trail * 0.15)
          : colorMix(colors.ink, 0.05 + trail * 0.06);
        ctx.fillText(col.bit, col.x, y);
      }
    }
  }

  function onResize() {
    dpr = resizeCanvas(canvas);
    colors = readThemeColors();
    initColumns();
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      lastFrame = 0;
      raf = requestAnimationFrame(drawFrame);
    }
  });

  const themeObserver = new MutationObserver(() => {
    colors = readThemeColors();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("resize", onResize, { passive: true });
  onResize();
  raf = requestAnimationFrame(drawFrame);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    themeObserver.disconnect();
  };
}

function drawStaticRain(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = resizeCanvas(canvas);
  const colors = readThemeColors();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const fontSize = 10 * dpr;
  ctx.font = `${fontSize}px ui-monospace, Consolas, monospace`;
  const colW = 36 * dpr;
  for (let x = 0; x < canvas.width; x += colW) {
    for (let y = 0; y < canvas.height; y += fontSize * 2.2) {
      if (Math.random() > 0.97) continue;
      ctx.fillStyle = colorMix(colors.ink, 0.05 + Math.random() * 0.05);
      ctx.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
    }
  }
}

/** Rare Adam ASCII sparkle (low frequency). */
export function initAdamAsciiFlicker() {
  const pre = document.getElementById("bg-adam-ascii");
  if (!pre || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const original = pre.textContent || "";
  const pool = [".", ":", "~", "·"];
  let tick = 0;

  setInterval(() => {
    if (document.hidden || ++tick % 3 !== 0) return;
    const chars = original.split("");
    const idx = (Math.random() * chars.length) | 0;
    if (chars[idx] === " " || chars[idx] === "\n") return;
    chars[idx] = pool[(Math.random() * pool.length) | 0];
    pre.textContent = chars.join("");
    setTimeout(() => {
      pre.textContent = original;
    }, 80);
  }, 900);
}
