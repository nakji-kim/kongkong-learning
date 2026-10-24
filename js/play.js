// 놀이 학습 : 짝 맞추기 / 패턴 (새 놀이 3종은 js/play2.js)
const _tw = c => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${c}.svg`;
const pimg = (code, cls = '') => code.startsWith('svg:') ? `<img class="${cls}" alt="" src="assets/images/play/${code.slice(4)}.svg">` : `<img class="${cls}" alt="" src="${_tw(code)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'pemo ${cls}',textContent:String.fromCodePoint(0x${code})+'\\uFE0F'}))">`;
const _shuf = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const _line = k => [PLAY_LINES[k], k];
const _chain = (lines, done) => lines.reduceRight((nxt, l) => () => Speech.play(l[0], nxt, l[1]), done || (() => { }))();

/* ---------- 메뉴 ---------- */
App.cardMenu = function (title, cards, back, scope, crumb = '') {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home">${crumb ? `<div class="crumb">${crumb}</div>` : ''}<h1>${title}</h1><div class="cards">${cards.map((c, i) => `<button class="card al" data-i="${i}" style="background:${c.bg}"><b style="${c.bs || ''}">${c.b}</b><span>${c.t}</span></button>`).join('')}</div></main>`;
  this.root.querySelector('#back').onclick = back;
  if (scope) this.addClr(scope);
  this.root.querySelectorAll('.al').forEach(b => b.onclick = () => cards[+b.dataset.i].go());
};
App.playMenu = function () {
  this.cardMenu('어떤 놀이를 할까요?', [
    { b: '🃏', t: '짝 맞추기', bg: '#ffd166', go: () => this.matchMenu() },
    { b: '🔴🔵', bs: 'font-size:2.2rem', t: '패턴', bg: '#a8d0ff', go: () => this.patMenu() },
    { b: '🍎🍎🍅', bs: 'font-size:1.8rem', t: '다른 그림 찾기', bg: '#cdb8f5', go: () => this.oddMenu() },
    { b: '🧦👟', bs: 'font-size:2.2rem', t: '어울리는 그림', bg: '#b8e8b0', go: () => this.mateMenu() },
    { b: '🔎', t: '숨은 그림 찾기', bg: '#ffb3c1', go: () => this.hideMenu() },
    { b: '🧺🍎', bs: 'font-size:2rem', t: '과일 받기', bg: '#ffe0a3', go: () => this.fruitMenu() },
  ], () => this.home(), 'play', '🧩 놀이');
};
App.matchMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🃏', t: '쉬움', bg: '#8ddc9b', go: () => this.pairGame(3) },
    { b: '🃏🃏', bs: 'font-size:2.4rem', t: '보통', bg: '#6ec6ff', go: () => this.pairGame(4) },
    { b: '🃏🃏🃏', bs: 'font-size:1.9rem', t: '어려움', bg: '#ff9aa8', go: () => this.pairGame(8) },
  ], () => this.playMenu(), 'play', '🧩 놀이');
};
App.patMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🔴🔵🔴🔵', bs: 'font-size:1.7rem', t: '1단계 · 두 가지', bg: '#ffb3c1', go: () => this.patGame(1) },
    { b: '🔴🔴🔵🔵🟢', bs: 'font-size:1.5rem', t: '2단계 · 여러 규칙', bg: '#ffd166', go: () => this.patGame(2) },
    { b: '🔴❓🟢🔴🔵', bs: 'font-size:1.6rem', t: '3단계 · 빈칸 찾기', bg: '#8ddc9b', go: () => this.patGame(3) },
  ], () => this.playMenu(), undefined, '🧩 놀이');
};
/* ---------- 공통 문제 엔진 (보기 4개 · 10문제 · 별 결과) ---------- */
// make(qn) → { stage, eq, choices:[{id, html, cls}], answer, q:[text,name], a:[[text,name],...], key, reveal(root) }
App.quiz = function (make, again, back, extraCls = '', total = 10) {
  const p = this.prof(), root = this.root;
  const st = k => (p.stats[k] = p.stats[k] || { ok: 0, bad: 0 });
  let good = 0, qn = 0, q, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/${total}`; };
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="game mg ${extraCls}"><div class="cstage" id="cstage"></div><div class="eq ceq" id="eq"></div><div class="choices" id="ch"></div></main>`;
  root.querySelector('#back').onclick = () => back();
  const next = () => {
    qn++; upd(); locked = true; tries = 0; q = make(qn);
    root.querySelector('#cstage').innerHTML = q.stage; root.querySelector('#eq').innerHTML = q.eq || '';
    root.querySelector('#ch').innerHTML = q.choices.map(c => `<button class="cb ${c.cls || ''}" data-id="${c.id}">${c.html}</button>`).join('');
    root.querySelectorAll('.cb').forEach(b => b.onclick = () => pick(b));
    const again1 = root.querySelector('#again-q'); if (again1) again1.onclick = () => { if (!locked) { Speech.stop(); Speech.play(q.q[0], null, q.q[1]); } };
    // 그림이 모두 불러와질 때까지 보기를 숨겨 두었다가 한꺼번에 보여 줌 (불러오는 시간 차이로 정답을 알 수 없게)
    const chEl = root.querySelector('#ch'), imgs = [...root.querySelectorAll('#cstage img, #ch img')], mine = q;
    chEl.style.visibility = 'hidden';
    const loaded = Promise.all(imgs.map(i => (i.complete ? 0 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))));
    Promise.race([loaded, new Promise(r => setTimeout(r, 3000))]).then(() => {
      if (q !== mine || root.querySelector('#ch') !== chEl) return;
      chEl.style.visibility = ''; locked = false;
      setTimeout(() => (q.once ? Speech.play(q.q[0], null, q.q[1]) : Speech.twice(q.q[0], null, q.q[1])), 400);   // q.once: 한 번만 읽기
    });
  };
  const pick = b => {
    if (locked || b.classList.contains('wrong')) return;
    const s = st(q.key);
    if (b.dataset.id === String(q.answer)) {
      locked = true; if (tries === 0) { s.ok++; good++; } App.save(); if (q.done && tries === 0) App.markDone(q.done[0], q.done[1]); upd();
      b.classList.add('right'); root.querySelectorAll('.cb').forEach(x => x !== b && x.classList.add('fade'));
      if (q.reveal) q.reveal(root, b);
      burst();
      const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => _chain(q.a || [], () => setTimeout(() => qn >= total ? App.finishRound(good, total, again, back) : next(), 800)), '_praise' + pi);
    } else {
      tries++; s.bad++; App.save(); b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2');
      if (tries >= 2) root.querySelectorAll('.cb').forEach(x => x.dataset.id === String(q.answer) && x.classList.add('hint'));
    }
  };
  const burst = () => {
    const stg = root.querySelector('#cstage');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨', '💛'][i % 3];
      s.style.setProperty('--x', (Math.random() * 120 - 60) + 'vmin'); s.style.setProperty('--y', (Math.random() * 60 - 30) + 'vmin');
      stg.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
  };
  next();
};

/* ---------- 패턴 이어가기 ---------- */
App.patGame = function (level) {
  const rules = PAT_LEVELS[level - 1], hard = level === 3; let n = 0;
  const make = () => {
    const rule = rules[n++ % rules.length], L = rule.length;
    const theme = hard && Math.random() < .6 ? PAT_THEMES[0] : PAT_THEMES[Math.floor(Math.random() * PAT_THEMES.length)];
    const sh = _shuf(theme), d = Math.max(...rule) + 1, unit = sh.slice(0, d);
    // 어려움: 빈칸이 앞뒤 사이 어딘가에 있음 (두 번 반복 + 조금), 나머지는 끝의 한 칸
    const k = hard ? 2 * L + (L === 3 ? 1 : 0) - 1 : 2 * L + Math.floor(Math.random() * L);
    const total = hard ? k + 1 : k + 1, blank = hard ? 1 + Math.floor(Math.random() * (total - 2)) : k;
    const seq = Array.from({ length: total }, (_, i) => unit[rule[i % L]]), ans = seq[blank];
    let wrong = [...unit.filter(c => c !== ans), ...sh.slice(d)];
    if (hard && PAT_TWIN[ans]) wrong = [PAT_TWIN[ans], ...wrong.filter(c => c !== PAT_TWIN[ans]), ...Object.values(PAT_TWIN).filter(c => c !== PAT_TWIN[ans])];   // 같은 색 네모처럼 비슷한 보기
    wrong = wrong.slice(0, 3);
    return {
      key: `pt:${level}:${rule.join('')}`, answer: ans, q: _line(hard ? 'p_q_pat2' : 'p_q_pat'), a: [], once: true,
      stage: `<div class="pseq">${seq.map((c, i) => i === blank ? `<span class="pi qslot" id="qslot">?</span>` : `<span class="pi">${pimg(c)}</span>`).join('')}</div>`,
      choices: _shuf([ans, ...wrong]).map(c => ({ id: c, cls: 'pimg', html: pimg(c) })),
      reveal: root => { const s = root.querySelector('#qslot'); s.classList.add('filled'); s.innerHTML = pimg(ans); },
    };
  };
  this.quiz(make, () => App.patGame(level), () => App.patMenu());
};

/* ---------- 짝 맞추기 (카드 뒤집기) ---------- */
App.pairGame = function (pairs) {
  const root = this.root, keys = _shuf(PITEMS.map(i => i.k)).slice(0, pairs), cards = _shuf([...keys, ...keys]);
  let open = [], tries = 0, miss = 0, found = 0, locked = false;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🃏 0번</span></header>
    <main class="game mg"><div class="mgrid c${pairs === 3 ? 3 : 4}${pairs >= 8 ? ' sq' : ''}" id="grid">${cards.map((k, i) => `<button class="mc" data-i="${i}" data-k="${k}"><span class="bk">?</span><span class="fr">${pimg(PBYK[k].code)}</span></button>`).join('')}</div></main>`;
  root.querySelector('#back').onclick = () => App.matchMenu();
  setTimeout(() => Speech.play(PLAY_LINES.p_q_pair, null, 'p_q_pair'), 400);
  const spark = el => { const r = el.getBoundingClientRect(); for (let i = 0; i < 6; i++) { const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨'][i % 2]; s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--x:${Math.random() * 30 - 15}vmin;--y:${Math.random() * 30 - 15}vmin`; document.body.appendChild(s); setTimeout(() => s.remove(), 1400); } };
  root.querySelectorAll('.mc').forEach(c => c.onclick = () => {
    if (locked || c.classList.contains('up') || c.classList.contains('done')) return;
    c.classList.add('up'); open.push(c);
    if (open.length < 2) return;
    tries++; root.querySelector('#stars').textContent = `🃏 ${tries}번`; locked = true;
    const [a, b] = open; open = [];
    if (a.dataset.k === b.dataset.k) {
      a.classList.add('done'); b.classList.add('done'); spark(a); spark(b); found++; Speech.stop();
      Speech.play(PBYK[a.dataset.k].ko, () => {
        locked = false;
        if (found === pairs) setTimeout(() => {
          const stars = (() => { const t = pairs === 3 ? [2, 4, 8] : pairs === 4 ? [3, 7, 11] : [pairs, pairs * 2, pairs * 3]; return miss <= t[0] ? 5 : miss <= t[1] ? 4 : miss <= t[2] ? 3 : 2; })();
          App.finishRound(stars, 5, () => App.pairGame(pairs), () => App.matchMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) });
        }, 400);
      }, 'p_it_' + a.dataset.k);
    } else { miss++; setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); locked = false; }, 1000); }
  });
};
