let items=[], i=0;

/* inicio */
setTimeout(()=>{
  show("menu");
  startHearts();
  document.getElementById("music").play().catch(()=>{});
},4000);

/* escenas */
function show(id){
  document.querySelectorAll(".scene").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* corazones */
function startHearts(){
  const c=document.getElementById("bg");
  const ctx=c.getContext("2d");

  c.width=innerWidth;
  c.height=innerHeight;

  let h=[];

  for(let j=0;j<50;j++){
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

/* galerias */
function openGallery(type){
  show("viewer");

  if(type==="familia") items=["img/feliz1.jpg","img/feliz2.jpg","img/feliz3.jpg","img/feliz4.jpg"];
  if(type==="felicidad") items=["img/amor1.jpg","img/amor2.jpg","img/amor3.jpg","img/amor4.jpg"];
  if(type==="tesoro") items=[...Array(14)].map((_,x)=>`img/isabella${x+1}.jpg`);

  i=0;
  render();
}

function render(){
  viewerImg.src=items[i];
}

function next(){ if(i<items.length-1){i++;render();}}
function prev(){ if(i>0){i--;render();}}

function back(){ show("menu"); }

/* selfie */
function openSurprise(){
  show("selfie");

  navigator.mediaDevices.getUserMedia({video:true})
  .then(s=>cam.srcObject=s);
}

function takePhoto(){
  const ctx=canvas.getContext("2d");

  canvas.width=cam.videoWidth;
  canvas.height=cam.videoHeight;

  ctx.drawImage(cam,0,0);

  ctx.fillStyle="white";
  ctx.fillText("Feliz día mamá ❤️",20,canvas.height-40);

  const img=canvas.toDataURL();

  result.innerHTML=`<img src="${img}" style="width:100%"><a href="${img}" download>Guardar</a>`;
}