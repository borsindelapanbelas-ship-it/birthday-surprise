const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ===== CANVAS SIZE (LOGIC SIZE) ===== */
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
const player = {
  x: 0,
  y: CANVAS_SIZE / 2 - 20,
  width: 96,     // SESUAI RASIO ASLI
  height: 40,    // JANGAN DIUBAH
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

/* ===== KEYBOARD CONTROLS ===== */
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

/* ===== MOBILE BUTTONS ===== */
document.querySelector(".btn.up").addEventListener("touchstart", () => keys.up = true);
document.querySelector(".btn.up").addEventListener("touchend", () => keys.up = false);

document.querySelector(".btn.down").addEventListener("touchstart", () => keys.down = true);
document.querySelector(".btn.down").addEventListener("touchend", () => keys.down = false);

document.querySelector(".btn.left").addEventListener("touchstart", () => keys.left = true);
document.querySelector(".btn.left").addEventListener("touchend", () => keys.left = false);

document.querySelector(".btn.right").addEventListener("touchstart", () => keys.right = true);
document.querySelector(".btn.right").addEventListener("touchend", () => keys.right = false);

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

  // batas canvas
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // maze
  ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

  // player
  ctx.drawImage(
    playerImages[player.direction],
    player.x,
    player.y,
    player.width,
    player.height
  );
}


/* ===== GAME LOOP ===== */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ===== START GAME ===== */
mazeImg.onload = () => {
  gameLoop();
};

playerImages.right.onload = () => {
  console.log(
    playerImages.right.naturalWidth,
    playerImages.right.naturalHeight
  );
};
