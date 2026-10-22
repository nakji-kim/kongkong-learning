// 숫자 공부 : 더하기 / 빼기 / 종합 × 쉬움 / 어려움. 그림 개수를 세어 정답을 고릅니다.
// 문제 범위는 아래 MPOOL 에서 바꿉니다. 음성은 "하나", "더하기", "둘은" … 짧은 조각(n_*, ne_*)을 이어 붙여 말하므로
// 범위를 바꿔도 새로 만들 음성이 없습니다(숫자 조각은 1~20, 마지막 수 + 은/는 조각은 1~9).
const MNUM = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이', '십삼', '십사', '십오', '십육', '십칠', '십팔', '십구', '이십'];   // 한자어 숫자
const meun = w => ((w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? '은' : '는');   // 받침 있으면 은, 없으면 는
const MPOOL = (() => {
  const R = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const mk = (t, o) => {   // 문제 하나: 수 목록 t, 연산 목록 o('+'/'-'), 정답 s, 저장용 키
    let s = t[0]; o.forEach((x, i) => { s = x === '+' ? s + t[i + 1] : s - t[i + 1]; });
    const kind = o.join('') === '+' ? 'add' : o.join('') === '-' ? 'sub' : o.join('') === '++' ? 'add3' : o.join('') === '--' ? 'sub3' : o.join('') === '+-' ? 'pm3' : 'mp3';
    return { t, o, s, kind, key: kind + ':' + t.map((n, i) => (i ? o[i - 1] : '') + n).join('') };
  };
  const addMid = [], subMid = [], addEasy = [], subEasy = [], addHard = [], subHard = [], pmHard = [], mpHard = [];
  for (const a of R(1, 3)) for (const b of R(1, 3)) if (a + b <= 6) addEasy.push(mk([a, b], ['+']));
  for (const a of R(2, 6)) for (const b of R(1, a - 1)) subEasy.push(mk([a, b], ['-']));
  for (const a of R(1, 9)) for (const b of R(1, 9)) addMid.push(mk([a, b], ['+']));                                                                    // 보통: 두 수 1~9 모두
  for (const a of R(2, 9)) for (const b of R(1, a - 1)) subMid.push(mk([a, b], ['-']));                                                              // 결과 1 이상
  for (const a of R(1, 9)) for (const b of R(a, 9)) for (const c of R(b, 9)) if (a + b + c <= 20) addHard.push(mk([a, b, c], ['+', '+']));                 // 합 20 이하
  for (const a of R(3, 12)) for (const b of R(1, 9)) for (const c of R(b, 9)) if (a - b - c >= 1) subHard.push(mk([a, b, c], ['-', '-']));             // 시작 수 12 이하, 결과 1 이상
  for (const a of R(1, 9)) for (const b of R(a, 9)) for (const c of R(1, 9)) if (a + b - c >= 1) pmHard.push(mk([a, b, c], ['+', '-']));                 // 더하고 빼기
  for (const a of R(2, 12)) for (const b of R(1, Math.min(9, a - 1))) for (const c of R(1, 9)) mpHard.push(mk([a, b, c], ['-', '+']));                // 빼고 더하기
  return {
    add: { easy: addEasy, mid: addMid, hard: addHard }, sub: { easy: subEasy, mid: subMid, hard: subHard },
    mix: { easy: [...addEasy, ...subEasy], mid: [...addMid, ...subMid], hard: [...addHard, ...subHard, ...pmHard, ...mpHard] }
  };
})();
const MTITLE = { add: '더하기', sub: '빼기', mix: '종합' };
const MCARD = { add: ['1＋2', '7＋8', '1＋2＋3'], sub: ['5－2', '9－4', '9－2－3'], mix: ['＋ －', '7＋8 · 9－4', '3＋2－1'] };
const MDESC = {   // 메뉴 카드의 작은 설명 (난이도 차이 안내)
  add: ['두 수 1~3 · 합 6 이하', '두 수 1~9 · 합 최대 18', '세 수 · 합 20 이하'],
  sub: ['6 이하에서 빼기', '9 이하에서 빼기', '세 수 · 12 이하에서 시작'],
  mix: ['더하기·빼기 · 6 이하', '더하기·빼기 · 9 이하', '세 수 섞어서 · 12 이하'] };
const MRANDOM = { add: { easy: true, mid: true, hard: true }, sub: { easy: true, mid: true, hard: true }, mix: { easy: true, mid: true, hard: true } };   // false = 쉬운 것부터 순서대로

App.mathMenu = function (mode) {
  Speech.stop();
  const [e, m, h] = MCARD[mode], [de, dm, dh] = MDESC[mode];
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><div class="crumb">🔢 숫자</div><h1>어떤 난이도로 할까요?</h1>
      <div class="cards">
        <button class="card am" data-k="easy" style="background:#8ddc9b"><b>${e}</b><span>쉬움</span><small class="amd">${de}</small></button>
        <button class="card am" data-k="mid" style="background:#ffd166"><b>${m}</b><span>보통</span><small class="amd">${dm}</small></button>
        <button class="card am" data-k="hard" style="background:#ff9f68"><b>${h}</b><span>어려움</span><small class="amd">${dh}</small></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.numberMenu();
  this.addClr('number');
  this.root.querySelectorAll('.am').forEach(b => b.onclick = () => this.mathGame(mode, b.dataset.k));
};

App.mathGame = function (mode, level = 'easy') {
  const p = this.prof(), root = this.root, hard = level === 'hard', nores = level !== 'easy';
  const pairs = MPOOL[mode][level], KEY = mode + (hard ? '3' : level === 'mid' ? '2' : ''), random = MRANDOM[mode][level];
  const MAXS = Math.max(6, ...pairs.map(x => x.s)) + (hard ? 1 : 0);
  const THEMES = [['1f34e', '1f34c', '1f353', '1f347', '1f34a', '1f349'], ['1f697', '2708', '1f68c', '1f682', '1f680', '1f6b2'], ['1f436', '1f431', '1f430', '1f43b', '1f986', '1f41f']];
  // 음성: 조각을 이어 말함 — "하나"(n_1) "더하기"(n_plus) "둘은"(ne_2) "셋"(n_3)
  const OPW = { '+': ['더하기', 'n_plus'], '-': ['빼기', 'n_minus'] };
  const qParts = q => q.t.flatMap((n, i) => [...(i ? [OPW[q.o[i - 1]]] : []), i === q.t.length - 1 ? [MNUM[n] + meun(MNUM[n]), 'ne_' + n] : [MNUM[n], 'n_' + n]]);
  const aParts = q => [...qParts(q), [MNUM[q.s], 'n_' + q.s]];
  const sayQ = twice => { Speech.stop(); const one = d => Speech.seq(qParts(q), d); twice ? one(() => setTimeout(() => one(), 600)) : one(); };
  const st = k => (p.stats[k] = p.stats[k] || { ok: 0, bad: 0 });
  const kindOf = new Map(pairs.map(x => [x.key, x.kind])), kindN = {}; pairs.forEach(x => { kindN[x.kind] = (kindN[x.kind] || 0) + 1; });
  const byKey = new Map(pairs.map(x => [x.key, x]));
  const weight = k => 1 / kindN[kindOf.get(k)];   // 유형마다 비슷한 비율로
  const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const pic = code => `<img class="it" alt="" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${code}.svg" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'it emo',textContent:String.fromCodePoint(0x${code})+'\\uFE0F'}))">`;
  const grp = (n, code) => `<div class="grp" style="--c:${Math.min(n, 3)}">${Array.from({ length: n }, () => pic(code)).join('')}</div>`;
  const OPS = { '+': '＋', '-': '－' }, OPE = { '+': '+', '-': '−' };
  const total = App.roundSize(KEY, pairs.map(y => y.key));
  let good = 0, qn = 0, q, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/${total}`; };

  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="game mg"><div class="mstage" id="mstage"></div><div class="eq" id="eq"></div><div class="choices" id="ch"></div></main>`;
  root.querySelector('#back').onclick = () => App.mathMenu(mode);

  function next() {
    qn++; upd(); locked = true; tries = 0;
    const pid = App.pickNew(KEY, pairs.map(y => y.key), random ? { weight } : undefined); q = byKey.get(pid);
    const th = THEMES[Math.floor(Math.random() * THEMES.length)], code = th[Math.floor(Math.random() * th.length)];
    const groups = q.t.map((n, i) => (i ? `<span class="op${q.o[i - 1] === '-' ? ' minus' : ''}">${OPS[q.o[i - 1]]}</span>` : '') + grp(n, code)).join('');
    const stage = root.querySelector('#mstage');
    stage.innerHTML = nores ? groups : groups + '<div class="res"><span class="op">＝</span>' + grp(q.s, code).replace('class="grp"', 'class="grp sum"') + '</div>';
    stage.classList.toggle('hardm', nores);
    root.querySelector('#eq').innerHTML = q.t.map((n, i) => (i ? `<span>${OPE[q.o[i - 1]]}</span>` : '') + `<span>${n}</span>`).join('') + '<span>=</span><span class="blank" id="blank">?</span>';
    const near = [q.s - 1, q.s + 1, q.s - 2, q.s + 2].filter(n => n >= 1 && n <= MAXS);
    const far = Array.from({ length: MAXS }, (_, i) => i + 1).filter(n => n !== q.s && !near.includes(n));
    const wrong = [...shuffle(near), ...shuffle(far)].slice(0, 3);
    root.querySelector('#ch').innerHTML = shuffle([q.s, ...wrong]).map(n => `<button class="cb" data-n="${n}">${n}</button>`).join('');
    root.querySelectorAll('.cb').forEach(b => b.onclick = () => pick(b));
    locked = false; setTimeout(() => sayQ(false), 400);   // 문제는 한 번만 읽어줌
  }

  function pick(b) {
    if (locked || b.classList.contains('wrong')) return;
    const n = +b.dataset.n, s = st(q.key);
    if (n === q.s) {
      locked = true; if (tries === 0) { s.ok++; good++; } App.save(); if (tries === 0) App.markDone(KEY, q.key); upd();
      b.classList.add('right');
      const bl = root.querySelector('#blank'); bl.textContent = q.s; bl.classList.add('filled');
      root.querySelectorAll('.cb').forEach(x => x !== b && x.classList.add('fade'));
      burst();
      const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => Speech.seq([[MNUM[q.s], 'n_' + q.s]], () => setTimeout(() => qn >= total ? App.finishRound(good, total, () => App.mathGame(mode, level), () => App.mathMenu(mode)) : next(), 500)), '_praise' + pi);
    } else {
      tries++; s.bad++; App.save(); b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2');
      if (tries >= 2) root.querySelectorAll('.cb').forEach(x => +x.dataset.n === q.s && x.classList.add('hint'));
    }
  }
  function burst() {
    const stg = root.querySelector('#mstage');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨', '💛'][i % 3];
      s.style.setProperty('--x', (Math.random() * 120 - 60) + 'vmin'); s.style.setProperty('--y', (Math.random() * 60 - 30) + 'vmin');
      stg.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
  }
  next();
};
