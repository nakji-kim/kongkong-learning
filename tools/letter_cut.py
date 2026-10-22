"""알파벳 이름이 짧아서 알아듣기 어려울 때: "The letter A." 처럼 문장 속에서 읽힌 뒤 글자 부분만 잘라 en_<글자>.mp3 로 저장합니다.
사용: python tools/letter_cut.py A F H I M N Q R   (edge-tts 와 ffmpeg 필요)"""
import asyncio, subprocess, sys
import edge_tts
import os
VOICE, RATE = "en-US-AnaNeural", "-20%"
OUT = os.environ.get("OUT", "assets/audio")
async def cut(L):
    audio, wb = b"", []
    async for m in edge_tts.Communicate(f"The letter {L}.", VOICE, rate=RATE, pitch="+0Hz", boundary="WordBoundary").stream():
        if m["type"] == "audio": audio += m["data"]
        elif m["type"] == "WordBoundary": wb.append(m)
    tmp = f"{OUT}/_tmp_{L}.mp3"; open(tmp, "wb").write(audio)
    w = wb[-1]; st = max(0, w["offset"] / 1e7 - 0.08); dur = w["duration"] / 1e7 + 0.3
    subprocess.run(["ffmpeg", "-y", "-loglevel", "quiet", "-ss", f"{st:.3f}", "-t", f"{dur:.3f}", "-i", tmp, "-af", f"afade=t=in:d=0.02,afade=t=out:st={max(0, dur - 0.12):.3f}:d=0.12", f"{OUT}/en_{L}.mp3"], check=True)
    import os; os.remove(tmp)
async def main():
    for L in sys.argv[1:]: await cut(L); print("만듦:", L)
asyncio.run(main())
