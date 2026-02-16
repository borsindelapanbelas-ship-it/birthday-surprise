window.addEventListener("DOMContentLoaded", () => {

/* ================= CANVAS ================= */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* ================= SCALE ================= */
const PLAYER_SCALE = 0.12;
const GROUP_SCALE  = 0.09;

/* ================= LOAD IMAGES ================= */
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

const groupImg = new Image();
groupImg.src = "assets/images/group.png";

const coinImg = new Image();
coinImg.src = "assets/images/coin.png";

const starImg = new Image();
starImg.src = "assets/images/star.png";

/* ================= SOUND ================= */
const pickupSound = new Audio("assets/sounds/pickup.mp3");

/* ================= GAME OBJECTS ================= */
let playerCanvas = {};
let groupCanvas, coinCanvas, starCanvas;
let mazeData = null;

const player = {
  x: 50,
  y: 65,
  speed: 3,
  dir: "right",
  w: 0,
  h: 0
};

const group = { x: 430, y: 300, w: 0, h: 0 };
const coin  = { x: 300, y: 90, w: 24, h: 24, taken: false, angle: 0 };
const star  = { x: 200, y: 405, w: 24, h: 24, taken: false, angle: 0 };

let score = 0;
let finished = false;
let fadeAlpha = 0;

/* ================= REMOVE LIGHT BG ================= */
function removeLightBg(img) {
  const c = document.createElement("canvas");
  const cx = c.getContext("2d");

  c.width = img.naturalWidth;
  c.height = img.naturalHeight;

  cx.drawImage(img, 0, 0);

  const imgData = cx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
    if (brightness > 235) data[i+3] = 0;
  }

  cx.putImageData(imgData, 0, 0);
  return c;
}

/* ================= PREPROCESS ================= */
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

coinImg.onload = () => coinCanvas = removeLightBg(coinImg);
starImg.onload = () => starCanvas = removeLightBg(starImg);

/* ================= MAZE ================= */
mazeImg.onload = () => {
  ctx.drawImage(mazeImg, 0, 0, SIZE, SIZE);
  mazeData = ctx.getImageData(0, 0, SIZE, SIZE);
  loop();
};

function isWall(x, y, w, h) {
  if (!mazeData) return false;

  const footWidth  = w * 0.5;
  const footHeight = h * 0.2;

  const footX = x + (w - footWidth) / 2;
  const footY = y + h - footHeight;

  const data = mazeData.data;

  for (let i = 0; i < footWidth; i++) {
    for (let j = 0; j < footHeight; j++) {

      const px = Math.floor(footX + i);
      const py = Math.floor(footY + j);

      if (px < 0 || py < 0 || px >= SIZE || py >= SIZE) continue;

      const index = (py * SIZE + px) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      if (r < 40 && g < 40 && b < 40) return true;
    }
  }
  return false;
}

/* ================= INPUT ================= */
const key = { up:false, down:false, left:false, right:false };

window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") key.up = true;
  if (e.key === "ArrowDown") key.down = true;
  if (e.key === "ArrowLeft") key.left = true;
  if (e.key === "ArrowRight") key.right = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowUp") key.up = false;
  if (e.key === "ArrowDown") key.down = false;
  if (e.key === "ArrowLeft") key.left = false;
  if (e.key === "ArrowRight") key.right = false;
});

/* ================= COLLISION ================= */
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ================= UPDATE ================= */
function update() {

  if (!finished) {

    let nextX = player.x;
    let nextY = player.y;

    if (key.left)  { nextX -= player.speed; player.dir = "left"; }
    if (key.right) { nextX += player.speed; player.dir = "right"; }
    if (key.up)    { nextY -= player.speed; player.dir = "back"; }
    if (key.down)  { nextY += player.speed; player.dir = "front"; }

    if (!isWall(nextX, player.y, player.w, player.h)) player.x = nextX;
    if (!isWall(player.x, nextY, player.w, player.h)) player.y = nextY;

    if (!coin.taken && isColliding(player, coin)) {
      coin.taken = true;
      score++;
      pickupSound.play();
    }

    if (!star.taken && isColliding(player, star)) {
      star.taken = true;
      score++;
      pickupSound.play();
    }

    if (score === 2 && isColliding(player, group)) {
      finished = true;
    }
  }

  // rotate animation
  coin.angle += 0.05;
  star.angle += 0.05;

  // fade effect
  if (finished && fadeAlpha < 1) {
    fadeAlpha += 0.02;
  }

  if (fadeAlpha >= 1) {
    setTimeout(() => {
      window.location.href = "choose.html";
    }, 1000);
  }
}

/* ================= DRAW ================= */
function draw() {

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(mazeImg, 0, 0, SIZE, SIZE);

  // score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("⭐ Score: " + score + "/2", 20, 30);

  // coin
  if (!coin.taken && coinCanvas) {
    ctx.save();
    ctx.translate(coin.x + coin.w/2, coin.y + coin.h/2);
    ctx.rotate(coin.angle);
    ctx.drawImage(coinCanvas, -coin.w/2, -coin.h/2, coin.w, coin.h);
    ctx.restore();
  }

  // star
  if (!star.taken && starCanvas) {
    ctx.save();
    ctx.translate(star.x + star.w/2, star.y + star.h/2);
    ctx.rotate(star.angle);
    ctx.drawImage(starCanvas, -star.w/2, -star.h/2, star.w, star.h);
    ctx.restore();
  }

  if (groupCanvas)
    ctx.drawImage(groupCanvas, group.x, group.y, group.w, group.h);

  const img = playerCanvas[player.dir];
  if (img)
    ctx.drawImage(img, player.x, player.y, player.w, player.h);

  // fade overlay
  if (finished) {
    ctx.fillStyle = "rgba(0,0,0," + fadeAlpha + ")";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("You Found Us! 🎉", SIZE/2 - 120, SIZE/2);
  }
}

/* ================= LOOP ================= */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

});

