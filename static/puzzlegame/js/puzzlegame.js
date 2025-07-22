const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 64;
let currentLevel = 0;
let levelData = [];
let playerPos = { x: 0, y: 0 };
let tiles = [];
let dotCount = 0;
let isMoving = false;
let activeVisualTraps = [];
let originalLevelData = [];
const activatedTraps = new Set();
let pendingTrapTimeouts = [];

async function loadLevel(levelIndex) {
  isMoving = true;
  const res = await fetch(`https://api.ahamedwajibu.com/level/${levelIndex}`);
  const json = await res.json();
  if (json.error) return alert("Level not found!");

  levelData = json.level;
  originalLevelData = json.level.map(row => row.split(""));

  dotCount = 0;
  tiles = [];
  activatedTraps.clear();
  activeVisualTraps = [];
  pendingTrapTimeouts.forEach(clearTimeout);
  pendingTrapTimeouts = [];

  for (let y = 0; y < originalLevelData.length; y++) {
    let row = [];
    for (let x = 0; x < originalLevelData[y].length; x++) {
      const char = originalLevelData[y][x];
      row.push(char);
      if (char === "@") playerPos = { x, y };
      if (char === ".") dotCount++;
    }
    tiles.push(row);
  }

  draw();
  isMoving = false;
}

function isSpikeTrap(x, y) {
  return activeVisualTraps.some(([sx, sy]) => sx === x && sy === y);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const offsetX = centerX - playerPos.x * TILE_SIZE;
  const offsetY = centerY - playerPos.y * TILE_SIZE;

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      let tile = tiles[y][x];
      let color = "#000";

      if (tile === "#") color = "#555";
      else if (tile === ".") color = "#ff0";
      else if (tile === "^") color = "#a00";
      else if (tile === "B") color = "#0ff";

      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x * TILE_SIZE, offsetY + y * TILE_SIZE, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }

  for (const [x, y] of activeVisualTraps) {
    ctx.fillStyle = "#a00";
    ctx.fillRect(offsetX + x * TILE_SIZE, offsetY + y * TILE_SIZE, TILE_SIZE - 4, TILE_SIZE - 4);
  }

  ctx.fillStyle = "#0f0";
  ctx.fillRect(offsetX + playerPos.x * TILE_SIZE, offsetY + playerPos.y * TILE_SIZE, TILE_SIZE - 4, TILE_SIZE - 4);  
}

function triggerTrap(cx, cy, dx, dy) {
  const key = `${cx},${cy},${dx},${dy}`;
  if (activatedTraps.has(key)) return;
  activatedTraps.add(key);

  const affected = [[cx + dx, cy + dy]];

  const timeout1 = setTimeout(() => {
    activeVisualTraps.push(...affected);
    draw();

    const timeout2 = setTimeout(() => {
      for (const [x, y] of affected) {
        if (playerPos.x === x && playerPos.y === y) {
          resetLevel();
          return;
        }
      }

      activeVisualTraps = activeVisualTraps.filter(([x, y]) =>
        !affected.some(([ax, ay]) => ax === x && ay === y)
      );

      draw();
      activatedTraps.delete(key);
    }, 1000);

    pendingTrapTimeouts.push(timeout2);
  }, 1000);

  pendingTrapTimeouts.push(timeout1);
}

function move(dx, dy) {
  if (isMoving) return;
  isMoving = true;

  let x = playerPos.x;
  let y = playerPos.y;

  function step() {
    const nextX = x + dx;
    const nextY = y + dy;
    const nextTile = tiles[nextY]?.[nextX];

    if (isSpikeTrap(nextX, nextY)) {
      resetLevel();
      return;
    }

    if (!nextTile || nextTile === "#" || nextTile === "B") {
      playerPos = { x, y };
      draw();
      isMoving = false;
      return;
    }

    x = nextX;
    y = nextY;

    if (nextTile === "^" || nextTile === "X") {
      resetLevel();
      return;
    }

    if (nextTile === ".") {
      tiles[y][x] = " ";
      dotCount--;
      if (dotCount <= 0) {
        setTimeout(() => loadLevel(++currentLevel), 300);
        return;
      }
    }

    if (nextTile === "B") {
      triggerTrap(x, y, dx, dy);
    }

    const adjacentTraps = [
      [x + 1, y, -1, 0],
      [x - 1, y, 1, 0],
      [x, y + 1, 0, -1],
      [x, y - 1, 0, 1]
    ];
    adjacentTraps.forEach(([ax, ay, adx, ady]) => {
      if (tiles[ay]?.[ax] === "B") triggerTrap(ax, ay, adx, ady);
    });

    playerPos = { x, y };
    draw();

    setTimeout(step, 80);
  }

  step();
}

function resetLevel() {
  isMoving = false;
  activeVisualTraps = [];
  activatedTraps.clear();
  dotCount = 0;
  tiles = [];
  pendingTrapTimeouts.forEach(clearTimeout);
  pendingTrapTimeouts = [];

  for (let y = 0; y < originalLevelData.length; y++) {
    let row = [];
    for (let x = 0; x < originalLevelData[y].length; x++) {
      const char = originalLevelData[y][x];
      row.push(char);
      if (char === "@") playerPos = { x, y };
      if (char === ".") dotCount++;
    }
    tiles.push(row);
  }

  draw();
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "m") {
    const cmd = prompt("Enter dev command:");
    if (cmd?.startsWith("devlvl:")) {
      const lvl = parseInt(cmd.split(":"[1]));
      if (!isNaN(lvl)) {
        currentLevel = lvl;
        loadLevel(lvl);
      }
    }
    return;
  }

  if (e.key === "ArrowUp" || e.key === "w") move(0, -1);
  else if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
  else if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
  else if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
});

loadLevel(currentLevel);