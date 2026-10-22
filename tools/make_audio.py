"""단어장(js/data/words.js)의 단어 + 칭찬 멘트를 mp3 로 만들어 assets/audio 에 저장합니다. (새 단어 추가 후 실행)
사용: pip install edge-tts  →  프로젝트 폴더에서  python tools/make_audio.py
이미 있는 파일은 건너뜁니다. 다시 만들려면 해당 mp3 를 지우세요.
목소리: 한국어 ko-KR-SunHiNeural, 영어(알파벳) en-US-AnaNeural, 속도 -10%, 높낮이 기본
"""
import asyncio, re, pathlib
import edge_tts
VOICE, RATE, PITCH = "ko-KR-SunHiNeural", "-10%", "+0Hz"
words = []
for line in open("js/data/words.js", encoding="utf8"):
    m = re.match(r"\s*-\s*\S+\s*:\s*(.+)", line)
    for x in (re.split("[,，]", m.group(1)) if m else []):
        x = x.strip()
        if re.fullmatch("[가-힣]+", x) and x not in words: words.append(x)
NUM = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"]; eun = lambda w: "은" if (ord(w[-1]) - 0xAC00) % 28 else "는"   # 받침 있으면 은, 없으면 는
CNT = ["", "한 개", "두 개", "세 개", "네 개", "다섯 개", "여섯 개", "일곱 개", "여덟 개", "아홉 개"]
math = {}
# --- 숫자 공부: 문제 한 개를 통째로 만들지 않고 짧은 조각을 만들어 js/math.js 가 이어 붙여 읽습니다 ---
#   n_1~n_20 = 일~이십, ne_1~ne_9 = 일은·이는…(문제 마지막 수 + 은/는), n_plus = 더하기, n_minus = 빼기
NUM20 = NUM + ["십", "십일", "십이", "십삼", "십사", "십오", "십육", "십칠", "십팔", "십구", "이십"]
for i in range(1, 21): math[f"n_{i}"] = NUM20[i]
for i in range(1, 10): math[f"ne_{i}"] = NUM20[i] + eun(NUM20[i])
math["n_plus"] = "더하기"; math["n_minus"] = "빼기"
for n in range(11):
    math[f"_res_{n}"] = "열 개 모두 맞았어요! 최고예요!" if n == 10 else "괜찮아요, 다시 한번 해 볼까요?" if n == 0 else f"열 개 중에 {CNT[n]} 맞았어요!"
# --- 시계 ---
HW = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두"]
MW = {0: "영", 5: "오", 10: "십", 15: "십오", 20: "이십", 25: "이십오", 30: "삼십", 35: "삼십오", 40: "사십", 45: "사십오", 50: "오십", 55: "오십오"}
clock = {"c_q_hour": "지금 몇 시일까요?", "c_q_min": "긴 바늘은 몇 분을 가리킬까요?"}
clock["c_q_all"] = "지금 몇 시 몇 분일까요?"
# 종합: 정답은 조각을 이어 읽음 — ct_h_N = "세 시", ct_m_M = "십오 분이에요" / ct_m_0 = "정각이에요"
for h in range(1, 13): clock[f"ct_h_{h}"] = f"{HW[h]} 시"
for m, w in MW.items(): clock[f"ct_m_{m}"] = "정각이에요" if m == 0 else f"{w} 분이에요"
for h in range(1, 13): clock[f"c_h_{h}"] = f"{HW[h]} 시예요!"
for m, w in MW.items(): clock[f"c_m_{m}"] = "영 분, 정각이에요!" if m == 0 else f"{w} 분이에요!"
# --- 놀이(짝 맞추기/패턴/때 알기): node tools/play_jobs.js 가 js/data/play.js 에서 문장 목록을 뽑아옴 ---
import json, subprocess
play = json.loads(subprocess.run(["node", "tools/play_jobs.js"], capture_output=True, text=True, encoding="utf8").stdout or "{}")
# --- 알파벳 (영어 목소리: 아이 목소리 AnaNeural) : en_A = 알파벳 이름, enw_A = 단어 ---
EN_SAY = {"A": "Ay.", "B": "Bee.", "C": "See.", "D": "Dee.", "E": "Ee.", "F": "Eff.", "G": "Jee.", "H": "Aitch.", "I": "Eye.", "J": "Jay.", "K": "Kay.", "L": "El.", "M": "Em.", "N": "En.", "O": "Oh.", "P": "Pee.", "Q": "Cue.", "R": "Are.", "S": "Ess.", "T": "Tee.", "U": "You.", "V": "Vee.", "W": "Double you.", "X": "Ex.", "Y": "Why.", "Z": "Zee."}
EN_WORD = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ", ["Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Grapes", "Hat", "Ice cream", "Juice", "Kite", "Lion", "Monkey", "Nose", "Orange", "Pig", "Queen", "Rabbit", "Sun", "Tiger", "Umbrella", "Violin", "Watermelon", "Xylophone", "Yo-yo", "Zebra"]))
EN_VOICE = "en-US-AnaNeural"
english = {f"en_{k}": v for k, v in EN_SAY.items()} | {f"enw_{k}": v for k, v in EN_WORD.items()}
jobs = math | clock | play | english | {w: w for w in words} | {"_praise0": "잘했어요!", "_praise1": "맞았어요!", "_praise2": "최고예요!", "_praise3": "대단해요!", "_retry": "다시 들어볼까요?", "_retry2": "다시 생각해 볼까요?"}
out = pathlib.Path("assets/audio"); out.mkdir(parents=True, exist_ok=True)
async def main():
    for name, text in jobs.items():
        p = out / f"{name}.mp3"
        if p.exists(): continue
        v = EN_VOICE if name.startswith("en") else VOICE
        await edge_tts.Communicate(text, v, rate=RATE, pitch=PITCH).save(str(p)); print("만듦:", p)
asyncio.run(main())
