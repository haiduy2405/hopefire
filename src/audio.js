"use strict";
// ===== AUDIO =====
let AC=null,master=null,noiseBuf=null;const lastS={};
function audioInit(){
  if(AC)return;
  try{
    AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=meta.muted?0:0.55;master.connect(AC.destination);
    noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // ambient drone
    const g=AC.createGain();g.gain.value=0.035;g.connect(master);
    [55,55.6,82.4].forEach(f=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);o.start()});
    const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=0.13;lg.gain.value=0.02;lfo.connect(lg);lg.connect(g.gain);lfo.start();
  }catch(e){AC=null}
}
function tone(type,f0,f1,dur,vol,delay){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.03)}
function noise(dur,vol,fc,delay){const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=fc;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*0.5,dur+0.05)}
const GAP={hit:40,shot:50,lance:50,pick:45,alert:220,kill:45,beam:70,mortar:80,boom:70,hurt:120,cell:80};
function sfx(n){
  if(!AC||meta.muted)return;const now=performance.now();if(now-(lastS[n]||0)<(GAP[n]||0))return;lastS[n]=now;
  try{switch(n){
    case 'beam':tone('sawtooth',900,110,0.2,0.06);noise(0.09,0.05,3500);break;
    case 'shot':tone('square',1300,320,0.06,0.022);break;
    case 'lance':tone('sawtooth',420,1500,0.08,0.028);break;
    case 'mortar':tone('triangle',200,70,0.14,0.07);break;
    case 'boom':noise(0.28,0.1,700);tone('sine',130,40,0.28,0.09);break;
    case 'hit':noise(0.04,0.035,2600);break;
    case 'kill':noise(0.12,0.05,1000);tone('square',220,60,0.1,0.025);break;
    case 'alert':tone('sawtooth',240,880,0.38,0.045);tone('sawtooth',255,720,0.4,0.035,0.03);noise(0.3,0.03,1800);break;
    case 'hurt':tone('square',150,50,0.22,0.07);break;
    case 'pick':tone('sine',1100+Math.random()*400,1900,0.06,0.025);break;
    case 'cell':tone('sine',500,1100,0.18,0.06);tone('sine',750,1600,0.18,0.04,0.06);break;
    case 'crate':[0,1,2,3].forEach(i=>tone('square',260*Math.pow(1.26,i),262*Math.pow(1.26,i),0.09,0.035,i*0.06));noise(0.2,0.06,1500,0.25);break;
    case 'rare':[0,1,2].forEach(i=>tone('triangle',800*Math.pow(1.5,i),806*Math.pow(1.5,i),0.3,0.05,i*0.08));break;
    case 'legend':[0,1,2,3,4].forEach(i=>tone('triangle',520*Math.pow(1.335,i),524*Math.pow(1.335,i),0.5,0.06,i*0.07));break;
    case 'boss':tone('sawtooth',90,38,1.4,0.1);noise(1.2,0.06,280);break;
    case 'click':tone('square',650,650,0.03,0.025);break;
    case 'win':[0,1,2,3,4,5].forEach(i=>tone('triangle',392*Math.pow(1.26,i),394*Math.pow(1.26,i),0.4,0.06,i*0.09));break;
    case 'lose':tone('sine',330,70,1.3,0.09);tone('sine',247,55,1.4,0.06,0.15);break;
    case 'heart':tone('sine',70,40,0.18,0.18);tone('sine',62,38,0.2,0.14,0.22);break;
    case 'alarm':tone('square',880,880,0.12,0.03);tone('square',660,660,0.12,0.03,0.16);break;
    case 'rumble':noise(2.2,0.12,220);tone('sawtooth',55,35,2.2,0.06);break;
    case 'impact':noise(1.2,0.25,900);tone('sine',90,25,1.2,0.25);break;
    case 'roar':tone('sawtooth',180,520,0.5,0.06);tone('sawtooth',120,300,0.6,0.05,0.05);noise(0.5,0.05,1200);break;
    case 'title':[0,1,2,3].forEach(i=>tone('triangle',196*Math.pow(1.5,i%3)*(i>2?2:1),198*Math.pow(1.5,i%3)*(i>2?2:1),1.6,0.05,i*0.35));break;
    case 'up':tone('square',500,1000,0.1,0.04);break;
  }}catch(e){}
}
