"use strict";
// ===== RUN =====
let R=null,speed=1;
const hasRel=id=>!!(R&&R.relics&&R.relics.includes(id));
const ringR=()=>BASE_RING*REACT[R.react].ring*(hasRel('dampener')?0.85:1);
function newRun(ch,endless,warp){
  document.body.classList.remove('inmenu');
  const maxHope=100*(1+0.25*lv('hp'));
  R={ch,endless:!!endless,t:0,wave:1,waveT:0,spawnT:1,hope:maxHope,maxHope,gold:15+8*lv('start'),cores:0,packs:0,mods:[],en:[],pr:[],fx:[],pt:[],txt:[],orbs:[],
    kills:0,boltCd:0.6,bossSpawned:false,boss:null,lastBossWave:0,bossKills:0,over:false,won:false,shake:0,slots:4+lv('slots'),paused:false,tipPause:false,syn:{},
    banner:{s:endless?'ENDLESS WASTES':SITES[ch-1],sub:endless?'How long can hope last?':'Site '+ch,t:2.6},react:1,spells:[],relics:[],overT:0,ringPulse:0,
    shipAim:-Math.PI/2,shipFl:0,smokeT:0,lureT:8,tutStep:0,minHopeP:1,autoT:0,achT:1};
  if(warp&&!endless){R.wave=WARP_WAVE;R.gold+=Math.floor(40*Math.pow(2.2,ch-1));R.banner={s:'WARP → THREAT '+WARP_WAVE,sub:SITES[ch-1],t:2.2}}
  const sig=SIG[ch]||'crawler';
  for(let i=0;i<16;i++)spawn(ch>1&&i%5===0&&sig!=='bloater'?sig:(Math.random()<.2?'skitter':'crawler'),'ambient');
  $('spdBtn').textContent=speed+'x';
  layoutMods();renderChips();refreshReactBtn();renderSpellBar();
  if(!meta.tut.start)setTimeout(()=>tip('start',`Your ship is wrecked. The creatures out there are <b>blind</b> — they only sense you inside the <b>ring</b>.<br>Your heat ray still fires. Keep <b>🔥 HOPE</b> above zero.`,true),600);
  else if(meta.runs>=1&&!meta.tut.reactor)setTimeout(()=>tip('reactor',`<b>Reactor unlocked.</b> OVERDRIVE = more damage &amp; loot, but a <b>wider ring</b> — more of them will notice you.`,false,7),800);
  else if(ch>1&&!meta.tut['site'+ch])setTimeout(()=>tip('site'+ch,SITE_TIPS[ch]||'',false,7),900);
}
const SITE_TIPS={2:'New creature: <b>Spitters</b> keep their distance and spit acid. Long-range <b>Rails</b> handle them best.',
  3:'<b>Bloaters</b> explode on the hull — kill them early, their blast hurts other creatures. <b>Wisps</b> fly: mortars only deal half damage to them.',
  4:'<b>Phantoms</b> are cloaked until they get close. Area damage still hits them.',
  5:'<b>Splitters</b> burst into skitters when killed. Something ancient waits here…'};
const tierM=t=>Math.pow(1.8,t-1);
const power=h=>h.t.dmg*h.t.rate*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier);
function modDmg(h){return h.t.dmg*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier)*(1+0.15*lv('dmg'))*(R.syn[h.t.ty]>=2?1.25:1)*REACT[R.react].dmg*(hasRel('glass')?1.5:1)}
function packCost(){return Math.max(1,Math.floor(10*Math.pow(2.2,R.ch-1)*Math.pow(1.32,R.packs)*(1-0.06*lv('disc'))))}
function layoutMods(){
  const n=R.slots;R.syn={};
  R.mods.forEach((h,i)=>{const a=-Math.PI/2+Math.PI/n+i*2*Math.PI/n;h.x=Math.cos(a)*82;h.y=Math.sin(a)*82;R.syn[h.t.ty]=(R.syn[h.t.ty]||0)+1});
  if(Object.values(R.syn).some(v=>v>=4))ach('syn4');if(R.mods.length>=8)ach('arsenal');
}
function rollR(){const L=1+0.12*lv('luck')+0.25*(R.ch-1);const w=[70,22*L,7*L,1.2*L];let x=Math.random()*w.reduce((a,b)=>a+b);for(let i=0;i<4;i++){if((x-=w[i])<0)return i}return 0}
function pickKind(){let tot=0;const L=[];for(const [k,w,mw,mc] of SPAWN_TABLE)if(R.wave>=mw&&R.ch>=mc){L.push([k,w]);tot+=w}let x=Math.random()*tot;for(const [k,w] of L){if((x-=w)<0)return k}return 'crawler'}
function spawn(kind,state,bk){
  const k=EK[kind],a=Math.random()*Math.PI*2,rr=ringR(),B=bk?BOSSES[bk-1]:null;
  const d=state==='ambient'?rnd(rr*1.75,rr*2.7):state==='rush'?rr*1.4:rr+rnd(45,150);
  const hm=CH_HP[R.ch-1]*Math.pow(1.2,R.wave-1)*(B?B.hp:1);
  const e={k:kind,bk:bk||0,x:Math.cos(a)*d,y:Math.sin(a)*d,hp:k.hp*hm,mhp:k.hp*hm,spd:k.spd*rnd(0.9,1.1)*(B?B.spd:1),
    dmg:k.dmg*CH_DMG[R.ch-1]*Math.pow(1.1,Math.min(R.wave,30)-1),r:k.r,g:k.g*Math.pow(2.2,R.ch-1)*Math.pow(1.1,R.wave-1),c:B?B.c:k.c,
    state:state||'wander',hd:a+Math.PI+rnd(-1,1),wt:rnd(0.5,2),alertT:0,face:1,ph:Math.random()*6,
    atk:0,slow:0,frz:0,burn:0,bd:0,dead:false,hit:0,ai:rnd(0,1),fly:kind==='wisp',cloak:kind==='phantom'};
  if(state==='ambient')e.hd=a+Math.PI/2*(Math.random()<.5?1:-1);
  R.en.push(e);return e;
}
function alertE(e){
  if(e.state==='rush')return;e.state='rush';e.alertT=0.45;R.ringPulse=1;sfx('alert');
  R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:4,r1:30,t:0.4,T:0.4,c:'#ff3a3a'});
}
const isHidden=e=>(e.cloak&&Math.hypot(e.x,e.y)>ringR()*0.7)||e.blink>0;
// pick target in range that is closest to the ship (biggest threat); cloaked ones are skipped
function threatTarget(x,y,range){let b=null,bd=1e18;const r2=range*range;for(const e of R.en){if(e.dead||isHidden(e))continue;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy>r2)continue;const ds=e.x*e.x+e.y*e.y-(e.state==='rush'?1e6:0);if(ds<bd){bd=ds;b=e}}return b}
function addTxt(x,y,v,c,s){if(typeof v!=='string'&&!meta.set.nums)return;if(R.txt.length<80)R.txt.push({x:x+rnd(-6,6),y,v:typeof v==='string'?v:fmt(v),c,t:0.75,s:s||11})}
function dmgTxt(e,d,c){if(!meta.set.nums)return;const t=R.txt.find(o=>o.e===e&&o.age<0.35);if(t){t.n+=d;t.v=fmt(t.n);t.t=0.75;t.c=c;t.s=Math.min(16,11+Math.log10(1+t.n/(e.mhp||1)*10)*3);return}
  if(R.txt.length<45)R.txt.push({e,n:d,age:0,x:e.x+rnd(-6,6),y:e.y*K-e.r*1.6-(e.fly?22:0),v:fmt(d),c,t:0.75,s:11})}
function hit(e,d,ty,primary){
  if(e.dead)return;if(e.armor!==undefined)d*=e.armor;
  e.hp-=d;e.hit=0.08;sfx('hit');dmgTxt(e,d,e.armor<1?'#9aa4b2':ty?TYPES[ty].c:'#ffe9b0');
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
function blast(x,y,r,dmg,col,src){
  sfx('boom');R.shake=Math.min(12,R.shake+4);R.fx.push({type:'boom',x,y:y*K,r,t:0.45,T:0.45,c:col});
  for(let i=0;i<14;i++)R.pt.push({x,y:y*K,vx:rnd(-160,160),vy:rnd(-200,-20),t:rnd(.3,.6),c:col,s:4,g:300,add:1});
  if(dmg)for(const o of R.en)if(!o.dead&&o!==src&&Math.hypot(o.x-x,o.y-y)<r+o.r)hit(o,dmg,null,false);
}
function kill(e){
  if(e.dead)return;e.dead=true;R.kills++;meta.stats.kills++;sfx('kill');const k=EK[e.k],L=REACT[R.react].loot;
  drop('scrap',e.x,e.y,e.g*(1+0.15*lv('gold'))*L*(hasRel('lens')?1.4:1));
  drop('core',e.x,e.y,k.core*Math.pow(1.6,R.ch-1)*L*(hasRel('magnet')?1.35:1));
  if(Math.random()<k.cell){drop('cell',e.x,e.y,R.maxHope*(e.k==='boss'?0.5:0.06));if(!meta.tut.cell)setTimeout(()=>tip('cell','Green <b>energy cells</b> restore HOPE. Kill brutes for a better chance.',false,6),400)}
  const n=e.k==='boss'?50:9;
  for(let i=0;i<n;i++)R.pt.push({x:e.x,y:e.y*K-e.r*.5-(e.fly?22:0),vx:rnd(-110,110),vy:rnd(-140,40),t:rnd(0.3,0.8),c:i%3?e.c:'#9cff5a',s:rnd(2,5),g:260});
  R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:4,r1:e.r*2.2,t:0.25,T:0.25,c:'#9cff5a'});
  if(e.k==='bloater')blast(e.x,e.y,80,e.mhp*0.6,'#d9c24a',e);
  if(e.k==='splitter')for(let i=0;i<2;i++){const m=spawn('skitter','rush');m.x=e.x+rnd(-14,14);m.y=e.y+rnd(-14,14);m.hp=m.mhp=e.mhp*0.25;m.alertT=0.15}
  if(e.k==='boss')bossDown(e);
}
function bossDown(e){
  R.shake=16;flash(0.7);sfx('boom');R.bossKills++;meta.stats.bosses++;
  ach('b'+e.bk);if(R.react===2)ach('over');
  for(const o of R.orbs)o.t=Math.max(o.t,0.35);
  if(R.endless){R.banner={s:BOSSES[e.bk-1].n+' FALLS',t:2};R.boss=null;return}
  if(R.minHopeP>=0.5)ach('calm');
  setTimeout(()=>{if(R&&!R.over)endRun(true)},1600);
}
function spawnBoss(bk){
  const rr=ringR(),b=spawn('boss','wander',bk),a=Math.random()*6.28;b.x=Math.cos(a)*rr*1.5;b.y=Math.sin(a)*rr*1.5;
  R.boss=b;R.shake=12;sfx('boss');R.banner={s:'⚠ '+BOSSES[bk-1].n+' ⚠',sub:BOSSES[bk-1].d,t:2.6};
  if(!R.endless&&!meta.tut.boss)setTimeout(()=>tip('boss','That thing <b>swallowed a part we need</b> to repair the ship. Bring it down!',false,6),300);
}
// boss behaviours (only while charging the ship)
function bossTick(e,dt,d){
  e.ai+=dt;e.spdM=1;
  switch(e.bk){
    case 2: // Brood Mother: births crawlers
      if(e.ai>4){e.ai=0;sfx('roar');R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:10,r1:70,t:.45,T:.45,c:'#7dffb0'});
        for(let i=0;i<3;i++){const m=spawn('crawler','rush');m.x=e.x+rnd(-30,30);m.y=e.y+rnd(-30,30);m.hp=m.mhp=m.mhp*0.6;m.alertT=0.25}}
      break;
    case 3: // Crusher: walk → wind-up → charge → stunned (only vulnerable while stunned)
      if(!e.mode)e.mode='walk';
      if(e.mode==='walk'&&e.ai>5){e.mode='wind';e.ai=0;sfx('roar');addTxt(e.x,e.y*K-e.r*2.6,'!!','#ff3a3a',20)}
      else if(e.mode==='wind'&&e.ai>1){e.mode='charge';e.ai=0}
      else if(e.mode==='charge'&&(e.ai>1.3||d<46+e.r)){e.mode='stun';e.ai=0;R.shake=10;sfx('boom');addTxt(e.x,e.y*K-e.r*2.6,'STUNNED','#ffe14d',15)}
      else if(e.mode==='stun'&&e.ai>3.6){e.mode='walk';e.ai=0}
      e.spdM=e.mode==='wind'||e.mode==='stun'?0:e.mode==='charge'?6:1;e.armor=e.mode==='stun'?1.5:0.5;
      break;
    case 4: // Phantom Warlord: blinks with an escort
      if(e.blink>0)e.blink-=dt;
      if(e.ai>6){e.ai=0;R.fx.push({type:'ring',x:e.x,y:e.y*K,r0:5,r1:55,t:.4,T:.4,c:'#c79bff'});const a=Math.random()*6.28,rr=ringR();
        e.x=Math.cos(a)*rr*0.9;e.y=Math.sin(a)*rr*0.9;e.blink=1.5;sfx('alert');
        for(let i=0;i<2;i++){const m=spawn('phantom','rush');m.x=e.x+rnd(-40,40);m.y=e.y+rnd(-40,40);m.alertT=0.3}}
      break;
    case 5:{ // The Origin: 3 phases
      const ph=e.hp/e.mhp>0.66?1:e.hp/e.mhp>0.33?2:3;
      if(ph!==e.phase){e.phase=ph;if(ph>1){R.banner={s:ph===2?'IT FEEDS ON YOUR LIGHT':'THE ORIGIN IS ENRAGED',t:2};flash(0.4);sfx('boss')}}
      if(e.ai>5){e.ai=0;sfx('roar');const ks=['crawler','skitter','spitter','bloater','wisp','phantom'];
        for(let i=0;i<(ph===3?4:3);i++){const m=spawn(ks[Math.random()*ks.length|0],'rush');m.x=e.x+rnd(-50,50);m.y=e.y+rnd(-50,50);m.alertT=0.3}}
      if(ph===3){e.spdM=1.6;e.ai2=(e.ai2||0)+dt;if(e.ai2>2.5){e.ai2=0;for(let i=-1;i<=1;i++)R.pr.push({k:'acid',x:e.x+i*24,y:e.y,z:34,dmg:e.dmg*0.5})}}
      break}
  }
}
function update(dt){
  R.t+=dt;R.waveT+=dt;meta.stats.time+=dt;const rr=ringR();
  if((R.endless||R.wave<BOSS_WAVE)&&R.waveT>=WAVE_LEN){R.wave++;R.waveT=0;
    R.banner={s:!R.endless&&R.wave===BOSS_WAVE?'⚠ SOMETHING HUGE APPROACHES ⚠':'THREAT '+R.wave,t:1.8};
    if(R.endless){if(R.wave>(meta.bestEndless||0))meta.bestEndless=R.wave;if(R.wave>=20)ach('end20');if(R.wave>=40)ach('end40')}}
  if(!R.endless&&R.wave>=BOSS_WAVE&&!R.bossSpawned){R.bossSpawned=true;spawnBoss(R.ch)}
  if(R.endless&&R.wave%10===0&&R.lastBossWave!==R.wave){R.lastBossWave=R.wave;spawnBoss(((R.wave/10-1)%5)+1)}
  // spawns: wanderers drift toward the ring
  R.spawnT-=dt;
  if(R.spawnT<=0){
    const iv=Math.max(0.2,1.5*Math.pow(0.88,Math.min(R.wave,25)-1))/REACT[R.react].spawn;R.spawnT=R.boss&&!R.boss.dead?iv*1.5:iv;
    spawn(pickKind(),'wander');
  }
  // occasionally an ambient creature loses its way
  R.lureT-=dt;if(R.lureT<=0){R.lureT=rnd(6,12);const a=R.en.filter(e=>e.state==='ambient');if(a.length){const e=a[Math.random()*a.length|0];e.state='wander';e.hd=Math.atan2(-e.y,-e.x)}
    if(a.length<10)spawn(R.ch>1&&R.wave>=3&&Math.random()<.3?SIG[R.ch]:'crawler','ambient')}
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
      if(e.k==='boss')bossTick(e,dt,d);
      if(e.alertT>0){e.alertT-=dt}
      else if(e.k==='spitter'&&d<175){ // hold distance and spit acid
        e.ai-=dt;if(e.ai<=0&&!(e.frz>0)){e.ai=2.2;R.pr.push({k:'acid',x:e.x,y:e.y,z:12,dmg:e.dmg});sfx('mortar')}
      }else{const reach=40+e.r,sp=e.spd*slowM*(e.spdM===undefined?1:e.spdM);
        if(d>reach){vx=-e.x/d*sp;vy=-e.y/d*sp;if(e.fly){const w=Math.sin(R.t*4+e.ph)*sp*0.8;vx+=-e.y/d*w;vy+=e.x/d*w}}
        else if(!(e.frz>0)){
          if(e.k==='bloater'){e.dead=true;blast(e.x,e.y,80,0,'#d9c24a',e);damageHope(e.dmg);continue}
          e.atk-=dt;if(e.atk<=0){e.atk=1;damageHope(e.dmg,e);e.lunge=0.15}}}
    }
    e.x+=vx*dt;e.y+=vy*dt;if(Math.abs(vx)>1)e.face=vx>0?1:-1;e.ph+=dt*(Math.hypot(vx,vy)*0.12+0.5);if(e.lunge>0)e.lunge-=dt;
  }
  // modules
  const as=(1+0.08*lv('aspd'))*(R.overT>0?2:1);
  for(const h of R.mods){
    h.cd=(h.cd||0)-dt*as;h.fl=Math.max(0,(h.fl||0)-dt);
    if(h.t.c==='drone'){droneTick(h,dt,rr);continue}
    if(h.cd>0)continue;
    const tg=threatTarget(h.x,h.y,h.t.range);if(!tg){h.cd=0.1;continue}
    h.cd=1/h.t.rate;h.fl=0.12;const dmg=modDmg(h),col=TYPES[h.t.ty].c,tz=tg.fly?22:0;
    h.aim=Math.atan2(tg.y*K-tg.r*.6-tz-(h.y*K-16),tg.x-h.x);
    const mx=h.x+Math.cos(h.aim)*13,my=h.y*K-16+Math.sin(h.aim)*13;
    if(h.t.c==='lance'){
      sfx('lance');R.fx.push({type:'beam',x:mx,y:my,x2:tg.x,y2:tg.y*K-tg.r*.6-tz,t:0.14,T:0.14,c:col,w:4});
      for(const e of R.en)if(e!==tg&&!e.dead&&Math.hypot(e.x-tg.x,e.y-tg.y)<45)hit(e,dmg*0.5,h.t.ty,false);
      hit(tg,dmg,h.t.ty,true);
    }else if(h.t.c==='rail'){
      sfx('shot');R.pr.push({k:'rail',x:h.x,y:h.y,z:16,px:mx,py:my,tg,lx:tg.x,ly:tg.y,dmg,spd:900,ty:h.t.ty,c:col});
    }else{
      sfx('mortar');const ft=0.7,dd=Math.hypot(tg.x,tg.y)||1,lead=tg.state==='rush'?tg.spd*ft*0.8:0;
      R.pr.push({k:'shell',sx:h.x,sy:h.y,tx:tg.x-tg.x/dd*lead,ty:tg.y-tg.y/dd*lead,t:0,ft,dmg,aoe:h.t.aoe,ty2:h.t.ty,c:col,tg});
    }
  }
  // main heat ray
  R.boltCd-=dt;R.shipFl=Math.max(0,R.shipFl-dt);
  if(R.boltCd<=0){const tg=threatTarget(0,0,Math.max(300,rr*1.05));
    if(tg){R.boltCd=hasRel('trigger')?0.5:1;R.shipFl=0.15;const ex=tg.x,ey=tg.y*K-tg.r*.6-(tg.fly?22:0);R.shipAim=Math.atan2(ey+44,ex);
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
    }else if(p.k==='acid'){
      const d=Math.hypot(p.x,p.y)||1,st=170*dt;p.t=(p.t||0)+dt;
      if(d<44){p.dead=true;damageHope(p.dmg);R.fx.push({type:'boom',x:p.x,y:p.y*K,r:22,t:.3,T:.3,c:'#8cff3a'})}
      else{p.x-=p.x/d*st;p.y-=p.y/d*st}
    }else{
      p.t+=dt/p.ft;
      if(p.t>=1){p.dead=true;sfx('boom');R.shake=Math.min(6,R.shake+1.5);
        for(const e of R.en)if(!e.dead&&Math.hypot(e.x-p.tx,e.y-p.ty)<p.aoe+e.r)hit(e,e.fly?p.dmg*0.5:p.dmg,p.ty2,e===p.tg);
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
  let drain=R.maxHope*0.003*(1-0.06*lv('regen'))*(hasRel('glass')?1.4:1);
  if(R.boss&&!R.boss.dead&&R.boss.bk===5&&R.boss.phase>=2)drain*=2.2;
  const regen=R.syn.Nano>=4?R.maxHope*0.015:0;
  R.hope=Math.min(R.maxHope,R.hope-drain*dt+regen*dt);
  if(!meta.tut.done1&&R.t<55)R.hope=Math.max(R.hope,R.maxHope*0.2); // first run can't be lost while learning
  R.minHopeP=Math.min(R.minHopeP,R.hope/R.maxHope);
  // smoke from engine
  R.smokeT-=dt;if(R.smokeT<=0){R.smokeT=0.09;R.pt.push({x:-52+rnd(-3,3),y:-14,vx:rnd(-8,8),vy:rnd(-40,-25),t:rnd(1.2,2),c:'#555b66',s:rnd(4,7),g:-5,smoke:1})}
  // fx decay
  for(const f of R.fx)f.t-=dt;
  for(const p of R.pt){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(!p.smoke){p.vx*=0.95}else p.s+=dt*5}
  for(const t of R.txt){t.t-=dt;t.y-=32*dt;t.age=(t.age||0)+dt}
  R.en=R.en.filter(e=>!e.dead);R.pr=R.pr.filter(p=>!p.dead);R.fx=R.fx.filter(f=>f.t>0);R.pt=R.pt.filter(p=>p.t>0);R.txt=R.txt.filter(t=>t.t>0);R.orbs=R.orbs.filter(o=>!o.dead);
  if(R.pt.length>500)R.pt.splice(0,R.pt.length-500);
  if(R.banner)R.banner.t-=dt;R.ringPulse=Math.max(0,R.ringPulse-dt*1.5);
  spellTick(dt);autoCastTick(dt);tutorialTick();
  R.achT-=dt;if(R.achT<=0){R.achT=1;achScan()}
  if(R.hope<=0&&!R.over){R.hope=0;R.shake=16;endRun(false)}
}
// drones leave their dock, hunt the most dangerous creature in the ring, and return when idle
function droneTick(h,dt,rr){
  if(h.dx===undefined){h.dx=h.x;h.dy=h.y}
  const tg=threatTarget(0,0,rr*1.15);let gx=h.x,gy=h.y;
  if(tg){const a=R.t*2.5+h.t.id;gx=tg.x+Math.cos(a)*48;gy=tg.y+Math.sin(a)*48}
  const dx=gx-h.dx,dy=gy-h.dy,d=Math.hypot(dx,dy);if(d>2){const sp=Math.min(d,280*dt);h.dx+=dx/d*sp;h.dy+=dy/d*sp}
  if(h.cd>0||!tg)return;
  if(Math.hypot(tg.x-h.dx,tg.y-h.dy)>95){h.cd=0.05;return}
  h.cd=1/h.t.rate;h.fl=0.1;const col=TYPES[h.t.ty].c;
  R.fx.push({type:'beam',x:h.dx,y:h.dy*K-30,x2:tg.x,y2:tg.y*K-tg.r*.6-(tg.fly?22:0),t:0.1,T:0.1,c:col,w:2.5});sfx('shot');
  hit(tg,modDmg(h),h.t.ty,true);
}
function damageHope(v,att){
  R.hope-=v;R.shake=Math.min(9,R.shake+2.5);sfx('hurt');R.fx.push({type:'ring',x:0,y:0,r0:30,r1:70,t:0.25,T:0.25,c:'#ff3a3a'});addTxt(rnd(-20,20),-60,'-'+fmt(v),'#ff5a5a',13);
  if(att&&hasRel('thorns')&&!att.dead){R.fx.push({type:'zap',x:0,y:-20,x2:att.x,y2:att.y*K-att.r*.6,t:.15,T:.15,c:'#ffe14d'});hit(att,25*tierM(R.ch)*(1+0.15*lv('dmg')),'Arc',false)}
}
