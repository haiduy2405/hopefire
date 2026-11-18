#!/usr/bin/env python3
"""Static extraction of candidate display strings from src/*.js -> stdout JSON list (normalized keys, numbers -> {n})."""
import re,sys,json,glob
def scan(src):
    out=[];i=0;n=len(src)
    def tmpl(i):  # i at char after opening backtick; returns (text with \x01 for ${..}, end index)
        buf=[]
        while i<n:
            c=src[i]
            if c=='\\': buf.append(src[i:i+2]);i+=2;continue
            if c=='`': return ''.join(buf),i+1
            if c=='$' and src[i+1:i+2]=='{':
                d=1;i+=2
                while i<n and d>0:
                    c2=src[i]
                    if c2=='`': _,i=tmpl(i+1);continue
                    if c2 in '\'"':
                        q=c2;i+=1
                        while i<n and src[i]!=q:
                            i+=2 if src[i]=='\\' else 1
                        i+=1;continue
                    if c2=='{': d+=1
                    elif c2=='}': d-=1
                    i+=1
                buf.append('\x01');continue
            buf.append(c);i+=1
        return ''.join(buf),i
    while i<n:
        c=src[i]
        if c=='/' and src[i+1:i+2]=='/':
            while i<n and src[i]!='\n': i+=1
            continue
        if c=='/' and src[i+1:i+2]=='*':
            i=src.find('*/',i+2);i=n if i<0 else i+2;continue
        if c in '\'"':
            q=c;j=i+1;buf=[]
            while j<n and src[j]!=q and src[j]!='\n':
                if src[j]=='\\':
                    buf.append(src[j:j+2]);j+=2
                else: buf.append(src[j]);j+=1
            out.append(''.join(buf));i=j+1;continue
        if c=='`':
            t,i=tmpl(i+1);out.append(t);continue
        i+=1
    return out
def unesc(s):
    return re.sub(r'\\(u[0-9a-fA-F]{4}|.)',lambda m:(chr(int(m.group(1)[1:],16)) if m.group(1)[0]=='u' and len(m.group(1))==5 else {'n':'\n','t':'\t'}.get(m.group(1),m.group(1))),s)
def frags(s):
    s=unesc(s)
    if '<' in s and '>' in s: parts=re.split(r'<[^>]*>',s)
    else: parts=[s]
    res=[]
    for p in parts:
        p=p.replace('&middot;','·').replace('&amp;','&').replace('&nbsp;',' ').replace('&lt;','<').replace('&gt;','>').replace('&times;','×').replace('&hellip;','…')
        for q in re.split(r'\n',p):
            q=q.strip()
            if q: res.append(q)
    return res
def norm(q):
    q=q.replace('\x01','0')   # interpolation -> treated as a number slot
    nums=[]
    def r(m): nums.append(m.group(0));return '{%d}'%(len(nums)-1)
    return re.sub(r'\d+(?:[.,]\d+)*',r,q)
BAD=re.compile(r'^(#[0-9a-fA-F]{3,8}|rgba?\(|\d|[.#\[]|https?:|assets/|[a-z]+[A-Z]\w*$|[a-z_][\w.-]*$|[A-Z][a-z]+[A-Z]\w*$|\W+$)')
def ok(q):
    if len(q)<3 or not re.search(r'[A-Za-z]{2}',q): return False
    if BAD.match(q) and not re.search(r'\s',q): return False
    if re.search(r'=>|function|\bvar \b|\{\{|\bconst\b|px;|;\s*\w+:|[a-z]+\([^)]*\)\s*\{|\bsrc=|class=|style=|\$\{',q): return False
    if re.match(r'^[a-z][a-z0-9_-]*(\s[a-z][a-z0-9_-]*)*$',q) and len(q.split())<=3 and ' ' not in q: return False
    if re.search(r'\b(translate|rotate|scale|ease|linear|monospace|sans-serif|px|rem|rgba|inherit|absolute|pointer|none|flex|block)\b',q) and len(q.split())<6: return False
    return True
if __name__=='__main__':
    seen={}
    for f in sorted(glob.glob('src/*.js')):
        if f.endswith('i18n.js'): continue
        for s in scan(open(f,encoding='utf-8').read()):
            for q in frags(s):
                if ok(q):
                    k=norm(q)
                    seen.setdefault(k,f)
    json.dump(seen,sys.stdout,ensure_ascii=False,indent=0)
