/* 놀이 · 과일 받기: 20초 동안 바구니를 좌우로 움직여 떨어지는 과일 받기 (기록은 따로 저장) */
const FRUITS = [['grape', '포도'], ['watermelon', '수박'], ['strawberry', '딸기'], ['apple', '사과'], ['banana', '바나나'], ['peach', '복숭아'], ['tangerine', '귤'], ['lemon', '레몬'], ['cherries', '체리'], ['pineapple', '파인애플']];
const FR_LV = {
  1: { name: '쉬움', good: 1, bad: 0, every: .8, fall: 2.8, bg: '#b8e6a1', sub: '받을 과일 1종' },
  2: { name: '보통', good: 1, bad: 1, every: .55, fall: 2.3, bg: '#ffd166', sub: '받기 1종 · 피하기 1종' },
  3: { name: '어려움', good: 2, bad: 2, every: .4, fall: 2.0, bg: '#d9c8f5', sub: '받기 2종 · 피하기 2종' } };
const FR_TIME = 20, _fi = k => `assets/images/play/fruit_${k}.svg`;
App.fruitMenu = function () {
  Speech.stop();
  const fr = this.prof().fruit || {};
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="clr">🔄 기록 지우기</button></span></header>
    <main class="home"><div class="crumb">🧩 놀이</div><h1>어떤 난이도로 할까요?</h1><div class="cards">${[1, 2, 3].map(l => { const c = FR_LV[l]; return `<button class="card nm" data-l="${l}" style="background:${c.bg}"><b>${c.name}</b><span>${c.sub}</span><span>${fr[l] != null ? '🏆 ' + fr[l] + '개' : '기록 없음'}</span></button>`; }).join('')}</div></main>`;
  this.root.querySelector('#back').onclick = () => this.playMenu();
  this.root.querySelector('#clr').onclick = () => {
    const p = this.prof(); if (!p.fruit || !Object.keys(p.fruit).length) return this.toast('지울 기록이 없어요');
    if (!confirm('과일 받기 기록을 모두 지울까요?')) return;
    p.fruit = {}; this.save(); this.toast('기록을 지웠어요'); this.fruitMenu();
  };
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => { _sfx.init(); this.fruitBrief(+b.dataset.l); });
};
App.fruitBrief = function (level) {   // 게임 전 안내: 받을 과일 / 피할 과일
  const L = FR_LV[level], pick = [...FRUITS].sort(() => Math.random() - .5), good = pick.slice(0, L.good), bad = pick.slice(L.good, L.good + L.bad);
  const row = (arr, cls, mark, label) => arr.length ? `<div class="frrow ${cls}"><span class="frlab">${mark} ${label}</span>${arr.map(f => `<span class="frf"><img src="${_fi(f[0])}" alt="${f[1]}"><small>${f[1]}</small></span>`).join('')}</div>` : '';
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home frbrief"><h1>${L.name} · 오늘의 과일</h1>${row(good, 'ok', '✔', '받아요')}${row(bad, 'no', '✖', '피해요')}
    <button class="chip big" id="go">게임 시작</button><button class="chip" id="hear">🔊 다시 듣기</button></main>`;
  const say = () => { Speech.stop(); Speech.seq([...good.map(f => [`${f[1]}을(를) 받아요`, 'fr_g_' + f[0]]), ...bad.map(f => [`${f[1]}은(는) 피해요`, 'fr_b_' + f[0]])], null, 120); };
  this.root.querySelector('#back').onclick = () => { Speech.stop(); this.fruitMenu(); };
  this.root.querySelector('#hear').onclick = say;
  this.root.querySelector('#go').onclick = () => { _sfx.init(); Speech.stop(); this.fruitGame(level, good.map(f => f[0]), bad.map(f => f[0])); };
  setTimeout(say, 300);
};
App.fruitGame = function (level, good, bad) {
  const L = FR_LV[level], root = this.root;
  let gone = false, raf = 0, score = 0, running = false, bonus = 0;   // bonus: 받으면 +0.2초, 피할 과일을 받으면 -0.1초
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="fs">🧺 0개</span><span class="chip" id="ft">⏱ ${FR_TIME}</span></header>
    <main class="game frg"><div class="frfield" id="ff"><div class="spcd" id="cd"></div><img class="frbk" id="bk" src="${_fi('basket')}" alt=""></div></main>`;
  const ff = root.querySelector('#ff'), bk = root.querySelector('#bk'), cd = root.querySelector('#cd'), fs = root.querySelector('#fs'), ft = root.querySelector('#ft');
  const leave = () => { gone = true; cancelAnimationFrame(raf); Speech.stop(); };
  root.querySelector('#back').onclick = () => { leave(); App.fruitMenu(); };
  const timers = []; const later = (fn, ms) => timers.push(setTimeout(() => { if (!gone) fn(); }, ms));
  const W = () => ff.clientWidth, H = () => ff.clientHeight;
  let bx = 0; const bw = () => bk.offsetWidth;
  bk.style.width = Math.min(150, W() * .3) * (level === 3 ? .8 : 1) + 'px';
  const setBx = x => { bx = Math.max(bw() / 2, Math.min(W() - bw() / 2, x)); bk.style.transform = `translateX(${bx - bw() / 2}px)`; };
  const move = e => { if (!running) return; const r = ff.getBoundingClientRect(); setBx(e.clientX - r.left); e.preventDefault(); };
  ff.addEventListener('pointerdown', e => { try { ff.setPointerCapture(e.pointerId); } catch (_) { } move(e); });
  ff.addEventListener('pointermove', move);
  setBx(W() / 2);
  const fx = []; let sz = 56;
  const recent = [];   // 최근에 나온 과일 {t, x, bad} — 받을/피할 과일이 한꺼번에 겹쳐 억지로 받아지는 일을 막음
  const okPos = (x, isBad, t) => {
    const near = recent.filter(r => t - r.t < .7), R = bw() * .35 + sz * .3;
    if (near.some(r => r.bad !== isBad && Math.abs(x - r.x) < bw() + sz * .5)) return false;   // 반대 종류와 바구니 폭 이상 떨어져야 함
    if (isBad) {   // 피할 과일끼리도 피할 틈이 남아 있어야 함
      const bads = near.filter(r => r.bad).map(r => r.x).concat(x);
      let free = false; for (let c = bw() / 2; c <= W() - bw() / 2; c += 8) if (bads.every(b => Math.abs(b - c) > R)) { free = true; break; }
      if (!free) return false;
    }
    return true;
  };
  const NL = 6; let laneBag = [], typeBag = [], lastLane = -1;   // 가로 칸과 종류를 섞은 주머니에서 뽑아 골고루 퍼지게 함
  const nextType = () => { if (!typeBag.length) typeBag = bad.length ? (Math.random() < .5 ? [0, 0, 0, 0, 1] : [0, 0, 0, 1, 1]).sort(() => Math.random() - .5) : [0]; return typeBag.pop() === 1; };
  const nextLanes = () => { const l = Array.from({ length: NL }, (_, i) => i).sort(() => Math.random() - .5); if (l[0] === lastLane) l.push(l.shift()); return l; };
  const spawn = t => {
    let isBad = nextType(); if (isBad && t < 2) isBad = false;   // 처음 2초는 받을 과일만
    if (!laneBag.length) laneBag = nextLanes();
    let x = null, used = -1;
    for (let i = 0; i < laneBag.length && x === null; i++) {
      const lane = laneBag[i], lw = (W() - sz) / NL, cx = sz / 2 + lane * lw + lw * (.15 + Math.random() * .7);
      if (okPos(cx, isBad, t) && !recent.some(r => t - r.t < .6 && Math.abs(r.x - cx) < sz * 1.1)) { x = cx; used = i; }
    }
    if (x === null) return;   // 알맞은 자리가 없으면 이번에는 건너뜀
    lastLane = laneBag.splice(used, 1)[0];
    recent.push({ t, x, bad: isBad }); while (recent.length && t - recent[0].t > 1.5) recent.shift();
    const k = (isBad ? bad : good)[Math.floor(Math.random() * (isBad ? bad : good).length)];
    const el = document.createElement('img'); el.className = 'frfruit'; el.src = _fi(k); el.style.width = sz + 'px'; el.alt = ''; ff.appendChild(el);
    fx.push({ el, x, y: -sz, bad: isBad, v: (H() + sz) / (L.fall * (.9 + Math.random() * .2)) });
  };
  const pop = (txt, cls) => { const i = document.createElement('i'); i.className = 'frpop ' + cls; i.textContent = txt; i.style.left = Math.max(70, Math.min(W() - 70, bx)) + 'px'; ff.appendChild(i); later(() => i.remove(), 700); };
  const start = () => {
    sz = Math.max(44, Math.min(72, W() * .17));
    running = true; let t0 = performance.now(), last = t0, next = 0;
    const tick = now => {
      if (gone) return; const dt = Math.min(.05, (now - last) / 1000); last = now; const el = (now - t0) / 1000;
      ft.textContent = '⏱ ' + Math.max(0, Math.ceil(FR_TIME + bonus - el));
      if (el >= FR_TIME + bonus) return finish();
      if (el >= next) { spawn(el); next = el + L.every * (.85 + Math.random() * .3); }
      const bTop = H() - bk.offsetHeight, half = bw() * .5;
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i]; f.y += f.v * dt; f.el.style.transform = `translate(${f.x - sz / 2}px,${f.y}px)`;
        const cy = f.y + sz * .7;
        if (cy >= bTop + bk.offsetHeight * .12 && f.y < H() - bk.offsetHeight * .35 && Math.abs(f.x - bx) <= half * .7) {
          if (f.bad) { score = Math.max(0, score - 1); bonus -= .1; _sfx.bad(); bk.classList.remove('shk'); void bk.offsetWidth; bk.classList.add('shk'); pop('-1 · -0.1초', 'no'); }
          else { score++; bonus += .2; _sfx.ok(); pop('+1 · +0.2초', 'ok'); }
          fs.textContent = `🧺 ${score}개`; f.el.remove(); fx.splice(i, 1);
        } else if (f.y > H()) { f.el.remove(); fx.splice(i, 1); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  const finish = () => {
    running = false; cancelAnimationFrame(raf); fx.forEach(f => f.el.remove());
    const p = App.prof(); p.fruit = p.fruit || {}; const best = p.fruit[level], isNew = best != null && score > best;
    if (best == null || score > best) { p.fruit[level] = score; App.save(); }
    root.innerHTML = `<main class="home result"><h1>${isNew ? '대단해요! 신기록이에요!' : '끝났어요!'}</h1>
      <div class="rstars"><span class="rs on" style="--i:0">${isNew ? '🏆' : '🧺'}</span></div>
      <div class="rscore">받은 과일 <b>${score}개</b><br><small>${L.name} 최고 기록 ${p.fruit[level]}개${best == null ? ' · 첫 기록이에요!' : ''}</small></div>
      <div class="rbtns"><button class="chip big" id="again">다시 하기</button><button class="chip big" id="quit">그만하기</button></div></main>`;
    root.querySelector('#again').onclick = () => { leave(); _sfx.init(); App.fruitBrief(level); };
    root.querySelector('#quit').onclick = () => { leave(); App.fruitMenu(); };
    if (isNew) later(() => Speech.play('대단해요! 신기록이에요!', null, 'p_speed_new'), 500);
  };
  [3, 2, 1].forEach((c, k) => later(() => { cd.textContent = c; cd.classList.remove('go'); void cd.offsetWidth; cd.classList.add('go'); }, k * 800));
  later(() => { cd.textContent = ''; start(); }, 2400);
};
