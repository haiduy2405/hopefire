"use strict";
// ===== v0.13 THREAT: new creatures, elites, wave events, Surge Cells, flawless waves, run rank =====
// Goal: every wave asks the player to *do* something (focus a priority target, tap a Surge Cell, react to a
// telegraph) instead of watching. Loaded after horde.js; hooks are called from game.js / render.js / react.js.
Object.assign(EK,{
  charger:{hp:60,spd:42,dmg:9,r:13,g:3,core:2,cell:.12,c:'#6a3a2a'},    // telegraphs, then rams the hull
  shellback:{hp:80,spd:30,dmg:7,r:13,g:3,core:2,cell:.1,c:'#4a5560'},   // 65% damage resist; burn ignores it
  hatcher:{hp:70,spd:26,dmg:0,r:14,g:4,core:3,cell:.2,c:'#3a5a4a'},     // keeps distance, births skitters: kill first
  screamer:{hp:36,spd:40,dmg:0,r:10,g:3,core:3,cell:.1,c:'#5a3a6a'},    // aura: nearby creatures run 40% faster
  lurker:{hp:34,spd:84,dmg:8,r:9,g:2,core:2,cell:.06,c:'#5a4a30'}       // erupts from the ground inside the ring
});
SPAWN_TABLE.push(['charger',9,6,1],['shellback',11,3,2],['hatcher',6,5,3],['screamer',7,4,4]);
const KIND_NAME={crawler:'CRAWLER',skitter:'SKITTER',brute:'BRUTE',spitter:'SPITTER',bloater:'BLOATER',wisp:'WISP',phantom:'PHANTOM',splitter:'SPLITTER',charger:'CHARGER',shellback:'SHELLBACK',hatcher:'HATCHER',screamer:'SCREAMER',lurker:'LURKER'};
const THREAT_TIPS={
  charger:'<b>Charger</b>: it stops, flashes red and <b>rams the ship</b>. Kill or freeze it during the wind-up.',
  shellback:'<b>Shellback</b>: armoured, takes only 35% damage. <b>Burn</b> ignores armour — Thermal modules melt it.',
  hatcher:'<b>Hatcher</b>: stays back and births skitters every few seconds. Focus it first — tap it to <b>mark</b>.',
  screamer:'<b>Screamer</b>: its scream makes nearby creatures run faster. Kill it for a <b>Surge Cell</b>.',
  lurker:'<b>Lurkers</b> burst out of the ground <i>inside</i> your ring. Watch for the cracks.'};
const PRIORITY_KIND={hatcher:1,screamer:1};

function threatInit(e){
  if(e.k==='shellback')e.armor=0.35;
  if(e.k==='charger'){e.cm='walk';e.cw=0}
  if(e.k==='hatcher')e.ai=rnd(1.5,3);
  if(!e.bk&&THREAT_TIPS[e.k]&&meta.tut.done1&&R&&!R.over)setTimeout(()=>tip('k_'+e.k,THREAT_TIPS[e.k],false,6),500);
}
// custom movement/attacks for the new kinds. Returns [vx,vy] when it handled the creature, else null.
function threatMove(e,dt,d,rr,slowM){
  const k=e.k;
  if(k==='charger'){
    if(e.cm==='stun'){e.cw-=dt;if(e.cw<=0)e.cm='walk';return [0,0]}
    if(e.cm==='wind'){e.cw-=dt;if(e.cw<=0){e.cm='dash';sfx('roar')}return [0,0]}
    if(e.cm==='dash'){
      if(d<30+e.r){damageHope(e.dmg*2.2,e);e.cm='stun';e.cw=1.6;R.shake=Math.max(R.shake,8);R.fx.push({type:'boom',x:e.x,y:e.y*K,r:30,t:.3,T:.3,c:'#ff7a3d'});return [0,0]}
      const sp=e.spd*8*slowM;return [-e.x/d*sp,-e.y/d*sp]}
    if(d<250&&!(e.frz>0)){e.cm='wind';e.cw=0.95;sfx('alert');addTxt(e.x,e.y*K-e.r*2.6,'!!','#ff3a3a',18);return [0,0]}
    const sp=e.spd*slowM;return [-e.x/d*sp,-e.y/d*sp];
  }
  if(k==='hatcher'||k==='screamer'){
    const hold=k==='hatcher'?195:165;
    if(d>hold){const sp=e.spd*slowM;return [-e.x/d*sp,-e.y/d*sp]}
    if(k==='hatcher'&&!(e.frz>0)){e.ai-=dt;if(e.ai<=0){e.ai=4.6;hatch(e)}}
    return [0,0];
  }
  return null;
}
function hatch(e){
  if(R.en.length>120)return;
  R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:6,r1:44,t:.4,T:.4,c:'#7dffb0'});sfx('alert');
  for(let i=0;i<2;i++){const m=spawn('skitter','rush');m.x=e.x+rnd(-14,14);m.y=e.y+rnd(-14,14);m.hp=m.mhp=m.mhp*0.7;m.alertT=0.3}
}
function threatUpdate(dt,rr){
  for(const o of R.en)if(o.rage>0)o.rage-=dt;
  for(const s of R.en){
    if(s.dead)continue;
    if(s.k==='screamer'&&s.state==='rush'){for(const o of R.en)if(o!==s&&!o.dead&&o.k!=='boss'&&Math.hypot(o.x-s.x,o.y-s.y)<150)o.rage=0.25}
    if(s.emerge>0){s.emerge-=dt;if(s.emerge<=0){R.fx.push({type:'ring',x:s.x,y:s.y*K,r0:4,r1:40,t:.35,T:.35,c:'#c9a46a'});R.shake=Math.max(R.shake,3);sfx('boom')}}
  }
  if(R.chargeT>0)R.chargeT-=dt;
  if(R.scells){
    const padOn=typeof PAD!=='undefined'&&PAD.vis;
    for(const c of R.scells){
      c.t+=dt;c.life-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=300*dt;if(c.vy>0&&c.y>c.gy){c.y=c.gy;c.vy=-c.vy*0.35;c.vx*=0.5}
      if(padOn&&c.t>2.2&&!c.got)collectCell(c);
    }
    R.scells=R.scells.filter(c=>c.life>0&&!c.got);
  }
}
// ---- Surge Cell: tap/click within ~6 s for 6 s of +60% fire rate ----
function dropCell(x,y){(R.scells||(R.scells=[])).push({x,y:y*K-8,gy:y*K-8,vx:rnd(-40,40),vy:-130,t:0,life:6.5,got:false});sfx('up')}
function collectCell(c){
  if(c.got)return;c.got=true;R.chargeT=Math.min(12,(R.chargeT||0)+6);sfx('up');flash(0.18);R.cellsGot=(R.cellsGot||0)+1;
  R.fx.push({type:'ring',x:0,y:-20,r0:10,r1:120,t:.5,T:.5,c:'#5cf0ff'});R.fx.push({type:'ring',x:0,y:-20,r0:6,r1:80,t:.35,T:.35,c:'#ffffff'});
  addTxt(0,-96,'OVERCHARGE','#5cf0ff',17);
}
function cellTap(ev){
  if(!R||!R.scells||!R.scells.length)return false;
  const wx=(ev.clientX-OX)/S,wy=(ev.clientY-OY)/S,rad=40/Math.max(S,0.6);
  for(const c of R.scells)if(!c.got&&Math.hypot(c.x-wx,c.y-wy)<rad){collectCell(c);return true}
  return false;
}
// ---- elites ----
function spawnElite(kind){
  if(!kind||kind==='carrier'||kind==='boss')kind=pickKind();
  const e=spawn(kind,'rush'),rr=ringR(),a=Math.random()*6.283;
  e.x=Math.cos(a)*rr*1.45;e.y=Math.sin(a)*rr*1.45;
  e.elite=1;e.hp*=3.5;e.mhp*=3.5;e.r*=1.25;e.g*=4;e.dmg*=1.3;e.alertT=0.7;
  R.banner={s:'◆ ELITE '+(KIND_NAME[kind]||'')+' ◆',sub:'From the '+dirName(a)+' — kill it for a Surge Cell',t:2.4};sfx('roar');R.shake=Math.max(R.shake,4);
  return e;
}
function eliteKill(e){
  R.elitesKilled=(R.elitesKilled||0)+1;dropCell(e.x,e.y);
  drop('core',e.x,e.y,EK[e.k].core*Math.pow(1.6,R.ch-1)*2);drop('cell',e.x,e.y,R.maxHope*0.1);
  addTxt(e.x,e.y*K-e.r*2.4,'ELITE SLAIN','#ffd24a',15);flash(0.12);
  for(let i=0;i<24;i++)R.pt.push({x:e.x,y:e.y*K-e.r*.6,vx:rnd(-200,200),vy:rnd(-240,20),t:rnd(.4,1),c:i%2?'#ffd24a':'#fff6c8',s:rnd(2,4),g:260,add:1});
}
function threatKill(e){
  if(e.elite)eliteKill(e);
  else if(e.k==='screamer'){dropCell(e.x,e.y);addTxt(e.x,e.y*K-e.r*2.4,'SILENCED','#c79bff',13)}
  else if(e.k==='hatcher')addTxt(e.x,e.y*K-e.r*2.4,'NEST DOWN','#7dffb0',13);
}
// ---- wave events: called every time the threat level rises ----
function threatWave(){
  // flawless bonus for the wave that just ended
  if(R.wave>=4&&!R.hurtW){
    R.flawless=(R.flawless||0)+1;R.flStreak=(R.flStreak||0)+1;
    const u=Math.pow(2.2,R.ch-1)*Math.pow(1.1,R.wave-1),amt=Math.round(10*u*(1+0.25*Math.min(R.flStreak,6)));
    drop('scrap',0,-30,amt);addTxt(0,-112,R.flStreak>1?'FLAWLESS ×'+R.flStreak:'FLAWLESS','#7dffb0',15);sfx('up');
  }else if(R.hurtW)R.flStreak=0;
  R.hurtW=0;
  if(R.wave<3||R.surge||(R.boss&&!R.boss.dead)||(!R.endless&&R.wave>=BOSS_WAVE))return;
  if(Math.random()<0.35)return; // a breather
  const w=R.wave,opts=[['rush',3]];
  if(w>=4)opts.push(['elite',3]);
  if(w>=5)opts.push(['ambush',2]);
  if(w>=5&&R.ch>=2)opts.push(['siege',2]);
  let tot=0;for(const o of opts)tot+=o[1];let x=Math.random()*tot,ev=opts[0][0];for(const o of opts){if((x-=o[1])<0){ev=o[0];break}}
  const rr=ringR(),a=Math.random()*6.283;
  if(ev==='elite')spawnElite();
  else if(ev==='rush'){
    const n=Math.min(18,5+w+Math.round(R.ch*1.5));R.banner={s:'⚠ SWARM RUSH ⚠',sub:'From the '+dirName(a),t:2.2};sfx('rumble');
    for(let i=0;i<n;i++){const e=spawn(i%4===0?'crawler':'skitter','rush'),b=a+rnd(-0.55,0.55);e.x=Math.cos(b)*rr*1.4;e.y=Math.sin(b)*rr*1.4;e.alertT=0.3+i*0.04}
  }else if(ev==='ambush'){
    const n=Math.min(7,2+Math.floor(w/4)+(R.ch>2?1:0));R.banner={s:'⚠ AMBUSH ⚠',sub:'Something is under the ground',t:2.2};sfx('rumble');
    for(let i=0;i<n;i++){const e=spawn('lurker','rush'),b=Math.random()*6.283,d=rr*rnd(0.45,0.78);e.x=Math.cos(b)*d;e.y=Math.sin(b)*d;e.alertT=e.emerge=1.1+i*0.15;
      R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:4,r1:26,t:.5,T:.5,c:'#c9a46a'})}
    if(!meta.tut.k_lurker&&meta.tut.done1)setTimeout(()=>tip('k_lurker',THREAT_TIPS.lurker,false,6),500);
  }else if(ev==='siege'){
    R.banner={s:'⚠ SIEGE ⚠',sub:'Ranged creatures take position — '+dirName(a),t:2.4};sfx('rumble');
    const ks=['spitter','spitter'];if(R.ch>=2&&w>=6)ks.push('spitter');if(R.ch>=3)ks.push('hatcher');if(R.ch>=4)ks.push('screamer');
    ks.forEach((k,i)=>{const e=spawn(k,'rush'),b=a+(i-ks.length/2)*0.3;e.x=Math.cos(b)*rr*1.4;e.y=Math.sin(b)*rr*1.4;e.alertT=0.4+i*0.15});
  }
}
// ---- end-of-run rank ----
function runRank(r){
  let p=0;const mh=r.minHopeP;p+=mh>=0.5?2:mh>=0.25?1:0;
  const fw=r.flawless||0,nw=BOSS_WAVE-3;p+=fw>=nw*0.5?2:fw>=nw*0.25?1:0;
  p+=(r.elitesKilled||0)>=3?1:0;
  return p>=5?'S':p>=4?'A':p>=2?'B':'C';
}
const RANK_BONUS={S:0.5,A:0.25,B:0.1,C:0};
// ---- drawing ----
function drawThreatOverlay(e,T){
  if(!R||e.dead)return;const c=ctx,X=e.x,Y=e.y*K,r=e.r,fz=e.fly?22:0;
  if(e.emerge>0){const p=1-e.emerge/Math.max(0.01,e.alertT0||1.2);c.save();c.globalAlpha=0.5+0.3*Math.sin(T*18);c.strokeStyle='#c9a46a';c.lineWidth=2;
    c.beginPath();c.ellipse(X,Y,14+4*Math.sin(T*20),6,0,0,7);c.stroke();c.fillStyle='#ff9a3a';c.font='bold 14px monospace';c.textAlign='center';c.fillText('!',X,Y-14);c.restore();return}
  if(isHidden(e))return;
  if(e.elite){
    c.save();c.globalAlpha=0.55+0.25*Math.sin(T*5);c.strokeStyle='#ffd24a';c.lineWidth=2;c.beginPath();c.ellipse(X,Y,r*1.5,r*0.6,0,0,7);c.stroke();c.restore();
    glowDot(X,Y-r*0.8-fz,r*2.2,'#ffd24a',0.16+0.06*Math.sin(T*5));
    const cy=Y-r*2.7-fz+Math.sin(T*3)*1.5;c.save();c.fillStyle='#ffd24a';c.strokeStyle='#5a3a00';c.lineWidth=1.5;c.beginPath();
    c.moveTo(X-8,cy+5);c.lineTo(X-8,cy-3);c.lineTo(X-4,cy+1);c.lineTo(X,cy-6);c.lineTo(X+4,cy+1);c.lineTo(X+8,cy-3);c.lineTo(X+8,cy+5);c.closePath();c.fill();c.stroke();c.restore();
  }else if(PRIORITY_KIND[e.k]&&e.state==='rush'){
    const my=Y-r*2.6-fz+Math.sin(T*6)*2;c.save();c.globalAlpha=0.9;c.fillStyle='#ff4d5e';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(X-6,my-6);c.lineTo(X+6,my-6);c.lineTo(X,my+4);c.closePath();c.fill();c.stroke();c.restore();
  }
  if(e.k==='screamer'&&e.state==='rush'){c.save();c.globalAlpha=0.18+0.1*Math.sin(T*4);c.strokeStyle='#c79bff';c.lineWidth=2;c.setLineDash([6,6]);c.beginPath();c.ellipse(X,Y,150,150*K,0,0,7);c.stroke();c.restore()}
  if(e.k==='charger'&&e.cm==='wind'){c.save();c.globalAlpha=0.5+0.4*Math.sin(T*28);c.strokeStyle='#ff3a3a';c.lineWidth=3;c.setLineDash([10,8]);c.beginPath();c.moveTo(X,Y-r*0.6);c.lineTo(0,-20);c.stroke();c.restore()}
  if(e.rage>0&&e.k!=='screamer'){c.save();c.globalAlpha=0.8;c.fillStyle='#c79bff';c.fillRect(X-1.5,Y-r*2.1-fz,3,5);c.restore()}
}
function drawThreatLayer(T){
  if(!R)return;const c=ctx;
  if(R.chargeT>0){const a=Math.min(1,R.chargeT),p=Math.min(1,R.chargeT/6);c.save();c.globalAlpha=a*(0.45+0.2*Math.sin(T*10));c.strokeStyle='#5cf0ff';c.lineWidth=3;
    c.beginPath();c.ellipse(0,-20,70,70*K,0,-Math.PI/2,-Math.PI/2+p*6.283);c.stroke();c.restore();glowDot(0,-26,60,'#5cf0ff',0.12*a)}
  if(R.scells)for(const s of R.scells){
    const f=s.life<1.5?(Math.sin(T*24)>0?1:0.35):1,bob=Math.sin(T*6+s.t*3)*2;
    glowDot(s.x,s.y+bob,22,'#5cf0ff',0.5*f);
    c.save();c.globalAlpha=f;c.translate(s.x,s.y+bob);c.rotate(T*2);c.fillStyle='#e8ffff';c.strokeStyle='#17a8c0';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(7,0);c.lineTo(0,9);c.lineTo(-7,0);c.closePath();c.fill();c.stroke();c.restore();
    c.save();c.globalAlpha=0.7*f;c.strokeStyle='#5cf0ff';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y+bob,15,-Math.PI/2,-Math.PI/2+Math.max(0,s.life/6.5)*6.283);c.stroke();c.restore();
  }
}
