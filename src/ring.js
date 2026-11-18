"use strict";
// ===== RING: slots, LINKS between neighbouring modules, rearranging =====
// Modules sit on a ring of R.slots slots (h.sl = slot index). Two modules in neighbouring slots can form
// LINKS: one from their elements, one from their classes. Links never punish — a bad arrangement just has
// fewer bonuses. Rearranging is free (the two swapped modules need a short re-sync before firing again).
// All numbers live in LK_EL / LK_CL below.

let CURH=null; // module whose shot is being resolved (hit() reads CURH.lk for link effects)

const LK_EL={
  'Cryo+Thermal':{n:'THERMAL SHOCK',c:'#ff9a5c',d:'+60% damage against slowed or frozen creatures',f:L=>{L.shock=1}},
  'Arc+Thermal':{n:'PLASMA',c:'#ffb84d',d:'Hits ignite the target (40% of the hit again over 2 s)',f:L=>{L.plasma=1}},
  'Nano+Thermal':{n:'FORGE',c:'#c9d86a',d:'+20% damage, and each hit restores a little Hope',f:L=>{L.dmg*=1.2;L.forge=1}},
  'Arc+Cryo':{n:'STATIC FIELD',c:'#9fe8ff',d:'+25% fire rate, and hits slow the target',f:L=>{L.rate*=1.25;L.stat=1}},
  'Cryo+Nano':{n:'CRYO-SLEEP',c:'#8fe8d8',d:'Hits freeze up creatures far more often',f:L=>{L.sleep=1}},
  'Arc+Nano':{n:'OVERCHARGE',c:'#c8ff8a',d:'+25% range and +15% fire rate',f:L=>{L.range*=1.25;L.rate*=1.15}}
};
const LK_SAME={n:'RESONANCE',c:'#ffffff',d:'+15% damage (two modules of one element side by side)',f:L=>{L.dmg*=1.15}};
const LK_CL={
  'lance+rail':{n:'SPOTTER',c:'#ff7ad9',d:'Hits expose the target: everyone deals +25% to it for 1.5 s',f:L=>{L.spot=1}},
  'mortar+rail':{n:'RANGEFINDER',c:'#7ad0ff',d:'+10% range; mortar blasts +30% wider',f:L=>{L.range*=1.1;L.aoe*=1.3}},
  'lance+mortar':{n:'DEMOLITION',c:'#ffd27a',d:'Lance splash +65% wider; mortar +15% damage',f:L=>{L.splash=1.65;L.dmg*=1.15}}
};
const ringN=()=>R?R.slots:4;
const modAt=(sl)=>R.mods.find(h=>h.sl===sl);
const slotAng=sl=>-Math.PI/2+Math.PI/ringN()+sl*2*Math.PI/ringN();
const slotXY=sl=>[Math.cos(slotAng(sl))*82,Math.sin(slotAng(sl))*82];
const ringNeigh=sl=>{const n=ringN();return [(sl+n-1)%n,(sl+1)%n]};
const ekey=(a,b)=>[a,b].sort().join('+');
// links between two module types (a,b are MODS entries) → [{k:'e'|'s'|'c', d:def}]
function linksBetween(a,b){
  const out=[];
  if(a.ty===b.ty)out.push({k:'RESONANCE',d:LK_SAME});else{const d=LK_EL[ekey(a.ty,b.ty)];if(d)out.push({k:ekey(a.ty,b.ty),d})}
  if(a.c!==b.c){const d=LK_CL[ekey(a.c,b.c)];if(d)out.push({k:ekey(a.c,b.c),d})}
  return out;
}
// recompute positions, element synergy counts and links. Call after any change to R.mods / slots.
function layoutMods(){
  const n=R.slots,used=new Set();R.syn={};
  for(const h of R.mods){if(!(h.sl>=0&&h.sl<n)||used.has(h.sl))h.sl=-1;else used.add(h.sl)}
  for(const h of R.mods)if(h.sl<0){let s=0;while(used.has(s))s++;h.sl=s;used.add(s)}
  for(const h of R.mods){const [x,y]=slotXY(h.sl);h.x=x;h.y=y;R.syn[h.t.ty]=(R.syn[h.t.ty]||0)+1;h.lk={dmg:1,rate:1,range:1,aoe:1,splash:1,names:[]}}
  const old=R.linkKeys||{},now={};R.links=[];
  for(const h of R.mods){const nb=ringNeigh(h.sl)[1];if(nb===h.sl)continue;const o=modAt(nb);if(!o||o===h)continue;
    for(const l of linksBetween(h.t,o.t)){
      for(const m of [h,o]){l.d.f(m.lk);m.lk.names.push(l.d.n)}
      const key=h.sl+'>'+nb+':'+l.d.n;now[key]=1;R.links.push({a:h,b:o,d:l.d,key,fresh:!old[key]});
    }}
  if(typeof applyAmps==='function')applyAmps();
  // Harmony: reward a ring where every module has a link
  const linked=R.mods.filter(h=>h.lk.names.length>0).length,tot=R.mods.length;
  R.harm=1;R.harmN='';
  if(tot>=3&&linked===tot){const all2=R.mods.every(h=>h.lk.names.length>=2);R.harm=all2?1.2:1.1;R.harmN=all2?'PERFECT RING':'HARMONY'}
  R.linkKeys=now;
  if(Object.values(R.syn).some(v=>v>=4))ach('syn4');if(R.mods.length>=8)ach('arsenal');
}
// slot for a new module: empty slot that forms the most links (ties → first)
function bestSlot(t){
  const n=ringN();let best=-1,bs=-1;
  for(let s=0;s<n;s++){if(modAt(s))continue;let sc=0;
    for(const nb of ringNeigh(s)){const o=modAt(nb);if(o)sc+=linksBetween(t,o.t).length}
    if(sc>bs){bs=sc;best=s}}
  return best;
}
// links a card would create if placed in its best slot — for the card text
function cardLinks(t){
  const s=bestSlot(t);if(s<0)return [];const out=[];
  for(const nb of ringNeigh(s)){const o=modAt(nb);if(o)for(const l of linksBetween(t,o.t))if(!out.some(x=>x.d.n===l.d.n))out.push({d:l.d,with:o.t.n})}
  return out;
}
function linkHintHTML(cd){
  if(!R||cd.t.c==='drone')return '';
  if(R.mods.some(x=>x.t.id===cd.t.id))return '';
  const L=cardLinks(cd.t);
  if(!L.length)return `<div class="lkh none">no link yet</div>`;
  return `<div class="lkh">${L.map(l=>`<span style="--lc:${l.d.c}" title="${l.d.d}">⛓ ${l.d.n}</span>`).join('')}</div>`;
}
// swap two slots (either may be empty). The moved modules re-sync for a moment.
function ringSwap(a,b){
  if(!R||R.over||a===b)return false;const ha=modAt(a),hb=modAt(b);if(!ha&&!hb)return false;
  if(ha)ha.sl=b;if(hb)hb.sl=a;
  for(const h of [ha,hb])if(h){h.cd=Math.max(h.cd||0,1.2);h.sync=1.2;h.pop=0.4}
  layoutMods();renderChips();sfx('swap');
  for(const h of R.mods)if(h===ha||h===hb)R.fx.push({type:'ring',x:h.x,y:h.y*K,r0:4,r1:38,t:0.4,T:0.4,c:TYPES[h.t.ty].c});
  ringCelebrate();
  return true;
}
function ringCelebrate(){
  const fresh=R.links.filter(l=>l.fresh);
  fresh.forEach((l,i)=>{const mx=(l.a.x+l.b.x)/2,my=((l.a.y+l.b.y)/2)*K;
    R.fx.push({type:'ring',x:mx,y:my-12,r0:4,r1:54,t:0.55,T:0.55,c:l.d.c});
    for(let j=0;j<10;j++)R.pt.push({x:mx,y:my-12,vx:rnd(-110,110),vy:rnd(-130,-20),t:rnd(.3,.7),c:l.d.c,s:3,g:200,add:1});
    setTimeout(()=>{if(R&&!R.over&&R.txt.length<80)R.txt.push({x:mx,y:wordY(mx,my-30,13),v:'⛓ '+l.d.n,c:l.d.c,t:1.5,T:1.5,s:13,w:1,rx:1})},i*220)});
  if(fresh.length){sfx('link');if(!meta.tut.ring2){meta.tut.ring2=1;save()}}
  if(R.harmN&&R.harmN!==R.harmShown){R.harmShown=R.harmN;R.banner={s:R.harmN,sub:'every module is linked: +'+Math.round((R.harm-1)*100)+'% team damage',t:2.2};sfx('synergy')}
  else if(!R.harmN)R.harmShown='';
}
// ---------- drawing ----------
function drawRing(T){
  if(!R)return;const c=ctx,n=ringN();
  c.save();
  // empty slot pads (always faint; clearer while editing)
  const edit=R.rsel!==undefined&&R.rsel>=0||R.rdrag;
  for(let s=0;s<n;s++)if(!modAt(s)){const [x,y]=slotXY(s);c.globalAlpha=edit?0.75:0.28;c.strokeStyle=edit?'#ffd24a':'#8a94a6';c.lineWidth=1.5;c.setLineDash([4,4]);c.beginPath();c.ellipse(x,y*K+2,16,6.4,0,0,7);c.stroke();c.setLineDash([])}
  // link beams
  c.globalCompositeOperation='lighter';
  for(const l of R.links){const a=l.a,b=l.b,x1=a.x,y1=a.y*K-8,x2=b.x,y2=b.y*K-8,pul=0.55+0.25*Math.sin(T*3+a.sl);
    c.globalAlpha=pul;c.strokeStyle=l.d.c;c.lineWidth=2.2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    c.globalAlpha=pul*0.35;c.lineWidth=6;c.stroke();
    const t=(T*0.6+a.sl*0.17)%1;c.globalAlpha=0.9;c.fillStyle='#fff';c.beginPath();c.arc(x1+(x2-x1)*t,y1+(y2-y1)*t,1.8,0,7);c.fill()}
  c.restore();
  // selection / drag highlight
  const sel=R.rdrag&&R.rdrag.moved?R.rdrag.sl:R.rsel;
  if(sel!==undefined&&sel>=0){const [x,y]=slotXY(sel);c.save();c.strokeStyle='#ffd24a';c.lineWidth=2.5;c.globalAlpha=0.7+0.3*Math.sin(T*9);c.beginPath();c.ellipse(x,y*K+2,22,9,0,0,7);c.stroke();c.restore()}
  if(R.rdrag&&R.rdrag.moved){c.save();c.globalAlpha=0.8;c.strokeStyle='#ffd24a';c.setLineDash([5,5]);c.lineWidth=1.5;const [x,y]=slotXY(R.rdrag.sl);c.beginPath();c.moveTo(x,y*K-8);c.lineTo(R.rdrag.x,R.rdrag.y);c.stroke();c.restore()}
  // sync indicator
  for(const h of R.mods)if(h.sync>0){h.sync-=1/60;c.save();c.globalAlpha=0.7;c.strokeStyle='#7ad0ff';c.lineWidth=2;c.beginPath();c.arc(h.x,h.y*K-16,10+h.sync*6,0,Math.PI*2*(h.sync/1.2));c.stroke();c.restore()}
  // link name labels near a hovered / selected module
  const hv=R.rhover!==undefined?R.rhover:sel;
  if(hv!==undefined&&hv>=0){for(const l of R.links)if(l.a.sl===hv||l.b.sl===hv){const mx=(l.a.x+l.b.x)/2,my=((l.a.y+l.b.y)/2)*K-26;
    c.save();c.font='bold 10px monospace';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#000';c.fillStyle=l.d.c;c.strokeText(l.d.n,mx,my);c.fillText(l.d.n,mx,my);c.restore()}}
}
// ---------- pointer: tap a module, then tap another slot (or drag) to swap ----------
function ringHit(ev){
  const wx=(ev.clientX-OX)/S,wy=(ev.clientY-OY)/S;let best=-1,bd=1e9;const tol=26/Math.max(S,0.6);
  for(let s=0;s<ringN();s++){const [x,y]=slotXY(s),dx=x-wx,dy=y*K-14-wy,dd=dx*dx+dy*dy;if(dd<tol*tol&&dd<bd){bd=dd;best=s}}
  return best;
}
function ringPointer(ev){
  if(!R||R.over||R.paused||R.userPause||R.tipPause||CUT||(ev.button||0)!==0)return false;
  const s=ringHit(ev);
  if(R.rsel>=0){ // second tap
    if(s>=0&&s!==R.rsel){const a=R.rsel;R.rsel=-1;ringSwap(a,s);return true}
    R.rsel=-1;return s>=0;
  }
  if(s<0||!modAt(s))return false;
  R.rdrag={sl:s,x:(ev.clientX-OX)/S,y:(ev.clientY-OY)/S,moved:false,sx:ev.clientX,sy:ev.clientY};sfx('click');
  if(!meta.tut.ring){meta.tut.ring=1;save()}
  return true;
}
addEventListener('pointermove',ev=>{
  if(!R)return;
  if(R.rdrag){const d=R.rdrag;d.x=(ev.clientX-OX)/S;d.y=(ev.clientY-OY)/S;if(!d.moved&&Math.hypot(ev.clientX-d.sx,ev.clientY-d.sy)>8)d.moved=true;return}
  if(ev.target===cv&&!R.paused){const s=ringHit(ev);R.rhover=s>=0&&modAt(s)?s:undefined}else R.rhover=undefined;
});
addEventListener('pointerup',ev=>{
  if(!R||!R.rdrag)return;const d=R.rdrag;R.rdrag=null;
  if(d.moved){const s=ringHit(ev);if(s>=0&&s!==d.sl)ringSwap(d.sl,s)}
  else R.rsel=d.sl; // a plain tap selects; the next tap on a slot swaps
});
addEventListener('pointercancel',()=>{if(R)R.rdrag=null});
addEventListener('keydown',e=>{if(e.code==='Escape'&&R&&R.rsel>=0){R.rsel=-1}});

// ---------- loadout: the ring as a diagram (works with the gamepad: slots are buttons) ----------
function ringPanelHTML(sel){
  const n=ringN(),W=380,C=W/2,Rr=n>6?150:128;let svg='',btns='';
  const P=s=>{const a=slotAng(s);return [C+Math.cos(a)*Rr,C+Math.sin(a)*Rr]};
  for(let s=0;s<n;s++){const [x,y]=P(s);svg+=`<circle cx="${C}" cy="${C}" r="${Rr}" fill="none" stroke="#2a3140" stroke-width="1" stroke-dasharray="3 5"/>`;break}
  for(const l of R.links){const [x1,y1]=P(l.a.sl),[x2,y2]=P(l.b.sl);svg+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${l.d.c}" stroke-width="3" opacity=".85"/>`;
    svg+=`<circle cx="${(x1+x2)/2}" cy="${(y1+y2)/2}" r="4" fill="${l.d.c}"/>`}
  for(let s=0;s<n;s++){const [x,y]=P(s),h=modAt(s);
    btns+=`<button class="rslot${h?'':' empty'}${sel===s?' sel':''}" data-s="${s}" style="left:${x/W*100}%;top:${y/W*100}%;--ec:${h?TYPES[h.t.ty].c:'#3a4156'}">${h?modArt(h.t,36,0.9)+`<span>${h.t.n}</span>`+(h.lk.names.length?`<i>${h.lk.names.length}</i>`:''):'<span>empty</span>'}</button>`}
  const list=R.links.map(l=>`<div class="rlk" style="--lc:${l.d.c}"><b>⛓ ${l.d.n}</b> <small>${l.a.t.n} ↔ ${l.b.t.n}</small><div>${l.d.d}</div></div>`).join('')||'<div class="loe">No links yet. Place different elements or classes side by side.</div>';
  const harm=R.harmN?`<div class="rharm">${R.harmN} · +${Math.round((R.harm-1)*100)}% team damage</div>`:(R.mods.length>=3?'<div class="rharm dim">Link every module for a Harmony bonus (+10%) — two links each = Perfect Ring (+20%)</div>':'');
  return `<div class="rwrap"><div class="rring"><svg viewBox="0 0 ${W} ${W}">${svg}</svg>${btns}<div class="rship">SHIP</div></div><div class="rlist">${harm}${list}<div class="chhelp">Tap a module, then tap another slot to swap. Free — they just re-sync for a moment.</div></div></div>`;
}
function ringPanelBind(root,onChange){
  let sel=-1;
  const redraw=()=>{const box=root.querySelector('#ringBox');box.innerHTML=ringPanelHTML(sel);bind()};
  const bind=()=>root.querySelectorAll('.rslot').forEach(b=>b.onclick=()=>{const s=+b.dataset.s;
    if(sel<0){if(modAt(s)){sel=s;sfx('click');redraw()}}
    else if(sel===s){sel=-1;redraw()}
    else{ringSwap(sel,s);sel=-1;redraw();if(onChange)onChange()}});
  bind();
}
