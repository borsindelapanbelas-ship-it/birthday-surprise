/* ===============================
   CANVAS SETUP
================================ */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_SIZE = 520;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

/* ===============================
   LOAD IMAGES
================================ */
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

/* ===============================
   PLAYER CONFIG
   (ANTI GEPENG SYSTEM)
================================ */
const PLAYER_SCALE = 0.12; // 👉 BESAR-KECIL PLAYER (AMAN)

const player = {
  x: 0,
  y: CANVAS_SIZE / 2,
  speed: 3,
  direction: "right"
};

/* ===============================
   INPUT STATE
================================ */
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

/* ===============================
   KEYBOARD CONTROLS (LAPTOP)
================================ */
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

/* ===============================
   MOBILE BUTTON CONTROLS
================================ */
function bindMobileButton(selector, key) {
  const btn = document.querySelector(selector);
  if (!btn) return;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[key] = true;
  });

  btn.addEventListener("touchend", () => {
    keys[key] = false;
  });
}

bindMobileButton(".btn.up", "up");
bindMobileButton(".btn.down", "down");
bindMobileButton(".btn.left", "left");
bindMobileButton(".btn.right", "right");

/* ===============================
   UPDATE PLAYER
================================ */
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

  // boundary (ANTI KELUAR CANVAS)
  const img = playerImages[player.direction];
  const w = img.naturalWidth * PLAYER_SCALE;
  const h = img.naturalHeight * PLAYER_SCALE;

  player.x = Math.max(0, Math.min(canvas.width - w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - h, player.y));
}

/* ===============================
   DRAW SCENE
================================ */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // maze
  ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

  // player (RASIO ASLI, NO GEPENG)
  const img = playerImages[player.direction];
  const w = img.naturalWidth * PLAYER_SCALE;
  const h = img.naturalHeight * PLAYER_SCALE;

  ctx.drawImage(img, player.x, player.y, w, h);
}

/* ===============================
   GAME LOOP
================================ */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ===============================
   START GAME
================================ */
mazeImg.onload = () => {
  gameLoop();
};
