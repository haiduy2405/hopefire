import asyncio
from playwright.async_api import async_playwright
SNAP="""()=>{const o={};document.querySelectorAll('.chpanel,.buildbar,.chpanel h2,.cards,.cwrap,.panel,#hub,#menu,.tpanel,.chfoot').forEach((e,i)=>{const r=e.getBoundingClientRect();if(r.width&&r.height)o[i]=[r.x,r.y,r.width,r.height,(e.id||e.className||e.tagName).toString().slice(0,30)]});return o}"""
SEL="button,.card,.up,.tbtn,.slot,.spell,.eb,[data-x]"
async def probe(pg,label):
    n=await pg.evaluate(f"document.querySelectorAll('{SEL}').length")
    bad={}
    for i in range(min(n,60)):
        box=await pg.evaluate(f"(()=>{{const e=[...document.querySelectorAll('{SEL}')][{i}];if(!e)return null;const r=e.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight?[r.x+r.width/2,r.y+r.height/2,(e.id||e.className||e.tagName).toString().slice(0,24)]:null}})()")
        if not box: continue
        await pg.mouse.move(5,5);await pg.wait_for_timeout(60)
        a=await pg.evaluate(SNAP)
        await pg.mouse.move(box[0],box[1]);await pg.wait_for_timeout(350)
        b=await pg.evaluate(SNAP)
        # layout shift of elements other than hovered subtree: compare size/pos > 1.5px
        moved=[(a[k][4],round(b[k][1]-a[k][1],1),round(b[k][3]-a[k][3],1)) for k in a if k in b and (abs(b[k][1]-a[k][1])>1.5 or abs(b[k][3]-a[k][3])>1.5 or abs(b[k][2]-a[k][2])>1.5) ]
        # edge flicker: hover state at bottom/left edge
        if len(moved)>0: bad[box[2]]=len(moved), moved[:4]
    print(label,'hovered',n,'big shifts:',bad)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(1500);await pg.mouse.click(5,5)
        await probe(pg,'title')
        await pg.evaluate("()=>{useSlot(3,{name:'T'});closeTitle();document.body.classList.remove('intitle');meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,site2:1,mark:1};meta.cores=500;save();menu()}")
        await pg.wait_for_timeout(1200);await probe(pg,'hub')
        await pg.evaluate("$('startBtn').click()");await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{R.gold=99999;openPack()}");await pg.wait_for_timeout(1500)
        if await pg.evaluate("!!$('lockCv')"):
            await pg.evaluate("$('lquick').click()");await pg.wait_for_timeout(2500)
        await probe(pg,'cards');print(errs[:3]);await b.close()
asyncio.run(main())
