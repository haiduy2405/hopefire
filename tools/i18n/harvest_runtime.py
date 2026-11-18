#!/usr/bin/env python3
"""Play headless with string logging on; print every translation key actually shown (JSON list).
usage: python3 tools/i18n/harvest_runtime.py > /tmp/runtime.json  (needs server on :8765)"""
import asyncio,json,sys
from playwright.async_api import async_playwright
sys.path.insert(0,'tools/test')
INIT="""window.__logStrings=true;let __t=1000;performance.now=()=>__t;window.__cbs=[];window.requestAnimationFrame=cb=>{__cbs.push(cb);return 1};
window.__step=ms=>{__t+=ms;const c=__cbs;__cbs=[];c.forEach(f=>{try{f(__t)}catch(e){console.error(e)}})};
window.setTimeout=((st)=>(f,ms,...a)=>{const due=__t+(ms||0);const chk=()=>{if(__t>=due)f(...a);else __cbs.push(()=>chk())};__cbs.push(()=>chk());return 1})(window.setTimeout);"""
BOT="""()=>{if(R&&R.tipPause&&document.getElementById('tipOk'))document.getElementById('tipOk').click();
 const cards=document.querySelectorAll('#modal .card');if(cards.length&&typeof curCards!=='undefined'&&curCards){cards[0].click()}
 if(document.getElementById('crateEl')){document.getElementById('crateEl').click();return}
 if(R&&!R.over&&!R.paused&&R.gold>=packCost()){openPack()}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':800});await pg.add_init_script(INIT)
        await pg.goto('http://localhost:8765/');await pg.evaluate("localStorage.clear()");await pg.reload();await pg.evaluate("__step(300)")
        ev=lambda s:pg.evaluate(s)
        # options + credits + slots on the title screen
        for sel in ['tOpt','tCred']:
            await ev("(s)=>{const b=document.getElementById(s);if(b)b.click()}".replace('(s)=>','(s=%r)=>'%sel));await ev("__step(200)")
            await ev("()=>titleScreen()");await ev("__step(200)")
        await ev("()=>{document.getElementById('tPlay').click()}");await ev("__step(100)")
        await ev("()=>{document.querySelector('.slot[data-n=\"1\"] [data-a=new]').click()}");await ev("__step(100)")
        await ev("()=>{document.querySelector('[data-ok]').click()}");await ev("__step(300)")
        await ev("()=>{const b=document.getElementById('startBtn');if(b)b.click()}");await ev("__step(300)")
        for f in range(300):  # intro cutscene
            await ev("__step(33.3)")
            if f%20==0 and await ev("!!CUT"): await ev("()=>{CUT.t=9999;try{endCutscene()}catch(e){}}")
        for run in range(2):
            if run==1: await ev("()=>{meta.chapter=5;meta.story=1;meta.mastery=99999;save()}")
            for f in range(1500):
                await ev("__step(33.33)")
                if f%3==0: await ev(BOT)
                if f%30==0:
                    if await ev("!!CUT"): await ev("()=>{CUT.t=9999;try{endCutscene()}catch(e){}}")
                    if await ev("()=>R&&R.over"): break
            open("/tmp/runtime_partial.json","w").write(json.dumps(await ev("()=>I18N.dump()"),ensure_ascii=False))
            await ev("__step(800)")
            # walk every hub button once
            ids=await ev("()=>[...document.querySelectorAll('#modal button')].map(b=>b.id).filter(Boolean)")
            for i in ids:
                if i in('startBtn','tExit'): continue
                await ev("(i)=>{const b=document.getElementById(i);if(b)b.click()}".replace('(i)=>','(i=%r)=>'%i));await ev("__step(300)")
                await ev("()=>{const b=document.getElementById('backBtn')||document.getElementById('tBack')||document.querySelector('#modal [data-back]');if(b)b.click();else if(typeof menu==='function')menu()}");await ev("__step(200)")
            if run<2: await ev("()=>{const b=document.getElementById('startBtn');if(b)b.click()}");await ev("__step(300)")
        keys=await ev("()=>I18N.dump()")
        json.dump(keys,sys.stdout,ensure_ascii=False)
        await b.close()
asyncio.run(main())
