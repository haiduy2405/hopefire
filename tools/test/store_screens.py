import asyncio
from playwright.async_api import async_playwright
SETUP="()=>{meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1};meta.runs=40;meta.chapter=5;meta.story=1;meta.night={1:1,2:1,3:1};meta.cores=4200;meta.set.nums=1;save();menu()}"
def run(ch,wave,mods,night='false'):
    return f"()=>{{hide();newRun({ch},false,false,{night});hideTip();R.slots=6;for(const [i,r,s] of {mods})R.mods.push({{t:MODS[i],r,s,tier:{ch},cd:0,fl:0}});layoutMods();R.wave={wave};R.hope=R.maxHope*0.8;R.gold=5000;R.banner=null;renderChips()}}"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1920,'height':1080});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(900);await pg.evaluate(SETUP)
        # 1 swarm firefight, site 2
        await pg.evaluate(run(2,9,'[[0,2,3],[4,3,2],[7,2,3],[10,1,2],[13,2,2],[5,3,1]]'))
        await pg.evaluate("()=>{R.spells=[{d:SPELLS[0],r:2,lv:2,cd:0},{d:SPELLS[1],r:1,lv:1,cd:9},{d:SPELLS[4],r:3,lv:1,cd:0}];renderSpellBar();R.relics=['lens','trigger'];renderChips()}")
        await pg.wait_for_timeout(16000);await pg.screenshot(path='/home/claude/hopefire/store/screens/01_swarm.png')
        await pg.evaluate("()=>castSpell(0)");await pg.wait_for_timeout(250);await pg.screenshot(path='/home/claude/hopefire/store/screens/02_solar_flare.png')
        # 3 crate legendary
        await pg.evaluate("()=>{R.paused=true;curCards=[{t:MODS[6],r:3},{sp:SPELLS[2],r:2},{rl:RELICS[3],r:3}];revealCards(0)}");await pg.wait_for_timeout(1600)
        await pg.screenshot(path='/home/claude/hopefire/store/screens/03_crate.png');await pg.evaluate("()=>{hide();R.paused=false}")
        # 4 boss, site 3
        await pg.evaluate(run(3,10,'[[2,2,3],[4,3,2],[8,2,3],[11,1,2],[12,2,3],[14,3,1]]'));await pg.wait_for_timeout(6000)
        await pg.evaluate("()=>{if(!R.boss){R.bossSpawned=true;spawnBoss(3)}const b=R.boss;b.x=150;b.y=-60;b.state='rush';b.alertT=0}");await pg.wait_for_timeout(5000)
        await pg.screenshot(path='/home/claude/hopefire/store/screens/04_boss.png')
        # 5 nightmare origin
        await pg.evaluate(run(4,8,'[[0,3,4],[4,3,3],[7,3,3],[10,2,3],[13,3,2],[15,3,2]]'));await pg.evaluate("()=>{R.maxHope*=30;R.hope=R.maxHope*0.7}");await pg.wait_for_timeout(15000)
        await pg.screenshot(path='/home/claude/hopefire/store/screens/05_war_graveyard.png')
        # 6 menu / repairs
        await pg.evaluate("()=>{R=null;menu()}");await pg.wait_for_timeout(800);await pg.screenshot(path='/home/claude/hopefire/store/screens/06_menu.png')
        await pg.evaluate("()=>{const p=document.querySelector('.panel');if(p)p.scrollTop=700}");await pg.wait_for_timeout(300);await pg.screenshot(path='/home/claude/hopefire/store/screens/07_repairs.png')
        print('errors',errs[:3]);await b.close()
asyncio.run(main())
