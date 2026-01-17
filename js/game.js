const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SIZE = 520;
canvas.width = SIZE;
canvas.height = SIZE;

/* IMAGES */
const mazeImg = new Image();
mazeImg.src = "./assets/images/maze.game.png";

const playerImgs = {
  front: new Image(),
  back: new Image(),
  left: new Image(),
  right: new Image()
};

playerImgs.front.src = "./assets/images/front.png";
playerImgs.back.src  = "./assets/images/back.png";
playerImgs.left.src  = "./assets/images/left.png";
playerImgs.right.src = "./assets/images/right.png";

/* PLAYER */
const SCALE = 0.15;
const player = {
  x: SIZE / 2,
  y: SIZE - 100,
  speed: 3,
  dir: "back",
  w: 0,
  h: 0
};

/* INPUT */
const key = { up:0, down:0, left:0, right:0 };

addEventListener("keydown", e => {
  if (e.key === "ArrowUp") key.up = 1;
  if (e.key === "ArrowDown") key.down = 1;
  if (e.key === "ArrowLeft") key.left = 1;
  if (e.key === "ArrowRight") key.right = 1;
});

addEventListener("keyup", e => {
  if (e.key === "ArrowUp") key.up = 0;
  if (e.key === "ArrowDown") key.down = 0;
  if (e.key === "ArrowLeft") key.left = 0;
  if (e.key === "ArrowRight") key.right = 0;
});

/* LOOP */
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
  ctx.drawImage(mazeImg,0,0,SIZE,SIZE);
  ctx.drawImage(playerImgs[player.dir], player.x, player.y, player.w, player.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

playerImgs.right.onload = () => {
  player.w = playerImgs.right.naturalWidth * SCALE;
  player.h = playerImgs.right.naturalHeight * SCALE;
  loop();
};
