/* ===== CANVAS ===== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* ===== SCALE ===== */
const PLAYER_SCALE = 0.13;
const GROUP_SCALE  = 0.08;

/* ===== REMOVE WHITE BG ===== */
function removeWhiteBg(img) {
  const c = document.createElement("canvas");
  const cx = c.getContext("2d");

  c.width = img.naturalWidth;
  c.height = img.naturalHeight;

  cx.drawImage(img, 0, 0);

  const imgData = cx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  cx.putImageData(imgData, 0, 0);
  return c;
}

/* ===== MAZE ===== */
const mazeImg = new Image();
mazeImg.src = "assets/images/maze.game.png";

/* ===== PLAYER IMAGES ===== */
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

const playerCanvas = {};

/* ===== PLAYER ===== */
const player = {
  x: 50,
  y: 65,
  speed: 3,
  dir: "right",
  w: 0,
  h: 0
};

/* ===== GROUP ===== */
const groupImg = new Image();
groupImg.src = "assets/images/group.png";

let groupCanvas;

const group = {
  x: 430,
  y: 300,
  w: 0,
  h: 0
};

/* ===== PREPROCESS IMAGES ===== */
playerImgs.right.onload = () => {
  for (let dir in playerImgs) {
    playerCanvas[dir] = removeWhiteBg(playerImgs[dir]);
  }

  player.w = playerCanvas.right.width * SCALE;
  player.h = playerCanvas.right.height * SCALE;
};

groupImg.onload = () => {
  groupCanvas = removeWhiteBg(groupImg);
  group.w = groupCanvas.width * SCALE;
  group.h = groupCanvas.height * SCALE;
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

  if (groupCanvas) {
    ctx.drawImage(groupCanvas, group.x, group.y, group.w, group.h);
  }

  const img = playerCanvas[player.dir];
  if (img) {
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
  }
}

/* ===== LOOP ===== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

mazeImg.onload = () => {
  loop();
};
