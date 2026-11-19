"use strict";
// ===== UI =====
function renderChips(){
  if(!R)return;let h='';
  for(const x of R.mods)h+=`<span class="chip lochip" style="border-color:${RAR[x.r].c}">${TART[x.t.c]?modIcon(x.t,32):ico('c_'+x.t.c+'_'+x.t.ty,1,0,`<span style="color:${TYPES[x.t.ty].c}">${x.t.g}</span>`)}<span class="cn">${x.t.n.split(' ')[0]}</span>${x.s>1?`<span class="st">★${x.s}</span>`:''}</span>`;
  for(let i=R.mods.length;i<R.slots;i++)h+=`<span class="chip" style="opacity:.3">—</span>`;
  for(const id of R.relics){const rl=RELICS.find(x=>x.id===id);h+=`<span class="chip relchip lochip" title="${rl.n}: ${rl.d}">${ico('rl_'+rl.id,1,0,rl.g)}</span>`}
  for(const k in TYPES){const n=R.syn[k]||0;if(n)h+=`<span class="syn ${n>=2?'on':''}${n>=4?' max':''}" data-el="${k}" style="color:${TYPES[k].c};border-color:${TYPES[k].c};--ec:${TYPES[k].c}" title="Tap for ${k} bonuses">${k[0]}<span class="cn">${k.slice(1)}</span> ${pips(k,n)}</span>`}
  $('row1').innerHTML=h;bindElemBadges($('row1'));$('row1').querySelectorAll('.lochip').forEach(c=>c.onclick=()=>showLoadout());
}
let hudT=0;
function hud(dt){
  hudT-=dt;if(hudT>0||!R)return;hudT=0.08;
  const p=Math.max(0,R.hope)/R.maxHope;$('hopebar').style.width=(100*p)+'%';$('hopebar').className=p<0.25?'low':'';$('hopetxt').textContent='HOPE '+Math.ceil(p*100)+'%';
  $('scrapT').textContent='⚙ '+fmt(R.gold);$('coreT').textContent='✦ '+fmt(R.cores);$('threatT').textContent=!R.endless&&R.wave>=BOSS_WAVE?'THREAT MAX':'THREAT '+R.wave;$('siteT').textContent=R.endless?'∞ Endless':(R.night?'☠ ':'')+SITES[R.ch-1];
  spellHud();
  const fr=(R.free||0)>0,c=fr?0:packCost();$('packBtn').textContent=fr?'OPEN FREE CRATE'+(R.free>1?' ×'+R.free:''):'OPEN CRATE  ⚙'+fmt(c);$('packBtn').classList.toggle('freec',fr);$('packBtn').disabled=R.gold<c||R.paused||R.over||R.tipPause||R.updPause;
}
const REACT_SHORT=['hide · less loot','balanced','×1.6 loot · danger'];
const pctS=v=>(v>=1?'+':'−')+Math.round(Math.abs(v-1)*100)+'%';
function reactSub(i){const r=REACT[i];return i===1?'Standard ring, damage and loot':`Ring ${pctS(r.ring)} · Damage ${pctS(r.dmg)} · Loot ${pctS(r.loot)} · Creatures ${pctS(r.spawn)}`}
function refreshReactBtn(){const b=$('reactBtn');if(!R||meta.runs<1){b.classList.add('hide');return}b.classList.remove('hide');const r=REACT[R.react];b.innerHTML='⚛ REACTOR · '+r.n+'<small>'+REACT_SHORT[R.react]+'</small>';b.style.background=r.c;b.title=reactSub(R.react)+' (R)'}
const modal=$('modal');
const panelSig=p=>{const h=p&&p.querySelector('.logo,h1,h2');return h?h.textContent:''};
// re-rendering the same screen (e.g. buying an upgrade in the hub) keeps the scroll position
function show(html){const old=modal.querySelector('.panel'),sig=panelSig(old),st=old?old.scrollTop:0,ob=old&&old.querySelector('.hubbody'),sb=ob?ob.scrollTop:0;
  modal.innerHTML=html;modal.classList.remove('hidden');
  const np=modal.querySelector('.panel');if(np&&sig&&panelSig(np)===sig){if(st)np.scrollTop=st;const nb=np.querySelector('.hubbody');if(nb&&sb)nb.scrollTop=sb}}
function hide(){modal.classList.add('hidden');modal.innerHTML=''}
function flash(a){if(!SETTINGS.flashes)a*=0.25;const f=$('flash');f.style.transition='none';f.style.opacity=a;requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0})}
// tips
let tipTimer=null;
function tip(id,html,pause,secs){
  if(meta.tut[id]||!R||R.over)return;meta.tut[id]=1;save();
  const el=$('tip');el.innerHTML=html+(pause?'<button id="tipOk">GOT IT</button>':'');el.style.display='block';el.style.top=R.boss?'310px':'';   // keep clear of the boss bar
  clearTimeout(tipTimer);
  if(pause){R.tipPause=true;$('tipOk').onclick=()=>{sfx('click');el.style.display='none';if(R)R.tipPause=false}}
  else tipTimer=setTimeout(()=>{el.style.display='none'},(secs||5)*1000);
}
function hideTip(){$('tip').style.display='none';if(R)R.tipPause=false}
function tutorialTick(){
  // progressive lessons: each fires once, in the first minutes of play, never stacking
  if(!R.tipPause&&!curCards&&!CUT&&$('tip').style.display!=='block'){
    const T=meta.tut;
    if(T.crate&&!T.pick2&&R.packs>=1&&R.t>25){tip('pick2','Crates cost <b>scrap</b> (the number next to the crate). Kill creatures and <b>tap the scrap</b> they drop to collect it. Opening crates is how you grow.',false,8);T.pick2=1;save()}
    else if(T.mod&&!T.speed&&R.t>50&&R.en.length<6){tip('speed','Quiet moment? The <b>1x</b> button (top bar) speeds the game up. Slow down again when it gets busy.',false,8)}
    else if(T.mod&&!T.hopebar&&R.hope<R.maxHope*0.6){tip('hopebar','<b>HOPE</b> is your health <i>and</i> your clock. When it hits zero the run ends — but the ✦ cores you gathered are yours to keep.',false,9)}
    else if(T.mod&&!T.markT&&R.en.length>=8&&R.t>70){tip('markT','Tap a creature to <b>mark</b> it: every module focuses it. Mark the one that threatens you most.',false,8)}
  }
  if(meta.tut.done1)return;
  if(R.tutStep===0&&meta.tut.start&&R.t>5){R.tutStep=1;R.gold=Math.max(R.gold,packCost());vo('tut_crate',1);tip('crate','A <b>salvage crate</b> from an older wreck! Tap <b>OPEN CRATE</b> (or ${confirmKey()}).',false,30);$('packBtn').classList.add('pulse')}
}
function pick(i){
  if(!curCards)return;const cd=curCards[i];sfx('up');
  if(cd.sp){addSpell(cd);closePack();return}
  if(cd.rl){addRelic(cd);closePack();return}
  if(cd.cr){addCrew(cd);closePack();return}
  const ex=R.mods.find(x=>x.t.id===cd.t.id);
  const mk=()=>({t:cd.t,r:cd.r,s:1,tier:R.ch,cd:0.3,fl:0,x:0,y:0});
  let target;
  if(ex){ex.s++;ex.r=Math.max(ex.r,cd.r);ex.tier=Math.max(ex.tier,R.ch);target=ex;ex.pop=0.6;addTxt(ex.x,ex.y*K-40,'★'+(ex.s-1)+' → ★'+ex.s,'#ffd24a',20);sfx('starup');vo('star_up');R.fx.push({type:'ring',x:ex.x,y:ex.y*K,r0:4,r1:60,t:0.5,T:0.5,c:'#ffd24a'});for(let k=0;k<24;k++)R.pt.push({x:ex.x,y:ex.y*K-14,vx:rnd(-140,140),vy:rnd(-220,-40),t:rnd(.5,.9),c:k%2?'#ffd24a':'#fff6c0',s:3,g:260,add:1})}
  else if(R.mods.length<R.slots){target=mk();target.drop=0.45;target.sl=bestSlot(cd.t);R.mods.push(target);sfx('place')}
  else{let wi=0;R.mods.forEach((h,j)=>{if(power(h)<power(R.mods[wi]))wi=j});target=mk();target.drop=0.45;target.sl=R.mods[wi].sl;R.mods[wi]=target;sfx('place')}
  const prevSyn=Object.assign({},R.syn);layoutMods();renderChips();closePack();synCelebrate(prevSyn);ringCelebrate();
  R.fx.push({type:'ring',x:target.x,y:target.y*K,r0:4,r1:34,t:0.4,T:0.4,c:TYPES[cd.t.ty].c});
  for(let k=0;k<14;k++)R.pt.push({x:target.x,y:target.y*K-10,vx:rnd(-90,90),vy:rnd(-150,-30),t:rnd(.3,.6),c:TYPES[cd.t.ty].c,s:3,g:300,add:1});
  if(!meta.tut.mod){vo('first_mod',1);}if(!meta.tut.mod)setTimeout(()=>tip('mod','Modules fire on their own. Get the <b>same module</b> again to upgrade it <b>★</b>.',false,6),300);
  else if(!meta.tut.syn&&Object.values(R.syn).some(n=>n>=2))setTimeout(()=>tip('syn','<b>Synergy!</b> 2 modules of one type: <b>+25% damage</b>. Reach 4 for a special effect.',false,7),300);
  else if(!meta.tut.ringtip&&R.mods.length>=2)setTimeout(()=>tip('ringtip','RING: modules side by side can LINK for big bonuses. Tap a module, then tap another slot to swap them. It is free. Tab shows all links.',false,8),300);
}
function closePack(){curCards=null;hide();if(R)R.paused=false}
function endRun(won){
  if(R.over)return;R.over=true;R.won=won;hideTip();musStinger(won?'victory':'defeat');
  if(won)for(const o of R.orbs){if(o.type==='scrap')R.gold+=o.v;else if(o.type==='core')R.cores+=o.v}
  sfx(won?'win':'lose');
  let m=Math.floor(R.cores+(R.wave-1)*10*Math.pow(1.6,R.ch-1));let unlocked=false,ending=false,nightUnlock='';
  if(won){m+=80*R.ch;if(meta.chapter===R.ch&&R.ch<MAXCH){meta.chapter++;meta.sel=meta.chapter;unlocked=true}
    if(R.ch===MAXCH&&!meta.story){meta.story=1;ending=true}
    if(R.night&&!meta.night[R.ch]){meta.night[R.ch]=1;ach('n'+R.ch);nightUnlock=UPG2.filter(u=>u.req==='n'+R.ch).map(u=>u.n).join(' + ')}}
  let hb=0;if(R.heat)hb=Math.round(m*R.heat);m+=hb;
  let rank='',rb=0;if(won&&!R.endless){rank=runRank(R);rb=Math.round(m*RANK_BONUS[rank]);m+=rb}
  if(R.endless)m+=R.bossKills*200;
  meta.mastery+=m;meta.runs++;meta.tut.done1=1;if(!R.endless)meta.best[R.ch]=Math.max(meta.best[R.ch]||0,won?BOSS_WAVE+1:R.wave);save();achScan();
  const r=R;
  setTimeout(()=>{show(`<div class="panel center"><div class="logo" style="font-size:34px;${won?'':'filter:grayscale(.6) drop-shadow(0 0 10px #f004)'}">${won?(ending?'THE LAST PART':'PART RECOVERED'):'HOPE FADES…'}</div>
    ${rank?`<div class="rankwrap"><div class="rankstamp rk-${rank}"><span>${rank}</span></div><div class="ranklbl">RANK</div></div>`:''}<div class="endstats">${r.endless?'∞ Endless':(r.night?'☠ ':'')+SITES[r.ch-1]} · Threat <b>${r.wave}</b>${r.endless?` · Best <b>${meta.bestEndless}</b>`:''} · ${Math.floor(r.t)}s<br>Kills <b>${r.kills}</b> · Crates <b>${r.packs}</b><br>
    Elites slain <b>${r.elitesKilled||0}</b> · Flawless waves <b>${r.flawless||0}</b> · Lowest Hope <b>${Math.round(r.minHopeP*100)}%</b><br>
    <span class="mast">+${fmt(m)} ✦ Xeno-cores</span>${rb?`<br><span class="rbonus">Rank ${rank} bonus: +${fmt(rb)} ✦</span>`:''}${hb?`<br><span class="rbonus">Heat bonus: +${fmt(hb)} ✦</span>`:''}${unlocked?(setTimeout(()=>vo('new_site',1),1300),'')+`<br><b style="color:#ffb03a">The ship can hop to a new site: ${SITES[meta.chapter-1]}!</b>`:''}${nightUnlock?`<br><b style="color:#c79bff">☠ Nightmare cleared! Unlocked: ${nightUnlock}</b>`:''}
    ${won?'':'<br><span style="color:#7f8899;font-size:12px">…but the cores you gathered can repair the ship.</span>'}</div>
    ${!won&&!r.endless?`<div class="goal"><div class="goalt">Boss appears at <b>Threat ${BOSS_WAVE}</b></div><div class="goalbar"><i style="width:${Math.min(100,r.wave/BOSS_WAVE*100)}%"></i><span style="left:${Math.min(100,(meta.best[r.ch]||r.wave)/BOSS_WAVE*100)}%" title="best"></span></div></div>`:''}
    ${(()=>{const n=UPG.filter(u=>lv(u.k)<u.max&&upCost(u)<=meta.mastery).length;return n?`<div class="affd">⚡ ${n} repair${n>1?'s':''} ready to install</div>`:''})()}
    <button class="big" id="toMenu">${ending?'🚀 LIFTOFF ▸':'REPAIR SHIP ▸'}</button>${ending?'':'<br><button class="small" id="toTitle2" style="margin-top:10px">🏠 Main menu</button>'}</div>`);if($('toTitle2'))$('toTitle2').onclick=()=>{sfx('click');titleScreen()};$('toMenu').onclick=()=>{sfx('click');if(ending)startEnding();else menu()};countUp(modal.querySelector('.mast'),m,'+',' ✦ Xeno-cores')},1100);
}

// ---------- hub coach: one short lesson at a time, matched to how far the player is ----------
function hubCoach(){
  const T=meta.tut,L=[
   ['h_rep',meta.runs>=1,'<b>Repair the ship</b>','Every run pays <b>✦ Xeno-cores</b>, win or lose. Spend them below on <b>permanent repairs</b> — each one makes every later run stronger. Then hit <b>BEGIN RUN</b>.'],
   ['h_rep2',meta.runs>=3,'<b>Cheap first, then the big ones</b>','<b>Module damage</b> and <b>Hope capacity</b> help every run. Save up for <b>Module slots</b> (more towers) and <b>Auto-cast</b>.'],
   ['h_site',meta.chapter>=2,'<b>New crash site</b>','Each site has new creatures and a boss. Pick the site with the buttons at the top. Beat it again for a better rank and more cores.'],
   ['h_ship',meta.chapter>=2,'<b>🛰 Ship</b>','Choose your ship and mutators here — they change how a run plays.'],
   ['h_night',Object.keys(meta.best||{}).some(k=>meta.best[k]>BOSS_WAVE),'<b>Warp &amp; Nightmare</b>','Cleared a boss? You can <b>warp</b> past the early waves, or replay the site on <b>Nightmare</b> for rare rewards and <b>Advanced repairs</b>.']
  ];
  const c=L.find(x=>x[1]&&!T[x[0]]);if(!c)return '';
  return `<div class="coach" id="coach"><div class="cb"><i class="ct">${c[2].replace(/<[^>]+>/g,'')}</i> <span>${c[3]}</span></div><button class="small" id="coachOk">OK</button></div>`;
}
function bindCoach(){
  const b=$('coachOk');if(!b)return;
  const id=(['h_rep','h_rep2','h_site','h_ship','h_night']).find(k=>!meta.tut[k]&&$('coach'));
  const T=meta.tut,order=['h_rep','h_rep2','h_site','h_ship','h_night'];
  b.onclick=()=>{sfx('click');const el=$('coach');const first=order.find(k=>!T[k]);
    // mark every lesson whose condition is already satisfied up to the one shown
    T[first]=1;save();el.remove()};
  // pulse affordable repairs on the first lesson
  if(!T.h_rep)modal.querySelectorAll('.up:not(.locked) button:not([disabled])').forEach((x,i)=>{if(i<3)x.classList.add('pulse')});
}
function menu(){
  R=null;document.body.classList.add('inmenu');hideTip();$('row1').innerHTML='';refreshReactBtn();renderSpellBar();
  const firstRepair=meta.runs>=1&&Object.keys(meta.up).length===0;if(firstRepair)setTimeout(()=>vo('repair'),400);
  const cheapest=UPG.filter(u=>lv(u.k)<u.max).sort((a,b)=>upCost(a)-upCost(b))[0];
  let h=`<div class="panel hubp"><div class="hubhead"><div class="hubbrand"><div class="logo">HOPEFIRE</div><div class="tag">When all hope is lost, the ship still fires. <span class="vertag">v${VERSION}</span></div></div><div class="hubmeta"><div class="mast">✦ Xeno-cores: <b>${fmt(meta.mastery)}</b></div><span class="hubslot">${esc(meta.name)} · <b class="d-${meta.diff}">${diffName(meta.diff)}</b> · Slot ${SLOT}</span></div></div>`;
  if(meta.runs>0){
    h+=`<div class="hubsites"><h2>CRASH SITES</h2><div class="chs">`;
    for(let i=1;i<=MAXCH;i++)h+=`<button data-ch="${i}" class="${meta.sel===i?'sel':''}" ${i>meta.chapter?'disabled':''}>${i}. ${i>meta.chapter?'🔒 ???':SITES[i-1]}${meta.best[i]>BOSS_WAVE?' ✓':''}${meta.night[i]?' ☠':''}</button>`;
    h+=`</div></div>${hubCoach()}<div class="hubbody">${meta.best[meta.sel]>BOSS_WAVE?`<label class="warp"><input type="checkbox" id="warpChk" ${meta.warp?'checked':''}> ⏩ Warp start — begin at Threat ${WARP_WAVE}</label><label class="warp nightOpt"><input type="checkbox" id="nightChk" ${meta.nightSel?'checked':''}> ☠ Nightmare — creatures ×${NM.hp[meta.sel-1]} HP, Xeno-cores ×${NM.core}${meta.night[meta.sel]?' (cleared)':''}</label>`:''}${meta.story?`<button class="endlessBtn" id="endlessBtn">∞ ENDLESS WASTES <small>best threat ${meta.bestEndless||0}</small></button>`:''}<h2>SHIP REPAIRS</h2>${firstRepair?'<div style="color:#ffb03a;font-size:12px;margin-bottom:8px">▸ Spend Xeno-cores to repair the ship. Every repair makes the next run last longer.</div>':''}<div class="ups">`;
    for(const u of UPG){const l=lv(u.k),mx=l>=u.max,c=upCost(u);
      h+=`<div class="up ${firstRepair&&u===cheapest?'hl':''}"><b>${u.n}</b><span class="lv">Lv ${l}/${u.max}</span><span>${l?u.d(l):'Next: '+u.d(1)}</span><button data-k="${u.k}" ${mx||meta.mastery<c?'disabled':''}>${mx?'MAX':'✦ '+fmt(c)}</button></div>`}
    h+=`</div>`;
    if(meta.story){h+=`<h2>ADVANCED REPAIRS</h2><div class="ups">`;
      for(const u of UPG2){const l=lv(u.k),mx=l>=u.max,c=upCost(u),ok=reqMet(u.req);
        h+=ok?`<div class="up adv"><b>${u.n}</b><span class="lv">Lv ${l}${u.max<999?'/'+u.max:''}</span><span>${l?u.d(l):'Next: '+u.d(1)}</span><button data-k="${u.k}" ${mx||meta.mastery<c?'disabled':''}>${mx?'MAX':'✦ '+fmt(c)}</button></div>`
          :`<div class="up locked"><b>🔒 ${u.n}</b><span class="lv">${REQ_TXT[u.req]}</span><span>${u.d(1)}</span></div>`}
      h+=`</div>`}
  }else h+=`<div class="hubbody"><p style="color:#9aa3b3;font-size:13px;line-height:1.7;margin:14px 0 20px">Your ship has crashed on an unknown planet.<br>Something is moving in the dark.</p>`;
  h+=`</div><div class="hubfoot"><button class="big" id="startBtn">▶ ${meta.runs?'BEGIN RUN':'WAKE UP'}</button><div class="menuRow">${meta.runs?`<button id="achBtn">🏆 ${ACH.filter(a=>meta.ach[a.id]).length}/${ACH.length}</button><button id="statBtn">📊 Stats</button>`:''}${meta.chapter>=2?`<button id="shipBtn"><img src="assets/ships/${meta.ship||'hope'}.png" alt="">Ship${meta.tut.shipSeen?'':'<span class="newdot">!</span>'}</button>`:''}<button id="menuBtn">🏠 Main menu</button><button id="setBtn">⚙ Settings</button>${meta.tut.intro?'<button id="introBtn">🎬 Intro</button>':''}${meta.story?'<button id="endBtn">🚀 Ending</button>':''}</div></div></div>`;
  show(h);bindCoach();
  modal.querySelectorAll('.chs button').forEach(b=>b.onclick=()=>{sfx('click');meta.sel=+b.dataset.ch;save();menu()});
  modal.querySelectorAll('.up button').forEach(b=>b.onclick=()=>{audioInit();const u=UPG.concat(UPG2).find(x=>x.k===b.dataset.k),c=upCost(u);if(meta.mastery>=c&&lv(u.k)<u.max){meta.mastery-=c;meta.up[u.k]=lv(u.k)+1;save();sfx('up');menu()}});
  $('startBtn').onclick=()=>{audioInit();sfx('click');hide();if(!meta.tut.intro)startCutscene('run');else{const c=Math.min(meta.sel,meta.chapter),ok=meta.best[c]>BOSS_WAVE;newRun(c,false,meta.warp&&ok,meta.nightSel&&ok)}};
  const nb=$('nightChk');if(nb)nb.onchange=e=>{meta.nightSel=e.target.checked;save()};
  const wb=$('warpChk');if(wb)wb.onchange=e=>{meta.warp=e.target.checked;save()};
  const ib=$('introBtn');if(ib)ib.onclick=()=>startCutscene('menu');
  const bind=(id,f)=>{const b=$(id);if(b)b.onclick=()=>{audioInit();sfx('click');f()}};
  bind('toTitleBtn',titleScreen);bind('menuBtn',titleScreen);bind('achBtn',panelAch);bind('statBtn',panelStats);bind('setBtn',panelSettings);bind('shipBtn',panelShip);bind('endBtn',()=>startEnding('menu'));
  bind('endlessBtn',()=>{hide();newRun(MAXCH,true)});
}
$('packBtn').onclick=openPack;$('loadBtn').onclick=()=>showLoadout();
function togglePause(force){
  if(!R||R.over||R.paused||CUT)return;const on=force!==undefined?force:!R.userPause;if(on===!!R.userPause)return;R.userPause=on;
  $('pauseBtn').textContent=on?'▶':'II';sfx('click');
  if(on)$('upd').classList.contains('hidden')&&showPausePanel();else{const p=$('pausePanel');if(p)p.remove()}
}
function showPausePanel(){const d=document.createElement('div');d.id='pausePanel';d.innerHTML='<div class="panel center" style="max-width:360px"><div class="logo" style="font-size:34px">PAUSED</div><p style="color:#9aa3b3;font-size:12px;margin:10px 0 16px">Esc / P to resume</p><button class="big" id="resumeBtn">▶ RESUME</button><div class="pmenu"><button class="small" id="pOpt">⚙ Options</button><button class="small" id="pLoad">☰ Loadout</button><button class="small" id="pHub">✕ Abandon run</button><button class="small" id="pTitle">⏏ Quit to title</button></div></div>';document.body.appendChild(d);$('resumeBtn').onclick=()=>togglePause(false);
  $('pOpt').onclick=()=>{d.remove();panelOptions(()=>{hide();showPausePanel()})};$('pLoad').onclick=()=>{togglePause(false);showLoadout()};
  $('pHub').onclick=()=>{d.remove();R.userPause=false;$('pauseBtn').textContent='II';endRun(false)};$('pTitle').onclick=()=>{d.remove();R.userPause=false;$('pauseBtn').textContent='II';toTitle()}}
$('pauseBtn').onclick=()=>togglePause();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&R&&!R.over&&!R.paused)togglePause(true)});
$('skipCut').onclick=endCutscene;
$('spdBtn').onclick=()=>{sfx('click');speed=speed===1?2:speed===2?3:1;$('spdBtn').textContent=speed+'x';meta.set.spd=speed;save()};
speed=meta.set.spd||1;
$('reactBtn').onclick=()=>{if(!R||R.over)return;sfx('click');R.react=(R.react+1)%3;refreshReactBtn();R.banner={s:'REACTOR: '+REACT[R.react].n,sub:reactSub(R.react),t:1.8};R.ringPulse=0.6};
$('muteBtn').onclick=()=>{meta.muted=!meta.muted;save();audioInit();applyVolume();$('muteBtn').textContent=meta.muted?'🔇':'🔊'};
$('muteBtn').textContent=meta.muted?'🔇':'🔊';
$('quitBtn').onclick=()=>{const b=$('quitBtn');if(!R||R.over||R.paused)return;if(b.dataset.c){delete b.dataset.c;b.textContent='✕';endRun(false)}else{b.dataset.c=1;b.textContent='?';setTimeout(()=>{delete b.dataset.c;b.textContent='✕'},1500)}};
addEventListener('keydown',e=>{if($('einfo')&&(e.code==='Escape'||e.code==='Space')){$('einfo').click();e.preventDefault();return}if($('loadout')&&(e.code==='Escape'||e.code==='Tab')){closeLoadout();e.preventDefault();return}if(e.code==='Tab'){e.preventDefault();showLoadout();return}if(e.code==='Escape'||e.code==='KeyP'){togglePause();return}if(R&&R.userPause)return;if(e.code==='Space'){e.preventDefault();if(R&&R.tipPause&&$('tipOk'))$('tipOk').click();else if($('crateEl'))$('crateEl').click();else openPack()}else if(curCards&&/^Digit[1-5]$/.test(e.code)&&modal.querySelector('.card')&&+e.code[5]<=curCards.length)pick(+e.code[5]-1);else if(e.code==='KeyR')$('reactBtn').click();else if(e.code==='KeyF'&&R&&!curCards)castOverdrive();else if(R&&!curCards&&/^Key[QWE]$/.test(e.code))castSpell('QWE'.indexOf(e.code[3]))});

function countUp(el,v,pre,suf){if(!el)return;const t0=performance.now(),D=900;const f=()=>{const p=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-p,3);el.textContent=pre+fmt(Math.floor(v*e))+suf;if(p<1){if(Math.random()<0.5)sfx('pick');requestAnimationFrame(f)}else{el.classList.add('done');sfx('up')}};f()}

// ---------- small touches: hover tick + press ripple on every button/card ----------
(function(){let last=null,lt=0;
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const b=e.target.closest&&e.target.closest('button:not(:disabled):not(.tbtn),.card');
    if(b&&b!==last&&performance.now()-lt>60){last=b;lt=performance.now();if(typeof sfx==='function'&&!b.classList.contains('card'))sfx('flip0')}else if(!b)last=null});
  document.addEventListener('pointerdown',e=>{if(!SETTINGS||SETTINGS.flashes===0)return;const b=e.target.closest&&e.target.closest('button:not(:disabled),.card');if(!b)return;
    const r=document.createElement('div');r.className='rip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.addEventListener('animationend',()=>r.remove())});
})();
