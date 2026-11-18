#!/usr/bin/env python3
"""Build assets/lang/<code>.js from tools/i18n/keys.json + tools/i18n/tr/<code>.txt (lines 'idx|text').
usage: python3 tools/i18n/build_lang.py vi [zh ...]   (checks placeholders {n} match)"""
import json,re,sys
keys=json.load(open('tools/i18n/keys.json'))
ph=lambda s:sorted(re.findall(r'\{\d+\}',s))
for code in sys.argv[1:]:
    tr={}
    for ln in open(f'tools/i18n/tr/{code}.txt',encoding='utf-8'):
        ln=ln.rstrip('\n')
        if not ln:continue
        i,t=ln.split('|',1);tr[int(i)]=t
    d={};bad=0
    for i,k in enumerate(keys):
        t=tr.get(i)
        if t is None: print(code,'missing',i,k);bad+=1;continue
        if not set(ph(t))<=set(ph(k)): print(code,'PLACEHOLDER MISMATCH',i,k,'=>',t);bad+=1;continue
        if t!=k:d[k]=t
    js='window.LANGS=window.LANGS||{};window.LANGS.%s=%s;\n'%(code,json.dumps(d,ensure_ascii=False,separators=(',',':')))
    open(f'assets/lang/{code}.js','w',encoding='utf-8').write(js)
    print(code,len(d),'entries,',bad,'problems')
