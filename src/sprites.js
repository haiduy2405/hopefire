"use strict";
// ===== SPRITES =====
// Atlas = assets/sprites.png + assets/sprites.js (window.SPRITE_DATA), built by tools/sprites/build.py.
// 1 art pixel = ART_PX world units. Sprites are always scaled by a whole number of device pixels,
// so pixels stay crisp. Anything missing from the atlas falls back to the code-drawn version.
const ART_PX=1;
const SPR={ready:false,img:null,data:window.SPRITE_DATA||null,has(n){return this.ready&&!!this.data.sprites[n]}};
if(SPR.data){const img=new Image();img.onload=()=>{SPR.img=img;SPR.ready=true;groundFor=-1};img.src='assets/'+SPR.data.image+'?v='+(window.HF_VERSION||'')}
// draws frame fi of sprite `name` with its anchor at world draw-coords (x,y) of context c
function drawSpr(c,name,fi,x,y,flip){
  const fr=SPR.data.sprites[name];if(!fr)return 0;const f=fr[(fi|0)%fr.length],m=c.getTransform();
  const ax=f.ax!==undefined?f.ax:f.w/2,ay=f.ay!==undefined?f.ay:f.h-1;
  c.save();c.imageSmoothingEnabled=false;
  if(Math.abs(m.b)>1e-3||Math.abs(m.c)>1e-3){ // rotated context (cutscenes): draw in local units
    const u=f.px||ART_PX;c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(SPR.img,f.x,f.y,f.w,f.h,-ax*u,-ay*u,f.w*u,f.h*u);c.restore();return u}
  if(f.px){ // hi-res (AI) sprite: exact world size, smooth scaling
    const sc=m.a*f.px,dx=m.a*x+m.e,dy=m.d*y+m.f;c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    if(flip){c.translate(dx,dy);c.scale(-1,1);c.drawImage(SPR.img,f.x,f.y,f.w,f.h,-ax*sc,-ay*sc,f.w*sc,f.h*sc)}
    else c.drawImage(SPR.img,f.x,f.y,f.w,f.h,dx-ax*sc,dy-ay*sc,f.w*sc,f.h*sc);
    c.restore();return f.px}
  const M=Math.max(1,Math.round(m.a*ART_PX)),dx=Math.round(m.a*x+m.e),dy=Math.round(m.d*y+m.f);
  c.setTransform(1,0,0,1,0,0);
  if(flip){c.translate(dx,dy);c.scale(-1,1);c.drawImage(SPR.img,f.x,f.y,f.w,f.h,-Math.round(ax*M),-Math.round(ay*M),f.w*M,f.h*M)}
  else c.drawImage(SPR.img,f.x,f.y,f.w,f.h,dx-Math.round(ax*M),dy-Math.round(ay*M),f.w*M,f.h*M);
  c.restore();return M/m.a; // world units per art pixel actually used
}
// HTML icon from the atlas (cards, chips, spell bar). Falls back to `fb` (emoji/glyph) when missing.
function ico(name,s,fi,fb){
  const D=SPR.data;if(!D||!D.sprites[name])return fb||'';const fr=D.sprites[name],f=fr[(fi|0)%fr.length];
  return `<span class="ico" style="width:${f.w*s}px;height:${f.h*s}px;background-image:url(assets/${D.image}?v=${window.HF_VERSION||''});background-position:-${f.x*s}px -${f.y*s}px;background-size:${D.W*s}px ${D.H*s}px"></span>`;
}
// pre-scaled ground tile pattern (integer scale)
function tilePattern(c,name,M){
  const f=SPR.data.sprites[name][0],t=document.createElement('canvas');t.width=f.w*M;t.height=f.h*M;
  const tc=t.getContext('2d');tc.imageSmoothingEnabled=false;tc.drawImage(SPR.img,f.x,f.y,f.w,f.h,0,0,t.width,t.height);return c.createPattern(t,'repeat');
}
