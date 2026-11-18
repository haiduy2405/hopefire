"use strict";
// ===== ELEMENTAL REACTIONS + FOCUS MARK =====
// Every module hit leaves its element's status on the creature (2.6 s):
//   Thermal → BURN · Cryo → CHILL · Arc → SHOCK · Nano → NANITES
// A hit of a *different* element on a creature that still carries a status triggers a reaction:
//   BURN+CHILL   → SHATTER       big burst on the target + shards around it
//   BURN+SHOCK   → OVERLOAD      explosion that knocks creatures back
//   CHILL+SHOCK  → SUPERCONDUCT  target + neighbours take +25% damage for 3 s and are slowed
//   NANITES+any  → CONTAGION     the other status jumps to 3 neighbours (+damage) and repairs a little Hope
// So the build choice is real: stack one element for tier bonuses, or mix elements for reactions.
// Focus mark: tap/click a creature → modules + drones prioritise it and it takes +25% damage.
const ELEM_ST={Thermal:'burn',Cryo:'chill',Arc:'shock',Nano:'nano'};
const ST_COL={burn:'#ff7a3d',chill:'#5cd0ff',shock:'#ffe14d',nano:'#7dffb0'};
const ST_DUR=2.6,RX_CD=0.9;
const RX={
  'burn+chill':{n:'SHATTER',c:'#bff0ff',d:'Burn + Chill: a big burst of damage on the target and shards around it'},
  'burn+shock':{n:'OVERLOAD',c:'#ffb03a',d:'Burn + Shock: an explosion that damages and knocks back nearby creatures'},
  'chill+shock':{n:'SUPERCONDUCT',c:'#c79bff',d:'Chill + Shock: the target and its neighbours take +25% damage for 3 s'},
  nano:{n:'CONTAGION',c:'#7dffb0',d:'Nanites + any: the other status spreads to 3 neighbours and repairs a little Hope'}};
const rxKey=(a,b)=>a==='nano'||b==='nano'?'nano':[a,b].sort().join('+');
// reactions a build can trigger (elements present → pairs)
function buildReactions(elems){const s=[...new Set(elems.map(k=>ELEM_ST[k]))],out=new Set();for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)out.add(RX[rxKey(s[i],s[j])].n);return out}
function elemHit(e,ty,d){
  const s=ELEM_ST[ty];if(!s)return;if(!e.st)e.st={};
  const other=(e.rcd||0)<=R.t&&Object.keys(e.st).find(k=>k!==s&&e.st[k]>0);
  if(other)react(e,s,other,d);else e.st[s]=ST_DUR;
}
function near(e,r,n){const o=[];for(const x of R.en){if(x.dead||x===e)continue;const dd=Math.hypot(x.x-e.x,x.y-e.y);if(dd<r)o.push([dd,x])}o.sort((a,b)=>a[0]-b[0]);return o.slice(0,n||99).map(a=>a[1])}
function react(e,a,b,d){
  const key=rxKey(a,b),R_=RX[key];e.rcd=R.t+RX_CD;delete e.st[a];delete e.st[b];
  R.rxN=(R.rxN||0)+1;meta.stats.reactions=(meta.stats.reactions||0)+1;R.rxSeen=R.rxSeen||{};
  const first=!R.rxSeen[R_.n];R.rxSeen[R_.n]=1;
  const X=e.x,Y=e.y*K-e.r*0.6-(e.fly?22:0);
  rxText(e,R_.n,R_.c,first);sfx('rx_'+R_.n);
  if(R_.n==='SHATTER'){
    for(let i=0;i<18;i++){const an=Math.random()*6.283,sp=rnd(80,220);R.pt.push({x:X,y:Y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-60,t:rnd(.3,.6),c:i%3?'#bff0ff':'#ffffff',s:rnd(2,4),g:260,add:1})}
    R.fx.push({type:'ring',x:X,y:Y,r0:4,r1:46,t:0.3,T:0.3,c:'#bff0ff'});R.hs=Math.max(R.hs||0,0.025);R.shake=Math.max(R.shake,3);
    hit(e,d*1.8,null,false);for(const o of near(e,48))hit(o,d*0.45,null,false);
  }else if(R_.n==='OVERLOAD'){
    R.fx.push({type:'boom',x:X,y:Y,r:76,t:0.4,T:0.4,c:'#ffb03a'});R.shake=Math.max(R.shake,5);
    for(let i=0;i<16;i++)R.pt.push({x:X,y:Y,vx:rnd(-200,200),vy:rnd(-220,-20),t:rnd(.3,.6),c:i%2?'#ffb03a':'#ffe14d',s:3,g:280,add:1});
    hit(e,d*1.0,null,false);for(const o of near(e,76)){hit(o,d*0.6,null,false);if(o.k!=='boss'){const dx=o.x-e.x,dy=o.y-e.y,l=Math.hypot(dx,dy)||1;o.x+=dx/l*34;o.y+=dy/l*34}}
  }else if(R_.n==='SUPERCONDUCT'){
    R.fx.push({type:'ring',x:X,y:Y,r0:10,r1:72,t:0.5,T:0.5,c:'#c79bff'});
    for(const o of [e,...near(e,72)]){o.vuln=3;o.slow=Math.max(o.slow||0,1.5)}hit(e,d*0.6,null,false);
  }else{ // CONTAGION
    const sp=a==='nano'?b:a;R.hope=Math.min(R.maxHope,R.hope+R.maxHope*0.004);
    for(const o of near(e,105,3)){if(!o.st)o.st={};if(sp!=='nano')o.st[sp]=ST_DUR;hit(o,d*0.45,null,false);
      R.fx.push({type:'zap',x:X,y:Y,x2:o.x,y2:o.y*K-o.r*0.6,t:0.2,T:0.2,c:'#7dffb0'})}
    R.fx.push({type:'ring',x:X,y:Y,r0:4,r1:40,t:0.35,T:0.35,c:'#7dffb0'});
  }
  if(first&&!meta.tut['rx_'+R_.n]){meta.tut['rx_'+R_.n]=1;save();setTimeout(()=>{if(R&&!R.over)tip('rx',`<b style="color:${R_.c}">${R_.n}!</b> ${R_.d}. Mix elements to trigger reactions.`,false,6)},200)}
}
function rxText(e,n,c,big){if(R.txt.length<80){const s=big?20:15;R.txt.push({x:e.x,y:wordY(e.x,e.y*K-e.r*2.4-(e.fly?22:0),s),v:n,c,t:big?1.3:0.9,T:big?1.3:0.9,s,rx:1,w:1})}}
// status pips above creatures + vuln/mark rings (drawn in world space, normal blend)
function drawStatuses(T){
  for(const e of R.en){if(e.dead||isHidden(e))continue;const X=e.x,Y=e.y*K-(e.fly?22:0);
    if(e.st){const ks=Object.keys(e.st).filter(k=>e.st[k]>0);ks.forEach((k,i)=>{const x=X+(i-(ks.length-1)/2)*7,y=Y-e.r*2.0-4,s=2.6;
      ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(x,y-s-1);ctx.lineTo(x+s+1,y);ctx.lineTo(x,y+s+1);ctx.lineTo(x-s-1,y);ctx.fill();
      ctx.fillStyle=ST_COL[k];ctx.globalAlpha=Math.min(1,e.st[k]*2);ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s);ctx.lineTo(x-s,y);ctx.fill();ctx.globalAlpha=1})}
    if(e.vuln>0){ctx.strokeStyle=`rgba(199,155,255,${0.5+0.3*Math.sin(T*10)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(X,e.y*K,e.r*1.25,e.r*0.5,0,0,7);ctx.stroke()}
    if(R.mark===e){const r=e.r*1.5+3+Math.sin(T*6)*1.5;ctx.save();ctx.translate(X,Y-e.r*0.6);ctx.rotate(T*1.6);ctx.strokeStyle='#ff4d5e';ctx.lineWidth=2;
      for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.arc(0,0,r,-0.45,0.45);ctx.stroke();ctx.beginPath();ctx.moveTo(r+2,0);ctx.lineTo(r+7,0);ctx.stroke()}ctx.restore()}
  }
}
function statusTick(e,dt){if(e.st)for(const k in e.st)if(e.st[k]>0)e.st[k]-=dt;if(e.vuln>0)e.vuln-=dt}
// ---------- focus mark ----------
cv.addEventListener('pointerdown',ev=>{
  if(!R||R.over||R.paused||R.userPause||R.tipPause||CUT)return;
  if(typeof cellTap==='function'&&cellTap(ev))return;
  const wx=(ev.clientX-OX)/S,wy=(ev.clientY-OY)/S/K;let best=null,bd=(40/Math.max(S,0.6))**2+400;
  for(const e of R.en){if(e.dead||isHidden(e))continue;const dx=e.x-wx,dy=(e.y-(e.fly?22/K:0)-e.r*0.5/K)-wy,dd=dx*dx+dy*dy;if(dd<bd+e.r*e.r){bd=dd;best=e}}
  if(best){R.mark=best;sfx('mark');addTxt(best.x,best.y*K-best.r*2.6,'MARKED','#ff4d5e',11);if(!meta.tut.mark){meta.tut.mark=1;save()}}
});

// ---------- Manual Cannon: aim with the mouse / finger, hold to fire ----------
function aimFrom(ev){if(!R)return;const dx=(ev.clientX-OX)/S,dy=(ev.clientY-OY)/S;R.aimA=Math.atan2(dy+44,dx);R.aimX=dx;R.aimY=dy;R.aimT=2.5;R.aimSrc='ptr'}
cv.addEventListener('pointermove',ev=>{if(R&&!R.over&&lv('manual'))aimFrom(ev)});
cv.addEventListener('pointerdown',ev=>{
  if(!R||R.over||R.paused||R.userPause||R.tipPause||CUT||!lv('manual')||(ev.button||0)!==0)return;
  aimFrom(ev);R.aimHeld=true;if(!meta.tut.manual){meta.tut.manual=1;save()}});
const aimStop=()=>{if(R&&R.aimSrc==='ptr')R.aimHeld=false};
addEventListener('pointerup',aimStop);addEventListener('pointercancel',aimStop);addEventListener('blur',aimStop);
// crosshair + faint aim line (only once Manual Cannon is bought)
function drawAim(T){
  if(!R||!lv('manual')||!(R.aimT>0||R.aimHeld))return;
  const a=R.aimA,ca=Math.cos(a),sa=Math.sin(a),ox=ca*20,oy=-44+sa*20,fire=R.aimHeld;
  let cx,cy;if(R.aimSrc==='pad'){cx=ox+ca*220;cy=oy+sa*220}else{cx=R.aimX;cy=R.aimY}
  const al=Math.min(1,R.aimT*2)*(fire?1:0.65);
  ctx.save();ctx.globalAlpha=al*0.35;ctx.strokeStyle=fire?'#ffd27a':'#ffb03a';ctx.lineWidth=1.5;ctx.setLineDash([6,8]);ctx.lineDashOffset=-T*40;
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);
  ctx.globalAlpha=al;ctx.lineWidth=2;const r=(fire?11:14)+Math.sin(T*8)*1.2;
  ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
  for(let i=0;i<4;i++){const q=i*Math.PI/2;ctx.beginPath();ctx.moveTo(cx+Math.cos(q)*(r-4),cy+Math.sin(q)*(r-4));ctx.lineTo(cx+Math.cos(q)*(r+6),cy+Math.sin(q)*(r+6));ctx.stroke()}
  ctx.restore();
}
