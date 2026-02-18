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

window.onload = function () {

  const openBox = document.getElementById("openBox");
  const memoryWall = document.getElementById("memoryWall");
  const openText = document.querySelector(".open-text");

  if (openBox && memoryWall) {
    openBox.onclick = function () {
      openBox.style.display = "none";
      openText.style.display = "none";
      memoryWall.style.display = "grid";
    };
  }

};

window.addEventListener("DOMContentLoaded", function () {

  const letters = [
`From Adeva

Happy birthday, kak Virgin 🤍
Di usia yang baru ini, kiranya kakak semakin hidup dalam
pewahyuan kasih karunia Tuhan yang penuh dan sempurna. Bukan oleh usaha sendiri,
melainkan oleh anugerah-Nya yang memampukan kakak setiap hari.

"Cukuplah kasih karunia-Ku bagimu,
sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna."
(2 Korintus 12:9)

Kiranya kak Virgin semakin menyadari bahwa kak Virgin sangat dikasihi Tuhan,
diterima sepenuhnya di dalam Kristus, dan hidup dalam damai sejahtera-Nya.
Semoga hidup kakak dipenuhi sukacita, kesehatan, dan kemenangan karena 
anugerah Tuhan yang berlimpah. God bless you 🤍
✨생일 축하해요! :v`,

`From Alene

Blessed Birthday ka!! Declaring that everything that you do you shall prosper!
In every single step that you take there will be extrace wisdom,
grace and favour from Daddy God for you.
His blessings shall hunt you down for the rest of your life.
Love you from the moon to back 🫶`,

`From Alexa

Happy birthday, kak Virgin. You are a kind person who makes everyone around you comfortable.
I wish you a good birthday and hope that the next time you take a shower, the water temperature
is just right.`,

`From Angel

Happy birthdaay kaa Virgin, i wish u all the happiness in the world!!
Thankyouu soo much yaa uda tmnin aku, bimbing aku selama di gereja,
smoga apa yg km harepin bisa terkabul di birthday km thun nii 😚😚,
God bless u always loaavv 🤍🎂`,

`From Angela

Happy birthday, kak Virgin! 🎉✨ I hope this new chapter brings u bigger dreams, louder laughs, and endless
wins in everything you do. May life treat u gently, success chase u nonstop, and happiness stick
with u like your favorite playlist on repeat. Enjoy ur day to the fullest—u truly deserve all the love and good 
things coming your way! God bless u 💖🔥`,

`From Anna

Happieee Birthday Kak Virgin!! 🎉✨`,

`From Bara

Happy birthday kak, May you always be blessed with wisdom and happiness from God.`,

`From Bryan

Selamat ulang tahun kak Virgin, semoga sehat selalu dan panjang umur, dan kerjaannya lancar, Tuhan Yesus memberkati.`,

`From Calvin

Happy birthday kak Virgin 🥳🥳🥳 sori jarang dateng ke ga😅😅, semooga panjang umur sehat selalu
dan hepi everydayyyyy. 🎉🎉🎉`,

`From Celine

Happy birthday ka Virgin!! Wyatb for what's to come, live long and prosper and God bless u 💕💕🎉🎉`,

`From Celine Liana

Haii ka virginn inii dari Celinee happyy birthday  kaa thankyouu bangett kakk dari awal pertama nyoba² ikut camp 
ditemenin sama mima andd kak virginn yang welcome bangett ke semua orangg, i wish ka virginn bisa selalu
jadi orang yang sabarr, ramah sama kita semuaa and orang lain, semoga kak virgin juga makinn cantikk
dan bisa menjalani hidup kak virgin dengan lancarr dan damai Aminn, Puji Tuhan aku seneng bangett tiap 
ngobrol sama ka virgin walaupun baru nyoba² ikut mima tapi tiba tiba udah ada yang nyambut aku sebaik inii 
thankyouu kaa virginn wyatb 🫂🤩🥳`,

`From Clarina

Happy birthdayy ka Virgin God bless u wish you all the best, may this year brings you lots of joy, peace,
and strength 🤍🤍`,

`From Darlane kecil

Blessed Birthday Kak Virgin, semoga kerjanya lancar selalu dan sehat senantiasa ❤️
(ga gitu tau sih mau bilang ap wkwkwk sbb... serius bingung klo mau ngucapin hbd sama org lain...)`,

`From Darrel

Blessed Birthday kak Virgin! I declare that God's grace surround you always and guiding and strengthening you
every day and lead you closer to His purpose.`,

`From Devon

Hai ci Virgin, Happy Birthday ya 🥳🥳. Semogaa cici selalu sehat, apa yang cici lakukan selalu dilancarkan, semua keinginan
terkabul, dan selalu diberkati melimpah sama Tuhan. Thankyou ya ci udah jadi kakak sekaligus pembimbing yang baik ke kita semua`,

`From Dylan

Happy Birthday kak Virgin, kiranya Kasih Karunia Tuhan dan damai sejahtera tetap menyertai kak Virgin, semoga panjang umur 
dan sehat selalu. God Bless You 🙏`,

`From El

Happy birthdayy kak Virgin i hope u have a blessed birthday, also i want to tell that Jesus loves u
soo much He will always provide for u, He set up good plans for u, He will give miracles for u, His love for u 
is overflowing, He's there for your highs and lows. God bless you kak Virgin have a blessed birthdayy! 😇😇`,

`From Estelle

Happy birthday, Ka Virgin! 🎉🤍
Di hari yang spesial ini, kiranya kasih dan penyertaan Tuhan selalu memenuhi setiap langkah kakak. Terima kasih sudah
menjadi kakak yang menguatkan dan membawa banyak berkat bagi orang-orang di sekitar.
"TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia; 
TUHAN menghadapkan wajah-Nya kepadamu dan memberi engkau damai sejahtera." — Bilangan 6:24-26
Tetap jadi terang di mana pun Kakak berada, dan terus berjalan dalam rencana Tuhan yang indah. Tuhan Yesus memberkati selalu ✨`,

`From Eto

Happy Birthday Kak Virgin, semoga semakin sehat dan sukses selalu and don't forget that God always bless you.`,

`From Feifei

Happiest bday, kaa Virgin! wishing you good health, peace of mind, and all the good things u deserve in this
new year of urlife. May everything u're working toward slowly fall into place, and may ur days ahead feel
lighter and kinder. Enjoy ur special day kaakk! Jbu 🤍`,

`From Fidele

Happy Birthday Ka Virgin ‼️🎂 Aku doain di usia yang baru ini, semua harapan baik bisa tercapai dan selalu dilimpahi
sukacita. GBU Kakk ✨💕`,

`From Gloria

happyy birthdayyy ka Virginnn!! Wishing you a blessed year aheaad. May God continue to strengthen you, guide you in
every step, and fill your life with His peace and joy. Thank you for being such an inspiration and a blessing
to many people. God bless you always kaa Virginn 🤍`,

`From Gracelene

Happy birthday kak Virgin! I pray all your wishes come true this year. I hope your day goes well! You deserve
a joyful and special birthday 🎂❤️`,

`From Jason

Happy birthday kak Virgin dalam nama Tuhan Yesus kakak diberkati Tuhan dan panjang umur`,

`From Jedi

Hi kakk Virgin, Blessed birthday 🥳🥳🥳. Thank you for being good leader terutama buat aku. Declaring 29:11 for u
[11] Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN,
yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.`,

`From Jeremiah

Blessed birthday Kak Virgin 🥳🥳🥳 May the Lord's blessing always be upon you to protect, strengthen, and guides
you through every challenges. Wish you all the best!!!`,

`From Jeremy JAC

happy bday ci virgin, I believe in the name of Jesus that you are blessed in this special day, hope u do better in
ur jobs and in every aspect of ur live, GBU`,

`From Jessica

Selamat ulang tahun Kaa Virginnn 💗💗!! Semoga di hari yang sangat spesial inii, kakaa mendapatkan banyak rezeki dan 
panjang umur (≧▽≦)! Aku berharap kakak mendapatkan kebahagiaan, keharmonisan dalam kebersamaan dan perubahan baik 
dalam hidup kakaa 😊`,

`From Jessica Kimberly

Happy birthday kak Virgin! 🥳🥳 Terima kasih udah bimbing kita semua dalam Yesus. Kak Virgin selalu sabar mendukung kita
lebih dekat dengan Tuhan dan mengajar kita tentang kasihNya. Semoga kakak panjang umur, sehat, dan sukses selalu. God bless youu 🥳🎉`,

`From Joa

Happy bday kak Virgin, sukses slalu, God bless you`,

`From Jonathan Lim

Selamat ulang tahun kak Virgin panjang umur semoga sehat selalu semoga semua harapam dan doa dikabulkan di tahun ini, amin`,

`From Jovi

Happy Birthday Ka Virgin`,

`From Kayara

Blessed birthday Ka Virgin!! May all your dreams come true and God Bless!!`,

`From Kayla

Hai kaa, aku Kaylaa. Happiest birthday to youu 🫶 semoga sehat sehat terus yaa. Mungkin kaka blom kenal aku karna baru join
pas natal hehe. But glad to know u kaa. God bless uu 🫶🫶`,

`From Kinar

Blessed birthday ci Virgin ❤️🩷❤️🩷❤️🩷 God bless you may this birthday be as amazing as you are!!
I hope this year treats you super sososo well and may your relationship with Jesus just keep getting better. I pray you
always rely on HIm and trust that He has wonderful plans for you on your birthday and always 🫶🫶
You remind me so much of a proverbs 31 woman so i really hope you're always surrounded by loved one :o love you ci`,

`From Lyonell JAC

Hii kak Virgin happy birthday, may God always bless you`,

`From Michelle

Happy Birthday Kak Virgin!
May God bless you with abundant health, joy, and peace in your birthday. Thank you for being such a kind, caring, and inspiring
person in our CG. May God continue to guide your steps, strengthen your faith, and fill your life with His endless love and grace.
Stay blessed always Kak Virgin 🙏✨`,

`From Miguel

Hi kak Virgin, this is from migel!, i wanna wish you a happy Blessed birthday!!!, Hope today tomorrow and forever you will
have a lot og joy, and always be healthy with God in Christ!`,

`From Nathan

Selamat ulang tahun and bless birthday Kak Virgin 🥳🥳🥳`,

`From Nikita

Blessed birthday kak Virgin, wish u all the best kak Virgin, all kak Virgin work will be easy by God ya kak 🙇‍♀️🤍`,

`From Oliv

Your big day ka Virgin! Remember that you are loved by the people around you, and above all, you're loved by DaddyGod :D
He will make all the crooked places straight, and show His glory, even in times when it seems unlikely. ESPECIALLY in those times.`,

`From Oliver

Selamat Ulang tahun kak Virgin!! Semoga hidup kakak berjalan dengan baik, sehat, lancar, menyenangkan, dan keren semoga kakak juga panjang umur dan damai sejahtera, God bless you ka!`,

`From Raphael

Happy Birthday Kak Virgin, God Bless You`,

`From Ryan

happy birthday kak virgin! sehat selalu dan panjang umur ya`,

`From Samuel Bryan 

Blessed Birthday Kak Virgin!!! Panjang umur and sehat selalu, Surely goodness and mercy will follow you for the rest of your life. Praying for more open doors and new opportunities and experiences this year! Have a happy birthday 🥳🥳🥳🥳🔥🔥🔥🔥`,

`From Shalom

Haii kak Virginnn 👋👋
Happy Birthdayy yaaa 🥳🥳
Merry Christmas and happy new year juga kak Virginn 🎉
Thankyou ya kakk udah nemenin Shalom di
Grace Army dari awal joinn 😊😊❤️
Semoga di tahun 2026 ini kakak bisa mencapai goals kak Virginn, diberi kelimpahan rezeki, dan semakin dekat kepada Tuhann🤍🤍
Sekali lagi have a blessed birthday kak
Virginn, God bless youu 🥳🎂❤️`,

`From Thania

Selamat ulang tahun kak Virginn, kiranya Tuhan Yesus selalu memberkati, memberi kesehatan, sukacita, dan damai sejahtera dalam setiap langkah.`,

`From Theo

Happy Birthday Kak Virgin!Aku mau ngucapin Selamat Ulang Tahun kak. Semoga Kaka selalu di berkati oleh Tuhan God Bless You Kak Virgin sehat selalu!`,

`From Victory JAC

Happy birthday kak Virgin, semoga sehat selalu, diberikan panjang umur dan selalu dalam penyertaan Tuhan Yesus. Terimakasih sudah menjadi CGL yang baik. Dan semoga selalu diberikan kemudahan oleh Tuhan.`,

`From Xander

Happy birthday kak Virgin Tuhan Yesus memberkati 🥳`,

`From Yemima

haiihaiii ka virgin, ini mima that tiffany yemima yang suka tiba tiba jailin ka virgin, ngintilin ka virgin 24/7 di gereja, apalagi pas camp 2024 😹 first of all happy birthday ka virgin, asik ni yaa udah bertambah umur 👀❗️ thank you ya ka for being the best CGL in my heart since that youth revival camp, dream camp 2024! i didn't asked God buat di 2024 kenal ama kaka, but He knows whats best for me and kaka! (love light of the world and greatly blessed 💟) pas aku baru pertama kali camp di Grace Army itu aku ga deket ataupun kenal ama siapa", ka virgin itu salah satu orang yang Tuhan rencanain buat deket ama akuuu 🥲🫶🏻 kaka mau dengerin aku cerita tiap minggu, mau aku ajak ngobrol tiap ketemu alias kaka dengerin yappingan aku, bahkan aku kadang suka tiba-tiba ngchat gara-gara mau cerita aja giru atau nanyain kabar kakaa 🫣! pokoknya semenjak aku dikenalin ke kaka ama Tuhan, aku jadi lebih berani buat dateng ke Grace Army lebih rutin/sering, lebih berani bergaul ama orang-orang di gereja, terus lebih berani buat sharing pas CG depan kingdom friends yang lain tanpa buka hp! sayang banget ama kak virgin 🫠💟 aku berdoa di umur ka virgin yang sekarang, ka virgin makin panjang umur, sehat selalu, makin rajin pelayanan di gereja, pekerjaan kaka selalu lancar and declaring all the good things from God buat kaka, apalagi the things we can't see but we know that He is working on something  in your life and making something enter in your life ka! pokoknya thank you again ya ka, soalnya Tuhan udah bisa buat kaka jd berkat yang cukup amat besar di hidup aku 🔥 can't imagine kalo waktu 2024 ak engga kenal ama kaka.. aku sekarang gimana cobaa 🥹??? overall always be the ka virgin yang aku kenal ya kaa, that kak virgin yang happy ngomongin segala hal yang Tuhan telah lakuin di hidup kaka, kak virgin yang caring banget sama perasaan-perasaan kita, kak virgin yang selalu ingetin kita tentang betapa baiknya Dia ke kitaa 🫂🫂 so yeah thats from me kaa ^^ have a blessed year ya kak virgin my beloved CGL 🙌🏻😆`,
];

  const grid = document.getElementById("lettersGrid");
  const modal = document.getElementById("letterModal");
  const content = document.getElementById("letterContent");

  if (!grid) return; // supaya tidak error di page lain

  letters.forEach((text) => {
    const div = document.createElement("div");
    div.classList.add("envelope");

    div.innerHTML = `<img src="assets/images/envelope.png">`;

    div.addEventListener("click", () => {
  content.innerHTML = text.replace(
    /^(.+?)\n/,
    "<strong>$1</strong><br><br>"
  );
  modal.classList.add("show");
});


    grid.appendChild(div);
  });

  modal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

});
