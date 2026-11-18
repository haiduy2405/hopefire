"use strict";
// ===== AUDIO =====
let AC=null,master=null,OUT=null,noiseBuf=null;const lastS={};let pickCombo=0,pickT=0;
function audioInit(){
  if(AC)return;
  try{
    AC=new(window.AudioContext||window.webkitAudioContext)();
    // OUT = shared bus (compressor glues music + sfx) ; master = sfx bus (volume setting)
    const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.004;comp.release.value=0.2;comp.connect(AC.destination);
    OUT=AC.createGain();OUT.gain.value=1;OUT.connect(comp);
    master=AC.createGain();master.gain.value=meta.muted?0:meta.set.vol/100;master.connect(OUT);
    // short shared room reverb: gives explosions and spells some air (wet is quiet, so the dry mix is unchanged)
    try{const len=Math.floor(AC.sampleRate*1.7),ir=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8)}
      const cv=AC.createConvolver();cv.buffer=ir;const wet=AC.createGain();wet.gain.value=0.15;master.connect(cv);cv.connect(wet);wet.connect(OUT)}catch(e){}
    noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    if(typeof musicInit==='function')musicInit();
  }catch(e){AC=null}
}
function tone(type,f0,f1,dur,vol,delay){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.03)}
function noise(dur,vol,fc,delay){const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=fc;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*0.5,dur+0.05)}
// band-passed noise whose centre frequency sweeps f0 -> f1 (whooshes, risers, laser hiss)
function nsweep(dur,vol,f0,f1,q,delay){const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(0.06,dur*0.3));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*0.5,dur+0.05)}
// oscillator that swells in (risers / charge-ups)
function rise(type,f0,f1,dur,vol,delay){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*0.92);g.gain.exponentialRampToValueAtTime(0.0001,t+dur+0.04);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.08)}
const GAP={ltick:25,growl:900,slash:60,crew:150,bounty:80,rx_SHATTER:70,rx_OVERLOAD:90,rx_SUPERCONDUCT:110,rx_CONTAGION:90,pick:28,flip0:40,flip1:40,flip2:40,flip3:40,hit:40,shot:50,lance:50,alert:220,kill:45,beam:70,mortar:80,boom:70,hurt:120,cell:80,zapstrike:45,hand:80,meteorhit:60,charge:300,sunwave:300,cryowave:300,overcharge:300,hole:300,holeboom:300,thunder:300,laser:300,overdrive:600,odready:600};
function sfx(n){
  if(!AC||meta.muted)return;const now=performance.now();if(now-(lastS[n]||0)<(GAP[n]||0))return;lastS[n]=now;
  try{switch(n){
    case 'beam':tone('sawtooth',900,110,0.2,0.06);noise(0.09,0.05,3500);break;
    case 'shot':tone('square',1300,320,0.06,0.022);break;
    case 'lance':tone('sawtooth',420,1500,0.08,0.028);break;
    case 'mortar':tone('triangle',200,70,0.14,0.07);break;
    case 'boom':noise(0.3,0.11,760);tone('sine',130,38,0.32,0.11);nsweep(0.18,0.07,5200,500,1);break;
    case 'hit':noise(0.04,0.035,2000+Math.random()*1600);break;
    case 'kill':{const st=(typeof R!=='undefined'&&R&&R.stk)||0,p=0.85+Math.random()*0.15+Math.min(st,16)*0.03;noise(0.12,0.05,900*p);tone('square',220*p,60,0.1,0.025);tone('sine',95*p,40,0.12,0.05);if(st>=4)tone('triangle',660*p,990*p,0.07,0.012);break}
    case 'alert':tone('sawtooth',240,880,0.38,0.045);tone('sawtooth',255,720,0.4,0.035,0.03);noise(0.3,0.03,1800);break;
    case 'hurt':tone('square',150,50,0.22,0.07);break;
    case 'pick':{const n=performance.now();pickCombo=n-pickT<450?Math.min(pickCombo+1,14):0;pickT=n;const PS=[0,2,4,7,9,12,14,16,19,21,24,26,28,31,33];const f=880*Math.pow(2,PS[pickCombo]/12);tone('sine',f,f*1.5,0.07,0.028);tone('triangle',f*2,f*2.2,0.05,0.012,0.02);break}
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
    case 'rx_SHATTER':noise(0.25,0.09,6000);[0,7,12].forEach((s,i)=>tone('triangle',1320*Math.pow(2,s/12),1100*Math.pow(2,s/12),0.18,0.035,i*0.025));break;
    case 'rx_OVERLOAD':noise(0.35,0.12,900);tone('sawtooth',160,50,0.3,0.07);tone('square',640,220,0.15,0.03);break;
    case 'rx_SUPERCONDUCT':tone('sine',220,880,0.3,0.05);tone('sawtooth',440,1760,0.25,0.02,0.03);noise(0.15,0.04,3000);break;
    case 'rx_CONTAGION':[0,3,7,10].forEach((s,i)=>tone('square',600*Math.pow(2,s/12),620*Math.pow(2,s/12),0.08,0.022,i*0.035));break;
    case 'mark':tone('square',1200,900,0.06,0.03);tone('square',1600,1600,0.05,0.02,0.05);break;
    case 'starup':[0,4,7,12,16].forEach((s,i)=>tone('triangle',523*Math.pow(2,s/12),528*Math.pow(2,s/12),0.3,0.055,i*0.05));noise(0.25,0.05,5000,0.2);break;
    case 'place':tone('sine',160,60,0.18,0.12,0.4);noise(0.12,0.06,800,0.4);break;
    case 'streak':[0,7,12].forEach((s,i)=>tone('sawtooth',440*Math.pow(2,s/12),446*Math.pow(2,s/12),0.18,0.03,i*0.04));break;
    case 'crack0':noise(0.18,0.07,1600);tone('square',300,180,0.08,0.03);break;
    case 'crack1':noise(0.22,0.08,2200);tone('triangle',520,1040,0.18,0.05);break;
    case 'crack2':noise(0.3,0.09,2600);[0,1,2].forEach(i=>tone('triangle',440*Math.pow(1.335,i),446*Math.pow(1.335,i),0.3,0.05,i*0.06));break;
    case 'crack3':noise(0.45,0.12,3200);tone('sine',90,40,0.5,0.14);[0,1,2,3].forEach(i=>tone('triangle',523*Math.pow(1.26,i),528*Math.pow(1.26,i),0.45,0.055,0.1+i*0.07));break;
    case 'flip0':noise(0.05,0.04,4200);tone('square',700,520,0.04,0.018);break;
    case 'flip1':noise(0.05,0.04,4200);tone('triangle',880,1320,0.12,0.04);break;
    case 'flip2':noise(0.06,0.05,4200);tone('triangle',990,1485,0.16,0.05);tone('triangle',1320,1980,0.2,0.035,0.05);break;
    case 'flip3':noise(0.08,0.06,5000);[0,1,2,3,4].forEach(i=>tone('triangle',660*Math.pow(1.26,i),664*Math.pow(1.26,i),0.4,0.05,i*0.05));tone('sine',110,55,0.4,0.1);break;
    case 'crew':[0,4,7].forEach((x,i)=>tone('square',392*Math.pow(2,x/12),396*Math.pow(2,x/12),0.12,0.03,i*0.06));tone('sine',196,98,0.25,0.06);break;
    case 'slash':noise(0.07,0.05,5200);tone('sawtooth',900,300,0.06,0.02);break;
    case 'carrier':[0,1].forEach(i=>tone('triangle',988,1318,0.12,0.04,i*0.16));tone('sine',1976,1976,0.2,0.02,0.32);break;
    case 'freecrate':[0,4,7,12,16,19].forEach((x,i)=>tone('triangle',523*Math.pow(2,x/12),528*Math.pow(2,x/12),0.35,0.05,i*0.045));noise(0.3,0.06,6000,0.15);tone('sine',130,65,0.4,0.1);break;
    case 'escape':tone('triangle',660,330,0.35,0.05);tone('triangle',494,247,0.4,0.04,0.12);break;
    case 'bounty':tone('square',1046,1046,0.06,0.03);tone('square',1568,1568,0.1,0.03,0.06);break;
    case 'ltick':tone('square',2400,2200,0.012,0.008);break;
    case 'lock1':tone('triangle',880,1320,0.12,0.05);noise(0.05,0.04,5000);break;
    case 'lock2':[0,7].forEach((x,i)=>tone('triangle',988*Math.pow(2,x/12),992*Math.pow(2,x/12),0.2,0.05,i*0.05));noise(0.08,0.05,6000);break;
    case 'lock3':[0,4,7,12].forEach((x,i)=>tone('triangle',1046*Math.pow(2,x/12),1050*Math.pow(2,x/12),0.35,0.055,i*0.045));tone('sine',130,65,0.35,0.1);noise(0.2,0.06,7000);break;
    case 'perfect':[0,12,19].forEach((x,i)=>tone('sine',1568*Math.pow(2,x/12),1575*Math.pow(2,x/12),0.25,0.035,0.06+i*0.04));break;
    case 'lmiss':tone('square',140,90,0.12,0.06);noise(0.1,0.07,900);break;
    case 'jackpot':[0,4,7,12,16,19,24].forEach((x,i)=>tone('square',523*Math.pow(2,x/12),526*Math.pow(2,x/12),0.22,0.035,i*0.05));noise(0.4,0.06,7000,0.3);tone('sine',98,49,0.6,0.12);break;
    case 'growl':tone('sawtooth',70+Math.random()*30,40,0.9,0.03);noise(0.8,0.025,300);break;
    case 'shield':tone('sine',320,640,0.4,0.06);tone('triangle',480,960,0.35,0.03,0.05);break;
    case 'swap':tone('triangle',500,760,0.09,0.04);tone('triangle',760,520,0.09,0.03,0.08);break;
    case 'link':[0,1].forEach(i=>tone('sine',523*Math.pow(1.5,i),530*Math.pow(1.5,i),0.3,0.05,i*0.08));noise(0.12,0.03,5000);break;
    case 'synergy':[0,1,2].forEach(i=>tone('sawtooth',330*Math.pow(1.5,i),335*Math.pow(1.5,i),0.35,0.03,i*0.07));[0,1,2].forEach(i=>tone('triangle',660*Math.pow(1.5,i),664*Math.pow(1.5,i),0.5,0.045,0.05+i*0.07));break;
    case 'hand':nsweep(0.09,0.11,6500,800,1.5);tone('sawtooth',1300,170,0.12,0.05);tone('sine',150,55,0.1,0.09);break;
    case 'charge':rise('sawtooth',70,900,0.35,0.07);rise('sine',50,400,0.35,0.12);nsweep(0.35,0.08,300,6000,2);break;
    case 'sunwave':tone('sine',95,28,1.2,0.3);noise(1.0,0.16,1400);nsweep(1.5,0.12,5000,260,1.2);tone('sawtooth',220,40,0.7,0.08);[0,7,12,19].forEach((x,i)=>tone('triangle',660*Math.pow(2,x/12),640*Math.pow(2,x/12),0.9,0.025,0.05+i*0.04));break;
    case 'cryowave':tone('sine',80,38,0.9,0.22);nsweep(1.3,0.1,8000,1100,4);[0,5,9,14,17].forEach((x,i)=>tone('sine',1760*Math.pow(2,x/12),1500*Math.pow(2,x/12),0.5,0.03,0.04+i*0.07));noise(0.4,0.06,6000);break;
    case 'overcharge':[0,4,7,12,16].forEach((x,i)=>tone('square',392*Math.pow(2,x/12),396*Math.pow(2,x/12),0.14,0.03,i*0.05));nsweep(0.5,0.1,800,7000,3);tone('sawtooth',110,440,0.4,0.05);break;
    case 'hole':tone('sine',220,36,1.3,0.16);tone('sawtooth',130,34,1.2,0.06);nsweep(1.2,0.1,2200,160,2);break;
    case 'holeboom':noise(1.0,0.38,900);tone('sine',75,20,1.4,0.4);tone('sawtooth',320,30,0.7,0.11);nsweep(0.2,0.2,9000,1500,1);tone('triangle',55,55,1.2,0.12,0.05);break;
    case 'thunder':nsweep(1.2,0.22,500,80,0.8);noise(1.5,0.13,520);tone('sine',60,30,1.2,0.16);nsweep(0.25,0.14,6500,900,1.2,0.02);break;
    case 'zapstrike':nsweep(0.13,0.08,5500,700,1.5);tone('square',1900,260,0.09,0.03);if(Math.random()<0.35)noise(0.18,0.07,700);break;
    case 'laser':tone('sawtooth',200,420,1.2,0.06);tone('sine',110,110,3.2,0.09);nsweep(3,0.045,1800,2400,9);rise('triangle',300,1200,0.4,0.05);break;
    case 'meteorhit':noise(0.4,0.16,1000);tone('sine',110,32,0.4,0.24);nsweep(0.12,0.12,7000,1200,1);break;
    case 'overdrive':rise('sawtooth',60,1300,0.55,0.12);rise('sine',45,500,0.55,0.2);nsweep(1.1,0.14,300,9000,2);tone('sine',55,26,1.8,0.38,0.5);noise(0.7,0.22,3200,0.5);[0,4,7,12,16,19].forEach((x,i)=>{tone('triangle',523*Math.pow(2,x/12),526*Math.pow(2,x/12),0.9,0.05,0.5+i*0.03);tone('square',262*Math.pow(2,x/12),264*Math.pow(2,x/12),0.7,0.022,0.5+i*0.03)});break;
    case 'odready':[0,4,7,12,16,19,24].forEach((x,i)=>tone('triangle',659*Math.pow(2,x/12),662*Math.pow(2,x/12),0.3,0.045,i*0.045));nsweep(0.4,0.06,3000,9000,3);break;
  }}catch(e){}
}
