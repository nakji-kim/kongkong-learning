// 한글 > 쓰기 : 소리를 듣고 따라 쓰기 (손가락으로 쓰고, 글자 모양과 얼마나 겹치는지로 판정 — 획순은 보지 않음)
const WFONT = s => `800 ${s}px "Gothic A1","Noto Sans KR","Apple SD Gothic Neo",sans-serif`;
App.writeMenu = function () {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><div class="crumb">📖 한글</div><h1>어떤 난이도로 할까요?</h1>
      <div class="cards">
        <button class="card nm" data-l="1" style="background:#b8e6a1"><b>쉬움</b><span>한 글자 따라 쓰기</span></button>
        <button class="card nm" data-l="2" style="background:#ffd166"><b>보통</b><span>받침 없는 말 따라 쓰기</span></button>
        <button class="card nm" data-l="3" style="background:#d9c8f5"><b>어려움</b><span>모든 말 듣고 쓰기</span></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.hangulHome();
  this.addClr('write');
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => this.writeGame(+b.dataset.l));
};
App.writeMenuEn = function () {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><div class="crumb">🔤 알파벳</div><h1>어떤 난이도로 할까요?</h1>
      <div class="cards">
        <button class="card nm" data-l="1" style="background:#b8e6a1"><b>쉬움</b><span>알파벳 따라 쓰기</span></button>
        <button class="card nm" data-l="2" style="background:#ffd166"><b>보통</b><span>그림 보고 따라 쓰기</span></button>
        <button class="card nm" data-l="3" style="background:#d9c8f5"><b>어려움</b><span>듣고 쓰기</span></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.alphaHome();
  this.addClr('write');
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => this.writeGame(+b.dataset.l, 'en'));
};
App.writeGame = function (level, kind = 'ko') {
  Speech.stop();
  const EN = kind === 'en', root = this.root, key = (EN ? 'wa' : 'wr') + level, menu = () => EN ? App.writeMenuEn() : App.writeMenu();
  const WORDS = EN ? ALPHA.flatMap(a => a.ws.map(w => ({ ...a, ...w }))) : [], W = Object.fromEntries(WORDS.map(x => [x.word, x]));
  const noF = w => [...w].every(ch => (ch.charCodeAt(0) - 0xAC00) % 28 === 0);
  const words = [...new Set(Words.list.map(x => x.w))];
  const ids = EN ? (level === 1 ? ALPHA.flatMap(a => [a.L, a.L.toLowerCase()]) : [...new Set(WORDS.map(x => x.word))].filter(w => level === 3 || w.replace(/[^A-Za-z]/g, '').length < 6)) : level === 1 ? [...new Set(Words.list.map(x => x.syl))] : level === 2 ? words.filter(noF) : words;   // 어려움: 받침 없는 단어도 함께
  if (!ids.length) { this.toast('낱말이 없어요'); return menu(); }
  const total = this.roundSize(key, ids);
  let todo = ids.filter(i => !this.doneArr(key).includes(i)); if (!todo.length) todo = ids.slice();
  const q = todo.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).slice(0, total).map(x => x[1]);
  let good = 0, qn = 0, cur, tries = 0, locked = true, strokes = [], drawing = null, timer = null, first = true, guideOn = false, L = null;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="wr"><div id="wmsg" class="wmsg"></div><div id="wpic" class="wpic" style="display:none"></div><div class="wst" id="wst"><canvas id="wg"></canvas><canvas id="wc"></canvas></div>
      <div class="wbt"><button class="chip big" id="wsnd">🔊 다시 듣기</button><button class="chip big" id="wclr">🧽 지우기</button><button class="chip big wdone" id="wok">✔ 다 썼어요</button></div></main>`;
  const $ = s => root.querySelector(s), msg = $('#wmsg'), cg = $('#wg'), cc = $('#wc'), gx = cg.getContext('2d'), ix = cc.getContext('2d');
  const upd = () => $('#stars').textContent = `⭐ ${good} · ${qn}/${total}`;
  $('#back').onclick = () => { clearTimeout(timer); Speech.stop(); menu(); };
  const praise = ['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'];
  const sayTarget = done => !EN ? Speech.play(cur, done) : level === 1 ? Speech.play(cur.toUpperCase(), done, 'en_' + cur.toUpperCase(), 'en-US') : Speech.play(cur, done, W[cur].snd || 'enw_' + W[cur].L, 'en-US');
  const layout = word => {
    if (EN) {   // 영어: 한 줄 (글자 수에 맞춰 글자 크기 조절)
      const maxW = Math.min(innerWidth - 28, 520), mc = document.createElement('canvas').getContext('2d'); mc.font = WFONT(100);
      if (level === 1) { const s = Math.min(maxW, 250); return { W: s, H: s, fs: s * 0.78, brush: 13, kb: level === 3 ? 30 : 22, tol: level === 3 ? 28 : 22, th: s * 0.035 }; }
      const w100 = mc.measureText(word).width, fs = Math.min(150, (maxW - 24) / w100 * 100), brush = Math.max(6, Math.min(13, fs * 0.1));
      return { W: Math.min(maxW, Math.ceil(w100 * fs / 100 + 24)), H: Math.ceil(fs * 1.5), fs, brush, kb: brush * (level === 3 ? 2.3 : 1.7), tol: brush * (level === 3 ? 2.2 : 1.7), th: fs * 0.05 };
    }
    const n = [...word].length, cols = n > 3 ? Math.ceil(n / 2) : n, rows = n > 3 ? 2 : 1;
    const s = Math.max(60, Math.min(Math.floor(Math.min(innerWidth - 28, 520) / cols), n === 1 ? 250 : 200, Math.floor((innerHeight - 330) / rows)));
    return { n, cols, rows, s, W: s * cols, H: s * rows, brush: 13, kb: level === 3 ? 30 : 22, tol: level === 3 ? 28 : 22, th: s * 0.035 };
  };
  const glyph = (ctx, word, ly, scale, fill, lineW) => {   // 글자 모양을 그림 (판정 기준과 배경 글자에 같이 사용)
    if (EN) { ctx.font = WFONT(ly.fs * scale); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; const x = ly.W / 2 * scale, y = (ly.H / 2 + ly.fs * 0.04) * scale; if (lineW) { ctx.lineWidth = lineW * scale; ctx.strokeText(word, x, y); } ctx.fillText(word, x, y); return; }
    ctx.font = WFONT(ly.s * 0.8 * scale); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    [...word].forEach((ch, i) => {
      const row = Math.floor(i / ly.cols), inRow = Math.min(ly.cols, ly.n - row * ly.cols), x0 = (ly.cols - inRow) / 2 * ly.s, col = i % ly.cols;
      const x = (x0 + col * ly.s + ly.s / 2) * scale, y = (row * ly.s + ly.s / 2 + ly.s * 0.04) * scale;
      if (lineW) { ctx.lineWidth = lineW * scale; ctx.strokeText(ch, x, y); }
      ctx.fillText(ch, x, y);
    });
  };
  const GS = 0.25;   // 판정은 1/4 크기로 계산
  const maskOf = fn => { const c = document.createElement('canvas'); c.width = Math.ceil(L.W * GS); c.height = Math.ceil(L.H * GS); const x = c.getContext('2d'); x.fillStyle = x.strokeStyle = '#000'; fn(x); return { d: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }; };
  const on = (m, i, th = 100) => m.d[i * 4 + 3] > th;
  const tolOf = () => L.tol;
  const score = () => {   // 겹침(coverage)과 벗어남(over) 계산
    const T = maskOf(x => glyph(x, cur, L, GS, true, L.th)), D = maskOf(x => glyph(x, cur, L, GS, true, tolOf() * 2 + L.th));
    let pts = strokes;
    if (level === 3) {   // 눈에 보이는 글자가 없으므로 위치/크기는 상관없이, 쓴 글자의 테두리를 정답 글자 테두리에 맞춰 비교
      let tx0 = 1e9, ty0 = 1e9, tx1 = -1, ty1 = -1; for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) if (on(T, y * T.w + x)) { tx0 = Math.min(tx0, x); tx1 = Math.max(tx1, x); ty0 = Math.min(ty0, y); ty1 = Math.max(ty1, y); }
      tx0 /= GS; tx1 /= GS; ty0 /= GS; ty1 /= GS;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; strokes.forEach(s => s.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
      const sx = x1 - x0 > 8 ? (tx1 - tx0) / (x1 - x0) : 1, sy = y1 - y0 > 8 ? (ty1 - ty0) / (y1 - y0) : 1;
      pts = strokes.map(s => s.map(([x, y]) => [tx0 + (x - x0) * sx + (x1 - x0 > 8 ? 0 : ((tx1 - tx0) - (x1 - x0)) / 2), ty0 + (y - y0) * sy + (y1 - y0 > 8 ? 0 : ((ty1 - ty0) - (y1 - y0)) / 2)]));
    }
    const ink = lw => maskOf(x => { x.lineCap = x.lineJoin = 'round'; x.lineWidth = lw * GS; pts.forEach(s => { if (s.length === 1) { x.beginPath(); x.arc(s[0][0] * GS, s[0][1] * GS, lw * GS / 2, 0, 7); x.fill(); } else { x.beginPath(); s.forEach(([px, py], i) => i ? x.lineTo(px * GS, py * GS) : x.moveTo(px * GS, py * GS)); x.stroke(); } }); });
    const K = ink(L.kb), I = ink(4);
    let t = 0, tk = 0, n = 0, out = 0;
    for (let i = 0; i < T.w * T.h; i++) { if (on(T, i)) { t++; if (on(K, i, 60)) tk++; } if (on(I, i, 40)) { n++; if (!on(D, i)) out++; } }
    return { cov: t ? tk / t : 0, over: n ? out / n : 0, n };
  };
  const draw = () => { ix.clearRect(0, 0, L.W, L.H); ix.lineCap = ix.lineJoin = 'round'; ix.lineWidth = L.brush; ix.strokeStyle = '#3b2f4a'; ix.fillStyle = '#3b2f4a'; strokes.forEach(s => { if (s.length === 1) { ix.beginPath(); ix.arc(s[0][0], s[0][1], L.brush / 2, 0, 7); ix.fill(); } else { ix.beginPath(); s.forEach(([x, y], i) => i ? ix.lineTo(x, y) : ix.moveTo(x, y)); ix.stroke(); } }); };
  const guide = (color) => { gx.clearRect(0, 0, L.W, L.H); if (!color) return; gx.fillStyle = gx.strokeStyle = color; glyph(gx, cur, L, 1, true, L.th); };   // 글씨를 조금 굵게
  const clear = () => { strokes = []; draw(); };
  const setup = () => {   // 문제마다 캔버스 크기와 배경 글자 준비
    L = layout(cur); const dpr = Math.min(2, window.devicePixelRatio || 1);
    [cg, cc].forEach(c => { c.width = L.W * dpr; c.height = L.H * dpr; c.style.width = L.W + 'px'; c.style.height = L.H + 'px'; });
    gx.setTransform(dpr, 0, 0, dpr, 0, 0); ix.setTransform(dpr, 0, 0, dpr, 0, 0);
    $('#wst').style.width = L.W + 'px'; $('#wst').style.height = L.H + 'px';
    const pc = $('#wpic');
    if (EN && level === 2) {   // 보통: 그림 카드(한글 이름 포함)
      const a = W[cur], list = [...['svg', 'png', 'webp', 'jpg'].map(x => encodeURI(`assets/images/${a.word}.${x}`)), ...(a.e ? [`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${a.e}.svg`] : [])];
      pc.style.display = ''; pc.innerHTML = `<img alt=""><div class="kcap">${a.ko}</div>`; const img = pc.firstChild; let k = 0; img.onerror = () => { if (++k < list.length) img.src = list[k]; else img.replaceWith(Object.assign(document.createElement('span'), { textContent: a.word })); }; img.src = list[0];
    } else pc.style.display = 'none';
    strokes = []; guideOn = level !== 3; guide(guideOn ? 'rgba(59,47,74,.17)' : null); draw();
  };
  const finish = ok => {
    locked = true; clearTimeout(timer); Speech.stop();
    if (ok) { good++; if (tries === 0 && !App.doneArr(key).includes(cur)) App.markDone(key, cur); upd(); guide('#2f9e44'); ix.clearRect(0, 0, L.W, L.H); msg.textContent = '👏'; }
    const pi = Math.floor(Math.random() * praise.length);
    if (ok && EN) Speech.play(EN_PRAISE[pi], () => sayTarget(() => setTimeout(next, 500)), 'en_praise' + pi, 'en-US');
    else if (ok) Speech.play(praise[pi], () => Speech.play(cur, () => setTimeout(next, 500)), '_praise' + pi);
    else { msg.textContent = '잘했어요! 다음에 또 해 봐요'; guide('rgba(47,158,68,.45)'); Speech.play('잘했어요!', () => setTimeout(next, 900), '_praise0'); }
  };
  const retry = () => {   // 너무 벗어남 → 쓴 것 지우고 다시
    tries++; clear(); locked = true;
    if (tries >= 3) return finish(false);
    if (tries >= 2 && !guideOn) { guideOn = true; guide('rgba(59,47,74,.17)'); }   // 어려움: 두 번 틀리면 흐린 글자를 보여줌
    msg.textContent = '다시 써 볼까요?';
    Speech.stop(); Speech.play('다시 써 볼까요?', () => sayTarget(() => { locked = false; }), 'wr_retry');
  };
  const judge = force => {
    if (locked || !strokes.length) return;
    const s = score(), PASS = level === 3 ? 0.5 : 0.72, SOFT = level === 3 ? 0.4 : 0.45, OVER = level === 3 ? 0.55 : 0.4;
    App._wlast = s;
    if (s.over > OVER) return retry();
    if (s.cov >= PASS || (force && s.cov >= SOFT)) return finish(true);
    if (force || strokes.length >= 14) return retry();
  };
  const pos = e => { const r = cc.getBoundingClientRect(); return [(e.clientX - r.left) * L.W / r.width, (e.clientY - r.top) * L.H / r.height]; };
  cc.style.touchAction = 'none';
  cc.onpointerdown = e => { if (locked) return; e.preventDefault(); clearTimeout(timer); try { cc.setPointerCapture(e.pointerId); } catch (x) { } drawing = [pos(e)]; strokes.push(drawing); draw(); };
  cc.onpointermove = e => { if (!drawing) return; e.preventDefault(); drawing.push(pos(e)); draw(); };
  const up = e => { if (!drawing) return; drawing = null; if (level !== 3) timer = setTimeout(() => judge(false), 900); };   // 어려움은 "다 썼어요"를 눌러야 확인
  cc.onpointerup = up; cc.onpointercancel = up;
  $('#wsnd').onclick = () => { if (!locked) { Speech.stop(); sayTarget(); } };
  $('#wclr').onclick = () => { if (!locked) { clearTimeout(timer); clear(); } };
  $('#wok').onclick = () => { if (!locked) { clearTimeout(timer); judge(true); } };
  const next = () => {
    if (qn >= total) { return App.finishRound(good, total, () => App.writeGame(level, kind), () => menu()); }
    cur = q[qn++]; tries = 0; upd(); setup(); locked = false;
    msg.textContent = level === 3 ? '듣고 써 보세요' : '따라 써 보세요';
    const go = () => sayTarget();
    if (first) { first = false; Speech.play('소리를 듣고 따라 써 보세요.', go, 'wr_intro'); } else go();
  };
  App._w = { score: () => score(), pts: () => { const T = maskOf(x => glyph(x, cur, L, GS, true, L.th)); const o = []; for (let y = 0; y < T.h; y += 2) for (let x = 0; x < T.w; x += 2) if (on(T, y * T.w + x)) o.push([x / GS, y / GS]); return o; }, cur: () => cur, canvas: () => cc, setStrokes: s => { strokes = s; draw(); } };
  document.fonts && document.fonts.load('800 40px "Gothic A1"').catch(() => { }).finally(next) || next();
};
