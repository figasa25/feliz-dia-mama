let contenido;

document.addEventListener("DOMContentLoaded", () => {

  contenido = document.getElementById("contenido");

  console.log("APP INICIALIZADA OK");

  const btn = document.getElementById("btnStart");

  if (btn) {
    btn.addEventListener("click", startApp);
  }

  // AUTO START (anti pantalla negra)
  setTimeout(() => {
    console.log("AUTO START ACTIVADO");
    startApp();
  }, 800);

  // fallback visual obligatorio
  renderSafe();
});

/* FALLBACK */
function renderSafe() {
  const c = document.getElementById("contenido");
  if (!c) return;

  c.innerHTML = `
    <h2>💖 Cargando...</h2>
    <p>Si no ves el menú, se iniciará automáticamente.</p>
  `;
}

/* START */
function startApp() {

  const hero = document.getElementById("hero");
  const app = document.getElementById("app");

  if (hero) hero.style.display = "none";
  if (app) app.style.display = "block";

  inicio();
}

/* INICIO */
function inicio() {

  if (!contenido) return;

  contenido.innerHTML = `
    <h2>Mamá ❤️ hoy es tu día</h2>
    <img src="img/isabella2.jpg"
      onerror="this.style.display='none'"
      onclick="verImg(this.src)">
    <br><br>
    <button class="btn" onclick="menu()">Continuar</button>
  `;
}

/* MENU */
function menu() {
  contenido.innerHTML = `
    <h2>Elegí 💭</h2>
    <button class="btn" onclick="verIsabella()">👶 Isabella</button>
    <button class="btn" onclick="verAmor()">❤️ Amor</button>
    <button class="btn" onclick="verFeliz()">😊 Diversión</button>
    <button class="btn" onclick="selfie()">📸 Selfie</button>
  `;
}

/* GALERÍAS */
function verIsabella() {
  contenido.innerHTML = build("isabella", 14);
}

function verAmor() {
  contenido.innerHTML = build("amor", 4);
}

function verFeliz() {
  contenido.innerHTML = build("feliz", 4) + `
    <video controls playsinline src="video/feliz1.mp4"
      onerror="this.style.display='none'"></video>`;
}

/* BUILDER */
function build(prefix, count) {
  let html = `<div class="grid">`;

  for (let i = 1; i <= count; i++) {
    html += `
      <img src="img/${prefix}${i}.jpg"
        onerror="this.style.display='none'"
        onclick="verImg(this.src)">
    `;
  }

  html += `</div>`;
  return html;
}

/* LIGHTBOX */
function verImg(src) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("imgFull");

  if (!lb || !img) return;

  lb.classList.remove("hidden");
  img.src = src;
}

function cerrarLightbox() {
  document.getElementById("lightbox")?.classList.add("hidden");
}

/* SELFIE */
function selfie() {

  contenido.innerHTML = `
    <h2>📸 Selfie</h2>
    <video id="camara" autoplay playsinline></video>
    <br><br>
    <button class="btn" onclick="capturar()">Tomar foto</button>
    <canvas id="canvas" class="hidden"></canvas>
  `;

  navigator.mediaDevices?.getUserMedia({ video: true })
    .then(stream => {
      const video = document.getElementById("camara");
      if (video) video.srcObject = stream;
    })
    .catch(() => {
      contenido.innerHTML = "<h3>No se pudo acceder a la cámara</h3>";
    });
}

/* CAPTURA */
function capturar() {

  const video = document.getElementById("camara");
  const canvas = document.getElementById("canvas");

  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth || 300;
  canvas.height = video.videoHeight || 300;

  ctx.drawImage(video, 0, 0);

  ctx.fillStyle = "white";
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  ctx.fillStyle = "#ff2e63";
  ctx.font = "20px sans-serif";
  ctx.fillText("Feliz Día Mamá ❤️", 20, canvas.height - 60);

  const img = canvas.toDataURL("image/png");

  contenido.innerHTML = `
    <img src="${img}">
    <br><br>
    <a class="btn" href="${img}" download="selfie.png">Guardar</a>
    <br><br>
    <button class="btn" onclick="menu()">Volver</button>
  `;
}