"""Post-process raw TTS takes into game-ready voice files (needs ffmpeg).
  python tools/voice/post.py <raw_dir>
Picks a take per line (Chatterbox take 0/1, else Kokoro af_heart take 0, else Kokoro _k fallback),
trims silence, applies the character FX chain, normalises loudness (-16 LUFS), writes
assets/vo/<id>.mp3 (mono 44.1 kHz) and assets/vo/manifest.js.
Character FX:
  HOPE      ship AI: band-limit 180 Hz-7 kHz + light chorus + soft compression
  low_hope/death: + tremolo flutter (strained/glitchy)
  ???       ending twist: original + an octave-down copy, layered
  COMMANDER: high-pass 80 Hz + compression
"""
import os, re, subprocess, sys, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'build', 'vo_raw')
OUT = os.path.join(ROOT, 'assets', 'vo'); os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(ROOT, 'src', 'voice.js'), encoding='utf-8').read()
LINES = {}
for m in re.finditer(r"(\w+):\['([^']+)',(?:'((?:[^'\\]|\\.)*)'|\"([^\"]*)\")\]", src):
    LINES[m.group(1)] = (m.group(2), (m.group(3) or m.group(4) or '').replace("\\'", "'"))
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse'
NORM = 'loudnorm=I=-16:TP=-1.5:LRA=11'
def dur(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except ValueError: return 0
def pick(vid, text):
    exp = 0.9 + len(text) * 0.068   # rough expected seconds
    cands = [os.path.join(RAW, f'{vid}_{t}.wav') for t in ('0', '1')] + [os.path.join(RAW, f'{vid}_k.wav')]
    cands = [c for c in cands if os.path.exists(c)]
    if not cands: return None
    # Chatterbox/Kokoro takes: prefer take 0 unless its length looks broken (hallucination / cut-off)
    ok = [c for c in cands if 0.45 * exp < dur(c) < 1.8 * exp]
    return (ok or cands)[0]
done = []
for vid, (who, text) in LINES.items():
    p = pick(vid, text)
    if not p: print('missing', vid); continue
    if who == 'COMMANDER': fx = f'{TRIM},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120'
    elif who == '???': fx = None
    else:
        fx = f'{TRIM},highpass=f=180,lowpass=f=7000,chorus=0.7:0.9:35:0.25:0.3:1.6,acompressor=threshold=-22dB:ratio=2.5:attack=5:release=150'
        if vid in ('low_hope', 'death'): fx += ',tremolo=f=11:d=0.35'
    dst = os.path.join(OUT, vid + '.mp3')
    if fx:
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', p, '-af', f'{fx},{NORM}', '-ar', '44100', '-ac', '1', '-b:a', '128k', dst]
    else:
        g = f'[0:a]{TRIM},asplit[a][b];[b]asetrate=24000*0.5,aresample=24000,atempo=2.0,volume=0.8[low];[a][low]amix=inputs=2:duration=longest,lowpass=f=6000,aecho=0.6:0.5:60:0.3,{NORM}'
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', p, '-filter_complex', g, '-ar', '44100', '-ac', '1', '-b:a', '128k', dst]
    subprocess.run(cmd, check=True); done.append(vid); print('ok', vid, os.path.basename(p), round(dur(dst), 2), 's')
open(os.path.join(OUT, 'manifest.js'), 'w').write('window.VO_FILES=' + json.dumps(sorted(done)) + ';\n')
print(len(done), 'lines ->', OUT)
