"use strict";
// ===== CREW & CARRIERS =====
// Crew: survivors pulled from crates. They walk inside the ring and fight (max 3, ★ via duplicates).
// Every crew member has an element: their hits apply statuses and trigger reactions (src/react.js).
// Carriers: skittish creatures hauling salvage along the ring edge. They never charge the ship and
// try to escape — MARK one (tap) so modules focus it; kill it for a FREE crate. Any marked kill = BOUNTY.
const CREW={
  guardian:{n:'Guardian',c:'#8fb4ff',hp:150,dmg:12,rate:0.9,rng:24,spd:75,
    d:'Holds the line near the hull. Creatures close to him attack <b>him</b> instead of the ship. Cleaves all in reach.'},
  hunter:{n:'Hunter',c:'#ff9a5a',hp:70,dmg:20,rate:1.3,rng:22,spd:140,
    d:'Sprints out to kill. Chases your <b>MARKED</b> target first, then carriers and fast creatures. Pounces for 2× damage.'},
  medic:{n:'Medic',c:'#7dffb0',hp:60,dmg:6,rate:1.2,rng:150,spd:80,
    d:'Repairs <b>Hope</b> over time and patches up the crew. Weak blaster.'},
  engineer:{n:'Engineer',c:'#ffd24a',hp:80,dmg:7,rate:1.4,rng:160,spd:85,
    d:'Tunes the module he stands next to: <b>much faster fire rate</b>. Rotates between modules.'}
};
const CREW_IDS=Object.keys(CREW),CREW_MAX=3,CREW_RESPAWN=8;
const crewM=c=>RAR[c.r].m*(1+0.6*(c.s-1));
function crewDmg(c){return CREW[c.role].dmg*crewM(c)*tierM(R.ch)*(1+0.15*lv('dmg'))*REACT[R.react].dmg*(hasRel('glass')?1.5:1)}
function crewMhp(c,wave){return CREW[c.role].hp*Math.sqrt(RAR[c.r].m)*(1+0.5*(c.s-1))*CH_DMG[R.ch-1]*(R.night?NM.dmg[R.ch-1]:1)*(1+0.25*lv('hp'))*Math.pow(1.08,Math.min(wave||R.wave,30)-1)}
const medHeal=c=>0.0025*(1+0.5*c.r)*(1+0.5*(c.s-1)); // fraction of max Hope per second
const engBoost=c=>0.3+0.1*c.r+0.12*(c.s-1);
function crewStat(role,r,s,ty){const c={role,r,s,ty};
  if(role==='guardian')return `${fmt(crewDmg(c))} dmg cleave · ${fmt(crewMhp(c))} HP · taunts`;
  if(role==='hunter')return `${fmt(crewDmg(c))} dmg · ${(CREW.hunter.rate).toFixed(1)}/s · ${fmt(crewMhp(c))} HP`;
  if(role==='medic')return `+${(medHeal(c)*100).toFixed(2)}% Hope/s · heals crew`;
  return `+${Math.round(engBoost(c)*100)}% fire rate to one module`}
function crewChance(){if(!R.mods||R.mods.length<2||!meta.tut.mod)return 0;return R.crew.length<CREW_MAX?0.2:0.1}
function rollCrewCard(){const ids=R.crew.length<CREW_MAX?CREW_IDS:R.crew.map(c=>c.role);const tys=Object.keys(TYPES);
  const role=ids[Math.random()*ids.length|0],ex=R.crew.find(c=>c.role===role);return{cr:role,ty:ex?ex.ty:tys[Math.random()*tys.length|0],r:rollR()}}
const crewPow=c=>crewM(c)*(c.role==='hunter'?1.2:1);
function addCrew(cd){
  const ex=R.crew.find(c=>c.role===cd.cr);
  if(ex){ex.s++;ex.r=Math.max(ex.r,cd.r);ex.mhp=crewMhp(ex);ex.hp=ex.mhp;ex.down=0;ex.pop=0.6;
    R.txt.push({x:ex.x,y:ex.y*K-34,v:'★'+(ex.s-1)+' → ★'+ex.s,c:'#ffd24a',t:1.1,s:18});sfx('starup');
    R.fx.push({type:'ring',x:ex.x,y:ex.y*K,r0:4,r1:50,t:0.5,T:0.5,c:'#ffd24a'});return}
  const c={role:cd.cr,ty:cd.ty,r:cd.r,s:1,x:-18,y:12,cd:0.6,face:1,ph:0,down:0,hit:0,atk:0,drop:0.5,id:R.t+Math.random(),tend:0,tendT:0};
  c.mhp=c.hp=crewMhp(c);
  if(R.crew.length>=CREW_MAX){let wi=0;R.crew.forEach((x,j)=>{if(crewPow(x)<crewPow(R.crew[wi]))wi=j});R.crew[wi]=c}else R.crew.push(c);
  sfx('place');sfx('crew');R.txt.push({x:c.x,y:c.y*K-36,v:(cd.ty+' '+CREW[cd.cr].n).toUpperCase()+' JOINS',c:TYPES[cd.ty].c,t:1.4,s:13});
  for(let k=0;k<16;k++)R.pt.push({x:c.x,y:c.y*K-8,vx:rnd(-90,90),vy:rnd(-150,-30),t:rnd(.3,.6),c:TYPES[cd.ty].c,s:3,g:300,add:1});
  if(!meta.tut.crew)setTimeout(()=>tip('crew',`<b>Crew member!</b> Crew walk inside the ring and fight. Their element triggers <b>reactions</b> too. Max 3 — get the same role again for <b>★</b>.`,false,8),300);
}
const nearC=(x,y,R2,f)=>{let b=null,bd=R2*R2;for(const e of R.en){if(e.dead||isHidden(e)||(f&&!f(e)))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;b=e}}return b};
function crewTick(dt,rr){
  for(const h of R.mods)h.eng=0;
  if(!R.crew)return;
  for(const c of R.crew){
    c.hit=Math.max(0,c.hit-dt);if(c.pop>0)c.pop-=dt;if(c.drop>0)c.drop-=dt;
    if(c.down>0){c.down-=dt;if(c.down<=0){c.x=-18;c.y=12;c.mhp=crewMhp(c);c.hp=c.mhp;c.drop=0.4;sfx('crew');R.fx.push({type:'ring',x:c.x,y:c.y*K,r0:4,r1:30,t:.35,T:.35,c:TYPES[c.ty].c})}continue}
    const m1=crewMhp(c);if(Math.abs(m1-c.mhp)>1e-6){c.hp*=m1/c.mhp;c.mhp=m1}
    const C=CREW[c.role];let tg=null,gx=c.x,gy=c.y,stop=0;
    const mk=R.mark&&!R.mark.dead&&!isHidden(R.mark)?R.mark:null;
    if(c.role==='guardian'){
      tg=mk&&Math.hypot(mk.x,mk.y)<130?mk:nearC(0,0,125,e=>e.k!=='boss'||Math.hypot(e.x,e.y)<110);
      if(tg){gx=tg.x;gy=tg.y;stop=C.rng+tg.r-4}else{const a=R.t*0.4;gx=Math.cos(a)*52;gy=Math.sin(a)*52}
    }else if(c.role==='hunter'){
      if(mk&&Math.hypot(mk.x,mk.y)<rr*1.35)tg=mk;
      else{let bs=-1e9;for(const e of R.en){if(e.dead||isHidden(e))continue;const de=Math.hypot(e.x,e.y);if(de>rr*1.15)continue;if(e.state!=='rush'&&e.k!=='carrier')continue;
        const sc=(e.k==='carrier'?400:0)+(e.k==='skitter'||e.k==='wisp'||e.k==='spitter'?120:0)+(e.k==='boss'?-80:0)-Math.hypot(e.x-c.x,e.y-c.y)*0.6;if(sc>bs){bs=sc;tg=e}}}
      if(tg){gx=tg.x;gy=tg.y;stop=C.rng+tg.r-4;if(!c.pounce&&Math.hypot(tg.x-c.x,tg.y-c.y)>70)c.pounce=1}else{gx=Math.cos(c.id)*70;gy=Math.sin(c.id)*70}
    }else if(c.role==='medic'){
      const hurt=R.crew.find(o=>o!==c&&!o.down&&o.hp<o.mhp*0.6);
      if(hurt){gx=hurt.x;gy=hurt.y;stop=20}else{gx=24;gy=30}
      tg=mk&&Math.hypot(mk.x-c.x,mk.y-c.y)<C.rng?mk:threatTarget(c.x,c.y,C.rng);
      R.hope=Math.min(R.maxHope,R.hope+R.maxHope*medHeal(c)*dt);
      for(const o of R.crew)if(!o.down&&o.hp<o.mhp&&Math.hypot(o.x-c.x,o.y-c.y)<60)o.hp=Math.min(o.mhp,o.hp+o.mhp*(0.05+0.02*c.r)*dt);
      c.hpT=(c.hpT||0)-dt;if(c.hpT<=0){c.hpT=0.35;R.pt.push({x:c.x+rnd(-8,8),y:c.y*K-14,vx:0,vy:-30,t:0.7,c:'#7dffb0',s:2,g:0,add:1,plus:1})}
    }else{ // engineer: rotate between turret modules
      const ms=R.mods.filter(h=>h.t.c!=='drone');
      if(ms.length){c.tendT-=dt;if(c.tendT<=0){c.tendT=7;c.tend=(c.tend+1)%ms.length}const h=ms[c.tend%ms.length];gx=h.x+(h.x>0?16:-16);gy=h.y+10;
        if(Math.hypot(c.x-gx,c.y-gy)<14){h.eng=Math.max(h.eng||0,engBoost(c));c.work=1}else c.work=0}
      tg=mk&&Math.hypot(mk.x-c.x,mk.y-c.y)<C.rng?mk:threatTarget(c.x,c.y,C.rng);
    }
    // move
    const dx=gx-c.x,dy=gy-c.y,d=Math.hypot(dx,dy);let mv=0;
    if(d>stop+1){const sp=Math.min(d-stop,C.spd*(c.pounce&&tg&&d<90?2.4:1)*dt);c.x+=dx/d*sp;c.y+=dy/d*sp;mv=sp/dt;if(Math.abs(dx)>1)c.face=dx>0?1:-1}
    const lim=c.role==='hunter'?rr*1.35:c.role==='guardian'?140:rr*0.9,dd=Math.hypot(c.x,c.y);if(dd>lim){c.x*=lim/dd;c.y*=lim/dd}
    c.ph+=dt*(mv*0.09+0.4);c.moving=mv>8;
    // attack
    c.cd-=dt;c.atk=Math.max(0,c.atk-dt);
    if(tg&&c.cd<=0){const dt2=Math.hypot(tg.x-c.x,tg.y-c.y);
      if(dt2<=C.rng+tg.r+(C.rng>40?0:6)){
        c.cd=1/C.rate;c.atk=0.18;if(Math.abs(tg.x-c.x)>1)c.face=tg.x>c.x?1:-1;const dmg=crewDmg(c),col=TYPES[c.ty].c;
        if(C.rng>40){R.fx.push({type:'beam',x:c.x+c.face*6,y:c.y*K-10,x2:tg.x,y2:tg.y*K-tg.r*.6-(tg.fly?22:0),t:0.1,T:0.1,c:col,w:2});sfx('shot');hit(tg,dmg,c.ty,true)}
        else{sfx('slash');R.fx.push({type:'slash',x:c.x+c.face*10,y:c.y*K-8,f:c.face,t:0.16,T:0.16,c:col});
          let mult=1;if(c.pounce){mult=2;c.pounce=0;R.shake=Math.max(R.shake,3);R.txt.push({x:tg.x,y:tg.y*K-tg.r*2.4,v:'POUNCE',c:col,t:0.7,s:11})}
          hit(tg,dmg*mult,c.ty,true);
          if(c.role==='guardian')for(const o of R.en)if(o!==tg&&!o.dead&&Math.hypot(o.x-c.x,o.y-c.y)<C.rng+o.r+10)hit(o,dmg*0.6,c.ty,false)}
      }}
  }
}
// creatures near crew: guardian taunts in a wide radius, anyone else blocks only when touched
function crewBlock(e){if(!R.crew||e.k==='boss'||e.k==='spitter'||e.k==='carrier')return null;let b=null,bd=1e9;
  for(const c of R.crew){if(c.down>0)continue;const d=Math.hypot(c.x-e.x,c.y-e.y);if((c.role==='guardian'&&d<66)||d<e.r+10){const s=d-(c.role==='guardian'?40:0);if(s<bd){bd=s;b=c}}}return b}
function crewHurt(c,v){if(c.down>0)return;c.hp-=v;c.hit=0.12;sfx('hurt');R.txt.push({x:c.x+rnd(-5,5),y:c.y*K-30,v:'-'+fmt(v),c:'#ff8a8a',t:0.6,s:10});
  if(c.hp<=0){c.hp=0;c.down=CREW_RESPAWN;R.txt.push({x:c.x,y:c.y*K-34,v:CREW[c.role].n.toUpperCase()+' DOWN',c:'#ff5a5a',t:1.2,s:12});R.fx.push({type:'ring',x:c.x,y:c.y*K,r0:4,r1:26,t:.3,T:.3,c:'#ff5a5a'})}}
// returns true when the creature spent this frame on the crew
function crewEngage(e,dt,slowM){const bl=crewBlock(e);if(!bl)return false;
  const dx=bl.x-e.x,dy=bl.y-e.y,d=Math.hypot(dx,dy)||1;
  if(d>e.r+8){const sp=e.spd*slowM;e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;if(Math.abs(dx)>1)e.face=dx>0?1:-1;e.ph+=dt*(sp*0.12+0.5)}
  else if(!(e.frz>0)){if(e.k==='bloater'){e.dead=true;blast(e.x,e.y,80,0,'#d9c24a',e);crewHurt(bl,e.dmg*2);return true}
    e.atk-=dt;if(e.atk<=0){e.atk=1;crewHurt(bl,e.dmg);e.lunge=0.15}}
  return true}

// ---- carriers ----
function carrierTick(dt,rr){
  if(!meta.tut.crate||R.endless&&false)return;
  R.carT=(R.carT===undefined?rnd(28,38):R.carT)-dt;
  if(R.carT<=0&&!(R.boss&&!R.boss.dead)&&!R.en.some(e=>e.k==='carrier')){R.carT=rnd(55,75);
    const e=spawn('carrier','carry');e.r=15;e.hp=e.mhp=e.mhp*1.2;e.ca=Math.random()*6.28;e.dir=Math.random()<.5?1:-1;e.life=0;e.L=15;
    e.x=Math.cos(e.ca)*rr*1.25;e.y=Math.sin(e.ca)*rr*1.25;sfx('carrier');
    R.banner={s:'◆ CARRIER SPOTTED',sub:'Mark it (tap) and kill it before it escapes: FREE crate',t:2};
    if(!meta.tut.carrier)setTimeout(()=>tip('carrier',`A <b>Carrier</b> is hauling salvage around the ring! It won't attack — it runs.<br><b>Tap it to MARK it</b>: your modules focus it and it takes +25% damage. Kill it for a <b>FREE crate</b>.`,true),250)}
}
function carryMove(e,dt,rr,slowM){
  e.life+=dt;const p=Math.min(1,e.life/e.L),rad=rr*(1.25-0.42*Math.sin(Math.PI*p));
  const sp=(e.spd*(e.panic>0?1.6:1))*slowM;if(e.panic>0)e.panic-=dt;e.ca+=e.dir*sp/rad*dt;
  if(e.life>e.L){const d=Math.hypot(e.x,e.y)||1;e.x+=e.x/d*sp*1.5*dt;e.y+=e.y/d*sp*1.5*dt;
    if(d>rr*1.9){e.dead=true;if(R.mark===e)R.mark=null;R.banner={s:'CARRIER ESCAPED',sub:'Mark the next one sooner',t:1.4};sfx('escape')}}
  else{const nx=Math.cos(e.ca)*rad,ny=Math.sin(e.ca)*rad;if(Math.abs(nx-e.x)>0.3)e.face=nx>e.x?1:-1;e.x=nx;e.y=ny}
  e.ph+=dt*(sp*0.12+0.5)}
function bountyKill(e){
  const big=e.k==='carrier';
  if(big){R.free=(R.free||0)+1;sfx('freecrate');flash(0.25);R.shake=Math.max(R.shake,6);
    R.txt.push({x:e.x,y:e.y*K-e.r*2.8,v:'FREE CRATE!',c:'#ffd24a',t:1.6,s:22,rx:1});
    for(let i=0;i<40;i++)R.pt.push({x:e.x,y:e.y*K-20,vx:rnd(-200,200),vy:rnd(-260,-40),t:rnd(.5,1.1),c:i%2?'#ffd24a':'#fff6c0',s:3,g:260,add:1});
    $('packBtn')&&$('packBtn').classList.add('pulse');if(typeof renderHUD==='function')renderHUD()}
  else{const v=e.g*(1+0.15*lv('gold'))*REACT[R.react].loot*2;drop('scrap',e.x,e.y,v);sfx('bounty');R.txt.push({x:e.x,y:e.y*K-e.r*2.6,v:'BOUNTY +'+fmt(v),c:'#ffd24a',t:1.1,s:14})}
}

// ---- drawing ----
// simple chunky astronaut, anchor at feet; works on any 2D context
function drawCrewFig(c2,X,Y,role,ty,o){
  o=o||{};const ph=o.ph||0,f=o.face||1,mv=o.moving?1:0,col=CREW[role].c,ec=TYPES[ty].c,wh=o.hit>0?'#ffffff':null;
  const step=Math.sin(ph*6)*2.2*mv,bob=Math.abs(Math.sin(ph*6))*1.2*mv,atk=o.atk>0?1:0;
  c2.save();c2.translate(X,Y-bob);c2.scale(f,1);c2.lineJoin='round';
  const R_=(x,y,w,h,fc)=>{c2.fillStyle='#0b0a10';c2.fillRect(x-1.2,y-1.2,w+2.4,h+2.4);c2.fillStyle=wh||fc;c2.fillRect(x,y,w,h)};
  // legs
  R_(-4+step,-7,3,7,'#2a2f3d');R_(1-step,-7,3,7,'#2a2f3d');
  // backpack
  R_(-8,-17,4,9,role==='medic'?'#e8f0f2':'#4a5162');
  // body
  R_(-4.5,-17,9,11,col);c2.fillStyle='#00000033';c2.fillRect(-4.5,-10,9,4);c2.fillStyle=ec;c2.fillRect(-4.5,-12,9,1.6);
  if(role==='medic'){c2.fillStyle='#fff';c2.fillRect(-1,-16,2,5);c2.fillRect(-2.5,-14.5,5,2);c2.fillStyle='#ff4d5e';c2.fillRect(-0.6,-15.6,1.2,4.2);c2.fillRect(-2.1,-14.1,4.2,1.2)}
  // helmet + visor
  c2.fillStyle='#0b0a10';c2.beginPath();c2.arc(0,-21.5,6.4,0,7);c2.fill();c2.fillStyle=wh||'#dfe6ee';c2.beginPath();c2.arc(0,-21.5,5.2,0,7);c2.fill();
  c2.fillStyle=ec;c2.beginPath();c2.ellipse(1.6,-21.5,3.2,2.4,0,0,7);c2.fill();c2.fillStyle='#ffffffaa';c2.fillRect(1.6,-23,1.4,1);
  if(role==='engineer'){c2.fillStyle='#ffd24a';c2.beginPath();c2.arc(0,-24,5.4,Math.PI,0);c2.fill();c2.fillRect(-6,-24.4,12,1.4)}
  // props
  if(role==='guardian'){R_(4,-19+atk*-2,5,13,'#5a6b8c');c2.fillStyle=ec;c2.fillRect(5.5,-16+atk*-2,2,7)}
  else if(role==='hunter'){c2.strokeStyle='#0b0a10';c2.lineWidth=3;const a=atk?-0.2:0.7;c2.beginPath();c2.moveTo(4,-11);c2.lineTo(4+Math.cos(a)*11,-11-Math.sin(a)*11);c2.stroke();c2.strokeStyle=ec;c2.lineWidth=1.6;c2.stroke()}
  else{R_(4,-13,7,3,'#4a5162');c2.fillStyle=ec;c2.fillRect(10,-12.6,2,2)}
  if(role==='engineer'){c2.fillStyle='#9aa4b2';c2.fillRect(-2,-6,1,1)}
  c2.restore();
}
// AI sprite version of the crew figure (assets/ai/crew_<role>); falls back to the code-drawn figure
function crewSprName(role){const n='crew_'+role;return SPR.has(n)?n:null}
function drawCrewAny(c2,role,ty,o){
  const n=crewSprName(role);if(!n){drawCrewFig(c2,0,0,role,ty,o);return}
  const fi=o.moving?Math.floor((o.ph||0)*1.4)%4:0,fl=(o.face||1)<0;
  drawSpr(c2,n,fi,0,0,fl);
  if(o.hit>0){const a0=c2.globalAlpha;c2.globalAlpha=a0*0.65;drawSpr(c2,n+'_flash',fi,0,0,fl);c2.globalAlpha=a0}
  // element pip at the feet (the sprites share one palette per role, the element shows here)
  c2.fillStyle=TYPES[ty].c;c2.globalAlpha=(c2.globalAlpha||1)*0.95;c2.beginPath();c2.arc(fl?7:-7,2,2.2,0,7);c2.fill();c2.globalAlpha=1;
}
function drawCrew(c,T){
  const X=c.x,Y=c.y*K,ctx2=ctx;
  if(c.down>0){ctx2.save();ctx2.globalAlpha=0.55;ctx2.translate(X,Y);ctx2.rotate(-Math.PI/2*c.face);drawCrewAny(ctx2,c.role,c.ty,{face:c.face});ctx2.restore();
    ctx2.strokeStyle='#ffffff88';ctx2.lineWidth=2;ctx2.beginPath();ctx2.arc(X,Y-26,6,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-c.down/CREW_RESPAWN));ctx2.stroke();return}
  const dz=c.drop>0?c.drop*60:0,sc=c.pop>0?1+Math.sin(c.pop/0.6*Math.PI)*0.3:1;
  ctx2.save();ctx2.translate(X,Y-dz);ctx2.scale(sc,sc);
  ctx2.strokeStyle=RAR[c.r].c;ctx2.globalAlpha=0.8;ctx2.lineWidth=1.4;ctx2.beginPath();ctx2.ellipse(0,0,9,3.4,0,0,7);ctx2.stroke();ctx2.globalAlpha=1;
  drawCrewAny(ctx2,c.role,c.ty,{ph:c.ph,face:c.face,moving:c.moving,hit:c.hit,atk:c.atk});
  if(c.work){ctx2.fillStyle='#ffd24a';const a=T*8;ctx2.fillRect(Math.cos(a)*8-1,-30+Math.sin(a)*2,2,2)}
  if(c.s>1){ctx2.fillStyle='#ffd24a';ctx2.font='900 7px monospace';ctx2.textAlign='center';ctx2.fillText('★'.repeat(Math.min(c.s,5)),0,-31)}
  ctx2.restore();
  if(c.hp<c.mhp){const w=16,y=Y-dz-34-(c.s>1?6:0);ctx2.fillStyle='#000';ctx2.fillRect(X-w/2-1,y-1,w+2,4);ctx2.fillStyle='#7dffb0';ctx2.fillRect(X-w/2,y,w*Math.max(0,c.hp/c.mhp),2)}
}
function drawCarrierExtras(e,T){
  const X=e.x,Y=e.y*K-e.r*1.9-Math.sin(T*5)*1.5,p=Math.min(1,e.life/e.L);
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,210,74,${0.18+0.1*Math.sin(T*6)})`;ctx.beginPath();ctx.ellipse(X,Y-40,6,46,0,0,7);ctx.fill();
  ctx.beginPath();ctx.arc(X,Y,14,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#0b0a10';ctx.fillRect(X-8,Y-6,16,12);ctx.fillStyle='#8a6a2a';ctx.fillRect(X-7,Y-5,14,10);ctx.fillStyle='#ffd24a';ctx.fillRect(X-7,Y-1,14,2);ctx.fillRect(X-1,Y-5,2,10);
  ctx.strokeStyle='#ffd24acc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,Y-16,5,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-p));ctx.stroke();
}
const _portraits={};
function crewPortrait(role,ty){const k=role+ty;if(_portraits[k])return _portraits[k];
  const cv2=document.createElement('canvas');cv2.width=cv2.height=96;const c2=cv2.getContext('2d');
  const sn=crewSprName(role);
  if(sn){ // AI sprite, fitted into the 96px box, bottom aligned; not cached until the atlas is ready (handled by crewSprName)
    const f=SPR.data.sprites[sn][0],s=Math.min(88/f.w,88/f.h);c2.imageSmoothingEnabled=true;c2.imageSmoothingQuality='high';
    c2.drawImage(SPR.img,f.x,f.y,f.w,f.h,48-f.w*s/2,92-f.h*s,f.w*s,f.h*s);
    c2.fillStyle=TYPES[ty].c;c2.beginPath();c2.arc(10,86,5,0,7);c2.fill();c2.strokeStyle='#0b0a10';c2.lineWidth=2;c2.stroke();
    return _portraits[k]=cv2.toDataURL()}
  c2.scale(3,3);drawCrewFig(c2,16,30,role,ty,{face:1});
  return cv2.toDataURL()}
function crewCardHTML(cd,i){
  const C=CREW[cd.cr],ex=R.crew.find(c=>c.role===cd.cr),col=TYPES[cd.ty].c;
  let tag;if(ex)tag=`<span class="tg" style="background:#ffd24a">★${ex.s} → ★${ex.s+1} UPGRADE</span>`;
  else if(R.crew.length>=CREW_MAX){let w=R.crew[0];for(const x of R.crew)if(crewPow(x)<crewPow(w))w=x;tag=`<span class="tg" style="background:#ff5a5a">Replaces ${CREW[w.role].n}</span>`}
  else tag=`<span class="tg" style="background:#8fb4ff">New crew · ${R.crew.length+1}/${CREW_MAX}</span>`;
  const have=haveElems(),newRx=[...buildReactions([...have,cd.ty])].filter(n=>!buildReactions(have).has(n));
  const rxl=newRx.length?`<div class="rxu">${newRx.map(n=>{const r=Object.values(RX).find(x=>x.n===n);return `<span style="--rc2:${r.c}" title="${r.d}">⚡ ${n}</span>`}).join('')}</div>`:'';
  const r=ex?Math.max(ex.r,cd.r):cd.r,s=ex?ex.s+1:1;
  return `<div class="card r${cd.r} crewcard" style="--rc:${RAR[cd.r].c};border-color:${RAR[cd.r].c}" data-i="${i}">
    <div class="rn" style="color:${RAR[cd.r].c}">${RAR[cd.r].n} · CREW</div>
    <div class="erow">${elemBadge(cd.ty)}</div>
    <div class="gl" style="background:${col}1c"><img class="crimg" src="${crewPortrait(cd.cr,cd.ty)}" alt=""></div>
    <div class="nm">${cd.ty} ${C.n}</div><div class="ds">${C.d}</div>
    <div class="ds st">${crewStat(cd.cr,r,s,cd.ty)}</div>${rxl}${tag}</div>`;
}
const haveElems=()=>[...new Set(R.mods.map(h=>h.t.ty).concat((R.crew||[]).map(c=>c.ty)))];
