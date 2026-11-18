import asyncio
from playwright.async_api import async_playwright
INIT="""let __t=1000;performance.now=()=>__t;window.__cbs=[];window.requestAnimationFrame=cb=>{__cbs.push(cb);return 1};
window.__step=ms=>{__t+=ms;const c=__cbs;__cbs=[];c.forEach(f=>{try{f(__t)}catch(e){console.error(e)}})};
window.setTimeout=((st)=>(f,ms,...a)=>{const due=__t+(ms||0);const chk=()=>{if(__t>=due)f(...a);else __cbs.push(()=>chk())};__cbs.push(()=>chk());return 1})(window.setTimeout);
addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tip,#toasts,#skipCut,#hud .ver{display:none!important}';document.head.appendChild(s)});"""
SETUP="()=>{useSlot(3,{name:'Test'});closeTitle();document.body.classList.remove('intitle');meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,s2:1,s3:1,s4:1,s5:1};meta.runs=40;meta.chapter=5;meta.story=1;meta.set.nums=1;meta.siteTip={1:1,2:1,3:1,4:1,5:1};save();window.ach=()=>{};window.tip=()=>{}}"
def run(ch,wave,mods,hope=1,zoom=1.0,react=1):
    return f"()=>{{hide();newRun({ch},false,false,false);hideTip();R.slots=6;R.react={react};for(const [i,r,s] of {mods})R.mods.push({{t:MODS[i],r,s,tier:{ch},cd:0,fl:0}});layoutMods();R.wave={wave};R.maxHope*={hope};R.hope=R.maxHope*0.85;R.gold=9000;R.banner=null;renderChips();resize();S*={zoom};groundFor=-1}}"
def swarm(n,kinds,r0,r1,rush):
    return f"()=>{{const ks={kinds};for(let i=0;i<{n};i++){{const e=spawn(ks[i%ks.length],'{'rush' if rush else 'wander'}');const a=Math.random()*6.283,d={r0}+Math.random()*({r1}-{r0});e.x=Math.cos(a)*d;e.y=Math.sin(a)*d;{'e.alertT=0.3;' if rush else ''}}}}}"
N=[0]
async def frames(pg,n,keep=True,pre=None):
    for i in range(n):
        if pre and i in pre: await pg.evaluate(pre[i])
        await pg.evaluate("__step(33.333)")
        if keep: await pg.screenshot(path='/tmp/tr2/f%05d.jpg'%N[0],type='jpeg',quality=90);N[0]+=1
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1920,'height':1080});await pg.add_init_script(INIT)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/');await pg.evaluate("__step(500)");await pg.evaluate(SETUP)
        m={}
        m['A']=N[0];await pg.evaluate("()=>startCutscene(()=>{})");await frames(pg,40,keep=False);await frames(pg,160)
        await pg.evaluate("()=>{if(CUT)endCutscene()}")
        # B: darkness, eyes gather (site 1)
        m['B']=N[0];await pg.evaluate(run(1,3,'[[0,1,1]]',20,1.45));await pg.evaluate(swarm(26,"['crawler','skitter','crawler','brute']",270,420,False));await frames(pg,30,keep=False);await frames(pg,120)
        await pg.evaluate(swarm(10,"['crawler','skitter']",200,260,True));await frames(pg,75)
        # D: swarm (site 2, overdrive) + spells
        m['D']=N[0];await pg.evaluate(run(2,10,'[[0,2,2],[4,2,2],[7,2,2],[13,2,1]]',40,1.15,2))
        await pg.evaluate("()=>{R.spells=[{d:SPELLS[0],r:2,lv:2,cd:0},{d:SPELLS[1],r:1,lv:1,cd:0},{d:SPELLS[4],r:3,lv:1,cd:0}];renderSpellBar()}")
        await pg.evaluate(swarm(60,"['crawler','skitter','spitter','brute','crawler','splitter']",300,520,True));await frames(pg,45,keep=False)
        await frames(pg,210,pre={70:"()=>castSpell(0)",125:"()=>castSpell(1)",175:"()=>castSpell(2)",100:swarm(30,"['skitter','crawler']",350,450,True)})
        # C: crate legendary
        m['C']=N[0];await pg.evaluate("()=>{R.gold=1e6;openPack()}");await frames(pg,22)
        await pg.evaluate("()=>{curCards=[{t:MODS[6],r:3},{sp:SPELLS[0],r:2},{rl:RELICS[3],r:3}];revealCards(0)}");await frames(pg,75)
        await pg.evaluate("()=>{pick(0)}");await frames(pg,3)
        # E: boss
        m['E']=N[0];await pg.evaluate(run(3,10,'[[2,2,3],[4,3,2],[8,2,3],[11,1,2],[12,2,3],[14,3,1]]',40,1.3))
        await pg.evaluate("()=>{R.bossSpawned=true;spawnBoss(1);const b=R.boss;b.x=260;b.y=-90;b.state='rush';b.alertT=0;b.hp=b.mhp=b.mhp*0.4}")
        await pg.evaluate(swarm(20,"['crawler','bloater','skitter']",260,380,True))
        await frames(pg,135)
        await pg.evaluate("()=>{if(R.boss&&!R.boss.dead){R.boss.hp=1;hit(R.boss,10,null,false)}}");await frames(pg,100)
        m['end']=N[0];print(m,'errors',errs[:3]);await b.close()
asyncio.run(main())
