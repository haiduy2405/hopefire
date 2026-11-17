#!/usr/bin/env python3
"""Balance simulation: a bot plays story + all Nightmare sites at 60 fps sim-time.
Usage:
  python -m http.server 8765        (from the repo root, in another terminal)
  python tools/sim/run.py [--runs 2]
Needs: pip install playwright && playwright install chromium
Prints milestones [name, run#, in-game minutes] and total minutes. Target: story 75-110 min, total ~3.5 h, no stage > ~15 runs.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
JS = open(os.path.join(os.path.dirname(__file__), 'campaign.js')).read()
async def main(n):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for _ in range(n):
            pg = await b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8765/'); await pg.wait_for_timeout(600)
            r = await pg.evaluate(JS); r['errors'] = errs[:3]; print(json.dumps(r)); await pg.close()
        await b.close()
asyncio.run(main(int(sys.argv[sys.argv.index('--runs') + 1]) if '--runs' in sys.argv else 1))
