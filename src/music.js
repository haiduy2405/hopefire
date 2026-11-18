"use strict";
// ===== ADAPTIVE MUSIC =====
// Procedural soundtrack (no files, 100% ours). A look-ahead scheduler plays 16th-note steps
// at 100 BPM in A minor. Layers fade in with "intensity" (0..1), computed from what the
// player sees: creatures rushing the ring, threat level, boss, low Hope.
//   pad (always) → arp (≥.2) → hats (≥.35) → bass+kick (≥.45) → snare (≥.6) → double-time (≥.8)
//   boss: darker progression + brass stabs + toms.  menu: pad + slow bell melody.
// Mixing: music bus → master out (shared compressor) ; volume = meta.set.mus.
const MUS={on:false,mode:'off',bus:null,int:0,tgt:0,step:0,next:0,timer:null,bar:0,duck:1,
  nodes:{},delay:null,padF:null,lastMel:0};
const BPM=100,STEP=60/BPM/4;
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// chords as midi roots + triad (minor/major) ; 2 bars each
const PROG={calm:[[57,'m'],[53,'M'],[48,'M'],[55,'M']],boss:[[57,'m'],[58,'M'],[57,'m'],[52,'M']]};
const triad=(r,q)=>[r,r+(q==='m'?3:4),r+7];
function musicInit(){
  if(!AC||MUS.bus)return;
  const b=AC.createGain();b.gain.value=0;b.connect(OUT);MUS.bus=b;
  // pad chain: voices → lowpass → padGain → bus
  const pf=AC.createBiquadFilter();pf.type='lowpass';pf.frequency.value=700;pf.Q.value=0.7;const pg=AC.createGain();pg.gain.value=0.5;pf.connect(pg);pg.connect(b);MUS.padF=pf;MUS.nodes.pad=pg;
  // echo for arp/bells
  const d=AC.createDelay(1);d.delayTime.value=STEP*3;const fb=AC.createGain();fb.gain.value=0.32;const dl=AC.createBiquadFilter();dl.type='lowpass';dl.frequency.value=2400;
  d.connect(dl);dl.connect(fb);fb.connect(d);const dw=AC.createGain();dw.gain.value=0.45;dl.connect(dw);dw.connect(b);MUS.delay=d;
  for(const k of ['arp','bass','drum','boss','bell'])(MUS.nodes[k]=AC.createGain()).connect(b);
  MUS.nodes.arp.connect(d);MUS.nodes.bell.connect(d);
  for(const k of ['arp','bass','drum','boss','bell'])MUS.nodes[k].gain.value=0;
  MUS.next=AC.currentTime+0.1;MUS.timer=setInterval(musicTick,25);MUS.on=true;applyMusicVolume();
}
function applyMusicVolume(){if(!MUS.bus)return;const v=meta.muted?0:(meta.set.mus??60)/100*0.85;MUS.bus.gain.setTargetAtTime(v*MUS.duck*(MUS.voDuck?0.45:1),AC.currentTime,0.3);if(typeof FM!=='undefined'&&FM.cur&&FM.el[FM.cur])fadeEl(FM.el[FM.cur],fileMusicVol(),0.4,false)}
function setLayer(k,v,t){const g=MUS.nodes[k];if(g)g.gain.setTargetAtTime(v,t??AC.currentTime,0.6)}
// ---------- intensity from game state ----------
function musicTarget(){
  if(typeof CUT!=='undefined'&&CUT)return[CUT.kind==='end'?'ending':'off',0];
  if(!R)return['menu',0];
  if(R.over)return['menu',0];
  const rr=ringR();let rush=0;for(const e of R.en)if(!e.dead&&e.state==='rush')rush++;
  const boss=R.boss&&!R.boss.dead&&(R.boss.state==='rush'||Math.hypot(R.boss.x,R.boss.y)<rr*1.6);
  let t=0.15+Math.min(0.45,rush*0.035)+Math.min(0.3,R.wave*0.025)+(R.endless?0.15:0);
  if(boss)return['boss',1];
  return['run',Math.min(1,t)];
}
// ---------- voices ----------
function vPad(t,notes,dur){for(const n of notes)for(const det of [-7,7]){const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.value=NOTE(n);o.detune.value=det;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.042,t+0.5);g.gain.setValueAtTime(0.042,t+dur-0.6);g.gain.linearRampToValueAtTime(0.0001,t+dur+0.4);o.connect(g);g.connect(MUS.padF);o.start(t);o.stop(t+dur+0.5)}}
function vPluck(t,n,vol,type,dest,len){const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();o.type=type||'square';o.frequency.value=NOTE(n);f.type='lowpass';f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(500,t+(len||0.18));
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+(len||0.18));o.connect(f);f.connect(g);g.connect(dest);o.start(t);o.stop(t+(len||0.18)+0.05)}
function vBass(t,n,vol){const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();o.type='sawtooth';o.frequency.value=NOTE(n);f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(180,t+0.22);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.26);o.connect(f);f.connect(g);g.connect(MUS.nodes.bass);o.start(t);o.stop(t+0.3)}
function vKick(t,vol){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+0.16);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);o.connect(g);g.connect(MUS.nodes.drum);o.start(t);o.stop(t+0.32)}
function vNoise(t,dur,vol,type,fc,dest){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=fc;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||MUS.nodes.drum);s.start(t,Math.random()*0.5,dur+0.05)}
function vTom(t,f0,vol){const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*0.55,t+0.25);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);o.connect(g);g.connect(MUS.nodes.boss);o.start(t);o.stop(t+0.32)}
function vBrass(t,notes,dur){for(const n of notes){const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();o.type='sawtooth';o2.type='square';o.frequency.value=NOTE(n-12);o2.frequency.value=NOTE(n-12)*1.005;
  f.type='lowpass';f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(1600,t+0.12);f.frequency.exponentialRampToValueAtTime(400,t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.05,t+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(f);o2.connect(f);f.connect(g);g.connect(MUS.nodes.boss);o.start(t);o2.start(t);o.stop(t+dur+0.05);o2.stop(t+dur+0.05)}}
function vBell(t,n,vol){for(const [m,a] of [[1,1],[2.76,0.35],[5.4,0.12]]){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=NOTE(n)*m;g.gain.setValueAtTime(vol*a,t);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6/m);o.connect(g);g.connect(MUS.nodes.bell);o.start(t);o.stop(t+1.7)}}
// ---------- scheduler ----------
function musicTick(){
  if(!AC||AC.state!=='running')return;
  const [mode,tgt]=musicTarget();
  if(mode!==MUS.mode){MUS.mode=mode;MUS.fileOn=typeof fileMusic==='function'?fileMusic(mode==='menu'||mode==='boss'||mode==='ending'?mode:null):false}
  MUS.tgt=tgt;
  // duck while a modal/pause is up
  const duck=(R&&(R.paused||R.userPause))?0.55:1;if(Math.abs(duck-MUS.duck)>0.01){MUS.duck=duck;applyMusicVolume()}
  while(MUS.next<AC.currentTime+0.12){playStep(MUS.next,MUS.step);MUS.next+=STEP;MUS.step=(MUS.step+1)%128}
}
function playStep(t,s){
  const k=MUS.mode==='ending'?'off':MUS.mode;
  if(k==='off'||MUS.fileOn){setLayer('pad',0,t);for(const n of ['arp','bass','drum','boss','bell'])setLayer(n,0,t);return}
  // smooth intensity once per beat
  if(s%4===0){const a=MUS.tgt>MUS.int?0.18:0.06;MUS.int+=(MUS.tgt-MUS.int)*a}
  const I=MUS.int,boss=k==='boss',menu=k==='menu';
  const prog=boss?PROG.boss:PROG.calm,ci=Math.floor(s/32)%4,[root,q]=prog[ci],ch=triad(root,q);
  // layer levels
  if(s%4===0){
    setLayer('pad',menu?0.55:0.45,t);setLayer('bell',menu?0.9:0,t);
    setLayer('arp',menu?0:I>=0.2?0.5+0.4*I:0,t);setLayer('bass',!menu&&I>=0.45?0.7:0,t);
    setLayer('drum',!menu&&I>=0.35?0.75:0,t);setLayer('boss',boss?0.85:0,t);
    MUS.padF.frequency.setTargetAtTime(menu?600:500+I*2200,t,0.8);
    const low=R&&!R.over&&R.hope<R.maxHope*0.25;if(low&&s%16===0){vKick(t,0.35);vKick(t+0.22,0.25)}
  }
  if(s%32===0)vPad(t,ch.map(n=>n),STEP*32);
  if(menu){if(s%8===0&&Math.random()<0.7){const sc=[57,60,62,64,67,69,72,74,76];vBell(t,sc[Math.random()*sc.length|0]+12,0.05)}return}
  // arp: chord tones over two octaves, 16ths (8ths when calm)
  const arpN=[ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24,ch[2]+12,ch[1]+12,ch[0]+24,ch[1]+24];
  if(I>=0.2&&(I>=0.55||s%2===0))vPluck(t,arpN[s%8],0.045+0.03*I,boss?'sawtooth':'square',MUS.nodes.arp,0.16);
  // bass 8ths with octave bounce
  if(I>=0.45&&s%2===0)vBass(t,root-12+(s%8===6?12:0),0.13);
  // drums
  if(I>=0.45&&(s%16===0||s%16===8||(I>=0.8&&(s%16===6||s%16===11))))vKick(t,0.42);
  if(I>=0.35&&(s%4===2||(I>=0.7&&s%2===1)))vNoise(t,0.04,s%4===2?0.07:0.035,'highpass',7000);
  if(I>=0.6&&s%16===12)vNoise(t,0.18,0.11,'bandpass',1800);
  if(I>=0.6&&s%16===4)vNoise(t,0.18,0.11,'bandpass',1800);
  // boss: brass stab on each chord change + every bar, toms fill at bar end
  if(boss){if(s%16===0)vBrass(t,ch,STEP*6);if(s%16>=13)vTom(t,s%16===13?160:s%16===14?130:100,0.18);if(s%32===0)vKick(t,0.5)}
}
// stinger helpers (key-matched one-shots for big moments)
function musStinger(kind){
  if(!MUS.bus||!AC)return;const t=AC.currentTime+0.02,d=MUS.nodes.bell;
  const seqs={wave:[69,72,76],synergy:[69,73,76,81],victory:[57,60,64,69,72,76,81],defeat:[69,65,62,57]};
  const sq=seqs[kind];if(!sq)return;const g=AC.createGain();g.gain.value=0.9;g.connect(OUT);
  sq.forEach((n,i)=>{const o=AC.createOscillator(),e=AC.createGain();o.type='triangle';o.frequency.value=NOTE(n);const tt=t+i*(kind==='defeat'?0.22:0.09);
    e.gain.setValueAtTime(0.0001,tt);e.gain.linearRampToValueAtTime(0.06,tt+0.02);e.gain.exponentialRampToValueAtTime(0.0001,tt+0.6);o.connect(e);e.connect(g);o.start(tt);o.stop(tt+0.65)});
}
