// 알파벳 대표 그림. [글자, 영어 단어, 이모지코드(없으면 ''), 한글 뜻]
// 그림 파일 assets/images/단어.svg (예: Apple.svg) 가 있으면 이모지보다 우선합니다.
// 음성 파일: assets/audio/en_A.mp3 (알파벳 이름), enw_A.mp3 (단어)  — tools/make_audio.py 가 만듭니다.
const ALPHA = [
  ['A', 'Apple', '1f34e', '사과'], ['B', 'Ball', '26bd', '공'], ['C', 'Cat', '1f431', '고양이'], ['D', 'Dog', '1f436', '강아지'],
  ['E', 'Egg', '1f95a', '달걀'], ['F', 'Fish', '1f41f', '물고기'], ['G', 'Grapes', '1f347', '포도'], ['H', 'Hat', '1f452', '모자'],
  ['I', 'Ice cream', '1f368', '아이스크림'], ['J', 'Juice', '1f9c3', '주스'], ['K', 'Kite', '1fa81', '연'], ['L', 'Lion', '1f981', '사자'],
  ['M', 'Monkey', '1f412', '원숭이'], ['N', 'Nose', '1f443', '코'], ['O', 'Orange', '1f34a', '오렌지'], ['P', 'Pig', '1f437', '돼지'],
  ['Q', 'Queen', '', '여왕'], ['R', 'Rabbit', '1f430', '토끼'], ['S', 'Sun', '2600', '해'], ['T', 'Tiger', '1f42f', '호랑이'],
  ['U', 'Umbrella', '2602', '우산'], ['V', 'Violin', '1f3bb', '바이올린'], ['W', 'Watermelon', '1f349', '수박'], ['X', 'Xylophone', '', '실로폰'],
  ['Y', 'Yo-yo', '1fa80', '요요'], ['Z', 'Zebra', '1f993', '얼룩말']
].map(([L, word, e, ko]) => ({ L, word, e, ko }));
// 글자마다 두 번째 단어 (그림은 이모지/assets/images, 음성은 assets/audio/enw2_<글자>.mp3). 1단계에서 둘 중 하나가 무작위로 나옵니다.
const ALPHA2 = { A: ['Ant', '1f41c', '개미'], B: ['Banana', '1f34c', '바나나'], C: ['Car', '1f697', '자동차'], D: ['Duck', '1f986', '오리'], E: ['Elephant', '1f418', '코끼리'], F: ['Frog', '1f438', '개구리'], G: ['Giraffe', '1f992', '기린'], H: ['Horse', '1f434', '말'], I: ['Island', '1f3dd', '섬'], J: ['Jellyfish', '1fabc', '해파리'], K: ['Key', '1f511', '열쇠'], L: ['Lemon', '1f34b', '레몬'], M: ['Mouse', '1f42d', '쥐'], N: ['Nest', '1faba', '둥지'], O: ['Owl', '1f989', '부엉이'], P: ['Pizza', '1f355', '피자'], Q: ['Question', '2753', '물음표'], R: ['Rainbow', '1f308', '무지개'], S: ['Star', '2b50', '별'], T: ['Tree', '1f332', '나무'], U: ['Unicorn', '1f984', '유니콘'], V: ['Volcano', '1f30b', '화산'], W: ['Whale', '1f433', '고래'], Y: ['Yellow', '', '노랑'], Z: ['Zero', '', '영'] };
ALPHA.forEach(a => { const t = ALPHA2[a.L]; if (t) a.w2 = { word: t[0], e: t[1], ko: t[2] }; });   // X·Y는 단어 하나만
const alphaVariant = a => (!a.w2 || Math.random() < 0.5 ? { ...a, snd: 'enw_' + a.L } : { ...a, ...a.w2, snd: 'enw2_' + a.L });   // 두 단어 중 하나를 무작위로
const ALPHA_GROUPS = [['A~G', 'ABCDEFG'], ['H~N', 'HIJKLMN'], ['O~U', 'OPQRSTU'], ['V~Z', 'VWXYZ'], ['전체', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ']];

// 알파벳 공부의 영어 칭찬 / 결과 음성 (문제 수 = 묶음의 글자 수)
const KCNT = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스무', '스물한', '스물두', '스물세', '스물네', '스물다섯', '스물여섯'];
const EN_PRAISE = ['Good job!', 'Great!', 'Well done!', 'Awesome!'];
const AL_LINES = { al_res_all: '모두 맞았어요! 최고예요!' };
EN_PRAISE.forEach((t, i) => { AL_LINES['en_praise' + i] = t; });
for (let i = 1; i <= 26; i++) AL_LINES['al_res_' + i] = `${KCNT[i]} 개 맞았어요!`;
