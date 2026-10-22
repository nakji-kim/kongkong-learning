"""알파벳 음성의 앞뒤 정적을 잘라내고, "글자 이름"과 "단어" 사이 침묵을 GAP 초로 통일합니다.
 침묵 = 앱의 기본 간격(0.3초) + 단어 파일 앞에 넣은 정적.
사용: python tools/audio_tidy.py [GAP=0.8]   (ffmpeg 필요, assets/audio/en_?.mp3 / enw_?.mp3 를 덮어씀 — 원본은 assets/audio_alt/ 에 보관 후 실행하세요)"""
import subprocess, sys, string, os
GAP = float(sys.argv[1]) if len(sys.argv) > 1 else 0.8
CODE_GAP, D = 0.3, "assets/audio"
TRIM = "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.02"
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).strip())
def trim(src, dst, pre=0.0):   # 앞뒤 정적 제거 + 살짝 페이드, pre 초 정적을 앞에 붙임
    af = f"{TRIM},areverse,{TRIM},areverse,afade=t=in:d=0.01,areverse,afade=t=in:d=0.08,areverse"
    if pre > 0: af += f",adelay={int(pre * 1000)}:all=1"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "quiet", "-i", src, "-af", af, dst], check=True)
res = []
for L in string.ascii_uppercase:
    n, w = f"{D}/en_{L}.mp3", f"{D}/enw_{L}.mp3"
    trim(n, "/tmp/_n.mp3"); trim(w, "/tmp/_w.mp3")
    ln, lw = dur("/tmp/_n.mp3"), dur("/tmp/_w.mp3")
    pre = max(0, GAP - CODE_GAP)
    trim(n, "/tmp/_n2.mp3"); trim(w, "/tmp/_w2.mp3", pre); os.replace("/tmp/_n2.mp3", n); os.replace("/tmp/_w2.mp3", w)
    res.append((L, round(ln, 2), round(lw, 2), round(CODE_GAP + pre, 2)))
print("글자, 이름길이, 단어길이, 글자~단어 사이 침묵"); [print(*r) for r in res]
