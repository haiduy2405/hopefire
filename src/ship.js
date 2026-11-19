"use strict";
// ===== v0.14 SHIPS & MUTATORS (replay value) =====
// A ship changes how a run plays (passive multipliers in R.mx); mutators are optional extra rules that pay a "Heat" bonus
// in Xeno-cores. Everything is driven by R.mx / R.heat so future game modes can reuse or set them.
const SHIPS=[
  {k:'hope',n:'S.V. HOPE',d:'Balanced. The ship that crashed here.',req:()=>true,reqT:'',mx:{}},
  {k:'bulwark',n:'BULWARK',d:'+35% max Hope, Hope drains 15% slower, but −10% damage.',req:()=>meta.chapter>=2,reqT:'Clear Site 1',mx:{hope:1.35,drain:.85,dmg:.9}},
  {k:'prism',n:'PRISM',d:'Starts with a free Rare module and +40% rare odds. Crates cost 25% more.',req:()=>meta.chapter>=4,reqT:'Clear Site 3',mx:{luck:1.4,crate:1.25},kit:1},
  {k:'ember',n:'EMBER',d:'+25% damage and +15% fire rate, but Hope drains 30% faster.',req:()=>!!meta.story,reqT:'Finish the story',mx:{dmg:1.25,rate:1.15,drain:1.3}}
];
const MUTS=[
  {k:'swarm',n:'Swarm',d:'30% more creatures, each with 15% less HP.',heat:.2,mx:{spawn:1.3,ehp:.85}},
  {k:'hunt',n:'Elite Hunt',d:'Every wave event brings an Elite.',heat:.25,mx:{elite:1}},
  {k:'glass',n:'Glass Hope',d:'−35% max Hope, +30% damage.',heat:.25,mx:{hope:.65,dmg:1.3}},
  {k:'famine',n:'Famine',d:'35% less scrap from creatures.',heat:.2,mx:{scrap:.65}},
  {k:'frenzy',n:'Frenzy',d:'Creatures move 25% faster.',heat:.2,mx:{espd:1.25}}
];
const MAX_MUT=2;
function shipOf(k){return SHIPS.find(s=>s.k===k)||SHIPS[0]}
function shipMx(){
  const sh=shipOf(meta.ship),ok=sh.req()?sh:SHIPS[0],mx={};let heat=0;
  const mul=o=>{for(const k in o)mx[k]=(mx[k]===undefined?1:mx[k])*o[k]};
  mul(ok.mx);const ms=(meta.muts||[]).filter(k=>MUTS.some(m=>m.k===k)).slice(0,MAX_MUT);
  for(const k of ms){const m=MUTS.find(x=>x.k===k);mul(m.mx);heat+=m.heat}
  return {mx,heat,ship:ok,muts:ms};
}
const MX=k=>(R&&R.mx&&R.mx[k])||1;
function setupLoadoutMods(){ // called by newRun right after R exists
  const s=shipMx();R.mx=s.mx;R.heat=s.heat;R.shipK=s.ship.k;R.mutK=s.muts;
  if(s.ship.kit)R.mods.push({t:pickMod(true),r:1,s:1,tier:R.ch,cd:0.5,fl:0,x:0,y:0});
  if(s.ship.k!=='hope'||s.muts.length){const tag=(s.ship.k!=='hope'?s.ship.n:'')+(s.muts.length?(s.ship.k!=='hope'?' · ':'')+s.muts.map(k=>MUTS.find(m=>m.k===k).n).join(' + '):'');
    if(R.banner&&R.banner.sub)R.banner.sub+=' · '+tag}
}
const SHIP_COL={hope:'#ffb03a',bulwark:'#4aa8ff',prism:'#b58cff',ember:'#ff5a2a'};
const MUT_ICO={swarm:'🐜',hunt:'🎯',glass:'🔮',famine:'🥀',frenzy:'⚡'};
const SHIP_ST=[['hope','Hope',1],['drain','Hope drain',-1],['dmg','Damage',1],['rate','Fire rate',1],['luck','Rare odds',1],['crate','Crate cost',-1]];
function shipChips(s){
  const c=SHIP_ST.filter(x=>s.mx[x[0]]).map(x=>{const v=s.mx[x[0]],p=Math.round((v-1)*100),good=(p>0)===(x[2]>0);return `<i class="${good?'g':'b'}">${p>0?'+':'−'}${Math.abs(p)}% ${x[1]}</i>`});
  if(s.kit)c.push('<i class="g">Free Rare module</i>');
  return c.join('')||'<i class="n">Balanced · no bonuses</i>';
}
let SHIP_PV=null;
function panelShip(pv){
  meta.tut.shipSeen=1;save();
  const cur=shipMx(),ms=cur.muts,sel=SHIPS.find(s=>s.k===(pv||SHIP_PV||cur.ship.k))||cur.ship;SHIP_PV=sel.k;
  const open=sel.req(),equipped=cur.ship.k===sel.k,col=SHIP_COL[sel.k];
  const sc=SHIPS.map(s=>{const o=s.req(),on=cur.ship.k===s.k;
    return `<button class="shipc ship ${on?'on':''} ${o?'':'lock'} ${sel.k===s.k?'pv':''}" style="--sc:${SHIP_COL[s.k]}" data-s="${s.k}"><img src="assets/ships/${s.k}.png" alt=""><b>${s.n}</b><span>${o?(on?'EQUIPPED':'Tap to inspect'):'🔒 '+s.reqT}</span></button>`}).join('');
  const mc=MUTS.map(m=>{const on=ms.includes(m.k);
    return `<button class="shipc mut ${on?'on':''}" data-m="${m.k}"><em>${MUT_ICO[m.k]||'✦'}</em><b>${m.n} <i>+${Math.round(m.heat*100)}%</i></b><span>${m.d}</span></button>`}).join('');
  show(`<div class="panel center shippanel"><h2>🛰 SHIP &amp; MUTATORS</h2>
    <div class="shipstage ${open?'':'lockd'}" style="--sc:${col}"><div class="stars s1"></div><div class="stars s2"></div><div class="sglow"></div>
      <img class="shipimg" id="shipImg" src="assets/ships/${sel.k}.png" alt="${sel.n}"><div class="sflame"></div><div class="sscan"></div>
      <div class="shipinfo"><div class="sn">${sel.n}${equipped?' <u>EQUIPPED</u>':''}</div><div class="sd">${sel.d}</div><div class="schips">${shipChips(sel)}</div>
      ${open?(equipped?'':'<button class="big shipEq" id="eqBtn">EQUIP ▸</button>'):`<div class="sreq">🔒 ${sel.reqT}</div>`}</div></div>
    <div class="shipg ships">${sc}</div>
    <div class="shiph">MUTATORS <small>pick up to ${MAX_MUT} (a 3rd replaces the oldest) · harder runs pay more ✦</small></div><div class="shipg muts">${mc}</div>
    <p class="heatl">Heat bonus: <b>${cur.heat?'+'+Math.round(cur.heat*100)+'% Xeno-cores':'none'}</b></p>
    <button class="big" id="backBtn">◂ BACK</button></div>`);
  modal.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{sfx('click');const s=SHIPS.find(x=>x.k===b.dataset.s);if(s.req()&&s.k===cur.ship.k)return panelShip(s.k);if(s.k!==SHIP_PV){panelShip(s.k)}});
  const eq=$('eqBtn');if(eq)eq.onclick=()=>{meta.ship=sel.k;save();sfx('up');panelShip(sel.k);const im=$('shipImg');if(im){im.classList.remove('equip');void im.offsetWidth;im.classList.add('equip')}};
  modal.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m,a=(meta.muts||[]).slice();const i=a.indexOf(k);if(i>=0)a.splice(i,1);else{if(a.length>=MAX_MUT)a.shift();a.push(k)}meta.muts=a;save();sfx('click');panelShip(SHIP_PV)});
  $('backBtn').onclick=()=>{sfx('click');SHIP_PV=null;menu()};
}
