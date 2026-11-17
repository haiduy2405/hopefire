"use strict";
// ===== RUN =====
let R=null,speed=1;
const ringR=()=>BASE_RING*REACT[R.react].ring;
function newRun(ch){
  const maxHope=100*(1+0.25*lv('hp'));
  R={ch,t:0,wave:1,waveT:0,spawnT:1,hope:maxHope,maxHope,gold:15+8*lv('start'),cores:0,packs:0,mods:[],en:[],pr:[],fx:[],pt:[],txt:[],orbs:[],lights:[],
    kills:0,boltCd:0.6,bossSpawned:false,boss:null,over:false,won:false,shake:0,slots:4+lv('slots'),paused:false,tipPause:false,syn:{},
    banner:{s:SITES[ch-1],sub:'Site '+ch,t:2.6},react:1,spells:[],overT:0,ringPulse:0,shipAim:-Math.PI/2,shipFl:0,smokeT:0,lureT:8,tutStep:0};
  for(let i=0;i<16;i++)spawn(Math.random()<.2?'skitter':'crawler','ambient');
  layoutMods();renderChips();refreshReactBtn();renderSpellBar();
  if(!meta.tut.start)setTimeout(()=>tip('start',`Your ship is wrecked. The creatures out there are <b>blind</b> — they only sense you inside the <b>ring</b>.<br>Your heat ray still fires. Keep <b>🔥 HOPE</b> above zero.`,true),600);
  else if(meta.runs>=1&&!meta.tut.reactor)setTimeout(()=>tip('reactor',`<b>Reactor unlocked.</b> OVERDRIVE = more damage &amp; loot, but a <b>wider ring</b> — more of them will notice you.`,false,7),800);
}
const tierM=t=>Math.pow(1.8,t-1);
const power=h=>h.t.dmg*h.t.rate*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier);
function modDmg(h){return h.t.dmg*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier)*(1+0.15*lv('dmg'))*(R.syn[h.t.ty]>=2?1.25:1)*REACT[R.react].dmg}
function packCost(){return Math.max(1,Math.floor(10*Math.pow(2.2,R.ch-1)*Math.pow(1.32,R.packs)*(1-0.06*lv('disc'))))}
function layoutMods(){
  const n=R.slots;R.syn={};
  R.mods.forEach((h,i)=>{const a=-Math.PI/2+Math.PI/n+i*2*Math.PI/n;h.x=Math.cos(a)*82;h.y=Math.sin(a)*82;R.syn[h.t.ty]=(R.syn[h.t.ty]||0)+1});
}
function rollR(){const L=1+0.12*lv('luck')+0.25*(R.ch-1);const w=[70,22*L,7*L,1.2*L];let x=Math.random()*w.reduce((a,b)=>a+b);for(let i=0;i<4;i++){if((x-=w[i])<0)return i}return 0}
function spawn(kind,state){
  const k=EK[kind],a=Math.random()*Math.PI*2,rr=R?ringR():BASE_RING;
  const d=state==='ambient'?rnd(rr*1.75,rr*2.7):state==='rush'?rr*1.4:rr+rnd(45,150);
  const hm=Math.pow(3.2,R.ch-1)*Math.pow(1.2,R.wave-1);
  const e={k:kind,x:Math.cos(a)*d,y:Math.sin(a)*d,hp:k.hp*hm,mhp:k.hp*hm,spd:k.spd*rnd(0.9,1.1),
    dmg:k.dmg*Math.pow(1.6,R.ch-1)*Math.pow(1.1,R.wave-1),r:k.r,g:k.g*Math.pow(2.2,R.ch-1)*Math.pow(1.1,R.wave-1),c:k.c,
    state:state||'wander',hd:a+Math.PI+rnd(-1,1),wt:rnd(0.5,2),alertT:0,face:1,ph:Math.random()*6,
    atk:0,slow:0,burn:0,bd:0,dead:false,hit:0};
  if(state==='ambient')e.hd=a+Math.PI/2*(Math.random()<.5?1:-1);
  R.en.push(e);return e;
}
function alertE(e){
  if(e.state==='rush')return;e.state='rush';e.alertT=0.45;R.ringPulse=1;sfx('alert');
  const d=Math.hypot(e.x,e.y)||1;R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:4,r1:30,t:0.4,T:0.4,c:'#ff3a3a'});
  if(R.ringPulse)R.lastAlert={x:e.x/d,y:e.y/d};
}
// pick target in range that is closest to the ship (biggest threat)
function threatTarget(x,y,range){let b=null,bd=1e18;const r2=range*range;for(const e of R.en){if(e.dead)continue;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy>r2)continue;const ds=e.x*e.x+e.y*e.y-(e.state==='rush'?1e6:0);if(ds<bd){bd=ds;b=e}}return b}
function addTxt(x,y,v,c,s){if(R.txt.length<80)R.txt.push({x:x+rnd(-6,6),y,v:typeof v==='string'?v:fmt(v),c,t:0.75,s:s||11})}
function hit(e,d,ty,primary){
  if(e.dead)return;e.hp-=d;e.hit=0.08;sfx('hit');addTxt(e.x,e.y*K-e.r*1.6,d,ty?TYPES[ty].c:'#ffe9b0');
  if(e.state!=='rush')alertE(e);
  if(ty&&primary&&R.syn[ty]>=4){
    if(ty==='Thermal'){e.burn=3;e.bd=Math.max(e.bd,d*0.4)}
    else if(ty==='Cryo'){e.slow=1.6}
    else if(ty==='Arc'){
      const os=R.en.filter(o=>!o.dead&&o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<140).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y)).slice(0,2);
      for(const o of os){R.fx.push({type:'zap',x:e.x,y:e.y*K-e.r*.6,x2:o.x,y2:o.y*K-o.r*.6,t:0.16,T:0.16,c:TYPES.Arc.c});hit(o,d*0.5,ty,false)}
    }
  }
  if(e.hp<=0)kill(e);
}
function drop(type,x,y,v){R.orbs.push({type,x,y:y*K,v,vx:rnd(-90,90),vy:rnd(-110,-30),t:0})}
function kill(e){
  if(e.dead)return;e.dead=true;R.kills++;sfx('kill');const k=EK[e.k],L=REACT[R.react].loot;
  drop('scrap',e.x,e.y,e.g*(1+0.15*lv('gold'))*L);
  drop('core',e.x,e.y,k.core*Math.pow(1.6,R.ch-1)*L);
  if(Math.random()<k.cell){drop('cell',e.x,e.y,R.maxHope*(e.k==='boss'?0.5:0.06));if(!meta.tut.cell)setTimeout(()=>tip('cell','Green <b>energy cells</b> restore HOPE. Kill brutes for a better chance.',false,6),400)}
  const n=e.k==='boss'?50:9;
  for(let i=0;i<n;i++)R.pt.push({x:e.x,y:e.y*K-e.r*.5,vx:rnd(-110,110),vy:rnd(-140,40),t:rnd(0.3,0.8),c:i%3?e.c:'#9cff5a',s:rnd(2,5),g:260});
  R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:4,r1:e.r*2.2,t:0.25,T:0.25,c:'#9cff5a'});
  if(e.k==='boss'){R.shake=16;flash(0.7);sfx('boom');for(const o of R.orbs)o.t=Math.max(o.t,0.35);setTimeout(()=>{if(R&&!R.over)endRun(true)},1600)}
}
function update(dt){
  R.t+=dt;R.waveT+=dt;const rr=ringR();
  if(R.wave<BOSS_WAVE&&R.waveT>=WAVE_LEN){R.wave++;R.waveT=0;R.banner={s:R.wave===BOSS_WAVE?'⚠ SOMETHING HUGE APPROACHES ⚠':'THREAT '+R.wave,t:1.8}}
  if(R.wave>=BOSS_WAVE&&!R.bossSpawned){R.bossSpawned=true;R.boss=spawn('boss','wander');const a=Math.random()*6.28;R.boss.x=Math.cos(a)*rr*1.5;R.boss.y=Math.sin(a)*rr*1.5;R.shake=12;sfx('boss');
    if(!meta.tut.boss)setTimeout(()=>tip('boss','That thing <b>swallowed the part we need</b> to repair the ship. Bring it down!',false,6),300)}
  // spawns: wanderers drift toward the ring
  R.spawnT-=dt;
  if(R.spawnT<=0){
    const iv=Math.max(0.22,1.5*Math.pow(0.88,R.wave-1))/REACT[R.react].spawn;R.spawnT=R.boss&&!R.boss.dead?iv*1.5:iv;
    const r=Math.random();spawn(R.wave>=5&&r<0.12?'brute':R.wave>=3&&r<0.35?'skitter':'crawler','wander');
  }
  // occasionally an ambient creature loses its way
  R.lureT-=dt;if(R.lureT<=0){R.lureT=rnd(6,12);const a=R.en.filter(e=>e.state==='ambient');if(a.length){const e=a[Math.random()*a.length|0];e.state='wander';e.hd=Math.atan2(-e.y,-e.x)}
    if(a.length<10)spawn('crawler','ambient')}
  // enemies
  for(const e of R.en){
    if(e.dead)continue;
    e.hit=Math.max(0,e.hit-dt);if(e.slow>0)e.slow-=dt;if(e.frz>0)e.frz-=dt;
    if(e.burn>0){e.burn-=dt;e.hp-=e.bd*dt;if(Math.random()<dt*8)R.pt.push({x:e.x+rnd(-e.r,e.r),y:e.y*K-e.r,vx:0,vy:-40,t:0.4,c:'#ff7a3d',s:2,g:0,add:1});if(e.burn<=0)e.bd=0;if(e.hp<=0){kill(e);continue}}
    const d=Math.hypot(e.x,e.y)||1,slowM=e.frz>0?0.08:e.slow>0?0.6:1;let vx=0,vy=0;
    if(e.state==='ambient'){
      e.wt-=dt;if(e.wt<=0){e.wt=rnd(1,3);e.hd+=rnd(-0.6,0.6)}
      const sp=10*slowM;vx=Math.cos(e.hd)*sp;vy=Math.sin(e.hd)*sp;
      if(d<rr*1.6){vx+=e.x/d*20;vy+=e.y/d*20}else if(d>rr*2.9){vx-=e.x/d*20;vy-=e.y/d*20}
      if(d<rr)alertE(e);
    }else if(e.state==='wander'){
      e.wt-=dt;if(e.wt<=0){e.wt=rnd(0.6,1.8);e.hd=Math.atan2(-e.y,-e.x)+rnd(-1.1,1.1)}
      const sp=(e.k==='boss'?14:22)*slowM;vx=Math.cos(e.hd)*sp;vy=Math.sin(e.hd)*sp;
      if(d<rr)alertE(e);
    }else{
      if(e.alertT>0){e.alertT-=dt}
      else{const reach=40+e.r,sp=e.spd*slowM;
        if(d>reach){vx=-e.x/d*sp;vy=-e.y/d*sp}
        else if(!(e.frz>0)){e.atk-=dt;if(e.atk<=0){e.atk=1;damageHope(e.dmg);e.lunge=0.15}}}
    }
    e.x+=vx*dt;e.y+=vy*dt;if(Math.abs(vx)>1)e.face=vx>0?1:-1;e.ph+=dt*(Math.hypot(vx,vy)*0.12+0.5);if(e.lunge>0)e.lunge-=dt;
  }
  // modules
  const as=(1+0.08*lv('aspd'))*(R.overT>0?2:1);
  for(const h of R.mods){
    h.cd=(h.cd||0)-dt*as;h.fl=Math.max(0,(h.fl||0)-dt);
    if(h.cd>0)continue;
    const tg=threatTarget(h.x,h.y,h.t.range);if(!tg){h.cd=0.1;continue}
    h.cd=1/h.t.rate;h.fl=0.12;const dmg=modDmg(h),col=TYPES[h.t.ty].c;
    h.aim=Math.atan2(tg.y*K-tg.r*.6-(h.y*K-16),tg.x-h.x);
    const mx=h.x+Math.cos(h.aim)*13,my=h.y*K-16+Math.sin(h.aim)*13;
    if(h.t.c==='lance'){
      sfx('lance');R.fx.push({type:'beam',x:mx,y:my,x2:tg.x,y2:tg.y*K-tg.r*.6,t:0.14,T:0.14,c:col,w:4});
      for(const e of R.en)if(e!==tg&&!e.dead&&Math.hypot(e.x-tg.x,e.y-tg.y)<45)hit(e,dmg*0.5,h.t.ty,false);
      hit(tg,dmg,h.t.ty,true);
    }else if(h.t.c==='rail'){
      sfx('shot');R.pr.push({k:'rail',x:h.x,y:h.y,z:16,px:mx,py:my,tg,lx:tg.x,ly:tg.y,dmg,spd:900,ty:h.t.ty,c:col});
    }else{
      sfx('mortar');const ft=0.7,tx=tg.x+(tg.state==='rush'?-tg.x/(Math.hypot(tg.x,tg.y)||1)*tg.spd*ft*0.8:0),ty=tg.y+(tg.state==='rush'?-tg.y/(Math.hypot(tg.x,tg.y)||1)*tg.spd*ft*0.8:0);
      R.pr.push({k:'shell',sx:h.x,sy:h.y,tx,ty,t:0,ft,dmg,aoe:h.t.aoe,ty2:h.t.ty,c:col,tg});
    }
  }
  // main heat ray
  R.boltCd-=dt;R.shipFl=Math.max(0,R.shipFl-dt);
  if(R.boltCd<=0){const tg=threatTarget(0,0,Math.max(300,rr*1.05));
    if(tg){R.boltCd=1;R.shipFl=0.15;const ex=tg.x,ey=tg.y*K-tg.r*.6;R.shipAim=Math.atan2(ey+44,ex);
      const mx=Math.cos(R.shipAim)*20,my=-44+Math.sin(R.shipAim)*20;
      R.fx.push({type:'beam',x:mx,y:my,x2:ex,y2:ey,t:0.22,T:0.22,c:'#ffb03a',w:6});sfx('beam');
      hit(tg,6*(1+0.5*lv('bolt'))*tierM(R.ch)*REACT[R.react].dmg,null,true);
    }else R.boltCd=0.1}
  // projectiles
  for(const p of R.pr){
    if(p.k==='rail'){
      let tx,ty;if(p.tg&&!p.tg.dead){tx=p.tg.x;ty=p.tg.y;p.lx=tx;p.ly=ty}else{p.tg=null;tx=p.lx;ty=p.ly}
      const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),st=p.spd*dt;p.px=p.x;p.py=p.y*K-p.z;
      if(d<=st+(p.tg?p.tg.r:3)){if(p.tg)hit(p.tg,p.dmg,p.ty,true);p.dead=true;R.fx.push({type:'spark',x:tx,y:ty*K-8,t:0.12,T:0.12,c:p.c})}
      else{p.x+=dx/d*st;p.y+=dy/d*st;p.z=Math.max(8,p.z-dt*20)}
    }else{
      p.t+=dt/p.ft;
      if(p.t>=1){p.dead=true;sfx('boom');R.shake=Math.min(6,R.shake+1.5);
        for(const e of R.en)if(!e.dead&&Math.hypot(e.x-p.tx,e.y-p.ty)<p.aoe+e.r)hit(e,p.dmg,p.ty2,e===p.tg);
        R.fx.push({type:'boom',x:p.tx,y:p.ty*K,r:p.aoe,t:0.35,T:0.35,c:p.c});
        for(let i=0;i<8;i++)R.pt.push({x:p.tx,y:p.ty*K,vx:rnd(-120,120),vy:rnd(-160,-20),t:rnd(.2,.5),c:p.c,s:3,g:300,add:1})}
    }
  }
  // orbs fly to the ship
  for(const o of R.orbs){
    o.t+=dt;
    if(o.t<0.35){o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=320*dt;o.vx*=0.95}
    else{const dx=-o.x,dy=-20-o.y,d=Math.hypot(dx,dy)||1,sp=150+o.t*900;
      if(d<sp*dt+12){o.dead=true;
        if(o.type==='scrap'){R.gold+=o.v;sfx('pick')}
        else if(o.type==='core'){R.cores+=o.v;sfx('pick')}
        else{R.hope=Math.min(R.maxHope,R.hope+o.v);sfx('cell');addTxt(0,-70,'+HOPE','#7dffb0',13)}}
      else{o.x+=dx/d*sp*dt;o.y+=dy/d*sp*dt}}
  }
  // hope drain + regen
  let drain=R.maxHope*0.003*(1-0.06*lv('regen'));
  const regen=R.syn.Nano>=4?R.maxHope*0.015:0;
  R.hope=Math.min(R.maxHope,R.hope-drain*dt+regen*dt);
  if(!meta.tut.done1&&R.t<55)R.hope=Math.max(R.hope,R.maxHope*0.2); // first run can't be lost while learning
  // smoke from engine
  R.smokeT-=dt;if(R.smokeT<=0){R.smokeT=0.09;R.pt.push({x:-52+rnd(-3,3),y:-14,vx:rnd(-8,8),vy:rnd(-40,-25),t:rnd(1.2,2),c:'#555b66',s:rnd(4,7),g:-5,smoke:1})}
  // fx decay
  for(const f of R.fx)f.t-=dt;
  for(const p of R.pt){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(!p.smoke){p.vx*=0.95}else p.s+=dt*5}
  for(const t of R.txt){t.t-=dt;t.y-=32*dt}
  R.en=R.en.filter(e=>!e.dead);R.pr=R.pr.filter(p=>!p.dead);R.fx=R.fx.filter(f=>f.t>0);R.pt=R.pt.filter(p=>p.t>0);R.txt=R.txt.filter(t=>t.t>0);R.orbs=R.orbs.filter(o=>!o.dead);
  if(R.pt.length>500)R.pt.splice(0,R.pt.length-500);
  if(R.banner)R.banner.t-=dt;R.ringPulse=Math.max(0,R.ringPulse-dt*1.5);
  spellTick(dt);tutorialTick();
  if(R.hope<=0&&!R.over){R.hope=0;R.shake=16;endRun(false)}
}
function damageHope(v){R.hope-=v;R.shake=Math.min(9,R.shake+2.5);sfx('hurt');R.fx.push({type:'ring',x:0,y:0,r0:30,r1:70,t:0.25,T:0.25,c:'#ff3a3a'});addTxt(rnd(-20,20),-60,'-'+fmt(v),'#ff5a5a',13)}
