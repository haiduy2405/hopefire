"use strict";
// ===== SIGNATURE TOWERS (v0.17.1) =====
// Six towers that change HOW you play, not just their numbers. Each has its own silhouette (src/tart.js).
//  amp   PRISM SPIRE   no attack; powers both neighbours (+35% damage, +15% fire rate, grows with rarity/★)
//  well  GRAVITY WELL  drags a pack of creatures into one tight clump and chills it (feed for mortars / arcs / mines)
//  mine  MINE LAYER    lays proximity mines on the path in; the more you kill with them the more it lays
//  snipe LONGSHOT      huge range, slow; +100% damage on your MARKED target, bosses and elites (reward for focus)
//  coil  TESLA COIL    short range discharge; +1 arc target per LINK it has
//  aegis AEGIS         periodically raises a Hope shield; links shorten the cooldown
Object.assign(CLS,{
  amp:{g:'✦',dmg:0,rate:0,range:0,pw:34,d:'Support: powers both neighbours'},
  well:{g:'◉',dmg:9,rate:0.22,range:300,pw:26,d:'Drags creatures into one clump'},
  mine:{g:'✖',dmg:30,rate:0.45,range:240,aoe:70,pw:30,d:'Lays proximity mines'},
  snipe:{g:'⌖',dmg:62,rate:0.38,range:540,pw:30,d:'Extreme range · x2 vs marked / elites / bosses'},
  coil:{g:'ϟ',dmg:13,rate:1.1,range:150,pw:30,d:'Arcs lightning · +1 target per link'},
  aegis:{g:'⛨',dmg:0,rate:0.11,range:0,pw:28,d:'Raises a Hope shield'}
});
const SIGT=[
  ['Prism Spire','Arc','amp','Both neighbours: +35% damage, +15% fire rate'],
  ['Gravity Well','Cryo','well','Every ~4 s pulls a pack together and chills it'],
  ['Mine Layer','Thermal','mine','Lays mines on the path in; blast 70 wide'],
  ['Longshot','Nano','snipe','Range 540 · x2 on MARKED, elites and bosses'],
  ['Tesla Coil','Arc','coil','Arcs to 2 creatures · +1 per link'],
  ['Aegis Projector','Nano','aegis','Raises a Hope shield every ~9 s · links speed it up']
];
SIGT.forEach(([n,ty,c,sd])=>MODS.push(Object.assign({id:MODS.length,n,ty,c,sig:1,sd},CLS[c])));
const SIGC={amp:'#ffe14d',well:'#7a6bff',mine:'#ff7a3d',snipe:'#7dffb0',coil:'#ffe14d',aegis:'#7dffb0'};

// crate / kit picker: signature towers only appear once you own 2+ modules, a bit less often than the basics
function pickMod(base){
  const ok=!base&&R&&R.mods.length>=2&&meta.tut.mod;
  const pool=MODS.filter(m=>!m.sig||ok);let tot=0;const w=pool.map(m=>{const x=m.sig?0.75:1;tot+=x;return x});
  let x=Math.random()*tot;for(let i=0;i<pool.length;i++){if((x-=w[i])<0)return pool[i]}return pool[0];
}

// ---------- amp: applied inside layoutMods (see ring.js) ----------
function applyAmps(){
  for(const h of R.mods){if(h.t.c!=='amp')continue;
    const k=1+0.12*h.r+0.1*(h.s-1);
    for(const sl of ringNeigh(h.sl)){const o=modAt(sl);if(!o||o===h||o.t.c==='amp')continue;
      o.lk.dmg*=1+0.35*k;o.lk.rate*=1+0.15*k;o.lk.names.push('PRISM');
      R.links.push({a:h,b:o,d:{n:'PRISM BEAM',c:SIGC.amp,d:'Spire powers its neighbours: +'+Math.round(35*k)+'% damage, +'+Math.round(15*k)+'% fire rate'},key:h.sl+'>'+o.sl+':PRISM',fresh:!(R.linkKeys&&R.linkKeys[h.sl+'>'+o.sl+':PRISM'])});
      h.lk.names.push('PRISM');}
  }
}

// ---------- per-module tick (called from the module loop for sig towers) ----------
const linkCount=h=>h.lk?h.lk.names.length:0;
function sigTick(h,dt,rr){
  const c=h.t.c;if(c==='amp')return;
  if(h.cd>0)return;
  const LK=h.lk||{rate:1,range:1,dmg:1},col=TYPES[h.t.ty].c,per=1/(h.t.rate*tm(h).rate*LK.rate),rng=h.t.range*(1+0.06*lv('range'))*LK.range;
  const mx=h.x,my=h.y*K-26;
  if(c==='aegis'){
    h.cd=per;const amt=R.maxHope*0.07*Math.sqrt(RAR[h.r].m)*(1+0.25*(h.s-1));
    R.shield=Math.min(R.maxHope*0.5,(R.shield||0)+amt);R.shieldT=8;h.fl=0.2;sfx('shield');
    R.fx.push({type:'ring',x:0,y:-20,r0:20,r1:96,t:0.5,T:0.5,c:'#7dffb0'});
    for(let i=0;i<10;i++)R.pt.push({x:mx,y:my,vx:rnd(-60,60),vy:rnd(-90,-20),t:rnd(.3,.6),c:'#7dffb0',s:3,g:80,add:1});return;
  }
  if(c==='mine'){
    const mine=R.mines=R.mines||[];if(mine.filter(m=>m.o===h).length>=4+h.s){h.cd=0.4;return}
    const tg=threatTarget(0,0,rr*1.6);if(!tg){h.cd=0.3;return}
    h.cd=per;h.fl=0.15;sfx('place');
    const d=Math.hypot(tg.x,tg.y)||1,dd=Math.min(rr*0.85,d*0.8),a=Math.atan2(tg.y,tg.x)+rnd(-0.35,0.35);
    mine.push({x:Math.cos(a)*dd,y:Math.sin(a)*dd,t:0,o:h,dmg:modDmg(h)});
    R.fx.push({type:'spark',x:mine[mine.length-1].x,y:mine[mine.length-1].y*K,t:0.15,T:0.15,c:col});return;
  }
  const tg=c==='snipe'?snipeTarget(h,rng):threatTarget(h.x,h.y,rng);
  if(!tg){h.cd=0.15;return}
  h.aim=Math.atan2(tg.y*K-tg.r*.6-(h.y*K-24),tg.x-h.x);h.fl=0.14;
  const tz=tg.fly?22:0,ex=tg.x,ey=tg.y*K-tg.r*.6-tz;
  if(c==='snipe'){
    h.cd=per;sfx('laser');const big=R.mark===tg||tg.k==='boss'||tg.elite;
    R.fx.push({type:'beam',x:mx+Math.cos(h.aim)*18,y:my+Math.sin(h.aim)*18,x2:ex,y2:ey,t:0.3,T:0.3,c:'#eafff2',w:big?6:4});
    R.fx.push({type:'ring',x:tg.x,y:tg.y*K-tg.r*.6,r0:4,r1:big?44:30,t:0.3,T:0.3,c:col});
    hit(tg,modDmg(h)*(big?2:1),h.t.ty,true);if(big&&Math.random()<0.5)addTxt(tg.x,tg.y*K-tg.r*2.6,'CLEAN SHOT','#eafff2',11);
  }else if(c==='coil'){
    h.cd=per;sfx('zapstrike');const n=2+linkCount(h);const pool=R.en.filter(e=>!e.dead&&!isHidden(e)&&(e.x-h.x)**2+(e.y-h.y)**2<=rng*rng).sort(()=>Math.random()-0.5).slice(0,n);
    if(!pool.length){h.cd=0.15;return}
    const d=modDmg(h)*(1+0.15*linkCount(h));
    for(const e of pool){R.fx.push({type:'zap',x:mx,y:my,x2:e.x,y2:e.y*K-e.r*.6-(e.fly?22:0),t:0.14,T:0.14,c:'#ffe14d'});hit(e,d,h.t.ty,true)}
  }else if(c==='well'){
    // aim at the biggest pack within range: the creature with most neighbours within 95
    let best=null,bn=-1;for(const e of R.en){if(e.dead||isHidden(e)||(e.x-h.x)**2+(e.y-h.y)**2>rng*rng)continue;let n=0;for(const o of R.en)if(!o.dead&&(o.x-e.x)**2+(o.y-e.y)**2<95*95)n++;if(n>bn){bn=n;best=e}}
    if(!best||bn<2){h.cd=0.3;return}
    h.cd=per;sfx('hole');const px=best.x,py=best.y;
    R.fx.push({type:'ring',x:px,y:py*K,r0:110,r1:8,t:0.45,T:0.45,c:'#7a6bff'});R.fx.push({type:'boom',x:px,y:py*K,r:34,t:0.5,T:0.5,c:'#7a6bff'});
    for(const o of R.en){if(o.dead||(o.x-px)**2+(o.y-py)**2>130*130)continue;o.pullX=px;o.pullY=py;o.pullT=0.45;o.slow=Math.max(o.slow||0,1.6);hit(o,modDmg(h),h.t.ty,false)}
  }
}
function snipeTarget(h,rng){
  const m=R.mark;if(m&&!m.dead&&!isHidden(m)&&(m.x-h.x)**2+(m.y-h.y)**2<=rng*rng)return m;
  let b=null,bs=-1;for(const e of R.en){if(e.dead||isHidden(e)||(e.x-h.x)**2+(e.y-h.y)**2>rng*rng)continue;
    const sc=(e.k==='boss'?1e6:e.elite?1e5:0)+e.hp-(e.state==='rush'?0:5e3);if(sc>bs){bs=sc;b=e}}
  return b;
}
// mines, pulled creatures, shield decay: once per update
function sigWorldTick(dt){
  for(const e of R.en){if(e.pullT>0){e.pullT-=dt;const dx=e.pullX-e.x,dy=e.pullY-e.y,d=Math.hypot(dx,dy);if(d>6){const sp=Math.min(d,(e.k==='boss'?110:300)*dt);e.x+=dx/d*sp;e.y+=dy/d*sp}}}
  if(R.mines&&R.mines.length){
    for(const m of R.mines){m.t+=dt;if(m.t<0.6||m.dead)continue;
      let trig=null;for(const e of R.en){if(e.dead||e.fly||isHidden(e))continue;if((e.x-m.x)**2+(e.y-m.y)**2<(22+e.r)**2){trig=e;break}}
      if(trig||m.t>40){m.dead=true;if(!trig)continue;sfx('boom');R.shake=Math.min(8,R.shake+2);
        R.fx.push({type:'boom',x:m.x,y:m.y*K,r:70,t:0.4,T:0.4,c:TYPES.Thermal.c});for(let i=0;i<10;i++)R.pt.push({x:m.x,y:m.y*K,vx:rnd(-140,140),vy:rnd(-170,-20),t:rnd(.2,.5),c:i%2?'#ffb03a':'#ff7a3d',s:3,g:300,add:1});
        CURH=m.o&&m.o.lk?m.o:null;for(const e of R.en)if(!e.dead&&!e.fly&&(e.x-m.x)**2+(e.y-m.y)**2<(70+e.r)**2)hit(e,m.dmg,'Thermal',true);CURH=null}}
    R.mines=R.mines.filter(m=>!m.dead);
  }
  if(R.shieldT>0){R.shieldT-=dt;if(R.shieldT<=0)R.shield=0}
}
function sigDraw(T){ // mines + shield bubble (world space, under the sorted sprites)
  if(!R)return;const c=ctx;
  if(R.mines)for(const m of R.mines){const arm=m.t>0.6,p=0.5+0.5*Math.sin(T*8+m.x);c.save();c.fillStyle='#14110e';c.beginPath();c.ellipse(m.x,m.y*K,8,3.4,0,0,7);c.fill();
    c.fillStyle=arm?`rgba(255,${90+p*80|0},40,1)`:'#6a5a4a';c.beginPath();c.ellipse(m.x,m.y*K-1.5,4.6,2,0,0,7);c.fill();
    if(arm){c.globalCompositeOperation='lighter';c.globalAlpha=0.35*p;c.fillStyle='#ff7a3d';c.beginPath();c.arc(m.x,m.y*K-1.5,9,0,7);c.fill()}c.restore()}
  if(R.shield>0){const f=Math.min(1,R.shield/(R.maxHope*0.3)),p=0.6+0.4*Math.sin(T*5);c.save();c.globalCompositeOperation='lighter';
    c.strokeStyle='#7dffb0';c.globalAlpha=(0.25+0.4*f)*p;c.lineWidth=3;c.beginPath();c.ellipse(0,-6,118,56,0,0,7);c.stroke();
    c.globalAlpha=0.07+0.08*f;c.fillStyle='#7dffb0';c.fill();c.restore()}
}
