/* =============================================
   SOFI ❤️ — APP.JS CINEMATIC PWA v2
   ============================================= */

/* ---- STATE ---- */
let currentScene    = "intro";
let galleryItems    = [];
let galleryIndex    = 0;
let currentAudio    = null;
let isMuted         = false;
let slideshowActive = false;
let camStream       = null;

/* ---- MOVIE STATE ---- */
let movieItems      = [];
let movieIndex      = 0;
let moviePlaying    = false;
let movieHoldTimer  = null;
let movieFadeAnim   = null;
let movieUITimer    = null;
let movieCanvas     = null;
let movieCtx        = null;
let movieImg1       = new Image();

const MOVIE_FADE_MS = 1100;   // ms per cross-fade
const MOVIE_HOLD_MS = 5800;   // ms image shown at full opacity

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
      { type:"vid", src:"video/amor1.mp4",  poster:"img/amor1.jpg" },
      { type:"vid", src:"video/amor2.mp4",  poster:"img/amor2.jpg" },
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
      ...Array.from({length:13}, (_,i) => ({ type:"img", src:`img/isabella${i+1}.jpg` })),
      { type:"vid", src:"video/isabella1.mp4", poster:"img/isabella1.jpg" },
    ]
  },
  compilado: {
    title: "Toda nuestra historia",
    audio: "audio-musica",
    items: [
      ...Array.from({length:13}, (_,i) => ({ type:"img", src:`img/isabella${i+1}.jpg` })),
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
  createMuteBtn();

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
   MUTE BUTTON — siempre visible
   ============================================= */
function createMuteBtn() {
  const btn = document.createElement("button");
  btn.id = "muteBtn";
  btn.innerHTML = "🔊";
  btn.setAttribute("aria-label","Silenciar");
  btn.style.cssText = `
    position:fixed; top:14px; left:14px; z-index:9000;
    background:rgba(0,0,0,0.45);
    border:1px solid rgba(255,255,255,0.25);
    backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
    color:white; font-size:20px;
    width:42px; height:42px; border-radius:50%;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:background 0.2s,transform 0.15s;
    -webkit-tap-highlight-color:transparent; padding:0;
  `;
  btn.addEventListener("click", toggleMute);
  document.body.appendChild(btn);
}

function toggleMute() {
  isMuted = !isMuted;
  document.querySelectorAll("audio").forEach(a => { a.muted = isMuted; });
  const mv = document.getElementById("movieVidEl");
  if (mv) mv.muted = isMuted;
  const btn = document.getElementById("muteBtn");
  btn.innerHTML = isMuted ? "🔇" : "🔊";
  btn.style.background = isMuted ? "rgba(192,21,46,0.55)" : "rgba(0,0,0,0.45)";
  btn.style.transform = "scale(1.15)";
  setTimeout(() => { btn.style.transform = "scale(1)"; }, 150);
}

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
  void el.offsetWidth;
  el.classList.add("scene-enter");
  currentScene = id;

  if (id !== "selfie" && camStream) {
    camStream.getTracks().forEach(t => t.stop());
    camStream = null;
  }
  if (id !== "movie") movieStop();
}

/* =============================================
   AUDIO
   ============================================= */
function playAudio(id) {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  const a = document.getElementById(id);
  if (!a) return;
  a.volume = 0.65; a.muted = isMuted;
  a.play().catch(() => {});
  currentAudio = a;
}

function stopAudio() {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
}

/* =============================================
   FLOATING HEARTS CANVAS
   ============================================= */
function startHeartsCanvas() {
  const c = document.getElementById("bg");
  const ctx = c.getContext("2d");
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  resize(); window.addEventListener("resize", resize);
  const COLORS = ["#ff2e63","#ff8fa3","#d4a853","#ffffff","#c0152e","#ffb3c6"];
  const H = Array.from({length:55}, () => ({
    x: Math.random()*c.width, y: Math.random()*c.height,
    size: Math.random()*24+8, vy: -(Math.random()*.8+.2),
    vx: (Math.random()-.5)*.3, alpha: Math.random()*.35+.05,
    color: COLORS[Math.floor(Math.random()*COLORS.length)],
    glow: Math.random()>.6, angle: Math.random()*Math.PI*2,
    va: (Math.random()-.5)*.015,
  }));
  function frame() {
    ctx.clearRect(0,0,c.width,c.height);
    H.forEach(h => {
      ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle);
      ctx.globalAlpha=h.alpha; ctx.fillStyle=h.color;
      if(h.glow){ctx.shadowBlur=h.size*1.5;ctx.shadowColor=h.color;}
      const s=h.size*.5;
      ctx.beginPath(); ctx.moveTo(0,s*.3);
      ctx.bezierCurveTo(s,-s*.8,s*2.2,s*.5,0,s*1.6);
      ctx.bezierCurveTo(-s*2.2,s*.5,-s,-s*.8,0,s*.3);
      ctx.closePath(); ctx.fill(); ctx.restore();
      h.y+=h.vy; h.x+=h.vx; h.angle+=h.va;
      if(h.y<-40) h.y=c.height+20;
      if(h.x<-40) h.x=c.width+20;
      if(h.x>c.width+40) h.x=-20;
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
    {id:"rain-familia",  colors:["#ff2e63","#ff8fa3","#c0152e"]},
    {id:"rain-felicidad",colors:["#ff8fa3","#ffb3c6","#ff2e63"]},
    {id:"rain-tesoro",   colors:["#d4a853","#f5d98b","#ff8fa3"]},
    {id:"rain-video",    colors:["#ff2e63","#d4a853","#ff8fa3"]},
    {id:"rain-surprise", colors:["#ff8fa3","#ff2e63","#fff"]},
  ];
  CONFIGS.forEach(cfg => {
    const el = document.getElementById(cfg.id); if(!el) return;
    for(let i=0;i<18;i++){
      const drop = document.createElement("span");
      drop.textContent="❤"; drop.className="heart-drop";
      const color=cfg.colors[Math.floor(Math.random()*cfg.colors.length)];
      drop.style.cssText=`--hs:${(Math.random()*14+6).toFixed(1)}px;--ho:${(Math.random()*.4+.1).toFixed(2)};--hx:${(Math.random()*100).toFixed(1)}%;--hd:${(Math.random()*3+2).toFixed(1)}s;--hdelay:-${(Math.random()*4).toFixed(1)}s;--hr:${Math.round(Math.random()*40-20)}deg;--hglow:${Math.round(Math.random()*6+2)}px;--hcolor:${color};`;
      el.appendChild(drop);
    }
  });
}

/* =============================================
   GALLERY (visor manual)
   ============================================= */
function openGallery(type) {
  const data = GALLERIES[type]; if(!data) return;
  galleryItems = data.items; galleryIndex = 0; slideshowActive = false;
  document.getElementById("viewerTitle").textContent = data.title;
  document.getElementById("slideshowBar").style.display = "none";
  playAudio(data.audio);
  showScene("viewer"); buildThumbs(); renderItem();
}

function renderItem() {
  const item = galleryItems[galleryIndex];
  const img  = document.getElementById("viewerImg");
  const vid  = document.getElementById("viewerVid");
  img.style.opacity="0"; vid.style.opacity="0";
  if(item.type==="img"){
    vid.pause(); vid.classList.add("hidden");
    img.classList.remove("hidden"); img.src=item.src;
    img.onload=()=>{img.style.opacity="1";};
    img.onerror=()=>{img.style.opacity="1";};
  } else {
    img.classList.add("hidden"); vid.classList.remove("hidden");
    vid.src=item.src; if(item.poster) vid.poster=item.poster;
    vid.muted=isMuted; vid.style.opacity="1";
    vid.play().catch(()=>{});
  }
  document.getElementById("viewerCounter").textContent=`${galleryIndex+1} / ${galleryItems.length}`;
  document.querySelectorAll(".thumb,.thumb-vid").forEach((el,i)=>{
    el.classList.toggle("active",i===galleryIndex);
    if(i===galleryIndex) el.scrollIntoView({inline:"center",behavior:"smooth",block:"nearest"});
  });
}

function buildThumbs() {
  const strip = document.getElementById("thumbsStrip"); strip.innerHTML="";
  galleryItems.forEach((item,i)=>{
    if(item.type==="img"){
      const img=document.createElement("img"); img.className="thumb"; img.src=item.src;
      img.onclick=()=>{galleryIndex=i;renderItem();}; strip.appendChild(img);
    } else {
      const wrap=document.createElement("div"); wrap.className="thumb-vid";
      wrap.innerHTML=`<div class="thumb-vid-inner">▶</div>`;
      wrap.onclick=()=>{galleryIndex=i;renderItem();}; strip.appendChild(wrap);
    }
  });
}

function nextItem(){if(galleryIndex<galleryItems.length-1){galleryIndex++;renderItem();}}
function prevItem(){if(galleryIndex>0){galleryIndex--;renderItem();}}

/* =============================================
   PELÍCULA — MOTOR CINEMATOGRÁFICO
   ============================================= */
function openSlideshowFull() {
  movieItems   = [...GALLERIES.compilado.items];
  movieIndex   = 0;
  moviePlaying = true;

  playAudio("audio-musica");
  showScene("movie");

  movieCanvas = document.getElementById("movieCanvas");
  movieCtx    = movieCanvas.getContext("2d");
  _movieResize();
  window.addEventListener("resize", _movieResize);

  // Persistent hidden video element
  let mv = document.getElementById("movieVidEl");
  if (!mv) {
    mv = document.createElement("video");
    mv.id = "movieVidEl";
    mv.style.display = "none";
    mv.playsInline = true;
    mv.setAttribute("playsinline","");
    mv.muted = isMuted;
    document.body.appendChild(mv);
  }

  movieShowUI();
  _movieGoto(0);
}

function _movieResize() {
  if (!movieCanvas) return;
  movieCanvas.width  = window.innerWidth;
  movieCanvas.height = window.innerHeight;
}

/* ---- Go to slide index ---- */
function _movieGoto(idx) {
  movieClearTimers();
  if (!moviePlaying) return;
  movieIndex = ((idx % movieItems.length) + movieItems.length) % movieItems.length;
  _updateMovieUI();

  const item = movieItems[movieIndex];
  if (item.type === "img") {
    _moviePlayImage(item.src);
  } else {
    _moviePlayVideo(item.src, item.poster);
  }
}

/* ---- Image slide ---- */
function _moviePlayImage(src) {
  const img = new Image();
  img.onload = () => {
    movieImg1 = img;
    _movieFade(0, 1, MOVIE_FADE_MS, alpha => {
      _drawImage(alpha);
    }, () => {
      // Hold
      movieHoldTimer = setTimeout(() => {
        _movieFade(1, 0, MOVIE_FADE_MS, alpha => {
          _drawImage(alpha);
        }, () => {
          _movieGoto(movieIndex + 1);
        });
      }, MOVIE_HOLD_MS);
    });
  };
  img.onerror = () => { _movieGoto(movieIndex + 1); };
  img.src = src;
}

/* ---- Video slide ---- */
function _moviePlayVideo(src, poster) {
  const mv = document.getElementById("movieVidEl");
  mv.src   = src;
  mv.muted = isMuted;
  mv.currentTime = 0;
  mv.loop  = false;

  // Show poster while loading
  if (poster) {
    const p = new Image();
    p.onload = () => { movieImg1 = p; _drawImage(0); };
    p.src = poster;
  }

  mv.onloadeddata = () => {
    mv.play().catch(() => {});
    // Fade in
    _movieFade(0, 1, MOVIE_FADE_MS, alpha => {
      _drawVideo(mv, alpha);
    }, () => {
      // Loop-draw until ended
      _movieLoopVideo(mv);
    });
  };

  mv.onended = () => {
    // Fade out
    _movieFade(1, 0, MOVIE_FADE_MS, alpha => {
      _drawVideo(mv, alpha);
    }, () => {
      mv.pause();
      _movieGoto(movieIndex + 1);
    });
  };

  mv.onerror = () => { _movieGoto(movieIndex + 1); };
  mv.load();
}

function _movieLoopVideo(mv) {
  if (!moviePlaying) return;
  if (mv.paused || mv.ended) return;
  _drawVideo(mv, 1);
  movieFadeAnim = requestAnimationFrame(() => _movieLoopVideo(mv));
}

/* ---- Generic fade engine ---- */
function _movieFade(fromAlpha, toAlpha, duration, onTick, onDone) {
  cancelAnimationFrame(movieFadeAnim);
  const start = performance.now();
  function step(now) {
    let t = Math.min((now - start) / duration, 1);
    // Smooth S-curve
    t = t < .5 ? 2*t*t : -1+(4-2*t)*t;
    const a = fromAlpha + (toAlpha - fromAlpha) * t;
    onTick(a);
    if ((now - start) < duration) {
      movieFadeAnim = requestAnimationFrame(step);
    } else {
      movieFadeAnim = null;
      onDone && onDone();
    }
  }
  movieFadeAnim = requestAnimationFrame(step);
}

/* ---- Draw helpers ---- */
function _drawImage(alpha) {
  if (!movieCtx || !movieCanvas || !movieImg1) return;
  const W = movieCanvas.width, H = movieCanvas.height;
  movieCtx.clearRect(0,0,W,H);
  movieCtx.fillStyle = "#000"; movieCtx.fillRect(0,0,W,H);
  if (alpha > 0 && movieImg1.complete) {
    movieCtx.globalAlpha = alpha;
    const iw=movieImg1.naturalWidth||movieImg1.width;
    const ih=movieImg1.naturalHeight||movieImg1.height;
    const scale=Math.max(W/iw, H/ih);
    const dw=iw*scale, dh=ih*scale;
    movieCtx.drawImage(movieImg1, (W-dw)/2, (H-dh)/2, dw, dh);
    movieCtx.globalAlpha=1;
  }
}

function _drawVideo(vid, alpha) {
  if (!movieCtx || !movieCanvas) return;
  const W = movieCanvas.width, H = movieCanvas.height;
  movieCtx.clearRect(0,0,W,H);
  movieCtx.fillStyle="#000"; movieCtx.fillRect(0,0,W,H);
  if (alpha > 0 && vid && vid.readyState >= 2) {
    movieCtx.globalAlpha = alpha;
    const vw=vid.videoWidth||W, vh=vid.videoHeight||H;
    const scale=Math.max(W/vw, H/vh);
    const dw=vw*scale, dh=vh*scale;
    movieCtx.drawImage(vid, (W-dw)/2, (H-dh)/2, dw, dh);
    movieCtx.globalAlpha=1;
  }
}

/* ---- Clear all movie timers ---- */
function movieClearTimers() {
  if (movieHoldTimer) { clearTimeout(movieHoldTimer); movieHoldTimer=null; }
  cancelAnimationFrame(movieFadeAnim); movieFadeAnim=null;
}

/* ---- Stop movie completely ---- */
function movieStop() {
  movieClearTimers();
  moviePlaying = false;
  const mv = document.getElementById("movieVidEl");
  if (mv) { mv.pause(); mv.onended=null; mv.onloadeddata=null; mv.src=""; }
  if (movieUITimer) { clearTimeout(movieUITimer); movieUITimer=null; }
  window.removeEventListener("resize", _movieResize);
}

/* ---- Manual controls ---- */
function movieTogglePlay() {
  moviePlaying = !moviePlaying;
  document.getElementById("moviePlayBtn").innerHTML = moviePlaying ? "⏸" : "▶";
  movieShowUI();
  if (moviePlaying) {
    _movieGoto(movieIndex);
  } else {
    movieClearTimers();
    const mv = document.getElementById("movieVidEl");
    if (mv) mv.pause();
  }
}

function movieNext() {
  movieClearTimers();
  const mv = document.getElementById("movieVidEl");
  if (mv) { mv.pause(); mv.onended=null; }
  const next = (movieIndex+1) % movieItems.length;
  movieShowUI();
  _movieGoto(next);
}

function moviePrev() {
  movieClearTimers();
  const mv = document.getElementById("movieVidEl");
  if (mv) { mv.pause(); mv.onended=null; }
  const prev = (movieIndex-1+movieItems.length) % movieItems.length;
  movieShowUI();
  _movieGoto(prev);
}

function movieBack() {
  movieStop(); stopAudio();
  playAudio("audio-feliz");
  showScene("menu");
}

function _updateMovieUI() {
  const counter = document.getElementById("movieCounter");
  if (counter) counter.textContent = `${movieIndex+1} / ${movieItems.length}`;
  const fill = document.getElementById("movieProgressFill");
  if (fill) {
    fill.style.transition = "width 0.5s ease";
    fill.style.width = ((movieIndex+1)/movieItems.length*100).toFixed(1)+"%";
  }
  const btn = document.getElementById("moviePlayBtn");
  if (btn) btn.innerHTML = moviePlaying ? "⏸" : "▶";
}

/* ---- UI auto-hide ---- */
function movieShowUI() {
  const ui = document.getElementById("movieUI"); if (!ui) return;
  ui.classList.remove("hidden-ui");
  if (movieUITimer) clearTimeout(movieUITimer);
  movieUITimer = setTimeout(() => { ui.classList.add("hidden-ui"); }, 3500);
}

// Tap canvas → show UI
document.addEventListener("click", e => {
  if (currentScene==="movie") {
    const ui = document.getElementById("movieUI");
    if (ui && !ui.contains(e.target)) movieShowUI();
  }
});

/* =============================================
   NAVIGATION
   ============================================= */
function goBack() {
  const vid = document.getElementById("viewerVid");
  if (vid) vid.pause();
  playAudio("audio-feliz");
  showScene("menu");
}

/* =============================================
   SELFIE
   ============================================= */
function openSurprise() {
  showScene("selfie");
  document.getElementById("selfieResult").classList.add("hidden");
  document.getElementById("retakeBtn").classList.add("hidden");
  document.getElementById("takePhotoBtn").classList.remove("hidden");
  document.getElementById("cam").classList.remove("hidden");
  document.getElementById("canvas").classList.add("hidden");

  navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user",width:{ideal:1280},height:{ideal:960}}
  }).then(stream => {
    camStream=stream;
    const cam=document.getElementById("cam");
    cam.srcObject=stream; cam.play().catch(()=>{});
  }).catch(()=>alert("No se pudo acceder a la cámara. Habilitá el permiso 📸"));
}

function takePhoto() {
  const cam=document.getElementById("cam"), canvas=document.getElementById("canvas");
  const W=cam.videoWidth||640, H=cam.videoHeight||480;
  canvas.width=W; canvas.height=H; canvas.classList.remove("hidden");
  const ctx=canvas.getContext("2d");
  ctx.save(); ctx.translate(W,0); ctx.scale(-1,1);
  ctx.drawImage(cam,0,0,W,H); ctx.restore();
  drawHeartFrame(ctx,W,H); drawOverlay(ctx,W,H);
  const dataURL=canvas.toDataURL("image/jpeg",0.97);
  document.getElementById("resultImg").src=dataURL;
  const dl=document.getElementById("downloadBtn");
  dl.href=dataURL; dl.download="feliz-dia-mama-"+Date.now()+".jpg";
  document.getElementById("selfieResult").classList.remove("hidden");
  document.getElementById("takePhotoBtn").classList.add("hidden");
  document.getElementById("retakeBtn").classList.remove("hidden");
  document.getElementById("cam").classList.add("hidden");
}

function retakePhoto() {
  document.getElementById("selfieResult").classList.add("hidden");
  document.getElementById("retakeBtn").classList.add("hidden");
  document.getElementById("takePhotoBtn").classList.remove("hidden");
  document.getElementById("cam").classList.remove("hidden");
  document.getElementById("canvas").classList.add("hidden");
}

function drawHeartFrame(ctx,W,H){
  const B=Math.round(W*.032);
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,"#ff2e63");g.addColorStop(.3,"#d4a853");
  g.addColorStop(.6,"#ff8fa3");g.addColorStop(1,"#c0152e");
  ctx.lineWidth=B;ctx.strokeStyle=g;ctx.shadowBlur=B*2;ctx.shadowColor="#ff2e63";
  ctx.strokeRect(B/2,B/2,W-B,H-B);ctx.shadowBlur=0;
  [{x:28,y:28,s:32},{x:W-28,y:28,s:32},{x:28,y:H-28,s:32},{x:W-28,y:H-28,s:32},
   {x:W/2,y:18,s:22},{x:W/2,y:H-18,s:22},{x:18,y:H/2,s:22},{x:W-18,y:H/2,s:22}]
  .forEach(({x,y,s})=>drawCanvasHeart(ctx,x,y,s,"#ff2e63"));
  for(let i=0;i<20;i++){
    const t=(i/20)*(W*2+H*2);let hx,hy;const off=B+6;
    if(t<W){hx=t;hy=off;}else if(t<W+H){hx=W-off;hy=t-W;}
    else if(t<W*2+H){hx=W-(t-W-H);hy=H-off;}else{hx=off;hy=H-(t-W*2-H);}
    drawCanvasHeart(ctx,hx,hy,Math.random()*10+8,["#ff8fa3","#d4a853","#fff","#ff2e63"][i%4]);
  }
}

function drawCanvasHeart(ctx,x,y,size,color){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;
  ctx.shadowBlur=size*.8;ctx.shadowColor=color;ctx.globalAlpha=0.9;
  const s=size*.5;ctx.beginPath();ctx.moveTo(0,s*.3);
  ctx.bezierCurveTo(s,-s*.8,s*2.2,s*.5,0,s*1.6);
  ctx.bezierCurveTo(-s*2.2,s*.5,-s,-s*.8,0,s*.3);
  ctx.closePath();ctx.fill();ctx.restore();
}

function drawOverlay(ctx,W,H){
  const pH=Math.round(H*.22),pY=H-pH;
  const pg=ctx.createLinearGradient(0,pY,0,H);
  pg.addColorStop(0,"rgba(26,0,5,0)");pg.addColorStop(.3,"rgba(26,0,5,.75)");pg.addColorStop(1,"rgba(26,0,5,.9)");
  ctx.fillStyle=pg;ctx.fillRect(0,pY,W,pH);
  const cx=W/2;
  drawCanvasHeart(ctx,cx-82,pY+pH*.28,20,"#ff2e63");
  drawCanvasHeart(ctx,cx+82,pY+pH*.28,20,"#ff2e63");
  ctx.save();ctx.textAlign="center";
  ctx.shadowBlur=12;ctx.shadowColor="#ff2e63";
  ctx.font=`600 ${Math.round(W*.062)}px serif`;ctx.fillStyle="#ffffff";
  ctx.fillText("Feliz día Mamá ❤️",cx,pY+pH*.46);
  ctx.shadowBlur=8;ctx.shadowColor="#d4a853";
  ctx.font=`italic ${Math.round(W*.046)}px serif`;ctx.fillStyle="#f5d98b";
  ctx.fillText("Te amo — Isabella",cx,pY+pH*.68);
  ctx.shadowBlur=0;ctx.font=`${Math.round(W*.03)}px sans-serif`;ctx.fillStyle="rgba(255,255,255,.6)";
  ctx.fillText(new Date().toLocaleString("es-AR",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}),cx,pY+pH*.88);
  ctx.restore();
}

/* =============================================
   TECLADO + SWIPE
   ============================================= */
document.addEventListener("keydown",e=>{
  if(currentScene==="viewer"){
    if(e.key==="ArrowRight")nextItem();if(e.key==="ArrowLeft")prevItem();if(e.key==="Escape")goBack();
  }
  if(currentScene==="movie"){
    if(e.key==="ArrowRight")movieNext();if(e.key==="ArrowLeft")moviePrev();
    if(e.key===" ")movieTogglePlay();if(e.key==="Escape")movieBack();
  }
  if(e.key==="m"||e.key==="M")toggleMute();
});

let touchStartX=0;
document.addEventListener("touchstart",e=>{touchStartX=e.touches[0].clientX;},{passive:true});
document.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchStartX;
  if(Math.abs(dx)<50)return;
  if(currentScene==="viewer"){if(dx<0)nextItem();else prevItem();}
  if(currentScene==="movie") {if(dx<0)movieNext();else moviePrev();}
},{passive:true});
