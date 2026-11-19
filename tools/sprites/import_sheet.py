#!/usr/bin/env python3
"""Cut an AI sprite sheet (flat magenta #FF00FF background, grid layout) into single PNGs.
  python3 tools/sprites/import_sheet.py SHEET.png OUTDIR name1,name2,... --cols 2 --rows 2 [--w 480]
Chroma-keys magenta (strict: keeps purple art), crops each grid cell to its content, scales to width --w."""
import sys, os
from PIL import Image
a=sys.argv[1:];sheet,out,names=a[0],a[1],a[2].split(',')
opt=lambda k,d:int(a[a.index(k)+1]) if k in a else d
cols,rows,W=opt('--cols',2),opt('--rows',2),opt('--w',480)
im=Image.open(sheet).convert('RGBA');p=im.load();w,h=im.size
for y in range(h):
    for x in range(w):
        r,g,b,al=p[x,y]
        if r>200 and b>200 and g<110: p[x,y]=(0,0,0,0)
        elif r>170 and b>170 and g<140 and min(r,b)-g>60: p[x,y]=(min(r,g+50),g,min(b,g+50),70)
os.makedirs(out,exist_ok=True)
import numpy as np
from scipy import ndimage as ndi
al=np.array(im.getchannel('A'))>40
lab,nl=ndi.label(ndi.binary_dilation(al,iterations=int(opt('--grow',22))))
boxes=[]
for sl in ndi.find_objects(lab):
    y0,y1,x0,x1=sl[0].start,sl[0].stop,sl[1].start,sl[1].stop
    if (y1-y0)*(x1-x0)>2500:boxes.append((x0,y0,x1,y1))
assert len(boxes)==len(names),(len(boxes),'sprites found, expected',len(names))
rowh=h/rows;boxes.sort(key=lambda b:(int(((b[1]+b[3])/2)//rowh),b[0]))
for i,n in enumerate(names):
    c=im.crop(boxes[i])
    bb=c.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox()
    c=c.crop(bb);s=(float(a[a.index('--scale')+1]) if '--scale' in a else W/c.width);W=round(c.width*s)
    c=c.resize((W,max(1,round(c.height*s))),Image.LANCZOS);c.save(os.path.join(out,n+'.png'));print(n,c.size)
