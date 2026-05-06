let items = [], index = 0;
let currentAudio = null;

/* ===== INICIO ULTRA SEGURO ===== */
document.addEventListener("DOMContentLoaded", ()=>{

  console.log("APP INICIADA");

  startHearts();

  // salir del intro SIEMPRE
  setTimeout(()=>{
    goMenu();
  }, 3500);

});

/* ===== ESCENAS ===== */
function show(id){
  document.querySelectorAll(".scene").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ===== MENU ===== */
function goMenu(){

  console.log("ENTRO MENU");

  show("menu");

  // sonido principal
  playAudio("feliz");

}

/* ===== CORAZONES ===== */
function startHearts(){
  const c=document.getElementById("bg");
  const ctx=c.getContext("2d");

  c.width=innerWidth;
  c.height=innerHeight;

  let h=[];

  for(let i=0;i<40;i++){
    h.push({
      x:Math.random()*c.width,
      y:Math.random()*c.height,
      s:Math.random()*20+10,
      vy:Math.random()*-1-0.5
    });
  }

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);

    h.forEach(o=>{
      ctx.font=o.s+"px Arial";
      ctx.fillText("❤️",o.x,o.y);
      o.y+=o.vy;
      if(o.y<0)o.y=c.height;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

/* ===== AUDIO SYSTEM ===== */
function playAudio(name){

  if(currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = document.getElementById(name);

  if(audio){
    audio.volume = 0.6;
    audio.play().catch(()=>{});
    currentAudio = audio;
  }
}

/* ===== BOTON EMOCIONARTE ===== */
function emocionarte(){

  const audios = ["sos", "gusta"];
  const random = audios[Math.floor(Math.random()*audios.length)];

  playAudio(random);

}

/* ===== GALERIA ===== */
function openGallery(type){

  show("viewer");

  if(type==="familia"){
    items = ["img/feliz1.jpg","img/feliz2.jpg","img/feliz3.jpg","img/feliz4.jpg"];
  }

  if(type==="felicidad"){
    items = ["img/amor1.jpg","img/amor2.jpg","img/amor3.jpg","img/amor4.jpg"];
  }

  if(type==="tesoro"){
    items = Array.from({length:14},(_,i)=>`img/isabella${i+1}.jpg`);
  }

  index = 0;
  render();
}

function render(){
  document.getElementById("viewerImg").src = items[index];
}

function next(){ if(index < items.length-1){ index++; render(); }}
function prev(){ if(index > 0){ index--; render(); }}

function back(){
  show("menu");
  playAudio("feliz");
}

/* ===== COMPILADO ===== */
function compilado(){

  show("viewer");

  playAudio("musica"); // fondo continuo

  items = [
    ...Array.from({length:14},(_,i)=>`img/isabella${i+1}.jpg`),
    ...Array.from({length:4},(_,i)=>`img/amor${i+1}.jpg`),
    ...Array.from({length:4},(_,i)=>`img/feliz${i+1}.jpg`)
  ];

  index = 0;
  render();

}

/* ===== SELFIE ===== */
function openSurprise(){
  show("selfie");

  navigator.mediaDevices.getUserMedia({video:true})
  .then(stream=>{
    cam.srcObject = stream;
  });
}

function takePhoto(){

  const ctx = canvas.getContext("2d");

  canvas.width = cam.videoWidth;
  canvas.height = cam.videoHeight;

  ctx.drawImage(cam,0,0);

  ctx.lineWidth = 25;
  ctx.strokeStyle = "#ff2e63";
  ctx.strokeRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="white";
  ctx.font="22px cursive";
  ctx.fillText("Feliz día mamá ❤️",20,canvas.height-60);
  ctx.fillText("Te amo - Isabela",20,canvas.height-30);

  const fecha = new Date().toLocaleString();
  ctx.font="14px sans-serif";
  ctx.fillText(fecha,20,canvas.height-10);

  const img = canvas.toDataURL();

  result.innerHTML = `
    <img src="${img}" style="width:100%">
    <a href="${img}" download>Guardar</a>
  `;
}