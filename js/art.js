/* 놀이 · 색칠놀이(칸 눌러 칠하기 / 자유롭게 칠하기) · 퍼즐(조각 맞추기)
   그림은 다른 그림 찾기에서 쓰는 코드 그림(ODD2)을 그대로 재사용합니다. */
const ART_KEYS = Object.keys(ODD2).filter(k => k !== 'ant');
const ART_COLORS = ['#ff5c5c', '#ff9f43', '#ffd93d', '#6bd66b', '#3fb8ff', '#7a6bff', '#ff8fc7', '#a8683a', '#ffffff'];
const ART_BG = ['#fff4d6', '#e3f4ff', '#e9f9e3', '#ffe6ee', '#efe8ff'];
const _artPaintable = el => /^(path|circle|ellipse|rect)$/.test(el.tagName) && el.getAttribute('fill') && el.getAttribute('fill') !== 'none'
  && !/^#2{3}(2{3})?$/.test(el.getAttribute('fill')) && !(el.tagName === 'circle' && +el.getAttribute('r') <= 2.2)   // 눈·코 같은 까만 부분과 점은 그대로 둠
  && !(el.getAttribute('style') || '').includes('display:none') && !el.closest('[style*="display:none"]');
// mode: 'fill' = 칸마다 흰색(눌러서 칠함) · 'line' = 선만 남김(자유 칠하기, 썸네일)
const _artSvg = (k, mode) => {
  const box = document.createElement('div'); box.innerHTML = ODD2[k].draw();
  const svg = box.firstElementChild;
  svg.querySelectorAll('path,circle,ellipse,rect').forEach(el => { if (_artPaintable(el)) { el.classList.add('pt'); el.setAttribute('fill', mode === 'fill' ? '#fff' : 'none'); if (el.getAttribute('stroke') === 'none') { el.setAttribute('stroke', _O); el.setAttribute('stroke-width', '1.8'); } } });
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  return svg.outerHTML;
};
const _artPuzzleUri = (k, bg) => {   // 퍼즐 그림: 연한 배경 위에 그린 그림 (조각마다 배경이 있어야 하므로)
  const s = ODD2[k].draw().replace(/(<svg[^>]*>)/, `$1<rect width="100" height="100" fill="${bg}" stroke="none"/>`);
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
};
const _artBurst = (host, n = 12) => {
  const r = host.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const e = document.createElement('i'); e.className = 'spark'; App.sparkFill(e, ['⭐', '✨', '💛'][i % 3]);
    e.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--x:${Math.round(Math.random() * 90 - 45)}vmin;--y:${Math.round(Math.random() * 60 - 35)}vmin`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 1400);
  }
};
const _artPraise = done => { const pi = Math.floor(Math.random() * 4); Speech.stop(); Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], done, '_praise' + pi); };

/* ---------- 색칠놀이 ---------- */
App.artMenu = function () {
  this.cardMenu('어떤 색칠을 할까요?', [
    { b: '🖌️', t: '칸 눌러 칠하기', bg: '#ffb3c1', go: () => this.artPick('fill') },
    { b: '🖍️', t: '자유롭게 칠하기', bg: '#a8d0ff', go: () => this.artPick('free') },
  ], () => this.playMenu(), undefined, '🧩 놀이');
};
App.artPick = function (mode) {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><div class="crumb">🧩 놀이</div><h1>어떤 그림을 칠할까요?</h1>
      <div class="artgrid">${ART_KEYS.map((k, i) => `<button class="agi" data-k="${k}" style="background:${ART_BG[i % ART_BG.length]}">${_artSvg(k, 'line')}</button>`).join('')}</div></main>`;
  this.root.querySelector('#back').onclick = () => this.artMenu();
  this.root.querySelectorAll('.agi').forEach(b => b.onclick = () => this.artGame(mode, b.dataset.k));
};
App.artGame = function (mode, key) {
  Speech.stop();
  const root = this.root, fill = mode === 'fill';
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="rst">🗑 지우기</button></span></header>
    <main class="game art"><div class="artbox" id="ab" style="background:#fff">${fill ? _artSvg(key, 'fill') : '<canvas id="ac"></canvas>' + _artSvg(key, 'line')}</div>
      <div class="palette" id="pal">${ART_COLORS.map((c, i) => `<button class="pc${i === 0 ? ' on' : ''}" data-c="${c}" style="background:${c}" aria-label="색"></button>`).join('')}${fill ? '' : '<button class="pc er" data-c="#ffffff">🧽</button>'}</div>
      ${fill ? '<button class="chip big" id="done">🎉 다 칠했어요</button>' : '<button class="chip big" id="done">🎉 다 그렸어요</button>'}</main>`;
  const box = root.querySelector('#ab'); let color = ART_COLORS[0], undo = [];
  setTimeout(() => { if (root.contains(box)) Speech.play(fill ? '칸을 눌러서 예쁘게 칠해 보세요!' : '손가락으로 마음껏 색칠해 보세요!', null, fill ? 'art_fill' : 'art_free'); }, 350);
  root.querySelector('#back').onclick = () => { Speech.stop(); this.artPick(mode); };
  root.querySelectorAll('.pc').forEach(b => b.onclick = () => { _sfx.init(); root.querySelectorAll('.pc').forEach(x => x.classList.remove('on')); b.classList.add('on'); color = b.dataset.c; });
  root.querySelector('#done').onclick = () => { _artBurst(box, 16); _sfx.init(); [784, 988, 1319].forEach((f, i) => setTimeout(() => _sfx.tone(f, f * 1.02, 0.16, 'sine', 0.45), i * 110)); _artPraise(() => setTimeout(() => this.artPick(mode), 400)); };
  if (fill) {
    box.querySelectorAll('.pt').forEach(el => el.onclick = e => { e.stopPropagation(); _sfx.init(); el.setAttribute('fill', color); el.classList.remove('pop'); void el.getBoundingClientRect(); el.classList.add('pop'); _sfx.tone(520 + Math.random() * 200, 700, 0.07, 'sine', 0.35); });
    root.querySelector('#rst').onclick = () => box.querySelectorAll('.pt').forEach(el => el.setAttribute('fill', '#fff'));
  } else {
    const cv = root.querySelector('#ac'), cx = cv.getContext('2d'); let drawing = null, W = 0;
    const size = () => { const r = box.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; cv.width = r.width * dpr; cv.height = r.height * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.fillStyle = '#fff'; cx.fillRect(0, 0, r.width, r.height); };
    size();
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const dot = (p, q) => { cx.strokeStyle = cx.fillStyle = color; cx.lineWidth = W / 12; cx.lineCap = cx.lineJoin = 'round'; cx.beginPath(); if (q) { cx.moveTo(q[0], q[1]); cx.lineTo(p[0], p[1]); cx.stroke(); } else { cx.arc(p[0], p[1], W / 24, 0, 7); cx.fill(); } };
    cv.style.touchAction = 'none';
    cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { } drawing = pos(e); dot(drawing, null); };
    cv.onpointermove = e => { if (!drawing) return; e.preventDefault(); const p = pos(e); dot(p, drawing); drawing = p; };
    cv.onpointerup = cv.onpointercancel = () => { drawing = null; };
    root.querySelector('#rst').onclick = () => size();
  }
};

/* ---------- 퍼즐 (조각 맞추기) ---------- */
const PUZ_LV = { 1: { r: 2, c: 2 }, 2: { r: 2, c: 3 }, 3: { r: 3, c: 3 } };
App.puzMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '🧩', t: '쉬움 · 4조각', bg: '#8ddc9b', go: () => this.puzGame(1) },
    { b: '🧩🧩', bs: 'font-size:2.4rem', t: '보통 · 6조각', bg: '#6ec6ff', go: () => this.puzGame(2) },
    { b: '🧩🧩🧩', bs: 'font-size:1.9rem', t: '어려움 · 9조각', bg: '#ff9aa8', go: () => this.puzGame(3) },
  ], () => this.playMenu(), undefined, '🧩 놀이');
};
App.puzGame = function (level) {
  Speech.stop();
  const root = this.root, { r: R, c: C } = PUZ_LV[level], TOTAL = 3, keys = _shuf(ART_KEYS).slice(0, TOTAL);
  let si = 0, miss = 0, gone = false;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">🧩 0/${TOTAL}</span></header>
    <main class="game puz"><div class="pboard" id="pb"></div><div class="ptray" id="pt"></div></main>`;
  root.querySelector('#back').onclick = () => { gone = true; Speech.stop(); App.puzMenu(); };
  const pb = root.querySelector('#pb'), pt = root.querySelector('#pt'), stars = root.querySelector('#stars');
  function start() {
    const bg = ART_BG[Math.floor(Math.random() * ART_BG.length)], uri = _artPuzzleUri(keys[si], bg);
    stars.textContent = `🧩 ${si}/${TOTAL}`;
    const S = Math.floor(Math.min(innerWidth - 28, innerHeight * (level === 3 ? .4 : .42), 380)), w = S / C, h = S / R, f = level === 3 ? .72 : .85;
    pb.style.cssText = `width:${S}px;height:${S}px;position:relative`;
    pb.innerHTML = `<div class="pghost" style="background-size:${S}px ${S}px;opacity:${level === 3 ? 0 : .22}"></div>` +
      Array.from({ length: R * C }, (_, i) => `<div class="pslot" data-i="${i}" style="left:${(i % C) * w}px;top:${Math.floor(i / C) * h}px;width:${w}px;height:${h}px"></div>`).join('');
    pb.querySelector('.pghost').style.backgroundImage = uri;
    pt.innerHTML = '';
    let placed = 0;
    const setSz = (el, k, i) => { el.style.width = w * k + 'px'; el.style.height = h * k + 'px'; el.style.backgroundSize = `${S * k}px ${S * k}px`; el.style.backgroundPosition = `${-(i % C) * w * k}px ${-Math.floor(i / C) * h * k}px`; };
    _shuf([...Array(R * C).keys()]).forEach(i => {
      const cell = document.createElement('div'); cell.className = 'pcell'; cell.style.cssText = `width:${w * f}px;height:${h * f}px`;
      const p = document.createElement('div'); p.className = 'ppc'; p.dataset.i = i; p.style.backgroundImage = uri; setSz(p, f, i); cell.appendChild(p); pt.appendChild(cell);
      let drag = null;
      p.onpointerdown = e => {
        if (p.classList.contains('ok')) return; e.preventDefault(); _sfx.init(); try { p.setPointerCapture(e.pointerId); } catch (x) { }
        const r0 = p.getBoundingClientRect();
        drag = { dx: e.clientX - r0.left, dy: e.clientY - r0.top }; setSz(p, 1, i);
        p.classList.add('drag'); p.style.left = e.clientX - w / 2 + 'px'; p.style.top = e.clientY - h / 2 + 'px'; drag.dx = w / 2; drag.dy = h / 2;
      };
      p.onpointermove = e => { if (!drag) return; e.preventDefault(); p.style.left = e.clientX - drag.dx + 'px'; p.style.top = e.clientY - drag.dy + 'px'; };
      const up = e => {
        if (!drag) return; drag = null;
        const bb = pb.getBoundingClientRect(), x = e.clientX - bb.left, y = e.clientY - bb.top, inside = x >= 0 && y >= 0 && x <= S && y <= S;
        const slot = inside ? Math.min(R - 1, Math.floor(y / h)) * C + Math.min(C - 1, Math.floor(x / w)) : -1;
        p.classList.remove('drag'); p.style.left = p.style.top = '';
        if (slot === i) {   // 제자리 → 딱 붙임
          p.classList.add('ok'); p.style.cssText = `left:${(i % C) * w}px;top:${Math.floor(i / C) * h}px;width:${w}px;height:${h}px;background-image:${uri};background-size:${S}px ${S}px;background-position:${-(i % C) * w}px ${-Math.floor(i / C) * h}px`;
          pb.appendChild(p); cell.remove(); _sfx.ok(); placed++;
          if (placed === R * C) { _artBurst(pb, 18); si++; stars.textContent = `🧩 ${si}/${TOTAL}`; _artPraise(() => setTimeout(() => { if (gone) return; if (si >= TOTAL) { const st = miss <= 2 ? 5 : miss <= 5 ? 4 : miss <= 9 ? 3 : 2; App.finishRound(st, 5, () => App.puzGame(level), () => App.puzMenu(), { label: `별 <b>${st}</b>개를 받았어요`, say: _line('p_ms_' + st) }); } else start(); }, 600)); }
        } else { setSz(p, f, i); if (inside) { miss++; _sfx.bad(); } }
      };
      p.onpointerup = up; p.onpointercancel = up;
    });
  }
  start();
  setTimeout(() => { if (!gone) Speech.play('조각을 끌어서 그림을 맞춰 보세요!', null, 'art_puz'); }, 400);
};
