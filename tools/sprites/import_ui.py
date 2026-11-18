#!/usr/bin/env python3
"""Cut UI art (AI sheets on flat magenta) into assets/ui/*.png (keyed, cropped).
  python3 tools/sprites/import_ui.py SHEET.png name1,name2,... [--minpx N]
Pieces are found as connected blobs, ordered top-to-bottom then left-to-right (rows by centre-y bands).
Black hollow centres (for frames) are made transparent when --hollow is given."""
import sys, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(__file__))
from import_ai import key_magenta, components

def main():
    a = sys.argv[1:]; sheet = a[0]; names = a[1].split(','); hollow = '--hollow' in a
    im = key_magenta(Image.open(sheet), strict=False)
    boxes = components(im, min_px=3000)
    # sort into rows: by centre y band, then x
    boxes.sort(key=lambda b: ((b[1] + b[3]) / 2))
    rows, cur = [], []
    for b in boxes:
        if cur and abs((b[1] + b[3]) / 2 - sum((c[1] + c[3]) / 2 for c in cur) / len(cur)) > 0.4 * max(b[3] - b[1], 1): rows.append(cur); cur = []
        cur.append(b)
    if cur: rows.append(cur)
    ordered = [b for r in rows for b in sorted(r, key=lambda b: b[0])]
    print('found', len(ordered), 'pieces', ordered)
    out = os.path.join(ROOT, 'assets', 'ui'); os.makedirs(out, exist_ok=True)
    for n, b in zip(names, ordered):
        c = im.crop(b[:4])
        if hollow: c = punch(c)
        c.save(os.path.join(out, n + '.png')); print(n, c.size)

def punch(im):
    """flood-fill the near-black interior (connected, enclosed) to transparent"""
    w, h = im.size; p = im.load(); seen = bytearray(w * h); st = []
    dark = lambda x, y: p[x, y][3] > 0 and max(p[x, y][:3]) < 28
    # seed from the centre column/row region
    for sy in range(h // 3, 2 * h // 3, 3):
        for sx in range(w // 3, 2 * w // 3, 3):
            if dark(sx, sy) and not seen[sy * w + sx]:
                st.append((sx, sy)); seen[sy * w + sx] = 1
                while st:
                    x, y = st.pop(); p[x, y] = (0, 0, 0, 0)
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and dark(nx, ny): seen[ny * w + nx] = 1; st.append((nx, ny))
    return im
main()
