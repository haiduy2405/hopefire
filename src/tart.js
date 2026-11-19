"use strict";
// ===== TOWER ART (v0.17.1): every tower class has its own silhouette, element only tints it =====
// towerArt() draws one tower standing on ground point (X,Y). Used by the battlefield (drawMod) and, through
// modIcon(), by the crate cards / loadout / ring diagram so a tower looks the same everywhere.
const TA={ol:'#0a0c11',m1:'#2c3342',m2:'#4a5468',m3:'#7c879b',m4:'#aab4c6'};
function taMix(col,k){ // lighten (k>0) or darken (k<0) a #rrggbb colour
  const n=parseInt(col.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));
  return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(f).map(v=>v.toString(16).padStart(2,'0')).join('');
}
function taRect(c,x,y,w,h,f,o){c.fillStyle=TA.ol;c.fillRect(x-1,y-1,w+2,h+2);c.fillStyle=f;c.fillRect(x,y,w,h)}
function taPlate(c,X,Y,col,w){
  c.fillStyle='#10131a';c.beginPath();c.ellipse(X,Y+1,w||17,(w||17)*0.4,0,0,7);c.fill();
  c.strokeStyle=taMix(col,-0.25);c.lineWidth=1.6;c.stroke();
  c.fillStyle=TA.m2;c.beginPath();c.ellipse(X,Y,(w||17)-4,((w||17)-4)*0.38,0,0,7);c.fill();
}
function taGlow(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.restore()}
function taBar(c,x,y,len,w,ang,fill){c.save();c.translate(x,y);c.rotate(ang);c.fillStyle=TA.ol;c.fillRect(-2,-w/2-1,len+4,w+2);c.fillStyle=fill;c.fillRect(0,-w/2,len,w);c.restore()}

const TART={
  lance(c,X,Y,col,o){ // floating prism on a pedestal: a short focused beam
    taPlate(c,X,Y,col);taRect(c,X-4,Y-9,8,8,TA.m2);taRect(c,X-6,Y-4,12,4,TA.m1);
    const bob=Math.sin(o.T*3+X)*1.8,cy=Y-26+bob,fl=o.fl?1.2:1;
    c.fillStyle=TA.ol;c.beginPath();c.moveTo(X,cy-15*fl);c.lineTo(X+8,cy);c.lineTo(X,cy+13);c.lineTo(X-8,cy);c.closePath();c.fill();
    c.fillStyle=taMix(col,0.1);c.beginPath();c.moveTo(X,cy-13*fl);c.lineTo(X+6.2,cy);c.lineTo(X,cy+11);c.lineTo(X-6.2,cy);c.closePath();c.fill();
    c.fillStyle=taMix(col,0.65);c.beginPath();c.moveTo(X,cy-13*fl);c.lineTo(X-6.2,cy);c.lineTo(X,cy+11);c.closePath();c.fill();
    c.fillStyle='#fff';c.globalAlpha=0.8;c.fillRect(X-1,cy-6,2,5);c.globalAlpha=1;
    taGlow(c,X,cy,o.fl?26:17,col,o.fl?0.8:0.45);
    for(let i=0;i<3;i++){const a=o.T*2+i*2.1;c.fillStyle=taMix(col,0.4);c.fillRect(X+Math.cos(a)*11-1,cy+Math.sin(a)*4-1,2,2)}
  },
  rail(c,X,Y,col,o){ // heavy twin-rail cannon: long barrel that swings to the target
    taPlate(c,X,Y,col);taRect(c,X-8,Y-12,16,9,TA.m2);taRect(c,X-6,Y-14,12,3,TA.m3);
    const a=o.a===undefined?-1.2:o.a,hx=X,hy=Y-15,rec=o.fl?3:0,ca=Math.cos(a),sa=Math.sin(a);
    c.save();c.translate(hx-ca*rec,hy-sa*rec*0.6);c.rotate(a);
    c.fillStyle=TA.ol;c.fillRect(-4,-5.5,36,11);
    c.fillStyle=TA.m2;c.fillRect(-3,-4.5,34,3.2);c.fillRect(-3,1.3,34,3.2);
    c.fillStyle=TA.m4;c.fillRect(-3,-4.5,34,1);c.fillRect(-3,1.3,34,1);
    for(let i=0;i<4;i++){c.fillStyle=taMix(col,-0.1);c.fillRect(2+i*7,-5.5,3,11)}
    c.fillStyle=col;c.fillRect(28,-4.5,4,9);
    c.restore();
    if(o.fl)taGlow(c,hx+ca*32,hy+sa*32*0.7,16,col,0.9);
    taRect(c,X-4,Y-17,8,6,TA.m3);
  },
  mortar(c,X,Y,col,o){ // squat lobber: fat tube angled up, shell drum on the side
    taPlate(c,X,Y,col,19);
    c.fillStyle=TA.ol;c.beginPath();c.ellipse(X,Y-5,12,5.5,0,0,7);c.fill();c.fillStyle=TA.m2;c.beginPath();c.ellipse(X,Y-5,10.5,4.5,0,0,7);c.fill();
    taRect(c,X-9,Y-8,6,4,'#8b7a52');taRect(c,X+3,Y-8,6,4,'#8b7a52'); // sandbags
    const dir=o.a!==undefined&&Math.cos(o.a)<0?-1:1,rec=o.fl?2.5:0;
    c.save();c.translate(X,Y-8+rec);c.scale(dir,1);c.rotate(-1.05);
    c.fillStyle=TA.ol;c.fillRect(-6,-26,12,28);c.fillStyle=TA.m2;c.fillRect(-4.8,-25,9.6,26);c.fillStyle=TA.m3;c.fillRect(-4.8,-25,2.6,26);
    c.fillStyle=TA.ol;c.fillRect(-8,-30,16,6);c.fillStyle=TA.m1;c.fillRect(-7,-29,14,4);
    c.fillStyle=col;c.fillRect(-4.8,-12,9.6,3);c.fillRect(-4.8,-6,9.6,2);
    c.restore();
    if(o.fl)taGlow(c,X+dir*14,Y-34,16,'#ffd27a',0.9);
    taRect(c,X-3,Y-10,6,5,TA.m3);
  },
  amp(c,X,Y,col,o){ // Prism Spire: tall pylon with a spinning octahedron and orbiting sparks
    taPlate(c,X,Y,col,15);taRect(c,X-3,Y-22,6,20,TA.m2);taRect(c,X-5,Y-6,10,4,TA.m1);taRect(c,X-4.5,Y-14,9,2,TA.m3);
    const cy=Y-31+Math.sin(o.T*2.2+X)*1.5,w=Math.abs(Math.cos(o.T*2))*7+2;
    c.fillStyle=TA.ol;c.beginPath();c.moveTo(X,cy-11);c.lineTo(X+w+1,cy);c.lineTo(X,cy+11);c.lineTo(X-w-1,cy);c.closePath();c.fill();
    c.fillStyle=taMix(col,0.2);c.beginPath();c.moveTo(X,cy-9.5);c.lineTo(X+w,cy);c.lineTo(X,cy+9.5);c.lineTo(X-w,cy);c.closePath();c.fill();
    c.fillStyle='#fff';c.globalAlpha=0.7;c.fillRect(X-1,cy-5,2,5);c.globalAlpha=1;
    taGlow(c,X,cy,24,col,0.6);
    for(let i=0;i<2;i++){const a=o.T*3+i*Math.PI;c.fillStyle='#fff';c.fillRect(X+Math.cos(a)*14-1.5,cy+Math.sin(a)*5-1.5,3,3)}
  },
  well(c,X,Y,col,o){ // Gravity Well: tripod cradle, dark core, swirling violet ring
    taPlate(c,X,Y,col,15);c.strokeStyle=TA.ol;c.lineWidth=4;c.beginPath();c.moveTo(X-11,Y-1);c.lineTo(X,Y-18);c.lineTo(X+11,Y-1);c.moveTo(X,Y-18);c.lineTo(X,Y);c.stroke();
    c.strokeStyle=TA.m3;c.lineWidth=2;c.beginPath();c.moveTo(X-11,Y-1);c.lineTo(X,Y-18);c.lineTo(X+11,Y-1);c.moveTo(X,Y-18);c.lineTo(X,Y);c.stroke();
    const cy=Y-27;taGlow(c,X,cy,o.fl?30:20,col,o.fl?0.9:0.5);
    c.fillStyle=TA.ol;c.beginPath();c.arc(X,cy,9,0,7);c.fill();c.fillStyle='#120a22';c.beginPath();c.arc(X,cy,7.4,0,7);c.fill();
    c.save();c.translate(X,cy);c.rotate(o.T*2.4);c.strokeStyle=taMix(col,0.25);c.lineWidth=2.2;c.beginPath();c.ellipse(0,0,15,5,0,0,Math.PI*1.5);c.stroke();c.rotate(1.9);c.globalAlpha=0.6;c.beginPath();c.ellipse(0,0,12,3.5,0,0,Math.PI*1.3);c.stroke();c.restore();
  },
  mine(c,X,Y,col,o){ // Mine Layer: low launch bay with an open hatch and mines in the rack
    taPlate(c,X,Y,col,19);taRect(c,X-12,Y-11,24,9,TA.m2);taRect(c,X-12,Y-13,24,3,TA.m3);
    c.fillStyle='#0b0907';c.fillRect(X-9,Y-10,18,4);
    c.save();c.translate(X-12,Y-13);c.rotate(o.fl?-1.2:-0.5);taRect(c,0,-3,10,3,TA.m3);c.restore();
    for(let i=0;i<3;i++){const mx=X-6+i*6,my=Y-14-(i===1?1:0);c.fillStyle=TA.ol;c.beginPath();c.arc(mx,my,3.4,0,7);c.fill();c.fillStyle='#3a2f28';c.beginPath();c.arc(mx,my,2.6,0,7);c.fill();
      c.fillStyle=Math.sin(o.T*6+i)>0?col:'#7a2a14';c.fillRect(mx-1,my-1,2,2)}
    taRect(c,X+6,Y-19,5,6,TA.m3);c.fillStyle=col;c.fillRect(X+7,Y-18,3,2);
  },
  snipe(c,X,Y,col,o){ // Longshot: tripod rifle, long thin barrel, scope and a laser sight
    taPlate(c,X,Y,col,15);c.strokeStyle=TA.ol;c.lineWidth=4;c.beginPath();c.moveTo(X-9,Y-1);c.lineTo(X,Y-14);c.lineTo(X+9,Y-1);c.stroke();
    c.strokeStyle=TA.m3;c.lineWidth=1.8;c.beginPath();c.moveTo(X-9,Y-1);c.lineTo(X,Y-14);c.lineTo(X+9,Y-1);c.stroke();
    const a=o.a===undefined?-0.9:o.a,hx=X,hy=Y-17,rec=o.fl?3:0;
    c.save();c.translate(hx-Math.cos(a)*rec,hy-Math.sin(a)*rec*0.6);c.rotate(a);
    c.fillStyle=TA.ol;c.fillRect(-8,-4,48,8);c.fillStyle=TA.m2;c.fillRect(-7,-3,46,6);c.fillStyle=TA.m3;c.fillRect(-7,-3,46,2);
    c.fillStyle=TA.ol;c.fillRect(4,-8,12,5);c.fillStyle=TA.m1;c.fillRect(5,-7,10,3);c.fillStyle=col;c.fillRect(14,-7,2,3);
    c.fillStyle=TA.ol;c.fillRect(36,-5,6,10);c.fillStyle=TA.m3;c.fillRect(37,-4,4,8);
    c.globalAlpha=0.5+0.3*Math.sin(o.T*9);c.fillStyle=col;c.fillRect(42,-0.6,26,1.2);c.restore();
    if(o.fl)taGlow(c,hx+Math.cos(a)*42,hy+Math.sin(a)*42*0.7,18,'#eafff2',0.9);
  },
  coil(c,X,Y,col,o){ // Tesla Coil: stacked copper rings and a crackling top
    taPlate(c,X,Y,col,15);taRect(c,X-3,Y-14,6,12,TA.m2);
    const rs=[[11,Y-9],[9,Y-15],[7,Y-21]];for(const [w,y] of rs){c.fillStyle=TA.ol;c.beginPath();c.ellipse(X,y,w+1.5,4.2,0,0,7);c.fill();c.fillStyle='#b9743c';c.beginPath();c.ellipse(X,y,w,3.3,0,0,7);c.fill();c.fillStyle='#e3a063';c.beginPath();c.ellipse(X-1,y-0.8,w-3,1.4,0,0,7);c.fill()}
    const cy=Y-30;c.fillStyle=TA.ol;c.beginPath();c.arc(X,cy,6.5,0,7);c.fill();c.fillStyle=taMix(col,0.1);c.beginPath();c.arc(X,cy,5.2,0,7);c.fill();c.fillStyle='#fff';c.globalAlpha=0.7;c.fillRect(X-2,cy-3,2,2);c.globalAlpha=1;
    taGlow(c,X,cy,o.fl?30:20,col,o.fl?0.95:0.5);
    c.save();c.strokeStyle='#fff';c.lineWidth=1.2;c.globalAlpha=0.55+0.4*Math.random();c.beginPath();const a0=Math.random()*6.28;let px=X+Math.cos(a0)*6,py=cy+Math.sin(a0)*6;c.moveTo(px,py);for(let i=0;i<3;i++){px+=Math.cos(a0)*5+(Math.random()-0.5)*6;py+=Math.sin(a0)*5+(Math.random()-0.5)*6;c.lineTo(px,py)}c.stroke();c.restore();
  },
  aegis(c,X,Y,col,o){ // Aegis Projector: dish and emitter dome with a ripple ring
    taPlate(c,X,Y,col,16);taRect(c,X-3,Y-12,6,10,TA.m2);
    c.save();c.translate(X,Y-15);c.rotate(-0.35);c.fillStyle=TA.ol;c.beginPath();c.ellipse(0,0,14,6.5,0,0,Math.PI);c.fill();c.fillStyle=TA.m3;c.beginPath();c.ellipse(0,-0.5,12.2,5.2,0,0,Math.PI);c.fill();c.fillStyle=TA.m4;c.beginPath();c.ellipse(0,-1,12.2,3.4,0,Math.PI,Math.PI*2);c.fill();c.restore();
    const cy=Y-24+Math.sin(o.T*2.5)*1.2;taGlow(c,X,cy,o.fl?28:19,col,o.fl?0.95:0.55);c.fillStyle=TA.ol;c.beginPath();c.arc(X,cy,5.6,0,7);c.fill();c.fillStyle=taMix(col,0.2);c.beginPath();c.arc(X,cy,4.4,0,7);c.fill();c.fillStyle='#fff';c.globalAlpha=0.7;c.fillRect(X-1.5,cy-2.5,2,2);c.globalAlpha=1;
    const p=(o.T*0.7)%1;c.save();c.globalAlpha=0.5*(1-p);c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.ellipse(X,Y-10,10+p*14,4+p*5.6,0,0,7);c.stroke();c.restore();
  }
};
// opts: {a:aim angle, fl:just fired, T:time}
// AI art (assets/towers/<class>.png, v0.19.1): static sprites in the same style as the ships; code-drawn TART stays as fallback.
const TIMG={},TOWL={pending:0},TFLIP={rail:1,mortar:1,snipe:1};
function towerLoad(){for(const k in TART){if(TIMG[k])continue;const im=new Image();TOWL.pending++;im.onload=()=>{TOWL.pending--;im._ok=1};im.onerror=()=>{TOWL.pending--};im.src='assets/towers/'+k+'.png';TIMG[k]=im}}
function towerAI(cls){const im=TIMG[cls];return im&&im._ok?im:null}
function towerArt(c,cls,col,X,Y,o){
  o=o||{T:0};const im=towerAI(cls);
  if(im){
    const S=0.3,w=im.naturalWidth*S,h=im.naturalHeight*S,flip=TFLIP[cls]&&o.a!==undefined&&Math.cos(o.a)<0;
    c.fillStyle='#10131a';c.globalAlpha=0.55;c.beginPath();c.ellipse(X,Y+6,w*0.5,w*0.17,0,0,7);c.fill();c.globalAlpha=1;
    taGlow(c,X,Y+4,w*0.62,col,o.fl?0.55:0.22);                       // element colour pooled under the base
    const rec=o.fl?1.5:0;c.save();c.translate(X,Y+9-rec);if(flip)c.scale(-1,1);c.drawImage(im,-w/2,-h,w,h);c.restore();
    c.save();c.globalCompositeOperation='lighter';c.globalAlpha=o.fl?0.35:0.08+0.05*Math.sin(o.T*3+X);c.fillStyle=col;c.beginPath();c.ellipse(X,Y+4,w*0.46,w*0.15,0,0,7);c.fill();c.restore();
    return true}
  const f=TART[cls];if(f){f(c,X,Y,col,o);return true}return false}

// small cached icon (data URL) for HTML UIs
const MICO={};
function modIcon(t,size,rc){
  const key=t.c+'_'+t.ty;let url=MICO[key];
  if(!url){const cv2=document.createElement('canvas');cv2.width=cv2.height=96;const g=cv2.getContext('2d');g.imageSmoothingEnabled=false;
    const im=towerAI(t.c);
    if(im){const k=Math.min(88/im.naturalWidth,88/im.naturalHeight);const w=im.naturalWidth*k,h=im.naturalHeight*k;g.drawImage(im,48-w/2,92-h,w,h);g.globalCompositeOperation='destination-over';const gr=g.createRadialGradient(48,84,2,48,84,46);gr.addColorStop(0,TYPES[t.ty].c+'aa');gr.addColorStop(1,TYPES[t.ty].c+'00');g.fillStyle=gr;g.fillRect(0,0,96,96)}
    else{g.setTransform(1.55,0,0,1.55,48,78);towerArt(g,t.c,TYPES[t.ty].c,0,0,{T:0.6,a:-0.5})}
    url=cv2.toDataURL();if(im||!TOWL.pending)MICO[key]=url}
  return `<img class="mico" src="${url}" width="${size||44}" height="${size||44}" alt="">`;
}

// icon for any module: code-drawn tower, or the old sprite for drones
function modArt(t,px,sc){return TART[t.c]?modIcon(t,px):ico('mod_'+t.ty,sc,0,'')}
