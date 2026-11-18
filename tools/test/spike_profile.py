#!/usr/bin/env python3
"""Find frame-time spikes: plays a run with the bot (mocked clock) and prints the worst steps with game state.
usage: python3 tools/test/spike_profile.py [seconds=420]"""
import asyncio,sys,json,time
from playwright.async_api import async_playwright
INIT="""let __t=1000;performance.now=()=>__t;window.__cbs=[];window.requestAnimationFrame=cb=>{__cbs.push(cb);return 1};
window.__step=ms=>{__t+=ms;const c=__cbs;__cbs=[];c.forEach(f=>{try{f(__t)}catch(e){console.error(e)}})};
window.setTimeout=((st)=>(f,ms,...a)=>{const due=__t+(ms||0);const chk=()=>{if(__t>=due)f(...a);else __cbs.push(()=>chk())};__cbs.push(()=>chk());return 1})(window.setTimeout);"""
BOT="""()=>{if(R&&R.tipPause&&document.getElementById('tipOk'))document.getElementById('tipOk').click();
 const cards=document.querySelectorAll('#modal .card');if(cards.length&&typeof curCards!=='undefined'&&curCards){cards[0].click()}
 if(document.getElementById('crateEl')){document.getElementById('crateEl').click();return}
 if(R&&!R.over&&!R.paused&&R.gold>=packCost()){openPack()}}"""
STATE="()=>R?[+R.t.toFixed(1),R.en.length,R.wave,R.fx?R.fx.length:0,R.over?1:0,(R.ev&&R.ev.k)||'']:null"
async def main(secs):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':720});await pg.add_init_script(INIT)
        await pg.goto('http://localhost:8765/');await pg.evaluate("localStorage.clear()");await pg.reload();await pg.evaluate("__step(300)")
        ev=pg.evaluate
        await ev("()=>{document.getElementById('tPlay').click()}");await ev("__step(100)")
        await ev("()=>{document.querySelector('.slot[data-n=\"1\"] [data-a=new]').click()}");await ev("__step(100)")
        await ev("()=>{document.querySelector('[data-ok]').click()}");await ev("__step(300)")
        await ev("()=>{const b=document.getElementById('startBtn');if(b)b.click()}");await ev("__step(300)")
        await ev("()=>{if(CUT)endCutscene()}")
        if len(sys.argv)>2: await ev(sys.argv[2])
        # JS-side timing so playwright round trips are excluded
        await ev("""()=>{window.__ms=[];window.__run=(n)=>{for(let i=0;i<n;i++){const a=performance.now.call?0:0;const t0=Date.now?window.__rt():0;__step(33.33);window.__ms.push([window.__rt()-t0,R?+R.t.toFixed(1):0,R?R.en.length:0,R&&R.fx?R.fx.length:0])}}}""".replace("window.__rt()","(window.__real())").replace("Date.now?window.__real():0","window.__real()"))
        await ev("()=>{window.__real=(()=>{const f=Performance.prototype.now;return ()=>f.call(performance)})()}")
        await ev("()=>{window.__U=0;window.__R=0;const ou=update,or=render;window.update=function(...a){const t=window.__real();ou(...a);window.__U+=window.__real()-t};window.render=function(...a){const t=window.__real();or(...a);window.__R+=window.__real()-t}}")
        steps=int(secs*30);done=0
        while done<steps:
            await ev("(n)=>{for(let i=0;i<n;i++){const t0=window.__real();__step(33.33);window.__ms.push([window.__real()-t0,R?+R.t.toFixed(1):0,R?R.en.length:0,R&&R.fx?R.fx.length:0,window.__U,window.__R]);window.__U=0;window.__R=0;if(i%3==0)(BOTFN)()}}".replace("BOTFN",BOT),30)
            done+=30
            if await ev("!!CUT"): await ev("()=>{CUT.t=9999;try{endCutscene()}catch(e){}}")
            if await ev("()=>R&&R.over"): break
        ms=await ev("window.__ms")
        v=sorted(x[0] for x in ms);med=v[len(v)//2]
        print('steps',len(ms),'median %.1f ms, p95 %.1f, p99 %.1f, max %.1f'%(med,v[int(len(v)*.95)],v[int(len(v)*.99)],v[-1]))
        idx=[i for i,x in enumerate(ms) if x[0]>25];gaps=[b-a for a,b in zip(idx,idx[1:])]
        from collections import Counter
        print('slow steps',len(idx),'gap histogram',Counter(gaps).most_common(8))
        for x in sorted(ms,reverse=True)[:8]: print('  %.1f ms  t=%s creatures=%s fx=%s update=%.1f render=%.1f'%tuple(x))
        await b.close()
asyncio.run(main(int(sys.argv[1]) if len(sys.argv)>1 else 420))
