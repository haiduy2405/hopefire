import asyncio
exec(open('/tmp/pad_test.py').read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script(INIT);await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(1200);await pg.mouse.click(5,5)
        await pg.evaluate("()=>{useSlot(3,{name:'T'});closeTitle();document.body.classList.remove('intitle');meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,site2:1,mark:1};meta.runs=3;meta.mastery=5000;meta.chapter=2;save();menu()}")
        await pg.wait_for_timeout(300)
        await pg.evaluate("press('Down')")
        # leave exactly one affordable upgrade; buying it must send the cursor to BEGIN RUN
        await pg.evaluate("""()=>{const bs=[...document.querySelectorAll('.up button')].filter(b=>!b.disabled);let min=1e9;bs.forEach(b=>{const n=+b.textContent.replace(/[^0-9]/g,'');if(n&&n<min)min=n});meta.mastery=min;save();menu()}""")
        await pg.wait_for_timeout(300)
        await pg.evaluate("padSetFocus([...document.querySelectorAll('.up button')].filter(b=>!b.disabled)[0])")
        print('before',await pg.evaluate("PAD.fi.textContent.slice(0,10)"),'enabled',await pg.evaluate("document.querySelectorAll('.up button:not([disabled])').length"))
        await pg.evaluate("press('A')");await pg.wait_for_timeout(400)
        print('after ->',await pg.evaluate("PAD.fi&&(PAD.fi.id||PAD.fi.textContent.slice(0,14))"));print(errs[:3]);await b.close()
asyncio.run(main())
