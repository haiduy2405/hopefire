#!/usr/bin/env python3
"""Import the crew ATTACK-pose sheet (store/crew_atk_v1.png) as assets/ai/crew_<role>_atk.

Same slot order as the idle sheet (store/crew_v1.png): guardian, hunter, medic, engineer.
Each pose keeps the SAME world scale as the idle sprite of that role and is anchored at the feet
(ax/ay stored in the json, in art px from the sprite's top-left), so swapping idle -> attack does not make the figure jump.
Numbers below were measured on the two sheets (source px); re-measure if the sheets are regenerated.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_ai as I
from PIL import Image

ROOT = I.ROOT; OUT = I.OUT; PX = 0.5
# role: (idle world width, idle bbox width in src px, crop x0, crop x1, feet-centre x in sheet, feet bottom y in sheet)
ROLES = {
    'guardian': (28, 409, 72, 556, 285, 520),
    'hunter':   (30, 517, 556, 1148, 836, 513),
    'medic':    (26, 370, 1150, 1655, 1321, 522),
    'engineer': (28, 451, 1656, 2160, 1899, 522),
}

def main():
    sheet = Image.open(os.path.join(ROOT, 'store', 'crew_atk_v1.png'))
    im = I.key_magenta(sheet)
    for role, (wd, idle_w, x0, x1, fx, fy) in ROLES.items():
        k = wd / idle_w                      # world units per source px (same as the idle sprite)
        sub = im.crop((x0, 0, x1, im.height)); bb = sub.getbbox()
        bx0, by0, bx1, by1 = x0 + bb[0], bb[1], x0 + bb[2], bb[3]
        spr = im.crop((bx0, by0, bx1, by1))
        s = k / PX                            # art px per source px
        tw, th = max(4, round(spr.width * s)), max(4, round(spr.height * s))
        sm = spr.resize((tw, th), Image.LANCZOS)
        a = sm.split()[3].point(lambda v: 0 if v < 90 else 255); sm.putalpha(a)
        sm = I.outline(sm)
        ax, ay = round((fx - bx0) * s, 1), round((fy - by0) * s, 1)
        name = 'crew_%s_atk' % role
        sm.save(os.path.join(OUT, name + '_0.png'))
        json.dump({'px': PX, 'eyes': [], 'frames': 1, 'ax': ax, 'ay': ay}, open(os.path.join(OUT, name + '.json'), 'w'))
        print(name, sm.size, 'anchor', ax, ay)

if __name__ == '__main__':
    main()
