// 시계 > 시 / 분 : 아날로그 시계 읽기. 시침=빨강(짧고 굵게), 분침=파랑(길고 가늘게)
const HOUR_C = '#ff4d6d', MIN_C = '#2f80ed';
App.clockMenu = function () {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><h1>어떤 공부를 할까요?</h1>
      <div class="cards">
        <button class="card al" data-k="hour" style="background:#ffb3c1"><b>🕒</b><span>시</span></button>
        <button class="card al" data-k="min" style="background:#a8d0ff"><b>🕧</b><span>분</span></button>
        <button class="card al" data-k="all" style="background:#b8a1f0"><b>🕘</b><span>종합</span></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.home();
  this.addClr('clock');
  this.root.querySelectorAll('.al').forEach(b => b.onclick = () => this.clockGame(b.dataset.k));
};

App.clockSvg = function (h, m) {
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
  let s = '<svg viewBox="0 0 200 200" class="clk"><circle cx="100" cy="100" r="96" fill="#fff" stroke="#4a3b52" stroke-width="5"/>';
  for (let i = 0; i < 60; i++) { const big = i % 5 === 0, a = pt(i * 6, 90), b = pt(i * 6, big ? 82 : 86); s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#4a3b52" stroke-width="${big ? 3 : 1.2}" stroke-linecap="round"/>`; }
  for (let i = 1; i <= 12; i++) { const p = pt(i * 30, 69); s += `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="800" fill="#3b2f4a">${i}</text>`; }
  const hd = ((h % 12) + m / 60) * 30, md = m * 6, hp = pt(hd, 40), mp = pt(md, 62);
  s += `<line x1="100" y1="100" x2="${hp[0]}" y2="${hp[1]}" stroke="${HOUR_C}" stroke-width="10" stroke-linecap="round"/>`;
  s += `<line x1="100" y1="100" x2="${mp[0]}" y2="${mp[1]}" stroke="${MIN_C}" stroke-width="5.5" stroke-linecap="round"/>`;
  return s + '<circle cx="100" cy="100" r="6" fill="#4a3b52"/></svg>';
};

App.clockGame = function (mode) {
  const p = this.prof(), root = this.root;
  const HW = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
  const MW = { 0: '영', 5: '오', 10: '십', 15: '십오', 20: '이십', 25: '이십오', 30: '삼십', 35: '삼십오', 40: '사십', 45: '사십오', 50: '오십', 55: '오십오' };
  const MINS = [0, 30, 15, 45, 5, 10, 20, 25, 35, 40, 50, 55];       // 쉬운 것부터
  const isH = mode === 'hour', isA = mode === 'all', unit = isH ? '시' : '분';
  const qText = isA ? '지금 몇 시 몇 분일까요?' : isH ? '지금 몇 시일까요?' : '긴 바늘은 몇 분을 가리킬까요?', qName = isA ? 'c_q_all' : isH ? 'c_q_hour' : 'c_q_min';
  const aText = v => isH ? `${HW[v]} 시예요!` : (v === 0 ? '영 분, 정각이에요!' : `${MW[v]} 분이에요!`), aName = v => (isH ? 'c_h_' : 'c_m_') + v;
  const HRS = Array.from({ length: 12 }, (_, i) => i + 1);
  const label = id => { const [h, m] = id.split(':').map(Number); return `${h}시 ${m === 0 ? '정각' : m + '분'}`; };   // "3시 15분", "3시 정각"
  const aParts = id => { const [h, m] = id.split(':').map(Number); return [[`${HW[h]} 시`, 'ct_h_' + h], [m === 0 ? '정각이에요' : `${MW[m]} 분이에요`, 'ct_m_' + m]]; };
  const st = k => (p.stats[k] = p.stats[k] || { ok: 0, bad: 0 });
  const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  let good = 0, qn = 0, v, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/10`; };

  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/10</span></header>
    <main class="game mg"><div class="clegend"><span style="--c:${HOUR_C}">짧은 바늘 = 시</span><span style="--c:${MIN_C}">긴 바늘 = 분</span></div>
    <div class="cstage" id="cstage"></div><div class="eq ceq" id="eq"></div><div class="choices" id="ch"></div></main>`;
  root.querySelector('#back').onclick = () => App.clockMenu();

  function next() {
    qn++; upd(); locked = true; tries = 0;
    const w = n => Math.max(0.5, 1 + 2 * st('ch:' + n).bad - 0.5 * st('ch:' + n).ok);   // 자주 틀린 시간 ↑
    const ALL = []; HRS.forEach(h => MINS.forEach(m => ALL.push(h + ':' + m)));
    v = isA ? App.pickNew('ca', ALL, { random: true }) : isH ? App.pickNew('ch', HRS, { weight: w }) : App.pickNew('cm', MINS, { random: true });   // 모두 랜덤 · 푼 것은 건너뜀 (분은 5분 단위만)
    const hh = isA ? +v.split(':')[0] : isH ? v : 1 + Math.floor(Math.random() * 12), mm = isA ? +v.split(':')[1] : isH ? 0 : v;
    root.querySelector('#cstage').innerHTML = App.clockSvg(hh, mm);
    root.querySelector('#eq').innerHTML = isA ? '<span class="blank wideb" id="blank">?</span>' : `<span class="blank" id="blank">?</span><span>${unit}</span>`;
    let wrong;
    if (isA) {   // 시 또는 분만 다른 보기 + 둘 다 다른 보기
      const set = new Set(), mk = (h, m) => h + ':' + m, oh = () => HRS.filter(x => x !== hh), om = () => MINS.filter(x => x !== mm);
      const tryAdd = t => { if (t !== v && set.size < 3) set.add(t); };
      tryAdd(mk(hh, shuffle(om())[0])); tryAdd(mk(shuffle(oh())[0], mm)); tryAdd(mk((hh % 12) + 1, mm));
      while (set.size < 3) tryAdd(mk(shuffle(oh())[0], shuffle(MINS)[0]));
      wrong = [...set];
    } else if (isH) { const all = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => n !== v); const near = [(v % 12) + 1, ((v + 10) % 12) + 1, ((v + 1) % 12) + 1, ((v + 9) % 12) + 1]; wrong = [...shuffle(near.filter(n => n !== v)), ...shuffle(all)].filter((n, i, a) => a.indexOf(n) === i).slice(0, 3); }
    else { wrong = shuffle(MINS.filter(n => n !== v)).slice(0, 3); }   // 보기도 5분 단위만
    root.querySelector('#ch').innerHTML = shuffle([v, ...wrong]).map(n => `<button class="cb wide" data-n="${n}">${isA ? label(n) : n + unit}</button>`).join('');
    root.querySelectorAll('.cb').forEach(b => b.onclick = () => pick(b));
    locked = false; setTimeout(() => Speech.play(qText, null, qName), 400);   // 질문은 한 번만 읽음
  }
  function pick(b) {
    if (locked || b.classList.contains('wrong')) return;
    const n = isA ? b.dataset.n : +b.dataset.n, s = st((isA ? 'ca:' : isH ? 'ch:' : 'cm:') + v);
    if (n === v) {
      locked = true; if (tries === 0) { s.ok++; good++; } App.save(); App.markDone(isA ? 'ca' : isH ? 'ch' : 'cm', v); upd();
      b.classList.add('right');
      const bl = root.querySelector('#blank'); bl.textContent = isA ? label(v) : v; bl.classList.add('filled');
      root.querySelectorAll('.cb').forEach(x => x !== b && x.classList.add('fade'));
      burst();
      const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => (isA ? Speech.seq : Speech.play).call(Speech, isA ? aParts(v) : aText(v), () => setTimeout(() => qn >= 10 ? App.finishRound(good, 10, () => App.clockGame(mode), () => App.clockMenu()) : next(), 800), isA ? undefined : aName(v)), '_praise' + pi);
    } else {
      tries++; s.bad++; App.save(); b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 생각해 볼까요?', null, '_retry2');
      if (tries >= 2) root.querySelectorAll('.cb').forEach(x => (isA ? x.dataset.n : +x.dataset.n) === v && x.classList.add('hint'));
    }
  }
  function burst() {
    const stg = root.querySelector('#cstage');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨', '💛'][i % 3];
      s.style.setProperty('--x', (Math.random() * 120 - 60) + 'vmin'); s.style.setProperty('--y', (Math.random() * 60 - 30) + 'vmin');
      stg.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
  }
  next();
};
