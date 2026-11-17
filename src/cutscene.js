"use strict";
// ===== CUTSCENE =====
// In-engine intro (~35s, skippable):
// space fall → impact → black + heartbeat → wake in the dark → eyes everywhere →
// one creature crosses the ring and charges → heat ray #1 stuns it (Hope drops) →
// it roars and charges faster → heat ray #2 kills it, a core flies to the ship → title.
let CUT=null;
function mkCutE(k,x,y,show){return{k,x,y,r:EK[k].r,ph:Math.random()*6,face:x<0?1:-1,hit:0,c:EK[k].c,state:'wander',alertT:0,slow:0,show,hd:Math.random()*6,wt:1}}
function startCutscene(after){
  audioInit();hide();hideTip();if(groundFor!==1)buildGround(1);
  const stars=[];for(let i=0;i<200;i++)stars.push([Math.random(),Math.random(),Math.random()*1.6+0.3,Math.random()*6]);
  const eyes=[];for(let i=0;i<24;i++){const a=Math.random()*Math.PI*2,d=rnd(300,640);eyes.push(mkCutE(Math.random()<.25?'skitter':'crawler',Math.cos(a)*d,Math.sin(a)*d,rnd(0.6,5)))}
  const a0=-2.35,mon=mkCutE('crawler',Math.cos(a0)*390,Math.sin(a0)*390,0);mon.r=12;
  CUT={t:0,after,aim:-Math.PI/2,fl:0,stars,eyes,mon,hope:100,hopeShow:0,hopeFlash:0,phase:'space',shots:0,fx:[],pt:[],orb:null,subs:[],shake:0,title:0,ev:{},ringPulse:0,roarAt:0,killedAt:0};
  $('hud').style.display='none';$('bottom').style.display='none';$('skipCut').style.display='block';
}
function sub(text,dur,col){CUT.subs.push({text,t:0,dur:dur||3,col:col||'#e8e6df'})}
function once(id,f){if(!CUT.ev[id]){CUT.ev[id]=1;f()}}
function endCutscene(){
  if(!CUT)return;const after=CUT.after;CUT=null;
  $('hud').style.display='';$('bottom').style.display='';$('skipCut').style.display='none';
  meta.tut.intro=1;save();sfx('click');
  if(after==='menu')menu();else newRun(1);
}
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function cutUpdate(dt){
  const C=CUT;C.t+=dt;const t=C.t;
  C.fl=Math.max(0,C.fl-dt);C.shake=Math.max(0,C.shake-dt*30);C.hopeFlash=Math.max(0,C.hopeFlash-dt);C.ringPulse=Math.max(0,C.ringPulse-dt*1.5);
  for(const s of C.subs)s.t+=dt;C.subs=C.subs.filter(s=>s.t<s.dur);
  if(t<6.2){
    C.phase='space';
    once('s1',()=>{sfx('rumble');sub('S.V. HOPE — deep survey vessel',2.8,'#9aa3b3')});
    if(t>2.8)once('s2',()=>{sfx('rumble');sub('Hull breach. Engines failing.',3,'#ff7b7b')});
    once('al'+Math.floor(t),()=>sfx('alarm'));
    C.shake=Math.max(C.shake,1+t*0.8);
    const k=Math.min(1,t/6.2),px=W*(0.92-0.45*k),py=H*(0.08+0.62*k*k);
    for(let i=0;i<3;i++)C.pt.push({x:px+rnd(-6,6),y:py+rnd(-6,6),vx:rnd(60,150),vy:rnd(-90,-30),t:rnd(0.4,0.9),c:Math.random()<.5?'#ffb03a':'#ff4318',s:rnd(3,9),g:0,add:1,scr:1});
  }else if(t<7.4){
    C.phase='impact';once('imp',()=>{flash(1);sfx('impact');C.shake=24;C.pt=[]});
  }else if(t<12){
    C.phase='black';
    [7.9,9,10.1,11.2].forEach((x,i)=>{if(t>x)once('hb'+i,()=>sfx('heart'))});
    if(t>8.2)once('b1',()=>sub('HULL 3%   ·   ENGINE OFFLINE',3.6,'#ff7b7b'));
    if(t>9.9)once('b2',()=>sub('MAIN POWER 41%   ·   HEAT RAY: ???',2.1,'#ffb03a'));
  }else{
    C.phase='ground';
    if(t>12.7)once('g1',()=>sub('Where… am I?',2.6));
    if(t>16.3)once('g2',()=>sub("…I'm not alone.",2.8,'#d8ff7a'));
    for(const e of C.eyes){e.wt-=dt;if(e.wt<=0){e.wt=rnd(1,3);e.hd+=rnd(-0.8,0.8)}e.x+=Math.cos(e.hd)*8*dt;e.y+=Math.sin(e.hd)*8*dt;e.ph+=dt*1.2;e.face=Math.cos(e.hd)>0?1:-1}
    const m=C.mon,d=Math.hypot(m.x,m.y)||1;m.hit=Math.max(0,m.hit-dt);
    if(!m.dead){
      if(t>18.5&&m.state==='wander'){m.x-=m.x/d*26*dt;m.y-=m.y/d*26*dt;m.ph+=dt*3;m.face=m.x<0?1:-1;
        if(d<230){m.state='rush';m.alertT=0.8;sfx('alert');C.ringPulse=1;C.hopeShow=1}}
      else if(m.state==='rush'){
        if(m.kb>0){m.kb-=dt;m.x+=m.x/d*260*dt;m.y+=m.y/d*260*dt}
        else if(m.alertT>0)m.alertT-=dt;
        else{const sp=C.shots===0?110:180;m.x-=m.x/d*sp*dt;m.y-=m.y/d*sp*dt;m.ph+=dt*sp*0.12;
          if(C.shots===0&&d<150)cutShot(false);
          else if(C.shots===1&&d<138&&t>C.roarAt)cutShot(true)}
      }
    }
    if(C.orb){const o=C.orb;o.t+=dt;
      if(o.t<0.4){o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=320*dt}
      else{const dx=-o.x,dy=-20-o.y,dd=Math.hypot(dx,dy)||1,sp=150+o.t*700;if(dd<sp*dt+10){C.orb=null;sfx('pick')}else{o.x+=dx/dd*sp*dt;o.y+=dy/dd*sp*dt}}}
    if(C.killedAt&&t>C.killedAt+1.3)once('g4',()=>sub('…but every shot drains what little power is left.',3.2,'#ffb03a'));
    if(C.killedAt&&t>C.killedAt+4.6){once('ti',()=>sfx('title'));C.title=Math.min(1,C.title+dt*0.7)}
    if(C.killedAt&&t>C.killedAt+11)endCutscene();
    if(Math.random()<dt*11)C.pt.push({x:-52+rnd(-3,3),y:-14,vx:rnd(-8,8),vy:rnd(-40,-25),t:rnd(1.2,2),c:'#555b66',s:rnd(4,7),g:-5,smoke:1});
  }
  for(const f of C.fx)f.t-=dt;C.fx=C.fx.filter(f=>f.t>0);
  for(const p of C.pt){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(p.smoke)p.s+=dt*5}C.pt=C.pt.filter(p=>p.t>0);
}
function cutShot(kill){
  const C=CUT,m=C.mon,ex=m.x,ey=m.y*K-m.r*.6;C.aim=Math.atan2(ey+44,ex);C.fl=0.2;C.shots++;
  const mx=Math.cos(C.aim)*20,my=-44+Math.sin(C.aim)*20;
  C.fx.push({type:'beam',x:mx,y:my,x2:ex,y2:ey,t:0.32,T:0.32,c:'#ffb03a',w:kill?7:5});sfx('beam');
  m.hit=0.14;C.hope-=7;C.hopeFlash=0.7;C.shake=7;
  for(let i=0;i<10;i++)C.pt.push({x:ex,y:ey,vx:rnd(-120,120),vy:rnd(-120,20),t:rnd(.2,.5),c:'#ffb03a',s:3,g:300,add:1});
  if(!kill){m.kb=0.28;m.alertT=1.3;C.roarAt=C.t+1.5;setTimeout(()=>{if(CUT){sfx('roar');CUT.shake=5}},1000);sub('The cannon… still works?',2.6,'#ffe27a')}
  else{m.dead=true;C.killedAt=C.t;sfx('kill');
    for(let i=0;i<18;i++)C.pt.push({x:m.x,y:m.y*K-m.r*.5,vx:rnd(-110,110),vy:rnd(-150,40),t:rnd(0.4,0.9),c:i%3?m.c:'#9cff5a',s:rnd(2,5),g:260});
    C.orb={x:m.x,y:m.y*K,vx:rnd(-60,60),vy:-130,t:0}}
}
function cutRender(){
  const C=CUT,T=performance.now()/1000,sx=C.shake?rnd(-C.shake,C.shake):0,sy=C.shake?rnd(-C.shake,C.shake):0;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(C.phase==='space'){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02030a');g.addColorStop(1,'#150b16');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const [x,y,s,p] of C.stars){ctx.globalAlpha=0.35+0.4*Math.sin(T*2+p);ctx.fillStyle='#fff';ctx.fillRect(x*W+sx*0.2,y*H*0.8+sy*0.2,s,s)}ctx.globalAlpha=1;
    const pr=Math.max(W,H)*1.4,pcx=W/2+sx,pcy=H+pr*0.72+sy;const pg=ctx.createRadialGradient(pcx,pcy,pr*0.6,pcx,pcy,pr);
    pg.addColorStop(0,'#0f1a13');pg.addColorStop(0.96,'#1f3326');pg.addColorStop(1,'#5cd0ff66');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(pcx,pcy,pr,0,7);ctx.fill();
    const k=Math.min(1,C.t/6.2),px=W*(0.92-0.45*k)+sx,py=H*(0.08+0.62*k*k)+sy,sc=(0.25+0.6*k)*Math.min(1.4,Math.min(W,H)/500);
    ctx.globalCompositeOperation='lighter';
    for(const p of C.pt)if(p.scr){ctx.globalAlpha=Math.min(1,p.t*1.5);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2+sx,p.y-p.s/2+sy,p.s,p.s)}
    ctx.globalAlpha=1;ctx.save();ctx.translate(px,py);glowDot(0,0,70*sc,'#ff6a2a',0.9);ctx.restore();
    ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(px,py);ctx.scale(sc,sc);ctx.rotate(-0.5);drawShip();ctx.restore();
  }else if(C.phase==='ground'){
    if(groundFor!==1)buildGround(1);
    const z=1+1.5*(1-smooth((C.t-12)/6.5)),camx=0,camy=-12*(z-1)/1.5;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(gc,(OX*(1-z)-camx*S*z+sx)*DPR,(OY*(1-z)-camy*S*z+sy)*DPR,cv.width*z,cv.height*z);
    const tf=()=>ctx.setTransform(DPR*S*z,0,0,DPR*S*z,DPR*(OX-camx*S*z+sx),DPR*(OY-camy*S*z+sy));tf();
    const m=C.mon,vis=[];for(const e of C.eyes)vis.push(e);if(!m.dead)vis.push(m);
    ctx.fillStyle='#00000066';for(const e of vis){ctx.beginPath();ctx.ellipse(e.x,e.y*K,e.r*1.1,e.r*0.45,0,0,7);ctx.fill()}
    const list=[{y:0,f:drawShip}];for(const e of vis)list.push({y:e.y,f:()=>drawEnemy(e,T)});list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
    for(const p of C.pt){if(p.add)continue;ctx.globalAlpha=Math.min(1,p.t*(p.smoke?0.6:2));ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}ctx.globalAlpha=1;
    // darkness: emergency light flickers on, then grows
    const lt=C.t-12;let lr=lt<1.6?(Math.sin(lt*40)>0.2?70:20):70+170*smooth((lt-1.6)/4.5);
    const d=dctx;d.setTransform(1,0,0,1,0,0);d.globalCompositeOperation='source-over';d.clearRect(0,0,dk.width,dk.height);d.fillStyle='rgba(2,3,8,0.93)';d.fillRect(0,0,dk.width,dk.height);
    d.globalCompositeOperation='destination-out';d.setTransform(DPR*S*z,0,0,DPR*S*z*K,DPR*(OX-camx*S*z+sx),DPR*(OY-camy*S*z+sy));
    let g=d.createRadialGradient(0,0,0,0,0,lr*1.18);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.6,'rgba(0,0,0,0.95)');g.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=g;d.beginPath();d.arc(0,0,lr*1.18,0,7);d.fill();
    d.setTransform(DPR*S*z,0,0,DPR*S*z,DPR*(OX-camx*S*z+sx),DPR*(OY-camy*S*z+sy));
    for(const f of C.fx){g=d.createRadialGradient(f.x2,f.y2,0,f.x2,f.y2,80);g.addColorStop(0,'rgba(0,0,0,0.9)');g.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=g;d.beginPath();d.arc(f.x2,f.y2,80,0,7);d.fill()}
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0);tf();
    ctx.globalCompositeOperation='lighter';
    for(const p of plants){const a=0.35+0.25*Math.sin(T*1.5+p.ph);ctx.globalAlpha=a*0.35;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y-9,p.s*3,0,7);ctx.fill()}
    ctx.globalAlpha=1;glowDot(28,-16,10,'#1fd1ff',0.3+0.2*Math.sin(T*3));if(Math.sin(T*5)>0)glowDot(-28,-24,7,'#ff2a2a',0.8);
    for(const e of C.eyes)if(lt>e.show)drawEyes(e,T);
    if(!m.dead&&(lt>4||m.state==='rush'))drawEyes(m,T);
    for(const f of C.fx)drawFx(f);
    for(const p of C.pt){if(!p.add)continue;ctx.globalAlpha=Math.min(1,p.t*2.5);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}ctx.globalAlpha=1;
    if(C.orb){glowDot(C.orb.x,C.orb.y,10,'#c79bff',0.6);ctx.fillStyle='#c79bff';ctx.fillRect(C.orb.x-2,C.orb.y-2,4,4)}
    if(C.fl>0)glowDot(Math.cos(C.aim)*20,-44+Math.sin(C.aim)*20,20,'#ffb03a',C.fl*5);
    ctx.globalCompositeOperation='source-over';
    if(C.t>19){const a=Math.min(1,(C.t-19)/1.5),pr=C.ringPulse;ctx.save();ctx.setLineDash([10,10]);ctx.lineDashOffset=-T*12;
      ctx.strokeStyle=`rgba(255,${Math.floor(120-pr*90)},${Math.floor(70-pr*50)},${(0.28+pr*0.5)*a})`;ctx.lineWidth=2+pr*2;ctx.beginPath();ctx.ellipse(0,0,230,230*K,0,0,7);ctx.stroke();ctx.restore()}
    if(!m.dead&&m.state==='rush'&&m.alertT>0&&!(m.kb>0)){ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillStyle='#ff3a3a';ctx.strokeStyle='#000';ctx.lineWidth=3;const y=m.y*K-m.r*2.4;ctx.strokeText('!',m.x,y);ctx.fillText('!',m.x,y)}
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  // HOPE gauge
  if(C.hopeShow){const bw=Math.min(320,W-60),bx=(W-bw)/2,by=26;ctx.fillStyle='#000';ctx.fillRect(bx-2,by-2,bw+4,18);
    const gg=ctx.createLinearGradient(bx,0,bx+bw,0);gg.addColorStop(0,'#ff3d1f');gg.addColorStop(1,'#ffe27a');ctx.fillStyle=C.hopeFlash>0&&Math.sin(C.t*40)>0?'#ff2a2a':gg;ctx.fillRect(bx,by,bw*C.hope/100,14);
    ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText('🔥 HOPE '+Math.round(C.hope)+'%',W/2,by+7)}
  // subtitles
  ctx.textAlign='center';ctx.textBaseline='middle';
  C.subs.forEach((s,i)=>{const a=Math.min(1,s.t*3,(s.dur-s.t)*2);ctx.globalAlpha=Math.max(0,a);ctx.font=(C.phase==='black'?'bold 20px':'17px')+' monospace';
    const y=C.phase==='black'?H/2-10+i*34:H-70-(C.subs.length-1-i)*28;ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.strokeText(s.text,W/2,y);ctx.fillStyle=s.col;ctx.fillText(s.text,W/2,y)});
  ctx.globalAlpha=1;
  // title card
  if(C.title>0){ctx.fillStyle=`rgba(2,3,8,${C.title*0.55})`;ctx.fillRect(0,0,W,H);
    const fs=Math.min(96,W/7.5);ctx.font=`900 ${fs}px ui-monospace,monospace`;ctx.globalAlpha=C.title;
    const tg=ctx.createLinearGradient(0,H/2-fs,0,H/2+fs*0.3);tg.addColorStop(0,'#fff6c8');tg.addColorStop(0.5,'#ffb03a');tg.addColorStop(1,'#ff4318');
    ctx.shadowColor='#ff5a1f';ctx.shadowBlur=30;ctx.fillStyle=tg;ctx.fillText('HOPEFIRE',W/2,H/2-fs*0.3);ctx.shadowBlur=0;
    ctx.font='italic 15px monospace';ctx.fillStyle='#cfd4de';ctx.fillText('When all hope is lost, the ship still fires.',W/2,H/2+fs*0.45);
    if(C.title>=1&&Math.sin(T*4)>-0.3){ctx.font='bold 13px monospace';ctx.fillStyle='#ffb03a';ctx.fillText('— tap to begin —',W/2,H/2+fs*0.45+46)}
    ctx.globalAlpha=1}
}
cv.addEventListener('pointerdown',()=>{if(CUT&&CUT.title>=1)endCutscene()});
