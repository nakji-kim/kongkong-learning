"""ElevenLabs 로 알파벳 음성(en_<글자>.mp3 = 글자 이름, enw_<글자>.mp3 = 단어)을 만듭니다.
글자 이름은 "The letter A." 문장을 읽힌 뒤 타임스탬프로 글자 부분만 잘라 저장합니다(짧은 단독 발음보다 또렷함).
사용: ELEVEN_KEY=sk_... python tools/eleven_letters.py A B C D [--out 폴더]   (ffmpeg 필요)"""
import base64, json, os, subprocess, sys, urllib.request, ssl
KEY = os.environ["ELEVEN_KEY"]; VOICE = os.environ.get("ELEVEN_VOICE", "cgSgspJ2msm6clMCkdW9")   # Jessica (밝고 따뜻한 여성)
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2")
CA = "/root/.ccr/ca-bundle.crt"; ctx = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else None
WORDS = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ", ["Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Grapes", "Hat", "Ice cream", "Juice", "Kite", "Lion", "Monkey", "Nose", "Orange", "Pig", "Queen", "Rabbit", "Sun", "Tiger", "Umbrella", "Violin", "Watermelon", "Xylophone", "Yo-yo", "Zebra"]))
args = [a for a in sys.argv[1:] if not a.startswith("--")]; PR = "--praise" in sys.argv; out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "assets/audio"
if "--out" in sys.argv: args.remove(out)
def tts(text, with_ts=False):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}" + ("/with-timestamps" if with_ts else "") + "?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": {"stability": 0.6, "similarity_boost": 0.8, "style": 0.2, "speed": 0.85}}).encode()
    r = urllib.request.urlopen(urllib.request.Request(url, body, {"xi-api-key": KEY, "Content-Type": "application/json"}), context=ctx).read()
    return json.loads(r) if with_ts else r
def letter(L):
    d = tts(f"The letter {L}.", True); al = d["alignment"]; i = len("The letter ")
    st, en = al["character_start_times_seconds"][i], al["character_end_times_seconds"][i]
    tmp = f"{out}/_{L}.mp3"; open(tmp, "wb").write(base64.b64decode(d["audio_base64"]))
    s = max(0, st - 0.06); dur = (en - st) + 0.42
    subprocess.run(["ffmpeg", "-y", "-loglevel", "quiet", "-ss", f"{s:.3f}", "-t", f"{dur:.3f}", "-i", tmp, "-af", f"afade=t=in:d=0.015,afade=t=out:st={max(0, dur - 0.15):.3f}:d=0.15,loudnorm=I=-18:TP=-2", "-ar", "44100", f"{out}/en_{L}.mp3"], check=True); os.remove(tmp)
def word(L): open(f"{out}/enw_{L}.mp3", "wb").write(tts(WORDS[L]))
os.makedirs(out, exist_ok=True)
if args == ["ALL"]: args = list(WORDS)
for L in args: letter(L); word(L); print("만듦:", L, WORDS[L])
if "--praise" in sys.argv:   # 영어 칭찬 4개
    for i, t in enumerate(["Good job!", "Great!", "Well done!", "Awesome!"]): open(f"{out}/en_praise{i}.mp3", "wb").write(tts(t)); print("만듦:", t)
