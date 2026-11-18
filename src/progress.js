"use strict";
// ===== PROGRESS: stats, achievements, settings, autocast =====
const ACH_REWARD=50;
const ACH=[
  {id:'first',n:'First Light',d:'Kill your first creature',c:()=>meta.stats.kills>=1},
  {id:'k1k',n:'Exterminator',d:'Kill 1,000 creatures',c:()=>meta.stats.kills>=1000},
  {id:'k10k',n:'Apex Predator',d:'Kill 10,000 creatures',c:()=>meta.stats.kills>=10000},
  {id:'crates',n:'Scavenger',d:'Open 50 salvage crates',c:()=>meta.stats.crates>=50},
  {id:'legend',n:'Jackpot',d:'Find a Legendary card',c:()=>meta.stats.legend>=1},
  {id:'spells',n:'Arcane Engineer',d:'Cast 50 spells',c:()=>meta.stats.spells>=50},
  {id:'syn4',n:'Perfect Harmony',d:'Reach a 4-module synergy'},
  {id:'arsenal',n:'Full Arsenal',d:'Have 8 modules at once'},
  {id:'relic3',n:'Collector',d:'Carry 3 relics in one run'},
  {id:'b1',n:'Devourer Down',d:'Defeat The Devourer'},
  {id:'b2',n:'Brood Breaker',d:'Defeat the Brood Mother'},
  {id:'b3',n:'Crushed',d:'Defeat The Crusher'},
  {id:'b4',n:'Ghostbuster',d:'Defeat the Phantom Warlord'},
  {id:'b5',n:'Origin Story',d:'Defeat The Origin'},
  {id:'over',n:'Living Dangerously',d:'Defeat a boss on OVERDRIVE'},
  {id:'calm',n:'Untouchable',d:'Clear a site without Hope dropping below 50%'},
  {id:'escape',n:'Liftoff',d:'Repair the ship and escape the planet'},
  {id:'n1',n:'Nightmare: Crash Site',d:'Clear ☠ Crash Site'},
  {id:'n2',n:'Nightmare: Research Wreck',d:'Clear ☠ Research Wreck'},
  {id:'n3',n:'Nightmare: Mining Hulk',d:'Clear ☠ Mining Hulk'},
  {id:'n4',n:'Nightmare: War Graveyard',d:'Clear ☠ War Graveyard'},
  {id:'n5',n:'Nightmare: The Origin',d:'Clear ☠ The Origin'},
  {id:'oc25',n:'Beyond Limits',d:'Reach Overclock level 25',c:()=>lv('oc')>=25},
  {id:'end20',n:'Endless Night',d:'Reach Threat 20 in Endless'},
  {id:'end40',n:'Eternal Flame',d:'Reach Threat 40 in Endless'}
];
function ach(id){
  if(meta.ach[id])return;const a=ACH.find(x=>x.id===id);if(!a)return;
  meta.ach[id]=Date.now();meta.mastery+=ACH_REWARD;save();
  toast(`🏆 <b>${a.n}</b> — ${a.d} <span style="color:#c79bff">+${ACH_REWARD} ✦</span>`);sfx('rare');
}
function achScan(){for(const a of ACH)if(a.c&&!meta.ach[a.id]&&a.c())ach(a.id)}
function toast(html){
  const box=$('toasts'),el=document.createElement('div');el.className='toast';el.innerHTML=html;box.appendChild(el);
  setTimeout(()=>el.classList.add('out'),3600);setTimeout(()=>el.remove(),4200);
}
const fmtTime=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h}h ${m}m`:`${m}m ${s%60}s`};
function panelAch(){
  const got=ACH.filter(a=>meta.ach[a.id]).length;
  show(`<div class="panel"><h2>🏆 ACHIEVEMENTS ${got}/${ACH.length}</h2><div class="achs">${ACH.map(a=>`<div class="ach ${meta.ach[a.id]?'got':''}"><b>${meta.ach[a.id]?'🏆':'🔒'} ${a.n}</b><span>${a.d}</span></div>`).join('')}</div>
    <div class="center"><button class="big" id="backBtn">◂ BACK</button></div></div>`);$('backBtn').onclick=()=>{sfx('click');menu()};
}
function panelStats(){
  const s=meta.stats,rows=[['Runs',meta.runs],['Creatures killed',fmt(s.kills)],['Crates opened',s.crates],['Spells cast',s.spells],['Bosses defeated',s.bosses],
    ['Legendary cards found',s.legend],['Sites cleared',Object.values(meta.best).filter(v=>v>BOSS_WAVE).length+' / '+MAXCH],['Best Endless threat',meta.bestEndless||'—'],['Time on the planet',fmtTime(s.time)]];
  show(`<div class="panel"><h2>📊 STATS</h2><table class="stats">${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
    <div class="center"><button class="big" id="backBtn">◂ BACK</button></div></div>`);$('backBtn').onclick=()=>{sfx('click');menu()};
}
function applyVolume(){if(master)master.gain.value=meta.muted?0:meta.set.vol/100;if(typeof applyMusicVolume==='function')applyMusicVolume()}
// autocast: cast ready spells when the situation calls for it
function autoCastTick(dt){
  if(!lv('auto')||!meta.autoCast||!R.spells.length)return;
  R.autoT-=dt;if(R.autoT>0)return;R.autoT=0.5;
  const rr=ringR();let rushIn=0,near=0,bossIn=false;
  for(const e of R.en){if(e.dead||e.state!=='rush')continue;const d=Math.hypot(e.x,e.y);if(d<rr){rushIn++;if(e.k==='boss')bossIn=true}if(d<130)near++}
  R.spells.forEach((s,i)=>{
    if(s.cd>0)return;const id=s.d.id;
    if((id==='flare'&&(rushIn>=4||bossIn))||(id==='nova'&&(rushIn>=5||bossIn&&near>0))||(id==='over'&&rushIn>=3)||(id==='cell'&&R.hope<R.maxHope*0.55)||(id==='pulse'&&near>=3))castSpell(i);
  });
}
