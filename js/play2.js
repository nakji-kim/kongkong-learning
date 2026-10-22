// 놀이 : 다른 그림 찾기 / 어울리는 그림 찾기 / 숨은 그림 찾기  (각 쉬움·보통·어려움)
App.oddMenu = function () {
  this.cardMenu('다른 그림 찾기', [
    { b: '🍎🍎🍅', bs: 'font-size:1.8rem', t: '쉬움', bg: '#8ddc9b', go: () => this.oddGame(1) },
    { b: '🐶🐶🐶🐶', bs: 'font-size:1.4rem', t: '보통', bg: '#6ec6ff', go: () => this.oddGame(2) },
    { b: '🐜🐜🐜🐜🐜🐜', bs: 'font-size:1.15rem', t: '어려움', bg: '#ff9aa8', go: () => this.oddGame(3) },
  ], () => this.playMenu(), 'play');
};
App.mateMenu = function () {
  this.cardMenu('어울리는 그림 찾기', [
    { b: '🧦👟', bs: 'font-size:2.2rem', t: '쉬움 · 보기 2개', bg: '#8ddc9b', go: () => this.mateGame(1) },
    { b: '🐰🥕', bs: 'font-size:2.2rem', t: '보통 · 보기 3개', bg: '#6ec6ff', go: () => this.mateGame(2) },
    { b: '🐶🦴', bs: 'font-size:2.2rem', t: '어려움 · 보기 4개', bg: '#ff9aa8', go: () => this.mateGame(3) },
  ], () => this.playMenu(), 'play');
};
App.hideMenu = function () {
  this.cardMenu('숨은 그림 찾기', [
    { b: '🔎', t: '쉬움 · 2개', bg: '#8ddc9b', go: () => this.hideGame(1) },
    { b: '🔎🔎', bs: 'font-size:2.4rem', t: '보통 · 3개', bg: '#6ec6ff', go: () => this.hideGame(2) },
    { b: '🔎🔎🔎', bs: 'font-size:1.9rem', t: '어려움 · 5개', bg: '#ff9aa8', go: () => this.hideGame(3) },
  ], () => this.playMenu(), 'play');
};

/* ---------- 다른 그림 찾기 ---------- */
App.oddGame = function (level) {
  // 쉬움: 비슷하게 생긴 그림 9장 중 다른 그림 · 보통/어려움: 같은 그림 4/6장 중 모양이 살짝 다른 1장
  const N = [9, 4, 6][level - 1], cols = [3, 2, 3][level - 1], ids = [];
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
  this.quiz(make, () => App.oddGame(level), () => App.oddMenu(), 'odd g' + cols);
};

/* ---------- 어울리는 그림 찾기 ---------- */
App.mateGame = function (level) {
  App._pre = new Audio('assets/audio/p_mt_end.mp3'); App._pre.preload = 'auto';   // 뒤 문장을 미리 불러와 두 문장 사이 지연을 줄임
  const ids = []; MATCH_PAIRS.forEach((p, i) => { ids.push(i + ':0', i + ':1'); });
  const make = () => {
    const pid = App.pickNew('mat' + level, ids, { random: true }), [i, dir] = pid.split(':').map(Number), p = MATCH_PAIRS[i];
    const show = dir ? [p[3], p[4]] : [p[0], p[1]], ans = dir ? [p[0], p[1], p[2]] : [p[3], p[4], p[5]], side = dir ? 0 : 3;
    const others = MATCH_PAIRS.filter((_, j) => j !== i), same = others.filter(o => o[6] === p[6]), pool = _shuf(level === 3 && same.length >= 3 ? same : others);
    const wrong = pool.slice(0, level).map(o => [o[side], o[side + 1]]);   // 틀린 보기: 쉬움 1개 · 보통 2개 · 어려움 3개 (정답 포함 2·3·4개)
    return {
      key: 'mt:' + i, done: ['mat' + level, pid], answer: ans[0], q: _line('p_q_match'), once: true,
      a: [[PLAY_LINES['p_mt_' + i], 'p_mt_' + i], [PLAY_LINES.p_mt_end, 'p_mt_end']],   // "A와 B는" + 공통 "짝꿍이에요!" 를 끊김 없이 이어 읽음
      stage: `<div class="pcard">${pimg(show[1])}</div>`,
      choices: _shuf([[ans[0], ans[1]], ...wrong]).map(([k, c]) => ({ id: k, cls: 'pimg', html: pimg(c) })),
    };
  };
  this.quiz(make, () => App.mateGame(level), () => App.mateMenu());
};

/* ---------- 숨은 그림 찾기 ---------- */
App.hideGame = function (level) {
  const root = this.root, T = [2, 3, 5][level - 1], CL = [8, 16, 28][level - 1], SZ = [21, 16.5, 13.5][level - 1];
  const scenes = _shuf(HIDE_SCENES).slice(0, 3);
  let si = 0, miss = 0, found, locked = true;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🔎 0/3</span></header>
    <main class="game mg hide"><div class="hbar" id="hbar"></div><div class="hbox" id="hbox"></div></main>`;
  root.querySelector('#back').onclick = () => { Speech.stop(); App.hideMenu(); };
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
    root.querySelector('#stars').textContent = `🔎 ${si}/3`; found = 0; locked = true;
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
              if (si >= 3) { const stars = miss === 0 ? 5 : miss <= 3 ? 4 : miss <= 6 ? 3 : miss <= 10 ? 2 : 1; App.finishRound(stars, 5, () => App.hideGame(level), () => App.hideMenu(), { label: `별 <b>${stars}</b>개를 받았어요`, say: _line('p_ms_' + stars) }); }
              else start();
            }, 500), '_praise' + pi);
          }, 900);
        }
      } else if (!t) {
        miss++; const r = box.getBoundingClientRect(); const w = document.createElement('i'); w.className = 'hmiss'; w.style.left = (e.clientX - r.left) + 'px'; w.style.top = (e.clientY - r.top) + 'px'; box.appendChild(w); setTimeout(() => w.remove(), 600);
        const now = Date.now(); if (!start.last || now - start.last > 4000) { start.last = now; Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2'); }
      }
    };
    locked = false;
    setTimeout(() => { if (si < 3) Speech.play(PLAY_LINES.p_q_hide, () => setTimeout(() => { let i = 0; const nx = () => { if (i < tk.length && !locked) say(tk[i++], () => setTimeout(nx, 150)); }; nx(); }, 150), 'p_q_hide'); }, 400);
  }
  const spark = el => { const r = el.getBoundingClientRect(); for (let i = 0; i < 6; i++) { const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨'][i % 2]; s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--x:${Math.round(Math.random() * 80 - 40)}vmin;--y:${Math.round(Math.random() * 60 - 40)}vmin`; document.body.appendChild(s); setTimeout(() => s.remove(), 1300); } };
  start();
};
