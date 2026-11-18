#!/usr/bin/env python3
"""Fill untranslated lines (idx in keep.json = proper names / identical in every language) into tools/i18n/tr/<code>.txt from a partial file tools/i18n/tr/<code>.part
usage: merge_keep.py code"""
import json,sys
keys=json.load(open('tools/i18n/keys.json'));keep=set(json.load(open('tools/i18n/keep.json')))
code=sys.argv[1];d={}
for l in open(f'tools/i18n/tr/{code}.part',encoding='utf-8'):
    l=l.rstrip('\n')
    if l:i,t=l.split('|',1);d[int(i)]=t
open(f'tools/i18n/tr/{code}.txt','w',encoding='utf-8').write(''.join(f'{i}|{keys[i] if i in keep and i not in d else d.get(i,"")}\n' for i in range(len(keys)) if i in keep or i in d)) 
miss=[i for i in range(len(keys)) if i not in keep and i not in d];print('missing',miss)
