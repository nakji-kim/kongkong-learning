// 어려움: 숨은 그림 윤곽 대비를 낮추고(색 섞기), 찾는 그림이 아닌 가짜 모양도 몰래 섞어 둠
const _mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
// 어려움 가짜 모양: 비슷한 생김새끼리 묶음 (정답 모양과 같은 묶음은 가짜로 쓰지 않음)
const HS_SIM = [['apple', 'heart', 'cloud', 'snail'], ['fish', 'bird', 'duck', 'butterfly'], ['cat'], ['umbrella', 'mushroom', 'bell'], ['cup'], ['house', 'hat', 'icecream'], ['car'], ['leaf', 'banana', 'carrot', 'pencil', 'sock'], ['key'], ['star']];
const HS_DECOYS = 4;

// 숨은 그림 찾기 보통/어려움: 배경에 잡다한 사물을 더 깔아서 헷갈리게 함 (장면 분위기별 사물 모음)
const HS_THEME = { house: 'land', sea: 'water', forest: 'land', class: 'indoor', park: 'land', farm: 'land', market: 'indoor', kitchen: 'indoor', living: 'indoor', snow: 'snow', space: 'space', aqua: 'water', dino: 'land', camp: 'land', street: 'land' };
const _pk = a => a[Math.floor(Math.random() * a.length)];
const HS_CLUT = {
  land: [
    () => `<line y2="18" stroke="#4a9a45" stroke-width="3"/><circle cy="-2" r="7" fill="${_pk(['#ff8fb6', '#fff', '#ffd84a', '#b78cf0'])}"/><circle cy="-2" r="3" fill="#ffe27a"/>`,
    () => `<ellipse cx="-8" cy="4" rx="12" ry="9" fill="#5fb85a"/><ellipse cx="8" cy="4" rx="12" ry="9" fill="#4ea34c"/><ellipse cy="-2" rx="11" ry="9" fill="#6ccb63"/>`,
    () => `<path d="M-16 10L-10-6L4-10L16-2L14 10z" fill="#a8a8a8" stroke="#8a8a8a" stroke-width="2"/>`,
    () => `<rect x="-3" y="2" width="6" height="16" fill="#8c5e3a"/><circle cy="-6" r="14" fill="#5fb85a"/><circle cx="8" cy="-2" r="9" fill="#4ea34c"/>`,
    () => `<g fill="#c9a064"><rect x="-16" y="-8" width="5" height="22"/><rect x="-3" y="-8" width="5" height="22"/><rect x="10" y="-8" width="5" height="22"/><rect x="-18" y="-2" width="36" height="4"/><rect x="-18" y="6" width="36" height="4"/></g>`,
    () => `<rect x="-2" y="-4" width="4" height="22" fill="#8c5e3a"/><rect x="-14" y="-14" width="28" height="12" rx="2" fill="#e8c872" stroke="#8c5e3a" stroke-width="2"/>`,
    () => `<path d="M0-16L12-2 0 12-12-2z" fill="${_pk(['#ff8fb6', '#7fc8ff', '#ffd84a'])}"/><path d="M0 12Q-6 20 0 26" stroke="#888" fill="none" stroke-width="2"/>`,
    () => `<rect x="-12" y="-4" width="24" height="16" rx="2" fill="#d98a5a" stroke="#a8603a" stroke-width="2"/><path d="M-14-4Q0-16 14-4z" fill="#c4704a"/>`,
  ],
  water: [
    () => `<g fill="none" stroke="#fff" stroke-width="2" opacity=".9"><circle cx="-8" cy="6" r="5"/><circle cx="6" cy="-2" r="7"/><circle cx="10" cy="14" r="3"/></g>`,
    () => `<path d="M-6 18Q-14 6-6 -2T-6-18M6 18Q14 6 6-2T6-18" stroke="#3fa86a" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    () => `<path d="M0 18V0M0 8L-10-4M0 4L10-8M-10-4L-12-12M10-8L12-16" stroke="${_pk(['#ff8a6a', '#e86aa0'])}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    () => `<g fill="#cfc2a8" stroke="#a89878" stroke-width="1.5"><ellipse cx="-8" cy="6" rx="8" ry="5"/><ellipse cx="8" cy="8" rx="7" ry="4.5"/><ellipse cx="0" cy="-2" rx="6" ry="4"/></g>`,
    () => `<path d="M-14 10Q-14-12 0-12Q14-12 14 10z" fill="#ffd1a8" stroke="#e8a878" stroke-width="2"/><path d="M0 10V-10M-7 10L-8-8M7 10L8-8" stroke="#e8a878" stroke-width="1.5"/>`,
    () => `<rect x="-12" y="-2" width="24" height="16" rx="3" fill="#caa56a" stroke="#8c6a3a" stroke-width="2"/><rect x="-12" y="-8" width="24" height="8" rx="3" fill="#b98a4a" stroke="#8c6a3a" stroke-width="2"/>`,
  ],
  space: [
    () => `<circle r="11" fill="${_pk(['#f0a878', '#8fc8f0', '#c8a0f0'])}"/><ellipse rx="19" ry="5" fill="none" stroke="#fff" stroke-width="2" transform="rotate(-20)"/>`,
    () => `<path d="M-12 4L-8-8L4-10L12-2L8 10L-4 12z" fill="#9a9aa8" stroke="#7a7a88" stroke-width="2"/><circle cx="-2" cy="0" r="2.5" fill="#7a7a88"/>`,
    () => `<circle r="6" fill="#fff"/><path d="M6-3L26-10M6 0L28 0M6 3L26 10" stroke="#fff" stroke-width="2" opacity=".6"/>`,
    () => `<rect x="-5" y="-5" width="10" height="10" fill="#c8c8d8" stroke="#8a8aa0" stroke-width="2"/><rect x="-22" y="-4" width="14" height="8" fill="#5a8ae8"/><rect x="8" y="-4" width="14" height="8" fill="#5a8ae8"/>`,
    () => `<ellipse rx="15" ry="5" cy="4" fill="#a8b0c8"/><path d="M-8 2Q0-14 8 2z" fill="#d8e8ff"/>`,
    () => `<circle r="9" fill="#e8c8a0"/><circle cx="-3" cy="-2" r="2" fill="#c8a070"/><circle cx="4" cy="3" r="3" fill="#c8a070"/>`,
  ],
  snow: [
    () => `<ellipse cy="8" rx="20" ry="9" fill="#fff" stroke="#cfe2f0" stroke-width="2"/>`,
    () => `<path d="M0-18L10-4H-10zM0-8L13 8H-13z" fill="#4a9a6a"/><rect x="-2" y="8" width="4" height="8" fill="#8c5e3a"/><path d="M0-18L6-10H-6z" fill="#fff"/>`,
    () => `<g stroke="#bfe0f5" stroke-width="2.5" stroke-linecap="round"><path d="M0-12V12M-11-6L11 6M-11 6L11-6"/></g>`,
    () => `<circle cy="8" r="10" fill="#fff" stroke="#cfe2f0" stroke-width="2"/><circle cy="-6" r="7" fill="#fff" stroke="#cfe2f0" stroke-width="2"/><circle cx="-2" cy="-7" r="1" fill="#333"/><circle cx="2" cy="-7" r="1" fill="#333"/>`,
    () => `<path d="M-12-6H12L6 4 2-8-2 6-6 2z" fill="#cfeaff" stroke="#9fcbe8" stroke-width="1.5"/>`,
    () => `<rect x="-12" y="-2" width="24" height="14" rx="3" fill="#e8756a"/><rect x="-14" y="-6" width="28" height="6" rx="3" fill="#fff" stroke="#cfe2f0" stroke-width="1.5"/>`,
  ],
  indoor: [
    () => `<g stroke="#00000030" stroke-width="1.5"><rect x="-14" y="2" width="28" height="7" fill="${_pk(['#e8756a', '#6aa8e8'])}"/><rect x="-12" y="-5" width="24" height="7" fill="${_pk(['#ffd84a', '#7fc261'])}"/></g>`,
    () => `<rect x="-14" y="-12" width="28" height="22" rx="2" fill="#c9a064" stroke="#8c6a3a" stroke-width="2"/><rect x="-10" y="-8" width="20" height="14" fill="${_pk(['#bfe6ff', '#d8f0c0', '#ffe3c2'])}"/>`,
    () => `<path d="M-8 6H8L6 18H-6z" fill="#c4704a"/><path d="M0 6Q-14-6-8-14M0 6Q14-6 8-14M0 6V-12" stroke="#4a9a45" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    () => `<rect x="-12" y="-8" width="24" height="20" fill="#d9a870" stroke="#a87840" stroke-width="2"/><path d="M-12-2H12" stroke="#a87840" stroke-width="2"/>`,
    () => `<circle r="13" fill="#fff" stroke="#3b2f4a" stroke-width="2.5"/><path d="M0-8V0L6 4" stroke="#3b2f4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    () => `<path d="M-8-10H8L14 8H-14z" fill="#ffd84a" stroke="#d9b030" stroke-width="2"/><rect x="-2" y="8" width="4" height="10" fill="#8a8a8a"/>`,
  ]
};
const HS_ZONE = { land: 'ggggggsg', water: 'aaaaaa', space: 'aaaaaa', snow: 'ggagag', indoor: 'gwggwg' };   // g=바닥쪽 · s=하늘쪽 · w=벽쪽 · a=어디든
function hsClutter(sc, items, n) {   // 정답 그림 뒤쪽에 사물 n개를 흩뿌림 (겹쳐도 됨)
  const th = HS_THEME[sc.id] || 'land', list = HS_CLUT[th], zone = HS_ZONE[th], pts = [], out = [];
  for (let i = 0; i < n; i++) {
    const zi = Math.floor(Math.random() * list.length), z = zone[zi];
    for (let t = 0; t < 40; t++) {
      const px = 22 + Math.random() * 356, py = z === 'g' ? 150 + Math.random() * 126 : z === 's' ? 22 + Math.random() * 110 : z === 'w' ? 30 + Math.random() * 130 : 22 + Math.random() * 256;
      if (items.some(it => Math.hypot(it.x - px, it.y - py) < 34) || pts.some(p => Math.hypot(p[0] - px, p[1] - py) < 36)) continue;
      pts.push([px, py]); out.push(`<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${Math.round(Math.random() * 30 - 15)}) scale(${(0.85 + Math.random() * 0.6).toFixed(2)})">${list[zi]()}</g>`); break;
    }
  }
  return out.join('');
}
function addDecoys(sc, items, box, hrot) {   // 배경 색을 읽어서 같은 색으로 가짜 모양을 몰래 깔아 둠 (눌러도 틀린 것으로 처리)
  const tgt = new Set(HS_SIM.filter(g => items.some(it => g.includes(it.k))).flat());
  const pool = _shuf(Object.keys(HS_SHAPES).filter(k => !tgt.has(k))).slice(0, HS_DECOYS);
  if (!pool.length) return;
  const img = new Image(), key = sc.id + Math.random();
  box.dataset.dk = key;
  img.onload = () => {
    if (box.dataset.dk !== key) return;
    const c = document.createElement('canvas'); c.width = 400; c.height = 300; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 400, 300);
    const col = (px, py) => { let r = 0, g = 0, b = 0, n = 0; for (let dx = -4; dx <= 4; dx += 4) for (let dy = -4; dy <= 4; dy += 4) { const d = x.getImageData(Math.max(0, Math.min(399, px + dx)), Math.max(0, Math.min(299, py + dy)), 1, 1).data; r += d[0]; g += d[1]; b += d[2]; n++; } return '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join(''); };
    const avg = items.reduce((t, it) => t + it.hs, 0) / items.length, pts = items.map(it => [it.x, it.y]), out = [];
    pool.forEach((k, n) => {
      for (let t = 0; t < 80; t++) {
        const px = 34 + Math.random() * 332, py = 34 + Math.random() * 232;
        if (pts.some(p => Math.hypot(p[0] - px, p[1] - py) < 62)) continue;
        pts.push([px, py]); const f = col(Math.round(px), Math.round(py)), r = hrot[n % 5];
        out.push(`<g transform="translate(${px} ${py}) rotate(${r[0]}) scale(${r[1] ? -avg / 100 : avg / 100} ${avg / 100}) translate(-50 -50)">${hsShape(k, f, _mix(f, '#000000', 0.07), 1.5 / (avg / 100))}</g>`);
        break;
      }
    });
    const g = box.querySelector('#dcy'); if (g) g.innerHTML = out.join('');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">${sc.bg}</svg>`);
}
// 놀이 : 다른 그림 찾기 / 어울리는 그림 찾기 / 숨은 그림 찾기  (각 쉬움·보통·어려움)
App.oddMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🍎🍎🍅', bs: 'font-size:1.8rem', t: '쉬움', bg: '#8ddc9b', go: () => this.oddGame(1) },
    { b: '🐶🐶🐶🐶', bs: 'font-size:1.4rem', t: '보통', bg: '#6ec6ff', go: () => this.oddGame(2) },
    { b: '🐜🐜🐜🐜🐜🐜', bs: 'font-size:1.15rem', t: '어려움', bg: '#ff9aa8', go: () => this.oddGame(3) },
  ], () => this.playMenu(), 'play', '🧩 놀이');
};
App.mateMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🐶🦴', bs: 'font-size:2.2rem', t: '쉬움 · 보기 4개', bg: '#8ddc9b', go: () => this.mateGame(1) },
    { b: '🐰🧦🔑', bs: 'font-size:1.6rem', t: '보통 · 3쌍 짝짓기', bg: '#6ec6ff', go: () => this.mateGame(2) },
    { b: '🧠', bs: 'font-size:2.4rem', t: '어려움 · 기억하기', bg: '#ff9aa8', go: () => this.mateGame(3) },
  ], () => this.playMenu(), 'play', '🧩 놀이');
};
App.hideMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🔎', t: '쉬움 · 2개', bg: '#8ddc9b', go: () => this.hideGame(1) },
    { b: '🔎🔎', bs: 'font-size:2.4rem', t: '보통 · 3개', bg: '#6ec6ff', go: () => this.hideGame(2) },
    { b: '🔎🔎🔎', bs: 'font-size:1.9rem', t: '어려움 · 5개', bg: '#ff9aa8', go: () => this.hideGame(3) },
  ], () => this.playMenu(), 'play', '🧩 놀이');
};

/* ---------- 다른 그림 찾기 ---------- */
App.oddGame = function (level) {
  // 쉬움: 비슷하게 생긴 그림 9장 중 다른 그림 · 보통/어려움: 같은 그림 4/6장 중 모양이 살짝 다른 1장
  const N = [9, 4, 6][level - 1], cols = [3, 2, 3][level - 1], ids = [];
  if (level === 1) ODD_LOOK.forEach(p => p.forEach(k => { new Image().src = _tw(PBYK[k].code); }));   // 그림을 미리 받아 둠
  if (level === 1) ODD_LOOK.forEach(([a, b]) => { ids.push(a + '>' + b, b + '>' + a); });
  else Object.entries(ODD2).forEach(([k, o]) => o['lv' + level].forEach(d => ids.push(k + ':' + d)));
  const make = () => {
    const pid = App.pickNew('odd' + level, ids, { random: true });
    if (level === 1) {
      const [base, odd] = pid.split('>'), cells = _shuf([...Array(N - 1).fill(base), odd]), ans = cells.indexOf(odd);
      return {
        key: 'od1:' + odd, done: ['odd1', pid], answer: String(ans), q: _line('p_q_odd'), once: true, stage: '', a: [],
        choices: cells.map((k, i) => ({ id: String(i), cls: 'pimg', html: pimg(PBYK[k].code) })),
      };
    }
    const [k, d] = pid.split(':'), cells = _shuf([...Array(N - 1).fill(null), d]), ans = cells.indexOf(d);
    return {
      key: 'od' + level + ':' + pid, done: ['odd' + level, pid], answer: String(ans), q: _line('p_q_odd'), once: true, stage: '', a: [],
      choices: cells.map((x, i) => ({ id: String(i), cls: 'pimg', html: ODD2[k].draw(x) })),
    };
  };
  this.quiz(make, () => App.oddGame(level), () => App.oddMenu(), 'odd g' + cols, App.roundSize('odd' + level, ids));
};

/* ---------- 어울리는 그림 찾기 ---------- */
App.mateGame = function (level) {
  if (level > 1) return this.mateSet(level);
  App._pre = new Audio('assets/audio/p_mt_end.mp3'); App._pre.preload = 'auto';   // 뒤 문장을 미리 불러와 두 문장 사이 지연을 줄임
  const ids = []; MATCH_PAIRS.forEach((p, i) => { ids.push(String(i)); });   // 같은 짝은 방향만 달라도 다시 나오지 않도록 짝 번호로만 기록
  const make = () => {
    const pid = App.pickNew('mat' + level, ids, { random: true }), i = Number(pid), dir = Math.random() < .5 ? 0 : 1, p = MATCH_PAIRS[i];
    const show = dir ? [p[3], p[4]] : [p[0], p[1]], ans = dir ? [p[0], p[1], p[2]] : [p[3], p[4], p[5]], side = dir ? 0 : 3;
    const others = MATCH_PAIRS.filter((_, j) => j !== i), same = others.filter(o => o[6] === p[6]), pool = _shuf(same.length >= 3 ? same : others);
    const wrong = pool.slice(0, 3).map(o => [o[side], o[side + 1]]);   // 틀린 보기 3개 (정답 포함 4개) · 같은 묶음 우선
    return {
      key: 'mt:' + i, done: ['mat' + level, pid], answer: ans[0], q: _line('p_q_match'), once: true,
      a: [[PLAY_LINES['p_mt_' + i], 'p_mt_' + i], [PLAY_LINES.p_mt_end, 'p_mt_end']],   // "A와 B는" + 공통 "짝꿍이에요!" 를 끊김 없이 이어 읽음
      stage: `<div class="pcard">${pimg(show[1])}</div>`,
      choices: _shuf([[ans[0], ans[1]], ...wrong]).map(([k, c]) => ({ id: k, cls: 'pimg', html: pimg(c) })),
    };
  };
  this.quiz(make, () => App.mateGame(level), () => App.mateMenu(), '', App.roundSize('mat' + level, ids));
};

/* ---------- 숨은 그림 찾기 ---------- */
// 숨은 그림 찾기: 한 문제에서 5번 틀리면 그림 밑에 "정답 보기" 버튼이 뾰로롱 나타남
const HS_ASSIST_MISS = 5;
function hsAssist(main) {
  let n = 0, btn = null;
  return {
    reset() { n = 0; if (btn) { btn.remove(); btn = null; } },
    miss(onShow) {
      if (++n !== HS_ASSIST_MISS || btn) return;
      btn = document.createElement('button'); btn.className = 'chip big hshow'; btn.textContent = '👀 정답 보기'; main.appendChild(btn);
      try { _sfx.init(); [784, 988, 1319, 1760].forEach((f, i) => setTimeout(() => _sfx.tone(f, f * 1.03, 0.16, 'sine', 0.45), i * 80)); } catch (e) { }
      const r = btn.getBoundingClientRect();
      for (let i = 0; i < 6; i++) { const e = document.createElement('i'); e.className = 'spark'; App.sparkFill(e, ['⭐', '✨'][i % 2]); e.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--x:${Math.round(Math.random() * 50 - 25)}vmin;--y:${Math.round(Math.random() * 30 - 20)}vmin`; document.body.appendChild(e); setTimeout(() => e.remove(), 1300); }
      btn.onclick = () => { btn.disabled = true; btn.style.visibility = 'hidden'; onShow(); };
    }
  };
}
App.hideGameEmoji = function (level) {
  const root = this.root, T = [2, 3, 5][level - 1], CL = [8, 16, 28][level - 1], SZ = [21, 16.5, 13.5][level - 1];
  const scenes = _shuf(HIDE_SCENES).slice(0, 5);
  let si = 0, miss = 0, found, locked = true, gone = false;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🔎 0/5</span></header>
    <main class="game mg hide"><div class="hbar" id="hbar"></div><div class="hbox" id="hbox"></div></main>`;
  const assist = hsAssist(root.querySelector('main'));
  root.querySelector('#back').onclick = () => { gone = true; Speech.stop(); App.hideMenu(); };
  const say = (k, done) => Speech.play(PBYK[k].ko, done, 'p_it_' + k);
  function place(n, size, avoid, gap) {   // 겹치지 않게 무작위 위치 (실패하면 그냥 둠)
    const out = [];
    for (let i = 0; i < n; i++) {
      let best = null;
      for (let t = 0; t < 60; t++) {
        const x = Math.random() * (100 - size), y = Math.random() * (100 - size);
        const ok = [...avoid, ...out].every(o => Math.hypot(o.x - x, o.y - y) >= size * (o.t ? 1 : gap));
        if (ok) { best = { x, y }; break; }
        best = best || { x, y };
      }
      out.push(best);
    }
    return out;
  }
  function start() {
    const sc = scenes[si], box = root.querySelector('#hbox'), bar = root.querySelector('#hbar');
    assist.reset(); root.querySelector('#stars').textContent = `🔎 ${si}/5`; found = 0; locked = true;
    const tk = _shuf(sc.targets).slice(0, T);
    const tp = place(T, SZ, [], 1).map(o => ({ ...o, t: 1 })), cp = place(CL, SZ * 0.92, tp, 0.62);
    box.style.background = sc.bg;
    box.innerHTML = cp.map((o, i) => `<span class="hc" style="left:${o.x}%;top:${o.y}%;width:${SZ * 0.92}%;transform:rotate(${Math.round(Math.random() * 50 - 25)}deg)">${pimg(sc.clutter[i % sc.clutter.length])}</span>`).join('')
      + tp.map((o, i) => `<span class="ht" data-k="${tk[i]}" style="left:${o.x}%;top:${o.y}%;width:${SZ}%;transform:rotate(${Math.round(Math.random() * 40 - 20)}deg)">${pimg(PBYK[tk[i]].code)}</span>`).join('');
    bar.innerHTML = tk.map(k => `<span class="hb" data-k="${k}">${pimg(PBYK[k].code, 'sil')}<i>✔</i></span>`).join('');
    bar.querySelectorAll('.hb').forEach(b => b.onclick = () => { if (!locked) { Speech.stop(); say(b.dataset.k); } });
    box.onclick = e => {
      if (locked) return;
      const t = e.target.closest('.ht');
      if (t && !t.classList.contains('got')) {
        t.classList.add('got'); found++; Speech.stop(); say(t.dataset.k);
        const hb = bar.querySelector(`.hb[data-k="${t.dataset.k}"]`); hb.classList.add('on'); hb.querySelector('img,.pemo').classList.remove('sil');
        spark(t);
        if (found === T) {
          locked = true; si++;
          setTimeout(() => {
            const pi = Math.floor(Math.random() * 4); Speech.stop();
            Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => setTimeout(() => {
              if (si >= 5) { const stars = miss <= 2 ? 5 : miss <= 5 ? 4 : miss <= 9 ? 3 : 2; App.finishRound(stars, 5, () => App.hideGame(level), () => App.hideMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) }); }
              else start();
            }, 500), '_praise' + pi);
          }, 900);
        }
      } else if (!t) {
        miss++; const r = box.getBoundingClientRect(); const w = document.createElement('i'); w.className = 'hmiss'; w.style.left = (e.clientX - r.left) + 'px'; w.style.top = (e.clientY - r.top) + 'px'; box.appendChild(w); setTimeout(() => w.remove(), 600);
        const now = Date.now(); if (!start.last || now - start.last > 4000) { start.last = now; Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2'); }
        assist.miss(() => {   // 정답을 두근두근 보여 주고 2초 뒤 다음 문제
          locked = true; Speech.stop(); box.querySelectorAll('.ht:not(.got)').forEach(t => t.classList.add('hhint'));
          setTimeout(() => { if (gone) return; si++; if (si >= 5) { const stars = miss <= 2 ? 5 : miss <= 5 ? 4 : miss <= 9 ? 3 : 2; App.finishRound(stars, 5, () => App.hideGame(level), () => App.hideMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) }); } else start(); }, 4000);
        });
      }
    };
    locked = false;
    setTimeout(() => { if (si < 5) Speech.play(PLAY_LINES.p_q_hide, () => setTimeout(() => { let i = 0; const nx = () => { if (i < tk.length && !locked) say(tk[i++], () => setTimeout(nx, 150)); }; nx(); }, 150), 'p_q_hide'); }, 400);
  }
  const spark = el => { const r = el.getBoundingClientRect(); for (let i = 0; i < 6; i++) { const s = document.createElement('i'); s.className = 'spark'; App.sparkFill(s, ['⭐', '✨'][i % 2]); s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--x:${Math.round(Math.random() * 80 - 40)}vmin;--y:${Math.round(Math.random() * 60 - 40)}vmin`; document.body.appendChild(s); setTimeout(() => s.remove(), 1300); } };
  start();
};

/* 보통/어려움: 배경 그림 속에 자연스럽게 숨은 그림을 찾아 아래 윤곽선 목록과 맞춤 (음성 문제 없음) */
App.hideSceneGame = function (level) {
  const root = this.root, N = level === 2 ? 3 : 5, ROUNDS = 5, scenes = _shuf(HS_SCENES);
  let si = 0, miss = 0, found = 0, locked = true, gone = false, items = [], lastMsg = 0;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🔎 0/${ROUNDS}</span></header>
    <main class="game mg hide"><div class="hs2" id="hs2"></div><div class="hbar" id="hbar"></div></main>`;
  const assist = hsAssist(root.querySelector('main'));
  root.querySelector('#back').onclick = () => { gone = true; Speech.stop(); App.hideMenu(); };
  const spark = (x, y) => { for (let i = 0; i < 6; i++) { const e = document.createElement('i'); e.className = 'spark'; App.sparkFill(e, ['⭐', '✨'][i % 2]); e.style.cssText = `position:fixed;left:${x}px;top:${y}px;--x:${Math.random() * 30 - 15}vmin;--y:${Math.random() * 30 - 15}vmin`; document.body.appendChild(e); setTimeout(() => e.remove(), 1400); } };
  function start() {
    const sc = scenes[si], box = root.querySelector('#hs2'), bar = root.querySelector('#hbar');
    assist.reset(); root.querySelector('#stars').textContent = `🔎 ${si}/${ROUNDS}`; found = 0; locked = false;
    const hard = level === 3, hrot = _shuf(HS_HARD_ROT);
    items = (N === 5 ? sc.items.slice() : _shuf(sc.items).slice(0, N)).map((it, n) => { const hc = hard && HS_HARD[sc.id] && HS_HARD[sc.id][it[0]]; return { k: it[0], x: it[1], y: it[2], s: it[3], hs: hard ? it[3] * 0.7 : it[3], r: hard ? hrot[n % 5][0] : it[4], fl: hard ? hrot[n % 5][1] : 0, f: hc ? hc[0] : it[5], st: hc ? hc[1] : it[6], got: false }; });
    const g = it => `<g transform="translate(${it.x} ${it.y}) rotate(${it.r}) scale(${it.fl ? -it.hs / 100 : it.hs / 100} ${it.hs / 100}) translate(-50 -50)">${hsShape(it.k, it.f, hard ? _mix(it.f, it.st, 0.4) : it.st, (hard ? 1.5 : 2.4) / (it.hs / 100))}</g>`;
    box.innerHTML = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">${sc.bg}<g id="cl">${hsClutter(sc, items, hard ? 12 : 8)}</g><g id="dcy"></g>${items.map(g).join('')}<g id="rings"></g></svg>`;
    if (hard) addDecoys(sc, items, box, hrot);
    Speech.stop(); Speech.play(PLAY_LINES.p_q_hide, null, 'p_q_hide');
    bar.innerHTML = items.map(it => `<span class="hb" data-k="${it.k}"><svg viewBox="0 0 100 100">${hsShape(it.k, '#fff', '#222', 3)}</svg><i>✔</i></span>`).join('');
    box.onclick = e => {
      if (locked) return;
      const svg = box.querySelector('svg'), r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * 400, vy = (e.clientY - r.top) / r.height * 300;
      let hit = null, bd = 1e9;
      items.forEach(it => { const d = Math.hypot(it.x - vx, it.y - vy); if (!it.got && d <= it.s * 0.62 + 8 && d < bd) { hit = it; bd = d; } });
      if (hit) {
        hit.got = true; found++;
        box.querySelector('#rings').insertAdjacentHTML('beforeend', `<circle cx="${hit.x}" cy="${hit.y}" r="${hit.s * 0.6 + 6}" fill="none" stroke="#3ecf6e" stroke-width="4"/>`);
        const hb = bar.querySelector(`.hb[data-k="${hit.k}"]`); hb.classList.add('on'); hb.querySelector('svg').innerHTML = hsShape(hit.k, hit.f, hit.st, 3, hit.st);
        spark(e.clientX, e.clientY);
        if (found === N) {
          locked = true; si++;
          setTimeout(() => { if (gone) return; const pi = Math.floor(Math.random() * 4); Speech.stop();
            Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => setTimeout(() => {
              if (gone) return;
              if (si >= ROUNDS) { const stars = miss <= 2 ? 5 : miss <= 5 ? 4 : miss <= 9 ? 3 : 2; App.finishRound(stars, 5, () => App.hideGame(level), () => App.hideMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) }); }
              else start();
            }, 500), '_praise' + pi); }, 900);
        }
      } else {
        miss++; const rr = box.getBoundingClientRect(), w = document.createElement('i'); w.className = 'hmiss'; w.style.left = (e.clientX - rr.left) + 'px'; w.style.top = (e.clientY - rr.top) + 'px'; box.appendChild(w); setTimeout(() => w.remove(), 600);
        const now = Date.now(); if (now - lastMsg > 4000) { lastMsg = now; Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2'); }
        assist.miss(() => {   // 안 찾은 그림에 두근두근 표시 후 2초 뒤 다음 문제
          locked = true; Speech.stop();
          box.querySelector('#rings').insertAdjacentHTML('beforeend', items.filter(it => !it.got).map(it => `<circle class="hhint" cx="${it.x}" cy="${it.y}" r="${it.s * 0.6 + 6}"/>`).join(''));
          setTimeout(() => { if (gone) return; si++; if (si >= ROUNDS) { const stars = miss <= 2 ? 5 : miss <= 5 ? 4 : miss <= 9 ? 3 : 2; App.finishRound(stars, 5, () => App.hideGame(level), () => App.hideMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) }); } else start(); }, level === 3 ? 5000 : 4000);
        });
      }
    };
  }
  start();
};
App.hideGame = function (level) { return level === 1 ? this.hideGameEmoji(1) : this.hideSceneGame(level); };

/* ---------- 어울리는 그림 찾기 · 보통/어려움: 위 3장(문제)과 아래 5장(보기)을 짝지음 ----------
   보통: 문제 그림이 계속 보임 · 어려움: 6초 동안 보여 준 뒤 가리고 기억으로 짝짓기 */
App.mateSet = function (level) {
  const root = this.root, ROUNDS = 5, VIEW = 6000, key = 'mat' + level;
  const ids = MATCH_PAIRS.map((_, i) => String(i));
  let round = 0, wrong = 0, timers = [], gone = false;
  const later = (fn, ms) => { const t = setTimeout(() => { if (!gone) fn(); }, ms); timers.push(t); return t; };
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🧩 0/${ROUNDS}</span></header>
    <main class="game mg mt3"><div class="m3q" id="m3q"></div><div class="m3bar" id="m3bar"><i></i></div><div class="m3c" id="m3c"></div></main>`;
  root.querySelector('#back').onclick = () => { gone = true; Speech.stop(); App.mateMenu(); };
  const next = () => {
    if (gone) return;
    if (round >= ROUNDS) {
      const stars = wrong <= 2 ? 5 : wrong <= 5 ? 4 : wrong <= 9 ? 3 : 2;
      return App.finishRound(stars, 5, () => App.mateGame(level), () => App.mateMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) });
    }
    round++; root.querySelector('#stars').textContent = `🧩 ${round}/${ROUNDS}`;
    // 아직 안 푼 짝 3개 (모자라면 기록을 지우고 다시 시작)
    let fresh = ids.filter(i => !App.doneArr(key).includes(i));
    if (fresh.length < 3) { App.prof().done[key] = []; App.save(); fresh = ids.slice(); App.toast('모두 풀었어요! 다시 시작해요 🎉'); }
    const pick = _shuf(fresh).slice(0, 3).map(Number), dir = Math.random() < .5 ? 0 : 1, side = dir ? 3 : 0, oth = dir ? 0 : 3;
    const qs = pick.map(i => ({ i, q: MATCH_PAIRS[i][side + 1], a: MATCH_PAIRS[i][oth], ac: MATCH_PAIRS[i][oth + 1] }));
    const groups = new Set(pick.map(i => MATCH_PAIRS[i][6]));
    const others = MATCH_PAIRS.map((p, i) => i).filter(i => !pick.includes(i));
    const near = _shuf(others.filter(i => groups.has(MATCH_PAIRS[i][6]))), far = _shuf(others.filter(i => !groups.has(MATCH_PAIRS[i][6])));
    const wr = (level === 3 ? [...near, ...far] : _shuf(others)).slice(0, 2).map(i => ({ i, a: MATCH_PAIRS[i][oth], ac: MATCH_PAIRS[i][oth + 1] }));
    const choices = _shuf([...qs.map(x => ({ i: x.i, a: x.a, ac: x.ac })), ...wr]);
    const mq = root.querySelector('#m3q'), mc = root.querySelector('#m3c'), bar = root.querySelector('#m3bar');
    mq.innerHTML = qs.map((x, n) => `<button class="m3qc" data-n="${n}"><span class="m3f">${pimg(x.q)}</span><span class="m3m">❓</span></button>`).join('');
    mc.innerHTML = choices.map((c, n) => `<button class="m3cc" data-n="${n}">${pimg(c.ac)}</button>`).join('');
    mc.style.visibility = 'hidden'; bar.style.visibility = 'hidden';
    let selQ = null, selC = null, matched = 0, lock = true; const bad = [0, 0, 0];
    const cards = [...mq.children], opts = [...mc.children];
    const hide = on => cards.forEach(c => !c.classList.contains('done') && c.classList.toggle('hid', on));
    const evalPair = () => {
      if (selQ == null || selC == null) return;
      const x = qs[selQ], c = choices[selC], qe = cards[selQ], ce = opts[selC];
      if (c.i === x.i) {
        qe.classList.remove('sel'); ce.classList.remove('sel'); qe.classList.remove('hid'); qe.classList.add('done'); ce.classList.add('done'); matched++;
        if (!bad[selQ]) App.markDone(key, String(x.i)); selQ = selC = null;
        const sp = document.createElement('i'); sp.className = 'spark'; App.sparkFill(sp, '✨'); qe.appendChild(sp); setTimeout(() => sp.remove(), 1200);
        if (matched === 3) { lock = true; const pi = Math.floor(Math.random() * 4); Speech.stop(); Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => later(next, 600), '_praise' + pi); }
      } else {
        wrong++; bad[selQ]++; const qi = selQ; qe.classList.add('bad'); ce.classList.add('bad'); lock = true;
        Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2');
        later(() => {
          qe.classList.remove('bad', 'sel'); ce.classList.remove('bad', 'sel'); selQ = selC = null; lock = false;
          if (level === 3 && bad[qi] >= 2 && !cards[qi].classList.contains('done')) { cards[qi].classList.remove('hid'); lock = true; later(() => { cards[qi].classList.add('hid'); lock = false; }, 1500); }
        }, 700);
      }
    };
    cards.forEach((c, n) => c.onclick = () => { if (lock || c.classList.contains('done')) return; cards.forEach(z => z.classList.remove('sel')); c.classList.add('sel'); selQ = n; evalPair(); });
    opts.forEach((o, n) => o.onclick = () => { if (lock || o.classList.contains('done')) return; opts.forEach(z => z.classList.remove('sel')); o.classList.add('sel'); selC = n; evalPair(); });
    // 그림을 모두 불러온 뒤 시작
    const imgs = [...root.querySelectorAll('img')], loaded = Promise.all(imgs.map(i => (i.complete ? 0 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))));
    Promise.race([loaded, new Promise(r => setTimeout(r, 3000))]).then(() => {
      if (gone || !root.contains(mq)) return;
      Speech.stop(); Speech.play(PLAY_LINES.p_q_match, null, 'p_q_match');
      if (level === 2) { mc.style.visibility = ''; lock = false; return; }
      bar.style.visibility = ''; const fill = bar.firstElementChild; fill.style.transition = 'none'; fill.style.width = '100%'; void fill.offsetWidth; fill.style.transition = `width ${VIEW}ms linear`; fill.style.width = '0';
      later(() => { hide(true); bar.style.visibility = 'hidden'; mc.style.visibility = ''; lock = false; }, VIEW);
    });
  };
  next();
};
