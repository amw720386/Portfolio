const dialog = document.getElementById("command-menu");
const input = document.getElementById("command-input");
const results = document.getElementById("command-results");
const commands = [...results.querySelectorAll("[data-command]")];
const captions = [...results.querySelectorAll(".command-caption")];
const empty = document.getElementById("command-empty");
let active = 0;
let previousFocus = null;

function visibleCommands() {
  return commands.filter((item) => !item.hidden);
}

function select(index) {
  const items = visibleCommands();
  commands.forEach((item) => item.classList.remove("is-active"));
  if (!items.length) return;
  active = (index + items.length) % items.length;
  items[active].classList.add("is-active");
  items[active].scrollIntoView({ block: "nearest" });
}

function filterCommands() {
  const query = input.value.trim().toLowerCase();
  commands.forEach((item) => {
    item.hidden = !item.dataset.command.includes(query);
  });
  captions.forEach((caption) => {
    let next = caption.nextElementSibling;
    let hasVisibleItem = false;
    while (next && !next.classList.contains("command-caption")) {
      if (next.matches("[data-command]") && !next.hidden) hasVisibleItem = true;
      next = next.nextElementSibling;
    }
    caption.hidden = !hasVisibleItem;
  });
  empty.hidden = visibleCommands().length > 0;
  select(0);
}

function openMenu() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  input.value = "";
  filterCommands();
  dialog.showModal();
  input.focus();
}

function closeMenu() {
  if (dialog.open) dialog.close();
}

document.getElementById("open-command").addEventListener("click", openMenu);
document.getElementById("close-command").addEventListener("click", closeMenu);
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (dialog.open) closeMenu();
    else openMenu();
  }
});
input.addEventListener("input", filterCommands);
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    select(active + (event.key === "ArrowDown" ? 1 : -1));
  }
  if (event.key === "Enter" && document.activeElement === input) {
    event.preventDefault();
    visibleCommands()[active]?.click();
  }
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeMenu();
  const command = event.target.closest("[data-command]");
  if (!command) return;
  closeMenu();
  if (command.dataset.themeCommand && document.documentElement.dataset.theme !== command.dataset.themeCommand) {
    requestAnimationFrame(() => document.getElementById("theme-toggle").click());
  }
});
dialog.addEventListener("close", () => previousFocus?.focus());
