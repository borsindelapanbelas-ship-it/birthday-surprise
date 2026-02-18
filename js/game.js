window.addEventListener("DOMContentLoaded", () => {

/* =================================================
   ================== PAGE GAME ====================
================================================= */

const canvas = document.getElementById("gameCanvas");

if (canvas) {

  /* ===== STOP SCROLL & GESTURE ===== */
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";
  document.body.style.touchAction = "none";

  window.addEventListener("gesturestart", e => e.preventDefault());
  window.addEventListener("gesturechange", e => e.preventDefault());
  window.addEventListener("gestureend", e => e.preventDefault());

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
  canvas.style.touchAction = "none";

  const PLAYER_SCALE = 0.12;
  const GROUP_SCALE  = 0.09;
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  /* ================= IMAGES ================= */

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

  const coinSound = new Audio("assets/sounds/coin.mp3");
  const starSound = new Audio("assets/sounds/star.mp3");
  const winSound  = new Audio("assets/sounds/win.mp3");

  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    [coinSound, starSound, winSound].forEach(s=>{
      s.play().then(()=>{s.pause();s.currentTime=0;}).catch(()=>{});
    });
    audioUnlocked = true;
  }

  document.addEventListener("touchstart", unlockAudio, { once: true });
  document.addEventListener("click", unlockAudio, { once: true });

  /* ================= OBJECTS ================= */

  let playerCanvas = {};
  let groupCanvas, coinCanvas, starCanvas;
  let mazeData = null;

 const player = { 
  x:50, 
  y:65, 
  speed: isMobile ? 2.8 : 3, 
  dir:"right", 
  w:40, 
  h:60,
  type:"player"
};
  const group  = { x:430, y:300, w:0, h:0 };
  const coin   = { x: 270, y:90, w:28, h:28, taken:false, flip:0 };
  const star   = { x:200, y:405, w:28, h:28, taken:false, flip:0 };

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

  Object.values(playerImgs).forEach(img=>{
    img.onload = checkAllLoaded;
    img.onerror = () => console.error("Image gagal load:", img.src);
  });

  groupImg.onload=()=>{
    groupCanvas=removeLightBg(groupImg);
    group.w=groupCanvas.width*GROUP_SCALE;
    group.h=groupCanvas.height*GROUP_SCALE;
  };

  coinImg.onload=()=>coinCanvas=removeLightBg(coinImg);
  starImg.onload=()=>starCanvas=removeLightBg(starImg);

  mazeImg.onload = () => {
    ctx.drawImage(mazeImg,0,0,SIZE,SIZE);
    mazeData = ctx.getImageData(0,0,SIZE,SIZE);
  };

 function isWall(x, y, w, h) {
  if (!mazeData) return false;

  const data = mazeData.data;

  const footHeight = h * 0.18;
  const footWidth  = w * 0.25;

  const startX = x + (w - footWidth) / 2;
  const startY = y + h - footHeight;

  for (let i = 0; i < footWidth; i += 3) {
    for (let j = 0; j < footHeight; j += 3) {

      const px = Math.floor(startX + i);
      const py = Math.floor(startY + j);

      if (px < 0 || py < 0 || px >= SIZE || py >= SIZE) continue;

      const idx = (py * SIZE + px) * 4;

      if (data[idx] < 40 && data[idx+1] < 40 && data[idx+2] < 40)
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

  window.addEventListener("touchend", ()=>{
    key.up=false;
    key.down=false;
    key.left=false;
    key.right=false;
  });

  if (isMobile) {

    const controls = document.createElement("div");
    controls.style.position = "fixed";
    controls.style.bottom = "20px";
    controls.style.left = "50%";
    controls.style.transform = "translateX(-50%)";
    controls.style.display = "grid";
    controls.style.gridTemplateColumns = "80px 80px 80px";
    controls.style.gap = "14px";
    controls.style.zIndex = "9999";
    controls.style.touchAction = "none";

    function btn(symbol, dir) {
      const b = document.createElement("div");
      b.innerHTML = symbol;
      b.style.background = "#ffb6d9";
      b.style.padding = "22px";
      b.style.textAlign = "center";
      b.style.borderRadius = "26px";
      b.style.fontSize = "24px";
      b.style.touchAction = "none";
      b.oncontextmenu = e => e.preventDefault();

      b.addEventListener("touchstart", (e)=>{
        e.preventDefault();
        key[dir]=true;
      }, { passive:false });

      b.addEventListener("touchend", (e)=>{
        e.preventDefault();
        key[dir]=false;
      }, { passive:false });

      b.addEventListener("touchcancel", ()=> key[dir]=false);

      return b;
    }

    controls.appendChild(document.createElement("div"));
    controls.appendChild(btn("⬆️","up"));
    controls.appendChild(document.createElement("div"));
    controls.appendChild(btn("⬅️","left"));
    controls.appendChild(btn("⬇️","down"));
    controls.appendChild(btn("➡️","right"));

    document.body.appendChild(controls);
  }

 function collide(a, b) {

  if (a.type === "player") {

    const footWidth = a.w * 0.4;
    const footHeight = a.h * 0.25;

    const foot = {
      x: a.x + (a.w - footWidth) / 2,
      y: a.y + a.h - footHeight,
      w: footWidth,
      h: footHeight
    };

    return foot.x < b.x + b.w &&
           foot.x + foot.w > b.x &&
           foot.y < b.y + b.h &&
           foot.y + foot.h > b.y;
  }

  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

  function update(){
    if(!finished){

      let dx=0;
      let dy=0;

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

    if (mazeImg.complete && mazeImg.naturalWidth !== 0)
      ctx.drawImage(mazeImg,0,0,SIZE,SIZE);
    else {
      ctx.fillStyle="#dff6ff";
      ctx.fillRect(0,0,SIZE,SIZE);
    }

    if(coinCanvas && !coin.taken){
      const s=Math.abs(Math.cos(coin.flip));
      ctx.save();
      ctx.translate(coin.x+coin.w/2,coin.y+coin.h/2);
      ctx.scale(s,1);
      ctx.drawImage(coinCanvas,-coin.w/2,-coin.h/2,coin.w,coin.h);
      ctx.restore();
    }

    if(starCanvas && !star.taken){
      const s=Math.abs(Math.cos(star.flip));
      ctx.save();
      ctx.translate(star.x+star.w/2,star.y+star.h/2);
      ctx.scale(s,1);
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
      ctx.font="bold 34px Arial";
      ctx.fillText("YAY 🎉 You Found Us!",SIZE/2,SIZE/2-40);

      ctx.font="20px Arial";
      ctx.fillText("Now let's open the present 🎁",SIZE/2,SIZE/2);

      if(winAlpha>=1){
        const radius=60;
        const btnX=SIZE/2;
        const btnY=SIZE/2+90;

        ctx.fillStyle="#ff8fcf";
        ctx.beginPath();
        ctx.arc(btnX,btnY,radius,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle="black";
        ctx.font="bold 16px Arial";
        ctx.fillText("OPEN 🎁",btnX,btnY+5);

        endButton={
          x:btnX-radius,
          y:btnY-radius,
          w:radius*2,
          h:radius*2
        };
      }
    }
  }

  canvas.addEventListener("click",(e)=>{
    if(!endButton) return;

    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(SIZE/rect.width);
    const my=(e.clientY-rect.top)*(SIZE/rect.height);

    const dx=mx-(endButton.x+endButton.w/2);
    const dy=my-(endButton.y+endButton.h/2);

    if(Math.sqrt(dx*dx+dy*dy)<=endButton.w/2)
      window.location.href="choose.html";
  });

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}
});

const openBox = document.getElementById("openBox");
const memoryWall = document.getElementById("memoryWall");

if(openBox){
  openBox.addEventListener("click", function(){
    openBox.style.display = "none";
    document.querySelector(".open-text").style.display = "none";
    memoryWall.style.display = "grid";
  });
}
