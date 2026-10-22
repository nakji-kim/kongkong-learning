# 콩콩 배움놀이 (한글 편)
정적 사이트입니다(빌드 불필요). 폴더의 index.html 을 열거나 Vercel 에 배포하세요.

## 내가 관리하는 곳
- 단어: js/data/words.js (형식: - 가 : 가위, 가방). 앱의 '✏️ 단어' 화면에서도 수정 가능(이 기기에만 저장 → 복사하기로 words.js 에 붙여넣으면 영구 반영)
- 그림: assets/images/단어.svg|png|webp|jpg  (있으면 이모지보다 우선)
- 음성: assets/audio/단어.mp3  (있으면 기기 음성보다 우선)

## 음성
assets/audio/ 에 한국어 원어민 음성(SunHi, mp3)이 들어 있습니다. 새 단어를 추가하면 `pip install edge-tts` 후 `python tools/make_audio.py` 로 새 단어만 만들 수 있습니다. 마음에 안 드는 단어는 앱의 🎙 녹음으로 직접 녹음하면 우선 재생됩니다.

## 가장 쉬운 방법: 앱에서 바로 녹음
모음 선택 화면 → 🎙 녹음 (https 주소 또는 localhost 에서 마이크 허용 필요). 이 기기에만 저장되며 기기 음성보다 우선 재생됩니다.

## 숫자 (더하기)
js/math.js — 두 수 1~9, 합 9 이하. 한글·숫자 모두 10문제마다 별 결과 화면. 숫자 음성은 assets/audio/m_q_*.mp3, m_a_*.mp3, _res_*.mp3 (tools/make_audio.py 로 생성).

숫자 더하기 현재 단계: 더하는 수 1~3, 합 6 이하 (js/math.js 맨 위 MAX_ADDEND, MAX_SUM).
