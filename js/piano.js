// 피아노 놀이: 쉬움(계이름 써 있음) · 보통(안 써 있음) · 어려움(2~3개 순서대로) · 악보(노래 따라 치기) · 자유
const PN = [   // 흰 건반 8개 (도~높은 도)
  { n: '도', r: 'do', f: 261.63, c: '#ff6b6b' }, { n: '레', r: 're', f: 293.66, c: '#ff9f43' }, { n: '미', r: 'mi', f: 329.63, c: '#f2b705' },
  { n: '파', r: 'fa', f: 349.23, c: '#3dbb68' }, { n: '솔', r: 'sol', f: 392.0, c: '#3fa9f5' }, { n: '라', r: 'la', f: 440.0, c: '#7a6cf0' },
  { n: '시', r: 'si', f: 493.88, c: '#c06be0' }, { n: '도', r: 'do', f: 523.25, c: '#ff6b6b' }];
const PN_BLACK = [[0, 277.18], [1, 311.13], [3, 369.99], [4, 415.3], [5, 466.16]];   // [앞 흰 건반 번호, 주파수]
const PN_CORE = 0;   // 도(가운데)의 건반 번호
const PN_NAMES = ['도', '레', '미', '파', '솔', '라', '시'];
// 노래 (c d e f g a b = 도~시, C = 높은 도). 박자는 모두 같게
const PN_SONGS = [
  { t: '도레미 계단', e: '🪜', bg: '#c8f0e0', n: 'cdefgabC Cbagfedc' },
  { t: '반짝반짝 작은 별', e: '⭐', bg: '#ffe08a', n: 'ccggaag ffeeddc ggffeed ggffeed ccggaag ffeeddc' },
  { t: '메리의 어린 양', e: '🐑', bg: '#ffd1dc', n: 'edcdeee ddd egg edcdeeee ddedc' },
  { t: '환희의 송가', e: '🎉', bg: '#cdb8f5', n: 'eefggfed ccdeedd eefggfed ccdedcc' },
  { t: '징글벨', e: '🔔', bg: '#b5e3ff', n: 'eeeeeeegcde fffffeeeeddedg' },
];
const _pn = {
  ctx: null,
  init() { try { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { } },
  play(f, dur = 1.2) {   // 피아노 비슷한 소리: 기본음 + 배음, 빨리 커졌다 천천히 작아짐
    try { const c = this.ctx; if (!c) return; const t = c.currentTime, out = c.createGain(); out.gain.value = .5; out.connect(c.destination);
      [[1, 'triangle', .55, 1], [2, 'sine', .25, .6], [3, 'sine', .1, .35], [4, 'sine', .05, .2]].forEach(([m, type, v, d]) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f * m;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur * d);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + dur * d + .05); }); } catch (e) { } },
};
// 건반 그리기: o.labels 계이름 표시, o.onKey(번호), o.onBlack(번호)
const _pnBoard = (host, o) => {
  host.innerHTML = `<div class="pnk${o.labels ? '' : ' nolab'}"><div class="pnin">${PN.map((k, i) => `<button class="wk${k.x ? ' ex' : ''}" data-i="${i}"><span class="pl" style="background:${k.c}">${k.n}</span></button>`).join('')}${PN_BLACK.map(([a, , x], j) => `<button class="bk${x ? ' ex' : ''}" data-b="${j}" style="left:calc(${(a + 1) * 12.5}% - 3.6%)"></button>`).join('')}</div></div>`;
  const el = host.firstChild, fl = (b, cls, ms) => { b.classList.add(cls); setTimeout(() => b.classList.remove(cls), ms); };
  el.querySelectorAll('.wk').forEach(b => b.onpointerdown = e => { e.preventDefault(); _pn.init(); _pn.play(PN[+b.dataset.i].f); fl(b, 'on', 180); o.onKey && o.onKey(+b.dataset.i); });
  el.querySelectorAll('.bk').forEach(b => b.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); _pn.init(); _pn.play(PN_BLACK[+b.dataset.b][1]); fl(b, 'on', 180); o.onBlack && o.onBlack(+b.dataset.b); });
  return { el, key: i => el.querySelector(`.wk[data-i="${i}"]`), keys: () => [...el.querySelectorAll('.wk')], flash: fl, labels: v => el.classList.toggle('nolab', !v),
    unhint: () => el.querySelectorAll('.hint').forEach(x => x.classList.remove('hint')) };
};

App.pianoMenu = function () {
  this.cardMenu('피아노로 무엇을 할까요?', [
    { b: '🎹', t: '쉬움', bg: '#8ddc9b', go: () => this.pianoGame(1) },
    { b: '🎵', t: '보통', bg: '#6ec6ff', go: () => this.pianoGame(2) },
    { b: '🎼', t: '어려움', bg: '#ff9aa8', go: () => this.pianoGame(3) },
    { b: '🎶', t: '악보', bg: '#ffd166', go: () => this.pianoSongs() },
    { b: '✨', t: '자유', bg: '#cdb8f5', go: () => this.pianoFree() },
  ], () => this.playMenu(), undefined, '🧩 놀이');
};

/* 쉬움·보통·어려움: 이름을 불러 주면 건반 누르기 (10문제) */
App.pianoGame = function (level) {
  Speech.stop(); const root = this.root, TOTAL = 10;
  let qn = 0, good = 0, tries = 0, seq = [], pos = 0, locked = true, gone = false, last = null;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars"></span></header>
    <main class="game pn"><div class="pnq" id="pq"></div><div id="pb"></div></main>`;
  const $ = s => root.querySelector(s), upd = () => { $('#stars').innerHTML = `${STAR_IMG} ${good} · ${qn}/${TOTAL}`; };
  $('#back').onclick = () => { gone = true; Speech.stop(); App.pianoMenu(); };
  const speakSeq = (i = 0) => { if (gone || i >= seq.length) return; Speech.play(PN[seq[i]].n, () => setTimeout(() => speakSeq(i + 1), 300), 'pn_' + PN[seq[i]].r); };   // seq: 건반 번호 (소리 높이도 그 건반에 맞춤)
  const ask = first => { Speech.stop(); if (first) Speech.play(level === 3 ? '들려주는 순서대로 건반을 눌러 보세요!' : '들려주는 계이름의 건반을 눌러 보세요!', () => setTimeout(() => speakSeq(), 250), level === 3 ? 'pn_q2' : 'pn_q1'); else speakSeq(); };
  const dots = () => { const d = $('#pd'); if (d) d.innerHTML = seq.map((_, i) => `<span class="${i < pos ? 'on' : ''}">${i < pos ? '●' : '○'}</span>`).join(''); };
  const board = _pnBoard($('#pb'), { labels: level === 1, onKey: i => press(i) });
  const hintKeys = () => { board.unhint(); board.key(seq[pos]).classList.add('hint'); };
  const next = () => {
    qn++; upd(); tries = 0; pos = 0; locked = false; board.unhint();
    if (level < 3) { const nm = App.pickNew('pn' + level, PN_NAMES.slice(), { random: true, not: i => i === last }); last = nm; seq = [PN_CORE + PN_NAMES.indexOf(nm) + (nm === '도' && Math.random() < .5 ? 7 : 0)]; }   // 도는 낮은/높은 도 중 하나로 읽음
    else { const len = qn <= 5 ? 2 : 3; seq = []; while (seq.length < len) { const k = PN_CORE + Math.floor(Math.random() * 8); if (!seq.length || PN[k].n !== PN[seq[seq.length - 1]].n) seq.push(k); } }
    $('#pq').innerHTML = (level === 1 ? `<div class="pnbig" style="color:${PN[seq[0]].c}">${PN[seq[0]].n}</div>` : '') + (level === 3 ? '<div class="pndots" id="pd"></div>' : '') + '<button class="chip big" id="hear">🔊 다시 듣기</button>';
    $('#hear').onclick = () => ask(false); dots(); setTimeout(() => { if (!gone) ask(qn === 1); }, 400);
  };
  const press = i => {
    if (locked || gone) return;
    const k = PN[i];
    if (k.n === PN[seq[pos]].n) {   // 이름이 같으면 정답 (낮은/높은 도 모두 인정)
      board.flash(board.key(i), 'right', 400); pos++; board.unhint(); dots();
      if (pos < seq.length) return;
      locked = true; if (tries === 0) good++;
      if (level < 3) { if (tries === 0) App.markDone('pn' + level, PN[seq[0]].n); else App.noteMiss('pn' + level, PN[seq[0]].n); }
      upd(); const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'][pi], () => setTimeout(() => { if (gone) return; qn >= TOTAL ? App.finishRound(good, TOTAL, () => App.pianoGame(level), () => App.pianoMenu()) : next(); }, 600), '_praise' + pi);
    } else {
      tries++; board.flash(board.key(i), 'bad', 450); Speech.stop();
      if (level === 3) { pos = 0; dots(); Speech.play('다시 생각해 볼까요?', () => setTimeout(() => !gone && ask(false), 300), '_retry2'); }
      else Speech.play('다시 생각해 볼까요?', null, '_retry2');
      if (tries >= 2) hintKeys();
    }
  };
  App._pnq = () => ({ seq: seq.slice(), pos, locked });   // 테스트용
  next();
};

/* 악보: 노래를 한 음씩 따라 치기 */
App.pianoSongs = function () {
  this.cardMenu('어떤 노래를 칠까요?', PN_SONGS.map((s, i) => ({ b: s.e, t: s.t, bg: s.bg, go: () => this.pianoSong(i) })), () => this.pianoMenu(), undefined, '🧩 놀이');
};
App.pianoSong = function (si) {
  Speech.stop(); const root = this.root, S = PN_SONGS[si], notes = [...S.n.replace(/ /g, '')].map(ch => 'cdefgabC'.indexOf(ch) + PN_CORE);
  let idx = 0, miss = 0, help = true, gone = false, demo = 0;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="hear">🔊 들어 보기</button> <button class="chip" id="hp">💡 도움 켜짐</button></span></header>
    <main class="game pn"><div class="pntitle">${S.e} ${S.t}</div><div class="pnst" id="st"></div><div id="pb"></div></main>`;
  const $ = s => root.querySelector(s), chips = () => [...root.querySelectorAll('.pnn')];
  $('#st').innerHTML = notes.map(i => `<span class="pnn" style="background:${PN[i].c}"></span>`).join('');
  const showNames = () => chips().forEach((c, k) => { c.textContent = help || k < idx ? PN[notes[k]].n : '♪'; });
  const board = _pnBoard($('#pb'), { labels: true, onKey: i => press(i) });
  const mark = () => { chips().forEach((c, k) => { c.classList.toggle('done', k < idx); c.classList.toggle('cur', k === idx); }); const cur = chips()[idx]; cur && cur.scrollIntoView({ block: 'nearest', inline: 'center' }); showNames();
    board.unhint(); if (idx < notes.length && (help || miss >= 2)) board.key(notes[idx]).classList.add('hint'); };
  $('#back').onclick = () => { gone = true; demo++; Speech.stop(); App.pianoSongs(); };
  $('#hp').onclick = () => { help = !help; $('#hp').textContent = help ? '💡 도움 켜짐' : '💡 도움 꺼짐'; board.labels(help); mark(); };
  $('#hear').onclick = () => {   // 노래 들려주기 (건반이 저절로 눌림)
    if (demo) { demo++; board.unhint(); return mark(); }
    const t = ++demo; board.unhint(); let k = 0; _pn.init();
    const step = () => { if (gone || demo !== t) return; if (k >= notes.length) { demo = 0; return mark(); }
      const i = notes[k]; _pn.play(PN[i].f); board.flash(board.key(i), 'demo', 300); chips().forEach((c, q) => c.classList.toggle('cur', q === k)); chips()[k].scrollIntoView({ block: 'nearest', inline: 'center' }); k++; setTimeout(step, 480); };
    step();
  };
  const press = i => {
    if (gone || demo) return;
    if (i === notes[idx]) {
      board.flash(board.key(i), 'right', 300); idx++; miss = 0; mark();
      if (idx >= notes.length) { gone = true; setTimeout(() => App.finishRound(5, 5, () => App.pianoSong(si), () => App.pianoSongs(), { label: '노래를 끝까지 쳤어요!', say: ['끝까지 쳤어요! 대단해요!', '_praise3'] }), 700); }
    } else { miss++; board.flash(board.key(i), 'bad', 450); if (miss >= 2) mark(); }
  };
  mark();
};

/* 자유: 마음대로 치기 */
App.pianoFree = function () {
  Speech.stop(); const root = this.root; let lab = true, gone = false;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><button class="chip" id="lb">🔤 계이름 켜짐</button></header>
    <main class="game pn"><div class="pnq"><div class="pnbig" id="pbig">🎹</div></div><div id="pb"></div></main>`;
  const $ = s => root.querySelector(s); let tm;
  const show = (t, c) => { const b = $('#pbig'); b.textContent = t; b.style.color = c || ''; clearTimeout(tm); tm = setTimeout(() => { if (!gone) { b.textContent = '🎹'; b.style.color = ''; } }, 1200); };
  const board = _pnBoard($('#pb'), { labels: true, onKey: i => show(PN[i].n, PN[i].c), onBlack: () => show('♪', '#5a4a6b') });
  $('#back').onclick = () => { gone = true; App.pianoMenu(); };
  $('#lb').onclick = () => { lab = !lab; $('#lb').textContent = lab ? '🔤 계이름 켜짐' : '🔤 계이름 꺼짐'; board.labels(lab); };
};
