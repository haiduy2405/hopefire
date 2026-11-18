# One-time setup of free, commercially-usable TTS on Duy's PC (RTX 3060 Ti).
#   Kokoro-82M (Apache-2.0)  -> HOPE (ship AI)
#   Chatterbox (MIT, emotion control) -> COMMANDER
# Installs into D:\AI\hopefire_tts (outside the repo). Log: D:\AI\hopefire_tts\setup.log
$ErrorActionPreference = 'Continue'
$base = 'D:\AI\hopefire_tts'; New-Item -ItemType Directory -Force $base | Out-Null
$log = "$base\setup.log"; "start $(Get-Date)" | Out-File $log
function step($m){ "== $m $(Get-Date)" | Tee-Object -FilePath $log -Append }
step 'kokoro venv'
py -3.11 -m venv "$base\kokoro" *>> $log
& "$base\kokoro\Scripts\python.exe" -m pip install -U pip *>> $log
& "$base\kokoro\Scripts\pip.exe" install torch --index-url https://download.pytorch.org/whl/cu121 *>> $log
& "$base\kokoro\Scripts\pip.exe" install "kokoro>=0.9" soundfile *>> $log
step 'chatterbox venv'
py -3.11 -m venv "$base\chatter" *>> $log
& "$base\chatter\Scripts\python.exe" -m pip install -U pip *>> $log
& "$base\chatter\Scripts\pip.exe" install chatterbox-tts *>> $log
& "$base\chatter\Scripts\pip.exe" install --force-reinstall torch torchaudio --index-url https://download.pytorch.org/whl/cu121 *>> $log
step 'check'
& "$base\kokoro\Scripts\python.exe" -c "import torch,kokoro;print('kokoro ok cuda',torch.cuda.is_available())" *>> $log
& "$base\chatter\Scripts\python.exe" -c "import torch;from chatterbox.tts import ChatterboxTTS;print('chatterbox ok cuda',torch.cuda.is_available())" *>> $log
step 'DONE'
