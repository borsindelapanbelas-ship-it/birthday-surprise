window.addEventListener("DOMContentLoaded", () => {

/* =================================================
   ================== AUDIO UNLOCK =================
================================================= */

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  coinSound.play().then(() => {
    coinSound.pause();
    coinSound.currentTime = 0;
  }).catch(()=>{});

  starSound.play().then(() => {
    starSound.pause();
    starSound.currentTime = 0;
  }).catch(()=>{});

  winSound.play().then(() => {
    winSound.pause();
    winSound.currentTime = 0;
  }).catch(()=>{});

  audioUnlocked = true;
}

document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });

/* =================================================
   ================== PAGE GAME ====================
================================================= */

const canvas = document.getElementById("gameCanvas");

if (canvas) {

  const ctx = canvas.getContext("2d");

  const SIZE = 520;
  canvas.width = SIZE;
  canvas.height = SIZE;

  canvas.style.width = "95vmin";
  canvas.style.height = "95vmin";
  canvas.style.maxWidth = SIZE + "px";
  canvas.style.maxHeight = SIZE + "px";
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";

  document.body.style.margin = "0";

  const PLAYER_SCALE = 0.12;
  const GROUP_SCALE  = 0.09;
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

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

  const coinSound = new Audio("assets/sounds/coin.mp3");
  const starSound = new Audio("assets/sounds/star.mp3");
  const winSound  = new Audio("assets/sounds/win.mp3");

  let playerCanvas = {};
  let groupCanvas, coinCanvas, starCanvas;
  let mazeData = null;

  const player = { x:50, y:65, speed: isMobile ? 4.5 : 3, dir:"right", w:0, h:0 };
  const group  = { x:430, y:300, w:0, h:0 };
  const coin   = { x:300, y:90, w:24, h:24, taken:false, flip:0 };
  const star   = { x:200, y:405, w:24, h:24, taken:false, flip:0 };

  let finished = false;
  let winAlpha = 0;
  let endButton = null;

  function removeLightBg(img){
    const c=document.createElement("canvas");
    const cx=c.getContext("2d");
    c.width=img.naturalWidth;
    c.height=img.naturalHeight;
    cx.drawImage(img,0,0);
    const d=cx.getImageData(0,0,c.width,c.height);
    for(let i=0;i<d.data.length;i+=4){
      if((d.data[i]+d.data[i+1]+d.data[i+2])/3>235)
        d.data[i+3]=0;
    }
    cx.putImageData(d,0,0);
    return c;
  }

  let loadedCount = 0;
  function checkAllLoaded(){
    loadedCount++;
    if(loadedCount === 4){
      for(let d in playerImgs){
        playerCanvas[d] = removeLightBg(playerImgs[d]);
      }
      player.w = playerCanvas.right.width * PLAYER_SCALE;
      player.h = playerCanvas.right.height * PLAYER_SCALE;
    }
  }

  playerImgs.front.onload = checkAllLoaded;
  playerImgs.back.onload  = checkAllLoaded;
  playerImgs.left.onload  = checkAllLoaded;
  playerImgs.right.onload = checkAllLoaded;

  groupImg.onload=()=>{
    groupCanvas=removeLightBg(groupImg);
    group.w=groupCanvas.width*GROUP_SCALE;
    group.h=groupCanvas.height*GROUP_SCALE;
  };

  coinImg.onload=()=>coinCanvas=removeLightBg(coinImg);
  starImg.onload=()=>starCanvas=removeLightBg(starImg);

  mazeImg.onload=()=>{
    ctx.drawImage(mazeImg,0,0,SIZE,SIZE);
    mazeData=ctx.getImageData(0,0,SIZE,SIZE);
    loop();
  };

  function isWall(x,y,w,h){
    if(!mazeData) return false;
    const fw=w*0.5;
    const fh=h*0.2;
    const fx=x+(w-fw)/2;
    const fy=y+h-fh;
    const data=mazeData.data;

    for(let i=0;i<fw;i++){
      for(let j=0;j<fh;j++){
        const px=Math.floor(fx+i);
        const py=Math.floor(fy+j);
        if(px<0||py<0||px>=SIZE||py>=SIZE) continue;
        const idx=(py*SIZE+px)*4;
        if(data[idx]<40&&data[idx+1]<40&&data[idx+2]<40)
          return true;
      }
    }
    return false;
  }

  const key={up:false,down:false,left:false,right:false};

  window.addEventListener("keydown",e=>{
    if(e.key==="ArrowUp")key.up=true;
    if(e.key==="ArrowDown")key.down=true;
    if(e.key==="ArrowLeft")key.left=true;
    if(e.key==="ArrowRight")key.right=true;
  });

  window.addEventListener("keyup",e=>{
    if(e.key==="ArrowUp")key.up=false;
    if(e.key==="ArrowDown")key.down=false;
    if(e.key==="ArrowLeft")key.left=false;
    if(e.key==="ArrowRight")key.right=false;
  });

  function collide(a,b){
    return a.x<b.x+b.w &&
           a.x+a.w>b.x &&
           a.y<b.y+b.h &&
           a.y+a.h>b.y;
  }

  function update(){
    if(!finished){
      let dx=0, dy=0;
      if(key.left){ dx-=1; player.dir="left"; }
      if(key.right){ dx+=1; player.dir="right"; }
      if(key.up){ dy-=1; player.dir="back"; }
      if(key.down){ dy+=1; player.dir="front"; }

      const nx=player.x+dx*player.speed;
      const ny=player.y+dy*player.speed;

      if(!isWall(nx,player.y,player.w,player.h)) player.x=nx;
      if(!isWall(player.x,ny,player.w,player.h)) player.y=ny;

      coin.flip+=0.15;
      star.flip+=0.15;

      if(!coin.taken&&collide(player,coin)){ coin.taken=true; coinSound.play(); }
      if(!star.taken&&collide(player,star)){ star.taken=true; starSound.play(); }

      if(coin.taken&&star.taken&&collide(player,group)){
        finished=true;
        winSound.play();
      }
    }

    if(finished && winAlpha<1) winAlpha+=0.02;
  }

  function draw(){
    ctx.clearRect(0,0,SIZE,SIZE);
    ctx.drawImage(mazeImg,0,0,SIZE,SIZE);

    if(!coin.taken&&coinCanvas){
      ctx.save();
      ctx.translate(coin.x+coin.w/2,coin.y+coin.h/2);
      ctx.scale(Math.cos(coin.flip),1);
      ctx.drawImage(coinCanvas,-coin.w/2,-coin.h/2,coin.w,coin.h);
      ctx.restore();
    }

    if(!star.taken&&starCanvas){
      ctx.save();
      ctx.translate(star.x+star.w/2,star.y+star.h/2);
      ctx.scale(Math.cos(star.flip),1);
      ctx.drawImage(starCanvas,-star.w/2,-star.h/2,star.w,star.h);
      ctx.restore();
    }

    if(groupCanvas)
      ctx.drawImage(groupCanvas,group.x,group.y,group.w,group.h);

    const img=playerCanvas[player.dir];
    if(img)
      ctx.drawImage(img,player.x,player.y,player.w,player.h);

    if(finished){
      ctx.fillStyle="rgba(255,214,231,"+winAlpha*0.8+")";
      ctx.fillRect(0,0,SIZE,SIZE);

      ctx.fillStyle="black";
      ctx.textAlign="center";
      ctx.font="bold 36px Arial";
      ctx.fillText("YAY 🎉 You Found Us!",SIZE/2,SIZE/2-40);

      ctx.font="22px Arial";
      ctx.fillText("Now let's open the present 🎁",SIZE/2,SIZE/2);
    }
  }

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }
}

/* =================================================
   ================== PAGE 4 =======================
================================================= */

const box = document.getElementById("openBox");
const wall = document.getElementById("memoryWall");

if (box && wall) {

  const text = document.getElementById("centerText");
  const openText = document.querySelector(".open-text");

  box.addEventListener("click", function () {

    box.style.opacity = "0";
    if (openText) openText.style.opacity = "0";

    setTimeout(function () {
      box.style.display = "none";
      if (openText) openText.style.display = "none";
      wall.classList.add("show");
    }, 600);

    setTimeout(function () {
      if (text) text.style.opacity = "1";
    }, 4500);

    const frames = document.querySelectorAll(".frame");

    frames.forEach(function (frame, index) {
      const slides = frame.querySelectorAll(".slide");
      let current = 0;

      setInterval(function () {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
      }, 4500 + (index * 700));
    });

  });
}

});
