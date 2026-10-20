const F='Inter,system-ui,sans-serif';
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// Layouts: canvas size, photo windows [x,y,w,h], and where the bar props sit
const MODES=[
  {k:'single',label:'Single photo',n:1,W:1080,H:1350,wins:[[90,250,900,800]],shelf:222,cnt:1075,cheers:1200,date:1250,glass:1275,gx:170},
  {k:'strip',label:'Photo strip (3)',n:3,W:720,H:1900,wins:[[50,240,620,440],[50,704,620,440],[50,1168,620,440]],shelf:206,cnt:1650,cheers:1760,date:1810,glass:1860,gx:110}
];
let M=MODES[1],W=M.W,H=M.H;
const cv=$('stage'),ctx=cv.getContext('2d');
const bg=document.createElement('canvas');
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
let sc=0,props=true,signText='COCKTAIL CAPTURE',custom=null,stream=null,busy=false,gallery=[],shots=Array(M.n).fill(null),cur=0;
try{gallery=JSON.parse(localStorage.getItem('cc_gallery')||'[]')}catch(e){}
const L=Array.from({length:24},(_,i)=>({x:((i*397)%1000)/1000,y:((i*211)%1000)/1000,r:16+(i*7)%34,c:i%3,sp:8+(i*13)%22,ph:i}));
const newT=f=>({z:1,x:0,y:0,r:0,f,fl:''});
const status=t=>$('status').textContent=t;

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
  const c=bg.getContext('2d'),s=SCENES[sc],{shelf,cnt,cheers,date,glass,gx}=M;c.clearRect(0,0,W,H);
  if(custom){const r=Math.max(W/custom.naturalWidth,H/custom.naturalHeight),w=custom.naturalWidth*r,h=custom.naturalHeight*r;c.drawImage(custom,(W-w)/2,(H-h)/2,w,h)}
  else if(s.pat)drawPattern(c,s.pat,W,H,1);
  else{
    const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,s.w[0]);g.addColorStop(1,s.w[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=3;for(let x=0;x<W;x+=72){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  }
  if(!props)return;
  if(s.pat||custom){const g=c.createLinearGradient(0,0,0,shelf+38);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,shelf+38)}
  for(let i=0,x=70;x<W-70;i++,x+=84)bottle(c,x,shelf,40,60+(i*37)%40,s.b[i%6]);
  c.fillStyle='#5a3418';c.fillRect(30,shelf,W-60,16);c.fillStyle='rgba(255,200,120,.35)';c.fillRect(30,shelf,W-60,3);
  const g=c.createLinearGradient(0,cnt,0,H);g.addColorStop(0,s.ct[0]);g.addColorStop(.08,s.ct[1]);g.addColorStop(1,s.ct[2]);
  c.fillStyle=g;c.fillRect(0,cnt,W,H-cnt);c.fillStyle='rgba(255,210,140,.5)';c.fillRect(0,cnt,W,4);
  martini(c,gx,glass);martini(c,W-gx,glass);
  c.textAlign='center';c.fillStyle='#f6e7cf';c.font=`600 56px ${F}`;c.fillText('Cheers!',W/2,cheers);
  c.fillStyle='#b9a182';c.font=`500 26px ${F}`;c.fillText(new Date().toLocaleDateString(),W/2,date);
}
function lights(t){
  const bk=SCENES[sc].bk;
  for(const l of L){
    ctx.fillStyle=`rgba(${bk[l.c]},${.09+.05*Math.sin(t*1.4+l.ph)})`;ctx.beginPath();
    ctx.arc(l.x*W+Math.sin(t*.4+l.ph)*14,((l.y*H-t*l.sp)%H+H)%H,l.r,0,7);ctx.fill();
  }
}
function sign(t){
  const s=SCENES[sc];ctx.save();ctx.textAlign='center';let z=64;ctx.font=`800 ${z}px ${F}`;
  while(ctx.measureText(signText).width>W-140&&z>24){z-=2;ctx.font=`800 ${z}px ${F}`}
  ctx.globalAlpha=motion&&Math.sin(t*37)>.96&&Math.sin(t*2.3)>0?.5:1;
  ctx.shadowColor=s.neon;ctx.shadowBlur=26+(motion?10*Math.sin(t*2.2):0);ctx.fillStyle=s.nt;ctx.fillText(signText,W/2,96);ctx.restore();
}
function paint(src,t,[x,y,w,h]){
  const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height;if(!sw)return;
  const s=Math.max(w/sw,h/sh)*t.z;
  ctx.save();ctx.filter=t.fl||'none';
  ctx.translate(x+w/2+t.x*w/2,y+h/2+t.y*h/2);ctx.rotate(t.r*Math.PI/180);ctx.scale(t.f?-1:1,1);
  ctx.drawImage(src,-sw*s/2,-sh*s/2,sw*s,sh*s);ctx.restore();
}
function draw(clean){
  const t=motion?performance.now()/1000:0,next=shots.findIndex(s=>!s);
  ctx.drawImage(bg,0,0);lights(t);if(props)sign(t);
  M.wins.forEach((win,i)=>{
    const [x,y,w,h]=win;
    ctx.save();rr(ctx,x,y,w,h,24);ctx.clip();ctx.fillStyle='#0d0704';ctx.fillRect(x,y,w,h);
    if(shots[i])paint(shots[i].photo,shots[i].T,win);
    else if(stream&&i===next)paint(video,newT(true),win);
    else{ctx.fillStyle='#b9a182';ctx.textAlign='center';ctx.font=`500 ${M.n>1?32:36}px ${F}`;ctx.fillText(M.n>1?'Photo '+(i+1):'Your photo goes here',x+w/2,y+h/2)}
    ctx.restore();
    const on=!clean&&M.n>1&&i===cur&&shots[i];
    ctx.strokeStyle=on?'#ff4d8d':'#f0a73a';ctx.lineWidth=on?10:8;rr(ctx,x,y,w,h,24);ctx.stroke();
  });
}
function loop(){draw();requestAnimationFrame(loop)}

function ui(){
  const full=shots.every(Boolean),ed=!!shots[cur]&&!busy,e=shots.filter(s=>!s).length;
  $('live-actions').hidden=full;$('review-actions').hidden=!full;$('editor').hidden=!ed;cv.classList.toggle('grab',ed);
  $('btnCam').textContent=stream?'Stop camera':'Start camera';$('btnCam').disabled=busy;
  $('btnSnap').textContent=e>1?`Take ${e} photos`:'Take photo';$('btnSnap').disabled=!stream||busy;
  $('btnRetake').textContent=M.n>1?'Retake this photo':'Retake';$('btnRetakeAll').hidden=M.n===1;
  $('btnDownload').textContent=M.n>1?'Download strip':'Download';
}
function after(){
  const f=shots.filter(Boolean).length;
  if(!shots[cur]){const k=shots.findIndex(Boolean);cur=k<0?0:k}
  status(f===M.n?'Looking good? Click a photo to edit it, then save or download.':f?`${f} of ${M.n} photos ready.`:stream?'Strike a pose, then tap Take photo.':'Start the camera or upload photos.');
  sync();ui();
}
function setMode(i){
  const keep=shots[0];M=MODES[i];W=M.W;H=M.H;cv.width=bg.width=W;cv.height=bg.height=H;
  shots=Array(M.n).fill(null);shots[0]=keep||null;cur=0;
  $('stagewrap').className='stagewrap '+M.k;
  [...$('modes').children].forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
  rebuild();after();
}
MODES.forEach((m,i)=>{const b=document.createElement('button');b.textContent=m.label;b.onclick=()=>{if(!busy)setMode(i)};$('modes').appendChild(b)});

// Photo editor (edits the selected photo)
const ED=[['ez','z',100],['ex','x',100],['ey','y',100],['er','r',1]];
function sync(){
  const T=shots[cur]&&shots[cur].T;if(!T)return;
  ED.forEach(([id,k,m])=>{const v=Math.round(T[k]*m),el=$(id);el.value=v;el.parentElement.querySelector('output').textContent=v+(k==='z'?'%':k==='r'?'°':'')});
  $('ef').value=T.fl;$('edtitle').textContent=M.n>1?`Edit photo ${cur+1} of ${M.n}`:'Edit photo';
}
ED.forEach(([id,k,m])=>$(id).oninput=e=>{if(shots[cur]){shots[cur].T[k]=+e.target.value/m;sync()}});
$('ef').onchange=e=>{if(shots[cur])shots[cur].T.fl=e.target.value};
$('eflip').onclick=()=>{if(shots[cur])shots[cur].T.f=!shots[cur].T.f};
$('ereset').onclick=()=>{if(shots[cur]){shots[cur].T=newT(shots[cur].mirror);sync()}};
const hitWin=e=>{const r=cv.getBoundingClientRect(),k=W/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;return M.wins.findIndex(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h)};
let drag=null;
cv.onpointerdown=e=>{
  if(busy)return;const i=hitWin(e);if(i<0||!shots[i])return;
  cur=i;drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);sync();ui();
};
cv.onpointermove=e=>{
  if(!drag||!shots[cur])return;const k=W/cv.getBoundingClientRect().width,T=shots[cur].T,w=M.wins[cur];
  T.x=clamp(T.x+(e.clientX-drag.x)*k/(w[2]/2),-1,1);T.y=clamp(T.y+(e.clientY-drag.y)*k/(w[3]/2),-1,1);
  drag.x=e.clientX;drag.y=e.clientY;sync();
};
cv.onpointerup=cv.onpointercancel=()=>{drag=null};
cv.addEventListener('wheel',e=>{
  if(busy||!shots[cur]||hitWin(e)!==cur)return;
  e.preventDefault();const T=shots[cur].T;T.z=clamp(T.z*(e.deltaY<0?1.06:.94),.5,3);sync();
},{passive:false});

// Camera, capture sequence, upload
$('btnCam').onclick=async()=>{
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;status('Camera off.');ui();return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});
    video.srcObject=stream;await video.play();after();
  }catch(e){stream=null;status('Camera unavailable. Allow camera access (use localhost or https) or upload photos.');ui()}
};
$('btnSnap').onclick=async()=>{
  busy=true;ui();const n=$('count'),todo=shots.map((s,i)=>s?-1:i).filter(i=>i>=0);
  for(const i of todo){
    cur=i;
    for(let c=3;c>0;c--){status(M.n>1?`Photo ${i+1} of ${M.n}: get ready`:'Get ready');n.innerHTML='<span>'+c+'</span>';await new Promise(r=>setTimeout(r,1000))}
    n.textContent='';
    const sn=document.createElement('canvas');sn.width=video.videoWidth;sn.height=video.videoHeight;sn.getContext('2d').drawImage(video,0,0);
    shots[i]={photo:sn,mirror:true,T:newT(true)};
    const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
    if(i!==todo[todo.length-1])await new Promise(r=>setTimeout(r,800));
  }
  busy=false;after();
};
const loadImg=f=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(f)});
$('file').onchange=async e=>{
  const files=[...e.target.files];e.target.value='';
  for(const f of files){
    const i=shots.findIndex(s=>!s);if(i<0)break;
    try{shots[i]={photo:await loadImg(f),mirror:false,T:newT(false)};cur=i}catch(err){status('Could not read '+f.name)}
  }
  after();
};
$('btnRetake').onclick=()=>{shots[cur]=null;after()};
$('btnRetakeAll').onclick=()=>{shots.fill(null);cur=0;after()};
function snap(type,q){draw(true);return cv.toDataURL(type,q)}
$('btnDownload').onclick=()=>{const a=document.createElement('a');a.href=snap('image/png');a.download=`cocktail-${M.k}-${Date.now()}.png`;a.click()};
$('btnSave').onclick=()=>{
  const id=Date.now();gallery.unshift({id,src:snap('image/jpeg',.85)});gallery=gallery.slice(0,10);
  persist();renderGallery(id);shots.fill(null);cur=0;after();status('Saved to gallery.');
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
setMode(1);mark();renderGallery();loop();
if(document.fonts)Promise.all([document.fonts.load('800 64px Inter'),document.fonts.load('600 56px Inter')]).then(rebuild,rebuild);
