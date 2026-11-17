"use strict";
// ===== LOOP =====
let last=performance.now();
function loop(now){
  const raw=Math.min(0.05,(now-last)/1000);last=now;
  if(CUT){try{cutUpdate(raw);if(CUT)cutRender()}catch(err){console.error(err);endCutscene()}requestAnimationFrame(loop);return}
  if(R&&!R.paused&&!R.over&&!R.tipPause&&!R.updPause&&!R.userPause)for(let i=0;i<speed;i++){update(raw);if(R.over)break}
  try{render(raw)}catch(err){console.error(err)}
  hud(raw);requestAnimationFrame(loop);
}
menu();requestAnimationFrame(loop);
