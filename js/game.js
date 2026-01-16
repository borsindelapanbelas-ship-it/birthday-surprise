const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ===== CANVAS LOGIC SIZE ===== */
const CANVAS_SIZE = 520;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

/* ===== IMAGES ===== */
const mazeImg = new Image();
mazeImg.src = "assets/images/maze.game.png";

const playerImages = {
  front: new Image(),
  back: new Image(),
  left: new Image(),
  right: new Image()
};

playerImages.front.src = "assets/images/front.png";
playerImages.back.src = "assets/images/back.png";
playerImages.left.src = "assets/images/left.png";
playerImages.right.src = "assets/images/right.png";

/* ===== PLAYER ===== */
const PLAYER_SCALE = 0.15;

const player = {
  x: 0,
  y: CANVAS_SIZE / 2,
  speed: 3,
  direction: "right"
};

/* ===== INPUT ===== */
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

/* KEYBOARD */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

/* MOBILE */
document.querySelector(".btn.up").ontouchstart = () => keys.up = true;
document.querySelector(".btn.up").ontouchend = () => keys.up = false;

document.querySelector(".btn.down").ontouchstart = () => keys.down = true;
document.querySelector(".btn.down").ontouchend = () => keys.down = false;

document.querySelector(".btn.left").ontouchstart = () => keys.left = true;
document.querySelector(".btn.left").ontouchend = () => keys.left = false;

document.querySelector(".btn.right").ontouchstart = () => keys.right = true;
document.querySelector(".btn.right").ontouchend = () => keys.right = false;

/* ===== UPDATE ===== */
function update() {
  if (keys.up) {
    player.y -= player.speed;
    player.direction = "back";
  }
  if (keys.down) {
    player.y += player.speed;
    player.direction = "front";
  }
  if (keys.left) {
    player.x -= player.speed;
    player.direction = "left";
  }
  if (keys.right) {
    player.x += player.speed;
    player.direction = "right";
  }

  const img = playerImages[player.direction];
  const w = img.naturalWidth * PLAYER_SCALE;
  const h = img.naturalHeight * PLAYER_SCALE;

  player.x = Math.max(0, Math.min(canvas.width - w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - h, player.y));
}

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

  const img = playerImages[player.direction];
  const w = img.naturalWidth * PLAYER_SCALE;
  const h = img.naturalHeight * PLAYER_SCALE;

  ctx.drawImage(img, player.x, player.y, w, h);
}

/* ===== LOOP ===== */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

mazeImg.onload = () => gameLoop();
