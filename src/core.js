"use strict";
// ===== SAVE =====
const SAVE_KEY='hopefire_v1';           // legacy single save (kept as backup, migrated to slot 1)
const SLOT_KEY=n=>'hopefire_slot_'+n,SET_KEY='hopefire_settings',SLOTS=3;
// Key labels that follow the active input device (pad.js sets PADMODE when a controller is being used)
let PADMODE=false;
function spKey(i){return PADMODE&&typeof padGlyph==='function'?padGlyph(['X','Y','B'][i]||'X'):'QWE'[i]}
function confirmKey(){return PADMODE&&typeof padGlyph==='function'?padGlyph('A'):'Space'}
const defMeta=()=>({mastery:0,up:{},chapter:1,best:{},runs:0,sel:1,tut:{},muted:false,
  stats:{kills:0,crates:0,spells:0,bosses:0,legend:0,time:0,reactions:0},ach:{},set:{},story:0,bestEndless:0,autoCast:true,night:{},nightSel:false,warp:false,
  name:'Commander',diff:'normal',created:0,lastPlayed:0,ship:'hope',muts:[]});
const defSettings=()=>({vol:55,mus:60,voice:80,shake:1,nums:1,spd:1,uiScale:0,flashes:1,lockGame:1,muted:false,lastSlot:0,fps:0,lang:''});
function mergeMeta(s){const d=defMeta(),m=Object.assign(d,s);m.stats=Object.assign(defMeta().stats,s.stats||{});return m}
function readSlot(n){try{const s=JSON.parse(localStorage.getItem(SLOT_KEY(n)));return s?mergeMeta(s):null}catch(e){}
  try{const b=JSON.parse(localStorage.getItem(SLOT_KEY(n)+'_bak'));if(b){console.warn('slot '+n+' corrupt, using backup');return mergeMeta(b)}}catch(e){}return null}
function loadSettings(){let st=defSettings();try{const s=JSON.parse(localStorage.getItem(SET_KEY));if(s)st=Object.assign(st,s)}catch(e){}
  // one-time migration: old single save -> slot 1
  try{if(!localStorage.getItem(SET_KEY)&&![1,2,3].some(n=>localStorage.getItem(SLOT_KEY(n)))){const old=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(old){if(old.set)Object.assign(st,old.set);st.muted=!!old.muted;const m=mergeMeta(old);m.name='Commander';m.created=Date.now();m.lastPlayed=Date.now();delete m.set;
      localStorage.setItem(SLOT_KEY(1),JSON.stringify(m));st.lastSlot=1;localStorage.setItem(SET_KEY,JSON.stringify(st))}}}catch(e){}
  return st}
let SETTINGS=loadSettings(),SLOT=0;
function save(){
  try{if(SLOT){meta.lastPlayed=Date.now();const o=Object.assign({},meta);delete o.set;
      // rolling backup: keep the previous good save (at most every 3 min) so a corrupt/overwritten slot can be recovered
      const k=SLOT_KEY(SLOT),prev=localStorage.getItem(k),now=Date.now();
      if(prev&&now-(save._bk||0)>180000){try{JSON.parse(prev);localStorage.setItem(k+'_bak',prev);save._bk=now}catch(e){}}
      localStorage.setItem(k,JSON.stringify(o))}
    SETTINGS.muted=!!meta.muted;localStorage.setItem(SET_KEY,JSON.stringify(SETTINGS))}catch(e){}
}
function useSlot(n,fresh){SLOT=n;meta=(!fresh&&readSlot(n))||Object.assign(defMeta(),fresh||{},{created:Date.now()});meta.set=SETTINGS;meta.muted=SETTINGS.muted;SETTINGS.lastSlot=n;save()}
function deleteSlot(n){if(SLOT===n)SLOT=0;try{localStorage.removeItem(SLOT_KEY(n));localStorage.removeItem(SLOT_KEY(n)+'_bak')}catch(e){}if(SETTINGS.lastSlot===n){SETTINGS.lastSlot=0;save()}}
function renameSlot(n,name){const m=readSlot(n);if(!m)return;m.name=name;try{localStorage.setItem(SLOT_KEY(n),JSON.stringify(m))}catch(e){}if(SLOT===n)meta.name=name}
// before a slot is chosen (title screen) meta is a throw-away profile that shares SETTINGS
let meta=Object.assign(defMeta(),{set:SETTINGS,muted:SETTINGS.muted});
const lv=k=>meta.up[k]||0;
const upCost=u=>Math.floor(u.base*Math.pow(u.g,lv(u.k)));
// ===== UTIL =====
const $=id=>document.getElementById(id);
const fmt=n=>{n=Math.floor(n);if(n<1e3)return ''+n;const u=['K','M','B','T'];let i=-1;while(n>=1e3&&i<3){n/=1e3;i++}return n.toFixed(n<10?1:0)+u[i]};
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function seeded(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---- save export / import (text code the player can keep anywhere) ----
function exportSave(){if(!SLOT)return '';save();const o=Object.assign({},meta);delete o.set;return 'HF1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
function importSave(str,slot){try{str=(str||'').trim();if(!str.startsWith('HF1:'))return false;const o=JSON.parse(decodeURIComponent(escape(atob(str.slice(4)))));if(!o||typeof o!=='object'||!o.tut||!o.stats)return false;
  localStorage.setItem(SLOT_KEY(slot),JSON.stringify(o));return true}catch(e){return false}}
