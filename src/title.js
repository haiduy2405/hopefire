"use strict";
// ===== TITLE SCREEN · SAVE SLOTS · OPTIONS · CREDITS =====
// Boot → titleScreen(). A save slot must be chosen before the ship hub (menu() in ui.js) opens.
// Settings are global (SETTINGS, shared by all slots); progress lives in hopefire_slot_1..3.
const IS_DESKTOP=!!window.HF_DESKTOP;
const DIFFS=[
  {k:'easy',n:'EASY',d:'Relaxed. More Hope, softer creatures.',ok:false},
  {k:'normal',n:'NORMAL',d:'The intended experience.',ok:true},
  {k:'hard',n:'HARD',d:'Tougher swarms, smarter bosses.',ok:false},
  {k:'hell',n:'HELL',d:'For veterans. Every mistake is fatal.',ok:false}];
const diffName=k=>(DIFFS.find(d=>d.k===k)||DIFFS[1]).n;

function titleEl(){let t=$('title');if(!t){t=document.createElement('div');t.id='title';document.body.appendChild(t)}return t}
function closeTitle(){const t=$('title');if(t)t.remove()}
function embers(){let h='';for(let i=0;i<34;i++)h+=`<i style="left:${Math.random()*100}%;animation-delay:${-Math.random()*9}s;animation-duration:${6+Math.random()*7}s;--dx:${(Math.random()*120-60)|0}px;--s:${1+Math.random()*2.5}px"></i>`;return `<div class="embers">${h}</div>`}

function titleScreen(){
  if(SLOT)save();SLOT=0;meta=Object.assign(defMeta(),{set:SETTINGS,muted:SETTINGS.muted});
  R=null;hide();hideTip();document.body.classList.add('inmenu','intitle');
  const t=titleEl(),last=SETTINGS.lastSlot&&readSlot(SETTINGS.lastSlot);
  t.innerHTML=`<div class="tbg"></div><div class="tshade"></div>${embers()}
    <div class="tmain"><img class="tlogo" src="assets/ui/logo.png" alt="HOPEFIRE"><div class="ttag">When all hope is lost, the ship still fires.</div>
      <nav class="tnav">
        ${last?`<button class="tbtn prim" id="tCont">CONTINUE<small>${esc(last.name)} · ${siteTxt(last)}</small></button>`:''}
        <button class="tbtn ${last?'':'prim'}" id="tPlay">${last?'SAVE SLOTS':'PLAY'}</button>
        <button class="tbtn" id="tOpt">OPTIONS</button>
        <button class="tbtn" id="tCred">CREDITS</button>
        ${IS_DESKTOP?'<button class="tbtn" id="tQuit">QUIT</button>':''}
      </nav></div>
    <div class="tfoot"><span>v${VERSION}</span><span>© 2026 duyluma</span></div>`;
  const go=(id,f)=>{const b=$(id);if(b)b.onclick=()=>{audioInit();sfx('click');f()};if(b)b.onmouseenter=()=>sfx('flip0')};
  go('tCont',()=>enterSlot(SETTINGS.lastSlot));go('tPlay',slotScreen);go('tOpt',()=>panelOptions(titleScreen));go('tCred',creditsScreen);go('tQuit',()=>window.close());
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function siteTxt(m){return m.story?'Story complete ★':'Site '+Math.min(m.chapter,MAXCH)+'/'+MAXCH}
function timeTxt(s){s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h}h ${m}m`:`${m}m`}
function dateTxt(ms){if(!ms)return'—';const d=new Date(ms);return d.toLocaleDateString(undefined,{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}

// ---------- save slots ----------
function slotScreen(){
  const t=titleEl();let cards='';
  for(let n=1;n<=SLOTS;n++){const m=readSlot(n);
    cards+=m?`<div class="slot" data-n="${n}"><div class="snum">SLOT ${n}</div><div class="sname">${esc(m.name)}</div>
        <div class="sdiff d-${m.diff}">${diffName(m.diff)}</div>
        <div class="sprog">${[1,2,3,4,5].map(i=>`<i class="${m.best[i]>BOSS_WAVE?'done':i<=m.chapter?'open':''}"></i>`).join('')}</div>
        <div class="sinfo">${siteTxt(m)} · ✦ ${fmt(m.mastery)}<br>Played ${timeTxt(m.stats.time)} · ${m.runs} runs<br><span>Last: ${dateTxt(m.lastPlayed)}</span></div>
        <div class="sact"><button class="tbtn prim sm" data-a="play">PLAY</button><button class="tbtn sm" data-a="ren">RENAME</button><button class="tbtn sm danger" data-a="del">DELETE</button></div></div>`
      :`<div class="slot empty" data-n="${n}"><div class="snum">SLOT ${n}</div><div class="snew">+</div><div class="sinfo">Empty slot</div><div class="sact"><button class="tbtn prim sm" data-a="new">NEW GAME</button></div></div>`}
  t.innerHTML=`<div class="tbg dim"></div><div class="tshade"></div>${embers()}<div class="tpage"><h1>SELECT SAVE</h1><div class="slots">${cards}</div>
    <button class="tbtn back" id="tBack">◂ BACK</button></div>`;
  t.querySelectorAll('.slot button').forEach(b=>b.onclick=()=>{audioInit();sfx('click');const n=+b.closest('.slot').dataset.n,a=b.dataset.a;
    if(a==='play')enterSlot(n);else if(a==='new')newGameDialog(n);else if(a==='ren')renameDialog(n);else if(a==='del')deleteDialog(n)});
  $('tBack').onclick=()=>{sfx('click');titleScreen()};
}
function dialog(html,onOk){
  const d=document.createElement('div');d.id='tdlg';d.innerHTML=`<div class="tdpanel">${html}</div>`;titleEl().appendChild(d);
  const close=()=>d.remove();d.querySelector('[data-x]')&&(d.querySelector('[data-x]').onclick=()=>{sfx('click');close()});
  const ok=d.querySelector('[data-ok]');if(ok)ok.onclick=()=>{sfx('click');if(onOk(d)!==false)close()};
  const inp=d.querySelector('input');if(inp){inp.focus();inp.select();inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')ok&&ok.click();if(e.key==='Escape')close()}}
  return d;
}
function newGameDialog(n){
  let pick='normal';
  const d=dialog(`<h2>NEW GAME · SLOT ${n}</h2><label class="tlbl">Commander name</label><input class="tinp" maxlength="18" value="Commander">
    <label class="tlbl">Difficulty</label><div class="diffs">${DIFFS.map(x=>`<button class="diff ${x.k===pick?'on':''} ${x.ok?'':'lock'}" data-k="${x.k}" ${x.ok?'':'disabled'}><b>${x.n}</b><span>${x.ok?x.d:'Coming soon'}</span></button>`).join('')}</div>
    <div class="tdbtn"><button class="tbtn" data-x>CANCEL</button><button class="tbtn prim" data-ok>START ▸</button></div>`,dd=>{
      const name=(dd.querySelector('input').value||'Commander').trim().slice(0,18)||'Commander';
      useSlot(n,{name,diff:pick});closeTitle();document.body.classList.remove('intitle');menu();return true});
  d.querySelectorAll('.diff:not(.lock)').forEach(b=>b.onclick=()=>{pick=b.dataset.k;d.querySelectorAll('.diff').forEach(x=>x.classList.toggle('on',x===b));sfx('click')});
}
function renameDialog(n){const m=readSlot(n);dialog(`<h2>RENAME SLOT ${n}</h2><input class="tinp" maxlength="18" value="${esc(m.name)}"><div class="tdbtn"><button class="tbtn" data-x>CANCEL</button><button class="tbtn prim" data-ok>SAVE</button></div>`,
  dd=>{const v=dd.querySelector('input').value.trim().slice(0,18);if(!v)return false;renameSlot(n,v);slotScreen()})}
function deleteDialog(n){const m=readSlot(n);let armed=false;
  const d=dialog(`<h2>DELETE SLOT ${n}?</h2><p class="tdtxt"><b>${esc(m.name)}</b> · ${siteTxt(m)} · ${timeTxt(m.stats.time)} played.<br>This cannot be undone.</p><div class="tdbtn"><button class="tbtn" data-x>CANCEL</button><button class="tbtn danger" data-ok>DELETE</button></div>`,
  dd=>{if(!armed){armed=true;dd.querySelector('[data-ok]').textContent='CLICK AGAIN TO CONFIRM';return false}deleteSlot(n);sfx('boom');slotScreen()})}
function enterSlot(n){if(!readSlot(n))return slotScreen();useSlot(n);applyVolume();speed=SETTINGS.spd||1;$('spdBtn').textContent=speed+'x';closeTitle();document.body.classList.remove('intitle');menu()}
function toTitle(){if(R&&!R.over){R.over=true;meta.mastery+=Math.floor(R.cores||0);meta.runs++;meta.tut.done1=1}const p=$('pausePanel');if(p)p.remove();save();titleScreen()}

// ---------- options (tabs) ----------
let optTab='audio';
function panelOptions(back){
  const S_=SETTINGS,inT=!!$('title');const host=inT?titleEl():null;
  const tabs={audio:'AUDIO',video:'VIDEO',game:'GAMEPLAY',keys:'CONTROLS'};
  const rng=(id,k,lab)=>`<label class="orow"><span>${lab}</span><input type="range" id="${id}" min="0" max="100" value="${S_[k]}"><b id="${id}T">${S_[k]}%</b></label>`;
  const chk=(id,on,lab,sub)=>`<label class="orow"><span>${lab}${sub?`<small>${sub}</small>`:''}</span><input type="checkbox" id="${id}" ${on?'checked':''}></label>`;
  const body={
    audio:rng('oVol','vol','Sound effects')+rng('oMus','mus','Music')+rng('oVoice','voice','Voice')+chk('oMute',meta.muted,'Mute all'),
    video:`<label class="orow"><span>Interface size</span><select id="oUi">${[[0,'Auto'],[1,'100%'],[1.25,'125%'],[1.5,'150%'],[1.75,'175%']].map(([v,l])=>`<option value="${v}" ${S_.uiScale==v?'selected':''}>${l}</option>`).join('')}</select></label>`
      +chk('oFull',!!document.fullscreenElement,'Fullscreen','F11')+chk('oShake',S_.shake,'Screen shake')+chk('oFlash',S_.flashes,'Screen flashes','turn off if flashes bother you')+chk('oNums',S_.nums,'Damage numbers'),
    game:`<label class="orow"><span>Default game speed</span><select id="oSpd">${[1,2,3].map(v=>`<option ${S_.spd===v?'selected':''} value="${v}">${v}x</option>`).join('')}</select></label>`
      +chk('oLock',S_.lockGame!==0,'Crate lock mini-game','off = crates open instantly')
      +chk('oRumble',S_.rumble!==0,'Controller vibration')
      +(SLOT&&lv('auto')?chk('oAuto',meta.autoCast,'Spell autocast'):'')
      +(SLOT?`<label class="orow"><span>Tutorial tips<small>show the hints again</small></span><button class="tbtn sm" id="oTut">RESET</button></label>`:''),
    keys:`<div class="okeys">${[['Space','Open crate / confirm'],['1 – 5','Pick a card'],['Q W E','Cast spells'],['Tab','Loadout'],['R','Reactor mode'],['Esc / P','Pause'],['F11','Fullscreen'],['Gamepad','D-pad/stick + A/B in menus · A crate · X/Y/B spells · LB/RB mark · LT reactor · RT speed · Back loadout · Start pause']].map(([k,v])=>`<div><kbd>${k}</kbd><span>${v}</span></div>`).join('')}</div>`};
  const html=`<div class="opanel"><h1>OPTIONS</h1><div class="otabs">${Object.entries(tabs).map(([k,v])=>`<button class="${k===optTab?'on':''}" data-t="${k}">${v}</button>`).join('')}</div>
    <div class="obody">${body[optTab]}</div><button class="tbtn back" id="oBack">◂ BACK</button></div>`;
  if(host){host.innerHTML=`<div class="tbg dim"></div><div class="tshade"></div><div class="tpage">${html}</div>`}else show(`<div class="panel">${html}</div>`);
  const root=host||modal;
  root.querySelectorAll('.otabs button').forEach(b=>b.onclick=()=>{optTab=b.dataset.t;sfx('click');panelOptions(back)});
  const on=(id,ev,f)=>{const e=$(id);if(e)e[ev]=f};
  const slide=(id,k,fx)=>on(id,'oninput',e=>{S_[k]=+e.target.value;$(id+'T').textContent=S_[k]+'%';audioInit();fx&&fx();save()});
  slide('oVol','vol',applyVolume);slide('oMus','mus',applyVolume);slide('oVoice','voice');
  on('oVol','onchange',()=>sfx('kill'));on('oVoice','onchange',()=>vo('synergy',1));
  on('oMute','onchange',e=>{meta.muted=e.target.checked;SETTINGS.muted=meta.muted;applyVolume();$('muteBtn').textContent=meta.muted?'🔇':'🔊';save()});
  on('oUi','onchange',e=>{S_.uiScale=+e.target.value;save();resize()});
  on('oFull','onchange',e=>{try{e.target.checked?document.documentElement.requestFullscreen():document.exitFullscreen()}catch(_){}});
  on('oShake','onchange',e=>{S_.shake=e.target.checked?1:0;save()});on('oFlash','onchange',e=>{S_.flashes=e.target.checked?1:0;save()});
  on('oNums','onchange',e=>{S_.nums=e.target.checked?1:0;save()});
  on('oSpd','onchange',e=>{S_.spd=+e.target.value;speed=S_.spd;$('spdBtn').textContent=speed+'x';save()});
  on('oRumble','onchange',e=>{SETTINGS.rumble=e.target.checked?1:0;save();if(e.target.checked)padRumble(200,0.6,0.6)});
  on('oLock','onchange',e=>{SETTINGS.lockGame=e.target.checked?1:0;save()});
  on('oAuto','onchange',e=>{meta.autoCast=e.target.checked;save()});
  on('oTut','onclick',e=>{const keep={intro:meta.tut.intro,done1:meta.tut.done1};meta.tut=keep;save();e.target.textContent='DONE';sfx('up')});
  $('oBack').onclick=()=>{sfx('click');back()};
}
function panelSettings(){panelOptions(()=>R&&R.userPause?showPausePanel():menu())}

// ---------- credits ----------
function creditsScreen(){
  const t=titleEl();
  t.innerHTML=`<div class="tbg dim"></div><div class="tshade"></div>${embers()}<div class="tpage"><div class="credits">
    <img class="tlogo sm" src="assets/ui/logo.png" alt="HOPEFIRE">
    <h3>A GAME BY</h3><p>duyluma</p>
    <h3>DESIGN · DIRECTION</h3><p>duyluma</p>
    <h3>CODE · DESIGN SUPPORT</h3><p>Built with Claude (Anthropic)</p>
    <h3>ART</h3><p>Key art and sprites created with AI image tools,<br>edited and integrated by the developer</p>
    <h3>MUSIC &amp; SOUND</h3><p>Adaptive soundtrack and effects synthesised in-engine${(window.MUSIC_FILES&&Object.keys(window.MUSIC_FILES).length)?'<br>Additional music made with Suno':''}</p>
    ${(window.VO_FILES&&window.VO_FILES.length)?'<h3>VOICES</h3><p>AI voices: Kokoro (Apache-2.0), Chatterbox (MIT)</p>':''}
    <h3>THANK YOU</h3><p>for playing. Keep the light burning.</p>
  </div><button class="tbtn back" id="tBack">◂ BACK</button></div>`;
  $('tBack').onclick=()=>{sfx('click');titleScreen()};
}
