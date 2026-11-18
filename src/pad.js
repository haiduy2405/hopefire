// ===== GAMEPAD (XInput / standard mapping) =====
// Only synthesizes existing handlers (click(), togglePause(), castSpell(), ...): no gameplay logic lives here.
// Menus: D-pad / left stick move a focus ring between buttons & cards, A = click, B = back.
// Battle: A crate/confirm, X/Y/B spells 1-3, LB/RB or right stick = mark target, LT reactor, RT speed, Back loadout, Start pause.
const PAD={vis:false,pad:null,cur:{},prev:{},hold:{},lastRep:0,fi:null,hint:'',lastMark:0,lastRumble:0};
const PADB={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,Back:8,Start:9,Up:12,Down:13,Left:14,Right:15};
const PAD_SEL='button:not([disabled]),.card,.diff:not(.lock),[data-el],.lochip,#crateEl,input[type=range],input[type=checkbox],select';
const PAD_LAYERS=['#upd','#einfo','#tdlg','#pausePanel','#loadout','#modal','#title'];

const padVis=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
function padGet(){const g=navigator.getGamepads?navigator.getGamepads():[];for(const p of g)if(p&&p.connected)return p;return null}
const padIsPS=p=>!!p&&/054c|playstation|dualsense|dualshock/i.test(p.id||'');
function padGlyph(n,p){const ps=padIsPS(p||PAD.pad);
  const m=ps?{A:'✕',B:'○',X:'□',Y:'△',LB:'L1',RB:'R1',LT:'L2',RT:'R2',Back:'Share',Start:'Options'}:{A:'A',B:'B',X:'X',Y:'Y',LB:'LB',RB:'RB',LT:'LT',RT:'RT',Back:'Back',Start:'Start'};
  return m[n]||n}
const padPressed=n=>!!PAD.cur[n]&&!PAD.prev[n];
function padRumble(ms,weak,strong){
  if(SETTINGS.rumble===0||!PAD.pad)return;const now=performance.now();if(now-PAD.lastRumble<90)return;PAD.lastRumble=now;
  const a=PAD.pad.vibrationActuator;if(a&&a.playEffect)try{a.playEffect('dual-rumble',{duration:ms,weakMagnitude:weak,strongMagnitude:strong}).catch(()=>{})}catch(_){}}

// ---------- focus navigation ----------
function padLayer(){for(const s of PAD_LAYERS){const e=document.querySelector(s);if(e&&padVis(e))return e}return null}
function padCands(root){return [...root.querySelectorAll(PAD_SEL)].filter(e=>padVis(e)&&!(e.tagName!=='DIV'&&e.parentElement&&e.parentElement.closest('.card')))}
function padNextFocus(cur,dir,root){
  const L=padCands(root);if(!L.length)return null;
  const ctr=e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
  if(!cur||!L.includes(cur)){const cards=L.filter(e=>e.classList.contains('card')),P=cards.length?cards:L;   // start on the first choice card, not the build bar
    return P.slice().sort((a,b)=>ctr(a)[1]-ctr(b)[1]||ctr(a)[0]-ctr(b)[0])[0]}
  const [cx,cy]=ctr(cur);let best=null,bs=1e9;
  for(const e of L){if(e===cur)continue;const [x,y]=ctr(e),dx=x-cx,dy=y-cy;
    const prim=dir==='right'?dx:dir==='left'?-dx:dir==='down'?dy:-dy,cross=(dir==='left'||dir==='right')?Math.abs(dy):Math.abs(dx);
    if(prim<=4)continue;const s=prim+2*cross;if(s<bs){bs=s;best=e}}
  return best;
}
function padSetFocus(e){if(PAD.fi)PAD.fi.classList.remove('padfocus');PAD.fi=e;if(e){e.classList.add('padfocus');try{e.scrollIntoView({block:'nearest',inline:'nearest'})}catch(_){}}}
function padBack(layer){
  const id=layer&&layer.id;
  if(id==='einfo')layer.click();
  else if(id==='pausePanel')togglePause(false);
  else if(id==='loadout'){const b=$('loClose');b&&b.click()}
  else if(layer){const b=layer.querySelector('#oBack,#tBack,#toTitleBtn,[data-x]');if(b&&padVis(b))b.click()}
}

// ---------- battle helpers ----------
function padMarkList(){return R.en.filter(e=>!e.dead&&!isHidden(e))}
function padMark(e){if(!e||R.mark===e)return;R.mark=e;sfx('mark');addTxt(e.x,e.y*K-e.r*2.6,'MARKED','#ff4d5e',11);if(!meta.tut.mark){meta.tut.mark=1;save()}}
function padCycle(d){const L=padMarkList();if(!L.length)return;
  if(!R.mark||!L.includes(R.mark)){padMark(L.slice().sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y))[0]);return}
  L.sort((a,b)=>Math.atan2(a.y*K,a.x)-Math.atan2(b.y*K,b.x));padMark(L[(L.indexOf(R.mark)+d+L.length)%L.length])}
function padAim(vx,vy){let best=null,bs=-1;const m=Math.hypot(vx,vy);
  for(const e of padMarkList()){const ex=e.x,ey=e.y*K,d=Math.hypot(ex,ey)||1,c=(ex*vx+ey*vy)/(d*m);if(c>0.6){const s=c*2-d/900;if(s>bs){bs=s;best=e}}}
  return best}
const padBattle=()=>typeof R!=='undefined'&&R&&!R.over&&!R.paused&&!R.userPause&&!R.tipPause&&!(typeof CUT!=='undefined'&&CUT)&&!curCards;

// ---------- per-frame poll ----------
function padPoll(now){
  now=now||performance.now();const p=padGet();PAD.pad=p;if(!p){PAD.prev=PAD.cur={};if(PAD.fi)padSetFocus(null);padHint('');return}
  const c={},bd=n=>{const b=p.buttons[PADB[n]];return !!b&&(b.pressed||b.value>0.5)};
  for(const n in PADB)c[n]=bd(n);
  const ax=p.axes,lx=ax[0]||0,ly=ax[1]||0,rx=ax[2]||0,ry=ax[3]||0;
  if(Math.abs(lx)>0.55||Math.abs(ly)>0.55){if(Math.abs(lx)>Math.abs(ly))c[lx>0?'Right':'Left']=true;else c[ly>0?'Down':'Up']=true}
  PAD.cur=c;
  const edge=n=>c[n]&&!PAD.prev[n];
  let any=false;for(const n in c)if(edge(n))any=true;
  // direction with repeat
  let dir=null;for(const d of['Up','Down','Left','Right'])if(c[d]){if(edge(d)){dir=d;PAD.hold[d]=now;PAD.lastRep=now}else if(now-PAD.hold[d]>380&&now-PAD.lastRep>130){dir=d;PAD.lastRep=now}}
  const layer=padLayer(),inCut=typeof CUT!=='undefined'&&CUT,hasLK=typeof LK!=='undefined'&&LK&&$('lockCv');
  if(any||dir){if(!PAD.vis){PAD.vis=true;PADMODE=true;document.body.classList.add('padmode');padRelabel()}}
  if(inCut){
    if(edge('A')||edge('Start')){const s=$('skipCut');if(s&&padVis(s))s.click();else if(CUT.title>=1)cv.dispatchEvent(new PointerEvent('pointerdown'))}
  }else if(layer){
    if(!PAD.fi||!document.contains(PAD.fi)||!layer.contains(PAD.fi)||!padVis(PAD.fi)){const f=padNextFocus(null,'down',layer);padSetFocus(f)}
    if(hasLK){if(edge('A')||edge('RT'))lockTap();else if(edge('Y')){const q=$('lquick');q&&q.click()}}
    else if($('crateEl')&&padVis($('crateEl'))){if(edge('A'))$('crateEl').click()}
    else{
      if(dir){const f=PAD.fi;
        if(f&&f.type==='range'&&(dir==='Left'||dir==='Right')){const st=+f.step||1,d=(dir==='Right'?1:-1)*Math.max(st,5);f.value=Math.max(+f.min,Math.min(+f.max,+f.value+d));f.dispatchEvent(new Event('input',{bubbles:true}));f.dispatchEvent(new Event('change',{bubbles:true}))}
        else{const n=padNextFocus(f,dir.toLowerCase(),layer);if(n){padSetFocus(n);sfx('flip0')}}}
      if(edge('A')&&PAD.fi)PAD.fi.click();
      if(edge('B')||(edge('Start')&&layer.id==='pausePanel'))padBack(layer);
      if(edge('Y')&&layer.id==='loadout')padBack(layer);
    }
  }else{
    if(PAD.fi)padSetFocus(null);
    const tip=$('tipOk');
    if(typeof R!=='undefined'&&R&&!R.over){
      if(tip&&padVis(tip)){if(edge('A'))tip.click()}
      else if(padBattle()){
        if(edge('A'))openPack();
        if(edge('X'))castSpell(0);if(edge('Y'))castSpell(1);if(edge('B'))castSpell(2);
        if(edge('LB'))padCycle(-1);if(edge('RB'))padCycle(1);
        if(Math.hypot(rx,ry)>0.55&&now-PAD.lastMark>140){const e=padAim(rx,ry);if(e&&e!==R.mark){padMark(e);PAD.lastMark=now}}
        if(edge('LT'))$('reactBtn').click();
        if(edge('RT'))$('spdBtn').click();
        if(edge('Back'))showLoadout();
      }
      if(edge('Start'))togglePause();
    }
  }
  padHint(padCtx(layer,inCut,hasLK));
  PAD.prev=c;
}
function padCtx(layer,inCut,hasLK){
  const g=padGlyph;
  if(inCut)return `[${g('A')}] Skip`;
  if(hasLK)return `[${g('A')}/${g('RT')}] Stop the needle   [${g('Y')}] Open instantly`;
  if(layer&&$('crateEl')&&padVis($('crateEl')))return `[${g('A')}] Open crate`;
  if(layer&&layer.id==='pausePanel')return `[D-pad] Move   [${g('A')}] Select   [${g('Start')}/${g('B')}] Resume`;
  if(layer)return `[D-pad] Move   [${g('A')}] Select   [${g('B')}] Back`;
  if(typeof R!=='undefined'&&R&&!R.over)return `[${g('A')}] Crate  [${g('X')}${g('Y')}${g('B')}] Spells  [${g('LB')}/${g('RB')}] Mark  [${g('LT')}] Reactor  [${g('RT')}] Speed  [${g('Back')}] Loadout  [${g('Start')}] Pause`;
  return '';
}
function padHint(t){
  let h=$('padHint');if(!h){h=document.createElement('div');h.id='padHint';document.body.appendChild(h)}
  const s=PAD.vis&&PAD.pad?t:'';if(s===PAD.hint)return;PAD.hint=s;h.textContent=s;h.style.display=s?'block':'none'}

// ---------- wiring ----------
function padRelabel(){try{if(typeof R!=='undefined'&&R&&!R.over){renderSpellBar();if($('lhint'))$('lhint').innerHTML=`TAP when the needle is in a colour · <kbd>${confirmKey()}</kbd>`}}catch(_){}}
function padHide(){if(PAD.vis){PAD.vis=false;PADMODE=false;padRelabel();document.body.classList.remove('padmode');padSetFocus(null);padHint('')}}
addEventListener('pointerdown',padHide);addEventListener('keydown',padHide);
addEventListener('pointermove',e=>{if(Math.abs(e.movementX||0)+Math.abs(e.movementY||0)>3)padHide()});
addEventListener('gamepaddisconnected',()=>{if(typeof R!=='undefined'&&R&&!R.over&&!R.paused&&!(typeof CUT!=='undefined'&&CUT))togglePause(true)});
(function loop(t){try{padPoll(t)}catch(e){console.error('pad',e)}requestAnimationFrame(loop)})(performance.now());
// rumble on key moments, piggy-backing on the sound effects
const _padSfx=sfx;
sfx=function(n,a,b){const r=_padSfx.apply(this,arguments);if(PAD.pad)switch(n){
  case'hurt':padRumble(140,0.4,0.9);break;case'crate':case'freecrate':padRumble(160,0.5,0.5);break;
  case'rare':case'jackpot':case'perfect':padRumble(220,0.7,0.5);break;case'boss':case'roar':case'rumble':padRumble(380,0.3,1);break;
  case'escape':padRumble(500,0.6,0.9);break;}
  return r};
