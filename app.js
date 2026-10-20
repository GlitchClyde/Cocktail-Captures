const W=1080,H=1350,PX=90,PY=250,PW=900,PH=800,F='Inter,system-ui,sans-serif';
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const cv=$('stage'),ctx=cv.getContext('2d');cv.width=W;cv.height=H;
const bg=document.createElement('canvas');bg.width=W;bg.height=H;
const video=document.createElement('video');video.playsInline=true;video.muted=true;
const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE={neon:'#ff4d8d',nt:'#ffd6e6',b:['#2e7d4f','#b5651d','#2a5d9f','#8e2b3c','#c9a227','#5d3a8c'],ct:['#7a4a24','#4a2a14','#25140a'],bk:['255,170,60','255,90,140','90,200,255']};
const SCENES=[
  {...BASE,n:'Neon Bar',w:['#160c08','#3a2213']},
  {...BASE,n:'Speakeasy',w:['#0b1a13','#23412f'],neon:'#ffc857',nt:'#fff0c9',bk:['255,200,87','120,220,160','255,255,255']},
  {...BASE,n:'Rooftop',w:['#2b1055','#ff7e5f'],neon:'#2de2e6',nt:'#d6ffff',bk:['255,200,120','255,120,200','120,220,255']},
  {...BASE,n:'Lagoon',w:['#031a33','#0b6a8a'],neon:'#35f2d0',nt:'#d9fff7',bk:['80,240,220','120,180,255','255,255,255']},
  {...BASE,n:'Burgundy',w:['#2a0710','#6a1a2e'],neon:'#ff9eb5',nt:'#ffe3ea',bk:['255,150,170','255,200,120','255,255,255']},
  ...PATTERNS.map(([k,l])=>({...BASE,n:l,pat:k}))
];
let sc=0,props=true,signText='COCKTAIL CAPTURE',custom=null,stream=null,mode='idle',photo=null,T=null,mirror=true,busy=false,gallery=[];
try{gallery=JSON.parse(localStorage.getItem('cc_gallery')||'[]')}catch(e){}
const L=Array.from({length:24},(_,i)=>({x:(i*397)%W,y:(i*211)%H,r:16+(i*7)%34,c:i%3,sp:8+(i*13)%22,ph:i}));
const newT=f=>({z:1,x:0,y:0,r:0,f,fl:''});

function rr(c,x,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h)}
function bottle(c,x,by,w,h,col){
  c.fillStyle=col;rr(c,x,by-h*.65,w,h*.65,8);c.fill();rr(c,x+w*.33,by-h,w*.34,h*.4,5);c.fill();
  c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x+6,by-h*.6,5,h*.5);
  c.fillStyle='#e9dcc0';c.fillRect(x+w*.12,by-h*.38,w*.76,h*.18);
}
function martini(c,x,base){
  c.strokeStyle='rgba(255,255,255,.55)';c.fillStyle='rgba(255,255,255,.1)';c.lineWidth=4;
  c.beginPath();c.moveTo(x-50,base-110);c.lineTo(x+50,base-110);c.lineTo(x,base-50);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(x,base-50);c.lineTo(x,base-6);c.moveTo(x-28,base-4);c.lineTo(x+28,base-4);c.stroke();
  c.fillStyle='#6b8e23';c.beginPath();c.arc(x+8,base-82,8,0,7);c.fill();
}
// Static layer: wall + props. The sign and lights are animated separately.
function rebuild(){
  const c=bg.getContext('2d'),s=SCENES[sc];c.clearRect(0,0,W,H);
  if(custom){const r=Math.max(W/custom.naturalWidth,H/custom.naturalHeight),w=custom.naturalWidth*r,h=custom.naturalHeight*r;c.drawImage(custom,(W-w)/2,(H-h)/2,w,h)}
  else if(s.pat)drawPattern(c,s.pat,W,H);
  else{
    const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,s.w[0]);g.addColorStop(1,s.w[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=3;for(let x=0;x<W;x+=72){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  }
  if(!props)return;
  if(s.pat||custom){const g=c.createLinearGradient(0,0,0,260);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,260)}
  for(let i=0,x=70;x<W-70;i++,x+=84)bottle(c,x,222,40,60+(i*37)%40,s.b[i%6]);
  c.fillStyle='#5a3418';c.fillRect(30,222,W-60,16);c.fillStyle='rgba(255,200,120,.35)';c.fillRect(30,222,W-60,3);
  const g=c.createLinearGradient(0,1075,0,H);g.addColorStop(0,s.ct[0]);g.addColorStop(.08,s.ct[1]);g.addColorStop(1,s.ct[2]);
  c.fillStyle=g;c.fillRect(0,1075,W,H-1075);c.fillStyle='rgba(255,210,140,.5)';c.fillRect(0,1075,W,4);
  martini(c,170,1275);martini(c,910,1275);
  c.textAlign='center';c.fillStyle='#f6e7cf';c.font=`600 56px ${F}`;c.fillText('Cheers!',W/2,1200);
  c.fillStyle='#b9a182';c.font=`500 26px ${F}`;c.fillText(new Date().toLocaleDateString(),W/2,1250);
}
function lights(t){
  const bk=SCENES[sc].bk;
  for(const l of L){
    ctx.fillStyle=`rgba(${bk[l.c]},${.09+.05*Math.sin(t*1.4+l.ph)})`;ctx.beginPath();
    ctx.arc(l.x+Math.sin(t*.4+l.ph)*14,((l.y-t*l.sp)%H+H)%H,l.r,0,7);ctx.fill();
  }
}
function sign(t){
  const s=SCENES[sc];ctx.save();ctx.textAlign='center';let z=64;ctx.font=`800 ${z}px ${F}`;
  while(ctx.measureText(signText).width>W-140&&z>24){z-=2;ctx.font=`800 ${z}px ${F}`}
  ctx.globalAlpha=motion&&Math.sin(t*37)>.96&&Math.sin(t*2.3)>0?.5:1;
  ctx.shadowColor=s.neon;ctx.shadowBlur=26+(motion?10*Math.sin(t*2.2):0);ctx.fillStyle=s.nt;ctx.fillText(signText,W/2,96);ctx.restore();
}
function paint(src,t){
  const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height;if(!sw)return;
  const s=Math.max(PW/sw,PH/sh)*t.z;
  ctx.save();ctx.filter=t.fl||'none';
  ctx.translate(PX+PW/2+t.x*PW/2,PY+PH/2+t.y*PH/2);ctx.rotate(t.r*Math.PI/180);ctx.scale(t.f?-1:1,1);
  ctx.drawImage(src,-sw*s/2,-sh*s/2,sw*s,sh*s);ctx.restore();
}
function draw(){
  const t=motion?performance.now()/1000:0;
  ctx.drawImage(bg,0,0);lights(t);if(props)sign(t);
  ctx.save();rr(ctx,PX,PY,PW,PH,24);ctx.clip();ctx.fillStyle='#0d0704';ctx.fillRect(PX,PY,PW,PH);
  if(mode==='live')paint(video,newT(true));
  else if(mode==='review')paint(photo,T);
  else{ctx.fillStyle='#b9a182';ctx.textAlign='center';ctx.font=`500 36px ${F}`;ctx.fillText('Your photo goes here',PX+PW/2,PY+PH/2)}
  ctx.restore();
  ctx.strokeStyle='#f0a73a';ctx.lineWidth=8;rr(ctx,PX,PY,PW,PH,24);ctx.stroke();
}
function loop(){draw();requestAnimationFrame(loop)}
const status=t=>$('status').textContent=t;
function ui(){
  const rv=mode==='review';
  $('live-actions').hidden=rv;$('review-actions').hidden=!rv;$('editor').hidden=!rv;cv.classList.toggle('grab',rv);
  $('btnCam').textContent=stream?'Stop camera':'Start camera';$('btnCam').disabled=busy;$('btnSnap').disabled=mode!=='live'||busy;
}
function goLive(){mode=stream?'live':'idle';status(stream?'Strike a pose, then tap Take photo.':'Start the camera or upload a photo.');ui()}

// Photo editor
const ED=[['ez','z',100],['ex','x',100],['ey','y',100],['er','r',1]];
function sync(){
  ED.forEach(([id,k,m])=>{const v=Math.round(T[k]*m),el=$(id);el.value=v;el.parentElement.querySelector('output').textContent=v+(k==='z'?'%':k==='r'?'°':'')});
  $('ef').value=T.fl;
}
ED.forEach(([id,k,m])=>$(id).oninput=e=>{T[k]=+e.target.value/m;sync()});
$('ef').onchange=e=>{T.fl=e.target.value};
$('eflip').onclick=()=>{T.f=!T.f};
$('ereset').onclick=()=>{T=newT(mirror);sync()};
let drag=null;
cv.onpointerdown=e=>{if(mode!=='review')return;drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{
  if(!drag)return;const k=W/cv.getBoundingClientRect().width;
  T.x=clamp(T.x+(e.clientX-drag.x)*k/(PW/2),-1,1);T.y=clamp(T.y+(e.clientY-drag.y)*k/(PH/2),-1,1);
  drag.x=e.clientX;drag.y=e.clientY;sync();
};
cv.onpointerup=cv.onpointercancel=()=>{drag=null};
cv.addEventListener('wheel',e=>{if(mode!=='review')return;e.preventDefault();T.z=clamp(T.z*(e.deltaY<0?1.06:.94),.5,3);sync()},{passive:false});

// Camera, capture, upload
$('btnCam').onclick=async()=>{
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;mode='idle';status('Camera off.');ui();return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});
    video.srcObject=stream;await video.play();goLive();
  }catch(e){stream=null;status('Camera unavailable. Allow camera access (use localhost or https) or upload a photo.')}
  ui();
};
$('btnSnap').onclick=async()=>{
  busy=true;ui();const n=$('count');
  for(let i=3;i>0;i--){n.innerHTML='<span>'+i+'</span>';await new Promise(r=>setTimeout(r,1000))}
  n.textContent='';
  const sn=document.createElement('canvas');sn.width=video.videoWidth;sn.height=video.videoHeight;sn.getContext('2d').drawImage(video,0,0);
  photo=sn;mirror=true;T=newT(true);mode='review';busy=false;
  const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  status('Looking good? Edit, save, download, or retake.');sync();ui();
};
$('file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const img=new Image();
  img.onload=()=>{photo=img;mirror=false;T=newT(false);mode='review';status('Edit, save, download, or retake.');sync();ui()};
  img.onerror=()=>status('That file could not be read as an image.');
  img.src=URL.createObjectURL(f);e.target.value='';
};
$('btnRetake').onclick=()=>{photo=null;goLive()};
$('btnDownload').onclick=()=>{draw();const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='cocktail-capture-'+Date.now()+'.png';a.click()};
$('btnSave').onclick=()=>{
  draw();const id=Date.now();gallery.unshift({id,src:cv.toDataURL('image/jpeg',.9)});gallery=gallery.slice(0,12);
  persist();renderGallery(id);photo=null;goLive();status('Saved to gallery.');
};

// Background scenes
const sceneBtns=[];
SCENES.forEach((s,i)=>{
  const b=document.createElement('button'),c=document.createElement('canvas');c.width=128;c.height=80;const t=c.getContext('2d');
  if(s.pat)drawPattern(t,s.pat,128,80,.4);
  else{const g=t.createLinearGradient(0,0,0,80);g.addColorStop(0,s.w[0]);g.addColorStop(1,s.w[1]);t.fillStyle=g;t.fillRect(0,0,128,80)}
  t.fillStyle=s.neon;t.fillRect(34,12,60,5);
  b.append(c,s.n);b.onclick=()=>{sc=i;custom=null;rebuild();mark()};sceneBtns.push(b);$('scenes').appendChild(b);
});
function mark(){sceneBtns.forEach((b,i)=>b.setAttribute('aria-pressed',i===sc&&!custom))}
$('props').onchange=e=>{props=e.target.checked;rebuild()};
$('sign').oninput=e=>{signText=e.target.value||' '};
$('bgfile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const img=new Image();
  img.onload=()=>{custom=img;rebuild();mark()};img.src=URL.createObjectURL(f);e.target.value='';
};

// Gallery
function persist(){try{localStorage.setItem('cc_gallery',JSON.stringify(gallery))}catch(e){status('Gallery is full in this browser. Delete a few photos.')}}
function renderGallery(newId){
  const g=$('grid');g.innerHTML='';$('empty').hidden=gallery.length>0;
  gallery.forEach(p=>{
    const d=document.createElement('div');d.className='item'+(p.id===newId?' pop':'');
    d.innerHTML='<img alt="Saved photo"><div class="row"><button class="dl">Download</button><button class="del">Delete</button></div>';
    d.querySelector('img').src=p.src;
    d.querySelector('.dl').onclick=()=>{const a=document.createElement('a');a.href=p.src;a.download='cocktail-capture-'+p.id+'.jpg';a.click()};
    d.querySelector('.del').onclick=()=>{gallery=gallery.filter(x=>x.id!==p.id);persist();renderGallery()};
    g.appendChild(d);
  });
}
rebuild();mark();renderGallery();ui();loop();
if(document.fonts)Promise.all([document.fonts.load('800 64px Inter'),document.fonts.load('600 56px Inter')]).then(rebuild,rebuild);
