// 미로 찾기: 길을 따라 손가락으로 선을 그려 친구를 도착점까지 데려다 줌 (매번 새 미로, 한 판 · 걸린 시간 기록)
// 쉬움 5×5 연못(아기 오리→엄마 오리) · 보통 8×8 잔디(토끼→당근) · 어려움 11×11 우주(로켓→지구)
const MAZE_LV = {
  1: { n: 5, bg: '#7cc6f2', ring: '#5aaee0', from: '1f425', to: '1f986', line: '#ff9f1c', say: ['maze_q1', '선을 그려서 아기 오리를 엄마 오리에게 데려다 주세요!'], deco: ['1fab7', '1fab7', '1f41f'] },
  2: { n: 8, bg: '#8fd36f', ring: '#6dbb4c', from: '1f430', to: '1f955', line: '#ff5c8a', say: ['maze_q2', '선을 그려서 토끼가 당근을 찾게 도와주세요!'], deco: ['1f33c', '1f344', '1f33b'] },
  3: { n: 11, bg: '#2b2f6b', ring: '#3d4290', from: '1f680', to: '1f30d', line: '#ffd23f', say: ['maze_q3', '선을 그려서 로켓을 지구로 보내 주세요!'], deco: ['2b50', '1fa90', '2728'] },
};
App.mazeMenu = function () {
  Speech.stop();
  const mz = this.prof().maze || {};
  const cards = [[1, '🐥', '쉬움 · 연못', '#8ddc9b'], [2, '🐰', '보통 · 잔디밭', '#6ec6ff'], [3, '🚀', '어려움 · 우주', '#ff9aa8']];
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="clr">🔄 기록 지우기</button></span></header>
    <main class="home"><div class="crumb">🧩 놀이</div><h1>어떤 난이도로 할까요?</h1><div class="cards">${cards.map(([l, e, t, bg]) => `<button class="card nm spcard" data-l="${l}" style="background:${bg}"><b>${e}</b><span class="spr">${t}</span><small class="sps">${MAZE_LV[l].n}×${MAZE_LV[l].n} 판</small><small class="spb">${mz[l] ? '🏆 ' + _fmt(mz[l]) : '기록 없음'}</small></button>`).join('')}</div></main>`;
  this.root.querySelector('#back').onclick = () => this.playMenu();
  this.root.querySelector('#clr').onclick = () => {
    const p = this.prof(); if (!p.maze || !Object.keys(p.maze).length) return this.toast('지울 기록이 없어요');
    if (!confirm('미로 기록을 모두 지울까요?')) return;
    p.maze = {}; this.save(); this.toast('기록을 지웠어요'); this.mazeMenu();
  };
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => { _sfx.init(); this.mazeGame(+b.dataset.l); });
};

// 미로 만들기: 구불구불 긴 길이 나오도록 깊이 우선(되돌아가기) 방식. 출발은 맨 윗줄, 도착은 맨 아랫줄
const makeMaze = n => {
  const open = Array.from({ length: n * n }, () => new Set()), seen = new Uint8Array(n * n), st = [Math.floor(Math.random() * n)];
  seen[st[0]] = 1;
  while (st.length) {
    const c = st[st.length - 1], r = Math.floor(c / n), k = c % n;
    const nb = [[r - 1, k], [r + 1, k], [r, k - 1], [r, k + 1]].filter(([y, x]) => y >= 0 && x >= 0 && y < n && x < n && !seen[y * n + x]);
    if (!nb.length) { st.pop(); continue; }
    const [y, x] = nb[Math.floor(Math.random() * nb.length)], d = y * n + x;
    open[c].add(d); open[d].add(c); seen[d] = 1; st.push(d);
  }
  const start = Math.floor(Math.random() * n);   // 출발: 0행
  // 도착: 맨 아랫줄 중 출발에서 가장 먼 칸 (너무 짧은 미로 방지)
  const dist = new Int16Array(n * n).fill(-1), q = [start]; dist[start] = 0;
  while (q.length) { const c = q.shift(); open[c].forEach(d => { if (dist[d] < 0) { dist[d] = dist[c] + 1; q.push(d); } }); }
  let goal = (n - 1) * n; for (let k = 0; k < n; k++) if (dist[(n - 1) * n + k] > dist[goal]) goal = (n - 1) * n + k;
  return { n, open, start, goal, dist };
};
// 미로 안에서 a→b 가장 짧은 길 (손가락이 빨리 움직여도 길을 따라 이어 주려고)
const mazeRoute = (M, a, b, lim) => {
  if (a === b) return [a];
  const prev = new Map([[a, -1]]), q = [a];
  while (q.length) { const c = q.shift(); for (const d of M.open[c]) if (!prev.has(d)) { prev.set(d, c); if (d === b) { const p = [b]; let x = c; while (x !== -1) { p.unshift(x); x = prev.get(x); } return p.length - 1 <= lim ? p : null; } q.push(d); } }
  return null;
};

App.mazeGame = function (level) {
  Speech.stop();
  const root = this.root, L = MAZE_LV[level], name = ['', '쉬움', '보통', '어려움'][level];
  let gone = false, busy = true, t0 = 0, iv = null, timers = [];
  const later = (fn, ms) => { const t = setTimeout(() => { if (!gone) fn(); }, ms); timers.push(t); return t; };
  const leave = () => { gone = true; timers.forEach(clearTimeout); clearInterval(iv); Speech.stop(); };
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⏱ 0.0초</span></header>
    <main class="game maze"><div class="mzbox" id="mb"><canvas id="mc"></canvas><div class="mzch" id="mf"></div><div class="mzch mzgoal" id="mt"></div></div>
      <div class="mzbt"><button class="chip" id="mclr">↺ 처음부터</button></div><div class="spcd" id="cd"></div></main>`;
  const $ = s => root.querySelector(s), mb = $('#mb'), cv = $('#mc'), cx = cv.getContext('2d'), mf = $('#mf'), mt = $('#mt'), stars = $('#stars');
  $('#back').onclick = () => { leave(); App.mazeMenu(); };
  mf.innerHTML = pimg(L.from, 'mzimg'); mt.innerHTML = pimg(L.to, 'mzimg');
  let M, S, cs, pad, way, done, onSol;
  const cen = c => [pad + (c % M.n + .5) * cs, pad + cs * .9 + (Math.floor(c / M.n) + .5) * cs];   // 위쪽에 출발 친구 자리
  function draw() {
    const dpr = Math.min(2, devicePixelRatio || 1), W = S, H = S + cs * 1.8;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; mb.style.width = W + 'px'; mb.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    // 바탕 (둥근 판) + 물결/별 같은 작은 무늬
    cx.fillStyle = L.bg; cx.beginPath(); cx.roundRect(0, cs * .9 - pad * .2, W, S + pad * .4, 22); cx.fill();
    cx.strokeStyle = L.ring; cx.lineWidth = 2; for (let i = 0; i < M.n * 1.5; i++) { const x = (i * 97 % 100) / 100 * W, y = cs + ((i * 61) % 100) / 100 * (S - cs * .3); cx.beginPath(); cx.ellipse(x, y, cs * .28, cs * .1, 0, 0, 7); cx.stroke(); }
    // 길: 흰 굵은 선으로 칸 가운데를 이음 (끝이 둥글어 연못 미로처럼 보임)
    const road = (w, col) => { cx.strokeStyle = col; cx.lineWidth = w; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.beginPath();
      M.open.forEach((s, c) => s.forEach(d => { if (d > c) { const [x1, y1] = cen(c), [x2, y2] = cen(d); cx.moveTo(x1, y1); cx.lineTo(x2, y2); } }));
      const [sx, sy] = cen(M.start), [gx, gy] = cen(M.goal); cx.moveTo(sx, sy); cx.lineTo(sx, sy - cs); cx.moveTo(gx, gy); cx.lineTo(gx, gy + cs); cx.stroke(); };
    road(cs * .72 + 4, 'rgba(0,0,0,.10)'); road(cs * .72, '#fff');
    // 그린 선
    if (way.length) { cx.strokeStyle = L.line; cx.lineWidth = Math.max(6, cs * .26); cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.beginPath();
      const [sx, sy] = cen(M.start); cx.moveTo(sx, sy - cs * .55); way.forEach(c => { const [x, y] = cen(c); cx.lineTo(x, y); }); if (done) { const [gx, gy] = cen(M.goal); cx.lineTo(gx, gy + cs * .55); } cx.stroke(); }
    // 친구 위치
    const head = way.length ? cen(way[way.length - 1]) : (([x, y]) => [x, y - cs * .55])(cen(M.start)), [gx, gy] = cen(M.goal), F = Math.max(34, cs * 1.05);
    Object.assign(mf.style, { width: F + 'px', height: F + 'px', left: head[0] - F / 2 + 'px', top: head[1] - F / 2 - (way.length ? 0 : cs * .25) + 'px' });
    Object.assign(mt.style, { width: F * 1.1 + 'px', height: F * 1.1 + 'px', left: gx - F * .55 + 'px', top: gy + cs * .55 - F * .3 + 'px' });
  }
  const size = () => { S = Math.floor(Math.min(innerWidth - 72, (innerHeight - 170) / (1 + 1.8 / L.n), 520)); pad = S * .02; cs = (S - pad * 2) / L.n; };
  function start() {
    M = makeMaze(L.n); way = []; done = false;
    // 정답 길 (틀린 길로 들어간 칸 수를 세려고)
    const sol = mazeRoute(M, M.start, M.goal, 1e4); onSol = new Set(sol);
    size(); draw();
    const cd = $('#cd'); busy = true;   // 3·2·1 세고 나서 시작 (순발력과 같은 방식)
    [3, 2, 1].forEach((c, k) => later(() => { cd.textContent = c; cd.classList.remove('go'); void cd.offsetWidth; cd.classList.add('go'); }, k * 800));
    later(() => { cd.textContent = ''; busy = false; t0 = Date.now(); iv = setInterval(() => { stars.textContent = '⏱ ' + _fmt(Date.now() - t0); }, 100); }, 2400);
  }
  // 손가락 위치 → 칸 (길 밖이면 -1)
  const cellAt = (x, y) => { const k = Math.floor((x - pad) / cs), r = Math.floor((y - pad - cs * .9) / cs); return k >= 0 && r >= 0 && k < M.n && r < M.n ? r * M.n + k : -1; };
  let drawing = false;
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const near = (x, y) => { const head = way.length ? cen(way[way.length - 1]) : cen(M.start); return Math.hypot(x - head[0], y - head[1]) < cs * (way.length ? 1.2 : 1.6); };
  mb.onpointerdown = e => {
    if (done || busy) return; e.preventDefault(); _sfx.init(); const [x, y] = pos(e);
    if (!near(x, y)) { mf.classList.remove('mzhint'); void mf.offsetWidth; mf.classList.add('mzhint'); return; }   // 선 끝(친구)에서 시작해야 함
    drawing = true; try { mb.setPointerCapture(e.pointerId); } catch (x) { }
    if (!way.length) { way = [M.start]; draw(); }
  };
  mb.onpointermove = e => {
    if (!drawing || done) return; e.preventDefault(); const [x, y] = pos(e), c = cellAt(x, y);
    if (c < 0 || c === way[way.length - 1]) return;
    const r = mazeRoute(M, way[way.length - 1], c, 3); if (!r) return;   // 벽 너머로는 선이 안 나감
    r.slice(1).forEach(d => { const i = way.indexOf(d); if (i >= 0) way.length = i + 1; else { way.push(d); } });   // 되돌아가면 선이 지워짐
    draw();
    if (way[way.length - 1] === M.goal) win();
  };
  const up = () => { drawing = false; };
  mb.onpointerup = up; mb.onpointercancel = up;
  $('#mclr').onclick = () => { if (done || busy) return; way = []; draw(); };
  function win() {
    done = true; busy = true; drawing = false; clearInterval(iv); const total = Date.now() - t0; stars.textContent = '⏱ ' + _fmt(total);
    draw(); _sfx.ok(); mt.classList.add('mzwin'); _artBurst(mt, 16);
    const p = App.prof(); p.maze = p.maze || {}; const best = p.maze[level], isNew = best != null && total < best;
    if (best == null || total < best) { p.maze[level] = total; App.save(); }
    _artPraise(() => later(() => {
      root.innerHTML = `<main class="home result"><h1>${isNew ? '대단해요! 신기록이에요!' : '도착했어요!'}</h1>
        <div class="rstars"><span class="rs on" style="--i:0">${isNew ? '🏆' : '⏱'}</span></div>
        <div class="rscore">내 기록 <b>${_fmt(total)}</b><br><small>${name} 최고 기록 ${_fmt(p.maze[level])}${best == null ? ' · 첫 기록이에요!' : ''}</small></div>
        <div class="rbtns"><button class="chip big" id="again">다시 하기</button><button class="chip big" id="quit">그만하기</button></div></main>`;
      root.querySelector('#again').onclick = () => { leave(); _sfx.init(); App.mazeGame(level); };
      root.querySelector('#quit').onclick = () => { leave(); App.mazeMenu(); };
      if (isNew) later(() => Speech.play('대단해요! 신기록이에요!', null, 'p_speed_new'), 500);
    }, 500));
  }
  App._mz = { M: () => M, cen, box: () => mb.getBoundingClientRect(), way: () => way };   // 테스트용
  start();
  addEventListener('resize', function rs() { if (gone || !root.contains(mb)) return removeEventListener('resize', rs); size(); draw(); });   // 화면 돌리면 크기만 다시
};
