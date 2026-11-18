import asyncio
from playwright.async_api import async_playwright
INIT="""
window.__p={connected:true,id:'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e)',mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),vibrationActuator:{playEffect:(...a)=>{(window.__rum=window.__rum||[]).push(a);return Promise.resolve()}}};
navigator.getGamepads=()=>[window.__p];
window.press=(n,ax)=>{const i={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,Back:8,Start:9,Up:12,Down:13,Left:14,Right:15}[n];if(ax)window.__p.axes=ax;else window.__p.buttons[i]={pressed:true,value:1};padPoll(performance.now()+1000*(window.__t=(window.__t||0)+1));window.__p.buttons=window.__p.buttons.map(()=>({pressed:false,value:0}));window.__p.axes=[0,0,0,0];padPoll(performance.now()+1000*(window.__t=(window.__t||0)+1))};
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
        await pg.add_init_script(INIT)
        await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(1500)
        ev=lambda s:pg.evaluate(s)
        # glyphs
        print('glyph ps',await ev("padGlyph('A',{id:'DualSense Wireless Controller 054c'})"),'xbox',await ev("padGlyph('A')"))
        # title: first press shows focus, then nav + A
        await ev("press('Down')");print('vis',await ev("PAD.vis"),'focus',await ev("PAD.fi&&PAD.fi.id"))
        await ev("press('Down')");print('focus2',await ev("PAD.fi&&PAD.fi.id"))
        await pg.screenshot(path='/tmp/pad_title.png')
        await ev("press('Up')");print('focus3',await ev("PAD.fi&&PAD.fi.id"))
        # open options with A, go back with B
        await ev("PAD.fi=$('tOpt');press('A')");await pg.wait_for_timeout(200);print('options open',await ev("!!$('oBack')"))
        await ev("press('B')");await pg.wait_for_timeout(200);print('back on title',await ev("!!$('tPlay')"))
        # mouse hides
        await pg.mouse.move(10,10);await pg.mouse.move(300,300);print('vis after mouse',await ev("PAD.vis"))
        # enter game via slot 3
        await ev("useSlot(3,{name:'Pad'});closeTitle();document.body.classList.remove('intitle');meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,site2:1,mark:0};save();menu()")
        await pg.wait_for_timeout(300)
        await ev("press('Right')");await pg.screenshot(path='/tmp/pad_hub.png');print('hub focus',await ev("PAD.fi&&(PAD.fi.id||PAD.fi.className)"))
        await ev("PAD.fi=$('startBtn');press('A')");await pg.wait_for_timeout(2500)
        print('in run',await ev("!!R&&!R.over"),'CUT',await ev("!!CUT"))
        if await ev("!!CUT"):
            await ev("press('A')");await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(6000)
        print('en',await ev("R.en.length"))
        await ev("press('RB')");print('mark set',await ev("!!R.mark"))
        await ev("press('Start')");print('userPause',await ev("R.userPause"),'layer pausePanel',await ev("!!$('pausePanel')"))
        await pg.screenshot(path='/tmp/pad_pause.png')
        await ev("press('Start')");print('resumed',await ev("!R.userPause"))
        await ev("press('RT')");print('speed',await ev("speed"));await ev("press('RT')");await ev("press('RT')")
        await ev("press('Back')");print('loadout',await ev("!!$('loadout')"));await ev("press('B')");print('loadout closed',await ev("!$('loadout')"))
        for k in range(2):
            await ev("R.gold=99999;press('A')");await pg.wait_for_timeout(1700);print('crate',k,'lockCv',await ev("!!$('lockCv')"))
            if await ev("!!$('lockCv')"):
                await pg.screenshot(path='/tmp/pad_lock.png')
                for i in range(3):
                    await ev("press('A')");await pg.wait_for_timeout(1500)
                await pg.wait_for_timeout(1500)
            await pg.screenshot(path='/tmp/pad_cards.png');print('cards',await ev("!!curCards"),await ev("PAD.fi&&PAD.fi.className"))
            await ev("press('Right')");print('focus moved',await ev("PAD.fi&&PAD.fi.dataset.i"))
            await ev("press('A')");await pg.wait_for_timeout(900);print('picked',await ev("!curCards"))
        await ev("sfx('hurt')");print('rumble calls',await ev("(window.__rum||[]).length"))
        print('errors',errs[:6]);await b.close()
asyncio.run(main())
