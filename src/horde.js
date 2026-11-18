"use strict";
// ===== THE HORDE (atmosphere + surges) =====
// Hundreds of cheap, non-simulated creatures fill the darkness outside the ring: silhouettes with
// glowing eyes that grow in number every threat level, flinch back from the light, turn red when the
// ring pulses and blink at you. From threat 3, some wave changes trigger a SURGE: the horde in one
// sector crowds the ring edge (telegraph: rumble, red eyes, edge arrow) and part of it charges for real.
const HORDE_EYE=['#ff3a2a','#ff3a2a','#ff3a2a','#ffb03a','#ff6a3a','#d8ff7a'];
function viewHalf(){return [W/(2*S),H/(2*S*K)]}
function hordeMember(rr,edge){const [hx,hy]=viewHalf();
  const P=R.hpacks||(R.hpacks=Array.from({length:14},()=>{const a=Math.random()*6.283,d=rnd(1.35,2.6);return{x:Math.cos(a)*rr*d,y:Math.sin(a)*rr*d,s:rnd(25,60)}}));
  for(let k=0;k<30;k++){let x,y;
    if(edge){const s=Math.random()*4|0;x=s<2?(s?1:-1)*hx*rnd(0.9,1.1):rnd(-hx,hx);y=s>=2?(s===2?1:-1)*hy*rnd(0.9,1.1):rnd(-hy,hy)}
    else if(Math.random()<0.75){const p=P[Math.random()*P.length|0],g=()=>(Math.random()+Math.random()+Math.random()-1.5)*p.s;x=p.x+g();y=p.y+g()*0.8}
    else{x=rnd(-hx*1.05,hx*1.05);y=rnd(-hy*1.1,hy*1.1)}
    const d=Math.hypot(x,y);if(d<rr*1.25)continue;
    const big=Math.random()<0.06;return{x,y,r:big?rnd(14,19):rnd(5,11),ph:Math.random()*6,hd:Math.random()*6.28,spd:rnd(2,7),
      eye:HORDE_EYE[Math.random()*HORDE_EYE.length|0],bl:Math.random()*20,look:0,fade:edge?0:Math.random(),sg:0,hump:Math.random()<.5}}
  return null}
function hordeTarget(){return Math.min(420,80+18*R.wave+35*(R.ch-1)+(R.endless?60:0)+(R.night?60:0))}
function hordeTick(dt,rr){
  if(!R.horde){R.horde=[];for(let i=0;i<hordeTarget()*0.8;i++){const m=hordeMember(rr,false);if(m)R.horde.push(m)}R.growlT=rnd(4,8)}
  const H_=R.horde;if(H_.length<hordeTarget()&&Math.random()<dt*6){const m=hordeMember(rr,true);if(m)H_.push(m)}
  const sg=R.surge,pulse=R.ringPulse||0,od=R.react===2;
  for(const m of H_){
    m.ph+=dt*(m.spd*0.3+0.6);m.fade=Math.min(1,m.fade+dt*0.5);m.bl-=dt;if(m.bl<0)m.bl=rnd(4,22);
    const d=Math.hypot(m.x,m.y)||1;let tx=Math.cos(m.hd)*m.spd,ty=Math.sin(m.hd)*m.spd;
    if(Math.random()<dt*0.3)m.hd+=rnd(-1.2,1.2);
    if(!m.pk&&R.hpacks){let b=null,bd=1e9;for(const p of R.hpacks){const q=(p.x-m.x)**2+(p.y-m.y)**2;if(q<bd){bd=q;b=p}}m.pk=b}
    if(m.pk){const px=m.pk.x-m.x,py=m.pk.y-m.y,pd=Math.hypot(px,py);if(pd>m.pk.s*1.4){tx+=px/pd*4;ty+=py/pd*4}}
    let minD=rr*1.24;
    if(sg&&sg.ph===1&&Math.abs(((Math.atan2(m.y,m.x)-sg.a+9.42)%6.283)-3.14)<sg.w){m.sg=1;minD=rr*1.12;tx+=-m.x/d*38;ty+=-m.y/d*38}else m.sg=Math.max(0,m.sg-dt*0.6);
    if(d<minD){tx+=m.x/d*60;ty+=m.y/d*60} // flinch away from the light
    m.x+=tx*dt;m.y+=ty*dt;
    m.look=Math.max(m.look-dt*0.5,Math.max(pulse*0.9,od?0.55:0,m.sg));
  }
  // ambient growls
  R.growlT-=dt;if(R.growlT<=0){R.growlT=rnd(7,14);sfx('growl');for(let i=0;i<14;i++){const m=H_[Math.random()*H_.length|0];if(m){m.bl=rnd(4,22);m.look=Math.max(m.look,0.7)}}}
  // surges
  if(sg){sg.t+=dt;
    if(sg.ph===1&&sg.t>2.6){sg.ph=2;const k=sg.n;let made=0;
      const pool=H_.filter(m=>m.sg>0.5).sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));
      for(let i=0;i<k;i++){const src=pool[i],a=src?Math.atan2(src.y,src.x):sg.a+rnd(-sg.w,sg.w),e=spawn(pickKind(),'rush');e.x=Math.cos(a)*rr*1.18;e.y=Math.sin(a)*rr*1.18;e.alertT=0.25+i*0.05;made++;if(src)src.gone=1}
      R.horde=H_.filter(m=>!m.gone);R.shake=Math.max(R.shake,7);sfx('roar');R.ringPulse=1}
    if(sg.t>4.5)R.surge=null}
}
function hordeWave(){ // called when the threat level rises
  if(R.wave<3||R.surge||(R.boss&&!R.boss.dead))return;
  if(Math.random()>(R.wave%3===0?1:0.35))return;
  const a=Math.random()*6.283,n=Math.round(Math.min(16,3+R.wave*0.7+(R.ch-1)*0.6));
  R.surge={a,w:0.55,t:0,ph:1,n};sfx('rumble');R.shake=Math.max(R.shake,4);
  R.banner={s:'⚠ THE HORDE SURGES ⚠',sub:'From the '+dirName(a),t:2.4};
  if(!meta.tut.surge&&typeof tip==='function')setTimeout(()=>tip('surge','The <b>horde</b> out in the dark is massing on one side. A <b>surge</b> is coming — get ready (spells, reactor LOW, Guardian).',false,6),200);
}
function dirName(a){const n=['EAST','SOUTH-EAST','SOUTH','SOUTH-WEST','WEST','NORTH-WEST','NORTH','NORTH-EAST'];return n[Math.round(((a+6.283)%6.283)/(Math.PI/4))%8]}
// silhouettes: drawn after the darkness pass so they read as shapes against the black
function drawHorde(T,rr){
  if(!R||!R.horde)return;const c=ctx;
  for(const m of R.horde){const X=m.x,Y=m.y*K,r=m.r,bob=Math.sin(m.ph*2)*r*0.06,d=Math.hypot(m.x,m.y),near=Math.max(0,1-(d-rr*1.15)/(rr*0.9));
    const a=(0.55+0.35*near)*m.fade;c.globalAlpha=a;c.fillStyle='#07050a';
    c.beginPath();c.ellipse(X,Y-r*0.55+bob,r*1.05,r*0.62,0,0,7);c.fill();
    if(m.hump){c.beginPath();c.moveTo(X-r*0.6,Y-r*0.9+bob);c.lineTo(X-r*0.2,Y-r*1.55+bob);c.lineTo(X+r*0.1,Y-r*0.95+bob);c.lineTo(X+r*0.4,Y-r*1.4+bob);c.lineTo(X+r*0.7,Y-r*0.8+bob);c.fill()}
    for(let l=0;l<3;l++){const lx=X+(l-1)*r*0.6,st=Math.sin(m.ph*3+l*2)*r*0.12;c.fillRect(lx+st-0.8,Y-r*0.3,1.6,r*0.3)}
    c.globalAlpha=a*(0.35+0.6*near);c.strokeStyle='#6a4a7a';c.lineWidth=1;c.beginPath();c.ellipse(X,Y-r*0.55+bob,r*1.05,r*0.62,0,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  c.globalAlpha=1;
  const sg=R.surge;if(sg&&sg.ph===1){const p=Math.min(1,sg.t/0.4),rad=rr*0.98;for(let i=-1;i<=1;i++){const a=sg.a+i*0.18,x=Math.cos(a)*rad,y=Math.sin(a)*rad*K,s=10+4*Math.sin(T*12);
    c.save();c.translate(x,y);c.rotate(Math.atan2(-Math.sin(a)*K,-Math.cos(a)));c.globalAlpha=p*(0.6+0.4*Math.sin(T*12));c.fillStyle='#ff3a3a';c.beginPath();c.moveTo(s,0);c.lineTo(-s*0.6,s*0.7);c.lineTo(-s*0.2,0);c.lineTo(-s*0.6,-s*0.7);c.closePath();c.fill();c.restore()}c.globalAlpha=1}
}
// eyes: additive pass
function drawHordeEyes(T,rr){
  if(!R||!R.horde)return;const c=ctx;
  for(const m of R.horde){if(m.bl<0.15)continue;const X=m.x,Y=m.y*K-m.r*0.7+Math.sin(m.ph*2)*m.r*0.06,lk=m.look,col=lk>0.5?'#ff2a2a':m.eye,s=Math.max(0.8,m.r*0.13)*(1+lk*0.5),gap=m.r*0.32;
    const a=(0.35+0.65*lk)*m.fade*(0.7+0.3*Math.sin(T*2+m.ph));c.fillStyle=col;
    c.globalAlpha=a*0.22;c.beginPath();c.arc(X,Y,s*5,0,7);c.fill();
    c.globalAlpha=a;c.fillRect(X-gap-s,Y-s*0.6,s*2,s*1.2);c.fillRect(X+gap-s,Y-s*0.6,s*2,s*1.2)}
  c.globalAlpha=1;
}
