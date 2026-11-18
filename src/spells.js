"use strict";
// ===== SPELLS =====
// Spells come out of salvage crates (after the first crate). Max 3 equipped.
// Tap / Q-W-E to cast. Duplicate spell = level up (stronger + shorter cooldown).
const SPELLS=[
  {id:'flare',n:'Solar Flare',g:'☀',c:'#ffb03a',cd:22,d:'Scorches every creature inside the ring'},
  {id:'nova',n:'Cryo Nova',g:'❄',c:'#5cd0ff',cd:26,d:'Freezes creatures in the ring for ~4s'},
  {id:'over',n:'Overcharge',g:'⚡',c:'#ffe14d',cd:30,d:'Modules fire 2× faster for ~6s'},
  {id:'cell',n:'Emergency Cell',g:'✚',c:'#7dffb0',cd:40,d:'Restores ~20% Hope instantly'},
  {id:'pulse',n:'Shock Pulse',g:'◎',c:'#c79bff',cd:18,d:'Blasts nearby creatures away & stuns them'}
];
const MAX_SPELLS=3,SPELL_CHANCE=0.2;
const spellPow=s=>RAR[s.r].m*(1+0.5*(s.lv-1));
const spellCd=s=>s.d.cd*Math.pow(0.9,s.lv-1)*(1-0.06*lv('cap'));
function addSpell(cd){
  const ex=R.spells.find(s=>s.d.id===cd.sp.id);
  if(ex){ex.lv++;ex.r=Math.max(ex.r,cd.r);addTxt(0,-80,ex.d.n+' Lv'+ex.lv,ex.d.c,13)}
  else{const s={d:cd.sp,r:cd.r,lv:1,cd:0};
    if(R.spells.length<MAX_SPELLS)R.spells.push(s);
    else{let wi=0;R.spells.forEach((x,i)=>{if(spellPow(x)<spellPow(R.spells[wi]))wi=i});R.spells[wi]=s}}
  renderSpellBar();
  if(!meta.tut.spell)setTimeout(()=>tip('spell','<b>Spell acquired!</b> Tap it (or Q / W / E) to cast. It recharges over time.',false,6),300);
}
function castSpell(i){
  const s=R&&R.spells[i];if(!s||s.cd>0||R.paused||R.over||R.tipPause)return;
  audioInit();s.cd=spellCd(s);meta.stats.spells++;const p=spellPow(s),rr=ringR();
  switch(s.d.id){
    case 'flare':{const dmg=40*p*tierM(R.ch)*(1+0.15*lv('dmg'));
      for(const e of R.en)if(!e.dead&&Math.hypot(e.x,e.y)<rr)hit(e,dmg,'Thermal',false);
      R.fx.push({type:'boom',x:0,y:0,r:rr,t:0.7,T:0.7,c:'#ffb03a'});flash(0.35);sfx('boom');R.shake=10;break}
    case 'nova':{const t=Math.min(8,4*(0.75+0.25*p));
      for(const e of R.en)if(!e.dead&&Math.hypot(e.x,e.y)<rr*1.1){e.frz=e.k==='boss'?t*0.4:t;e.slow=Math.max(e.slow,e.frz)}
      R.fx.push({type:'boom',x:0,y:0,r:rr,t:0.7,T:0.7,c:'#5cd0ff'});sfx('cell');break}
    case 'over':R.overT=Math.min(14,6*(0.8+0.2*p));sfx('up');break;
    case 'cell':R.hope=Math.min(R.maxHope,R.hope+R.maxHope*0.2*Math.min(2.5,0.8+0.2*p));sfx('cell');addTxt(0,-70,'+HOPE','#7dffb0',14);break;
    case 'pulse':{const push=110*Math.min(2,0.8+0.2*p);
      for(const e of R.en){if(e.dead)continue;const d=Math.hypot(e.x,e.y)||1;if(d<150){const f=e.k==='boss'?0.25:1;e.x+=e.x/d*push*f;e.y+=e.y/d*push*f;if(e.state==='rush')e.alertT=Math.max(e.alertT,0.9*f)}}
      R.fx.push({type:'ring',x:0,y:0,r0:20,r1:160,t:0.45,T:0.45,c:'#c79bff'});sfx('boom');R.shake=6;break}
  }
  R.banner={s:s.d.n.toUpperCase()+'!',t:0.9};renderSpellBar();
}
function spellTick(dt){for(const s of R.spells)if(s.cd>0)s.cd=Math.max(0,s.cd-dt);if(R.overT>0)R.overT-=dt}
function renderSpellBar(){
  const bar=$('spellBar');if(!R||!R.spells.length){bar.innerHTML='';bar.style.display='none';return}
  bar.style.display='flex';
  bar.innerHTML=R.spells.map((s,i)=>`<button class="spell" data-i="${i}" style="border-color:${RAR[s.r].c};color:${s.d.c}" title="${s.d.n}: ${s.d.d}">
    <span class="sg">${ico('sp_'+s.d.id,2,0,s.d.g)}</span><span class="sl">${'QWE'[i]} · Lv${s.lv}</span><span class="cdov"></span></button>`).join('');
  if(lv('auto'))bar.innerHTML+=`<button class="autoBtn ${meta.autoCast?'on':''}" id="autoBtn">AUTO<br>${meta.autoCast?'ON':'OFF'}</button>`;
  bar.querySelectorAll('.spell').forEach(b=>b.onclick=()=>castSpell(+b.dataset.i));
  const ab=$('autoBtn');if(ab)ab.onclick=()=>{meta.autoCast=!meta.autoCast;save();sfx('click');renderSpellBar()};
}
function spellHud(){
  if(!R)return;const bs=$('spellBar').querySelectorAll('.spell');
  R.spells.forEach((s,i)=>{const b=bs[i];if(!b)return;const f=s.cd>0?s.cd/spellCd(s):0;b.querySelector('.cdov').style.height=(f*100)+'%';b.classList.toggle('ready',f===0)});
}
