const W=1080,H=1350,PX=90,PY=250,PW=900,PH=800; // photo window inside the frame
const $=id=>document.getElementById(id);
const cv=$('stage'),ctx=cv.getContext('2d');cv.width=W;cv.height=H;
const bg=document.createElement('canvas');bg.width=W;bg.height=H;
const video=document.createElement('video');video.playsInline=true;video.muted=true;
let stream=null,mode='idle',shot=null,busy=false,gallery=[];
try{gallery=JSON.parse(localStorage.getItem('cc_gallery')||'[]')}catch(e){}

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
function buildBar(c){
  let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#160c08');g.addColorStop(1,'#3a2213');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=3;
  for(let x=0;x<W;x+=72){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  const cols=['255,170,60','255,90,140','90,200,255'];
  for(let i=0;i<40;i++){c.fillStyle=`rgba(${cols[i%3]},.10)`;c.beginPath();c.arc((i*397)%W,(i*211)%H,16+(i*7)%34,0,7);c.fill()}
  const bc=['#2e7d4f','#b5651d','#2a5d9f','#8e2b3c','#c9a227','#5d3a8c'];
  for(let i=0,x=70;x<W-70;i++,x+=84)bottle(c,x,222,40,60+(i*37)%40,bc[i%6]);
  c.fillStyle='#5a3418';c.fillRect(30,222,W-60,16);c.fillStyle='rgba(255,200,120,.35)';c.fillRect(30,222,W-60,3);
  c.textAlign='center';c.font='bold 64px Georgia,serif';c.shadowColor='#ff4d8d';c.shadowBlur=32;c.fillStyle='#ffd6e6';
  c.fillText('COCKTAIL CAPTURE',W/2,96);c.shadowBlur=0;
  g=c.createLinearGradient(0,1075,0,H);g.addColorStop(0,'#7a4a24');g.addColorStop(.08,'#4a2a14');g.addColorStop(1,'#25140a');
  c.fillStyle=g;c.fillRect(0,1075,W,H-1075);c.fillStyle='rgba(255,210,140,.5)';c.fillRect(0,1075,W,4);
  martini(c,170,1275);martini(c,910,1275);
  c.fillStyle='#f6e7cf';c.font='italic 56px Georgia,serif';c.fillText('Cheers!',W/2,1200);
  c.fillStyle='#b9a182';c.font='28px Georgia,serif';c.fillText(new Date().toLocaleDateString(),W/2,1250);
}
buildBar(bg.getContext('2d'));

function draw(src,mirror){
  ctx.drawImage(bg,0,0);ctx.save();rr(ctx,PX,PY,PW,PH,24);ctx.clip();
  ctx.fillStyle='#0d0704';ctx.fillRect(PX,PY,PW,PH);
  if(src){
    const sw=src.videoWidth||src.naturalWidth,sh=src.videoHeight||src.naturalHeight;
    if(sw){const s=Math.max(PW/sw,PH/sh),dw=sw*s,dh=sh*s;
      if(mirror){ctx.translate(2*PX+PW,0);ctx.scale(-1,1)}
      ctx.drawImage(src,PX+(PW-dw)/2,PY+(PH-dh)/2,dw,dh)}
  }else{
    ctx.fillStyle='#b9a182';ctx.textAlign='center';ctx.font='italic 40px Georgia,serif';
    ctx.fillText('Your photo goes here',PX+PW/2,PY+PH/2);
  }
  ctx.restore();
  ctx.strokeStyle='#f0a73a';ctx.lineWidth=8;rr(ctx,PX,PY,PW,PH,24);ctx.stroke();
}
function loop(){if(mode==='live'){draw(video,true);requestAnimationFrame(loop)}}
function status(t){$('status').textContent=t}
function ui(){
  const review=mode==='review';
  $('live-actions').hidden=review;$('review-actions').hidden=!review;
  $('btnCam').textContent=stream?'Stop camera':'Start camera';
  $('btnSnap').disabled=mode!=='live'||busy;
}
function goLive(){mode=stream?'live':'idle';if(stream)loop();else draw(null);ui()}

$('btnCam').onclick=async()=>{
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;mode='idle';draw(null);status('Camera off.');ui();return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});
    video.srcObject=stream;await video.play();mode='live';loop();status('Strike a pose, then tap Take photo.');
  }catch(e){stream=null;status('Camera unavailable. Allow camera access (use localhost or https) or upload a photo.')}
  ui();
};
$('btnSnap').onclick=async()=>{
  busy=true;ui();const n=$('count');
  for(let i=3;i>0;i--){n.textContent=i;await new Promise(r=>setTimeout(r,1000))}
  n.textContent='';draw(video,true);shot=cv.toDataURL('image/png');mode='review';busy=false;
  const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  status('Looking good? Save, download, or retake.');ui();
};
$('file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const img=new Image();
  img.onload=()=>{draw(img,false);shot=cv.toDataURL('image/png');mode='review';URL.revokeObjectURL(img.src);status('Save, download, or retake.');ui()};
  img.onerror=()=>status('That file could not be read as an image.');
  img.src=URL.createObjectURL(f);e.target.value='';
};
$('btnRetake').onclick=()=>{shot=null;status(stream?'Strike a pose, then tap Take photo.':'Start the camera or upload a photo.');goLive()};
$('btnDownload').onclick=()=>save(shot,'cocktail-capture-'+Date.now()+'.png');
$('btnSave').onclick=()=>{
  gallery.unshift({id:Date.now(),src:shot});gallery=gallery.slice(0,12);persist();renderGallery();
  shot=null;status('Saved to gallery.');goLive();
};
function save(src,name){const a=document.createElement('a');a.href=src;a.download=name;a.click()}
function persist(){try{localStorage.setItem('cc_gallery',JSON.stringify(gallery))}catch(e){status('Gallery is full in this browser. Delete a few photos.')}}
function renderGallery(){
  const g=$('grid');g.innerHTML='';$('empty').hidden=gallery.length>0;
  gallery.forEach(p=>{
    const d=document.createElement('div');d.className='item';
    d.innerHTML='<img alt="Saved photo"><div class="row"><button class="dl">Download</button><button class="del">Delete</button></div>';
    d.querySelector('img').src=p.src;
    d.querySelector('.dl').onclick=()=>save(p.src,'cocktail-capture-'+p.id+'.png');
    d.querySelector('.del').onclick=()=>{gallery=gallery.filter(x=>x.id!==p.id);persist();renderGallery()};
    g.appendChild(d);
  });
}
draw(null);renderGallery();ui();
