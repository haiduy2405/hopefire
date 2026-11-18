import asyncio
from playwright.async_api import async_playwright
SETUP="()=>{meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1};meta.runs=5;save();menu();hide();newRun(2,false,false,false);hideTip();R.maxHope*=50;R.hope=R.maxHope;R.slots=5;for(const [i,r,s] of [[0,1,2],[1,0,1],[3,2,1],[6,0,1]])R.mods.push({t:MODS[i],r,s,tier:2,cd:0,fl:0});layoutMods();renderChips();R.gold=1e6}"
async def main(w,h,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(800);await pg.evaluate(SETUP);await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const o=rollCrate;rollCrate=()=>{rollCrate=o;return [{t:MODS[2],r:3},{t:MODS[4],r:1},{sp:SPELLS[0],r:2}]};openPack()}")
        await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/crt_{tag}1.png')
        await pg.wait_for_timeout(450);await pg.screenshot(path=f'/tmp/crt_{tag}2.png')
        await pg.wait_for_timeout(500);await pg.screenshot(path=f'/tmp/crt_{tag}3.png')
        await pg.wait_for_timeout(1200);await pg.screenshot(path=f'/tmp/crt_{tag}4.png')
        if w>800:
            await pg.hover('.card[data-i="1"]');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/crt_{tag}5.png')
        await pg.click('.card[data-i="0"] .eb');await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/crt_{tag}6.png')
        await pg.click('#einfo');await pg.click('.card[data-i="0"]');await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/crt_{tag}7.png')
        print(tag,'errors',errs[:3]);await b.close()
asyncio.run(main(1280,800,'d'))
asyncio.run(main(390,844,'m'))
