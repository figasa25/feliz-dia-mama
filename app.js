let items = [];
let index = 0;

/* INICIO */
function start(){
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");

  document.getElementById("musica")?.play().catch(()=>{});

  initHearts();
}

/* GALERÍAS */
function openGallery(type){

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("viewer").classList.remove("hidden");

  index = 0;

  if(type === "reir"){
    items = Array.from({length:14}, (_,i)=>`img/isabella${i+1}.jpg`);
  }

  if(type === "emocion"){
    items = Array.from({length:4}, (_,i)=>`img/amor${i+1}.jpg`);
  }

  if(type === "familia"){
    items = Array.from({length:4}, (_,i)=>`img/feliz${i+1}.jpg`);
  }

  render();
}

/* RENDER */
function render(){
  const c = document.getElementById("content");
  const file = items[index];

  if(!file) return;

  if(file.includes(".mp4")){
    c.innerHTML = `<video controls autoplay src="${file}"></video>`;
  } else {
    c.innerHTML = `
      <img src="${file}" onclick="fullscreen(this.src)">
      <br><button class="btn" onclick="download(this.previousElementSibling.src)">⬇ Descargar</button>
    `;
  }
}

/* FULLSCREEN */
function fullscreen(src){
  window.open(src,"_blank");
}

/* DOWNLOAD */
function download(src){
  const a = document.createElement("a");
  a.href = src;
  a.download = "mama.jpg";
  a.click();
}

/* NAV */
function next(){
  if(index < items.length-1){
    index++;
    render();
  }
}

function prev(){
  if(index > 0){
    index--;
    render();
  }
}

/* BACK */
function back(){
  document.getElementById("viewer").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

/* FINAL SORPRESA */
function finalSurprise(){
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("selfie").classList.remove("hidden");

  navigator.mediaDevices.getUserMedia({video:true})
  .then(stream=>{
    document.getElementById("cam").srcObject = stream;
  });
}

/* SELFIE FINAL */
function capture(){

  const video = document.getElementById("cam");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video,0,0);

  /* MARCO EMOCIONAL */
  ctx.fillStyle="rgba(255,182,193,0.85)";
  ctx.fillRect(0,canvas.height-160,canvas.width,160);

  ctx.fillStyle="white";
  ctx.font="28px cursive";
  ctx.fillText("Feliz Día Mamá!!!",20,canvas.height-120);

  ctx.font="20px cursive";
  ctx.fillText("Te amo ❤️ Isabella",20,canvas.height-80);

  ctx.font="16px sans-serif";
  ctx.fillText("Gracias por ser mi mamá",20,canvas.height-40);

  const img = canvas.toDataURL();

  document.getElementById("result").innerHTML=`
    <img src="${img}" style="width:100%;border-radius:20px">
    <a class="btn" download="mama.png" href="${img}">⬇ Guardar</a>
  `;
}

/* CORAZONES BG */
function initHearts(){
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const hearts = [];

  for(let i=0;i<50;i++){
    hearts.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      s:Math.random()*20+10,
      sp:Math.random()*1+0.5
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    hearts.forEach(h=>{
      ctx.font = `${h.s}px Arial`;
      ctx.fillText("❤️",h.x,h.y);

      h.y -= h.sp;
      if(h.y < -20){
        h.y = canvas.height;
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}