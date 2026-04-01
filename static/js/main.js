import { initInteractiveTeaser } from "./teaser.js";
import { initCatBoop, initTileAsciiPreview, isAsciiModalOpen, closeAsciiModalImmediate } from "./ascii-cats.js";
import { initThemes } from "./themes.js";
import { initCompartment, isCompartmentOpen, closeCompartment, primeFeaturedReadmeCache } from "./compartment.js";
import { initReadmeSheet, isReadmeSheetOpen, closeReadmeSheet } from "./readme-sheet.js";
import { initLiveCommitTile } from "./live-commit.js";

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initInteractiveTeaser();
  initCatBoop();
  void initTileAsciiPreview();
  initThemes();
  initCompartment();
  initReadmeSheet();
  void primeFeaturedReadmeCache();
  void initLiveCommitTile();

  document.querySelectorAll(".compartment__sheet").forEach((s) => {
    s.hidden = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isAsciiModalOpen()) {
      closeAsciiModalImmediate();
      return;
    }
    if (isReadmeSheetOpen()) {
      closeReadmeSheet();
      return;
    }
    if (isCompartmentOpen()) closeCompartment();
  });
});
