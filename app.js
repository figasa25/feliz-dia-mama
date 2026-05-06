/* =============================================
   SOFI ❤️ — APP.JS CINEMATIC PWA
   ============================================= */

/* ---- STATE ---- */
let currentScene  = "intro";
let galleryItems  = [];
let galleryIndex  = 0;
let currentAudio  = null;
let slideshowTimer = null;
let slideshowActive = false;
let camStream     = null;

/* ---- GALLERY DATA ---- */
const GALLERIES = {
  familia: {
    title: "En Familia",
    audio: "audio-gusta",
    items: [
      { type:"img", src:"img/amor1.jpg" },
      { type:"img", src:"img/amor2.jpg" },
      { type:"img", src:"img/amor3.jpg" },
      { type:"img", src:"img/amor4.jpg" },
      { type:"vid", src:"video/amor1.mp4", poster:"img/amor1.jpg" },
      { type:"vid", src:"video/amor2.mp4", poster:"img/amor2.jpg" },
    ]
  },
  felicidad: {
    title: "Compartiendo Juntas",
    audio: "audio-gusta",
    items: [
      { type:"img", src:"img/feliz1.jpg" },
      { type:"img", src:"img/feliz2.jpg" },
      { type:"img", src:"img/feliz3.jpg" },
      { type:"img", src:"img/feliz4.jpg" },
      { type:"vid", src:"video/feliz1.mp4", poster:"img/feliz1.jpg" },
      { type:"vid", src:"video/feliz2.mp4", poster:"img/feliz2.jpg" },
    ]
  },
  tesoro: {
    title: "Tu Tesoro — Isabela",
    audio: "audio-sos",
    items: [
      ...Array.from({length:14}, (_,i) => ({ type:"img", src:`img/isabella${i+1}.jpg` })),
      { type:"vid", src:"video/isabella1.mp4", poster:"img/isabella1.jpg" },
    ]
  },
  compilado: {
    title: "Toda nuestra historia",
    audio: "audio-musica",
    items: [
      ...Array.from({length:14}, (_,i) => ({ type:"img", src:`img/isabella${i+1}.jpg` })),
      { type:"img", src:"img/amor1.jpg" },
      { type:"img", src:"img/amor2.jpg" },
      { type:"img", src:"img/amor3.jpg" },
      { type:"img", src:"img/amor4.jpg" },
      { type:"img", src:"img/feliz1.jpg" },
      { type:"img", src:"img/feliz2.jpg" },
      { type:"img", src:"img/feliz3.jpg" },
      { type:"img", src:"img/feliz4.jpg" },
      { type:"vid", src:"video/amor1.mp4",     poster:"img/amor1.jpg" },
      { type:"vid", src:"video/amor2.mp4",     poster:"img/amor2.jpg" },
      { type:"vid", src:"video/feliz1.mp4",    poster:"img/feliz1.jpg" },
      { type:"vid", src:"video/feliz2.mp4",    poster:"img/feliz2.jpg" },
      { type:"vid", src:"video/isabella1.mp4", poster:"img/isabella1.jpg" },
    ]
  }
};

/* =============================================
   INIT
   ============================================= */
document.addEventListener("DOMContentLoaded", () => {
  startHeartsCanvas();
  initHeartRains();

  // Intro → Menu after 4 segundos
  setTimeout(() => {
    const intro = document.getElementById("scene-intro");
    intro.classList.add("fade-out");

    setTimeout(() => {
      intro.classList.add("hidden");
      playAudio("audio-feliz");
      showScene("menu");
    }, 1000);

  }, 3500);
});

/* =============================================
   SCENE MANAGER
   ============================================= */
function showScene(id) {
  document.querySelectorAll(".scene").forEach(s => {
    s.classList.add("hidden");
    s.classList.remove("scene-enter");
  });
  const el = document.getElementById("scene-" + id);
  el.classList.remove("hidden");
  // force reflow
  void el.offsetWidth;
  el.classList.add("scene-enter");
  currentScene = id;

  // Stop camera if leaving selfie
  if (id !== "selfie" && camStream) {
    camStream.getTracks().forEach(t => t.stop());
    camStream = null;
  }
}

/* =============================================
   AUDIO
   ============================================= */
function playAudio(id) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const a = document.getElementById(id);
  if (!a) return;
  a.volume = 0.65;
  a.play().catch(() => {});
  currentAudio = a;
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/* =============================================
   FLOATING HEARTS CANVAS
   ============================================= */
function startHeartsCanvas() {
  const c   = document.getElementById("bg");
  const ctx = c.getContext("2d");

  function resize() {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const HEARTS = [];
  const COLORS = ["#ff2e63","#ff8fa3","#d4a853","#ffffff","#c0152e","#ffb3c6"];

  for (let i = 0; i < 55; i++) {
    HEARTS.push({
      x:     Math.random() * c.width,
      y:     Math.random() * c.height,
      size:  Math.random() * 24 + 8,
      vy:    -(Math.random() * 0.8 + 0.2),
      vx:    (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.35 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      glow:  Math.random() > 0.6,
      angle: Math.random() * Math.PI * 2,
      va:    (Math.random() - 0.5) * 0.015,
    });
  }

  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const s = size * 0.5;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo( s,   -s*0.8,  s*2.2,  s*0.5,  0,  s*1.6);
    ctx.bezierCurveTo(-s*2.2, s*0.5, -s,    -s*0.8,  0,  s*0.3);
    ctx.closePath();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    HEARTS.forEach(h => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);
      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;

      if (h.glow) {
        ctx.shadowBlur  = h.size * 1.5;
        ctx.shadowColor = h.color;
      }

      ctx.beginPath();
      const s = h.size * 0.5;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo( s,   -s*0.8,  s*2.2,  s*0.5,  0,  s*1.6);
      ctx.bezierCurveTo(-s*2.2, s*0.5, -s,    -s*0.8,  0,  s*0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      h.y     += h.vy;
      h.x     += h.vx;
      h.angle += h.va;

      if (h.y < -40)        h.y = c.height + 20;
      if (h.x < -40)        h.x = c.width  + 20;
      if (h.x > c.width+40) h.x = -20;
    });
    requestAnimationFrame(frame);
  }
  frame();
}

/* =============================================
   HEART RAIN INSIDE BUTTONS
   ============================================= */
function initHeartRains() {
  const CONFIGS = [
    { id: "rain-familia",  colors: ["#ff2e63","#ff8fa3","#c0152e"] },
    { id: "rain-felicidad",colors: ["#ff8fa3","#ffb3c6","#ff2e63"] },
    { id: "rain-tesoro",   colors: ["#d4a853","#f5d98b","#ff8fa3"] },
    { id: "rain-video",    colors: ["#ff2e63","#d4a853","#ff8fa3"] },
    { id: "rain-surprise", colors: ["#ff8fa3","#ff2e63","#fff"]    },
  ];

  CONFIGS.forEach(cfg => {
    const el = document.getElementById(cfg.id);
    if (!el) return;
    for (let i = 0; i < 18; i++) {
      const drop = document.createElement("span");
      drop.textContent = "❤";
      drop.className = "heart-drop";
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const size  = Math.random() * 14 + 6;
      const alpha = Math.random() * 0.4 + 0.1;
      const glow  = Math.round(Math.random() * 6 + 2);
      drop.style.cssText = `
        --hs: ${size}px;
        --ho: ${alpha.toFixed(2)};
        --hx: ${Math.random() * 100}%;
        --hd: ${(Math.random() * 3 + 2).toFixed(1)}s;
        --hdelay: -${(Math.random() * 4).toFixed(1)}s;
        --hr: ${Math.round(Math.random()*40 - 20)}deg;
        --hglow: ${glow}px;
        --hcolor: ${color};
      `;
      el.appendChild(drop);
    }
  });
}

/* =============================================
   GALLERY
   ============================================= */
function openGallery(type) {
  const data = GALLERIES[type];
  if (!data) return;

  galleryItems = data.items;
  galleryIndex = 0;
  slideshowActive = false;

  document.getElementById("viewerTitle").textContent = data.title;
  document.getElementById("slideshowBar").style.display = "none";

  playAudio(data.audio);
  showScene("viewer");
  buildThumbs();
  renderItem();
}

function openSlideshowFull() {
  const data = GALLERIES["compilado"];
  galleryItems = data.items;
  galleryIndex = 0;
  slideshowActive = true;

  document.getElementById("viewerTitle").textContent = data.title;
  document.getElementById("slideshowBar").style.display = "block";

  playAudio(data.audio);
  showScene("viewer");
  buildThumbs();
  renderItem();
  startSlideshow();
}

function renderItem() {
  const item  = galleryItems[galleryIndex];
  const img   = document.getElementById("viewerImg");
  const vid   = document.getElementById("viewerVid");

  // Fade out
  img.style.opacity = "0";
  vid.style.opacity = "0";

  if (item.type === "img") {
    vid.pause();
    vid.classList.add("hidden");
    img.classList.remove("hidden");
    img.src = item.src;
    img.onload = () => { img.style.opacity = "1"; };
    img.onerror = () => { img.style.opacity = "1"; };
  } else {
    img.classList.add("hidden");
    vid.classList.remove("hidden");
    vid.src    = item.src;
    if (item.poster) vid.poster = item.poster;
    vid.style.opacity = "1";
    if (!slideshowActive) vid.play().catch(() => {});
  }

  // Update counter
  document.getElementById("viewerCounter").textContent =
    `${galleryIndex + 1} / ${galleryItems.length}`;

  // Update thumb highlight
  document.querySelectorAll(".thumb, .thumb-vid").forEach((el, i) => {
    el.classList.toggle("active", i === galleryIndex);
    if (i === galleryIndex) el.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  });
}

function buildThumbs() {
  const strip = document.getElementById("thumbsStrip");
  strip.innerHTML = "";
  galleryItems.forEach((item, i) => {
    if (item.type === "img") {
      const img = document.createElement("img");
      img.className = "thumb";
      img.src = item.src;
      img.onclick = () => { galleryIndex = i; renderItem(); };
      strip.appendChild(img);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "thumb-vid";
      wrap.innerHTML = `<div class="thumb-vid-inner">▶</div>`;
      wrap.onclick = () => { galleryIndex = i; renderItem(); };
      strip.appendChild(wrap);
    }
  });
}

function nextItem() {
  if (galleryIndex < galleryItems.length - 1) {
    galleryIndex++;
    renderItem();
    resetSlideshow();
  } else if (slideshowActive) {
    // Loop
    galleryIndex = 0;
    renderItem();
    resetSlideshow();
  }
}

function prevItem() {
  if (galleryIndex > 0) {
    galleryIndex--;
    renderItem();
    resetSlideshow();
  }
}

/* ---- SLIDESHOW AUTO ---- */
function startSlideshow() {
  const BAR_DURATION = 4500;
  const prog = document.getElementById("slideshowProgress");
  prog.style.transition = "none";
  prog.style.width = "0%";

  void prog.offsetWidth;
  prog.style.transition = `width ${BAR_DURATION}ms linear`;
  prog.style.width = "100%";

  if (slideshowTimer) clearTimeout(slideshowTimer);
  slideshowTimer = setTimeout(() => {
    nextItem();
    if (slideshowActive) startSlideshow();
  }, BAR_DURATION);
}

function resetSlideshow() {
  if (!slideshowActive) return;
  if (slideshowTimer) clearTimeout(slideshowTimer);
  startSlideshow();
}

/* =============================================
   NAVIGATION
   ============================================= */
function goBack() {
  if (slideshowTimer) clearTimeout(slideshowTimer);
  slideshowActive = false;

  // Pause video if playing
  const vid = document.getElementById("viewerVid");
  vid.pause();

  playAudio("audio-feliz");
  showScene("menu");
}

/* =============================================
   SELFIE
   ============================================= */
function openSurprise() {
  showScene("selfie");

  // Reset state
  document.getElementById("selfieResult").classList.add("hidden");
  document.getElementById("retakeBtn").classList.add("hidden");
  document.getElementById("takePhotoBtn").classList.remove("hidden");
  document.getElementById("cam").classList.remove("hidden");
  document.querySelectorAll(".selfie-heart-corners .shc").forEach(e => e.style.display = "");

  // Start camera
  const constraints = {
    video: {
      facingMode: "user",
      width:  { ideal: 1280 },
      height: { ideal: 960 }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      camStream = stream;
      const cam = document.getElementById("cam");
      cam.srcObject = stream;
      cam.play().catch(() => {});
    })
    .catch(err => {
      console.warn("Camera error:", err);
      alert("No se pudo acceder a la cámara. Por favor habilitá el permiso 📸");
    });
}

function takePhoto() {
  const cam    = document.getElementById("cam");
  const canvas = document.getElementById("canvas");

  const W = cam.videoWidth  || 640;
  const H = cam.videoHeight || 480;

  canvas.width  = W;
  canvas.height = H;
  canvas.classList.remove("hidden");

  const ctx = canvas.getContext("2d");

  // Mirror (front camera)
  ctx.save();
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cam, 0, 0, W, H);
  ctx.restore();

  // ---- HEART FRAME DECORATION ----
  drawHeartFrame(ctx, W, H);

  // ---- WATERMARK / OVERLAY ----
  drawOverlay(ctx, W, H);

  // ---- RESULT ----
  const dataURL = canvas.toDataURL("image/jpeg", 0.97);

  const resultImg  = document.getElementById("resultImg");
  const downloadBtn = document.getElementById("downloadBtn");

  resultImg.src  = dataURL;
  downloadBtn.href = dataURL;
  downloadBtn.download = "feliz-dia-mama-" + Date.now() + ".jpg";

  document.getElementById("selfieResult").classList.remove("hidden");
  document.getElementById("takePhotoBtn").classList.add("hidden");
  document.getElementById("retakeBtn").classList.remove("hidden");
  document.getElementById("cam").classList.add("hidden");
}

function drawHeartFrame(ctx, W, H) {
  const BORDER = Math.round(W * 0.032);

  // Outer gradient border
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   "#ff2e63");
  grad.addColorStop(0.3, "#d4a853");
  grad.addColorStop(0.6, "#ff8fa3");
  grad.addColorStop(1,   "#c0152e");

  ctx.lineWidth   = BORDER;
  ctx.strokeStyle = grad;
  ctx.shadowBlur  = BORDER * 2;
  ctx.shadowColor = "#ff2e63";
  ctx.strokeRect(BORDER/2, BORDER/2, W - BORDER, H - BORDER);
  ctx.shadowBlur = 0;

  // Corner hearts
  const cornerHearts = [
    { x: 28,     y: 28,     size: 32 },
    { x: W - 28, y: 28,     size: 32 },
    { x: 28,     y: H - 28, size: 32 },
    { x: W - 28, y: H - 28, size: 32 },
    // Mid sides
    { x: W/2,    y: 18,     size: 22 },
    { x: W/2,    y: H - 18, size: 22 },
    { x: 18,     y: H/2,    size: 22 },
    { x: W - 18, y: H/2,    size: 22 },
  ];

  cornerHearts.forEach(({ x, y, size }) => {
    drawCanvasHeart(ctx, x, y, size, "#ff2e63");
  });

  // Scattered small hearts along border
  const count = 20;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * (W * 2 + H * 2);
    let hx, hy;
    const offset = BORDER + 6;
    if      (t < W)               { hx = t;         hy = offset; }
    else if (t < W + H)           { hx = W - offset;hy = t - W; }
    else if (t < W * 2 + H)       { hx = W - (t - W - H); hy = H - offset; }
    else                          { hx = offset;    hy = H - (t - W*2 - H); }

    const s = Math.random() * 10 + 8;
    const colors = ["#ff8fa3","#d4a853","#fff","#ff2e63"];
    drawCanvasHeart(ctx, hx, hy, s, colors[i % colors.length]);
  }
}

function drawCanvasHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.shadowBlur  = size * 0.8;
  ctx.shadowColor = color;
  ctx.globalAlpha = 0.9;
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo( s,   -s*0.8,  s*2.2,  s*0.5,  0,  s*1.6);
  ctx.bezierCurveTo(-s*2.2, s*0.5, -s,    -s*0.8,  0,  s*0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawOverlay(ctx, W, H) {
  // Semi-transparent panel at bottom
  const panelH = Math.round(H * 0.22);
  const panelY = H - panelH;

  const panelGrad = ctx.createLinearGradient(0, panelY, 0, H);
  panelGrad.addColorStop(0, "rgba(26,0,5,0)");
  panelGrad.addColorStop(0.3, "rgba(26,0,5,0.75)");
  panelGrad.addColorStop(1, "rgba(26,0,5,0.9)");
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, panelY, W, panelH);

  // Big heart + "Feliz día Mamá"
  const centerX = W / 2;

  // Heart icon in center panel
  const heartY = panelY + panelH * 0.28;
  drawCanvasHeart(ctx, centerX - 82, heartY, 20, "#ff2e63");
  drawCanvasHeart(ctx, centerX + 82, heartY, 20, "#ff2e63");

  // "Feliz día Mamá"
  ctx.save();
  ctx.textAlign   = "center";
  ctx.shadowBlur  = 12;
  ctx.shadowColor = "#ff2e63";

  const fs1 = Math.round(W * 0.062);
  ctx.font      = `600 ${fs1}px 'Cinzel', serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Feliz día Mamá ❤️", centerX, panelY + panelH * 0.46);

  ctx.shadowBlur  = 8;
  ctx.shadowColor = "#d4a853";
  const fs2 = Math.round(W * 0.046);
  ctx.font      = `italic ${fs2}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = "#f5d98b";
  ctx.fillText("Te amo — Isabella", centerX, panelY + panelH * 0.68);

  // Date
  ctx.shadowBlur = 0;
  const fs3 = Math.round(W * 0.03);
  ctx.font      = `${fs3}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  const fecha = new Date().toLocaleString("es-AR", {
    day:"2-digit", month:"long", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });
  ctx.fillText(fecha, centerX, panelY + panelH * 0.88);

  ctx.restore();
}

function retakePhoto() {
  document.getElementById("selfieResult").classList.add("hidden");
  document.getElementById("retakeBtn").classList.add("hidden");
  document.getElementById("takePhotoBtn").classList.remove("hidden");
  document.getElementById("cam").classList.remove("hidden");
  document.getElementById("canvas").classList.add("hidden");
}

/* =============================================
   KEYBOARD SUPPORT
   ============================================= */
document.addEventListener("keydown", e => {
  if (currentScene === "viewer") {
    if (e.key === "ArrowRight") nextItem();
    if (e.key === "ArrowLeft")  prevItem();
    if (e.key === "Escape")     goBack();
  }
  if (currentScene === "selfie" && e.key === "Escape") goBack();
});

/* =============================================
   SWIPE SUPPORT
   ============================================= */
let touchStartX = 0;
document.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (currentScene === "viewer" && Math.abs(dx) > 50) {
    if (dx < 0) nextItem(); else prevItem();
  }
}, { passive: true });
