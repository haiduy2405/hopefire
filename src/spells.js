"use strict";
// ===== SPELLS 2.0 + OVERDRIVE =====
// Spells come out of salvage crates (after the first crate). Max 3 equipped.
// Tap / Q-W-E to cast. Duplicate spell = level up (stronger + shorter cooldown).
// Every spell is a little show: running effects live in R.sx and are ticked by spellTick / drawn by drawSpellFx.
// OVERDRIVE: a meter that fills with kills; when full, F / the gold button casts ALL equipped spells in a cascade.
const SPELLS=[
  {id:'flare',n:'Solar Flare',g:'☀',c:'#ffb03a',cd:28,d:'Charges up, then a shockwave sweeps the whole screen and burns everything'},
  {id:'nova',n:'Cryo Nova',g:'❄',c:'#5cd0ff',cd:30,d:'A freezing wave locks down every creature on screen. Frozen creatures take +25% damage'},
  {id:'over',n:'Overcharge',g:'⚡',c:'#ffe14d',cd:30,d:'Modules fire 2× faster for ~6s and the ship arcs lightning into the horde'},
  {id:'cell',n:'Emergency Cell',g:'✚',c:'#7dffb0',cd:40,d:'Restores ~20% Hope instantly'},
  {id:'pulse',n:'Shock Pulse',g:'◎',c:'#c79bff',cd:18,d:'Blasts nearby creatures away & stuns them'},
  {id:'hole',n:'Black Hole',g:'●',c:'#9b6bff',cd:32,d:'Drags the horde into one point, then implodes'},
  {id:'meteor',n:'Meteor Storm',g:'☄',c:'#ff6a3a',cd:34,d:'Calls down a rain of meteors on the horde'},
  {id:'storm',n:'Chain Storm',g:'ϟ',c:'#ffe96a',cd:34,d:'A lightning storm strikes again and again, chaining between creatures'},
  {id:'beam',n:'Orbital Laser',g:'✦',c:'#6ff0ff',cd:36,d:'A giant laser sweeps a full circle around the ship'}
];
const MAX_SPELLS=3,SPELL_CHANCE=0.28,ODMAX=100;
const spellPow=s=>RAR[s.r].m*(1+0.5*(s.lv-1));
const spellCd=s=>s.d.cd*Math.pow(0.9,s.lv-1)*(1-0.06*lv('cap'));
const spDmg=(base,p)=>base*p*tierM(R.ch)*(1+0.15*lv('dmg'))*(1+0.04*lv('oc'));
// how long the "what did that spell kill?" window stays open after a cast
const CAST_LEN={flare:2.2,nova:2.2,hole:5.4,meteor:3.6,storm:4.8,beam:4,over:0.8,cell:0.4,pulse:0.8};
function addSpell(cd){
  const ex=R.spells.find(s=>s.d.id===cd.sp.id);
  if(ex){ex.lv++;ex.r=Math.max(ex.r,cd.r);addTxt(0,-80,ex.d.n+' Lv'+ex.lv,ex.d.c,13)}
  else{const s={d:cd.sp,r:cd.r,lv:1,cd:0};
    if(R.spells.length<MAX_SPELLS)R.spells.push(s);
    else{let wi=0;R.spells.forEach((x,i)=>{if(spellPow(x)<spellPow(R.spells[wi]))wi=i});R.spells[wi]=s}}
  renderSpellBar();
  if(!meta.tut.spell)setTimeout(()=>tip('spell','<b>Spell acquired!</b> Tap it (or press '+(PADMODE?'X / Y / B':'Q / W / E')+') to cast. It recharges over time.',false,6),300);
}
// densest clump of creatures (for Black Hole): sample up to ~40 candidates, count neighbours
function densest(rr){
  const L=R.en.filter(e=>!e.dead&&!isHidden(e)&&Math.hypot(e.x,e.y)<rr*1.5);if(!L.length)return null;
  const step=Math.max(1,Math.floor(L.length/40));let best=null,bn=-1;
  for(let i=0;i<L.length;i+=step){const a=L[i];let n=0;for(const b of L)if((a.x-b.x)**2+(a.y-b.y)**2<130*130)n++;if(n>bn){bn=n;best=a}}
  return {x:best.x,y:best.y,n:bn};
}
function randEnemy(rr,mul){
  const L=R.en.filter(e=>!e.dead&&Math.hypot(e.x,e.y)<rr*(mul||1.3));return L.length?L[Math.random()*L.length|0]:null}
function castSpell(i,force){
  const s=R&&R.spells[i];if(!s||(s.cd>0&&!force)||R.paused||R.over||R.tipPause)return;
  audioInit();s.cd=spellCd(s);meta.stats.spells++;const p=spellPow(s),rr=ringR(),id=s.d.id;
  if(!(R.castWin>0))R.castKills=0;R.castWin=Math.max(R.castWin||0,CAST_LEN[id]||1);
  const sx=R.sx||(R.sx=[]);
  switch(id){
    case 'flare':sx.push({k:'wave',t:-0.35,r:0,sp:780,mx:Math.max(950,rr*2.1),dmg:spDmg(38,p),c:'#ffb03a',ty:'Thermal',ch:1,hit:new Set()});sfx('charge');break;
    case 'nova':sx.push({k:'wave',t:-0.25,r:0,sp:900,mx:Math.max(950,rr*2.1),dmg:spDmg(8,p),c:'#5cd0ff',ty:'Cryo',frz:Math.min(8,4*(0.75+0.25*p)),ch:1,hit:new Set()});sfx('charge');break;
    case 'over':R.overT=Math.min(14,6*(0.8+0.2*p));R.arcDmg=spDmg(11,p);
      for(let k=0;k<3;k++)R.fx.push({type:'shock',x:0,y:-20,r:20+k*14,t:0.5+k*0.12,T:0.5+k*0.12,c:'#ffe14d',w:16,grow:150});
      sfx('overcharge');flash(0.2);break;
    case 'cell':R.hope=Math.min(R.maxHope,R.hope+R.maxHope*0.2*Math.min(2.5,0.8+0.2*p));sfx('cell');addTxt(0,-70,'+HOPE','#7dffb0',14);
      for(let k=0;k<2;k++)R.fx.push({type:'shock',x:0,y:-10,r:20,t:0.55+k*0.15,T:0.55+k*0.15,c:'#7dffb0',w:14,grow:130});
      for(let k=0;k<22;k++)R.pt.push({x:rnd(-60,60),y:rnd(-10,30),vx:rnd(-12,12),vy:rnd(-110,-40),t:rnd(.5,1.1),c:'#9dffc4',s:rnd(2,4),g:-30,add:1});break;
    case 'pulse':{const push=110*Math.min(2,0.8+0.2*p);
      for(const e of R.en){if(e.dead)continue;const d=Math.hypot(e.x,e.y)||1;if(d<150){const f=e.k==='boss'?0.25:1;e.x+=e.x/d*push*f;e.y+=e.y/d*push*f;if(e.state==='rush')e.alertT=Math.max(e.alertT,0.9*f)}}
      R.fx.push({type:'shock',x:0,y:0,r:20,t:0.5,T:0.5,c:'#c79bff',w:18,grow:300});sfx('boom');R.shake=6;break}
    case 'hole':{const t=densest(rr)||{x:Math.cos(Math.random()*6.28)*rr*0.6,y:Math.sin(Math.random()*6.28)*rr*0.6,n:0};
      sx.push({k:'hole',x:t.x,y:t.y,t:0,dur:Math.min(6,3.6+0.4*p),r:250+20*p,dmg:spDmg(5,p),boom:spDmg(75,p),tk:0});sfx('hole');R.shake=5;break}
    case 'meteor':sx.push({k:'met',t:0,dur:2.4+0.2*p,n:Math.round(12+3*p),made:0,dmg:spDmg(52,p)});sfx('rumble');break;
    case 'storm':sx.push({k:'storm',t:0,dur:3.6+0.3*p,tk:0,dmg:spDmg(15,p)});sfx('thunder');flash(0.15);break;
    case 'beam':sx.push({k:'beam',t:0,dur:3,a:R.aimT>0?R.aimA:rnd(0,6.28),dir:Math.random()<.5?1:-1,tk:0,dmg:spDmg(8,p)});sfx('laser');R.shake=4;break;
  }
  R.banner={s:s.d.n.toUpperCase()+'!',t:0.9};renderSpellBar();
}
// ---- running effects ----
function lineHits(ox,oy,a,L,w,fn){
  const ca=Math.cos(a),sa=Math.sin(a);
  for(const e of R.en){if(e.dead||isHidden(e))continue;
    const px=e.x-ox,py=e.y*K-e.r*.6-(e.fly?22:0)-oy,t=px*ca+py*sa;if(t<0||t>L)continue;
    if(Math.abs(-px*sa+py*ca)<e.r+w)fn(e,t)}
}
function spellTick(dt){
  const cdm=R.odT>0?3:1;
  for(const s of R.spells)if(s.cd>0)s.cd=Math.max(0,s.cd-dt*cdm);
  if(R.overT>0){R.overT-=dt;R.arcT=(R.arcT||0)-dt;
    if(R.arcT<=0&&R.arcDmg){R.arcT=0.2;const rr=ringR(),tg=randEnemy(rr,1.1);
      if(tg&&R.mods.length){const h=R.mods[Math.random()*R.mods.length|0],hx=h.dx!==undefined?h.dx:h.x,hy=(h.dx!==undefined?h.dy:h.y)*K-16;
        R.fx.push({type:'zap',x:hx,y:hy,x2:tg.x,y2:tg.y*K-tg.r*.6,t:.14,T:.14,c:'#ffe96a'});hit(tg,R.arcDmg,'Arc',false);
        const o=randEnemy(rr,1.1);if(o&&o!==tg&&Math.hypot(o.x-tg.x,o.y-tg.y)<140){R.fx.push({type:'zap',x:tg.x,y:tg.y*K-tg.r*.6,x2:o.x,y2:o.y*K-o.r*.6,t:.12,T:.12,c:'#fff3a0'});hit(o,R.arcDmg*0.6,'Arc',false)}}}}
  if(R.odT>0){R.odT-=dt;if(R.odT<=0)document.body.classList.remove('od')}
  if(R.sx&&R.sx.length){
    const rr=ringR();
    for(const o of R.sx){o.t+=dt;
      if(o.k==='delay'){if(o.t>=0){o.done=1;const s=R.spells[o.i];if(s)castSpell(o.i,true);if(o.tmp){R.spells=R.spells.filter(x=>!x.tmp);renderSpellBar()}}}
      else if(o.k==='wave'){
        if(o.t<0){if(R.pt.length<480&&Math.random()<0.7)R.pt.push({x:rnd(-90,90),y:rnd(-110,20),vx:-0,vy:rnd(-30,-90),t:rnd(.2,.4),c:o.c,s:rnd(2,4),g:0,add:1});continue}
        if(!o.go){o.go=1;flash(o.ty==='Cryo'?0.45:0.6);R.hs=Math.max(R.hs||0,0.07);R.shake=Math.max(R.shake,o.ty==='Cryo'?8:14);sfx(o.ty==='Cryo'?'cryowave':'sunwave')}
        const r0=o.r;o.r+=o.sp*dt;
        for(const e of R.en){if(e.dead||o.hit.has(e))continue;const d=Math.hypot(e.x,e.y);if(d>o.r)continue;o.hit.add(e);
          if(o.frz){e.frz=e.k==='boss'?o.frz*0.4:o.frz;e.slow=Math.max(e.slow,e.frz);e.vuln=Math.max(e.vuln||0,o.frz);
            if(R.pt.length<480)for(let q=0;q<4;q++)R.pt.push({x:e.x,y:e.y*K-e.r*.6,vx:rnd(-90,90),vy:rnd(-110,20),t:rnd(.3,.7),c:'#bff0ff',s:rnd(2,4),g:240,add:1})}
          else if(R.pt.length<480)for(let q=0;q<5;q++)R.pt.push({x:e.x,y:e.y*K-e.r*.6,vx:rnd(-120,120),vy:rnd(-160,-20),t:rnd(.25,.6),c:q%2?'#ffd27a':'#ff7a3a',s:rnd(2,5),g:200,add:1});
          hit(e,o.dmg,o.ty,false)}
        if(o.r>=o.mx)o.done=1;
      }
      else if(o.k==='hole'){
        if(o.t===dt)R.shake=Math.max(R.shake,3);
        for(const e of R.en){if(e.dead)continue;const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy)||1;if(d>o.r)continue;
          const f=e.k==='boss'?0.2:1,pull=(60+260*(1-d/o.r))*f*dt*(0.5+Math.min(1,o.t/1.2));if(d>8){e.x+=dx/d*Math.min(pull,d);e.y+=dy/d*Math.min(pull,d)}if(e.state==='rush')e.alertT=Math.max(e.alertT||0,0.6)}
        o.tk-=dt;if(o.tk<=0){o.tk=0.3;for(const e of R.en)if(!e.dead&&Math.hypot(e.x-o.x,e.y-o.y)<o.r*0.7)hit(e,o.dmg,'Arc',false)}
        if(o.t>=o.dur){o.done=1;sfx('holeboom');flash(0.7);R.hs=Math.max(R.hs||0,0.1);R.shake=Math.max(R.shake,16);R.slow=Math.max(R.slow||0,0.5);
          const br=150+8*Math.min(10,R.spells.length*3);
          for(const e of R.en)if(!e.dead&&Math.hypot(e.x-o.x,e.y-o.y)<br+e.r)hit(e,o.boom,'Arc',false);
          R.fx.push({type:'boom',x:o.x,y:o.y*K,r:br,t:0.6,T:0.6,c:'#c79bff'});
          for(let k=0;k<3;k++)R.fx.push({type:'shock',x:o.x,y:o.y*K,r:10,t:0.5+k*0.1,T:0.5+k*0.1,c:k%2?'#ffffff':'#9b6bff',w:18,grow:380});
          for(let k=0;k<60&&R.pt.length<520;k++){const a=rnd(0,6.28),v=rnd(80,420);R.pt.push({x:o.x,y:o.y*K,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:rnd(.4,.9),c:k%2?'#d8b8ff':'#fff',s:rnd(2,5),g:0,add:1})}}
      }
      else if(o.k==='met'){
        o.tk=(o.tk||0)-dt;
        while(o.made<o.n&&o.tk<=0){o.tk+=o.dur/o.n;o.made++;
          const tg=randEnemy(rr,1.35),a=rnd(0,6.28),d=rnd(0,rr*0.9),x=tg?tg.x+rnd(-18,18):Math.cos(a)*d,y=tg?tg.y+rnd(-18,18):Math.sin(a)*d;
          (R.mets||(R.mets=[])).push({x,y,t:0,w:0.55,dmg:o.dmg})}
        if(o.t>=o.dur&&o.made>=o.n)o.done=1;
      }
      else if(o.k==='storm'){
        o.tk-=dt;
        while(o.tk<=0&&o.t<o.dur){o.tk+=0.085;const tg=randEnemy(rr,1.25);if(!tg)break;
          const tx=tg.x,ty=tg.y*K-tg.r*.6;
          R.fx.push({type:'zap',x:tx+rnd(-30,30),y:ty-340,x2:tx,y2:ty,t:.18,T:.18,c:'#fff7b0'});R.fx.push({type:'spark',x:tx,y:ty,t:0.18,T:0.18,c:'#ffe96a'});
          hit(tg,o.dmg,'Arc',false);sfx('zapstrike');
          let from=tg;const used=new Set([tg]);
          for(let h=0;h<3;h++){let nx=null,bd=130*130;for(const e of R.en){if(e.dead||used.has(e))continue;const q=(e.x-from.x)**2+(e.y-from.y)**2;if(q<bd){bd=q;nx=e}}
            if(!nx)break;used.add(nx);R.fx.push({type:'zap',x:from.x,y:from.y*K-from.r*.6,x2:nx.x,y2:nx.y*K-nx.r*.6,t:.14,T:.14,c:'#ffe14d'});hit(nx,o.dmg*(0.7-h*0.15),'Arc',false);from=nx}
          R.shake=Math.max(R.shake,2)}
        if(o.t>=o.dur)o.done=1;
      }
      else if(o.k==='beam'){
        o.a+=o.dir*2.25*dt;o.tk-=dt;
        if(o.tk<=0){o.tk=0.06;lineHits(0,-44,o.a,1000,20,e=>{hit(e,o.dmg,'Thermal',false);
          if(R.pt.length<480&&Math.random()<0.5)R.pt.push({x:e.x,y:e.y*K-e.r*.6,vx:rnd(-90,90),vy:rnd(-130,-10),t:rnd(.2,.5),c:'#9ffcff',s:rnd(2,4),g:160,add:1})})}
        R.shipAim=o.a;R.shipFl=0.1;R.shake=Math.max(R.shake,2.5);
        if(o.t>=o.dur)o.done=1;
      }
    }
    R.sx=R.sx.filter(o=>!o.done);
    // meteors
    if(R.mets){for(const m of R.mets){m.t+=dt;if(m.t>=m.w&&!m.done){m.done=1;
        for(const e of R.en)if(!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<72+e.r)hit(e,m.dmg,'Thermal',false);
        R.fx.push({type:'boom',x:m.x,y:m.y*K,r:78,t:0.4,T:0.4,c:'#ff7a3a'});R.fx.push({type:'shock',x:m.x,y:m.y*K,r:8,t:0.3,T:0.3,c:'#fff0b0',w:10,grow:200});
        for(let k=0;k<14&&R.pt.length<520;k++)R.pt.push({x:m.x,y:m.y*K,vx:rnd(-190,190),vy:rnd(-250,-30),t:rnd(.3,.7),c:k%2?'#ffb03a':'#ff5a2a',s:rnd(2,5),g:320,add:1});
        sfx('meteorhit');R.shake=Math.max(R.shake,5)}}
      R.mets=R.mets.filter(m=>!m.done)}
  }
  // "what did that cast kill?" report
  if(R.castWin>0){R.castWin-=dt;if(R.castWin<=0){R.castWin=0;castReport()}}
}
function castReport(){
  const n=R.castKills||0;R.castKills=0;if(n<8)return;
  const tier=n>=40?3:n>=20?2:1,word=['MASSACRE','ANNIHILATION','APOCALYPSE'][tier-1],bonus=Math.round(n*(1+tier)*(1+0.15*lv('gold')));
  R.gold+=bonus;R.banner={s:word+' ×'+n,sub:'+'+bonus+' scrap',t:1.8,big:tier};R.od=Math.min(ODMAX,(R.od||0)+n*0.25);
  sfx(tier>=2?'starup':'streak');flash(0.12*tier);R.shake=Math.max(R.shake,4+tier*3);
  for(let k=0;k<n&&k<24;k++)setTimeout(()=>{if(R&&!R.over)drop('scrap',rnd(-40,40),rnd(-30,10),bonus/Math.min(n,24))},k*25);
}
// ---- OVERDRIVE meter ----
const KILL_MILESTONES=[100,250,500,1000,2000,5000];
function killFx(e){
  if(R.castWin>0)R.castKills=(R.castKills||0)+1;
  const add=e.k==='boss'?30:e.elite?4:e.k==='carrier'?4:e.mhp>60*tierM(R.ch)*3?1.4:0.7;
  if(!(R.odT>0)&&(R.od||0)<ODMAX){R.od=Math.min(ODMAX,(R.od||0)+add);if(R.od>=ODMAX){sfx('odready');R.banner={s:'OVERDRIVE READY',sub:'Press F',t:1.6};odHint()}}
  if(KILL_MILESTONES.includes(R.kills)){R.fx.push({type:'shock',x:0,y:-20,r:30,t:0.6,T:0.6,c:'#ffd24a',w:12,grow:420});R.banner={s:'★ '+R.kills+' KILLS ★',t:1.3};sfx('streak')}
}
function odHint(){if(meta.tut.od)return;meta.tut.od=1;save();setTimeout(()=>tip('od','<b>OVERDRIVE ready!</b> Kills fill the gold meter. Press <b>'+(PADMODE?'R-stick click':'F')+'</b> or tap the gold button to unleash ALL your spells at once.',false,8),600)}
function castOverdrive(){
  if(!R||R.over||R.paused||R.tipPause||R.userPause||R.dying||(R.od||0)<ODMAX)return;
  audioInit();R.od=0;R.odT=7;R.overT=Math.max(R.overT||0,7);R.arcDmg=R.arcDmg||spDmg(11,1);meta.stats.od=(meta.stats.od||0)+1;
  R.banner={s:'★ OVERDRIVE ★',sub:'Everything. At once.',t:2.2};flash(0.85);R.hs=0.14;R.slow=1.0;R.shake=18;sfx('overdrive');document.body.classList.add('od');
  for(let k=0;k<4;k++)R.fx.push({type:'shock',x:0,y:-20,r:20,t:0.6+k*0.15,T:0.6+k*0.15,c:k%2?'#ffffff':'#ffb03a',w:20,grow:520});
  const sx=R.sx||(R.sx=[]);
  if(R.spells.length)R.spells.forEach((s,i)=>{sx.push({k:'delay',t:-(0.45+i*0.6),i})});
  else{R.spells=[{d:SPELLS[0],r:1,lv:1,cd:0,tmp:1}];sx.push({k:'delay',t:-0.45,i:0,tmp:1})}
  renderSpellBar();
}
// ---- HUD ----
function renderSpellBar(){
  const bar=$('spellBar');if(!R){bar.innerHTML='';bar.style.display='none';return}
  bar.style.display='flex';
  bar.innerHTML=R.spells.map((s,i)=>`<button class="spell" data-i="${i}" style="border-color:${RAR[s.r].c};color:${s.d.c}" title="${s.d.n}: ${s.d.d}">
    <span class="sg">${ico('sp_'+s.d.id,2,0,s.d.g)}</span><span class="sl" data-k="${i}">${spKey(i)} · Lv${s.lv}</span><span class="cdov"></span></button>`).join('')
    +`<button class="odBtn" id="odBtn" title="Overdrive: casts all your spells at once"><span class="odi">★</span><span class="odl">${PADMODE?'R3':'F'}</span></button>`;
  if(lv('auto'))bar.innerHTML+=`<button class="autoBtn ${meta.autoCast?'on':''}" id="autoBtn">AUTO<br>${meta.autoCast?'ON':'OFF'}</button>`;
  bar.querySelectorAll('.spell').forEach(b=>b.onclick=()=>castSpell(+b.dataset.i));
  $('odBtn').onclick=castOverdrive;
  const ab=$('autoBtn');if(ab)ab.onclick=()=>{meta.autoCast=!meta.autoCast;save();sfx('click');renderSpellBar()};
}
function spellHud(){
  if(!R)return;const bar=$('spellBar'),bs=bar.querySelectorAll('.spell');
  R.spells.forEach((s,i)=>{const b=bs[i];if(!b)return;const f=s.cd>0?s.cd/spellCd(s):0;b.querySelector('.cdov').style.height=(f*100)+'%';b.classList.toggle('ready',f===0)});
  const ob=$('odBtn');if(ob){const p=Math.min(1,(R.od||0)/ODMAX);ob.style.setProperty('--p',(p*360)+'deg');ob.classList.toggle('ready',p>=1&&!(R.odT>0));ob.classList.toggle('on',R.odT>0)}
}
// ---- drawing (world space, called from render after the entities) ----
function shockFx(f){ // 'shock' fx: thick additive ring that grows
  const a=Math.max(0,f.t/f.T),k=1-a,r=f.r+(f.grow||200)*k;ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.strokeStyle=f.c;ctx.globalAlpha=FXK*a*0.5;ctx.lineWidth=(f.w||14)*a+2;ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*K,0,0,7);ctx.stroke();
  ctx.globalAlpha=FXK*a*0.9;ctx.lineWidth=Math.max(1,(f.w||14)*0.3*a);ctx.strokeStyle='#fff';ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*K,0,0,7);ctx.stroke();ctx.restore();
}
function drawSpellFx(T){
  if(!R)return;
  if(R.mets&&R.mets.length){ctx.save();ctx.globalCompositeOperation='lighter';
    for(const m of R.mets){const q=Math.min(1,m.t/m.w),gy=m.y*K,sy=gy-560,sx=m.x+190;const px=sx+(m.x-sx)*q,py=sy+(gy-sy)*q;
      ctx.globalAlpha=0.35+0.3*q;ctx.strokeStyle='#ff4a2a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,gy,78*(1.25-0.25*q),78*(1.25-0.25*q)*K,0,0,7);ctx.stroke();
      ctx.globalAlpha=0.12+0.2*q;ctx.fillStyle='#ff4a2a';ctx.beginPath();ctx.ellipse(m.x,gy,78*q,78*q*K,0,0,7);ctx.fill();
      ctx.globalAlpha=0.7;ctx.strokeStyle='#ffb03a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(sx-px)*0.22,py+(sy-py)*0.22);ctx.stroke();
      ctx.strokeStyle='#fff2c0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(sx-px)*0.1,py+(sy-py)*0.1);ctx.stroke();
      glowDot(px,py,16,'#ff7a3a',1);lightsFrame.push([px,py,70]);lightsFrame.push([m.x,gy,60+60*q])}
    ctx.restore()}
  if(!R.sx||!R.sx.length)return;
  for(const o of R.sx){
    if(o.k==='wave'){
      ctx.save();ctx.globalCompositeOperation='lighter';
      if(o.t<0){const c=(o.t+(o.ty==='Cryo'?0.25:0.35))/(o.ty==='Cryo'?0.25:0.35);glowDot(0,-30,26+70*c,o.c,0.6+0.4*c);
        ctx.strokeStyle=o.c;ctx.globalAlpha=0.6;ctx.lineWidth=2;const rr=160*(1-c)+18;ctx.beginPath();ctx.ellipse(0,-20,rr,rr*K,0,0,7);ctx.stroke();lightsFrame.push([0,-30,120+160*c])}
      else{const r=o.r,fade=Math.max(0.15,1-r/o.mx);
        for(let w=0;w<3;w++){const rr=r-w*22;if(rr<4)continue;ctx.globalAlpha=(0.55-w*0.17)*fade*FXK;ctx.strokeStyle=w?o.c:'#fff7e0';ctx.lineWidth=w?26-w*7:8;ctx.beginPath();ctx.ellipse(0,0,rr,rr*K,0,0,7);ctx.stroke()}
        const n=16;for(let i=0;i<n;i++){const a=i/n*6.283;lightsFrame.push([Math.cos(a)*r,Math.sin(a)*r*K,150])}}
      ctx.restore()}
    else if(o.k==='hole'){
      const X=o.x,Y=o.y*K,q=Math.min(1,o.t/0.5),R0=(34+16*Math.sin(T*9))*q*(o.t>o.dur-0.5?(1+(o.t-(o.dur-0.5))*3):1);
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<3;i++){ctx.strokeStyle=i%2?'#c79bff':'#7a4bff';ctx.globalAlpha=0.5*q;ctx.lineWidth=3;ctx.beginPath();const rr=o.r*0.5*(((T*0.7+i/3)%1));ctx.ellipse(X,Y,rr,rr*K,0,0,7);ctx.globalAlpha=0.55*q*(1-rr/(o.r*0.5));ctx.stroke()}
      ctx.restore();
      ctx.save();ctx.globalAlpha=0.95*q;const g=ctx.createRadialGradient(X,Y,0,X,Y,R0*1.6);g.addColorStop(0,'#000');g.addColorStop(0.6,'#0a0014');g.addColorStop(1,'rgba(90,40,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,R0*1.6,0,7);ctx.fill();
      ctx.strokeStyle='#e4ccff';ctx.lineWidth=2;ctx.globalAlpha=0.9*q;ctx.beginPath();ctx.ellipse(X,Y,R0*1.05,R0*1.05*K+3,0,0,7);ctx.stroke();ctx.restore();
      lightsFrame.push([X,Y,o.r*0.8])}
    else if(o.k==='beam'){
      const ca=Math.cos(o.a),sa=Math.sin(o.a),ox=ca*20,oy=-44+sa*20,L=1000,ex=ox+ca*L,ey=oy+sa*L,fade=Math.min(1,o.t*6,(o.dur-o.t)*4);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
      const g=ctx.createLinearGradient(ox,oy,ex,ey);g.addColorStop(0,'#ffffff');g.addColorStop(0.5,'#6ff0ff');g.addColorStop(1,'rgba(60,160,255,0)');
      ctx.strokeStyle=g;ctx.globalAlpha=0.28*fade;ctx.lineWidth=58;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();
      ctx.globalAlpha=0.55*fade;ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();
      ctx.globalAlpha=fade;ctx.strokeStyle='#fff';ctx.lineWidth=7+Math.sin(T*50)*1.5;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();
      glowDot(ox,oy,34,'#6ff0ff',fade);ctx.restore();
      for(let d=100;d<=900;d+=130)lightsFrame.push([ox+ca*d,oy+sa*d,110])}
  }
}
// autocast helper uses this
function spellKey(id){return R.spells.findIndex(s=>s.d.id===id)}
