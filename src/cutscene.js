"use strict";
// ===== CUTSCENE =====
// In-engine intro (~35s, skippable):
// space fall → impact → black + heartbeat → wake in the dark → eyes everywhere →
// one creature crosses the ring and charges → heat ray #1 stuns it (Hope drops) →
// it roars and charges faster → heat ray #2 kills it, a core flies to the ship → title.
let CUT=null;
function mkCutE(k,x,y,show){return{k,x,y,r:EK[k].r,ph:Math.random()*6,face:x<0?1:-1,hit:0,c:EK[k].c,state:'wander',alertT:0,slow:0,show,hd:Math.random()*6,wt:1}}
// Intro 2.0: AI pixel-art key frames (assets/intro/intro_N.jpg) with Ken-Burns, letterbox, grain, red alarm pulse.
// Falls back to the old code-drawn scenes for any frame that is missing.
const INTRO_IMG={};
function introLoad(){for(const k of ['intro_1','intro_2','intro_3']){if(INTRO_IMG[k])continue;const im=new Image();im.src='assets/intro/'+k+'.jpg';INTRO_IMG[k]=im}}
const introOk=k=>{const im=INTRO_IMG[k];return !!(im&&im.complete&&im.naturalWidth>0)};
function introFrame(k,t,a,o){ // t 0..1 progress; o:{z0,z1,x0,x1,y0,y1}
  const im=INTRO_IMG[k],iw=im.naturalWidth,ih=im.naturalHeight,sc=Math.max(W/iw,H/ih),z=o.z0+(o.z1-o.z0)*t;
  const dw=iw*sc*z,dh=ih*sc*z,ox=(dw-W)/2,oy=(dh-H)/2,px=o.x0+(o.x1-o.x0)*t,py=o.y0+(o.y1-o.y0)*t;
  ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,-ox+px*ox+(CUT.shake?rnd(-CUT.shake,CUT.shake)*0.6:0),-oy+py*oy+(CUT.shake?rnd(-CUT.shake,CUT.shake)*0.6:0),dw,dh);ctx.restore()}
function introFinish(T,a,bars){ // vignette + scanlines + grain + letterbox
  const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,6,0.78)');ctx.globalAlpha=a;ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=0.07*a;ctx.fillStyle='#000';for(let y=0;y<H;y+=3)ctx.fillRect(0,y,W,1);
  ctx.globalAlpha=0.16*a;for(let i=0;i<70;i++){ctx.fillStyle=Math.random()<.5?'#fff':'#9aa3b8';ctx.fillRect(Math.random()*W,Math.random()*H,2,2)}
  ctx.globalAlpha=1;const bh=Math.round(H*bars);ctx.fillStyle='#000';ctx.fillRect(0,0,W,bh);ctx.fillRect(0,H-bh,W,bh)}
function startCutscene(after){introLoad();
  audioInit();hide();hideTip();if(groundFor!==1)buildGround(1);
  const stars=[];for(let i=0;i<200;i++)stars.push([Math.random(),Math.random(),Math.random()*1.6+0.3,Math.random()*6]);
  const eyes=[];for(let i=0;i<24;i++){const a=Math.random()*Math.PI*2,d=rnd(300,640);eyes.push(mkCutE(Math.random()<.25?'skitter':'crawler',Math.cos(a)*d,Math.sin(a)*d,rnd(0.6,5)))}
  const a0=-2.35,mon=mkCutE('crawler',Math.cos(a0)*390,Math.sin(a0)*390,0);mon.r=12;
  CUT={t:0,after,aim:-Math.PI/2,fl:0,stars,eyes,mon,hope:100,hopeShow:0,hopeFlash:0,phase:'space',shots:0,fx:[],pt:[],orb:null,subs:[],shake:0,title:0,ev:{},ringPulse:0,roarAt:0,killedAt:0,bars:0,pulse:0};
  CUT.g0=12;CUT.b=[6.2,6.2,7.4];
  $('hud').style.display='none';$('bottom').style.display='none';$('skipCut').style.display='block';
}
function sub(text,dur,col,tw){CUT.subs.push({text,t:0,dur:dur||3,col:col||'#e8e6df',tw:tw})}
function once(id,f){if(!CUT.ev[id]){CUT.ev[id]=1;f()}}
function endCutscene(){
  if(!CUT)return;const after=CUT.after;CUT=null;
  $('hud').style.display='';$('bottom').style.display='';$('skipCut').style.display='none';
  meta.tut.intro=1;save();sfx('click');
  if(after==='menu')menu();else newRun(1);
}
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function cutUpdate(dt){
  if(CUT.kind==='end')return endUpdate(dt);
  const C=CUT;
  if(!C.chk){if(introOk('intro_1')&&introOk('intro_2')&&introOk('intro_3')){C.fr=1;C.g0=16.5;C.b=[8.5,11,11.9];C.chk=1}else if((C.hold=(C.hold||0)+dt)>1.5)C.chk=1;else return}
  C.t+=dt;const t=C.t;
  C.fl=Math.max(0,C.fl-dt);C.shake=Math.max(0,C.shake-dt*30);C.hopeFlash=Math.max(0,C.hopeFlash-dt);C.ringPulse=Math.max(0,C.ringPulse-dt*1.5);
  for(const s of C.subs)s.t+=dt;C.subs=C.subs.filter(s=>s.t<s.dur);
  if(t<C.b[0]){
    C.phase='space';C.bars=C.fr?Math.min(0.11,t*0.1):0;
    once('s1',()=>{sfx('rumble');sub('S.V. HOPE — deep survey vessel',C.fr?3.4:2.8,'#9aa3b3',C.fr)});
    if(C.fr&&t>3.4)once('s1b',()=>sub('LOG 0417 · sector unknown · no beacon',3,'#7f8aa0',1));
    if(t>(C.fr?5.2:2.8))once('s2',()=>{sfx('rumble');if(!vo('intro_1',1))sub('Hull breach. Engines failing.',3,'#ff7b7b',C.fr)});
    once('al'+Math.floor(t),()=>sfx('alarm'));
    if(C.fr&&t>5.2)C.pulse=0.5+0.5*Math.sin(t*7);
    C.shake=Math.max(C.shake,(C.fr?0.4:1)+t*(C.fr?0.55:0.8));
    const k=Math.min(1,t/C.b[0]),px=W*(0.92-0.45*k),py=H*(0.08+0.62*k*k);
    if(C.fr){for(let i=0;i<2;i++)C.pt.push({x:W*(0.78-0.18*k)+rnd(-8,8),y:H*(0.2+0.15*k)+rnd(-6,6),vx:rnd(-30,-120),vy:rnd(-30,30),t:rnd(0.5,1),c:Math.random()<.5?'#ffb03a':'#ff4318',s:rnd(2,6),g:0,add:1,scr:1})}
    else for(let i=0;i<3;i++)C.pt.push({x:px+rnd(-6,6),y:py+rnd(-6,6),vx:rnd(60,150),vy:rnd(-90,-30),t:rnd(0.4,0.9),c:Math.random()<.5?'#ffb03a':'#ff4318',s:rnd(3,9),g:0,add:1,scr:1});
  }else if(t<C.b[1]){
    C.phase='reentry';C.bars=0.11;C.pulse=0.7+0.3*Math.sin(t*14);C.shake=Math.max(C.shake,6+(t-C.b[0])*4);
    once('re',()=>{sfx('rumble');sub('BRACE.',1.8,'#ff4a3a',1)});
    for(let i=0;i<5;i++)C.pt.push({x:W*rnd(0.35,1.05),y:-10,vx:rnd(-380,-220),vy:rnd(420,700),t:rnd(0.3,0.6),c:Math.random()<.5?'#ffd27a':'#ff5a2a',s:rnd(2,7),g:0,add:1,scr:1});
  }else if(t<C.b[2]){
    C.phase='impact';C.bars=0.11;once('imp',()=>{flash(1);sfx('impact');C.shake=24;C.pt=[]});
  }else if(t<C.g0){
    C.phase='black';const o=C.b[2]-7.4;C.bars=C.fr?Math.max(0,0.11*(1-(t-C.b[2])/3)):0;C.pulse=0;
    [7.9,9,10.1,11.2].forEach((x,i)=>{if(t>x+o)once('hb'+i,()=>sfx('heart'))});
    if(t>8.2+o)once('b1',()=>sub('HULL 3%   ·   ENGINE OFFLINE',3.6,'#ff7b7b',C.fr));
    if(t>9.9+o)once('b2',()=>sub('MAIN POWER 41%   ·   HEAT RAY: ???',2.1,'#ffb03a',C.fr));
  }else{C.bars=0;
    C.phase='ground';
    if(t>C.g0+0.7)once('g1',()=>{sub('Where… am I?',2.6);vo('intro_2',1)});
    if(t>C.g0+4.3)once('g2',()=>sub("…I'm not alone.",2.8,'#d8ff7a'));
    for(const e of C.eyes){e.wt-=dt;if(e.wt<=0){e.wt=rnd(1,3);e.hd+=rnd(-0.8,0.8)}e.x+=Math.cos(e.hd)*8*dt;e.y+=Math.sin(e.hd)*8*dt;e.ph+=dt*1.2;e.face=Math.cos(e.hd)>0?1:-1}
    const m=C.mon,d=Math.hypot(m.x,m.y)||1;m.hit=Math.max(0,m.hit-dt);
    if(!m.dead){
      if(t>C.g0+6.5&&m.state==='wander'){m.x-=m.x/d*26*dt;m.y-=m.y/d*26*dt;m.ph+=dt*3;m.face=m.x<0?1:-1;
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
function introRender(C,T,sx,sy){
  const t=C.t,b=C.b,ok2=introOk('intro_2'),ok3=introOk('intro_3');
  ctx.fillStyle='#02030a';ctx.fillRect(0,0,W,H);
  if(C.phase==='space'){introFrame('intro_1',t/b[0],Math.min(1,t/1.3),{z0:1.03,z1:1.24,x0:0.7,x1:-0.5,y0:0.25,y1:-0.1})}
  else if(C.phase==='reentry'){const k=(t-b[0])/(b[1]-b[0]);
    introFrame('intro_1',1,1,{z0:1.24,z1:1.24,x0:-0.5,x1:-0.5,y0:-0.1,y1:-0.1});
    if(ok2)introFrame('intro_2',k,Math.min(1,k*3),{z0:1.04,z1:1.38,x0:0.2,x1:-0.2,y0:0.1,y1:0.3});
    else introFrame('intro_1',k,1,{z0:1.24,z1:1.9,x0:-0.5,x1:-0.5,y0:-0.1,y1:-0.1})}
  else if(C.phase==='impact'){const k=(t-b[1])/(b[2]-b[1]);ctx.globalAlpha=1-k;
    if(ok2)introFrame('intro_2',1,1-k,{z0:1.38,z1:1.38,x0:-0.2,x1:-0.2,y0:0.3,y1:0.3})}
  else if(C.phase==='black'&&ok3){const a=smooth((t-b[2])/2.4)*Math.min(1,(C.g0-t)/0.9);introFrame('intro_3',(t-b[2])/(C.g0-b[2]),a*0.92,{z0:1.2,z1:1.04,x0:0.3,x1:-0.1,y0:0.1,y1:0})}
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';
  for(const p of C.pt)if(p.scr){ctx.globalAlpha=Math.min(1,p.t*2);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s*(p.vx<-200?3:1),p.s)}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(C.pulse>0){ctx.globalAlpha=C.pulse*0.2;ctx.fillStyle='#ff2a14';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
  introFinish(T,1,C.bars);
}
function cutRender(){
  if(CUT.kind==='end')return endRender();
  const C=CUT,T=performance.now()/1000,sx=C.shake?rnd(-C.shake,C.shake):0,sy=C.shake?rnd(-C.shake,C.shake):0;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(C.fr&&C.phase!=='ground'){introRender(C,T,sx,sy)}
  else if(C.phase==='space'){
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
    const z=1+1.5*(1-smooth((C.t-C.g0)/6.5)),camx=0,camy=-12*(z-1)/1.5;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(gc,(OX*(1-z)-camx*S*z+sx)*DPR,(OY*(1-z)-camy*S*z+sy)*DPR,cv.width*z,cv.height*z);
    const tf=()=>ctx.setTransform(DPR*S*z,0,0,DPR*S*z,DPR*(OX-camx*S*z+sx),DPR*(OY-camy*S*z+sy));tf();
    const m=C.mon,vis=[];for(const e of C.eyes)vis.push(e);if(!m.dead)vis.push(m);
    ctx.fillStyle='#00000066';for(const e of vis){ctx.beginPath();ctx.ellipse(e.x,e.y*K,e.r*1.1,e.r*0.45,0,0,7);ctx.fill()}
    const list=[{y:0,f:drawShip}];for(const e of vis)list.push({y:e.y,f:()=>drawEnemy(e,T)});list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
    for(const p of C.pt){if(p.add)continue;ctx.globalAlpha=Math.min(1,p.t*(p.smoke?0.6:2));ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}ctx.globalAlpha=1;
    // darkness: emergency light flickers on, then grows
    const lt=C.t-C.g0;let lr=lt<1.6?(Math.sin(lt*40)>0.2?70:20):70+170*smooth((lt-1.6)/4.5);
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
    if(C.t>C.g0+7){const a=Math.min(1,(C.t-C.g0-7)/1.5),pr=C.ringPulse;ctx.save();ctx.setLineDash([10,10]);ctx.lineDashOffset=-T*12;
      ctx.strokeStyle=`rgba(255,${Math.floor(120-pr*90)},${Math.floor(70-pr*50)},${(0.28+pr*0.5)*a})`;ctx.lineWidth=2+pr*2;ctx.beginPath();ctx.ellipse(0,0,230,230*K,0,0,7);ctx.stroke();ctx.restore()}
    if(!m.dead&&m.state==='rush'&&m.alertT>0&&!(m.kb>0)){ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillStyle='#ff3a3a';ctx.strokeStyle='#000';ctx.lineWidth=3;const y=m.y*K-m.r*2.4;ctx.strokeText('!',m.x,y);ctx.fillText('!',m.x,y)}
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if(C.fr&&lt<1.4&&introOk('intro_3'))introFrame('intro_3',1,1-lt/1.4,{z0:1.04,z1:1.04,x0:-0.1,x1:-0.1,y0:0,y1:0});
  }
  // HOPE gauge
  if(C.hopeShow){const bw=Math.min(320,W-60),bx=(W-bw)/2,by=26;ctx.fillStyle='#000';ctx.fillRect(bx-2,by-2,bw+4,18);
    const gg=ctx.createLinearGradient(bx,0,bx+bw,0);gg.addColorStop(0,'#ff3d1f');gg.addColorStop(1,'#ffe27a');ctx.fillStyle=C.hopeFlash>0&&Math.sin(C.t*40)>0?'#ff2a2a':gg;ctx.fillRect(bx,by,bw*C.hope/100,14);
    ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText('🔥 HOPE '+Math.round(C.hope)+'%',W/2,by+7)}
  // subtitles
  ctx.textAlign='center';ctx.textBaseline='middle';
  C.subs.forEach((s,i)=>{const a=Math.min(1,s.t*3,(s.dur-s.t)*2);ctx.globalAlpha=Math.max(0,a);ctx.font=(C.phase==='black'||(C.fr&&C.phase!=='ground')?'bold 20px':'17px')+' monospace';
    const fm=C.fr&&C.phase!=='ground';const y=fm?H*(1-0.11)-30-(C.subs.length-1-i)*30:(C.phase==='black'?H/2-10+i*34:H-70-(C.subs.length-1-i)*28);ctx.lineWidth=4;ctx.strokeStyle='#000';const tx=s.tw?s.text.slice(0,Math.max(1,Math.floor(s.t*30))):s.text;
    if(s.tw){const w=ctx.measureText(s.text).width;ctx.textAlign='left';ctx.strokeText(tx,W/2-w/2,y);ctx.fillStyle=s.col;ctx.fillText(tx,W/2-w/2,y);ctx.textAlign='center'}
    else{ctx.strokeText(tx,W/2,y);ctx.fillStyle=s.col;ctx.fillText(tx,W/2,y)}});
  ctx.globalAlpha=1;
  // title card
  if(C.title>0){ctx.fillStyle=`rgba(2,3,8,${C.title*0.55})`;ctx.fillRect(0,0,W,H);
    const fs=Math.min(96,W/7.5);ctx.font=`900 ${fs}px ui-monospace,monospace`;ctx.globalAlpha=C.title;
    if(!INTRO_IMG.logo){INTRO_IMG.logo=new Image();INTRO_IMG.logo.src='assets/ui/logo.png'}
    const tg=ctx.createLinearGradient(0,H/2-fs,0,H/2+fs*0.3);tg.addColorStop(0,'#fff6c8');tg.addColorStop(0.5,'#ffb03a');tg.addColorStop(1,'#ff4318');
    const lg=INTRO_IMG.logo;if(lg&&lg.complete&&lg.naturalWidth){const lw=Math.min(640,W*0.7),lh=lw*lg.naturalHeight/lg.naturalWidth,pu=1+0.015*Math.sin(T*2);ctx.shadowColor='#ff5a1f';ctx.shadowBlur=40;ctx.imageSmoothingEnabled=false;ctx.drawImage(lg,W/2-lw*pu/2,H/2-fs*0.3-lh*0.62*pu,lw*pu,lh*pu);ctx.shadowBlur=0}
    else{ctx.shadowColor='#ff5a1f';ctx.shadowBlur=30;ctx.fillStyle=tg;ctx.fillText('HOPEFIRE',W/2,H/2-fs*0.3);ctx.shadowBlur=0}
    ctx.font='italic 15px monospace';ctx.fillStyle='#cfd4de';ctx.fillText('When all hope is lost, the ship still fires.',W/2,H/2+fs*0.45);
    if(C.title>=1&&Math.sin(T*4)>-0.3){ctx.font='bold 13px monospace';ctx.fillStyle='#ffb03a';ctx.fillText('— tap to begin —',W/2,H/2+fs*0.45+46)}
    ctx.globalAlpha=1}
}
cv.addEventListener('pointerdown',()=>{if(CUT&&CUT.title>=1)(CUT.kind==='end'?finishEnding():endCutscene())});

// ---- the twist: the "alien" planet is Earth, thousands of years in the future ----
// Crude lon/lat polygons -> 360x180 land mask -> orthographic pixel globe (150 px, upscaled without smoothing = pixel-art look)
const EARTH_LAND=[
  [[-168,66],[-156,71],[-125,70],[-95,72],[-82,69],[-65,60],[-56,52],[-66,45],[-70,42],[-76,36],[-81,31],[-80,25],[-82,29],[-90,30],[-97,26],[-97,20],[-90,21],[-87,21],[-88,16],[-83,10],[-79,9],[-86,11],[-92,15],[-105,20],[-110,24],[-114,31],[-118,34],[-124,40],[-124,48],[-135,58],[-148,61],[-165,60]],
  [[-79,9],[-73,12],[-62,11],[-52,5],[-35,-6],[-39,-14],[-48,-26],[-58,-38],[-66,-46],[-68,-55],[-74,-50],[-72,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,8]],
  [[-55,60],[-45,60],[-20,70],[-20,81],[-60,82],[-72,78],[-55,68]],
  [[-10,36],[-9,43],[-1,46],[-5,48],[5,53],[8,57],[10,63],[20,70],[40,68],[60,70],[100,77],[140,72],[170,68],[180,65],[160,58],[142,52],[135,43],[128,35],[122,30],[121,22],[108,20],[105,10],[100,2],[98,16],[92,22],[80,15],[77,8],[72,20],[67,25],[58,25],[56,26],[58,24],[55,17],[43,13],[35,28],[34,32],[36,36],[28,37],[24,38],[19,40],[15,38],[8,43],[3,43],[-2,37],[-9,37]],
  [[-17,21],[-6,36],[10,37],[32,31],[35,28],[43,12],[51,12],[40,-5],[40,-15],[33,-26],[20,-35],[12,-18],[9,-1],[-8,4],[-17,14]],
  [[114,-22],[122,-18],[131,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[140,-38],[131,-31],[115,-34]],
  [[-5,50],[2,51],[0,58],[-6,58]],[[130,31],[141,36],[142,44],[137,38]],[[95,5],[105,-6],[120,-9],[110,-2]],
  [[-180,-70],[180,-70],[180,-90],[-180,-90]]
];
let EARTH=null;
function buildEarth(){
  if(EARTH)return EARTH;
  const mc=document.createElement('canvas');mc.width=360;mc.height=180;const m=mc.getContext('2d');
  m.fillStyle='#000';m.fillRect(0,0,360,180);m.fillStyle='#fff';
  for(const poly of EARTH_LAND){m.beginPath();poly.forEach(([lo,la],i)=>{const x=lo+180,y=90-la;i?m.lineTo(x,y):m.moveTo(x,y)});m.closePath();m.fill()}
  const N=150,cv=document.createElement('canvas');cv.width=cv.height=N;const cx=cv.getContext('2d');
  EARTH={land:m.getImageData(0,0,360,180).data,N,cv,cx,img:cx.createImageData(N,N)};return EARTH;
}
const hash2=(x,y)=>{const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)};
// scan: rows above that fraction are "revealed" (dust cleared); <0 = fully veiled, >1 = fully revealed
function earthFrame(lon0,T,scan){
  const E=buildEarth(),N=E.N,d=E.img.data,la0=0.32,sl=Math.sin(la0),cl=Math.cos(la0),LX=-0.52,LY=-0.42,LZ=0.74;
  for(let j=0;j<N;j++){
    const dust=scan>=j/N+0.03?0.04:scan<=j/N-0.03?1:1-(scan-(j/N-0.03))/0.06*0.96;
    for(let i=0;i<N;i++){
      const x=(i+0.5)/N*2-1,y=(j+0.5)/N*2-1,r2=x*x+y*y,o=(j*N+i)*4;
      if(r2>1){d[o+3]=0;continue}
      const z=Math.sqrt(1-r2),yy=-y,y2=yy*cl+z*sl,z2=-yy*sl+z*cl,lat=Math.asin(y2),lon=Math.atan2(x,z2)+lon0;
      const lo=((lon*180/Math.PI+540)%360),la=lat*180/Math.PI,px=Math.min(359,lo|0),py=Math.min(179,Math.max(0,(90-la)|0));
      const land=E.land[(py*360+px)*4]>128,n=hash2(px,py),vr=Math.sin(px*0.09+py*0.05)*Math.sin(py*0.11-px*0.04)+0.35*(hash2(px>>3,py>>3)-0.5);
      let r,g,b;
      if(Math.abs(la)>74){r=176+n*14;g=180+n*14;b=184+n*12}                       // polar ice
      else if(land){const sc=vr>0.3?0.74:vr<-0.45?1.12:1;r=(112+n*22)*sc;g=(92+n*18)*sc;b=(70+n*14)*sc}   // ash-brown land, dark burn scars
      else{r=26+n*8;g=44+n*8;b=50+n*8}                                               // murky dead ocean
      const cl2=Math.sin(lon*5+la*0.09+T*0.06)*Math.sin(la*0.21-lon*2.3+T*0.03)+0.3*hash2(px>>1,py>>1);   // drifting dust storms
      const ca=Math.max(0,cl2-0.35)*0.7;r+=(150-r)*ca;g+=(118-g)*ca;b+=(92-b)*ca;
      const vh=0.55+0.45*Math.sin(la*0.2+lon*3+T*0.1);r+=((150+vh*50)-r)*dust*0.92;g+=((54+vh*20)-g)*dust*0.92;b+=((40+vh*10)-b)*dust*0.92;   // veil: still looks alien until scanned
      const dot=x*LX+y*LY+z*LZ,lit=Math.max(0.07,Math.min(1,dot*1.15+0.1)),rim=Math.pow(1-z,3)*0.9*Math.max(0.2,lit);
      d[o]=Math.min(255,r*lit+rim*255*0.9);d[o+1]=Math.min(255,g*lit+rim*150*0.9);d[o+2]=Math.min(255,b*lit+rim*95*0.9);d[o+3]=255;
    }
  }
  E.cx.putImageData(E.img,0,0);return E.cv;
}
const EARTH_DEBRIS=Array.from({length:46},()=>({a:Math.random()*6.28,r:1.18+Math.random()*0.5,w:(Math.random()<.5?-1:1)*(0.02+Math.random()*0.06),s:1+Math.random()*2.2,tl:0.25+Math.random()*0.5}));
function endLine(id,col,dur){const L=VO_LINES[id];if(!vo(id,1))sub(L[1].replace(/^\.\.\./,'…'),dur||3,col)}

// ===== ENDING =====
// repair sparks → engine ignites → liftoff (every eye in the dark turns red) → space → the planet is EARTH (singularity, +4,000 years) → credits
function startEnding(after){
  audioInit();hide();hideTip();R=null;if(groundFor!==MAXCH)buildGround(MAXCH);
  const stars=[];for(let i=0;i<200;i++)stars.push([Math.random(),Math.random(),Math.random()*1.6+0.3,Math.random()*6]);
  const eyes=[];for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,d=rnd(260,640);eyes.push(mkCutE(['crawler','skitter','phantom','splitter','spitter'][i%5],Math.cos(a)*d,Math.sin(a)*d,0))}
  CUT={kind:'end',t:0,after:after||'menu',aim:-Math.PI/2,fl:0,stars,eyes,fx:[],pt:[],subs:[],shake:0,title:0,ev:{},lift:0,phase:'ground'};
  $('hud').style.display='none';$('bottom').style.display='none';$('skipCut').style.display='block';
  $('skipCut').onclick=finishEnding;ach('escape');
}
function finishEnding(){
  if(!CUT)return;CUT=null;$('hud').style.display='';$('bottom').style.display='';$('skipCut').style.display='none';
  $('skipCut').onclick=endCutscene;sfx('click');menu();
}
function endUpdate(dt){
  const C=CUT;C.t+=dt;const t=C.t;C.shake=Math.max(0,C.shake-dt*20);
  for(const s of C.subs)s.t+=dt;C.subs=C.subs.filter(s=>s.t<s.dur);
  if(t<12){C.phase='ground';
    once('e1',()=>{sub('The last part clicks into place.',3);vo('ending_1',1)});
    if(t<4&&Math.random()<dt*14)C.pt.push({x:rnd(-40,40),y:rnd(-30,10),vx:rnd(-60,60),vy:rnd(-120,-40),t:rnd(.2,.5),c:'#ffe27a',s:2,g:300,add:1});
    if(t>4)once('e2',()=>{sub('Main engine… online.',3,'#ffb03a');sfx('rumble');C.shake=6;setTimeout(()=>vo('ending_2',1),1500)});
    if(t>4){C.shake=Math.max(C.shake,2+(t-4));for(let i=0;i<3;i++)C.pt.push({x:rnd(-30,30),y:18-C.lift,vx:rnd(-40,40),vy:rnd(60,160),t:rnd(.3,.7),c:Math.random()<.5?'#ffb03a':'#ff4318',s:rnd(4,9),g:0,add:1})}
    if(t>7){once('e3',()=>{sub('They feel it. All of them.',3,'#ff7b7b');sfx('alert')});for(const e of C.eyes)e.state='rush';C.lift+=dt*(20+(t-7)*60)}
    for(const e of C.eyes){e.ph+=dt*3;if(e.state==='rush'){const d=Math.hypot(e.x,e.y)||1;if(d>90){e.x-=e.x/d*110*dt;e.y-=e.y/d*110*dt;e.face=e.x<0?1:-1}}}
  }else if(t<16){C.phase='space';once('e4',()=>{sfx('rumble');sub('S.V. HOPE breaks orbit.',3,'#9aa3b3')})}
  else{C.phase='earth';
    if(t>16.4)once('e5',()=>{sfx('alarm');endLine('ending_3','#5cd0ff',3.2)});
    if(t>20.6)once('e6',()=>{sfx('heart');endLine('ending_4','#5cd0ff',3.2)});          // the scan sweeps the dust away
    if(t>25.2)once('e7',()=>{sfx('heart');endLine('ending_5','#ffb03a',2.2)});
    if(t>28.6)once('e8',()=>{sfx('alert');endLine('ending_6','#ff7b7b',5)});
    if(t>34.2)once('e9',()=>{sfx('rumble');endLine('ending_7','#ffb03a',4)});
    if(t>40.5){once('e10',()=>sfx('title'));C.title=Math.min(1,C.title+dt*0.6)}
  }
  for(const p of C.pt){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt}C.pt=C.pt.filter(p=>p.t>0);
}
function endRender(){
  const C=CUT,T=performance.now()/1000,sx=C.shake?rnd(-C.shake,C.shake):0,sy=C.shake?rnd(-C.shake,C.shake):0;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  if(C.phase==='ground'){
    const z=1.25,camy=-C.lift*0.55;
    ctx.drawImage(gc,(OX*(1-z)+sx)*DPR,(OY*(1-z)-camy*S*z+sy)*DPR,cv.width*z,cv.height*z);
    const tf=()=>ctx.setTransform(DPR*S*z,0,0,DPR*S*z,DPR*(OX+sx),DPR*(OY-camy*S*z+sy));tf();
    ctx.fillStyle='#00000066';ctx.beginPath();ctx.ellipse(0,6,60/(1+C.lift/120),20/(1+C.lift/120),0,0,7);ctx.fill();
    const list=[{y:0,f:()=>{ctx.save();ctx.translate(0,-C.lift);drawShip();ctx.restore()}}];for(const e of C.eyes)list.push({y:e.y,f:()=>drawEnemy(e,T)});
    list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
    const d=dctx;d.setTransform(1,0,0,1,0,0);d.globalCompositeOperation='source-over';d.clearRect(0,0,dk.width,dk.height);d.fillStyle='rgba(2,3,8,0.9)';d.fillRect(0,0,dk.width,dk.height);
    d.globalCompositeOperation='destination-out';d.setTransform(DPR*S*z,0,0,DPR*S*z*K,DPR*(OX+sx),DPR*(OY-camy*S*z+sy));
    const lr=230+(C.t>4?(C.t-4)*25:0);let g=d.createRadialGradient(0,-C.lift/K,0,0,-C.lift/K,lr);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.6,'rgba(0,0,0,0.9)');g.addColorStop(1,'rgba(0,0,0,0)');
    d.fillStyle=g;d.beginPath();d.arc(0,-C.lift/K,lr,0,7);d.fill();
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dk,0,0);tf();
    ctx.globalCompositeOperation='lighter';
    for(const p of plants){ctx.globalAlpha=0.12;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y-9,p.s*3,0,7);ctx.fill()}ctx.globalAlpha=1;
    for(const e of C.eyes)drawEyes(e,T);
    if(C.t>4)glowDot(0,20-C.lift,40+Math.random()*10,'#ff7a2a',0.9);
    glowDot(28,-16-C.lift,10,'#1fd1ff',0.6);
    for(const p of C.pt){ctx.globalAlpha=Math.min(1,p.t*2.5);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';ctx.setTransform(DPR,0,0,DPR,0,0);
  }else if(C.phase==='space'){
    ctx.setTransform(DPR,0,0,DPR,0,0);const k=(C.t-12)/4;
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02030a');g.addColorStop(1,'#150b16');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const [x,y,s,p] of C.stars){ctx.globalAlpha=0.35+0.4*Math.sin(T*2+p);ctx.fillStyle='#fff';ctx.fillRect(x*W,y*H*0.8,s,s)}ctx.globalAlpha=1;
    const pr=Math.max(W,H)*1.4,pcy=H+pr*0.72+k*H*0.6;const pg=ctx.createRadialGradient(W/2,pcy,pr*0.6,W/2,pcy,pr);pg.addColorStop(0,'#1a0a0e');pg.addColorStop(0.96,'#2a1015');pg.addColorStop(1,'#ff5a3d66');
    ctx.fillStyle=pg;ctx.beginPath();ctx.arc(W/2,pcy,pr,0,7);ctx.fill();
    const px=W*(0.5+0.35*k),py=H*(0.75-0.6*k),sc=(0.9-0.7*k)*Math.min(1.4,Math.min(W,H)/500);
    ctx.globalCompositeOperation='lighter';ctx.save();ctx.translate(px-30*sc,py+20*sc);glowDot(0,0,50*sc,'#5cd0ff',0.9);ctx.restore();ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(px,py);ctx.scale(sc,sc);ctx.rotate(-0.6);drawShip();ctx.restore();
  }else if(C.phase==='earth'){
    ctx.setTransform(DPR,0,0,DPR,0,0);const t=C.t,fin=Math.min(1,(t-16)/1.2);
    ctx.fillStyle='#02030a';ctx.fillRect(0,0,W,H);
    for(const [x,y,s2,p] of C.stars){ctx.globalAlpha=(0.3+0.4*Math.sin(T*2+p))*fin;ctx.fillStyle='#fff';ctx.fillRect(x*W,y*H,s2,s2)}ctx.globalAlpha=1;
    const R_=Math.min(W*0.27,H*0.31),cx=W*0.58,cy=H*0.4,scan=t<20.8?-1:(t-20.8)/3.4*1.1-0.05;
    const tex=earthFrame(0.35+t*0.012,T,scan);
    const ag=ctx.createRadialGradient(cx,cy,R_*0.92,cx,cy,R_*1.18);ag.addColorStop(0,'rgba(255,150,90,0.28)');ag.addColorStop(1,'rgba(255,150,90,0)');ctx.globalAlpha=fin;ctx.fillStyle=ag;ctx.beginPath();ctx.arc(cx,cy,R_*1.18,0,7);ctx.fill();
    ctx.imageSmoothingEnabled=false;ctx.drawImage(tex,cx-R_,cy-R_,R_*2,R_*2);ctx.imageSmoothingEnabled=true;
    for(const q of EARTH_DEBRIS){const a=q.a+t*q.w,ex=Math.cos(a)*q.r*R_,ey=Math.sin(a)*q.r*R_*q.tl;if(Math.sin(a)<0&&Math.hypot(ex,ey)<R_)continue;   // dead satellites / wreckage (back half hidden)
      ctx.globalAlpha=0.55*fin;ctx.fillStyle='#9a928a';ctx.fillRect(cx+ex,cy+ey-R_*0.1,q.s,q.s)}ctx.globalAlpha=1;
    if(scan>-0.05&&scan<1.05){const sy=cy-R_+scan*R_*2,hw=Math.sqrt(Math.max(0,R_*R_-(sy-cy)*(sy-cy)));if(hw>2){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(92,208,255,0.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-hw-14,sy);ctx.lineTo(cx+hw+14,sy);ctx.stroke();ctx.globalCompositeOperation='source-over'}}
    const sc=0.3*Math.min(1.4,Math.min(W,H)/500),sx=W*0.14+(t-16)*5,sy2=H*0.66-(t-16)*1.2;   // the ship, small, drifting towards the planet
    ctx.globalAlpha=fin;ctx.save();ctx.translate(sx,sy2);ctx.scale(sc,sc);ctx.rotate(-0.25);drawShip();ctx.restore();ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.textBaseline='middle';
    if(t>24.4){ctx.globalAlpha=Math.min(1,(t-24.4)*1.5);ctx.font='bold 15px monospace';ctx.fillStyle='#5cd0ff';ctx.fillText('SOL III  ·  EARTH',cx,cy+R_*1.28)}
    if(t>29){ctx.globalAlpha=Math.min(1,(t-29)*1.2);ctx.font='bold 17px monospace';ctx.fillStyle='#ff7b7b';ctx.fillText('TEMPORAL DISPLACEMENT  +4,000 YEARS',cx,cy+R_*1.28+26)}
    ctx.globalAlpha=1;
    if(t>38.4){ctx.fillStyle='#000';ctx.globalAlpha=Math.min(1,(t-38.4)/2);ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
  }else ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.textAlign='center';ctx.textBaseline='middle';
  C.subs.forEach((s,i)=>{const a=Math.min(1,s.t*3,(s.dur-s.t)*2);ctx.globalAlpha=Math.max(0,a);ctx.font=(C.phase==='black'?'bold 19px':'17px')+' monospace';
    const y=C.phase==='black'?H/2-30+i*36:H-70-(C.subs.length-1-i)*28;ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.strokeText(s.text,W/2,y);ctx.fillStyle=s.col;ctx.fillText(s.text,W/2,y)});
  ctx.globalAlpha=1;
  if(C.title>0){ctx.globalAlpha=C.title;const fs=Math.min(30,W/18);
    ctx.font=`bold ${fs}px monospace`;ctx.fillStyle='#ffb03a';ctx.fillText('THANK YOU FOR PLAYING',W/2,H/2-fs*1.6);
    ctx.font=`900 ${fs*1.8}px ui-monospace,monospace`;const tg=ctx.createLinearGradient(0,H/2-fs,0,H/2+fs);tg.addColorStop(0,'#fff6c8');tg.addColorStop(1,'#ff4318');ctx.fillStyle=tg;ctx.shadowColor='#ff5a1f';ctx.shadowBlur=24;ctx.fillText('HOPEFIRE',W/2,H/2+fs*0.3);ctx.shadowBlur=0;
    ctx.font='14px monospace';ctx.fillStyle='#cfd4de';ctx.fillText('a game by duyluma',W/2,H/2+fs*1.9);
    ctx.fillStyle='#7dffb0';ctx.fillText('∞ Endless Wastes unlocked',W/2,H/2+fs*1.9+30);
    if(C.title>=1&&Math.sin(T*4)>-0.3){ctx.font='bold 13px monospace';ctx.fillStyle='#ffb03a';ctx.fillText('— tap to continue —',W/2,H/2+fs*1.9+66)}
    ctx.globalAlpha=1}
}
