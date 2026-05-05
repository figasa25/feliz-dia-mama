let contenido;

document.addEventListener("DOMContentLoaded", () => {

  contenido = document.getElementById("contenido");

  const btn = document.getElementById("btnStart");

  if (!btn) {
    console.error("Botón de inicio no encontrado");
    return;
  }

  btn.addEventListener("click", startApp);

  console.log("APP INICIALIZADA OK");
});

/* INICIO */
function startApp() {

  const hero = document.getElementById("hero");
  const app = document.getElementById("app");

  if (hero) hero.style.display = "none";
  if (app) app.classList.remove("hidden");

  const audio = document.getElementById("musica");
  if (audio) {
    audio.play().catch(() => {});
  }

  inicio();
}

/* INICIO UI */
function inicio() {
  contenido.innerHTML = `
    <h2>Mamá ❤️ hoy es tu día</h2>
    <img src="img/isabella2.jpg" onclick="verImg(this.src)">
    <br><br>
    <button class="btn" onclick="menu()">Continuar</button>
  `;
}

/* MENÚ */
function menu() {
  contenido.innerHTML = `
    <h2>Elegí 💭</h2>
    <button class="btn" onclick="verIsabella()">👶 Isabella</button>
    <button class="btn" onclick="verAmor()">❤️ Amor</button>
    <button class="btn" onclick="verFeliz()">😊 Diversión</button>
    <button class="btn" onclick="selfie()">📸 Selfie</button>
  `;
}

/* GALERÍA ISABELLA */
function verIsabella() {
  let html = `<div class="grid">`;
  for (let i = 1; i <= 14; i++) {
    html += `<img src="img/isabella${i}.jpg" onclick="verImg(this.src)">`;
  }
  html += `</div>`;
  contenido.innerHTML = html;
}

/* GALERÍA AMOR */
function verAmor() {
  let html = `<div class="grid">`;
  for (let i = 1; i <= 4; i++) {
    html += `<img src="img/amor${i}.jpg" onclick="verImg(this.src)">`;
  }
  html += `</div>`;
  contenido.innerHTML = html;
}

/* GALERÍA + VIDEO */
function verFeliz() {
  let html = `<div class="grid">`;
  for (let i = 1; i <= 4; i++) {
    html += `<img src="img/feliz${i}.jpg" onclick="verImg(this.src)">`;
  }
  html += `</div>
  <video controls playsinline src="video/feliz1.mp4"></video>`;

  contenido.innerHTML = html;
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
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.add("hidden");
}

/* SELFIE */
function selfie() {

  contenido.innerHTML = `
    <h2>📸 Selfie con Isa</h2>
    <video id="camara" autoplay playsinline></video>
    <br><br>
    <button class="btn" onclick="capturar()">Tomar foto</button>
    <canvas id="canvas" class="hidden"></canvas>
  `;

  navigator.mediaDevices.getUserMedia({ video: true })
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

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  ctx.fillStyle = "white";
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  ctx.fillStyle = "#ff2e63";
  ctx.font = "24px sans-serif";
  ctx.fillText("Muy Feliz Día Mamá ❤️", 20, canvas.height - 60);

  ctx.fillStyle = "#333";
  ctx.fillText("Gracias por ser mi mamá", 20, canvas.height - 30);

  const img = canvas.toDataURL("image/png");

  contenido.innerHTML = `
    <img src="${img}">
    <br><br>
    <a href="${img}" download="selfie.png" class="btn">Guardar</a>
  `;
}