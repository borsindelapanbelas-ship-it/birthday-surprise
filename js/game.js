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

/* ===== PLAYER (ANTI GEPENG) ===== */
const PLAYER_SCALE = 0.15; // <- KUNCI DI SINI

const player = {
  x: 10,
  y: CANVAS_SIZE / 2,
  speed: 3,
  direction: "right",
  width: 0,
  height: 0
};

/* ===== INPUT ===== */
const keys = { up:false, down:false, left:false, right:false };

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

/* ===== UPDATE ===== */
function update() {
  if (keys.up)    { player.y -= player.speed; player.direction = "back"; }
  if (keys.down)  { player.y += player.speed; player.direction = "front"; }
  if (keys.left)  { player.x -= player.speed; player.direction = "left"; }
  if (keys.right) { player.x += player.speed; player.direction = "right"; }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

  const img = playerImages[player.direction];
  ctx.drawImage(img, player.x, player.y, player.width, player.height);
}

/* ===== LOOP ===== */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ===== START ===== */
playerImages.right.onload = () => {
  player.width  = playerImages.right.naturalWidth  * PLAYER_SCALE;
  player.height = playerImages.right.naturalHeight * PLAYER_SCALE;
};

mazeImg.onload = () => {
  console.log("GAME START");
  gameLoop();
};

