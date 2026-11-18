import asyncio, json
from playwright.async_api import async_playwright
INIT="""let __t=1000;performance.now=()=>__t;window.__cbs=[];window.requestAnimationFrame=cb=>{__cbs.push(cb);return 1};
window.__step=ms=>{__t+=ms;const c=__cbs;__cbs=[];c.forEach(f=>{try{f(__t)}catch(e){console.error(e)}})};
window.setTimeout=((st)=>(f,ms,...a)=>{const due=__t+(ms||0);const chk=()=>{if(__t>=due)f(...a);else __cbs.push(()=>chk())};__cbs.push(()=>chk());return 1})(window.setTimeout);"""
# naive new player: clicks tips, opens crate when affordable, picks card 0 (left), never touches reactor/spells
BOT="""()=>{const L=window.__log||(window.__log=[]);const t=R?R.t:0;
 if(R&&R.tipPause&&document.getElementById('tipOk')){L.push([+t.toFixed(1),'tip']);document.getElementById('tipOk').click()}
 const cards=document.querySelectorAll('#modal .card');if(cards.length&&typeof curCards!=='undefined'&&curCards){L.push([+t.toFixed(1),'pick',cards[0].querySelector('.nm').textContent,[...document.querySelectorAll('#modal .sact')].map(x=>x.textContent).join('|')]);pick(0);return}
 if(document.getElementById('crateEl')){document.getElementById('crateEl').click();return}
 if(R&&!R.over&&!R.paused&&R.gold>=packCost()){L.push([+t.toFixed(1),'crate',R.packs+1,'gold',Math.floor(R.gold)]);openPack()}
}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':800});await pg.add_init_script(INIT)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/');await pg.evaluate("__step(300)")
        await pg.evaluate("()=>{localStorage.clear()}");await pg.reload();await pg.evaluate("__step(300)")
        await pg.screenshot(path='/tmp/ftue/00_menu.png')
        # start like a player: click the main start button
        btn=await pg.evaluate("()=>{const b=[...document.querySelectorAll('#modal button')].map(x=>x.textContent.trim());return b}")
        print('menu buttons',btn)
        await pg.evaluate("()=>{document.getElementById('tPlay').click()}");await pg.evaluate("__step(100)")
        await pg.evaluate("()=>{document.querySelector('.slot[data-n=\"1\"] [data-a=new]').click()}");await pg.evaluate("__step(100)")
        await pg.evaluate("()=>{document.querySelector('[data-ok]').click()}");await pg.evaluate("__step(300)")
        await pg.evaluate("()=>{const b=document.getElementById('startBtn');if(b)b.click()}")
        await pg.evaluate("__step(300)");print('cut?',await pg.evaluate("!!CUT"))
        await pg.evaluate("()=>{if(CUT)endCutscene()}");
        shots={5:'01',20:'02',45:'03',90:'04',150:'05'};runs=[];last=None
        for f in range(int(30*400)):
            await pg.evaluate("__step(33.33)")
            if f%3==0: await pg.evaluate(BOT)
            if f%30==0 and await pg.evaluate("!!CUT"): await pg.evaluate("()=>{CUT.t=999;try{endCutscene()}catch(e){}}")
            if f%900==0: print('t',f//30,await pg.evaluate("()=>R?[Math.round(R.t),R.kills,R.wave,Math.round(R.hope),R.mods.length,R.packs,R.over]:'noR'"))
            st=await pg.evaluate("()=>R?[R.t,R.over,R.kills,R.wave,Math.round(R.hope/R.maxHope*100),R.mods.length,R.packs]:null") if f%30==0 else None
            if st:
                t=int(st[0])
                for s,n in list(shots.items()):
                    if t>=s and len(runs)==0: await pg.screenshot(path=f'/tmp/ftue/{n}_t{s}.png');shots.pop(s)
                if st[1]:
                    runs.append(st);await pg.screenshot(path=f'/tmp/ftue/end_run{len(runs)}.png')
                    log=await pg.evaluate("window.__log||[]");print('RUN',len(runs),'t=%d kills=%d wave=%d mods=%d crates=%d'%(st[0],st[2],st[3],st[5],st[6]));print('  log',log[:30]);await pg.evaluate("window.__log=[]")
                    btns=await pg.evaluate("()=>[...document.querySelectorAll('#modal button')].map(x=>x.textContent.trim())");print('  end buttons',btns)
                    if len(runs)>=1:break
                    await pg.evaluate("()=>{const b=[...document.querySelectorAll('#modal button')][0];b.click()}");await pg.evaluate("__step(500)")
                    await pg.screenshot(path=f'/tmp/ftue/menu_after{len(runs)}.png')
                    mb=await pg.evaluate("()=>[...document.querySelectorAll('#modal button')].map(x=>x.textContent.trim()).slice(0,30)");print('  menu',mb)
                    await pg.evaluate("()=>{const b=document.getElementById('startBtn');if(b)b.click()}")
        print('errors',errs[:3]);await b.close()
asyncio.run(main())
