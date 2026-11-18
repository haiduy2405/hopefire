"use strict";
// ===== LOOP =====
let last=performance.now(),IDLE_N=0;
const FPS={n:0,t:0,fps:0,min:999,sum:0,cnt:0,rs:0};
function fpsShow(){let b=document.getElementById('fpsBox');if(!b){b=document.createElement('div');b.id='fpsBox';document.body.appendChild(b)}b.style.display=SETTINGS.fps?'block':'none'}
addEventListener('keydown',e=>{if(e.code==='F3'){SETTINGS.fps=SETTINGS.fps?0:1;save();fpsShow();e.preventDefault()}});
function fpsTick(now,ms){FPS.n++;FPS.rs+=ms;if(now-FPS.t>=1000){const f=FPS.n*1000/(now-FPS.t),rm=FPS.rs/FPS.n;FPS.n=0;FPS.rs=0;FPS.t=now;FPS.fps=f;
  if(R&&!R.over&&!R.paused&&!R.userPause){FPS.sum+=f;FPS.cnt++;FPS.min=Math.min(FPS.min,f)}
  if(SETTINGS.fps){const b=document.getElementById('fpsBox');if(b)b.textContent=Math.round(f)+' fps · avg '+(FPS.cnt?Math.round(FPS.sum/FPS.cnt):'-')+' · min '+(FPS.min<999?Math.round(FPS.min):'-')+'\nrender '+rm.toFixed(1)+' ms · '+(R?R.en.length:0)+' creatures'}}}
function loop(now){
  const raw=Math.min(0.05,(now-last)/1000);last=now;
  if(CUT){try{cutUpdate(raw);if(CUT)cutRender()}catch(err){console.error(err);endCutscene()}requestAnimationFrame(loop);return}
  let dt=raw;if(R&&!R.paused&&!R.userPause){if(R.hs>0){R.hs-=raw;dt=0}else if(R.slow>0){R.slow-=raw;dt=raw*0.35}}
  if(dt>0&&R&&!R.paused&&!R.over&&!R.tipPause&&!R.updPause&&!R.userPause)for(let i=0;i<speed;i++){update(dt);if(R.over)break}
  const _idle=R&&R.paused&&!R.over&&modal&&!modal.classList.contains('hidden');if(_idle){IDLE_N=(IDLE_N||0)+1}else IDLE_N=0;
  const _t0=performance.now();if(!_idle||IDLE_N%3===1){try{render(raw)}catch(err){console.error(err)}}
  fpsTick(now,performance.now()-_t0);
  hud(raw);requestAnimationFrame(loop);
}
// Music on the title screen from the first frame: Electron allows autoplay (see tools/desktop/main.js); in a normal browser
// the first click/key/touch unlocks audio and starts any file track that was blocked.
i18nInit();audioInit();
(function(){const kick=()=>{try{if(AC&&AC.state!=='running')AC.resume();const el=FM.cur&&FM.el[FM.cur];if(el&&el.paused)el.play().catch(()=>{})}catch(e){}};
  ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,kick,{passive:true}))})();
titleScreen();fpsShow();requestAnimationFrame(loop);
