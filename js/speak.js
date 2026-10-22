// 읽고 말하기 (실험중) — 브라우저 내장 음성인식(Web Speech API) 사용
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const _jam = s => [...s].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) return ch; return String.fromCharCode(0x1100 + ((c / 588) | 0), 0x1161 + (((c % 588) / 28) | 0), ...(c % 28 ? [0x11A7 + (c % 28)] : [])); }).join('');
const _lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
// 관대한 판정: 후보 중 하나라도 정답을 포함하거나, 자모 기준으로 비슷하면 정답
// 인식기가 "티비"를 TV, "이"를 2처럼 영어/숫자로 적는 경우를 한글로 되돌림
const _norm = raw => raw.toLowerCase().replace(/tv|티브이/g, '티비').replace(/pc/g, '피씨').replace(/[0-9]/g, d => '영일이삼사오육칠팔구'[d]);
const _heardOk = (target, alts, loose) => {
  if (loose) {   // 한 글자: 들린 글자 중 모음이 같은 것이 하나라도 있으면 정답 (한 글자는 인식이 약해서 아주 관대하게)
    const tj = _jam(target), tv = tj[1];
    if (alts.some(raw => [..._norm(raw).replace(/[^가-힣]/g, '')].some(ch => { const j = _jam(ch); return ch === target || j[1] === tv; }))) return true;
  }
  const tol = target.length <= 3 ? 1 : 2, tj = _jam(target);
  return alts.some(raw => { const t = _norm(raw).replace(/[^가-힣]/g, ''); if (!t) return false; if (t.includes(target)) return true;
    for (let i = 0; i + target.length <= t.length; i++) if (_lev(tj, _jam(t.slice(i, i + target.length))) <= tol) return true; return false; });
};
App.speakMenu = function () {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><h1>어떤 난이도로 할까요?</h1><div class="expt">🧪 아직 실험중이에요</div>
      <div class="cards">
        <button class="card nm" data-l="1" style="background:#b8e6a1"><b>쉬움</b><span>한 글자 읽기</span></button>
        <button class="card nm" data-l="2" style="background:#ffd166"><b>보통</b><span>받침 없는 말</span></button>
        <button class="card nm" data-l="3" style="background:#d9c8f5"><b>어려움</b><span>받침 있는 말</span></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.home();
  this.addClr('read');
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => this.speakGame(+b.dataset.l));
};
App.speakGame = function (level) {
  Speech.stop();
  const root = this.root, key = 'rd' + level, p = this.prof();
  const noF = w => [...w].every(ch => (ch.charCodeAt(0) - 0xAC00) % 28 === 0);
  const words = [...new Set(Words.list.map(x => x.w))];
  const ids = level === 1 ? [...new Set(Words.list.map(x => x.syl))] : level === 2 ? words.filter(noF) : words.filter(w => !noF(w));
  if (!SR) { root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header><main class="home"><h1>🎤</h1><div class="expt" style="font-size:1.2rem">이 브라우저에서는 말하기를 쓸 수 없어요<br>(크롬이나 사파리에서 열어 주세요)</div></main>`; root.querySelector('#back').onclick = () => App.speakMenu(); return; }
  if (!ids.length) { this.toast('낱말이 없어요'); return this.speakMenu(); }
  const total = this.roundSize(key, ids);
  let todo = ids.filter(i => !this.doneArr(key).includes(i)); if (!todo.length) todo = ids.slice();
  const q = todo.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).slice(0, total).map(x => x[1]);
  let good = 0, qn = 0, cur, tries, busy = false, rec = null, heard = false, reads = 0, anyOk = false, firstOk = false;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="spk"><div class="expt">🧪 아직 실험중이에요</div><div id="sw" class="sw"></div><button id="mic" class="mic" aria-label="말하기">🎤</button><div id="msg" class="smsg"></div>${level === 1 ? '<div class="sex">예) "가 가", "라 라"</div>' : ''}<div id="dbg" class="dbg"></div></main>`;
  const $ = s => root.querySelector(s), mic = $('#mic'), msg = $('#msg'), dbg = $('#dbg');
  const upd = () => $('#stars').textContent = `⭐ ${good} · ${qn}/${total}`;
  const stop = () => { try { rec && rec.abort(); } catch (e) { } rec = null; };
  $('#back').onclick = () => { stop(); Speech.stop(); App.speakMenu(); };
  const praise = ['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'];
  const next = () => {
    if (qn >= total) { stop(); return App.finishRound(good, total, () => App.speakGame(level), () => App.speakMenu()); }
    dbg.textContent = ''; reads = 0; anyOk = false; firstOk = false; cur = q[qn++]; tries = 0; busy = false; heard = false; upd();
    const w = $('#sw'); w.textContent = cur; w.style.fontSize = level === 1 ? '10rem' : `min(7rem, calc((100vw - 72px) / ${Math.max(cur.length, 3) + 1}))`;
    w.className = 'sw'; mic.className = 'mic'; msg.textContent = level === 1 ? '🎤를 누르고 두 번 읽어 보세요' : '🎤를 누르고 읽어 보세요';
  };
  const pass = ok => {   // ok=true: 맞게 읽음 / false: 두 번 해도 인식 안 됨 (그냥 넘어감)
    busy = true; mic.className = 'mic'; Speech.stop();
    if (ok) { good++; if (tries === 0 && !this.doneArr(key).includes(cur)) this.markDone(key, cur); upd(); $('#sw').className = 'sw ok'; }
    const pi = Math.floor(Math.random() * praise.length);
    msg.textContent = ok ? praise[pi] : '잘했어요! 다음에 또 해 봐요';
    Speech.play(ok ? praise[pi] : '잘했어요!', () => setTimeout(next, 600), ok ? '_praise' + pi : '_praise0');
  };
  const handle = ok => {   // 쉬움(한 글자)은 마이크를 한 번 켜고 두 번 읽음("가 가"): 들린 글자 중 하나만 맞아도 정답
    return ok ? pass(true) : fail();
  };
  const fail = () => {
    tries++; mic.className = 'mic';
    if (tries >= 2) return pass(false);
    msg.textContent = '다시 한번 읽어 볼까요?'; busy = true;
    Speech.play(cur, () => { busy = false; });   // 정답을 한 번 들려주고 다시 시도
  };
  // 쉬움: 폰 브라우저가 스스로 마이크를 끄는 경우(말이 잠깐 멈추면 종료)를 대비해, 끊기면 다시 켜서 이어 들음
  const listenLong = () => {
    let acc = [], r0 = null, finished = false, timer = null, mine = [];
    const t0 = Date.now();
    const fin = () => {
      if (finished) return; finished = true; clearTimeout(timer); rec = null; try { r0 && r0.abort(); } catch (e) { }
      const all = [...acc, ...mine];
      if (!all.length) { dbg.textContent = dbg.textContent || '소리를 인식하지 못했어요'; return handle(false); }
      handle(_heardOk(cur, all, true));
    };
    const quiet = ms => { clearTimeout(timer); timer = setTimeout(fin, ms); };
    const start = () => {
      const r = r0 = rec = new SR(); r.lang = 'ko-KR'; r.maxAlternatives = 5; r.interimResults = true; r.continuous = true; mine = [];
      r.onstart = () => { mic.className = 'mic on'; msg.textContent = '듣고 있어요…'; };
      r.onresult = e => {
        mine = []; for (let i = 0; i < e.results.length; i++) for (let k = 0; k < e.results[i].length; k++) mine.push(e.results[i][k].transcript);
        dbg.textContent = '들린 말: ' + [...acc, ...mine].join(' / '); quiet(1800);   // 마지막 소리 후 1.8초 조용하면 종료
      };
      r.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { finished = true; clearTimeout(timer); rec = null; busy = false; mic.className = 'mic'; msg.textContent = '마이크를 허용해 주세요'; return App.toast('마이크 권한이 필요해요'); }
        if (e.error !== 'aborted' && e.error !== 'no-speech') dbg.textContent = '오류: ' + e.error;
      };
      r.onend = () => { acc.push(...mine); mine = []; if (finished) return; if (Date.now() - t0 < 12000) setTimeout(() => !finished && start(), 30); else fin(); };
      try { r.start(); } catch (e) { fin(); }
    };
    quiet(7000);   // 아무 말도 없으면 7초 후 종료
    start();
  };
  mic.onclick = () => {
    if (busy) return; busy = true; Speech.stop();
    if (level === 1) return listenLong();
    const r = rec = new SR(); r.lang = 'ko-KR'; r.maxAlternatives = 5; r.interimResults = false; r.continuous = false;
    let got = false, settled = false;
    const settle = f => { if (settled) return; settled = true; rec = null; f(); };
    r.onstart = () => { mic.className = 'mic on'; msg.textContent = '듣고 있어요…'; };
    r.onresult = e => { got = true; const alts = [...e.results[0]].map(a => a.transcript); dbg.textContent = '들린 말: ' + (alts.join(' / ') || '(없음)'); settle(() => handle(_heardOk(cur, alts, false))); };
    r.onerror = e => { dbg.textContent = '오류: ' + e.error; if (e.error === 'not-allowed' || e.error === 'service-not-allowed') return settle(() => { busy = false; mic.className = 'mic'; msg.textContent = '마이크를 허용해 주세요'; App.toast('마이크 권한이 필요해요'); }); if (e.error === 'aborted') return; settle(() => handle(false)); };
    r.onend = () => settle(() => { if (!got) dbg.textContent = dbg.textContent || '소리를 인식하지 못했어요'; got ? 0 : handle(false); });
    try { r.start(); } catch (e) { busy = false; msg.textContent = '다시 눌러 주세요'; }
  };
  next();
  if (level === 1) setTimeout(() => Speech.play('두 번 연속으로 읽어 주세요.', null, 'rd_two'), 400);   // 시작할 때 한 번 안내
};
