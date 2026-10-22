// 놀이 학습(짝 맞추기 / 패턴 / 때 알기)에서 쓰는 그림 목록과 음성 문장. 그림은 Twemoji(코드) 입니다.
const PITEMS = [
  ['apple', '1f34e', '사과'], ['banana', '1f34c', '바나나'], ['strawberry', '1f353', '딸기'], ['grapes', '1f347', '포도'], ['watermelon', '1f349', '수박'],
  ['butterfly', '1f98b', '나비'], ['fish', '1f41f', '물고기'], ['duck', '1f986', '오리'], ['car', '1f697', '자동차'], ['plane', '2708', '비행기'],
  ['train', '1f682', '기차'], ['bus', '1f68c', '버스'], ['tree', '1f333', '나무'], ['house', '1f3e0', '집'], ['umbrella', '2602', '우산'],
  ['star', '2b50', '별'], ['elephant', '1f418', '코끼리'], ['giraffe', '1f992', '기린'], ['turtle', '1f422', '거북이'], ['snail', '1f40c', '달팽이'],
  ['bird', '1f426', '새'], ['whale', '1f433', '고래'], ['octopus', '1f419', '문어'], ['crab', '1f980', '게'],
  ['dog', '1f436', '강아지'], ['cat', '1f431', '고양이'], ['rabbit', '1f430', '토끼'], ['bear', '1f43b', '곰'],
].map(([k, code, ko]) => ({ k, code, ko }));
const PBYK = Object.fromEntries(PITEMS.map(i => [i.k, i]));
// 패턴에 쓰는 묶음
const PAT_THEMES = [
  ['1f534', '1f535', '1f7e1', '1f7e2', '1f7e3', '1f7e0'],      // 동그라미 색
  ['1f7e5', '1f7e6', '1f7e8', '1f7e9', '1f7ea', '1f7e7'],      // 네모 색
  ['1f34e', '1f34c', '1f353', '1f347', '1f349'],                // 과일
  ['1f436', '1f431', '1f430', '1f43b', '1f986'],                // 동물
  ['1f697', '1f68c', '1f682', '2708', '1f6b2'],                 // 탈것
];
const PAT_LEVELS = [[[0, 1]], [[0, 0, 1], [0, 1, 1]], [[0, 1, 2]]];   // 단계별 반복 규칙

const CNT_KO = ['', '한 개', '두 개', '세 개', '네 개', '다섯 개'];

const PLAY_LINES = {
  p_q_pair: '같은 그림을 두 개 찾아요!', p_q_odd: '다른 그림을 찾아요!', p_q_match: '어울리는 짝을 찾아요!', p_q_hide: '숨은 그림을 찾아요!', p_q_pat: '다음에 올 그림은 무엇일까요?',
};
PITEMS.forEach(i => { PLAY_LINES['p_it_' + i.k] = i.ko; });
for (let i = 1; i <= 5; i++) PLAY_LINES['p_ms_' + i] = i === 5 ? '별을 다섯 개 모두 받았어요! 최고예요!' : `별을 ${CNT_KO[i]} 받았어요!`;

/* ---------- 새 놀이 데이터 : 다른 그림 / 어울리는 그림 / 숨은 그림 ---------- */
// 닮은 그림 (다른 그림 찾기 어려움 단계) : 이름 음성이 필요한 새 그림은 PXTRA 에 있음
const PXTRA = [['tomato', '1f345', '토마토'], ['wolf', '1f43a', '늑대'], ['tiger', '1f42f', '호랑이'], ['squid', '1f991', '오징어'], ['panda', '1f43c', '판다'], ['cherry', '1f352', '체리'], ['mouse', '1f42d', '쥐']].map(([k, code, ko]) => ({ k, code, ko }));
PXTRA.forEach(i => { PBYK[i.k] = i; PLAY_LINES['p_it_' + i.k] = i.ko; });
const ODD_LOOK = [['apple', 'tomato'], ['dog', 'wolf'], ['cat', 'tiger'], ['octopus', 'squid'], ['bear', 'panda'], ['strawberry', 'cherry'], ['rabbit', 'mouse']];
const ODD_GROUPS = {
  fruit: ['apple', 'banana', 'strawberry', 'grapes', 'watermelon'],
  animal: ['butterfly', 'fish', 'duck', 'elephant', 'giraffe', 'turtle', 'snail', 'bird', 'whale', 'octopus', 'crab', 'dog', 'cat', 'rabbit', 'bear'],
  vehicle: ['car', 'plane', 'train', 'bus'],
  thing: ['tree', 'house', 'umbrella', 'star'],
};
// 어울리는 짝 : [왼쪽 이름, 코드, 한글, 오른쪽 이름, 코드, 한글, 묶음]  (묶음이 같으면 어려움에서 서로 헷갈리는 보기로 씀)
const MATCH_PAIRS = [
  ['rabbit', '1f430', '토끼', 'carrot', '1f955', '당근', 'A'], ['monkey', '1f412', '원숭이', 'banana', '1f34c', '바나나', 'A'], ['dog', '1f436', '강아지', 'bone', '1f9b4', '뼈', 'A'],
  ['cat', '1f431', '고양이', 'fish', '1f41f', '생선', 'A'], ['bear', '1f43b', '곰', 'honey', '1f36f', '꿀', 'A'], ['bee', '1f41d', '벌', 'flower', '1f33b', '꽃', 'A'],
  ['bird', '1f426', '새', 'nest', '1faba', '둥지', 'B'], ['hen', '1f414', '닭', 'egg', '1f95a', '달걀', 'B'], ['cow', '1f42e', '젖소', 'milk', '1f95b', '우유', 'B'], ['spider', '1f577', '거미', 'web', '1f578', '거미줄', 'B'],
  ['sock', '1f9e6', '양말', 'shoe', '1f45f', '신발', 'C'], ['key', '1f511', '열쇠', 'lock', '1f512', '자물쇠', 'C'], ['rain', '1f327', '비', 'umbrella', '2602', '우산', 'C'],
  ['scissors', '2702', '가위', 'paper', 'svg:paper', '종이', 'D'], ['colorpencil', 'svg:colorpencil', '색연필', 'sketchbook', 'svg:sketchbook', '스케치북', 'D'], ['mailbox', '1f4ee', '우체통', 'letter', '2709', '편지', 'D'], ['camera', '1f4f7', '카메라', 'photo', '1f5bc', '사진', 'D'],
  ['toothbrush', '1faa5', '칫솔', 'tooth', 'svg:tooth', '치아', 'E'], ['cake', 'svg:cake', '케이크', 'candle', 'svg:candle', '초', 'E'], ['spoon', '1f944', '숟가락', 'rice', '1f35a', '밥', 'E'],
];
const _batch = w => (w.charCodeAt(w.length - 1) - 0xAC00) % 28;   // 받침 있으면 0 이 아님
const matchLine = (a, b) => `${a}${_batch(a) ? '과' : '와'} ${b}${_batch(b) ? '은' : '는'}`;   // 앞부분만 녹음 · 뒤의 "짝꿍이에요!" 는 p_mt_end 한 개를 공통으로 붙여 읽음
MATCH_PAIRS.forEach((p, i) => { PLAY_LINES['p_mt_' + i] = matchLine(p[2], p[5]); });
PLAY_LINES.p_mt_end = '짝꿍이에요!';
// 숨은 그림 장면 : 목표(PITEMS 키)와 배경에 흩어 놓는 그림
const HIDE_SCENES = [
  { id: 'sea', bg: 'linear-gradient(#c9efff,#59b4ec 70%,#f4dca0 70%,#f0cf86)', targets: ['fish', 'whale', 'octopus', 'crab', 'turtle'], clutter: ['1f41a', '1f33f', '1fae7', '1f41a', '1f33f'] },
  { id: 'garden', bg: 'linear-gradient(#d8f4ff 0,#e9fbd4 35%,#a6e08c)', targets: ['butterfly', 'bird', 'snail', 'apple', 'strawberry', 'duck'], clutter: ['1f33c', '1f337', '1f33b', '1f33f', '1f340', '1f338', '1f343'] },
  { id: 'town', bg: 'linear-gradient(#bfe6ff 0,#e6f6ff 55%,#cfd6dc 55%,#b9c1c8)', targets: ['car', 'bus', 'train', 'plane', 'house', 'umbrella'], clutter: ['1f333', '2601', '1f3e2', '1f6a6', '1f333', '1f3e2'] },
  { id: 'forest', bg: 'linear-gradient(#dff6e0 0,#b8e0a0 55%,#9cc87c)', targets: ['bear', 'rabbit', 'dog', 'cat', 'bird', 'butterfly'], clutter: ['1f332', '1f344', '1f342', '1f330', '1f333', '1f33f', '1f341'] },
];
