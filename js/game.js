const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* ===== IMAGES ===== */
const mazeImg = new Image();
mazeImg.src = "assets/images/maze.game.png";

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
  x: 50,      // MASUK KE LUBANG ATAS KIRI
  y: 55,      // PAS DI JALURNYA
  speed: 3,
  dir: "right",
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

window.addEventListener("keyup", e => {
  if (e.key === "ArrowUp") key.up = 0;
  if (e.key === "ArrowDown") key.down = 0;
  if (e.key === "ArrowLeft") key.left = 0;
  if (e.key === "ArrowRight") key.right = 0;
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

/* ===== LOOP ===== */
function update() {
  if (key.up)    { player.y -= player.speed; player.dir = "back"; }
  if (key.down)  { player.y += player.speed; player.dir = "front"; }
  if (key.left)  { player.x -= player.speed; player.dir = "left"; }
  if (key.right) { player.x += player.speed; player.dir = "right"; }

  player.x = Math.max(0, Math.min(SIZE - player.w, player.x));
  player.y = Math.max(0, Math.min(SIZE - player.h, player.y));
}

function draw() {
  ctx.clearRect(0,0,SIZE,SIZE);

  if (mazeImg.complete) {
    ctx.drawImage(mazeImg,0,0,SIZE,SIZE);
  }

  const img = playerImgs[player.dir];
  if (img.complete) {
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ===== START GAME ===== */
playerImgs.right.onload = () => {
  player.w = playerImgs.right.naturalWidth * SCALE;
  player.h = playerImgs.right.naturalHeight * SCALE;
};

mazeImg.onload = () => {
  loop();
};

const group = document.getElementById("group");

// KOORDINAT JALAN KELUAR (sesuaikan dikit kalo mau)
const groupPos = {
  x: 420,
  y: 430,
};

group.style.left = groupPos.x + "px";
group.style.top = groupPos.y + "px";
group.style.display = "block";
function isColliding(a, b, size = 40) {
  return (
    a.x < b.x + size &&
    a.x + size > b.x &&
    a.y < b.y + size &&
    a.y + size > b.y
  );
}
if (isColliding(player, groupPos)) {
  showMeetScene();
}
let finished = false;

function showMeetScene() {
  if (finished) return;
  finished = true;

  setTimeout(() => {
    window.location.href = "gift.html";
  }, 1200);
}
