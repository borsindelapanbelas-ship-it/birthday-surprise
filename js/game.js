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
const winSound    = new Audio("assets/sounds/win.mp3");

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
const coin  = { x: 300, y: 90, w: 24, h: 24, taken: false, flip: 0 };
const star  = { x: 200, y: 405, w: 24, h: 24, taken: false, flip: 0 };

let finished = false;

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

/* ================= MOBILE TOUCH (HP ONLY) ================= */
function createMobileControls() {

  if (!("ontouchstart" in window)) return;

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.bottom = "20px";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "60px 60px 60px";
  container.style.gap = "10px";
  container.style.zIndex = "999";

  function makeBtn(label, action) {
    const btn = document.createElement("div");
    btn.innerHTML = label;
    btn.style.background = "rgba(255,255,255,0.6)";
    btn.style.textAlign = "center";
    btn.style.padding = "15px";
    btn.style.borderRadius = "12px";
    btn.style.fontSize = "20px";
    btn.style.userSelect = "none";

    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      key[action] = true;
    });

    btn.addEventListener("touchend", e => {
      e.preventDefault();
      key[action] = false;
    });

    return btn;
  }

  container.appendChild(document.createElement("div"));
  container.appendChild(makeBtn("⬆️","up"));
  container.appendChild(document.createElement("div"));
  container.appendChild(makeBtn("⬅️","left"));
  container.appendChild(makeBtn("⬇️","down"));
  container.appendChild(makeBtn("➡️","right"));

  document.body.appendChild(container);
}

createMobileControls();

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

  let nextX = player.x;
  let nextY = player.y;

  if (key.left)  { nextX -= player.speed; player.dir = "left"; }
  if (key.right) { nextX += player.speed; player.dir = "right"; }
  if (key.up)    { nextY -= player.speed; player.dir = "back"; }
  if (key.down)  { nextY += player.speed; player.dir = "front"; }

  if (!isWall(nextX, player.y, player.w, player.h)) player.x = nextX;
  if (!isWall(player.x, nextY, player.w, player.h)) player.y = nextY;

  coin.flip += 0.15;
  star.flip += 0.15;

  if (!coin.taken && isColliding(player, coin)) {
    coin.taken = true;
    pickupSound.currentTime = 0;
    pickupSound.play();
  }

  if (!star.taken && isColliding(player, star)) {
    star.taken = true;
    pickupSound.currentTime = 0;
    pickupSound.play();
  }

  if (!finished && coin.taken && star.taken && isColliding(player, group)) {
    finished = true;
    winSound.play();
    setTimeout(() => {
      window.location.href = "choose.html";
    }, 1200);
  }
}

/* ================= DRAW ================= */
function draw() {

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(mazeImg, 0, 0, SIZE, SIZE);

  function drawFlip(obj, img) {
    ctx.save();
    ctx.translate(obj.x + obj.w/2, obj.y + obj.h/2);
    ctx.scale(Math.cos(obj.flip), 1);
    ctx.drawImage(img, -obj.w/2, -obj.h/2, obj.w, obj.h);
    ctx.restore();
  }

  if (!coin.taken && coinCanvas)
    drawFlip(coin, coinCanvas);

  if (!star.taken && starCanvas)
    drawFlip(star, starCanvas);

  if (groupCanvas)
    ctx.drawImage(groupCanvas, group.x, group.y, group.w, group.h);

  const img = playerCanvas[player.dir];
  if (img)
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
}

/* ================= LOOP ================= */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

});
