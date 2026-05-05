let index = 0;
let items = [];
let mode = "";

/* NAV */
function goMenu(){
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function backMenu(){
  hideAll();
  document.getElementById("menu").classList.remove("hidden");
}

function hideAll(){
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("viewer").classList.add("hidden");
  document.getElementById("selfie").classList.add("hidden");
}

/* GALERÍAS */
function openGallery(type){

  hideAll();
  document.getElementById("viewer").classList.remove("hidden");

  mode = type;
  index = 0;

  if(type === "isabella"){
    items = Array.from({length:14}, (_,i)=>`img/isabella${i+1}.jpg`);
  }

  if(type === "amor"){
    items = Array.from({length:4}, (_,i)=>`img/amor${i+1}.jpg`);
  }

  if(type === "feliz"){
    items = Array.from({length:4}, (_,i)=>`img/feliz${i+1}.jpg`);
  }

  render();
}

/* RENDER */
function render(){

  const c = document.getElementById("content");
  let file = items[index];

  if(file && file.includes(".mp4")){
    c.innerHTML = `<video controls autoplay src="${file}"></video>`;
  } else {
    c.innerHTML = `<img src="${file}" onclick="fullscreen(this.src)">`;
  }
}

/* FULLSCREEN SIMPLE */
function fullscreen(src){
  const w = window.open("");
  w.document.write(`<img src="${src}" style="width:100%">`);
}

/* NAV */
function next(){
  if(index < items.length - 1){
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

/* SELFIE */
function openSelfie(){
  hideAll();
  document.getElementById("selfie").classList.remove("hidden");

  navigator.mediaDevices.getUserMedia({video:true})
  .then(stream=>{
    document.getElementById("cam").srcObject = stream;
  });
}

/* CAPTURE */
function capture(){

  const video = document.getElementById("cam");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video,0,0);

  const now = new Date().toLocaleString();

  ctx.fillStyle = "white";
  ctx.fillRect(0, canvas.height-120, canvas.width, 120);

  ctx.fillStyle = "#ff2e63";
  ctx.font = "24px sans-serif";
  ctx.fillText("MUY FELIZ DÍA MAMÁ ❤️", 20, canvas.height-80);

  ctx.fillStyle = "#333";
  ctx.font = "16px sans-serif";
  ctx.fillText("Gracias por ser mi mamá", 20, canvas.height-40);

  ctx.fillText(now, 20, canvas.height-20);

  const img = canvas.toDataURL("image/png");

  document.getElementById("result").innerHTML = `
    <img src="${img}" style="width:100%;border-radius:15px;">
    <br><br>
    <a class="btn" download="mama.png" href="${img}">Guardar</a>
  `;
}