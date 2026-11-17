"use strict";
// ===== UPDATE CHECK =====
// The game polls version.json (cache-busted) on load, every 60s and when the tab regains focus.
// If a newer version exists: a popup asks to update now (reload with ?v=<new>) or later
// (collapses into a small button that re-opens the popup).
// If version.json has "minVersion" newer than the running build, "Later" is hidden (forced update).
const VERSION=window.HF_VERSION||'dev';
const UPDATE_EVERY=60000;
let UPD=null;
function cmpVer(a,b){const pa=String(a).split('.').map(Number),pb=String(b).split('.').map(Number);for(let i=0;i<3;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d}return 0}
async function checkUpdate(){
  if(VERSION==='dev')return;
  try{
    const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
    const j=await r.json();
    if(j&&j.version&&cmpVer(j.version,VERSION)>0){const isNew=!UPD||UPD.version!==j.version;UPD=j;if(isNew)showUpdate();else refreshUpdBtn()}
  }catch(e){}
}
const mustUpdate=()=>UPD&&UPD.minVersion&&cmpVer(VERSION,UPD.minVersion)<0;
function showUpdate(){
  if(!UPD)return;const el=$('upd');
  const notes=(UPD.notes||[]).map(n=>`<li>${String(n).replace(/</g,'&lt;')}</li>`).join('');
  const inRun=R&&!R.over;
  el.innerHTML=`<div class="panel center updp">
    <div class="logo" style="font-size:30px">UPDATE AVAILABLE</div>
    <div class="updv">v${VERSION} <span>→</span> <b>v${UPD.version}</b>${UPD.date?` <small>(${UPD.date})</small>`:''}</div>
    ${notes?`<ul class="updn">${notes}</ul>`:''}
    ${inRun?'<div class="updw">Updating now ends the current run. Your ship repairs and Xeno-cores are saved.</div>':''}
    ${mustUpdate()?'<div class="updw">This update is required to keep playing.</div>':''}
    <button class="big" id="updNow">⬆ UPDATE NOW</button>
    ${mustUpdate()?'':'<br><button class="small" id="updLater" style="font-size:13px;color:#8a92a2;margin:12px 0 0">Later</button>'}
  </div>`;
  el.classList.remove('hidden');$('updBtn').classList.add('hidden');
  if(R&&!R.over)R.updPause=true;
  $('updNow').onclick=doUpdate;
  const l=$('updLater');if(l)l.onclick=laterUpdate;
}
function laterUpdate(){$('upd').classList.add('hidden');$('upd').innerHTML='';if(R)R.updPause=false;refreshUpdBtn()}
function refreshUpdBtn(){const b=$('updBtn');if(!UPD||!$('upd').classList.contains('hidden'))return;b.textContent='⬆ v'+UPD.version;b.classList.remove('hidden')}
function doUpdate(){
  save();
  const u=new URL(location.href);u.searchParams.set('v',UPD.version);
  location.replace(u.toString());
}
$('updBtn').onclick=()=>{sfx('click');showUpdate()};
$('verT').textContent='v'+VERSION;
setTimeout(checkUpdate,2500);
setInterval(checkUpdate,UPDATE_EVERY);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate()});
