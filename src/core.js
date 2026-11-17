"use strict";
// ===== SAVE =====
const SAVE_KEY='hopefire_v1';
const defMeta=()=>({mastery:0,up:{},chapter:1,best:{},runs:0,sel:1,tut:{},muted:false});
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s)return Object.assign(defMeta(),s)}catch(e){}return defMeta()}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(meta))}catch(e){}}
let meta=load();
const lv=k=>meta.up[k]||0;
const upCost=u=>Math.floor(u.base*Math.pow(u.g,lv(u.k)));
// ===== UTIL =====
const $=id=>document.getElementById(id);
const fmt=n=>{n=Math.floor(n);if(n<1e3)return ''+n;const u=['K','M','B','T'];let i=-1;while(n>=1e3&&i<3){n/=1e3;i++}return n.toFixed(n<10?1:0)+u[i]};
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function seeded(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
