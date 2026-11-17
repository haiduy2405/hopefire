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
    ('#121510', '#181d16', '#20271d', '#2a3324'),
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
    # flash twins for creatures
    flash = {}
    for name in ('crawler', 'skitter', 'brute', 'spitter', 'bloater', 'wisp', 'phantom', 'splitter'):
        fr = []
        for im, meta in sprites[name]:
            f = im.copy(); px = f.load()
            for y in range(f.height):
                for x in range(f.width):
                    if px[x, y][3]: px[x, y] = (255, 255, 255, 255)
            fr.append((f, {}))
        flash[name + '_flash'] = fr
    sprites.update(flash)
    # shelf packing
    W = 512; x = y = 1; rowh = 0; placed = {}
    items = sorted(((n, i, im, meta) for n, fr in sprites.items() for i, (im, meta) in enumerate(fr)), key=lambda t: -t[2].height)
    for n, i, im, meta in items:
        if x + im.width + 1 > W: x = 1; y += rowh + 1; rowh = 0
        placed.setdefault(n, {})[i] = (x, y, im, meta); x += im.width + 1; rowh = max(rowh, im.height)
    H = y + rowh + 1
    atlas = Image.new('RGBA', (W, H)); out = {'version': 1, 'image': 'sprites.png', 'sprites': {}}
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
