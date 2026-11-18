"use strict";
// ===== LOOP =====
let last=performance.now();
function loop(now){
  const raw=Math.min(0.05,(now-last)/1000);last=now;
  if(CUT){try{cutUpdate(raw);if(CUT)cutRender()}catch(err){console.error(err);endCutscene()}requestAnimationFrame(loop);return}
  let dt=raw;if(R&&!R.paused&&!R.userPause){if(R.hs>0){R.hs-=raw;dt=0}else if(R.slow>0){R.slow-=raw;dt=raw*0.35}}
  if(dt>0&&R&&!R.paused&&!R.over&&!R.tipPause&&!R.updPause&&!R.userPause)for(let i=0;i<speed;i++){update(dt);if(R.over)break}
  try{render(raw)}catch(err){console.error(err)}
  hud(raw);requestAnimationFrame(loop);
}
titleScreen();requestAnimationFrame(loop);
