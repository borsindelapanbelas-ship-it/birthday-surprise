/* ===== CANVAS ===== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* ===== IMAGES ===== */
const mazeImg = new Image();
mazeImg.src = "assets/images/maze.game.png";

const groupImg = new Image();
groupImg.src = "assets/images/group.png";

const playerImgs = {
  front: new Image(),
  back: new Image(),
  left: new Image(),
  right: new Image()
};

playerImgs.front.src = "assets/images/front.png";
playerImgs.back.src  = "assets/images/back.png";
playerImgs.left.src  = "assets/images/left.png";
playerImgs.right.src = "assets/images/right.png";

/* ===== PLAYER ===== */
const SCALE = 0.15;

const player = {
  x: 50,
  y: 65,
  speed: 3,
  dir: "right",
  w: 0,
  h: 0
};

/* ===== GROUP (FINISH POINT) ===== */
const group = {
  x: 430,
  y: 300,
  w: 0,
  h: 0
};

/* ===== INPUT ===== */
const key = { up:0, down:0, left:0, right:0 };

window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") key.up = 1;
  if (e.key === "ArrowDown") key.down = 1;
  if (e.key === "ArrowLeft") key.left = 1;
  if (e.key === "ArrowRight") key.right = 1;
});

window.addEventListener("keyup", () => {
  key.up = key.down = key.left = key.right = 0;
});

/* ===== MOBILE BUTTONS ===== */
document.querySelector(".up").onclick    = () => key.up = 1;
document.querySelector(".down").onclick  = () => key.down = 1;
document.querySelector(".left").onclick  = () => key.left = 1;
document.querySelector(".right").onclick = () => key.right = 1;

document.querySelectorAll(".btn").forEach(btn => {
  btn.onmouseup = btn.ontouchend = () => {
    key.up = key.down = key.left = key.right = 0;
  };
});

/* ===== COLLISION ===== */
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ===== GAME STATE ===== */
let finished = false;

/* ===== UPDATE ===== */
function update() {
  if (key.up)    { player.y -= player.speed; player.dir = "back"; }
  if (key.down)  { player.y += player.speed; player.dir = "front"; }
  if (key.left)  { player.x -= player.speed; player.dir = "left"; }
  if (key.right) { player.x += player.speed; player.dir = "right"; }

  player.x = Math.max(0, Math.min(SIZE - player.w, player.x));
  player.y = Math.max(0, Math.min(SIZE - player.h, player.y));

  if (!finished && isColliding(player, group)) {
    finished = true;
    setTimeout(() => {
      window.location.href = "gift.html";
    }, 1200);
  }
}

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  if (mazeImg.complete) {
    ctx.drawImage(mazeImg, 0, 0, SIZE, SIZE);
  }

  if (groupImg.complete) {
    ctx.drawImage(groupImg, group.x, group.y, group.w, group.h);
  }

  const img = playerImgs[player.dir];
  if (img.complete) {
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
  }
}

/* ===== LOOP ===== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ===== INIT SIZES ===== */
playerImgs.right.onload = () => {
  player.w = playerImgs.right.naturalWidth * SCALE;
  player.h = playerImgs.right.naturalHeight * SCALE;
};

groupImg.onload = () => {
  group.w = groupImg.naturalWidth * SCALE;
  group.h = groupImg.naturalHeight * SCALE;
};

mazeImg.onload = () => {
  loop();
};
