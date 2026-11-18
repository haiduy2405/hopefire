import asyncio, base64, json
from playwright.async_api import async_playwright
JS="""async ([mode,tgt,secs])=>{
 const SR=44100,off=new OfflineAudioContext(2,SR*secs,SR);AC=off;
 noiseBuf=off.createBuffer(1,SR,SR);const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const comp=off.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.004;comp.release.value=0.2;comp.connect(off.destination);
 OUT=off.createGain();OUT.connect(comp);MUS.bus=null;MUS.nodes={};
 const si=window.setInterval;window.setInterval=()=>0;musicInit();window.setInterval=si;
 MUS.bus.gain.value=0.6*0.85;MUS.mode=mode;MUS.tgt=tgt;MUS.int=tgt;
 const n=Math.floor(secs/STEP)-2;for(let s=0;s<n;s++)playStep(0.05+s*STEP,s);
 const buf=await off.startRendering();const L=buf.getChannelData(0);let pk=0,ss=0;for(const v of L){pk=Math.max(pk,Math.abs(v));ss+=v*v}
 // 16-bit wav
 const len=L.length,w=new DataView(new ArrayBuffer(44+len*2));const wr=(o,s)=>{for(let i=0;i<s.length;i++)w.setUint8(o+i,s.charCodeAt(i))};
 wr(0,'RIFF');w.setUint32(4,36+len*2,true);wr(8,'WAVEfmt ');w.setUint32(16,16,true);w.setUint16(20,1,true);w.setUint16(22,1,true);w.setUint32(24,SR,true);w.setUint32(28,SR*2,true);w.setUint16(32,2,true);w.setUint16(34,16,true);wr(36,'data');w.setUint32(40,len*2,true);
 for(let i=0;i<len;i++)w.setInt16(44+i*2,Math.max(-1,Math.min(1,L[i]))*32767,true);
 let bin='';const u=new Uint8Array(w.buffer);for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
 return [pk,Math.sqrt(ss/len),btoa(bin)]}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page();await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(800)
        for mode,tgt,name in [('menu',0,'menu'),('run',0.3,'run_calm'),('run',0.65,'run_mid'),('run',0.95,'run_intense'),('boss',1,'boss')]:
            pk,rms,b64=await pg.evaluate(JS,[mode,tgt,20])
            open(f'/tmp/mus_{name}.wav','wb').write(base64.b64decode(b64));print(name,'peak %.3f rms %.4f'%(pk,rms))
        await b.close()
asyncio.run(main())
