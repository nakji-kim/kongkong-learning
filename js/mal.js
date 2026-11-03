// 끝말잇기 (한글) : 쉬움 = 그림 이어 고르기 · 보통 = 글자 보고 고르기 · 어려움 = 빈칸(가운데 그림) 채우기
const MAL_LOCAL = {"Airplane": "Airplane.svg", "Bear": "Bear.svg", "Bird": "Bird.svg", "Bus": "Bus.svg", "Cake": "Cake.svg", "Chicken": "Chicken.svg", "Cow": "Cow.svg", "Dinosaur": "Dinosaur.svg", "Donut": "Donut.svg", "Ear": "Ear.svg", "Eye": "Eye.svg", "Fire": "Fire.svg", "Flower": "Flower.svg", "Fox": "Fox.svg", "Gift": "Gift.svg", "Guitar": "Guitar.svg", "Heart": "Heart.svg", "House": "House.svg", "Kangaroo": "Kangaroo.svg", "Koala": "Koala.svg", "Ladybug": "Ladybug.svg", "Leaf": "Leaf.svg", "Milk": "Milk.svg", "Moon": "Moon.svg", "Nose": "Nose.svg", "Nut": "Nut.svg", "Octopus": "Octopus.svg", "Orange": "Orange.svg", "Panda": "Panda.svg", "Pencil": "Pencil.svg", "Penguin": "Penguin.svg", "Queen": "Queen.svg", "Robot": "Robot.svg", "Rocket": "Rocket.svg", "Rose": "Rose.svg", "Shoes": "Shoes.svg", "Snake": "Snake.svg", "Snowman": "Snowman.svg", "Strawberry": "Strawberry.svg", "Tomato": "Tomato.svg", "Train": "Train.svg", "Turtle": "Turtle.svg", "Watch": "Watch.svg", "Worm": "Worm.svg", "Xylophone": "Xylophone.svg", "Yellow": "Yellow.svg", "Zero": "Zero.svg", "거머리": "거머리.svg", "고무": "고무.svg", "과자": "과자.svg", "구슬": "구슬.svg", "그네": "그네.svg", "그물": "그물.svg", "기저귀": "기저귀.svg", "김치": "김치.svg", "꼬리": "꼬리.svg", "놀이터": "놀이터.svg", "다리미": "다리미.svg", "더덕": "더덕.svg", "도깨비": "도깨비.svg", "도마": "도마.svg", "두꺼비": "두꺼비.svg", "두더지": "두더지.svg", "두부": "두부.svg", "마차": "마차.svg", "머리": "머리.svg", "머리띠": "머리띠.svg", "멸치": "멸치.svg", "모래": "모래.svg", "무": "무.svg", "무릎": "무릎.svg", "미끄럼틀": "미끄럼틀.svg", "미역": "미역.svg", "보리": "보리.svg", "보물": "보물.svg", "보자기": "보자기.svg", "부채": "부채.svg", "사진": "사진.svg", "서랍": "서랍.svg", "소풍": "소풍.svg", "수건": "수건.svg", "스티커": "스티커.svg", "시소": "시소.svg", "어깨": "어깨.svg", "어항": "어항.svg", "유리": "유리.svg", "이마": "이마.svg", "이불": "이불.svg", "이쑤시개": "이쑤시개.svg", "자두": "자두.svg", "저금통": "저금통.svg", "제비": "제비.svg", "조개": "조개.svg", "조끼": "조끼.svg", "조랑말": "조랑말.svg", "주머니": "주머니.svg", "지갑": "지갑.svg", "지우개": "지우개.svg", "처마": "처마.svg", "초가집": "초가집.svg", "치마": "치마.svg", "치약": "치약.svg", "커튼": "커튼.svg", "쿠션": "쿠션.svg", "쿠키": "쿠키.svg", "타월": "타월.svg", "타조": "타조.svg", "터널": "터널.svg", "투구": "투구.svg", "파자마": "파자마.svg", "포크레인": "포크레인.svg", "피리": "피리.svg", "하늘": "하늘.svg", "하모니카": "하모니카.svg", "허리": "허리.svg", "허수아비": "허수아비.svg", "호두": "호두.svg", "호수": "호수.svg", "휴지": "휴지.svg"};
const _malHas = w => !!(MAL_LOCAL[w] || (typeof EMOJI !== 'undefined' && EMOJI[w]));
const _malImg = (w, cls = '') => MAL_LOCAL[w] ? `<img class="${cls}" alt="" src="assets/images/${encodeURI(MAL_LOCAL[w])}">` : pimg(EMOJI[w], cls);
const _malJosa = ch => { const b = (ch.charCodeAt(0) - 0xAC00) % 28; return b === 0 || b === 8 ? '로' : '으로'; };
const _malWords = () => [...new Set(Words.list.map(x => x.w))].filter(_malHas);
App.malMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '쉬움', t: '그림 이어 고르기', bg: '#b8e6a1', go: () => this.malGame(1) },
    { b: '보통', t: '글자 보고 고르기', bg: '#ffd166', go: () => this.malGame(2) },
    { b: '어려움', t: '빈칸 채우기', bg: '#d9c8f5', go: () => this.malGame(3) },
  ], () => this.hangulHome(), 'mal', '📖 한글 · 끝말잇기');
};
App.malGame = function (level) {
  const ws = _malWords(), first = {};
  ws.forEach(w => (first[w[0]] = first[w[0]] || []).push(w));
  const nexts = (a, ex = []) => (first[a.at(-1)] || []).filter(b => b !== a && !ex.includes(b));
  let ids = [];
  if (level < 3) ws.forEach(a => nexts(a).forEach(b => ids.push(a + '>' + b)));
  else ws.forEach(a => nexts(a).forEach(b => nexts(b, [a]).forEach(c => ids.push([a, b, c].join('>')))));
  const key = 'mal' + level, hl = (w) => `${w.slice(0, -1)}<b class="malhl">${w.at(-1)}</b>`;
  const decoys = (need, ex, n = 3) => _shuf(ws.filter(w => w[0] !== need && !ex.includes(w))).slice(0, n);
  const make = () => {
    const id = App.pickNew(key, ids, { random: true }), [a, b, c] = id.split('>');
    if (level === 3) {
      const opts = _shuf([b, ...decoys(a.at(-1), [a, b, c])]);
      return {
        key: 'ml:' + id, done: [key, id], answer: b, q: ['빈칸에 들어갈 말을 찾아요!', 'mal_q3'], once: true,
        a: [[a, a], [b, b], [c, c]],
        stage: `<div class="malrow"><div class="malit">${_malImg(a)}<span>${a}</span></div><i>→</i><div class="malit q"><span class="malq">?</span></div><i>→</i><div class="malit">${_malImg(c)}<span>${c}</span></div></div>`,
        reveal: root => { const q = root.querySelector('.malit.q'); if (q) q.innerHTML = `${_malImg(b)}<span>${b}</span>`; },
        choices: opts.map(x => ({ id: x, cls: 'pimg', html: _malImg(x) })),
      };
    }
    const opts = _shuf([b, ...decoys(a.at(-1), [a, b])]);
    return {
      key: 'ml:' + id, done: [key, id], answer: b, q: [`${a}, ${a.at(-1)}${_malJosa(a.at(-1))} 시작하는 말을 찾아요!`, 'mal_q_' + a], once: true,
      a: [[a, a], [b, b]],
      stage: `<div class="malit big">${_malImg(a)}${level === 2 ? `<span>${hl(a)}</span>` : ''}</div>`,
      choices: opts.map(x => level === 1 ? { id: x, cls: 'pimg', html: _malImg(x) } : { id: x, cls: 'wide', html: x }),
    };
  };
  this.quiz(make, () => App.malGame(level), () => App.malMenu(), 'mal', App.roundSize(key, ids));
};
