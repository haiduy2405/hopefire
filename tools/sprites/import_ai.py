#!/usr/bin/env python3
"""Import an AI-generated sprite sheet (sprites on flat magenta #FF00FF) into assets/ai/.

  python3 tools/sprites/import_ai.py SHEET.png name1,name2,... W1,W2,... [--cols 4] [--frames 4] [--legs 0.3] [--px 0.5]

* chroma-keys the magenta background (with despill), splits the sheet into connected sprites,
  orders them row by row, crops each, scales it so its WIDTH = W world units * (1/px) art pixels,
* finds glowing yellow-green eye pixels -> 'eyes' metadata (relative to bottom-centre anchor, world units),
* makes `frames` walk frames procedurally (body bob + leg sway of the bottom `legs` fraction),
* writes assets/ai/<name>_<i>.png + assets/ai/<name>.json. build.py prefers these over procedural art.
"""
import json, math, os, sys
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'ai')

def key_magenta(im, strict=False):
    im = im.convert('RGBA'); p = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = p[x, y]
            if strict:  # only near-pure #FF00FF is background (keeps purple art)
                if r > 205 and b > 205 and g < 90: p[x, y] = (0, 0, 0, 0)
                elif r > 175 and b > 175 and g < 130: p[x, y] = (min(r, g + 60), g, min(b, g + 60), 110)
                continue
            m = min(r, b) - g                       # "magenta-ness"
            if m > 70 and r > 100 and b > 100: p[x, y] = (0, 0, 0, 0)
            elif m > 35 and r > 90 and b > 90:      # fringe: fade + despill
                k = (m - 35) / 35; p[x, y] = (int(min(r, g + 40)), g, int(min(b, g + 40)), int(255 * (1 - k)))
    return im

def components(im, min_px=400):
    a = im.split()[3].point(lambda v: 255 if v > 60 else 0); w, h = im.size
    # coarse grid labelling (fast): downsample mask, flood fill, map back to boxes
    s = 4; sm = a.resize((w // s, h // s), Image.BOX).point(lambda v: 255 if v > 20 else 0); sp = sm.load(); W, H = sm.size
    seen = set(); boxes = []
    for y in range(H):
        for x in range(W):
            if sp[x, y] and (x, y) not in seen:
                st = [(x, y)]; seen.add((x, y)); x0 = x1 = x; y0 = y1 = y; n = 0
                while st:
                    cx, cy = st.pop(); n += 1; x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < W and 0 <= ny < H and sp[nx, ny] and (nx, ny) not in seen:
                                seen.add((nx, ny)); st.append((nx, ny))
                if n * s * s >= min_px: boxes.append(((x0 - 1) * s, (y0 - 1) * s, (x1 + 2) * s, (y1 + 2) * s, n))
    return boxes

def order(boxes, cols):
    boxes = sorted(boxes, key=lambda b: -b[4])
    return boxes

def eyes_of(im):
    p = im.load(); w, h = im.size; pts = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = p[x, y]
            if a > 200 and g > 170 and r > 120 and b < 140 and g >= r - 20: pts.append((x, y))
    clusters = []
    for x, y in pts:
        for c in clusters:
            if abs(c[0] / c[2] - x) <= 3 and abs(c[1] / c[2] - y) <= 3: c[0] += x; c[1] += y; c[2] += 1; break
        else: clusters.append([x, y, 1])
    clusters = [c for c in clusters if c[2] >= 1]
    clusters.sort(key=lambda c: -c[2])
    return [(c[0] / c[2], c[1] / c[2], max(1.0, math.sqrt(c[2]))) for c in clusters[:6]]

def outline(im, col=(12, 8, 16, 255)):
    a = im.split()[3].point(lambda v: 255 if v > 100 else 0)
    grown = a.filter(ImageFilter.MaxFilter(3))
    o = Image.new('RGBA', im.size, col); o.putalpha(grown)
    o.alpha_composite(im); return o

def frames_of(im, n, legs):
    w, h = im.size; out = []; cut = int(h * (1 - legs))
    for f in range(n):
        bob = [0, 1, 0, 1][f % 4]; sway = [0, 1, 0, -1][f % 4] * max(1, w // 40)
        fr = Image.new('RGBA', (w + 4, h + 2), (0, 0, 0, 0))
        top = im.crop((0, 0, w, min(h, cut + 2))); bot = im.crop((0, cut, w, h))
        fr.alpha_composite(bot, (2 + sway, cut + 1)); fr.alpha_composite(top, (2, bob))
        out.append(fr)
    return out

def main():
    sheet, names, widths = sys.argv[1], sys.argv[2].split(','), [float(v) for v in sys.argv[3].split(',')]
    opt = lambda k, d: type(d)(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
    cols, nfr, legs, px = opt('--cols', 4), opt('--frames', 4), opt('--legs', 0.3), opt('--px', 0.5)
    im = key_magenta(Image.open(sheet), '--strict' in sys.argv); boxes = components(im)
    boxes = sorted(boxes, key=lambda b: -b[4])[:len(names)]
    rows = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2); rh = (max(b[3] for b in boxes) - min(b[1] for b in boxes)) / max(1, math.ceil(len(names) / cols))
    y0 = min(b[1] for b in boxes)
    boxes = sorted(boxes, key=lambda b: (int(((b[1] + b[3]) / 2 - y0) // rh), b[0]))
    os.makedirs(OUT, exist_ok=True)
    for name, wd, b in zip(names, widths, boxes):
        spr = im.crop(b[:4]); spr = spr.crop(spr.getbbox())
        tw = max(4, round(wd / px)); th = max(4, round(spr.height * tw / spr.width))
        sm = spr.resize((tw, th), Image.LANCZOS)
        a = sm.split()[3].point(lambda v: 0 if v < 90 else 255); sm.putalpha(a)
        sm = outline(sm)
        eyes = eyes_of(sm); W2, H2 = sm.size
        eyes = sorted([e for e in eyes if e[0] > W2 * 0.55 and e[2] <= 4.2], key=lambda e: -e[0])[:3]
        if not eyes: eyes = [(W2 * 0.80, H2 * 0.55, 2.5), (W2 * 0.88, H2 * 0.58, 2.0)]  # fallback: front of the head
        meta = {'px': px, 'eyes': [[round(x + 2 - (W2 + 4) / 2, 1), round(y + 1 - (H2 + 1), 1), round(s * 0.8, 2)] for x, y, s in eyes]}  # art px, rel. to bottom-centre
        frs = frames_of(sm, nfr, legs) if nfr > 1 else [sm]
        for i, fr in enumerate(frs): fr.save(os.path.join(OUT, '%s_%d.png' % (name, i)))
        meta['frames'] = len(frs)
        json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'))
        print(name, sm.size, 'eyes', len(eyes))

if __name__ == '__main__':
    main()
