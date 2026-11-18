#!/usr/bin/env python3
"""HOPEFIRE sprite builder — procedural pixel art -> assets/sprites.png + assets/sprites.json

Every sprite is drawn with aliased primitives at 1 art pixel = 1 world unit, then post-processed:
  * auto shading: top edge lighter, bottom edge darker (light comes from above)
  * auto outline: 1px dark outline around every shape
Each sprite also gets a white "flash" twin (used when a creature is hit).

Replace any frame later with hand-drawn art (Aseprite etc.): keep the atlas/JSON format and the game
picks it up; anything missing falls back to the code-drawn version.

Run:  python3 tools/sprites/build.py
"""
import json, math, os, random
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_PNG = os.path.join(ROOT, 'assets', 'sprites.png')
OUT_JSON = os.path.join(ROOT, 'assets', 'sprites.json')
OUTLINE = (12, 8, 16, 255)

def hx(c, a=255):
    c = c.lstrip('#'); return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), a)

def mix(c, d, t):
    return tuple(int(c[i] + (d[i] - c[i]) * t) for i in range(3)) + (c[3],)

class Spr:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.keep = set()  # pixels excluded from auto shading (eyes, glow spots)
    def ell(self, cx, cy, rx, ry, c):
        self.d.ellipse([round(cx - rx), round(cy - ry), round(cx + rx), round(cy + ry)], fill=c)
    def poly(self, pts, c):
        self.d.polygon([(round(x), round(y)) for x, y in pts], fill=c)
    def line(self, pts, c, w=1):
        self.d.line([(round(x), round(y)) for x, y in pts], fill=c, width=w)
    def px(self, x, y, c, keep=True):
        x, y = round(x), round(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            self.im.putpixel((x, y), c)
            if keep: self.keep.add((x, y))
    def rect(self, x0, y0, x1, y1, c):
        self.d.rectangle([round(x0), round(y0), round(x1), round(y1)], fill=c)
    def finish(self, shade=True, outline=True):
        im = self.im; w, h = self.w, self.h; p = im.load()
        if shade:
            src = im.copy(); s = src.load()
            for y in range(h):
                for x in range(w):
                    c = s[x, y]
                    if c[3] == 0 or (x, y) in self.keep: continue
                    up = s[x, y - 1] if y > 0 else (0, 0, 0, 0)
                    dn = s[x, y + 1] if y < h - 1 else (0, 0, 0, 0)
                    if up[3] == 0: p[x, y] = mix(c, (255, 255, 255, 255), 0.28)
                    elif dn[3] == 0: p[x, y] = mix(c, (0, 0, 0, 255), 0.35)
        if outline:
            src = im.copy(); s = src.load()
            for y in range(h):
                for x in range(w):
                    if s[x, y][3]: continue
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and s[nx, ny][3] and s[nx, ny] != OUTLINE:
                            p[x, y] = OUTLINE; break
        return im

# ---------------------------------------------------------------- creatures (face right, feet at bottom)
def eyes_out(lst, w, h):
    # eye coords relative to anchor (bottom-centre), y negative = up
    return [[round(x - w / 2, 1), round(y - (h - 1), 1), s] for x, y, s in lst]

def crawler(f):
    w, h = 26, 19; S = Spr(w, h); body, dark = hx('#4b3a5c'), hx('#2a1f33')
    bob = [0, 1, 0, 1][f]
    for i in range(4):
        lx = 5 + i * 5; sw = [2, -1, -2, 1][(f + i) % 4]
        S.line([(lx, 11 + bob), (lx + sw, h - 1)], dark, 2)
    S.ell(13, 9 + bob, 10, 6, body)
    for i in range(3):
        sx = 7 + i * 5; S.poly([(sx - 2, 5 + bob), (sx, 0 + bob), (sx + 2, 5 + bob)], dark)
    eyes = [(19, 8 + bob, 1.6), (22, 9 + bob, 1.3)]
    for x, y, s in eyes: S.px(x, y, dark); S.px(x + 1, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def skitter(f):
    w, h = 26, 14; S = Spr(w, h); body, dark = hx('#5d4b2c'), hx('#2e2414')
    bob = [0, 1, 0, 1][f]
    for i in range(6):
        lx = 4 + i * 3.4; sw = [2, 0, -2, 0][(f + i) % 4]
        S.line([(lx, 8 + bob), (lx + sw * 0.5, 4 + bob), (lx + sw, h - 1)], dark, 1)
    S.ell(14, 7 + bob, 10, 3.5, body)
    S.line([(4, 7 + bob), (1, 3), (2, 0 + [0, 1, 0, -1][f] + 1)], body, 2)
    eyes = [(21, 6 + bob, 1.4), (23, 7 + bob, 1.2), (19, 6 + bob, 1)]
    for x, y, s in eyes: S.px(x, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def brute(f):
    w, h = 38, 34; S = Spr(w, h); body, dark, bone = hx('#5c2f3c'), hx('#2b141c'), hx('#d9cfb8')
    bob = [0, 1, 0, 1][f]
    for i, lx in enumerate((13, 24)):
        sw = [2, -2][(f + i) % 2] if f % 2 else 0
        S.line([(lx, 20 + bob), (lx + sw, h - 1)], dark, 4)
    S.ell(18, 16 + bob, 15, 12, body)
    S.ell(12, 20 + bob, 7, 5, mix(body, (0, 0, 0, 255), 0.25))
    for s in (-1, 1):
        bx = 26 + s * 4
        S.poly([(bx - 2, 7 + bob), (bx + s * 5, 0), (bx + s * 6, 2), (bx + 2, 9 + bob)], bone)
    arm = [2, 0, -2, 0][f]
    S.line([(28, 17 + bob), (35, 24 + arm), (36, 28 + arm)], dark, 4)
    eyes = [(27, 12 + bob, 1.8), (31, 13 + bob, 1.5)]
    for x, y, s in eyes: S.px(x, y, dark); S.px(x + 1, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def spitter(f):
    w, h = 26, 22; S = Spr(w, h); body, dark, sac = hx('#3f5a3a'), hx('#1e2c1c'), hx('#8cff3a')
    bob = [0, 1, 0, 1][f]
    for i in range(4):
        lx = 5 + i * 5; sw = [2, -1, -2, 1][(f + i) % 4]
        S.line([(lx, 15 + bob), (lx + sw, h - 1)], dark, 2)
    S.ell(13, 13 + bob, 10, 5.5, body)
    S.ell(9, 7 + bob, 6, 5, dark)
    S.ell(9, 7 + bob, 4.5, 3.6, sac)
    for x in range(5, 14):
        for y in range(3, 11): S.keep.add((x, y + bob))
    S.line([(21, 12 + bob), (25, 10 + bob)], body, 2)
    eyes = [(18, 12 + bob, 1.4), (20, 13 + bob, 1.1)]
    for x, y, s in eyes: S.px(x, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def bloater(f):
    w, h = 32, 32; S = Spr(w, h); body, dark, pus = hx('#6a5a2a'), hx('#33290f'), hx('#e8d24a')
    sw = [0, 1, 0, -1][f]
    for i in range(3):
        lx = 10 + i * 6; S.line([(lx, 24), (lx + [1, -1, 0][(f + i) % 3], h - 1)], dark, 2)
    r = 13 + (1 if f in (1, 2) else 0)
    S.ell(16, 15, r, r - 1, body)
    for (px_, py_, pr) in ((9, 9, 2), (17, 6, 2), (13, 19, 2), (22, 13, 1.5), (7, 16, 1.5)):
        S.ell(px_ + sw * 0.3, py_, pr, pr, pus)
        for x in range(int(px_ - 2), int(px_ + 3)):
            for y in range(int(py_ - 2), int(py_ + 3)): S.keep.add((x, y))
    eyes = [(24, 14, 1.4), (27, 16, 1.2)]
    for x, y, s in eyes: S.px(x, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def wisp(f):
    w, h = 22, 18; S = Spr(w, h); body, dark, wing = hx('#4a4a7a'), hx('#202038'), hx('#2a2a48')
    flap = [-6, -2, 3, -2][f]
    for s in (-1, 1):
        S.poly([(9, 9), (4, 9 + s * abs(flap) * (1 if s < 0 else 0.6)), (14, 9)], wing)
    S.ell(12, 9, 7, 3.5, body)
    S.line([(5, 9), (1, 11 + [0, 1, 0, -1][f])], body, 2)
    eyes = [(16, 8, 1.6)]
    for x, y, s in eyes: S.px(x, y, dark); S.px(x + 1, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def phantom(f):
    w, h = 26, 34; S = Spr(w, h); body, dark, hook = hx('#2c2c40'), hx('#141420'), hx('#8a8ab0')
    sway = [0, 1, 0, -1][f]
    hem = [(3, h - 1)] + [(3 + i * 4, h - 1 - (i % 2) * 3) for i in range(1, 5)] + [(21, h - 1)]
    S.poly([(4, h - 3), (8 + sway, 12), (12 + sway, 1), (16 + sway, 12), (20, h - 3)] + hem[::-1], body)
    S.line([(17, 14), (24, 10), (25, 17 + sway)], hook, 1)
    eyes = [(14 + sway, 8, 1.3), (17 + sway, 9, 1.1)]
    for x, y, s in eyes: S.px(x, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

def splitter(f):
    w, h = 30, 24; S = Spr(w, h); body, dark, crack = hx('#5a2a4a'), hx('#2a1222'), hx('#ff7ab0')
    bob = [0, 1, 0, 1][f]
    for i in range(4):
        lx = 6 + i * 6; sw = [2, -1, -2, 1][(f + i) % 4]
        S.line([(lx, 16 + bob), (lx + sw, h - 1)], dark, 2)
    S.ell(10, 12 + bob, 8, 7, body); S.ell(20, 12 + bob, 8, 7, body)
    for y, x in ((5, 15), (7, 16), (9, 15), (11, 16), (13, 15), (15, 15)): S.px(x, y + bob, crack)
    eyes = [(25, 11 + bob, 1.4), (27, 12 + bob, 1.1), (12, 9 + bob, 1)]
    for x, y, s in eyes: S.px(x, y, dark)
    return S.finish(), eyes_out(eyes, w, h)

# ---------------------------------------------------------------- ship (crashed, tilted) — anchor = hull centre
def ship():
    w, h = 118, 66; S = Spr(w, h)
    hull, top, panel, dark = hx('#4a5162'), hx('#5e687b'), hx('#363c49'), hx('#22262f')
    ox, oy = 59, 36  # world (0,0)
    T = lambda x, y: (ox + x * math.cos(-0.1) - y * math.sin(-0.1), oy + x * math.sin(-0.1) + y * math.cos(-0.1))
    tp = lambda pts: [T(x, y) for x, y in pts]
    S.poly(tp([(-22, 10), (-4, 12), (-34, 30), (-50, 27)]), hx('#3a404f'))          # broken wing
    S.poly(tp([(-48, 6), (-32, -24), (22, -30), (52, -10), (46, 12), (-38, 16)]), hull)
    S.poly(tp([(-32, -24), (22, -30), (44, -14), (-24, -10)]), top)
    for x in range(-26, 40, 9):
        S.line(tp([(x, -18), (x - 2, 12)]), panel, 1)
    S.poly(tp([(16, -24), (34, -22), (42, -10), (24, -10)]), hx('#0c3d4d'))         # cockpit frame
    S.poly(tp([(19, -22), (31, -21), (35, -14), (25, -14)]), hx('#1fd1ff'))         # cockpit glass
    for x in range(int(ox + 18), int(ox + 36)):
        for y in range(int(oy - 26), int(oy - 12)): S.keep.add((x, y))
    S.rect(*T(-58, -12), *T(-46, 6), dark)                                            # engine block
    S.rect(*T(-56, -8), *T(-50, 2), hx('#ff8a30'))
    for x in range(int(ox - 58), int(ox - 48)):
        for y in range(int(oy - 10), int(oy + 6)): S.keep.add((x, y))
    S.rect(*T(-9, -32), *T(9, -26), dark)                                             # cannon mount
    for x, y in ((-10, -2), (6, 4), (30, 0), (-20, 2)):                               # scorch marks
        S.ell(*T(x, y), 3, 1.5, mix(hull, (0, 0, 0, 255), 0.4))
    return S.finish(), {'ax': ox, 'ay': oy}

# ---------------------------------------------------------------- module housings (one per type) — anchor = pad centre
TYPE_COL = {'Thermal': '#ff7a3d', 'Cryo': '#5cd0ff', 'Arc': '#ffe14d', 'Nano': '#7dffb0'}
def modbase(ty):
    w, h = 26, 24; S = Spr(w, h); ax, ay = 13, 17
    S.ell(ax, ay, 12, 5, hx('#151922'))
    S.rect(ax - 8, ay - 15, ax + 8, ay - 3, hx('#3a4150'))
    S.rect(ax - 8, ay - 8, ax + 8, ay - 6, hx(TYPE_COL[ty]))
    for x in range(ax - 8, ax + 9):
        for y in range(ay - 8, ay - 5): S.keep.add((x, y))
    S.rect(ax - 6, ay - 14, ax - 4, ay - 12, hx('#5a6376'))
    return S.finish(), {'ax': ax, 'ay': ay}

def drone(ty):
    w, h = 18, 10; S = Spr(w, h)
    S.line([(1, 3), (16, 3)], hx('#9aa4b2'), 1)
    S.poly([(9, 1), (14, 5), (9, 9), (4, 5)], hx('#4a5162'))
    S.rect(8, 4, 10, 6, hx(TYPE_COL[ty]))
    for x in range(8, 11):
        for y in range(4, 7): S.keep.add((x, y))
    return S.finish(), {'ax': 9, 'ay': 5}

# ---------------------------------------------------------------- ground
SITE_PAL = [  # dark, mid, light, accent  (per crash site)
    ('#18110c', '#211710', '#2b1e14', '#37271a'),
    ('#0e1418', '#141c23', '#1b2630', '#24323f'),
    ('#161209', '#1e180e', '#272013', '#33291a'),
    ('#130e12', '#1b1419', '#241b22', '#2e232c'),
    ('#150a0c', '#1e0f12', '#29151a', '#371c22'),
]
def tile(site, seed):
    """64x64 seamless ground: periodic value noise (2 octaves) + per-pixel grain, quantised to the site palette."""
    rnd = random.Random(seed); w = h = 64; im = Image.new('RGBA', (w, h)); p = im.load()
    d, m, l, a = [hx(c) for c in SITE_PAL[site]]
    def octave(g):
        grid = [[rnd.random() for _ in range(g)] for _ in range(g)]
        def f(x, y):
            gx, gy = x / w * g, y / h * g; x0, y0 = int(gx) % g, int(gy) % g; x1, y1 = (x0 + 1) % g, (y0 + 1) % g
            tx, ty = gx - int(gx), gy - int(gy); tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
            top = grid[y0][x0] * (1 - tx) + grid[y0][x1] * tx; bot = grid[y1][x0] * (1 - tx) + grid[y1][x1] * tx
            return top * (1 - ty) + bot * ty
        return f
    o1, o2 = octave(4), octave(11)
    for y in range(h):
        for x in range(w):
            n = o1(x, y) * 0.6 + o2(x, y) * 0.4 + rnd.uniform(-0.12, 0.12)
            p[x, y] = d if n < 0.36 else m if n < 0.56 else l if n < 0.72 else a
    return im

def rock(i):
    rnd = random.Random(i * 7 + 1); w, h = [(14, 10), (20, 14), (10, 7)][i]; S = Spr(w, h)
    pts = []
    for k in range(7):
        ang = math.pi * 2 * k / 7; rr = rnd.uniform(0.75, 1.0)
        pts.append((w / 2 + math.cos(ang) * (w / 2 - 1) * rr, h * 0.55 + math.sin(ang) * (h * 0.45 - 1) * rr))
    S.poly(pts, hx('#2f342e'))
    return S.finish(), {'ax': w // 2, 'ay': h - 1}

def debris(i):
    w, h = [(16, 8), (12, 10), (20, 7)][i]; S = Spr(w, h)
    if i == 0: S.poly([(1, 5), (12, 1), (15, 4), (4, 7)], hx('#4a5162'))
    elif i == 1: S.poly([(2, 2), (9, 1), (11, 8), (3, 9)], hx('#3a404f')); S.line([(3, 4), (9, 4)], hx('#5e687b'))
    else: S.rect(1, 2, 18, 5, hx('#4a5162')); S.line([(4, 2), (4, 5)], hx('#22262f')); S.line([(12, 2), (12, 5)], hx('#22262f'))
    return S.finish(), {'ax': w // 2, 'ay': h - 1}


# ---------------------------------------------------------------- bosses (face right, feet at bottom), body ~ r=36
BOSS_PAL = [('#4a2446', '#1e0c1c'), ('#2e5038', '#122216'), ('#5a4628', '#241a0e'), ('#2c2c4c', '#121222'), ('#5a1424', '#240810')]
def boss(bk, f):
    w, h = 116, 86; S = Spr(w, h); body, dark = hx(BOSS_PAL[bk - 1][0]), hx(BOSS_PAL[bk - 1][1])
    mid = mix(body, (0, 0, 0, 255), 0.3); cx = 56; base = h - 1; bob = [0, 1, 2, 1][f]
    for i in range(8):                                                            # tentacle legs
        a = -math.pi + i * math.pi / 7; sw = math.sin(f * math.pi / 2 + i * 1.3) * 4
        S.line([(cx + math.cos(a) * 22, base - 24 + bob), (cx + math.cos(a) * 42, base - 12 + sw),
                (cx + math.cos(a) * 54, min(base, base - 2 + sw * 0.4))], dark if i % 2 else mid, 5)
    S.ell(cx, base - 34 + bob, 41, 31, dark)
    S.ell(cx - 1, base - 36 + bob, 37, 27, body)
    S.ell(cx - 12, base - 26 + bob, 18, 10, mid)                                  # belly shadow
    mo = 3 + [0, 2, 4, 2][f]; mw = 20 if bk == 1 else 15                          # maw + teeth
    S.ell(cx + 16, base - 22 + bob, mw, mo, hx('#120610'))
    for i in range(6 if bk == 1 else 5):
        tx = cx + 16 - mw + 5 + i * (2 * mw - 8) / (5 if bk == 1 else 4)
        S.rect(tx, base - 22 - mo + bob, tx + 1, base - 22 - mo + 3 + bob, hx('#e8dcc0'))
        S.rect(tx + 2, base - 22 + mo - 3 + bob, tx + 3, base - 22 + mo + bob, hx('#e8dcc0'))
    for x in range(cx - 8, cx + 40):
        for y in range(base - 32 + bob, base - 12 + bob): S.keep.add((x, y))
    if bk == 1:                                                                   # back spines
        for i in range(5):
            sx = cx - 26 + i * 9; S.poly([(sx - 3, base - 58 + bob + abs(i - 2) * 3), (sx + 1, base - 72 + abs(i - 2) * 4 + bob), (sx + 4, base - 57 + bob + abs(i - 2) * 3)], dark)
    if bk == 2:                                                                   # glowing egg sacs
        for (ex, ey, er) in ((-24, -58, 6), (-9, -63, 7), (-32, -44, 5), (5, -60, 5), (-18, -48, 4)):
            rr = er + (1 if (f + ex) % 2 else 0)
            S.ell(cx + ex, base + ey + bob, rr + 1, rr, dark); S.ell(cx + ex, base + ey + bob, rr, rr - 1, hx('#7dffb0'))
            S.px(cx + ex - 1, base + ey - 2 + bob, hx('#e8fff0'))
            for x in range(cx + ex - rr, cx + ex + rr + 1):
                for y in range(base + ey - rr + bob, base + ey + rr + bob): S.keep.add((x, y))
    if bk == 3:                                                                   # armour plates
        for i in range(5):
            px_ = cx - 30 + i * 13; py_ = base - 60 + abs(i - 2) * 4 + bob
            S.poly([(px_ - 6, py_ + 5), (px_ - 4, py_ - 4), (px_ + 6, py_ - 6), (px_ + 7, py_ + 4)], hx('#5d5f68'))
            S.line([(px_ - 3, py_ - 2), (px_ + 5, py_ - 4)], hx('#8a8d98'))
    if bk == 4:                                                                   # crown of spikes
        for i in range(6):
            sx = cx - 18 + i * 8; hh = 16 + (i % 2) * 7
            S.poly([(sx - 3, base - 60 + bob), (sx, base - 60 - hh + bob), (sx + 3, base - 60 + bob)], hx('#c79bff'))
            for y in range(base - 60 - hh + bob, base - 59 + bob): S.keep.add((sx, y))
    if bk == 5:                                                                   # glowing veins
        for pts in (((-30, -40), (-18, -50), (-6, -46), (6, -58)), ((-34, -28), (-22, -34), (-12, -28)), ((10, -42), (22, -50), (30, -44))):
            S.line([(cx + x, base + y + bob) for x, y in pts], hx('#ff3048'), 1)
            for x, y in pts: S.keep.add((cx + x, base + y + bob))
    eyes = [(cx + 4, base - 50 + bob, 3.6), (cx + 13, base - 54 + bob, 4.3), (cx + 22, base - 50 + bob, 3.6), (cx + 9, base - 43 + bob, 2.9), (cx + 18, base - 42 + bob, 2.9)]
    if bk == 5: eyes += [(cx - 11, base - 49 + bob, 3.2), (cx - 20, base - 43 + bob, 2.9), (cx + 27, base - 41 + bob, 2.9), (cx - 4, base - 56 + bob, 3.6)]
    for x, y, sz in eyes: S.ell(x, y, 1.6, 1.2, hx('#08040a'))
    return S.finish(), eyes_out(eyes, w, h)

# ---------------------------------------------------------------- UI icons 16x16 (relics, spells, module classes), loot orbs, crate
CLEAR = (0, 0, 0, 0)
def icon(kind, col=None):
    S = Spr(16, 16); c = hx(col) if col else None; grey, steel, dk = hx('#9aa4b2'), hx('#5e687b'), hx('#2a303c')
    if kind == 'lens':
        S.line([(9, 9), (14, 14)], hx('#8a6a3a'), 3); S.ell(6, 6, 5, 5, hx('#c9d2de')); S.ell(6, 6, 3, 3, hx('#5cd0ff')); S.px(5, 4, hx('#e8fbff'))
    elif kind == 'battery':
        S.rect(6, 1, 9, 2, grey); S.rect(3, 3, 12, 14, dk); S.rect(5, 8, 10, 12, hx('#7dffb0')); S.rect(5, 5, 10, 6, hx('#3e8a5c'))
    elif kind == 'echo':
        S.line([(7, 14), (7, 8)], grey, 2); S.rect(4, 13, 10, 14, steel)
        S.ell(6, 5, 6, 5, grey); S.ell(8, 3, 5, 4, CLEAR); S.line([(3, 7), (10, 1)], steel, 1); S.ell(10, 1.5, 1.2, 1.2, hx('#5cd0ff'))
        S.px(13, 4, hx('#5cd0ff')); S.px(14, 6, hx('#5cd0ff')); S.px(12, 2, hx('#5cd0ff'))
    elif kind == 'glass':
        pts = [(8 + math.cos(i * math.pi / 5) * (7 if i % 2 else 3.2), 8 + math.sin(i * math.pi / 5) * (7 if i % 2 else 3.2)) for i in range(10)]
        S.poly(pts, hx('#ff5a3d')); S.ell(8, 8, 2.2, 2.2, hx('#ffe14d'))
    elif kind == 'dampener':
        S.rect(4, 2, 11, 13, dk)
        for y in range(3, 13, 2): S.line([(3, y), (12, y)], hx('#c79bff'))
        S.rect(6, 0, 9, 1, grey); S.rect(6, 14, 9, 15, grey)
    elif kind == 'magnet':
        S.ell(8, 8, 6.5, 6.5, hx('#ff4d5e')); S.ell(8, 8, 2.5, 2.5, CLEAR); S.rect(5.5, 0, 10.5, 8, CLEAR)
        S.rect(2, 1, 4, 8, hx('#ff4d5e')); S.rect(12, 1, 14, 8, hx('#ff4d5e')); S.rect(2, 1, 4, 3, grey); S.rect(12, 1, 14, 3, grey)
    elif kind == 'trigger':
        S.ell(8, 8, 6.5, 6.5, hx('#ff4d5e')); S.ell(8, 8, 4.5, 4.5, CLEAR)
        S.line([(8, 0), (8, 5)], hx('#ff4d5e'), 2); S.line([(8, 11), (8, 15)], hx('#ff4d5e'), 2)
        S.line([(0, 8), (5, 8)], hx('#ff4d5e'), 2); S.line([(11, 8), (15, 8)], hx('#ff4d5e'), 2); S.rect(7, 7, 8, 8, hx('#ffe14d'))
    elif kind == 'thorns':
        S.poly([(2, 2), (13, 2), (13, 8), (8, 14), (2, 8)], steel); S.poly([(9, 3), (5, 9), (8, 9), (6, 13), (11, 7), (8, 7)], hx('#ffe14d'))
    elif kind == 'flare':
        for i in range(8):
            a = i * math.pi / 4; S.line([(8 + math.cos(a) * 4, 8 + math.sin(a) * 4), (8 + math.cos(a) * 7, 8 + math.sin(a) * 7)], hx('#ffb03a'), 2)
        S.ell(8, 8, 4, 4, hx('#ffd24a'))
    elif kind == 'nova':
        for i in range(3):
            a = i * math.pi / 3 + math.pi / 2; S.line([(8 - math.cos(a) * 7, 8 - math.sin(a) * 7), (8 + math.cos(a) * 7, 8 + math.sin(a) * 7)], hx('#5cd0ff'), 2)
        S.ell(8, 8, 2, 2, hx('#e8fbff'))
    elif kind == 'over':
        S.poly([(10, 0), (3, 9), (7, 9), (5, 15), (13, 6), (9, 6)], hx('#ffe14d'))
    elif kind == 'cell':
        S.rect(1, 1, 14, 14, hx('#1e4a32')); S.rect(6, 3, 9, 12, hx('#7dffb0')); S.rect(3, 6, 12, 9, hx('#7dffb0'))
    elif kind == 'pulse':
        S.ell(8, 8, 7, 7, hx('#c79bff')); S.ell(8, 8, 5, 5, CLEAR); S.ell(8, 8, 3, 3, hx('#c79bff')); S.ell(8, 8, 1, 1, CLEAR)
    elif kind == 'lance':
        S.rect(3, 11, 12, 14, dk); S.poly([(8, 1), (12, 7), (8, 12), (4, 7)], c); S.px(8, 4, hx('#ffffff'))
    elif kind == 'rail':
        S.rect(2, 11, 9, 14, dk); S.line([(3, 11), (13, 1)], grey, 2); S.line([(6, 12), (15, 3)], steel, 2); S.line([(5, 9), (12, 3)], c, 1)
    elif kind == 'mortar':
        S.rect(2, 10, 13, 14, dk); S.poly([(4, 10), (6, 3), (11, 3), (12, 10)], steel); S.ell(8.5, 3, 2.5, 1.5, c)
    elif kind == 'drone':
        S.line([(1, 5), (14, 5)], grey, 1); S.poly([(8, 3), (13, 8), (8, 13), (3, 8)], steel); S.rect(7, 7, 9, 9, c)
    for x in range(16):
        for y in range(16):
            p = S.im.getpixel((x, y))
            if p[3] and (p[0] + p[1] + p[2]) > 400: S.keep.add((x, y))
    return S.finish(), {}

def orb(kind):
    if kind == 'scrap':
        S = Spr(8, 8); S.ell(3.5, 3.5, 3, 3, hx('#ffd24a')); S.rect(3, 3, 4, 4, hx('#7a5a10'))
        for x, y in ((3, 0), (0, 3), (7, 3), (3, 7)): S.px(x, y, hx('#ffd24a'), False)
    elif kind == 'core':
        S = Spr(7, 10); S.poly([(3, 0), (6, 4), (3, 9), (0, 4)], hx('#c79bff')); S.px(2, 3, hx('#f0e2ff'))
    else:
        S = Spr(8, 10); S.rect(3, 0, 4, 1, hx('#9aa4b2')); S.rect(1, 2, 6, 9, hx('#7dffb0')); S.rect(2, 4, 5, 5, hx('#1e4a32'))
    return S.finish(), {'ax': S.w // 2, 'ay': S.h // 2}

def crate(f):
    w, h = 42, 34; S = Spr(w, h); lidc, body = hx('#5b6475'), hx('#3d4453')
    S.rect(1, 10, 40, 32, body)
    for x in range(1, 41, 8): S.rect(x, 10, x + 3, 32, hx('#353b49'))
    for x in range(1, 41, 4): S.poly([(x, 19), (x + 2, 19), (x + 4, 23), (x + 2, 23)], hx('#ffb03a'))
    S.rect(1, 18, 40, 18, hx('#111111')); S.rect(1, 24, 40, 24, hx('#111111'))
    if f == 0:
        S.rect(0, 5, 41, 11, lidc); S.rect(18, 1, 23, 5, hx('#7dffb0'))
        for x in range(18, 24):
            for y in range(1, 6): S.keep.add((x, y))
    else:
        S.poly([(0, 6), (36, 0), (38, 4), (2, 11)], lidc); S.rect(4, 11, 37, 13, hx('#fff2b0'))
        for x in range(4, 38):
            for y in range(11, 14): S.keep.add((x, y))
    return S.finish(), {}

# ---------------------------------------------------------------- atlas packing
def build():
    sprites = {}  # name -> list of (Image, meta)
    for name, fn in (('crawler', crawler), ('skitter', skitter), ('brute', brute), ('spitter', spitter),
                     ('bloater', bloater), ('wisp', wisp), ('phantom', phantom), ('splitter', splitter)):
        frames = [fn(f) for f in range(4)]
        sprites[name] = [(im, {'eyes': e}) for im, e in frames]
    im, meta = ship(); sprites['ship'] = [(im, meta)]
    for ty in TYPE_COL:
        im, meta = modbase(ty); sprites['mod_' + ty] = [(im, meta)]
        im, meta = drone(ty); sprites['drone_' + ty] = [(im, meta)]
    for s in range(5):
        sprites['tile_%d' % (s + 1)] = [(tile(s, s * 31 + 5), {})]
    for i in range(3):
        im, meta = rock(i); sprites['rock_%d' % i] = [(im, meta)]
        im, meta = debris(i); sprites['debris_%d' % i] = [(im, meta)]
    for bk in range(1, 6):
        sprites['boss_%d' % bk] = [(im, {'eyes': e}) for im, e in (boss(bk, f) for f in range(4))]
    for k in ('lens', 'battery', 'echo', 'glass', 'dampener', 'magnet', 'trigger', 'thorns'):
        sprites['rl_' + k] = [icon(k)]
    for k in ('flare', 'nova', 'over', 'cell', 'pulse'):
        sprites['sp_' + k] = [icon(k)]
    for cl in ('lance', 'rail', 'mortar', 'drone'):
        for ty in TYPE_COL: sprites['c_%s_%s' % (cl, ty)] = [icon(cl, TYPE_COL[ty])]
    for k in ('scrap', 'core', 'cell'):
        sprites['orb_' + k] = [orb(k)]
    sprites['crate'] = [crate(0), crate(1)]
    # flash twins for creatures
    flash = {}
    for name in ('crawler', 'skitter', 'brute', 'spitter', 'bloater', 'wisp', 'phantom', 'splitter') + tuple('boss_%d' % b for b in range(1, 6)):
        fr = []
        for im, meta in sprites[name]:
            f = im.copy(); px = f.load()
            for y in range(f.height):
                for x in range(f.width):
                    if px[x, y][3]: px[x, y] = (255, 255, 255, 255)
            fr.append((f, {}))
        flash[name + '_flash'] = fr
    sprites.update(flash)
    # AI-made sprites (tools/sprites/import_ai.py) override procedural ones of the same name
    aid = os.path.join(ROOT, 'assets', 'ai')
    if os.path.isdir(aid):
        for fn in sorted(os.listdir(aid)):
            if not fn.endswith('.json'): continue
            name = fn[:-5]; m = json.load(open(os.path.join(aid, fn))); frs = []; fl = []
            for i in range(m['frames']):
                im = Image.open(os.path.join(aid, '%s_%d.png' % (name, i))).convert('RGBA')
                meta = {'eyes': m.get('eyes', []), 'px': m['px']}
                if 'ax' in m: meta['ax'], meta['ay'] = m['ax'], m['ay']  # optional explicit anchor (art px from top-left)
                frs.append((im, meta))
                f = im.copy(); f.putalpha(im.split()[3]); wh = Image.new('RGBA', im.size, (255, 255, 255, 255)); wh.putalpha(im.split()[3]); fl.append((wh, dict({'px': m['px']}, **({'ax': m['ax'], 'ay': m['ay']} if 'ax' in m else {}))))
            sprites[name] = frs; sprites[name + '_flash'] = fl
            print('  ai sprite:', name, len(frs), 'frames')
    # shelf packing
    W = 2048; x = y = 1; rowh = 0; placed = {}
    items = sorted(((n, i, im, meta) for n, fr in sprites.items() for i, (im, meta) in enumerate(fr)), key=lambda t: -t[2].height)
    for n, i, im, meta in items:
        if x + im.width + 1 > W: x = 1; y += rowh + 1; rowh = 0
        placed.setdefault(n, {})[i] = (x, y, im, meta); x += im.width + 1; rowh = max(rowh, im.height)
    H = y + rowh + 1
    atlas = Image.new('RGBA', (W, H)); out = {'version': 1, 'image': 'sprites.png', 'W': W, 'H': H, 'sprites': {}}
    for n, fr in placed.items():
        frames = []
        for i in sorted(fr):
            fx, fy, im, meta = fr[i]; atlas.paste(im, (fx, fy))
            d = {'x': fx, 'y': fy, 'w': im.width, 'h': im.height}; d.update(meta); frames.append(d)
        out['sprites'][n] = frames
    os.makedirs(os.path.dirname(OUT_PNG), exist_ok=True)
    atlas.save(OUT_PNG)
    with open(OUT_JSON, 'w') as fjs: json.dump(out, fjs, separators=(',', ':'))
    with open(OUT_JSON.replace('.json', '.js'), 'w') as fjs: fjs.write('window.SPRITE_DATA=' + json.dumps(out, separators=(',', ':')) + ';\n')
    print('atlas %dx%d, %d sprites, %d frames' % (W, H, len(out['sprites']), sum(len(v) for v in out['sprites'].values())))

if __name__ == '__main__':
    build()
