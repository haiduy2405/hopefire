"use strict";
// ===== VOICE-OVER + FILE MUSIC =====
// Optional audio files. Nothing breaks when they are missing.
//  - assets/vo/manifest.js     → window.VO_FILES = ['intro_1', ...]      (lines: docs/VOICE_SCRIPT.md)
//  - assets/music/manifest.js  → window.MUSIC_FILES = {menu:'menu.mp3', boss:'boss.mp3', ending:'ending.mp3'}
// Uses <audio> elements (works on http:// and in the Electron file:// build).
const VO_LINES={
  intro_1:['HOPE','Hull breach. Engines failing. Brace for impact.'],intro_2:['COMMANDER','...Where... am I?'],intro_3:['HOPE',"Movement detected. They can't see us... yet."],
  tut_ring:['HOPE',"They're blind. They only sense us inside the light."],tut_crate:['HOPE',"Salvage crate. Let's see what survived."],first_mod:['COMMANDER',"Okay. That'll do."],
  synergy:['HOPE','Systems linked. Output rising.'],star_up:['COMMANDER','Better. Much better.'],legendary:['COMMANDER',"Now that's what I needed."],
  low_hope:['HOPE',"Hope critical. I... can't hold much longer."],cell:['COMMANDER','Come on... stay with me.'],second_wind:['HOPE','Rerouting emergency power. One more chance.'],
  boss_1:['HOPE','Massive signal. It swallowed our navigation core.'],boss_2:['HOPE',"Brood signature. She's birthing more as she comes."],boss_3:['HOPE','Armoured target. Strike when it stops charging.'],
  boss_4:['HOPE',"It's blinking through the dark. Watch the edges."],boss_5:['HOPE','The source of it all. It feeds on our light.'],boss_down:['COMMANDER','Got you. Part recovered.'],
  death:['HOPE','Hope... fading...'],repair:['COMMANDER','Patch her up. We go again.'],new_site:['HOPE','Engines at partial power. We can jump.'],nightmare:['HOPE','Readings off the scale. This is a bad idea.'],
  ending_1:['HOPE','All systems restored. Hope at one hundred percent.'],ending_2:['COMMANDER','Take us home.'],ending_3:['HOPE','Navigation core restored. Star charts aligned.'],ending_4:['HOPE','Position confirmed. Third planet from the Sun.'],
  ending_5:['COMMANDER','...Earth.'],ending_6:['HOPE','We crossed a singularity. Temporal displacement: four thousand years.'],ending_7:['COMMANDER','We never left home. We came back too late.']
};
const VO_CD={star_up:60,low_hope:30,cell:25,synergy:20,legendary:30};
const VO={have:new Set(window.VO_FILES||[]),cur:null,last:{}};
const VO_COL={HOPE:'#5cd0ff',COMMANDER:'#ffb03a','???':'#ff7b7b'};
function vo(id,force){
  if(!VO.have.has(id)||meta.muted||meta.set.voice===0)return false;
  const now=performance.now()/1000;if(!force&&VO.last[id]&&now-VO.last[id]<(VO_CD[id]||0))return false;
  if(VO.cur&&!VO.cur.ended&&!force)return false; // one line at a time
  VO.last[id]=now;
  const a=new Audio('assets/vo/'+id+'.mp3?v='+(window.HF_VERSION||''));a.volume=Math.min(1,(meta.set.voice??80)/100);
  if(VO.cur)try{VO.cur.pause()}catch(e){}
  VO.cur=a;a.play().catch(()=>{});MUS.voDuck=1;applyMusicVolume();
  a.onended=()=>{if(VO.cur===a){VO.cur=null;MUS.voDuck=0;applyMusicVolume();hideSub()}};
  const [who,txt]=VO_LINES[id]||['',''];showSub(who,txt);return true;
}
function showSub(who,txt){let s=$('subs');if(!s){s=document.createElement('div');s.id='subs';document.body.appendChild(s)}
  s.innerHTML=`<b style="color:${VO_COL[who]||'#fff'}">${who}</b> ${txt}`;s.classList.add('on');clearTimeout(s._t);s._t=setTimeout(hideSub,Math.max(2500,txt.length*70))}
function hideSub(){const s=$('subs');if(s)s.classList.remove('on')}
// ---------- file music (Suno etc.) ----------
const FM={files:window.MUSIC_FILES||{},el:{},cur:null};
function fileMusic(kind){ // kind: 'menu'|'boss'|'ending'|null ; returns true when a file track is playing for it
  const f=kind&&FM.files[kind];
  if(FM.cur&&FM.cur!==kind){const old=FM.el[FM.cur];if(old)fadeEl(old,0,1.2,true)}
  if(!f){FM.cur=null;return false}
  let el=FM.el[kind];if(!el){el=FM.el[kind]=new Audio('assets/music/'+f+'?v='+(window.HF_VERSION||''));el.loop=true;el.volume=0}
  if(FM.cur!==kind){FM.cur=kind;if(el.paused){el.currentTime=0;el.play().catch(()=>{})}}
  fadeEl(el,fileMusicVol(),1.5,false);return true;
}
function fileMusicVol(){return meta.muted?0:Math.min(1,(meta.set.mus??60)/100*0.9*(MUS.duck||1)*(MUS.voDuck?0.45:1))}
function fadeEl(el,to,sec,stop){clearInterval(el._fi);const from=el.volume,t0=performance.now();el._fi=setInterval(()=>{const p=Math.min(1,(performance.now()-t0)/(sec*1000));el.volume=Math.max(0,Math.min(1,from+(to-from)*p));if(p>=1){clearInterval(el._fi);if(stop&&to===0)el.pause()}},50)}
