// 공룡 : 쉬움 = 이름을 듣고 그림 고르기 · 어려움 = 그림자를 보고 이름 고르기 (그림: TotalDino, Wikimedia Commons)
const DINOS = [
  ['trex', '티라노사우루스'], ['tri', '트리케라톱스'], ['steg', '스테고사우루스'], ['brach', '브라키오사우루스'],
  ['velo', '벨로시랍토르'], ['pter', '프테라노돈'], ['anky', '안킬로사우루스'], ['spino', '스피노사우루스'],
  ['para', '파라사우롤로푸스'], ['diplo', '디플로도쿠스'], ['apato', '아파토사우루스'], ['giga', '기가노토사우루스'],
  ['allo', '알로사우루스'], ['carno', '카르노타우루스'], ['igua', '이구아노돈'], ['pachy', '파키케팔로사우루스'],
  ['dilo', '딜로포사우루스'], ['ther', '테리지노사우루스'], ['prot', '프로토케라톱스'], ['ovir', '오비랍토르'],
  ['styr', '스티라코사우루스'], ['arg', '아르헨티노사우루스'], ['dein', '데이노니쿠스'], ['cory', '코리토사우루스'],
];
const _dimg = (k, cls = '') => `<img class="${cls}" alt="" src="assets/images/dino/${k}.png">`;
App.dinoMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '쉬움', t: '이름 듣고 그림 고르기', bg: '#b8e6a1', go: () => this.dinoGame(1) },
    { b: '어려움', t: '그림자 보고 이름 고르기', bg: '#d9c8f5', go: () => this.dinoGame(2) },
  ], () => this.home(), 'dino', '🦖 공룡');
};
App.dinoGame = function (level) {
  const ids = DINOS.map(d => d[0]), nm = Object.fromEntries(DINOS), key = 'dino' + level;
  const make = () => {
    const k = App.pickNew(key, ids, { random: true }), wrong = _shuf(ids.filter(x => x !== k)).slice(0, 3);
    const opts = _shuf([k, ...wrong]);
    if (level === 1) return {
      key: 'dn:' + k, done: [key, k], answer: k, q: [nm[k], 'dn_' + k], a: [],
      stage: `<button class="chip big" id="again-q">🔊 다시 듣기</button>`,
      choices: opts.map(x => ({ id: x, cls: 'dn', html: _dimg(x) })),
    };
    return {
      key: 'dn:' + k, done: [key, k], answer: k, q: ['그림자는 어떤 공룡일까요?', 'dn_q_shadow'], once: true,
      a: [[nm[k], 'dn_' + k]],
      stage: `<div class="dnshadow">${_dimg(k, 'dnsh')}</div>`,
      reveal: root => { const s = root.querySelector('.dnsh'); if (s) s.classList.add('lit'); },
      choices: opts.map(x => ({ id: x, cls: 'wide', html: nm[x] })),
    };
  };
  this.quiz(make, () => App.dinoGame(level), () => App.dinoMenu(), level === 1 ? 'dn1' : 'dn2', App.roundSize(key, ids));
};
