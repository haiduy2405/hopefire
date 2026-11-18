import asyncio
from playwright.async_api import async_playwright
SETUP="()=>{meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,site2:1};meta.runs=5;save();menu();hide();newRun(1,false,false,false);hideTip();R.slots=5;for(const [i,r,s] of [[0,1,2],[3,0,1]])R.mods.push({t:MODS[i],r,s,tier:1,cd:0,fl:0});layoutMods();renderChips();R.gold=1e6}"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':1280,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(800);await pg.mouse.click(5,5);await pg.evaluate("audioInit()");await pg.evaluate(SETUP)
        await pg.evaluate("()=>{const o=rollCrate;rollCrate=()=>{rollCrate=o;return [{t:MODS[0],r:2},{t:MODS[1],r:1},{t:MODS[2],r:0}]};openPack()}");await pg.wait_for_timeout(2500)
        await pg.click('.card[data-i="0"]');await pg.wait_for_timeout(250);await pg.screenshot(path='/tmp/feel_star.png',clip={'x':380,'y':160,'width':520,'height':420})
        await pg.evaluate("()=>{const o=rollCrate;rollCrate=()=>{rollCrate=o;return [{t:MODS[5],r:2},{t:MODS[1],r:1},{t:MODS[2],r:0}]};openPack()}");await pg.wait_for_timeout(2500)
        await pg.click('.card[data-i="0"]');await pg.wait_for_timeout(120);await pg.screenshot(path='/tmp/feel_drop.png',clip={'x':380,'y':160,'width':520,'height':420})
        print('music',await pg.evaluate("[MUS.on,MUS.mode,AC&&AC.state,Math.round(MUS.int*100)]"))
        for i in range(12): await pg.evaluate("()=>{const e=spawn('crawler','rush');e.x=40;e.y=10;kill(e)}")
        await pg.wait_for_timeout(100);await pg.screenshot(path='/tmp/feel_streak.png')
        await pg.evaluate("()=>{damageHope(R.maxHope*0.2)}");await pg.wait_for_timeout(60);await pg.screenshot(path='/tmp/feel_hit.png',clip={'x':0,'y':0,'width':500,'height':60})
        await pg.evaluate("()=>{R.hope=0}");await pg.wait_for_timeout(700);await pg.screenshot(path='/tmp/feel_die.png')
        await pg.wait_for_timeout(3500);print('over',await pg.evaluate("R.over"),'dying class',await pg.evaluate("document.body.classList.contains('dying')"))
        print('errors',errs[:5]);await b.close()
asyncio.run(main())
