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
// 글자마다 추가 단어 (그림은 assets/images/<단어>.svg, 음성은 assets/audio/enw3_<단어>.mp3)
const ALPHA_EXTRA = [
  ['A', 'Airplane', '2708', '비행기'],
  ['B', 'Bear', '1f43b', '곰'],
  ['B', 'Bus', '1f68c', '버스'],
  ['B', 'Bird', '1f426', '새'],
  ['C', 'Cow', '1f404', '소'],
  ['C', 'Cake', '1f370', '케이크'],
  ['C', 'Chicken', '1f414', '닭'],
  ['D', 'Dinosaur', '1f996', '공룡'],
  ['D', 'Donut', '1f369', '도넛'],
  ['E', 'Eye', '1f441', '눈'],
  ['E', 'Ear', '1f442', '귀'],
  ['F', 'Flower', '1f338', '꽃'],
  ['F', 'Fire', '1f525', '불'],
  ['F', 'Fox', '1f98a', '여우'],
  ['G', 'Gift', '1f381', '선물'],
  ['G', 'Guitar', '1f3b8', '기타'],
  ['H', 'House', '1f3e0', '집'],
  ['H', 'Heart', '2764', '하트'],
  ['K', 'Kangaroo', '1f998', '캥거루'],
  ['K', 'Koala', '1f428', '코알라'],
  ['L', 'Leaf', '1f343', '나뭇잎'],
  ['L', 'Ladybug', '1f41e', '무당벌레'],
  ['M', 'Moon', '1f319', '달'],
  ['M', 'Milk', '1f95b', '우유'],
  ['N', 'Nut', '1f95c', '땅콩'],
  ['O', 'Octopus', '1f419', '문어'],
  ['P', 'Panda', '1f43c', '판다'],
  ['P', 'Penguin', '1f427', '펭귄'],
  ['P', 'Pencil', '270f', '연필'],
  ['R', 'Rose', '1f339', '장미'],
  ['R', 'Robot', '1f916', '로봇'],
  ['R', 'Rocket', '1f680', '로켓'],
  ['S', 'Snake', '1f40d', '뱀'],
  ['S', 'Shoes', '1f45f', '신발'],
  ['S', 'Strawberry', '1f353', '딸기'],
  ['S', 'Snowman', '26c4', '눈사람'],
  ['T', 'Train', '1f682', '기차'],
  ['T', 'Turtle', '1f422', '거북이'],
  ['T', 'Tomato', '1f345', '토마토'],
  ['W', 'Watch', '231a', '손목시계'],
  ['W', 'Worm', '1fab1', '지렁이']
];
ALPHA.forEach(a => { a.ws = [{ word: a.word, e: a.e, ko: a.ko, snd: 'enw_' + a.L }]; if (a.w2) a.ws.push({ ...a.w2, snd: 'enw2_' + a.L }); });
ALPHA_EXTRA.forEach(([L, word, e, ko]) => ALPHA.find(a => a.L === L).ws.push({ word, e, ko, snd: 'enw3_' + word }));
const alphaVariant = a => { const w = a.ws[Math.floor(Math.random() * a.ws.length)]; return { ...a, ...w }; };   // 글자에 속한 단어 중 하나를 무작위로
const ALPHA_GROUPS = [['A~G', 'ABCDEFG'], ['H~N', 'HIJKLMN'], ['O~U', 'OPQRSTU'], ['V~Z', 'VWXYZ'], ['전체', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ']];

// 알파벳 공부의 영어 칭찬 / 결과 음성 (문제 수 = 묶음의 글자 수)
const KCNT = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스무', '스물한', '스물두', '스물세', '스물네', '스물다섯', '스물여섯'];
const EN_PRAISE = ['Good job!', 'Great!', 'Well done!', 'Awesome!'];
const AL_LINES = { al_res_all: '모두 맞았어요! 최고예요!' };
EN_PRAISE.forEach((t, i) => { AL_LINES['en_praise' + i] = t; });
for (let i = 1; i <= 26; i++) AL_LINES['al_res_' + i] = `${KCNT[i]} 개 맞았어요!`;
