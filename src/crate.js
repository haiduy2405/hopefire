"use strict";
// ===== SALVAGE CRATE 2.0 =====
// Opening ceremony (rarity tell, staggered card flips), build bar with live preview,
// per-card team-DPS delta + synergy activate/break badges (TFT-style shop highlights),
// and an element info popover reachable from crate cards, the build bar and in-game chips.
// Loaded before ui.js (ui.js binds the OPEN CRATE button to openPack).

const ELEM_INFO={
  Thermal:{t2:'+25% damage for every Thermal module',t4:'Hits set creatures ablaze: 40% of the hit burns again over 3 s',tip:'Heavy single hits. Best vs Brutes and bosses.'},
  Cryo:{t2:'+25% damage for every Cryo module',t4:'Every hit slows creatures by 40%',tip:'Fast fire + chill. Buys time when the ring floods.'},
  Arc:{t2:'+25% damage for every Arc module',t4:'Hits chain lightning to 2 nearby creatures (50% damage)',tip:'Great vs swarms of Crawlers and Skitters.'},
  Nano:{t2:'+25% damage for every Nano module',t4:'Ship regenerates 1.5% Hope every second',tip:'Survival. Hits refill Hope; pairs well with Overdrive.'}
};
const SYN_T=[2,4];
const synTier=n=>n>=4?2:n>=2?1:0;
function synOf(mods){const s={};for(const h of mods)s[h.t.ty]=(s[h.t.ty]||0)+1;return s}
// DPS of one module with the build's synergies (global multipliers left out: same for every option)
function modPow(h,syn){const m=TYPE_MOD[h.t.ty];return h.t.dmg*h.t.rate*m.dmg*m.rate*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier)*((syn[h.t.ty]||0)>=2?1.25:1)}
function teamDps(mods){const s=synOf(mods);return mods.reduce((a,h)=>a+modPow(h,s),0)*(1+0.15*lv('dmg'))}
// what the build would look like after taking module card cd (mirrors pick())
function previewPick(cd){
  const mods=R.mods.map(h=>({t:h.t,r:h.r,s:h.s,tier:h.tier}));const ex=mods.find(x=>x.t.id===cd.t.id);let kind,rep=null;
  if(ex){ex.s++;ex.r=Math.max(ex.r,cd.r);ex.tier=Math.max(ex.tier,R.ch);kind='star'}
  else if(mods.length<R.slots){mods.push({t:cd.t,r:cd.r,s:1,tier:R.ch});kind='new'}
  else{let wi=0;mods.forEach((h,j)=>{if(power(h)<power(mods[wi]))wi=j});rep=mods[wi];mods[wi]={t:cd.t,r:cd.r,s:1,tier:R.ch};kind='replace'}
  const s0=synOf(R.mods),s1=synOf(mods),d0=teamDps(R.mods),d1=teamDps(mods);
  const up=[],down=[];for(const k in TYPES){const a=synTier(s0[k]||0),b=synTier(s1[k]||0);if(b>a)up.push([k,b]);if(b<a)down.push([k,a])}
  return{mods,kind,rep,ex,s0,s1,d0,d1,up,down,pct:d0>0?(d1-d0)/d0:1};
}

// ---------- shared bits ----------
function pips(k,n,prev){ // 4 pips, thresholds at 2 and 4; prev = count before (new pips glow)
  let h='';for(let i=1;i<=4;i++){const on=i<=n,nw=on&&prev!==undefined&&i>prev;h+=`<i class="pip${on?' on':''}${nw?' nw':''}${i===2||i===4?' th':''}" style="--ec:${TYPES[k].c}"></i>`}return h;
}
function elemBadge(k,extra){return `<span class="eb" data-el="${k}" style="--ec:${TYPES[k].c}">${k.toUpperCase()}${extra||''}<b class="einf">i</b></span>`}

// ---------- element info popover ----------
function elemInfo(k){
  const old=$('einfo');if(old)old.remove();
  const I=ELEM_INFO[k],c=TYPES[k].c,n=R?(synOf(R.mods)[k]||0):0;
  const list=MODS.filter(m=>m.ty===k).map(m=>{const own=R&&R.mods.find(h=>h.t.id===m.id);
    return `<div class="eim${own?' own':''}">${ico('c_'+m.c+'_'+k,2,0,m.g)}<span>${m.n}</span><small>${CLS[m.c].d}</small>${own?`<em>★${own.s}</em>`:''}</div>`}).join('');
  const d=document.createElement('div');d.id='einfo';
  d.innerHTML=`<div class="eipanel" style="--ec:${c}">
    <div class="eihead">${elemBadge(k)}<span class="eicnt">${R?`You have <b>${n}</b>`:''}</span></div>
    <div class="eirow"><span class="eik">ALWAYS</span>${TYPE_MOD[k].d}</div>
    <div class="eirow ${n>=2?'act':''}"><span class="eik">2 ${pips(k,2)}</span>${I.t2}</div>
    <div class="eirow ${n>=4?'act':''}"><span class="eik">4 ${pips(k,4)}</span>${I.t4}</div>
    <div class="eitip">${I.tip}</div>
    <div class="eirx"><span class="eik">REACTIONS</span>${Object.entries(RX).filter(([key])=>key.includes(ELEM_ST[k])||key==='nano').map(([,r])=>`<div><b style="color:${r.c}">${r.n}</b> ${r.d}</div>`).join('')}</div>
    <div class="eilist">${list}</div>
    <div class="eiclose">tap anywhere to close</div></div>`;
  const wasPaused=R&&!R.paused&&!R.over;if(wasPaused)R.paused=true;
  d.onclick=e=>{e.stopPropagation();d.remove();if(wasPaused&&R)R.paused=false;sfx('click')};
  document.body.appendChild(d);sfx('click');
}
function bindElemBadges(root){root.querySelectorAll('[data-el]').forEach(b=>b.onclick=e=>{e.stopPropagation();elemInfo(b.dataset.el)})}

// ---------- build bar (top of the choose screen) ----------
function buildBarHTML(pv){
  const s0=synOf(R.mods),s1=pv?pv.s1:s0,d0=teamDps(R.mods),d1=pv?pv.d1:d0;
  const mods=pv?pv.mods:R.mods;
  let el='';for(const k in TYPES){const a=s0[k]||0,b=s1[k]||0;if(!a&&!b)continue;const t=synTier(b);
    el+=`<span class="bel${t?' t'+t:''}${b!==a?' chg':''}" data-el="${k}" style="--ec:${TYPES[k].c}"><b>${k}</b>${pips(k,b,pv?a:undefined)}</span>`}
  if(!el)el='<span class="bempty">No modules yet — 2 of one element = synergy</span>';
  const slots=Array.from({length:R.slots},(_,i)=>{const h=mods[i];return `<span class="bslot${h?'':' empty'}">${h?ico('c_'+h.t.c+'_'+h.t.ty,1,0,h.t.g)+(h.s>1?`<sup>★${h.s}</sup>`:''):''}</span>`}).join('');
  const dd=pv?`<span class="bd ${d1>=d0?'up':'dn'}">→ ${fmt(d1)}</span>`:'';
  return `<div class="bslots">${slots}</div><div class="bels">${el}</div><div class="bdps">TEAM DPS <b>${fmt(d0)}</b>${dd}</div>`;
}
function renderBuildBar(pv){const b=$('buildBar');if(!b)return;b.innerHTML=buildBarHTML(pv);bindElemBadges(b)}

// ---------- cards ----------
function moduleCardHTML(cd,i,best){
  const pv=previewPick(cd),k=cd.t.ty,c=TYPES[k].c,n0=pv.s0[k]||0,n1=pv.s1[k]||0;
  let tag;
  if(pv.kind==='star')tag=`<span class="tg" style="background:#ffd24a">★${pv.ex.s-1} → ★${pv.ex.s} UPGRADE</span>`;
  else if(pv.kind==='replace')tag=`<span class="tg" style="background:#ff5a5a">Replaces ${pv.rep.t.n}</span>`;
  else tag=`<span class="tg" style="background:#7dffb0">New module</span>`;
  const syn=pv.up.length?pv.up.map(([e,t])=>`<div class="sact" style="--ec:${TYPES[e].c}">✦ ${e.toUpperCase()} ${SYN_T[t-1]} ACTIVATES</div>`).join('')
    :(n1>n0&&n1<4?`<div class="sprog">${n1}/${n1<2?2:4} to next ${k} bonus</div>`:'');
  const have=haveElems(),newRx=[...buildReactions([...have,k])].filter(n=>!buildReactions(have).has(n));
  const rxl=newRx.length?`<div class="rxu">${newRx.map(n=>{const r=Object.values(RX).find(x=>x.n===n);return `<span style="--rc2:${r.c}" title="${r.d}">⚡ ${n}</span>`}).join('')}</div>`:'';
  const brk=pv.down.map(([e,t])=>`<div class="sbrk">⚠ breaks ${e} ${SYN_T[t-1]}</div>`).join('');
  const p=pv.pct,dl=`<div class="dps ${p>=0?'up':'dn'}">${p>=0?'▲':'▼'} TEAM DPS ${p>=0?'+':''}${Math.round(p*100)}%</div>`;
  const st=`${fmt(cd.t.dmg*TYPE_MOD[k].dmg*RAR[cd.r].m*tierM(R.ch))} dmg · ${(cd.t.rate*TYPE_MOD[k].rate).toFixed(1)}/s · ${cd.t.c==='drone'?'anywhere':cd.t.range+' range'}${cd.t.aoe?' · area':''}`;
  return `<div class="card r${cd.r}${best?' best':''}${pv.up.length?' synup':''}" style="--rc:${RAR[cd.r].c};border-color:${RAR[cd.r].c}" data-i="${i}">
    ${best?'<div class="bestrib">BEST DPS</div>':''}
    <div class="rn" style="color:${RAR[cd.r].c}">${RAR[cd.r].n}</div>
    <div class="erow">${elemBadge(k)}<span class="pp">${pips(k,n1,n0)}</span></div>
    <div class="gl" style="background:${c}1c">${ico('mod_'+k,1.3,0,'')}<span class="clsb">${ico('c_'+cd.t.c+'_'+k,1,0,cd.t.g)}</span></div>
    <div class="nm">${cd.t.n}</div>
    <div class="ds" style="color:${c}">${TYPE_MOD[k].d}</div>
    <div class="ds st">${st}</div>
    ${syn}${rxl}${brk}${dl}${tag}</div>`;
}
function spellCardHTML(cd,i){
  const ex=R.spells.find(s=>s.d.id===cd.sp.id);
  let tag;if(ex)tag=`<span class="tg" style="background:#ffd24a">Lv${ex.lv} → Lv${ex.lv+1}</span>`;
  else if(R.spells.length>=MAX_SPELLS){const w=R.spells.reduce((a,b)=>spellPow(b)<spellPow(a)?b:a);tag=`<span class="tg" style="background:#ff5a5a">Replaces ${w.d.n}</span>`}
  else tag=`<span class="tg" style="background:#c79bff">New spell · ${spKey(R.spells.length)}</span>`;
  const cd0=ex?spellCd(ex):cd.sp.cd*(1-0.06*lv('cap')),cd1=ex?spellCd({d:cd.sp,lv:ex.lv+1}):cd0;
  return `<div class="card r${cd.r} spellcard" style="--rc:${RAR[cd.r].c};border-color:${RAR[cd.r].c}" data-i="${i}">
    <div class="rn" style="color:${RAR[cd.r].c}">${RAR[cd.r].n} · SPELL</div>
    <div class="gl" style="background:${cd.sp.c}22;border-radius:50%">${ico('sp_'+cd.sp.id,3,0,cd.sp.g)}</div>
    <div class="nm">${cd.sp.n}</div><div class="ds">${cd.sp.d}</div>
    <div class="ds st">Cooldown ${Math.round(cd0)}s${ex?` → ${Math.round(cd1)}s · power +50%`:''} · tap or ${spKey(ex?R.spells.indexOf(ex):Math.min(R.spells.length,2))}</div>${tag}</div>`;
}

// ---------- ceremony ----------
let curCards=null,crateBusy=false;
function rollCrate(){
  const n=(hasRel('echo')?4:3)+lv('crate5'),taken=[];
  const roll=()=>{
    const armed=R.mods.length>=2;
    if(armed&&meta.tut.mod&&canRollRelic()&&Math.random()<RELIC_CHANCE){const rl=rollRelic(taken);if(rl){taken.push(rl.id);return{rl,r:3}}}
    if(Math.random()<crewChance())return rollCrewCard();
    return armed&&meta.tut.mod&&Math.random()<SPELL_CHANCE?{sp:SPELLS[Math.random()*SPELLS.length|0],r:rollR()}:{t:MODS[Math.random()*MODS.length|0],r:rollR()}};
  const key=c=>c.cr?'c'+c.cr:c.rl?'r'+c.rl.id:c.sp?'s'+c.sp.id:'m'+c.t.id;
  const out=[],seen=new Set();
  for(let tries=0;out.length<n&&tries<60;tries++){const c=roll();if(seen.has(key(c)))continue;seen.add(key(c));out.push(c)}
  if(!meta.tut.mod)out.forEach(c=>{if(c.sp||c.rl){delete c.rl;c.t=MODS[Math.random()*MODS.length|0];delete c.sp}});
  if(!meta.tut.mod)out[1].r=Math.max(1,out[1].r);
  if(meta.runs===0&&R.mods.length===1&&out.every(c=>!c.t||c.t.ty!==R.mods[0].t.ty)){
    const mate=MODS.filter(m=>m.ty===R.mods[0].t.ty&&m.id!==R.mods[0].t.id&&m.c!=='drone');const i=out.findIndex(c=>c.t);
    if(mate.length&&i>=0)out[i]={t:mate[Math.random()*mate.length|0],r:Math.max(1,out[i].r)};}
  if(meta.runs>=1&&!meta.tut.crewcard&&R.mods.length>=2&&!out.some(c=>c.cr)){meta.tut.crewcard=1;out[out.length-1]=rollCrewCard();out[out.length-1].r=Math.max(1,out[out.length-1].r)}
  return out;
}
function openPack(){
  if(!R||R.over||R.paused||R.tipPause)return;const free=(R.free||0)>0,c=free?0:packCost();if(R.gold<c)return;
  audioInit();if(free)R.free--;else R.gold-=c;R.packs++;R.paused=true;$('packBtn').classList.remove('pulse');if(meta.tut.crate)hideTip();
  meta.stats.crates++;curCards=rollCrate();
  const best=Math.max(...curCards.map(x=>x.rl?3:x.r)),tell=['#cfd6e4',RAR[1].c,RAR[2].c,RAR[3].c][best];
  sfx('crate');
  const lockOn=SETTINGS.lockGame!==0&&meta.tut.mod&&R.mods.length>=1;
  const motes=Array.from({length:16},(_,i)=>`<i style="--x:${(Math.random()*96+2).toFixed(1)}%;--d:${(3+Math.random()*3.5).toFixed(2)}s;--dl:-${(Math.random()*5).toFixed(2)}s;--s:${(2+Math.random()*3).toFixed(1)}px;--dx:${Math.round(Math.random()*60-30)}px"></i>`).join('');
  show(`<div class="panel center crpanel r${best}" style="--tc:${tell}"><div class="motes">${motes}</div><h2>SALVAGE CRATE</h2>
    <div class="lockwrap${lockOn?'':' nolock'}">${lockOn?'<canvas id="lockCv"></canvas>':''}<div class="crate r${best}" id="crateEl" style="--tc:${tell}"><div class="crays"></div><img class="crimg" id="crImg" src="assets/ui/crate_closed.png" alt="" draggable="false"></div></div>
    ${lockOn?`<div class="lslots">${curCards.map((x,i)=>`<div class="lslot" id="ls${i}">${i<3?'🔒':''}</div>`).join('')}</div>
    <div class="crhint" id="lhint">TAP at a colour · <kbd>${confirmKey()}</kbd></div><button class="small lquick" id="lquick">Quick open ▸</button>`:'<div class="crhint">tap to open</div>'}</div>`);
  let opened=false;const el=$('crateEl');
  const go=()=>{if(opened)return;opened=true;LK=null;const b2=Math.max(...curCards.map(x=>x.rl?3:x.r));sfx('crack'+b2);
    {const im=$('crImg');if(im){im.src='assets/ui/crate_opening.png';setTimeout(()=>{if(im.isConnected)im.src='assets/ui/crate_open.png'},170)}}
    el.classList.add('open');{const lw=modal.querySelector('.lockwrap');if(lw)for(let k=0;k<(b2>=2?3:1);k++)lw.insertAdjacentHTML('beforeend',`<div class="cburst" style="animation-delay:${k*0.14}s"></div>`)}
    if(b2===3){flash(0.5);modal.classList.add('mshake');setTimeout(()=>modal.classList.remove('mshake'),400)}
    setTimeout(()=>revealCards(c),b2>=2?520:300)};
  if(!lockOn){el.onclick=go;setTimeout(go,best>=2?1050:700);return}
  lockStart(go);el.onclick=e=>{e.stopPropagation();lockTap()};
  modal.querySelector('.crpanel').onclick=e=>{if(e.target.id!=='lquick')lockTap()};
  $('lquick').onclick=e=>{e.stopPropagation();sfx('click');LK=null;go()};
}
// ---------- crate lock mini-game ----------
// 3 locks (one per card). A needle sweeps a dial with coloured zones; tap inside a zone to raise that
// card's rarity floor (blue ≥RARE, purple ≥EPIC, gold ≥LEGENDARY; dead centre = PERFECT +1 tier).
// All 3 hit = JACKPOT: an extra card. Speed breathes (sine) so every lock has its own rhythm.
let LK=null;
const LZ=[{t:1,w:56,c:'#4da3ff',n:'RARE'},{t:2,w:26,c:'#b366ff',n:'EPIC'},{t:3,w:13,c:'#ffb020',n:'LEGENDARY'}];
function lockZones(){const z=[LZ[0]];if(Math.random()<0.55)z.push(LZ[1]);if(Math.random()<0.15+0.02*lv('luck'))z.push(LZ[2]);
  const out=[];for(const d of z){for(let k=0;k<40;k++){const a=Math.random()*360;if(out.every(o=>Math.abs(((a-o.a+540)%360)-180)>(o.w+d.w)/2+14)){out.push(Object.assign({a},d));break}}}return out}
function lockStart(done){
  const n=Math.min(3,curCards.length);
  LK={i:0,n,done,ang:Math.random()*360,dir:Math.random()<.5?1:-1,base:190,ph:Math.random()*6,zones:lockZones(),t:0,hits:0,res:[],fx:[],flash:0,wait:0,tick:0,last:performance.now()};
  const cv2=$('lockCv'),dpr=Math.min(2,devicePixelRatio||1),sz=cv2.getBoundingClientRect().width||300;cv2.width=sz*dpr;cv2.height=sz*dpr;LK.cv=cv2;LK.g=cv2.getContext('2d');LK.g.scale(dpr*sz/300,dpr*sz/300);
  const loop=now=>{if(!LK||!$('lockCv'))return;const dt=Math.min(0.05,(now-LK.last)/1000);LK.last=now;lockStep(dt);lockDraw();requestAnimationFrame(loop)};requestAnimationFrame(loop);
}
function lockSpeed(){return LK.base*(1+0.22*LK.i)*(1+0.38*Math.sin(LK.t*2.3+LK.ph))}
function lockStep(dt){const L=LK;L.t+=dt;L.flash=Math.max(0,L.flash-dt*2.5);
  for(const f of L.fx){f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}L.fx=L.fx.filter(f=>f.t>0);
  if(L.wait>0){L.wait-=dt;if(L.wait<=0)lockNext();return}
  const prev=L.ang;L.ang=(L.ang+L.dir*lockSpeed()*dt+360)%360;
  if(Math.floor(prev/30)!==Math.floor(L.ang/30))sfx('ltick');
  L.tw=(L.tw||0)+dt;if(L.tw>3.6){L.tw=0;lockResolve(null,false)} // AFK: auto-miss
}
function lockTap(){const L=LK;if(!L||L.wait>0||L.i>=L.n)return;
  let hitZ=null,perfect=false;for(const z of L.zones){const d=Math.abs(((L.ang-z.a+540)%360)-180);if(d<=z.w/2&&(!hitZ||z.t>hitZ.t)){hitZ=z;perfect=d<=z.w*0.16}}
  lockResolve(hitZ,perfect)}
function lockResolve(z,perfect){const L=LK,i=L.i,cd=curCards[i],sl=$('ls'+i);L.tw=0;
  let tier=0;if(z){tier=z.t===3?3:Math.min(2,z.t+(perfect?1:0));L.hits++;if(z.t>=2)L.big=1}
  const before=cd.rl?3:cd.r;if(!cd.rl&&tier>cd.r)cd.r=tier;
  L.res.push({z,perfect,tier});L.flash=z?1:0.5;L.fc=z?z.c:'#ff5a5a';
  const ac=z?(perfect?'#fff6c0':z.c):'#9aa4b2';
  for(let k=0;k<(z?(perfect?46:26):8);k++){const a=(L.ang-90)*Math.PI/180,r=120;L.fx.push({x:150+Math.cos(a)*r,y:150+Math.sin(a)*r,vx:rnd(-160,160),vy:rnd(-220,-20),t:rnd(.3,.8),c:k%3?ac:'#ffffff'})}
  if(z){sfx('lock'+z.t);if(perfect)sfx('perfect')}else sfx('lmiss');
  const name=z?(perfect?'PERFECT! ':'')+RAR[Math.max(tier,before)].n:'MISS';
  if(sl){sl.classList.add(z?'hit':'miss');sl.style.setProperty('--lc',z?RAR[Math.max(tier,before)].c:'#555');sl.innerHTML=z?`<b>${perfect?'★':'✓'}</b><small>≥${RAR[tier].n}</small>`:'<b>✕</b>'}
  const h=$('lhint');if(h){h.innerHTML=`<b style="color:${z?(perfect?'#fff6c0':z.c):'#ff8a8a'}">${name}</b>`;h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop')}
  if(z&&tier>=2){modal.classList.add('mshake');setTimeout(()=>modal.classList.remove('mshake'),260)}
  L.wait=0.55;
}
function lockNext(){const L=LK;L.i++;
  if(L.i>=L.n){if(L.hits===L.n&&L.n>=3&&L.big){const ex=rollCrate().find(x=>!curCards.some(c=>(c.t&&x.t&&c.t.id===x.t.id)||(c.cr&&c.cr===x.cr)||(c.sp&&x.sp&&c.sp.id===x.sp.id)||(c.rl&&x.rl&&c.rl.id===x.rl.id)));
      if(ex){curCards.push(ex);sfx('jackpot');flash(0.35);const h=$('lhint');if(h)h.innerHTML='<b style="color:#ffd24a">JACKPOT! +1 CARD</b>';meta.stats.jackpots=(meta.stats.jackpots||0)+1}}
    const d=L.done;setTimeout(()=>{if(curCards)d()},L.hits===L.n?650:250);L.wait=99;return}
  L.zones=lockZones();L.dir=Math.random()<.5?1:-1;L.ph=Math.random()*6;L.t=0;
  const h=$('lhint');if(h)h.innerHTML=`Lock ${L.i+1} / ${L.n} — faster!`;
}
function lockDraw(){const L=LK,g=L.g,cx=150,cy=150,R0=120;g.clearRect(0,0,300,300);
  g.lineCap='butt';g.lineWidth=20;g.strokeStyle='#14161f';g.beginPath();g.arc(cx,cy,R0,0,7);g.stroke();
  g.lineWidth=2;g.strokeStyle='#2e3344';g.beginPath();g.arc(cx,cy,R0+11,0,7);g.stroke();g.beginPath();g.arc(cx,cy,R0-11,0,7);g.stroke();
  for(let k=0;k<12;k++){const a=(k*30-90)*Math.PI/180;g.strokeStyle='#3a4157';g.lineWidth=2;g.beginPath();g.moveTo(cx+Math.cos(a)*(R0-9),cy+Math.sin(a)*(R0-9));g.lineTo(cx+Math.cos(a)*(R0+9),cy+Math.sin(a)*(R0+9));g.stroke()}
  const T=performance.now()/1000,tc=(L.tc=L.tc||getComputedStyle($('crateEl')).getPropertyValue('--tc').trim()||'#cfd6e4');
  g.save();g.setLineDash([3,11]);g.lineDashOffset=-T*18;g.globalAlpha=0.32;g.strokeStyle=tc;g.lineWidth=2;g.beginPath();g.arc(cx,cy,R0-30,0,7);g.stroke();g.restore();
  for(const z of L.zones){const a0=(z.a-z.w/2-90)*Math.PI/180,a1=(z.a+z.w/2-90)*Math.PI/180,pul=z.t===3?0.6+0.4*Math.sin(T*10):1;
    if(Math.abs(((L.ang-z.a+540)%360)-180)<=z.w/2){g.save();g.globalAlpha=0.4;g.strokeStyle='#ffffff';g.lineWidth=26;g.beginPath();g.arc(cx,cy,R0,a0,a1);g.stroke();g.restore()}   // needle is inside: NOW!
    g.save();g.shadowColor=z.c;g.shadowBlur=14*pul;g.strokeStyle=z.c;g.globalAlpha=0.85*pul;g.lineWidth=18;g.beginPath();g.arc(cx,cy,R0,a0,a1);g.stroke();g.restore();
    const pc=(z.a-90)*Math.PI/180,pw=z.w*0.16*Math.PI/180;g.strokeStyle='#ffffff';g.globalAlpha=0.55;g.lineWidth=18;g.beginPath();g.arc(cx,cy,R0,pc-pw,pc+pw);g.stroke();g.globalAlpha=1}
  if(L.flash>0){g.strokeStyle=L.fc;g.globalAlpha=L.flash;g.lineWidth=6;g.beginPath();g.arc(cx,cy,R0+12+(1-L.flash)*14,0,7);g.stroke();g.globalAlpha=1}
  const tr=(L.trail=L.trail||[]);tr.unshift(L.ang);if(tr.length>12)tr.length=12;
  for(let k=1;k<tr.length;k++){const d=((tr[k-1]-tr[k]+540)%360)-180;if(Math.abs(d)>40||!d)continue;g.globalAlpha=0.3*(1-k/tr.length);g.strokeStyle='#fff';g.lineWidth=18;g.lineCap='butt';g.beginPath();g.arc(cx,cy,R0,(tr[k]-90)*Math.PI/180,(tr[k-1]-90)*Math.PI/180,d<0);g.stroke()}g.globalAlpha=1;
  const a=(L.ang-90)*Math.PI/180;g.save();g.shadowColor='#fff';g.shadowBlur=12;g.strokeStyle='#ffffff';g.lineWidth=4;g.lineCap='round';
  g.beginPath();g.moveTo(cx+Math.cos(a)*(R0-26),cy+Math.sin(a)*(R0-26));g.lineTo(cx+Math.cos(a)*(R0+16),cy+Math.sin(a)*(R0+16));g.stroke();g.restore();
  g.fillStyle='#fff';g.beginPath();g.arc(cx+Math.cos(a)*(R0+16),cy+Math.sin(a)*(R0+16),4,0,7);g.fill();
  for(let k=0;k<L.n;k++){const x=cx+(k-(L.n-1)/2)*26,y=16,r=L.res[k];g.fillStyle=r?(r.z?r.z.c:'#5a2a2a'):k===L.i?'#ffffff':'#2e3344';g.beginPath();g.arc(x,y,k===L.i&&!r?7+Math.sin(T*8):6,0,7);g.fill()}
  for(const f of L.fx){g.globalAlpha=Math.min(1,f.t*2);g.fillStyle=f.c;g.fillRect(f.x-2,f.y-2,4,4)}g.globalAlpha=1;
}
function revealCards(c){
  if(!curCards)return;
  const bestR=Math.max(...curCards.filter(x=>!x.rl).map(x=>x.r),0);if(bestR===3)meta.stats.legend++;
  // best DPS module card (only highlight when there is a real choice)
  let bi=-1,bp=-1e9;curCards.forEach((cd,i)=>{if(cd.t){const p=previewPick(cd).pct;if(p>bp){bp=p;bi=i}}});
  bi=-1; // no 'best' hint: the player decides (DPS is only one axis now)
  const tcB=['#cfd6e4',RAR[1].c,RAR[2].c,RAR[3].c][Math.max(bestR,curCards.some(x=>x.rl)?3:0)];
  let h=`<div class="panel center chpanel" style="--tc:${tcB}"><div id="buildBar" class="buildbar"></div><h2>CHOOSE ONE</h2><div class="cards">`;
  curCards.forEach((cd,i)=>{const inner=cd.cr?crewCardHTML(cd,i):cd.sp?spellCardHTML(cd,i):cd.rl?relicCardHTML(cd,i):moduleCardHTML(cd,i,i===bi);
    h+=`<div class="cwrap" style="--d:${0.08+i*0.17}s">${inner}<div class="cback r${cd.rl?3:cd.r}"></div></div>`});
  h+=`</div><div class="chfoot"><button class="small" id="skipBtn">Scrap it (+40% refund)</button><span class="chhelp">Tap an element badge for details · ${PADMODE?'D-pad + '+padGlyph('A'):'keys 1–'+curCards.length}</span></div></div>`;
  show(h);renderBuildBar();
  const cards=[...modal.querySelectorAll('.card')];
  cards.forEach((el,i)=>{
    const cd=curCards[i];el.onclick=()=>pick(i);
    el.onmouseenter=()=>{if(cd.t)renderBuildBar(previewPick(cd))};el.onmouseleave=()=>renderBuildBar();
    setTimeout(()=>{if(!curCards)return;const r=cd.rl?3:cd.r;sfx('flip'+r);if(r===3&&cd.t)vo('legendary');if(r===3){flash(cd.rl?0.35:0.6);modal.classList.add('mshake');setTimeout(()=>modal.classList.remove('mshake'),380)}},(0.08+i*0.17)*1000+180);
  });
  bindElemBadges(modal);
  $('skipBtn').onclick=()=>{R.gold+=Math.floor(c*0.4);sfx('click');closePack()};
}
function relicCardHTML(cd,i){
  return `<div class="card r3 relcard" style="--rc:#ffd24a;border-color:#ffd24a" data-i="${i}">
    <div class="rn" style="color:#ffd24a">RELIC</div>
    <div class="gl" style="background:#ffd24a1c;border-radius:50%">${ico('rl_'+cd.rl.id,3,0,cd.rl.g)}</div>
    <div class="nm">${cd.rl.n}</div><div class="ds">${cd.rl.d}</div><div class="ds st">Passive · lasts this run</div>
    <span class="tg" style="background:#ffd24a">Relic ${R.relics.length+1}/${maxRelics()}</span></div>`;
}
// called by pick() after a module is placed: celebrate synergy tiers that just switched on
function synCelebrate(prev){
  for(const k in TYPES){const a=synTier(prev[k]||0),b=synTier(R.syn[k]||0);if(b>a){
    R.banner={s:`${k.toUpperCase()} SYNERGY ${SYN_T[b-1]}`,sub:b===1?ELEM_INFO[k].t2:ELEM_INFO[k].t4,t:2.2};sfx('synergy');musStinger('synergy');vo('synergy');
    for(const h of R.mods)if(h.t.ty===k){R.fx.push({type:'ring',x:h.x,y:h.y*K,r0:6,r1:46,t:0.6,T:0.6,c:TYPES[k].c});for(let j=0;j<10;j++)R.pt.push({x:h.x,y:h.y*K-14,vx:rnd(-60,60),vy:rnd(-160,-60),t:rnd(.4,.8),c:TYPES[k].c,s:3,g:120,add:1})}
    R.fx.push({type:'ring',x:0,y:0,r0:20,r1:ringR()*0.9,t:0.7,T:0.7,c:TYPES[k].c});}}
}

// ---------- LOADOUT panel (review everything you picked this run) ----------
function showLoadout(){
  if(!R||R.over||curCards||CUT)return;const was=R.paused;R.paused=true;sfx('click');
  const syn=synOf(R.mods),tot=teamDps(R.mods)||1;
  const mods=R.mods.map(h=>{const k=h.t.ty,c=TYPES[k].c,p=modPow(h,syn)*(1+0.15*lv('dmg')),m=TYPE_MOD[k];
    return `<div class="lom" style="--rc:${RAR[h.r].c};--ec:${c}">${ico('mod_'+k,0.9,0,'')}<div class="lomi"><div class="lomn">${h.t.n} <span class="lst">${'★'.repeat(Math.min(h.s,5))}${h.s>5?'+':''}</span></div>
      <div class="lomr" style="color:${RAR[h.r].c}">${RAR[h.r].n}</div>${elemBadge(k)}
      <div class="loms">${fmt(h.t.dmg*m.dmg*RAR[h.r].m*(1+0.7*(h.s-1))*tierM(h.tier))} dmg · ${(h.t.rate*m.rate).toFixed(1)}/s · ${h.t.c==='drone'?'anywhere':h.t.range+' range'}${h.t.aoe?' · area':''}</div>
      <div class="lomb"><i style="width:${Math.round(p/tot*100)}%;background:${c}"></i><span>${fmt(p)} DPS · ${Math.round(p/tot*100)}%</span></div></div></div>`}).join('')||'<div class="loe">No modules yet — open a crate.</div>';
  let syns='';for(const k in TYPES){const n=syn[k]||0,t=synTier(n);syns+=`<div class="los${t?' on':''}" data-el="${k}" style="--ec:${TYPES[k].c}"><div class="losh"><b>${k}</b><span class="lp">${pips(k,n)}</span></div><span>${t===2?ELEM_INFO[k].t4:t===1?ELEM_INFO[k].t2:n?`${2-n} more for +25% dmg`:'—'}</span></div>`}
  const sp=R.spells.map((s,i)=>`<div class="lox" style="--rc:${RAR[s.r].c}">${ico('sp_'+s.d.id,2,0,s.d.g)}<div><b>${s.d.n}</b> <span class="lst">Lv${s.lv}</span> <span class="lok">${spKey(i)}</span><div class="loms">${s.d.d} · cooldown ${Math.round(spellCd(s))}s</div></div></div>`).join('')||'<div class="loe">No spells yet.</div>';
  const rl=R.relics.map(id=>{const r=RELICS.find(x=>x.id===id);return `<div class="lox" style="--rc:#ffd24a">${ico('rl_'+r.id,2,0,r.g)}<div><b>${r.n}</b><div class="loms">${r.d}</div></div></div>`}).join('')||`<div class="loe">No relics yet (max ${maxRelics()}).</div>`;
  const crw=(R.crew||[]).map(c=>`<div class="lox" style="--rc:${RAR[c.r].c}"><img src="${crewPortrait(c.role,c.ty)}" alt=""><div><b>${c.ty} ${CREW[c.role].n}</b> <span class="lst">${'★'.repeat(Math.min(c.s,5))}</span> ${elemBadge(c.ty)}<div class="loms">${crewStat(c.role,c.r,c.s,c.ty)}${c.down>0?' · <b style="color:#ff5a5a">DOWN</b>':''}</div></div></div>`).join('')||`<div class="loe">No crew yet — crew cards appear in crates (max ${CREW_MAX}).</div>`;
  const d=document.createElement('div');d.id='loadout';
  d.innerHTML=`<div class="panel lopanel"><div class="lohead"><h2>LOADOUT</h2><div class="lodps">TEAM DPS <b>${fmt(tot)}</b> · Modules ${R.mods.length}/${R.slots} · Spells ${R.spells.length}/${MAX_SPELLS} · Relics ${R.relics.length}/${maxRelics()}</div></div>
    <div class="losec">MODULES</div><div class="lomods">${mods}</div>
    <div class="losec">CREW ${(R.crew||[]).length}/${CREW_MAX}</div><div class="locrew">${crw}</div>
    <div class="losec">SYNERGIES <small>tap for details</small></div><div class="losyn">${syns}</div>
    <div class="lo2"><div><div class="losec">SPELLS</div>${sp}</div><div><div class="losec">RELICS</div>${rl}</div></div>
    <div class="center"><button class="big" id="loClose">BACK TO BATTLE ▸</button><div class="chhelp">Tab / Esc to close</div></div></div>`;
  document.body.appendChild(d);bindElemBadges(d);
  const close=()=>{d.remove();if(R&&!was)R.paused=false;sfx('click')};$('loClose').onclick=close;d.onclick=e=>{if(e.target===d)close()};d._close=close;
}
function closeLoadout(){const d=$('loadout');if(d&&d._close)d._close()}
// preload the crate art so the open animation never flashes an empty frame
['crate_closed','crate_opening','crate_open','kit_panel','kit_plaque','card_common','card_rare','card_epic','card_legend'].forEach(n=>{const i=new Image();i.src='assets/ui/'+n+'.png'});
