const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/*CANVAS SIZE*/
const CANVAS_SIZE = 520;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

/*IMAGES*/
const mazeImg = new Image();
mazeImg.src = "assets/images/maze.game.png";

const playerImages = {
  front: new Image(),
  back: new Image(),
  left: new Image(),
  right: new Image()
};

playerImages.front.src = "assets/images/front.png";
playerImages.back.src  = "assets/images/back.png";
playerImages.left.src  = "assets/images/left.png";
playerImages.right.src = "assets/images/right.png";

/*PLAYER (ANTI GEPENG)*/
const PLAYER_SCALE = 0.15;

const player = {
  x: CANVAS_SIZE / 2,
  y: CANVAS_SIZE - 80,
  speed: 3,
  direction: "back",
  width: 0,
  height: 0
};


/*INPUT*/
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

/*UPDATE*/
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

/*DRAW*/
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // maze
  ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

  // player
  const img = playerImages[player.direction];
  ctx.drawImage(img, player.x, player.y, player.width, player.height);
}

/*GAME LOOP*/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/*IMAGE LOADER (WAJIB)*/
let imagesLoaded = 0;
const TOTAL_IMAGES = 5;

function onImageLoaded() {
  imagesLoaded++;

  if (imagesLoaded === TOTAL_IMAGES) {
    // set ukuran player setelah image siap
    player.width  = playerImages.right.naturalWidth  * PLAYER_SCALE;
    player.height = playerImages.right.naturalHeight * PLAYER_SCALE;

    console.log("GAME READY");
    gameLoop();
  }
}

mazeImg.onload = onImageLoaded;
playerImages.front.onload = onImageLoaded;
playerImages.back.onload  = onImageLoaded;
playerImages.left.onload  = onImageLoaded;
playerImages.right.onload = onImageLoaded;

