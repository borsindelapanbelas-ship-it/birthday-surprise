/* ===== CANVAS ===== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* ===== SCALE ===== */
const PLAYER_SCALE = 0.12;
const GROUP_SCALE  = 0.09;

/* ===== REMOVE LIGHT BG ===== */
function removeLightBg(img) {
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
    const brightness = (r + g + b) / 3;

    if (brightness > 235) {
      data[i + 3] = 0;
    }
  }

  cx.putImageData(imgData, 0, 0);
  return c;
}

/* ===== MAZE ===== */
const mazeImg = new Image();
mazeImg.src = "../assets/images/maze.game.png";

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

/* ===== COIN & STAR ===== */
const coinImg = new Image();
const starImg = new Image();

let coinCanvas;
let starCanvas;

coinImg.onload = () => {
  coinCanvas = removeLightBg(coinImg);
};

starImg.onload = () => {
  starCanvas = removeLightBg(starImg);
};

coinImg.src = "assets/images/coin.png";
starImg.src = "assets/images/star.png";

const coin = {
  x: 300,
  y: 90,
  w: 24,
  h: 24,
  taken: false
};

const star = {
  x: 200,
  y: 405,
  w: 24,
  h: 24,
  taken: false
};

/* ===== PREPROCESS IMAGES ===== */
playerImgs.right.onload = () => {
  for (let dir in playerImgs) {
    playerCanvas[dir] = removeLightBg(playerImgs[dir]);
  }

  player.w = playerCanvas.right.width * PLAYER_SCALE;
  player.h = playerCanvas.right.height * PLAYER_SCALE;
};

groupImg.onload = () => {
  groupCanvas = removeLightBg(groupImg);
  group.w = groupCanvas.width * GROUP_SCALE;
  group.h = groupCanvas.height * GROUP_SCALE;
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

/* ===== COLLISION BOX ===== */
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ===== WALL CHECK (SLIDE) ===== */
function isWall(x, y, w, h) {
  const imgData = ctx.getImageData(x, y, w, h).data;

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];

    if (r < 40 && g < 40 && b < 40) {
      return true;
    }
  }
  return false;
}

/* ===== GAME STATE ===== */
let finished = false;

/* ===== UPDATE ===== */
function update() {

  let nextX = player.x;
  let nextY = player.y;

  if (key.left)  { nextX -= player.speed; player.dir = "left"; }
  if (key.right) { nextX += player.speed; player.dir = "right"; }
  if (key.up)    { nextY -= player.speed; player.dir = "back"; }
  if (key.down)  { nextY += player.speed; player.dir = "front"; }

  // SLIDE COLLISION
  if (!isWall(nextX, player.y, player.w, player.h)) {
    player.x = nextX;
  }

  if (!isWall(player.x, nextY, player.w, player.h)) {
    player.y = nextY;
  }

  // batas canvas
  player.x = Math.max(0, Math.min(SIZE - player.w, player.x));
  player.y = Math.max(0, Math.min(SIZE - player.h, player.y));

  // coin
  if (!coin.taken && isColliding(player, coin)) {
    coin.taken = true;
  }

  // star
  if (!star.taken && isColliding(player, star)) {
    star.taken = true;
  }

  // finish
  if (!finished && coin.taken && star.taken && isColliding(player, group)) {
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

  if (!coin.taken && coinCanvas) {
    ctx.drawImage(coinCanvas, coin.x, coin.y, coin.w, coin.h);
  }

  if (!star.taken && starCanvas) {
    ctx.drawImage(starCanvas, star.x, star.y, star.w, star.h);
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
