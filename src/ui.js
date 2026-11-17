"use strict";
// ===== UI =====
function renderChips(){
  if(!R)return;let h='';
  for(const x of R.mods)h+=`<span class="chip" style="border-color:${RAR[x.r].c}">${ico('c_'+x.t.c+'_'+x.t.ty,1,0,`<span style="color:${TYPES[x.t.ty].c}">${x.t.g}</span>`)}<span class="cn">${x.t.n.split(' ')[0]}</span>${x.s>1?`<span class="st">★${x.s}</span>`:''}</span>`;
  for(let i=R.mods.length;i<R.slots;i++)h+=`<span class="chip" style="opacity:.3">—</span>`;
  for(const id of R.relics){const rl=RELICS.find(x=>x.id===id);h+=`<span class="chip relchip" title="${rl.n}: ${rl.d}">${ico('rl_'+rl.id,1,0,rl.g)}</span>`}
  for(const k in TYPES){const n=R.syn[k]||0;if(n)h+=`<span class="syn ${n>=2?'on':''}" style="color:${TYPES[k].c};border-color:${TYPES[k].c}" title="2: +25% dmg · 4: ${TYPES[k].b4}">${k[0]}<span class="cn">${k.slice(1)}</span> ${n}/${n>=2?4:2}${n>=4?' ✓':''}</span>`}
  $('row1').innerHTML=h;
}
let hudT=0;
function hud(dt){
  hudT-=dt;if(hudT>0||!R)return;hudT=0.08;
  const p=Math.max(0,R.hope)/R.maxHope;$('hopebar').style.width=(100*p)+'%';$('hopebar').className=p<0.25?'low':'';$('hopetxt').textContent='HOPE '+Math.ceil(p*100)+'%';
  $('scrapT').textContent='⚙ '+fmt(R.gold);$('coreT').textContent='✦ '+fmt(R.cores);$('threatT').textContent=!R.endless&&R.wave>=BOSS_WAVE?'THREAT MAX':'THREAT '+R.wave;$('siteT').textContent=R.endless?'∞ Endless':(R.night?'☠ ':'')+SITES[R.ch-1];
  spellHud();
  const c=packCost();$('packBtn').textContent='OPEN CRATE  ⚙'+fmt(c);$('packBtn').disabled=R.gold<c||R.paused||R.over||R.tipPause||R.updPause;
}
function refreshReactBtn(){const b=$('reactBtn');if(!R||meta.runs<1){b.classList.add('hide');return}b.classList.remove('hide');const r=REACT[R.react];b.innerHTML='⚛ REACTOR<br>'+r.n;b.style.background=r.c}
const modal=$('modal');
function show(html){modal.innerHTML=html;modal.classList.remove('hidden')}
function hide(){modal.classList.add('hidden');modal.innerHTML=''}
function flash(a){const f=$('flash');f.style.transition='none';f.style.opacity=a;requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0})}
// tips
let tipTimer=null;
function tip(id,html,pause,secs){
  if(meta.tut[id]||!R||R.over)return;meta.tut[id]=1;save();
  const el=$('tip');el.innerHTML=html+(pause?'<button id="tipOk">GOT IT</button>':'');el.style.display='block';
  clearTimeout(tipTimer);
  if(pause){R.tipPause=true;$('tipOk').onclick=()=>{sfx('click');el.style.display='none';if(R)R.tipPause=false}}
  else tipTimer=setTimeout(()=>{el.style.display='none'},(secs||5)*1000);
}
function hideTip(){$('tip').style.display='none';if(R)R.tipPause=false}
function tutorialTick(){
  if(meta.tut.done1)return;
  if(R.tutStep===0&&meta.tut.start&&R.t>5){R.tutStep=1;R.gold=Math.max(R.gold,packCost());tip('crate','A <b>salvage crate</b> from an older wreck! Tap <b>OPEN CRATE</b> (or Space).',false,30);$('packBtn').classList.add('pulse')}
}
let curCards=null;
function openPack(){
  if(!R||R.over||R.paused||R.tipPause)return;const c=packCost();if(R.gold<c)return;
  audioInit();R.gold-=c;R.packs++;R.paused=true;$('packBtn').classList.remove('pulse');if(meta.tut.crate)hideTip();sfx('crate');
  meta.stats.crates++;const n=(hasRel('echo')?4:3)+lv('crate5'),taken=[];
  const roll=()=>{
    const armed=R.mods.length>=2;
    if(armed&&meta.tut.mod&&canRollRelic()&&Math.random()<RELIC_CHANCE){const rl=rollRelic(taken);if(rl){taken.push(rl.id);return{rl,r:3}}}
    return armed&&meta.tut.mod&&Math.random()<SPELL_CHANCE?{sp:SPELLS[Math.random()*SPELLS.length|0],r:rollR()}:{t:MODS[Math.random()*MODS.length|0],r:rollR()}};
  const key=c=>c.rl?'r'+c.rl.id:c.sp?'s'+c.sp.id:'m'+c.t.id;
  curCards=[];const seen=new Set();
  for(let tries=0;curCards.length<n&&tries<60;tries++){const c=roll();if(seen.has(key(c)))continue;seen.add(key(c));curCards.push(c)}
  if(!meta.tut.mod)curCards.forEach(c=>{if(c.sp||c.rl){delete c.rl;c.t=MODS[Math.random()*MODS.length|0];delete c.sp}});
  if(!meta.tut.mod)curCards[1].r=Math.max(1,curCards[1].r);
  show(`<div class="panel center"><h2>SALVAGE CRATE</h2><div class="crate" id="crateEl">${ico('crate',4,0,'<div class="body"></div><div class="stripe"></div><div class="lid"></div><div class="lightc"></div>')}</div><div style="color:#7f8899;font-size:12px">tap to open</div></div>`);
  let opened=false;const go=()=>{if(opened)return;opened=true;const el=$('crateEl');if(el&&SPR.data&&SPR.data.sprites.crate){el.innerHTML=ico('crate',4,1);el.classList.add('open');setTimeout(()=>revealCards(c),220)}else revealCards(c)};
  $('crateEl').onclick=go;setTimeout(go,750);
}
function revealCards(c){
  const best=Math.max(...curCards.filter(x=>!x.rl).map(x=>x.r),0);if(best===3){flash(0.8);sfx('legend');meta.stats.legend++}else if(curCards.some(x=>x.rl))sfx('legend');else if(best>=1)sfx('rare');
  let h='<div class="panel center"><h2>CHOOSE ONE</h2><div class="cards">';
  curCards.forEach((cd,i)=>{
    if(cd.sp){h+=spellCardHTML(cd,i);return}
    if(cd.rl){h+=relicCardHTML(cd,i);return}
    const ex=R.mods.find(x=>x.t.id===cd.t.id);let tag;
    if(ex)tag=`<span class="tg" style="background:#ffd24a">★ Upgrade to ★${ex.s+1}</span>`;
    else if(R.mods.length>=R.slots){const w=R.mods.reduce((a,b)=>power(b)<power(a)?b:a);tag=`<span class="tg" style="background:#ff5a5a">Replaces ${w.t.n}</span>`}
    else tag=`<span class="tg" style="background:#7dffb0">New module</span>`;
    const col=TYPES[cd.t.ty].c;
    h+=`<div class="card r${cd.r}" style="--rc:${RAR[cd.r].c};border-color:${RAR[cd.r].c};animation-delay:${i*0.12}s" data-i="${i}">
      <div class="rn" style="color:${RAR[cd.r].c}">${RAR[cd.r].n}</div>
      <div class="gl" style="background:${col}22;color:${col}">${ico('c_'+cd.t.c+'_'+cd.t.ty,3,0,cd.t.g)}</div>
      <div class="nm">${cd.t.n}</div><div class="ds" style="color:${col}">${cd.t.ty} · ${TYPE_MOD[cd.t.ty].d}</div><div class="ds">${cd.t.d}</div>
      <div class="ds">DPS ~${fmt(cd.t.dmg*cd.t.rate*TYPE_MOD[cd.t.ty].dmg*TYPE_MOD[cd.t.ty].rate*RAR[cd.r].m*tierM(R.ch)*(1+0.15*lv('dmg')))}</div>${tag}</div>`;
  });
  h+=`</div><button class="small" id="skipBtn" style="font-size:13px;color:#8a92a2">Scrap it (+40% refund)</button></div>`;
  show(h);
  modal.querySelectorAll('.card').forEach(el=>el.onclick=()=>pick(+el.dataset.i));
  $('skipBtn').onclick=()=>{R.gold+=Math.floor(c*0.4);closePack()};
}
function pick(i){
  if(!curCards)return;const cd=curCards[i];sfx('up');
  if(cd.sp){addSpell(cd);closePack();return}
  if(cd.rl){addRelic(cd);closePack();return}
  const ex=R.mods.find(x=>x.t.id===cd.t.id);
  const mk=()=>({t:cd.t,r:cd.r,s:1,tier:R.ch,cd:0.3,fl:0,x:0,y:0});
  let target;
  if(ex){ex.s++;ex.r=Math.max(ex.r,cd.r);ex.tier=Math.max(ex.tier,R.ch);target=ex;addTxt(ex.x,ex.y*K-34,'★ UP','#ffd24a',14)}
  else if(R.mods.length<R.slots){target=mk();R.mods.push(target)}
  else{let wi=0;R.mods.forEach((h,j)=>{if(power(h)<power(R.mods[wi]))wi=j});target=mk();R.mods[wi]=target}
  layoutMods();renderChips();closePack();
  R.fx.push({type:'ring',x:target.x,y:target.y*K,r0:4,r1:34,t:0.4,T:0.4,c:TYPES[cd.t.ty].c});
  for(let k=0;k<14;k++)R.pt.push({x:target.x,y:target.y*K-10,vx:rnd(-90,90),vy:rnd(-150,-30),t:rnd(.3,.6),c:TYPES[cd.t.ty].c,s:3,g:300,add:1});
  if(!meta.tut.mod)setTimeout(()=>tip('mod','Modules fire on their own. Get the <b>same module</b> again to upgrade it <b>★</b>.',false,6),300);
  else if(!meta.tut.syn&&Object.values(R.syn).some(n=>n>=2))setTimeout(()=>tip('syn','<b>Synergy!</b> 2 modules of one type: <b>+25% damage</b>. Reach 4 for a special effect.',false,7),300);
}
function closePack(){curCards=null;hide();if(R)R.paused=false}
function endRun(won){
  if(R.over)return;R.over=true;R.won=won;hideTip();
  if(won)for(const o of R.orbs){if(o.type==='scrap')R.gold+=o.v;else if(o.type==='core')R.cores+=o.v}
  sfx(won?'win':'lose');
  let m=Math.floor(R.cores+(R.wave-1)*10*Math.pow(1.6,R.ch-1));let unlocked=false,ending=false,nightUnlock='';
  if(won){m+=80*R.ch;if(meta.chapter===R.ch&&R.ch<MAXCH){meta.chapter++;meta.sel=meta.chapter;unlocked=true}
    if(R.ch===MAXCH&&!meta.story){meta.story=1;ending=true}
    if(R.night&&!meta.night[R.ch]){meta.night[R.ch]=1;ach('n'+R.ch);nightUnlock=UPG2.filter(u=>u.req==='n'+R.ch).map(u=>u.n).join(' + ')}}
  if(R.endless)m+=R.bossKills*200;
  meta.mastery+=m;meta.runs++;meta.tut.done1=1;if(!R.endless)meta.best[R.ch]=Math.max(meta.best[R.ch]||0,won?BOSS_WAVE+1:R.wave);save();achScan();
  const r=R;
  setTimeout(()=>{show(`<div class="panel center"><div class="logo" style="font-size:34px;${won?'':'filter:grayscale(.6) drop-shadow(0 0 10px #f004)'}">${won?(ending?'THE LAST PART':'PART RECOVERED'):'HOPE FADES…'}</div>
    <div class="endstats">${r.endless?'∞ Endless':(r.night?'☠ ':'')+SITES[r.ch-1]} · Threat <b>${r.wave}</b>${r.endless?` · Best <b>${meta.bestEndless}</b>`:''} · ${Math.floor(r.t)}s<br>Kills <b>${r.kills}</b> · Crates <b>${r.packs}</b><br>
    <span class="mast">+${fmt(m)} ✦ Xeno-cores</span>${unlocked?`<br><b style="color:#ffb03a">The ship can hop to a new site: ${SITES[meta.chapter-1]}!</b>`:''}${nightUnlock?`<br><b style="color:#c79bff">☠ Nightmare cleared! Unlocked: ${nightUnlock}</b>`:''}
    ${won?'':'<br><span style="color:#7f8899;font-size:12px">…but the cores you gathered can repair the ship.</span>'}</div>
    <button class="big" id="toMenu">${ending?'🚀 LIFTOFF ▸':'REPAIR SHIP ▸'}</button></div>`);$('toMenu').onclick=()=>{sfx('click');if(ending)startEnding();else menu()}},1100);
}
function menu(){
  R=null;document.body.classList.add('inmenu');hideTip();$('row1').innerHTML='';refreshReactBtn();renderSpellBar();
  const firstRepair=meta.runs>=1&&Object.keys(meta.up).length===0;
  const cheapest=UPG.filter(u=>lv(u.k)<u.max).sort((a,b)=>upCost(a)-upCost(b))[0];
  let h=`<div class="panel"><div class="logo">HOPEFIRE</div><div class="tag">When all hope is lost, the ship still fires. <span class="vertag">v${VERSION}</span></div>
  <div class="mast">✦ Xeno-cores: <b>${fmt(meta.mastery)}</b></div>`;
  if(meta.runs>0){
    h+=`<h2>CRASH SITES</h2><div class="chs">`;
    for(let i=1;i<=MAXCH;i++)h+=`<button data-ch="${i}" class="${meta.sel===i?'sel':''}" ${i>meta.chapter?'disabled':''}>${i}. ${i>meta.chapter?'🔒 ???':SITES[i-1]}${meta.best[i]>BOSS_WAVE?' ✓':''}${meta.night[i]?' ☠':''}</button>`;
    h+=`</div>${meta.best[meta.sel]>BOSS_WAVE?`<label class="warp"><input type="checkbox" id="warpChk" ${meta.warp?'checked':''}> ⏩ Warp start — begin at Threat ${WARP_WAVE}</label><label class="warp nightOpt"><input type="checkbox" id="nightChk" ${meta.nightSel?'checked':''}> ☠ Nightmare — creatures ×${NM.hp[meta.sel-1]} HP, Xeno-cores ×${NM.core}${meta.night[meta.sel]?' (cleared)':''}</label>`:''}${meta.story?`<button class="endlessBtn" id="endlessBtn">∞ ENDLESS WASTES <small>best threat ${meta.bestEndless||0}</small></button>`:''}<h2>SHIP REPAIRS</h2>${firstRepair?'<div style="color:#ffb03a;font-size:12px;margin-bottom:8px">▸ Spend Xeno-cores to repair the ship. Every repair makes the next run last longer.</div>':''}<div class="ups">`;
    for(const u of UPG){const l=lv(u.k),mx=l>=u.max,c=upCost(u);
      h+=`<div class="up ${firstRepair&&u===cheapest?'hl':''}"><b>${u.n}</b><span class="lv">Lv ${l}/${u.max}</span><span>${l?u.d(l):'Next: '+u.d(1)}</span><button data-k="${u.k}" ${mx||meta.mastery<c?'disabled':''}>${mx?'MAX':'✦ '+fmt(c)}</button></div>`}
    h+=`</div>`;
    if(meta.story){h+=`<h2>ADVANCED REPAIRS</h2><div class="ups">`;
      for(const u of UPG2){const l=lv(u.k),mx=l>=u.max,c=upCost(u),ok=reqMet(u.req);
        h+=ok?`<div class="up adv"><b>${u.n}</b><span class="lv">Lv ${l}${u.max<999?'/'+u.max:''}</span><span>${l?u.d(l):'Next: '+u.d(1)}</span><button data-k="${u.k}" ${mx||meta.mastery<c?'disabled':''}>${mx?'MAX':'✦ '+fmt(c)}</button></div>`
          :`<div class="up locked"><b>🔒 ${u.n}</b><span class="lv">${REQ_TXT[u.req]}</span><span>${u.d(1)}</span></div>`}
      h+=`</div>`}
  }else h+=`<p style="color:#9aa3b3;font-size:13px;line-height:1.7;margin:14px 0 20px">Your ship has crashed on an unknown planet.<br>Something is moving in the dark.</p>`;
  h+=`<div class="center"><button class="big" id="startBtn">▶ ${meta.runs?'BEGIN RUN':'WAKE UP'}</button></div><div class="menuRow">${meta.runs?`<button id="achBtn">🏆 ${ACH.filter(a=>meta.ach[a.id]).length}/${ACH.length}</button><button id="statBtn">📊 Stats</button>`:''}<button id="setBtn">⚙ Settings</button>${meta.tut.intro?'<button id="introBtn">🎬 Intro</button>':''}${meta.story?'<button id="endBtn">🚀 Ending</button>':''}</div></div>`;
  show(h);
  modal.querySelectorAll('.chs button').forEach(b=>b.onclick=()=>{sfx('click');meta.sel=+b.dataset.ch;save();menu()});
  modal.querySelectorAll('.up button').forEach(b=>b.onclick=()=>{audioInit();const u=UPG.concat(UPG2).find(x=>x.k===b.dataset.k),c=upCost(u);if(meta.mastery>=c&&lv(u.k)<u.max){meta.mastery-=c;meta.up[u.k]=lv(u.k)+1;save();sfx('up');menu()}});
  $('startBtn').onclick=()=>{audioInit();sfx('click');hide();if(!meta.tut.intro)startCutscene('run');else{const c=Math.min(meta.sel,meta.chapter),ok=meta.best[c]>BOSS_WAVE;newRun(c,false,meta.warp&&ok,meta.nightSel&&ok)}};
  const nb=$('nightChk');if(nb)nb.onchange=e=>{meta.nightSel=e.target.checked;save()};
  const wb=$('warpChk');if(wb)wb.onchange=e=>{meta.warp=e.target.checked;save()};
  const ib=$('introBtn');if(ib)ib.onclick=()=>startCutscene('menu');
  const bind=(id,f)=>{const b=$(id);if(b)b.onclick=()=>{audioInit();sfx('click');f()}};
  bind('achBtn',panelAch);bind('statBtn',panelStats);bind('setBtn',panelSettings);bind('endBtn',()=>startEnding('menu'));
  bind('endlessBtn',()=>{hide();newRun(MAXCH,true)});
}
$('packBtn').onclick=openPack;
function togglePause(force){
  if(!R||R.over||R.paused||CUT)return;const on=force!==undefined?force:!R.userPause;if(on===!!R.userPause)return;R.userPause=on;
  $('pauseBtn').textContent=on?'▶':'II';sfx('click');
  if(on)$('upd').classList.contains('hidden')&&showPausePanel();else{const p=$('pausePanel');if(p)p.remove()}
}
function showPausePanel(){const d=document.createElement('div');d.id='pausePanel';d.innerHTML='<div class="panel center" style="max-width:360px"><div class="logo" style="font-size:34px">PAUSED</div><p style="color:#9aa3b3;font-size:12px;margin:10px 0 16px">Esc / P to resume</p><button class="big" id="resumeBtn">▶ RESUME</button></div>';document.body.appendChild(d);$('resumeBtn').onclick=()=>togglePause(false)}
$('pauseBtn').onclick=()=>togglePause();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&R&&!R.over&&!R.paused)togglePause(true)});
$('skipCut').onclick=endCutscene;
$('spdBtn').onclick=()=>{sfx('click');speed=speed===1?2:speed===2?3:1;$('spdBtn').textContent=speed+'x';meta.set.spd=speed;save()};
speed=meta.set.spd||1;
$('reactBtn').onclick=()=>{if(!R||R.over)return;sfx('click');R.react=(R.react+1)%3;refreshReactBtn();R.banner={s:'REACTOR: '+REACT[R.react].n,t:1.2};R.ringPulse=0.6};
$('muteBtn').onclick=()=>{meta.muted=!meta.muted;save();audioInit();applyVolume();$('muteBtn').textContent=meta.muted?'🔇':'🔊'};
$('muteBtn').textContent=meta.muted?'🔇':'🔊';
$('quitBtn').onclick=()=>{const b=$('quitBtn');if(!R||R.over||R.paused)return;if(b.dataset.c){delete b.dataset.c;b.textContent='✕';endRun(false)}else{b.dataset.c=1;b.textContent='?';setTimeout(()=>{delete b.dataset.c;b.textContent='✕'},1500)}};
addEventListener('keydown',e=>{if(e.code==='Escape'||e.code==='KeyP'){togglePause();return}if(R&&R.userPause)return;if(e.code==='Space'){e.preventDefault();if(R&&R.tipPause&&$('tipOk'))$('tipOk').click();else openPack()}else if(curCards&&/^Digit[123]$/.test(e.code)&&modal.querySelector('.card'))pick(+e.code[5]-1);else if(e.code==='KeyR')$('reactBtn').click();else if(R&&!curCards&&/^Key[QWE]$/.test(e.code))castSpell('QWE'.indexOf(e.code[3]))});
