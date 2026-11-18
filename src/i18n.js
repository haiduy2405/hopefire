'use strict';
// ===== i18n: runtime translation layer (v0.15) =====
// The game is written in English. Every visible string (DOM text, title/placeholder attributes, canvas text)
// passes through tr(). Dictionaries live in assets/lang/<code>.js  →  LANGS[code] = {key: translation}.
// KEY = English text with every number replaced by {0},{1}… in order (so "Wave 7 / 12" → "Wave {0} / {1}").
// A translation may use the same {i} placeholders in any order. Missing key → English is shown (safe fallback).
// Voice-over stays English (subtitles are translated).
// Debug: I18N.log=new Set() then play; I18N.dump() lists every key seen (used by tools/i18n/harvest.py).
const LANG_LIST=[['en','English'],['vi','Tiếng Việt'],['zh','简体中文'],['es','Español'],['pt','Português (Brasil)'],['ru','Русский'],['de','Deutsch'],['ja','日本語']];
window.LANGS=window.LANGS||{};
const I18N={lang:'en',dict:null,log:(window.__logStrings?new Set():null),cache:new Map(),
  dump(){return [...(I18N.log||[])]}};
let LANG='en';
function langHas(c){const d=window.LANGS[c];return !!d&&Object.keys(d).length>0}
function langDetect(){const n=(navigator.language||'en').toLowerCase();for(const [c] of LANG_LIST)if(c!=='en'&&n.startsWith(c)&&langHas(c))return c;return 'en'}
function trKey(core){const nums=[];const key=core.replace(/\d+(?:[.,]\d+)*/g,m=>{nums.push(m);return '{'+(nums.length-1)+'}'});return [key,nums]}
function tr(s){
  if(typeof s!=='string'||s.length<2)return s;
  if(I18N.lang==='en'&&!I18N.log)return s;
  const c=I18N.cache.get(s);if(c!==undefined&&!I18N.log)return c;
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s),core=m[2];
  let out=s;
  if(/[A-Za-z]/.test(core)){
    const [key,nums]=trKey(core);
    if(I18N.log)I18N.log.add(key);
    const d=I18N.dict?I18N.dict[key]:undefined;
    if(d!==undefined)out=m[1]+d.replace(/\{(\d+)\}/g,(x,i)=>nums[i]!==undefined?nums[i]:x)+m[3];
  }
  if(I18N.cache.size>6000)I18N.cache.clear();
  I18N.cache.set(s,out);return out;
}
// ----- DOM -----
const TR_ATTR=['title','placeholder','aria-label'];
function trSkip(n){const p=n.parentNode;if(!p)return true;const t=p.nodeName;return t==='SCRIPT'||t==='STYLE'||t==='TEXTAREA'||t==='NOSCRIPT'}
function trText(n,force){
  if(trSkip(n))return;
  if(!force&&n.__tr!==undefined&&n.__tr===n.data)return;           // our own output
  const en=(force&&n.__en!==undefined&&n.__tr===n.data)?n.__en:n.data;
  const t=tr(en);n.__en=en;n.__tr=t;if(t!==n.data)n.data=t;
}
function trAttrs(el,force){
  if(el.nodeType!==1)return;
  for(const a of TR_ATTR){
    if(!el.hasAttribute(a))continue;
    const v=el.getAttribute(a),st=el.__trA||(el.__trA={});
    if(!force&&st[a]&&st[a][1]===v)continue;
    const en=(force&&st[a]&&st[a][1]===v)?st[a][0]:v,t=tr(en);
    st[a]=[en,t];if(t!==v)el.setAttribute(a,t);
  }
}
function trTree(root,force){
  if(!root)return;
  if(root.nodeType===3){trText(root,force);return}
  if(root.nodeType!==1)return;
  trAttrs(root,force);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let n;while((n=w.nextNode())){if(n.nodeType===3)trText(n,force);else trAttrs(n,force)}
}
let trObs=null;
function trStart(){
  if(trObs||typeof MutationObserver==='undefined')return;
  trObs=new MutationObserver(recs=>{
    for(const r of recs){
      if(r.type==='childList')r.addedNodes.forEach(n=>trTree(n,false));
      else if(r.type==='characterData')trText(r.target,false);
      else if(r.type==='attributes')trAttrs(r.target,false);
    }
  });
  trObs.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:TR_ATTR});
}
// ----- canvas text -----
(function(){
  if(typeof CanvasRenderingContext2D==='undefined')return;
  const P=CanvasRenderingContext2D.prototype,f=P.fillText,s=P.strokeText;
  P.fillText=function(t,...a){return f.call(this,tr(String(t)),...a)};
  P.strokeText=function(t,...a){return s.call(this,tr(String(t)),...a)};
})();
function setLang(code,noSave){
  if(!LANG_LIST.some(l=>l[0]===code)||(code!=='en'&&!langHas(code)))code='en';
  LANG=I18N.lang=code;I18N.dict=code==='en'?null:(window.LANGS[code]||null);I18N.cache.clear();
  document.documentElement.lang=code;
  if(!noSave&&typeof SETTINGS!=='undefined'){SETTINGS.lang=code;if(typeof save==='function')save()}
  trTree(document.body,true);
  if(code==='en'){if(trObs){trObs.disconnect();trObs=null}}else trStart();   // no observer overhead in English
}
function i18nInit(){
  const c=(typeof SETTINGS!=='undefined'&&SETTINGS.lang)||langDetect();
  setLang(c,true);
}
