"use strict";
// ===== CANVAS =====
const cv=$('c'),ctx=cv.getContext('2d');
const dk=document.createElement('canvas'),dctx=dk.getContext('2d');
const gc=document.createElement('canvas'),gctx=gc.getContext('2d');
let W,H,DPR,S,OX,OY,groundFor=-1,plants=[];
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;
  for(const c of [cv,dk,gc]){c.width=W*DPR;c.height=H*DPR}
  cv.style.width=W+'px';cv.style.height=H+'px';
  const top=54,bot=118;S=Math.min(W/560,(H-top-bot)/(K*620));OX=W/2;OY=top+(H-top-bot)/2+12;groundFor=-1;
}
addEventListener('resize',resize);resize();
function buildGround(ch){
  groundFor=ch;const g=gctx,r=seeded(ch*7919+3),[c1,c2]=SITE_BG[ch-1];
  g.setTransform(1,0,0,1,0,0);g.fillStyle=c1;g.fillRect(0,0,gc.width,gc.height);
  const useSpr=SPR.has('tile_'+ch),M=Math.max(1,Math.round(DPR*S*ART_PX));
  if(useSpr){g.fillStyle=tilePattern(g,'tile_'+ch,M);g.save();g.translate(Math.round(DPR*OX)%(64*M),Math.round(DPR*OY)%(64*M));g.fillRect(-64*M,-64*M,gc.width+128*M,gc.height+128*M);g.restore()}
  g.setTransform(DPR*S,0,0,DPR*S,DPR*OX,DPR*OY);
  const x0=-OX/S-40,x1=(W-OX)/S+40,y0=-OY/S/K-40,y1=(H-OY)/S/K+40;
  // mottled patches
  if(useSpr){g.globalAlpha=0.35;for(let i=0;i<160;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);g.fillStyle=r()<.5?c2:'#000000';g.beginPath();g.ellipse(x,y*K,rnd(30,90),rnd(20,60)*K,0,0,7);g.fill()}g.globalAlpha=1}
  if(!useSpr)for(let i=0;i<220;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);g.fillStyle=r()<.5?c2:'#00000030';g.beginPath();g.ellipse(x,y*K,rnd(10,40),rnd(6,24)*K,0,0,7);g.fill()}
  // speckles
  if(!useSpr)for(let i=0;i<900;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);g.fillStyle=r()<.5?'#ffffff0c':'#0000002a';g.fillRect(x,y*K,2,2)}
  // crater + scorch
  g.fillStyle='#00000066';g.beginPath();g.ellipse(0,6,95,95*K*0.8,0,0,7);g.fill();
  g.strokeStyle='#0000004d';g.lineWidth=3;for(let i=0;i<14;i++){const a=r()*Math.PI*2,l=rnd(80,170);g.beginPath();g.moveTo(Math.cos(a)*60,Math.sin(a)*60*K);g.lineTo(Math.cos(a)*l,Math.sin(a)*l*K);g.stroke()}
  // skid trail
  g.fillStyle='#00000050';g.beginPath();g.moveTo(-60,-6);g.lineTo(-420,-150*K);g.lineTo(-400,-100*K);g.lineTo(-40,18);g.fill();
  // rocks
  for(let i=0;i<70;i++){const a=r()*Math.PI*2,d=rnd(140,700),x=Math.cos(a)*d,y=Math.sin(a)*d*K,s=rnd(4,16);
    if(useSpr){drawSpr(g,'rock_'+(i%3),0,x,y,r()<.5);continue}
    g.fillStyle='#00000055';g.beginPath();g.ellipse(x+2,y+s*0.35,s,s*0.4,0,0,7);g.fill();
    g.fillStyle='#2b2f2a';g.beginPath();g.moveTo(x-s,y);g.lineTo(x-s*0.6,y-s*0.8);g.lineTo(x+s*0.3,y-s);g.lineTo(x+s,y-s*0.3);g.lineTo(x+s*0.8,y+s*0.2);g.lineTo(x-s*0.5,y+s*0.3);g.closePath();g.fill();
    g.fillStyle='#ffffff14';g.fillRect(x-s*0.5,y-s*0.8,s*0.6,s*0.25)}
  // debris shards
  for(let i=0;i<10;i++){const a=r()*Math.PI*2,d=rnd(110,300),x=Math.cos(a)*d,y=Math.sin(a)*d*K;
    if(useSpr){drawSpr(g,'debris_'+(i%3),0,x,y,r()<.5);continue}g.save();g.translate(x,y);g.rotate(r()*6);g.fillStyle='#4a5162';g.fillRect(-6,-2,rnd(6,16),rnd(3,6));g.fillStyle='#000';g.fillRect(-6,2,10,1);g.restore()}
  // glowing plants (drawn later in additive pass)
  plants=[];for(let i=0;i<60;i++){const a=r()*Math.PI*2,d=rnd(160,720);plants.push({x:Math.cos(a)*d,y:Math.sin(a)*d*K,s:rnd(1.5,3.5),c:['#7dffb0','#5cd0ff','#c79bff'][r()*3|0],ph:r()*6})}
  for(const p of plants){g.strokeStyle='#1d2a22';g.lineWidth=1.5;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-8);g.stroke()}
}
// ===== RENDER =====
let lightsFrame=[];
function render(dt){
  const ch=R?R.ch:meta.sel;if(groundFor!==ch)buildGround(ch);
  let sx=0,sy=0;if(R&&R.shake>0){if(meta.set.shake){sx=rnd(-R.shake,R.shake);sy=rnd(-R.shake,R.shake)}R.shake=Math.max(0,R.shake-dt*40)}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(gc,sx*DPR,sy*DPR);
  ctx.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));
  lightsFrame=[];const T=performance.now()/1000;
  const rr=R?ringR():BASE_RING;
  // shadows
  ctx.fillStyle='#00000066';
  if(R){for(const e of R.en){const f=e.fly?0.6:1;ctx.beginPath();ctx.ellipse(e.x,e.y*K,e.r*1.1*f,e.r*0.45*f,0,0,7);ctx.fill()}
    for(const h of R.mods){ctx.beginPath();ctx.ellipse(h.x,h.y*K+2,16,6,0,0,7);ctx.fill();if(h.dx!==undefined){ctx.beginPath();ctx.ellipse(h.dx,h.dy*K,9,3.5,0,0,7);ctx.fill()}}}
  // goo decals (fade out)
  if(R&&R.dec)for(const d of R.dec){const a=Math.min(1,d.t/3)*0.55;ctx.globalAlpha=a;ctx.fillStyle='#0b0710';ctx.beginPath();ctx.ellipse(d.x,d.y*K,d.r,d.r*0.42,0,0,7);ctx.fill();
    ctx.fillStyle=d.c;ctx.globalAlpha=a*0.7;for(let i=0;i<d.n;i++){const an=d.a+i*2.1,rr2=d.r*(0.7+0.25*Math.sin(i*3.7));ctx.beginPath();ctx.ellipse(d.x+Math.cos(an)*rr2,d.y*K+Math.sin(an)*rr2*0.42,d.r*0.22,d.r*0.1,0,0,7);ctx.fill()}
    ctx.beginPath();ctx.ellipse(d.x,d.y*K,d.r*0.55,d.r*0.22,0,0,7);ctx.fill()}
  ctx.globalAlpha=1;
  // y-sorted entities
  const list=[{y:0,f:drawShip}];
  if(R){for(const h of R.mods){list.push({y:h.y,f:()=>drawMod(h)});if(h.dx!==undefined)list.push({y:h.dy+30,f:()=>drawDrone(h,T)})}for(const e of R.en)list.push({y:e.y,f:()=>drawEnemy(e,T)});
    if(R.corpses)for(const cp of R.corpses)if(SPR.has(cp.k))list.push({y:cp.y,f:()=>{const p=1-cp.t/cp.T;ctx.globalAlpha=Math.max(0,1-p*p);drawSpr(ctx,p<0.15?cp.k+'_flash':cp.k,cp.fi,cp.x,cp.y*K-cp.z*(1-p)+p*6,cp.face<0);ctx.globalAlpha=1}})}
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
  if(R){
    // normal particles
    for(const p of R.pt){if(p.add)continue;ctx.fillStyle=p.c;if(p.smoke){ctx.globalAlpha=Math.min(0.5,p.t*0.35);ctx.beginPath();ctx.arc(p.x,p.y,p.s*0.7,0,7);ctx.fill()}else{ctx.globalAlpha=Math.min(1,p.t*2);ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}}
    ctx.globalAlpha=1;
    // mortar shells (body)
    for(const p of R.pr)if(p.k==='shell'){const x=p.sx+(p.tx-p.sx)*p.t,y=(p.sy+(p.ty-p.sy)*p.t)*K,h=Math.sin(Math.PI*p.t)*90+16*(1-p.t);
      ctx.fillStyle='#00000055';ctx.beginPath();ctx.ellipse(x,y,5,2,0,0,7);ctx.fill();ctx.fillStyle='#222';ctx.fillRect(x-4,y-h-4,8,8);ctx.fillStyle=p.c;ctx.fillRect(x-2,y-h-2,4,4);lightsFrame.push([x,y-h,40])}
    for(const p of R.pr)if(p.k==='acid'){const y=p.y*K-12-Math.sin(Math.min(1,(p.t||0)*2)*Math.PI)*14;ctx.fillStyle='#00000055';ctx.beginPath();ctx.ellipse(p.x,p.y*K,4,1.6,0,0,7);ctx.fill();
      ctx.fillStyle='#163a08';ctx.beginPath();ctx.arc(p.x,y,5.5,0,7);ctx.fill();ctx.fillStyle='#8cff3a';ctx.beginPath();ctx.arc(p.x,y,3.8,0,7);ctx.fill();lightsFrame.push([p.x,y,28])}
    for(const f of R.fx){if(f.type==='beam'||f.type==='boom')lightsFrame.push([f.x2!==undefined?f.x2:f.x,f.y2!==undefined?f.y2:f.y,f.type==='boom'?f.r*1.6:55])}
  }
  if(R)for(const h of R.mods)if(h.dx!==undefined)lightsFrame.push([h.dx,h.dy*K-30,34]);
  // darkness
  drawDarkness(rr,sx,sy,T);
  ctx.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));
  // additive glow pass
  ctx.globalCompositeOperation='lighter';
  for(const p of plants){const a=0.35+0.25*Math.sin(T*1.5+p.ph);ctx.globalAlpha=a*0.35;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y-9,p.s*3,0,7);ctx.fill();ctx.globalAlpha=a;ctx.fillRect(p.x-p.s/2,p.y-9-p.s/2,p.s,p.s)}
  ctx.globalAlpha=1;
  // warm light pool around the ship (matches key art)
  {ctx.save();ctx.scale(1,K);const fl=1+0.03*Math.sin(T*7)+0.02*Math.sin(T*13.3),g=ctx.createRadialGradient(0,0,8,0,0,rr*1.05*fl);g.addColorStop(0,'rgba(255,150,70,0.30)');g.addColorStop(0.45,'rgba(255,110,40,0.13)');g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rr*1.05*fl,0,7);ctx.fill();ctx.restore()}
  // dust motes drifting in the light
  for(let i=0;i<46;i++){const ang=i*2.399+T*0.03*(i%3-1),rad=(0.15+((i*0.618)%1)*0.8)*rr,x=Math.cos(ang)*rad+Math.sin(T*0.4+i)*8,y=(Math.sin(ang)*rad)*K+((T*6+i*37)%60)-30;
    ctx.globalAlpha=0.10+0.08*Math.sin(T*2+i);ctx.fillStyle=i%4?'#ffd9a0':'#a0e8ff';ctx.fillRect(x,y,1.4,1.4)}
  ctx.globalAlpha=1;
  // ship lights
  const cockpit=0.6+0.4*Math.sin(T*3),aiShip=SPR.has('ship')&&SPR.data.sprites.ship[0].px;
  if(aiShip){glowDot(36,-6,14,'#1fd1ff',cockpit*0.45);glowDot(-40,-3,11+Math.random()*3,'#ff8a30',0.55+Math.random()*0.25);glowDot(-6,4,9,'#ff7a30',0.35+0.2*Math.sin(T*9));if(Math.sin(T*5)>0)glowDot(-12,-30,5,'#ff2a2a',0.8)}
  else{glowDot(28,-16,10,'#1fd1ff',cockpit*0.5);if(Math.sin(T*5)>0)glowDot(-28,-24,7,'#ff2a2a',0.8)}
  if(R)for(const h of R.mods)if(h.fl>0&&h.t.c!=='drone'){const a=h.aim||0;glowDot(h.x+Math.cos(a)*9,h.y*K-15+Math.sin(a)*4,10,TYPES[h.t.ty].c,Math.min(1,h.fl*8))}
  if(R){
    for(const e of R.en)drawEyes(e,T);
    for(const f of R.fx)drawFx(f);
    for(const p of R.pr)if(p.k==='rail'){ctx.strokeStyle=p.c;ctx.lineWidth=3;ctx.globalAlpha=0.9;ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y*K-p.z);ctx.stroke();ctx.globalAlpha=1;glowDot(p.x,p.y*K-p.z,6,p.c,0.6)}
    for(const p of R.pt){if(!p.add)continue;ctx.globalAlpha=Math.min(1,p.t*2.5);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
    ctx.globalAlpha=1;
    for(const o of R.orbs){const c=o.type==='scrap'?'#ffd24a':o.type==='core'?'#c79bff':'#7dffb0',s=o.type==='cell'?5:3;glowDot(o.x,o.y,s*3,c,0.45);if(SPR.has('orb_'+o.type)){ctx.globalCompositeOperation='source-over';drawSpr(ctx,'orb_'+o.type,0,o.x,o.y);ctx.globalCompositeOperation='lighter'}else{ctx.fillStyle=c;ctx.fillRect(o.x-s/2,o.y-s/2,s,s)}}
    for(const h of R.mods)if(h.dx!==undefined)glowDot(h.dx,h.dy*K-30,9,TYPES[h.t.ty].c,0.45);
    if(R.overT>0)for(const h of R.mods)glowDot(h.x,h.y*K-17,16,'#ffe14d',0.5+0.3*Math.sin(T*20));
    if(R.shipFl>0)glowDot(Math.cos(R.shipAim)*20,-44+Math.sin(R.shipAim)*20,18,'#ffb03a',R.shipFl*5);
  }
  ctx.globalCompositeOperation='source-over';
  // detection ring
  ctx.save();ctx.setLineDash([10,10]);ctx.lineDashOffset=-T*12;const pr=R?R.ringPulse:0;
  ctx.strokeStyle=`rgba(255,${Math.floor(120-pr*90)},${Math.floor(70-pr*50)},${0.28+pr*0.5})`;ctx.lineWidth=2+pr*2;
  ctx.beginPath();ctx.ellipse(0,0,rr,rr*K,0,0,7);ctx.stroke();ctx.restore();
  if(R){
    // alert marks
    ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    for(const e of R.en)if(e.state==='rush'&&e.alertT>0){ctx.fillStyle='#ff3a3a';ctx.strokeStyle='#000';ctx.lineWidth=3;const y=e.y*K-e.r*2.4-Math.sin(e.alertT*30)*2;ctx.strokeText('!',e.x,y);ctx.fillText('!',e.x,y)}
    // hp bars
    for(const e of R.en)if(e.hp<e.mhp&&e.k!=='boss'){const w=e.r*2,y=e.y*K-e.r*2.1;ctx.fillStyle='#000';ctx.fillRect(e.x-w/2-1,y-1,w+2,4);ctx.fillStyle='#ff4d5e';ctx.fillRect(e.x-w/2,y,w*Math.max(0,e.hp/e.mhp),2)}
    // floating text
    ctx.lineWidth=3;ctx.strokeStyle='#000';
    for(const t of R.txt){ctx.globalAlpha=Math.min(1,t.t*2.5);const pop=1+0.55*Math.max(0,1-(0.75-t.t)*9);ctx.font=`bold ${Math.round(t.s*pop)}px monospace`;ctx.strokeText(t.v,t.x,t.y);ctx.fillStyle=t.c;ctx.fillText(t.v,t.x,t.y)}
    ctx.globalAlpha=1;
    // screen space
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.textAlign='center';ctx.textBaseline='middle';
    if(R.boss&&!R.boss.dead&&R.boss.state==='rush'||R.boss&&!R.boss.dead&&Math.hypot(R.boss.x,R.boss.y)<rr*1.6){const bw=Math.min(440,W-40),bx=(W-bw)/2,by=64;ctx.fillStyle='#000';ctx.fillRect(bx-2,by-2,bw+4,16);ctx.fillStyle='#8a1838';ctx.fillRect(bx,by,bw*Math.max(0,R.boss.hp/R.boss.mhp),12);ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.fillText(BOSSES[(R.boss.bk||1)-1].n+'  '+fmt(R.boss.hp)+(R.boss.armor<1?'  [ARMORED]':''),W/2,by+6)}
    if(R.banner&&R.banner.t>0){ctx.globalAlpha=Math.min(1,R.banner.t);const y=OY-rr*K*S-36;ctx.font='bold 26px monospace';ctx.lineWidth=5;ctx.strokeStyle='#000';ctx.strokeText(R.banner.s,W/2,y);ctx.fillStyle='#ffb03a';ctx.fillText(R.banner.s,W/2,y);
      if(R.banner.sub){ctx.font='12px monospace';ctx.fillStyle='#9aa3b3';ctx.fillText(R.banner.sub,W/2,y-24)}ctx.globalAlpha=1}
    // cinematic vignette (always)
    {const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.42,W/2,H/2,Math.max(W,H)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.45)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
    // low hope vignette
    if(R.hope<R.maxHope*0.25&&!R.over){const a=0.25+0.15*Math.sin(T*6);const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.7);g.addColorStop(0,'rgba(120,0,0,0)');g.addColorStop(1,`rgba(160,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  }
}
function glowDot(x,y,r,c,a){ctx.globalAlpha=a*0.35;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=a*0.6;ctx.beginPath();ctx.arc(x,y,r*0.45,0,7);ctx.fill();ctx.globalAlpha=1}
function drawDarkness(rr,sx,sy,T){
  const d=dctx;d.setTransform(1,0,0,1,0,0);d.globalCompositeOperation='source-over';d.clearRect(0,0,dk.width,dk.height);
  d.fillStyle='rgba(2,3,8,0.9)';d.fillRect(0,0,dk.width,dk.height);
  d.globalCompositeOperation='destination-out';
  d.setTransform(DPR*S,0,0,DPR*S*K,DPR*(OX+sx),DPR*(OY+sy));
  const fl=1+0.015*Math.sin(T*9)+0.01*Math.sin(T*23);
  let g=d.createRadialGradient(0,0,0,0,0,rr*1.18*fl);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.62,'rgba(0,0,0,0.96)');g.addColorStop(0.85,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
  d.fillStyle=g;d.beginPath();d.arc(0,0,rr*1.18*fl,0,7);d.fill();
  d.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));
  for(const [x,y,r] of lightsFrame){g=d.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,0.85)');g.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=g;d.beginPath();d.arc(x,y,r,0,7);d.fill()}
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0);
}
function drawShip(){
  const c=ctx,T=performance.now()/1000;
  if(SPR.has('ship')&&SPR.data.sprites.ship[0].px){drawSpr(c,'ship',0,0,30,false);c.save();c.translate(4,15);drawCannon(c);c.restore();return}
  if(SPR.has('ship')){drawSpr(c,'ship',0,0,0,false);c.fillStyle=`rgba(255,${150+Math.random()*60|0},40,${0.35+Math.random()*0.35})`;c.fillRect(-55,-6,6,8);drawCannon(c);return}
  c.save();c.rotate(-0.1);
  const hull=[[-48,6],[-32,-24],[22,-30],[52,-10],[46,12],[-38,16]];
  poly(hull,'#000',3);poly(hull,'#4a5162');
  poly([[-32,-24],[22,-30],[44,-14],[-24,-10]],'#5e687b');
  c.fillStyle='#363c49';for(let x=-26;x<40;x+=12)c.fillRect(x,-20,2,30);
  poly([[16,-24],[34,-22],[42,-10],[24,-10]],'#0c3d4d');poly([[18,-22],[30,-21],[34,-14],[24,-14]],`rgba(31,209,255,${0.55+0.3*Math.sin(T*3)})`);
  poly([[-22,10],[-4,12],[-34,30],[-50,27]],'#000',3);poly([[-22,10],[-4,12],[-34,30],[-50,27]],'#3a404f');
  c.fillStyle='#000';c.fillRect(-58,-14,13,20);c.fillStyle='#2a2e38';c.fillRect(-56,-12,9,16);c.fillStyle=`rgba(255,${120+Math.random()*60|0},40,${0.5+Math.random()*0.4})`;c.fillRect(-55,-8,6,8);
  c.fillStyle='#ff9a3d';if(Math.random()<0.15)c.fillRect(-8+rnd(-20,20),-2+rnd(-6,6),2,2);
  c.restore();
  drawCannon(c);
}
function poly(pts,fill,grow){const c=ctx;c.beginPath();pts.forEach(([x,y],i)=>{const gx=grow?Math.sign(x)*grow*0.6:0,gy=grow?Math.sign(y)*grow*0.6:0;i?c.lineTo(x+gx,y+gy):c.moveTo(x+gx,y+gy)});c.closePath();c.fillStyle=fill;c.fill()}
function drawMod(h){
  const c=ctx,X=h.x,Y=h.y*K,col=TYPES[h.t.ty].c,rc=RAR[h.r].c;
  if(h.t.c!=='drone'&&SPR.has('mod_'+h.t.ty)&&SPR.data.sprites['mod_'+h.t.ty][0].px){
    c.strokeStyle=rc;c.lineWidth=2;c.globalAlpha=0.9;c.beginPath();c.ellipse(X,Y+3,14,5.6,0,0,7);c.stroke();c.globalAlpha=1;
    const a=h.aim!==undefined?h.aim:0,left=Math.cos(a)<0,rec=h.fl>0?1.8:0;
    drawSpr(c,'mod_'+h.t.ty,0,X-Math.cos(a)*rec,Y+5-Math.sin(a)*rec*K,left);
    if(h.s>1){c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffd24a';c.strokeStyle='#000';c.lineWidth=2.5;const st='★'.repeat(Math.min(h.s,5))+(h.s>5?'+':'');c.strokeText(st,X,Y+13);c.fillText(st,X,Y+13)}
    return}
  if(SPR.has('mod_'+h.t.ty)){c.strokeStyle=rc;c.lineWidth=2;c.beginPath();c.ellipse(X,Y,15,6.2,0,0,7);c.stroke();drawSpr(c,'mod_'+h.t.ty,0,X,Y,false)}
  else{c.strokeStyle=rc;c.lineWidth=2;c.fillStyle='#151922';c.beginPath();c.ellipse(X,Y,16,6.5,0,0,7);c.fill();c.stroke();
  c.fillStyle='#000';c.fillRect(X-10,Y-17,20,15);c.fillStyle='#3a4150';c.fillRect(X-8,Y-15,16,12);c.fillStyle=col;c.fillRect(X-8,Y-8,16,3)}
  const a=h.aim!==undefined?h.aim:-Math.PI/2,rec=h.fl>0?3:0;
  c.save();c.translate(X,Y-17);
  if(h.t.c==='drone'){c.restore();c.fillStyle='#000';c.fillRect(X-9,Y-22,18,5);c.fillStyle=col;c.fillRect(X-7,Y-21,14,3);if(h.s>1){c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffd24a';c.fillText('★'.repeat(Math.min(h.s,5)),X,Y+12)}return}
  if(h.t.c==='lance'){c.fillStyle='#000';c.beginPath();c.moveTo(0,-14);c.lineTo(7,-5);c.lineTo(0,3);c.lineTo(-7,-5);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(0,-11);c.lineTo(5,-5);c.lineTo(0,1);c.lineTo(-5,-5);c.fill()}
  else{c.rotate(a);const L=h.t.c==='rail'?18:11,w=h.t.c==='rail'?4:7;c.fillStyle='#000';c.fillRect(-2-rec,-w/2-1.5,L+3,w+3);c.fillStyle='#8a94a6';c.fillRect(-rec,-w/2,L,w);c.fillStyle=col;c.fillRect(L-3-rec,-w/2,3,w)}
  c.restore();
  c.fillStyle='#000';c.beginPath();c.arc(X,Y-17,6.5,0,7);c.fill();c.fillStyle='#5a6376';c.beginPath();c.arc(X,Y-17,5,0,7);c.fill();
  if(h.s>1){c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffd24a';c.fillText('★'.repeat(Math.min(h.s,5))+(h.s>5?'+':''),X,Y+12)}
}
function drawEnemy(e,T){
  const c=ctx,X=e.x,Y=e.y*K,r=e.r,ph=e.ph,lunge=e.lunge>0?-e.face*0:0;
  const bob=Math.sin(ph*2)*r*0.07,col=e.hit>0?'#ffffff':e.c,dark='#140d17';
  const z=e.fly?22+Math.sin(T*6+e.ph)*3:0;e.zOff=z;const hidden=!!(R&&isHidden(e));
  if(e.k!=='boss'&&SPR.has(e.k)){
    const fi=Math.floor(e.ph*1.4)%4,a0=c.globalAlpha;if(hidden)c.globalAlpha=0.2;
    const k=drawSpr(c,e.hit>0?e.k+'_flash':e.k,fi,X,Y-z,e.face<0);c.globalAlpha=a0;
    const f=SPR.data.sprites[e.k][fi];e.eyes=f.eyes.map(([x,y,s])=>[x*k,y*k,s*k]);e.spr=true;e._bob=0;
    if(e.frz>0){c.fillStyle='#bff0ffa0';c.beginPath();c.ellipse(X,Y-z-r*0.6,r*1.2,r*0.9,0,0,7);c.fill()}else if(e.slow>0){c.fillStyle='#5cd0ff40';c.beginPath();c.ellipse(X,Y-z-r*0.6,r*1.1,r*0.8,0,0,7);c.fill()}
    return}
  if(e.k==='boss'&&SPR.has('boss_'+(e.bk||1))){
    const nm='boss_'+(e.bk||1),fi=Math.floor(e.ph*1.1)%4,a0=c.globalAlpha;if(hidden)c.globalAlpha=0.12;
    const k=drawSpr(c,e.hit>0?nm+'_flash':nm,fi,X,Y,e.face<0);
    const f=SPR.data.sprites[nm][fi];e.eyes=f.eyes.map(([x,y,s])=>[x*k,y*k,s*k]);e.spr=true;e._bob=0;
    c.save();c.translate(X,Y);
    if(e.bk===3){if(e.armor>1){c.strokeStyle=`rgba(255,225,77,${0.4+0.3*Math.sin(T*12)})`;c.lineWidth=2;c.beginPath();c.ellipse(0,-r*1.6,r*0.95,r*0.35,0,0,7);c.stroke()}
      if(e.mode==='wind'){c.fillStyle=`rgba(255,40,40,${0.3+0.3*Math.sin(T*30)})`;c.beginPath();c.ellipse(0,-r*0.9,r*1.3,r*1.1,0,0,7);c.fill()}
      if(e.mode==='stun'){c.fillStyle='#ffe14d';for(let i=0;i<3;i++){const a=T*4+i*2.1;c.fillRect(Math.cos(a)*r*0.6-2,-r*2.1+Math.sin(a)*r*0.2,4,4)}}}
    if(e.bk===5){c.strokeStyle=`rgba(255,40,60,${0.3+0.2*Math.sin(T*3)})`;c.lineWidth=3;c.beginPath();c.ellipse(0,-r*0.9,r*1.45,r*1.2,0,0,7);c.stroke()}
    if(e.frz>0){c.fillStyle='#bff0ffa0';c.beginPath();c.ellipse(0,-r*0.9,r*1.4,r*1.1,0,0,7);c.fill()}else if(e.slow>0){c.fillStyle='#5cd0ff40';c.beginPath();c.ellipse(0,-r*0.9,r*1.3,r*1.0,0,0,7);c.fill()}
    c.restore();c.globalAlpha=a0;return}
  c.save();if(hidden)c.globalAlpha=e.k==='boss'?0.12:0.2;c.translate(X,Y-z);c.scale(e.face,1);
  const rush=e.state==='rush'&&e.alertT<=0,lean=rush?0.18:0;c.rotate(lean);
  c.strokeStyle=dark;c.lineCap='round';
  if(e.k==='crawler'){
    c.lineWidth=r*0.2;for(let i=0;i<4;i++){const lx=-r*0.6+i*r*0.4,sw=Math.sin(ph*4+i*1.7)*r*0.3;c.beginPath();c.moveTo(lx,-r*0.3);c.lineTo(lx+sw,r*0.1);c.stroke()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.5+bob,r*1.08,r*0.7,0,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.ellipse(0,-r*0.55+bob,r*0.95,r*0.58,0,0,7);c.fill();
    c.fillStyle=dark;for(let i=0;i<3;i++){const sx=-r*0.5+i*r*0.45;c.beginPath();c.moveTo(sx-r*0.15,-r*0.95+bob);c.lineTo(sx,-r*1.45+bob);c.lineTo(sx+r*0.15,-r*0.95+bob);c.fill()}
    e.eyes=[[r*0.55,-r*0.6,r*0.16],[r*0.85,-r*0.55,r*0.13]];
  }else if(e.k==='skitter'){
    c.lineWidth=r*0.14;for(let i=0;i<6;i++){const lx=-r*0.8+i*r*0.32,sw=Math.sin(ph*6+i*2.1)*r*0.45;c.beginPath();c.moveTo(lx,-r*0.4);c.lineTo(lx+sw*0.5,-r*0.85);c.lineTo(lx+sw,r*0.1);c.stroke()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.55+bob,r*1.35,r*0.48,0,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.ellipse(0,-r*0.58+bob,r*1.2,r*0.37,0,0,7);c.fill();
    c.strokeStyle=col;c.lineWidth=r*0.15;c.beginPath();c.moveTo(-r*1.1,-r*0.6+bob);c.quadraticCurveTo(-r*1.8,-r*1.2,-r*1.5,-r*1.6+Math.sin(ph*3)*r*0.2);c.stroke();
    e.eyes=[[r*0.95,-r*0.66,r*0.14],[r*1.15,-r*0.6,r*0.12],[r*0.75,-r*0.7,r*0.1]];
  }else if(e.k==='brute'){
    c.lineWidth=r*0.32;for(let i=0;i<2;i++){const lx=-r*0.35+i*r*0.7,sw=Math.sin(ph*3+i*3)*r*0.2;c.beginPath();c.moveTo(lx,-r*0.4);c.lineTo(lx+sw,r*0.1);c.stroke()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.8+bob,r*1.05,r*0.92,0,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.ellipse(-r*0.05,-r*0.85+bob,r*0.92,r*0.8,0,0,7);c.fill();
    c.fillStyle='#00000040';c.beginPath();c.ellipse(-r*0.3,-r*0.6+bob,r*0.5,r*0.35,0,0,7);c.fill();
    c.fillStyle='#d9cfb8';for(const s of [-1,1]){c.beginPath();c.moveTo(r*0.35+s*r*0.2,-r*1.45+bob);c.quadraticCurveTo(r*0.6+s*r*0.5,-r*2.0,r*0.85+s*r*0.45,-r*1.75+bob);c.lineTo(r*0.45+s*r*0.2,-r*1.35+bob);c.fill()}
    c.strokeStyle=dark;c.lineWidth=r*0.28;c.beginPath();c.moveTo(r*0.6,-r*0.9+bob);c.lineTo(r*1.2+(rush?r*0.3:0),-r*0.3+Math.sin(ph*3)*r*0.2);c.stroke();
    e.eyes=[[r*0.6,-r*1.1,r*0.13],[r*0.85,-r*1.05,r*0.11]];
  }else if(e.k==='spitter'){
    c.lineWidth=r*0.2;for(let i=0;i<4;i++){const lx=-r*0.6+i*r*0.4,sw=Math.sin(ph*4+i*1.7)*r*0.3;c.beginPath();c.moveTo(lx,-r*0.3);c.lineTo(lx+sw,r*0.1);c.stroke()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.55+bob,r*1.05,r*0.68,0,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.ellipse(0,-r*0.6+bob,r*0.92,r*0.56,0,0,7);c.fill();
    c.fillStyle=dark;c.beginPath();c.ellipse(-r*0.35,-r*1.05+bob,r*0.62,r*0.55,0,0,7);c.fill();
    c.globalAlpha*=0.7+0.3*Math.sin(T*5+ph);c.fillStyle='#8cff3a';c.beginPath();c.ellipse(-r*0.35,-r*1.08+bob,r*0.5,r*0.44,0,0,7);c.fill();c.globalAlpha=hidden?0.2:1;
    c.strokeStyle=col;c.lineWidth=r*0.22;c.beginPath();c.moveTo(r*0.7,-r*0.65+bob);c.lineTo(r*1.25,-r*0.85+bob);c.stroke();
    e.eyes=[[r*0.45,-r*0.72,r*0.14],[r*0.72,-r*0.66,r*0.11]];
  }else if(e.k==='bloater'){
    c.lineWidth=r*0.18;for(let i=0;i<3;i++){const lx=-r*0.5+i*r*0.5,sw=Math.sin(ph*4+i*2)*r*0.25;c.beginPath();c.moveTo(lx,-r*0.3);c.lineTo(lx+sw,r*0.1);c.stroke()}
    const sw2=1+0.06*Math.sin(T*8+ph);c.fillStyle=dark;c.beginPath();c.arc(0,-r*0.95+bob,r*1.08*sw2,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.arc(0,-r*0.98+bob,r*0.95*sw2,0,7);c.fill();
    c.fillStyle='#e8d24a';for(const [px,py,ps] of [[-0.4,-1.3,.2],[0.2,-1.5,.16],[-0.1,-0.7,.18],[0.45,-1.0,.14],[-0.6,-0.9,.13]]){c.beginPath();c.arc(r*px,r*py+bob,r*ps*(1+0.2*Math.sin(T*6+px*9)),0,7);c.fill()}
    e.eyes=[[r*0.55,-r*1.05,r*0.12],[r*0.78,-r*0.95,r*0.1]];
  }else if(e.k==='wisp'){
    const fl=Math.sin(T*22+ph)*0.9;c.fillStyle='#2a2a48';
    for(const s of [-1,1]){c.beginPath();c.moveTo(-r*0.2,-r*0.5);c.lineTo(-r*0.9,-r*0.5+s*r*1.3*fl);c.lineTo(r*0.4,-r*0.45);c.fill()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.5,r*1.0,r*0.55,0,0,7);c.fill();c.fillStyle=col;c.beginPath();c.ellipse(0,-r*0.52,r*0.85,r*0.42,0,0,7);c.fill();
    c.strokeStyle=col;c.lineWidth=r*0.18;c.beginPath();c.moveTo(-r*0.8,-r*0.5);c.lineTo(-r*1.6,-r*0.3+Math.sin(T*8+ph)*r*0.3);c.stroke();
    e.eyes=[[r*0.55,-r*0.55,r*0.17]];
  }else if(e.k==='phantom'){
    c.fillStyle=dark;c.beginPath();c.moveTo(-r*0.9,r*0.1);c.quadraticCurveTo(-r*0.6,-r*1.2,0,-r*1.9+bob);c.quadraticCurveTo(r*0.7,-r*1.2,r*0.9,r*0.1);
    for(let i=0;i<4;i++)c.lineTo(r*0.9-(i+0.5)*r*0.45,-r*0.1+(i%2)*r*0.25+Math.sin(T*5+i)*r*0.08);c.closePath();c.fill();
    c.fillStyle=col;c.beginPath();c.moveTo(-r*0.7,0);c.quadraticCurveTo(-r*0.45,-r*1.1,0,-r*1.75+bob);c.quadraticCurveTo(r*0.55,-r*1.1,r*0.7,0);c.closePath();c.fill();
    c.strokeStyle='#8a8ab0';c.lineWidth=r*0.12;c.beginPath();c.moveTo(r*0.5,-r*0.9);c.quadraticCurveTo(r*1.4,-r*1.4,r*1.5,-r*0.5+Math.sin(ph*3)*r*0.2);c.stroke();
    e.eyes=[[r*0.25,-r*1.5,r*0.12],[r*0.5,-r*1.45,r*0.1]];
  }else if(e.k==='splitter'){
    c.lineWidth=r*0.18;for(let i=0;i<4;i++){const lx=-r*0.7+i*r*0.46,sw=Math.sin(ph*4+i*1.4)*r*0.3;c.beginPath();c.moveTo(lx,-r*0.3);c.lineTo(lx+sw,r*0.1);c.stroke()}
    for(const s of [-1,1]){c.fillStyle=dark;c.beginPath();c.ellipse(s*r*0.45,-r*0.7+bob,r*0.72,r*0.66,0,0,7);c.fill();c.fillStyle=col;c.beginPath();c.ellipse(s*r*0.45,-r*0.74+bob,r*0.6,r*0.55,0,0,7);c.fill()}
    c.strokeStyle='#ff7ab0';c.lineWidth=r*0.08;c.beginPath();c.moveTo(0,-r*1.3+bob);c.lineTo(r*0.08,-r*0.9+bob);c.lineTo(-r*0.06,-r*0.55+bob);c.lineTo(0,-r*0.2+bob);c.stroke();
    e.eyes=[[r*0.8,-r*0.8,r*0.13],[r*0.98,-r*0.72,r*0.1],[-r*0.2,-r*0.9,r*0.1]];
  }else{
    c.lineWidth=r*0.16;for(let i=0;i<8;i++){const a=-Math.PI+i*Math.PI/7,len=r*1.4;c.strokeStyle=i%2?dark:'#4a2240';c.beginPath();c.moveTo(Math.cos(a)*r*0.6,-r*0.6+Math.sin(a)*r*0.3);
      c.quadraticCurveTo(Math.cos(a)*len,-r*0.3+Math.sin(ph*2+i)*r*0.4,Math.cos(a)*len*1.15,r*0.1+Math.sin(ph*2.5+i)*r*0.3);c.stroke()}
    c.fillStyle=dark;c.beginPath();c.ellipse(0,-r*0.9+bob,r*1.15,r*0.95,0,0,7);c.fill();
    c.fillStyle=col;c.beginPath();c.ellipse(0,-r*0.95+bob,r*1.02,r*0.82,0,0,7);c.fill();
    c.fillStyle='#120610';c.beginPath();c.ellipse(r*0.35,-r*0.55+bob,r*0.45,r*(0.12+0.1*Math.abs(Math.sin(ph))),0,0,7);c.fill();
    c.fillStyle='#e8dcc0';for(let i=0;i<5;i++)c.fillRect(r*0.05+i*r*0.13,-r*0.62+bob,r*0.05,r*0.1);
    e.eyes=[[r*0.1,-r*1.3,r*0.1],[r*0.35,-r*1.4,r*0.12],[r*0.6,-r*1.3,r*0.1],[r*0.25,-r*1.15,r*0.08],[r*0.5,-r*1.12,r*0.08]];
    if(e.bk===2){c.fillStyle='#7dffb0';for(const [px,py] of [[-0.6,-1.5],[-0.2,-1.7],[-0.85,-1.1],[0.15,-1.55]]){c.globalAlpha=(hidden?0.2:1)*(0.6+0.4*Math.sin(T*4+px*7));c.beginPath();c.arc(r*px,r*py+bob,r*0.16,0,7);c.fill()}c.globalAlpha=hidden?0.2:1}
    if(e.bk===3){c.fillStyle=e.armor<1?'#6d6f78':'#3a3c44';for(let i=0;i<4;i++){c.save();c.translate(-r*0.75+i*r*0.42,-r*1.55+bob+Math.abs(i-1.5)*r*0.12);c.rotate(-0.3+i*0.2);c.fillRect(-r*0.2,-r*0.12,r*0.4,r*0.3);c.restore()}
      if(e.mode==='wind'){c.fillStyle=`rgba(255,40,40,${0.3+0.3*Math.sin(T*30)})`;c.beginPath();c.ellipse(0,-r*0.9,r*1.3,r*1.1,0,0,7);c.fill()}
      if(e.mode==='stun'){c.fillStyle='#ffe14d';for(let i=0;i<3;i++){const a=T*4+i*2.1;c.fillRect(Math.cos(a)*r*0.6-2,-r*2.1+Math.sin(a)*r*0.2,4,4)}}}
    if(e.bk===4){c.fillStyle='#c79bff';for(let i=0;i<5;i++){const sx=-r*0.5+i*r*0.28;c.beginPath();c.moveTo(sx-r*0.08,-r*1.7+bob);c.lineTo(sx,-r*(2.1+(i%2)*0.25)+bob);c.lineTo(sx+r*0.08,-r*1.7+bob);c.fill()}}
    if(e.bk===5){e.eyes=e.eyes.concat([[-r*0.3,-r*1.35,r*0.09],[-r*0.55,-r*1.2,r*0.08],[r*0.75,-r*1.15,r*0.08],[-r*0.1,-r*1.55,r*0.1]]);
      c.strokeStyle=`rgba(255,40,60,${0.3+0.2*Math.sin(T*3)})`;c.lineWidth=3;c.beginPath();c.ellipse(0,-r*0.9,r*1.45,r*1.2,0,0,7);c.stroke()}
  }
  if(e.frz>0){c.fillStyle='#bff0ffa0';c.beginPath();c.ellipse(0,-r*0.6,r*1.2,r*0.9,0,0,7);c.fill()}else if(e.slow>0){c.fillStyle='#5cd0ff40';c.beginPath();c.ellipse(0,-r*0.6,r*1.1,r*0.8,0,0,7);c.fill()}
  c.restore();e._bob=bob;
}
function drawEyes(e,T){
  if(!e.eyes)return;const hid=!!(R&&isHidden(e));if(hid&&e.k==='boss')return;const ea=hid?0.35:1,rush=e.state==='rush',col=rush?'#ff2a3a':'#d8ff7a',blink=!rush&&Math.sin(T*0.9+e.ph*3)>0.97;
  if(blink)return;
  const lean=rush&&e.alertT<=0&&!e.spr?0.18:0,cs=Math.cos(lean),sn=Math.sin(lean);
  for(const [dx,dy,s] of e.eyes){const lx=dx*cs-(dy+(e._bob||0))*sn,ly=dx*sn+(dy+(e._bob||0))*cs;const x=e.x+lx*e.face,y=e.y*K+ly-(e.zOff||0);
    ctx.globalAlpha=(rush?0.5:0.3)*ea;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,s*(rush?4:3),0,7);ctx.fill();ctx.globalAlpha=ea;ctx.fillRect(x-s,y-s*0.7,s*2,s*1.4)}
}
function drawFx(f){
  const a=Math.max(0,f.t/f.T);ctx.globalAlpha=a;
  if(f.type==='beam'){ctx.strokeStyle=f.c;ctx.lineCap='round';ctx.lineWidth=f.w*2.4*a;ctx.globalAlpha=a*0.35;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();
    ctx.globalAlpha=a;ctx.lineWidth=f.w*0.6;ctx.strokeStyle='#fff6d8';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();glowDot(f.x2,f.y2,f.w*4,f.c,a)}
  else if(f.type==='zap'){ctx.strokeStyle=f.c;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(f.x,f.y);const n=4;for(let i=1;i<n;i++){ctx.lineTo(f.x+(f.x2-f.x)*i/n+rnd(-9,9),f.y+(f.y2-f.y)*i/n+rnd(-9,9))}ctx.lineTo(f.x2,f.y2);ctx.stroke()}
  else if(f.type==='ring'){const k=1-a;ctx.strokeStyle=f.c;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r0+(f.r1-f.r0)*k,(f.r0+(f.r1-f.r0)*k)*K,0,0,7);ctx.stroke()}
  else if(f.type==='boom'){const k=1-a;ctx.fillStyle=f.c;ctx.globalAlpha=a*0.35;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*(0.4+k*0.8),f.r*(0.4+k*0.8)*K,0,0,7);ctx.fill();ctx.globalAlpha=a;ctx.strokeStyle='#fff3c0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*(0.3+k),f.r*(0.3+k)*K,0,0,7);ctx.stroke()}
  else if(f.type==='spark'){glowDot(f.x,f.y,10,f.c,a)}
  ctx.globalAlpha=1;
}

function drawDrone(h,T){
  const c=ctx,X=h.dx,Y=h.dy*K-30+Math.sin(T*5+h.t.id)*2,col=TYPES[h.t.ty].c,rc=RAR[h.r].c;
  if(SPR.has('drone_'+h.t.ty)){drawSpr(c,'drone_'+h.t.ty,0,X,Y,false);if(h.fl>0){c.fillStyle='#fff';c.fillRect(X-1.5,Y-1.5,3,3)}return}
  c.strokeStyle='#000';c.lineWidth=2;
  for(const s of [-1,1]){c.beginPath();c.moveTo(X,Y);c.lineTo(X+s*10,Y-3);c.stroke();c.fillStyle='#9aa4b2';c.fillRect(X+s*10-4,Y-4.5,8,1.5+Math.abs(Math.sin(T*40))*1.5)}
  c.fillStyle='#000';c.beginPath();c.moveTo(X,Y-7);c.lineTo(X+7,Y);c.lineTo(X,Y+6);c.lineTo(X-7,Y);c.closePath();c.fill();
  c.fillStyle='#4a5162';c.beginPath();c.moveTo(X,Y-5);c.lineTo(X+5,Y);c.lineTo(X,Y+4);c.lineTo(X-5,Y);c.closePath();c.fill();
  c.fillStyle=h.fl>0?'#fff':col;c.fillRect(X-1.5,Y-1.5,3,3);c.strokeStyle=rc;c.lineWidth=1;c.strokeRect(X-3,Y-3,6,6);
}

function drawCannon(c){
  if(SPR.has('cannon')&&SPR.data.sprites.cannon[0].px){
    const a=R?R.shipAim:(CUT?CUT.aim:-Math.PI/2),left=Math.cos(a)<0,rec=(R&&R.shipFl>0)||(CUT&&CUT.fl>0)?2.5:0;
    const tilt=Math.max(-0.45,Math.min(0.45,left?Math.atan2(Math.sin(a),-Math.cos(a)):a));
    c.save();c.translate(-Math.cos(a)*rec,-52-Math.sin(a)*rec*K);c.rotate(left?-tilt:tilt);drawSpr(c,'cannon',0,0,8,left);c.restore();return}
  c.fillStyle='#000';c.fillRect(-11,-46,22,14);c.fillStyle='#2e3340';c.fillRect(-9,-44,18,11);
  const a=R?R.shipAim:(CUT?CUT.aim:-Math.PI/2),rec=(R&&R.shipFl>0)||(CUT&&CUT.fl>0)?4:0;
  c.save();c.translate(0,-44);c.rotate(a);c.fillStyle='#000';c.fillRect(-2-rec,-4,24,8);c.fillStyle='#9aa4b2';c.fillRect(-rec,-2.5,20,5);c.fillStyle='#ffb03a';c.fillRect(17-rec,-2.5,3,5);c.restore();
  c.fillStyle='#000';c.beginPath();c.arc(0,-44,8.5,0,7);c.fill();c.fillStyle='#596274';c.beginPath();c.arc(0,-44,7,0,7);c.fill();c.fillStyle='#7c879b';c.fillRect(-3,-48,4,3);
}
