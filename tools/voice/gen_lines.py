"""Generate HOPEFIRE voice lines with free, commercially-usable TTS (run on Duy's PC).
  kokoro venv : python gen_lines.py kokoro   -> HOPE lines + commander reference clip
  chatter venv: python gen_lines.py chatter  -> COMMANDER lines (Chatterbox, cloned from the Kokoro male ref, emotion control)
Output: build/vo_raw/<id>_<take>.wav (24 kHz). Post-processing + mp3: tools/voice/post.py (needs ffmpeg).
Lines/ids mirror docs/VOICE_SCRIPT.md and src/voice.js (VO_LINES)."""
import os, sys, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'build', 'vo_raw'); os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(ROOT, 'src', 'voice.js'), encoding='utf-8').read()
LINES = {}
for m in re.finditer(r"(\w+):\['([^']+)',(?:'((?:[^'\\]|\\.)*)'|\"([^\"]*)\")\]", src):
    LINES[m.group(1)] = (m.group(2), (m.group(3) or m.group(4) or '').replace("\\'", "'"))
# emotion per line for Chatterbox (exaggeration, cfg_weight)
EMO = {'intro_2': (0.35, 0.3), 'legendary': (0.85, 0.4), 'boss_down': (0.8, 0.4), 'cell': (0.6, 0.3), 'ending_2': (0.4, 0.3)}
# speed per line for Kokoro
SPD = {'intro_1': 1.05, 'low_hope': 0.85, 'death': 0.75, 'intro_3': 0.9, 'ending_3': 0.8, 'boss_5': 0.88}
REF_TEXT = "Name's Ryan. Commander of the survey ship Hope. If anyone's out there, we crashed hard, but we're still breathing."
mode = sys.argv[1] if len(sys.argv) > 1 else 'kokoro'
print(len(LINES), 'lines')
if mode == 'kokoro':
    import soundfile as sf, numpy as np
    from kokoro import KPipeline
    pipe = KPipeline(lang_code='a')
    def say(text, voice, speed, path):
        audio = [a for _, _, a in pipe(text, voice=voice, speed=speed)]
        sf.write(path, np.concatenate(audio), 24000)
    for vid, (who, text) in LINES.items():
        if who in ('HOPE', '???'):
            for take, v in enumerate(['af_heart', 'af_bella']):
                say(text, v, SPD.get(vid, 0.95), os.path.join(OUT, f'{vid}_{take}.wav')); print('ok', vid, take)
    say(REF_TEXT, 'am_fenrir', 0.95, os.path.join(OUT, '_ref_commander.wav'))
    for vid, (who, text) in LINES.items():   # fallback commander takes from Kokoro too
        if who == 'COMMANDER': say(text, 'am_fenrir', SPD.get(vid, 0.95), os.path.join(OUT, f'{vid}_k.wav'))
    print('DONE kokoro')
else:
    import torchaudio as ta, torch
    from chatterbox.tts import ChatterboxTTS
    model = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
    ref = os.path.join(OUT, '_ref_commander.wav')
    for vid, (who, text) in LINES.items():
        if who != 'COMMANDER': continue
        ex, cfg = EMO.get(vid, (0.5, 0.4))
        for take in range(2):
            wav = model.generate(text, audio_prompt_path=ref, exaggeration=ex, cfg_weight=cfg)
            ta.save(os.path.join(OUT, f'{vid}_{take}.wav'), wav, model.sr); print('ok', vid, take)
    print('DONE chatter')
