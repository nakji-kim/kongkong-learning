App.hangul = function (mode, level = 1) {
  const SK = level === 3 ? 'solved3' : level === 2 ? 'solved2' : 'solved', JC = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JV = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', JF = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const p = this.prof(), root = this.root;
  const jm = mode === 'all' ? null : VOWELS.find(x => x.v === mode).jung;
  const pool = level === 3 ? Words.list.filter((x, i, a) => a.findIndex(y => y.w === x.w) === i).flatMap(x => [...x.w].filter(ch => (ch.charCodeAt(0) - 0xAC00) % 28).map(ch => ({ w: x.w, syl: ch, jung: (((ch.charCodeAt(0) - 0xAC00) / 28) | 0) % 21 }))) : Words.list.filter(x => jm === null || x.jung === jm);
  const st = l => (p.stats[l] = p.stats[l] || { ok: 0, bad: 0 });
  const weight = l => Math.max(0.5, 1 + 2 * st(l).bad - 0.5 * st(l).ok);   // 자주 틀린 글자 ↑
  const wpick = (arr, wf) => { let t = arr.reduce((s, x) => s + wf(x), 0), r = Math.random() * t; for (const x of arr) { if ((r -= wf(x)) <= 0) return x; } return arr[0]; };
  const shuffle = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const EXT = ['svg', 'png', 'webp', 'jpg'], local = w => EXT.map(x => encodeURI(`assets/images/${w}.${x}`));
  const probe = w => new Promise(res => { let i = 0; const l = local(w); const t = () => { if (i >= l.length) return res(null); const im = new Image(); const u = l[i++]; im.onload = () => res(u); im.onerror = t; im.src = u; }; t(); });
  const solvedList = () => (p[SK] = p[SK] || []);   // 이미 푼 단어 (프로필별로 기기에 저장)
  const praise = ['잘했어요!', '맞았어요!', '최고예요!', '대단해요!'];
  let last = null, good = 0, qn = 0, w, ans, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/10`; };

  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/10</span></header>
    <main class="game"><div class="stage" id="stage"></div><div class="word" id="word"></div>${level >= 2 ? '<div class="jrows" id="jr"></div>' : ''}</main>`;
  root.querySelector('#back').onclick = () => App.hangulBack(level);

  async function next() {
    locked = true; qn++; upd(); let c = null, only = null;
    while (pool.length) {   // 그림(이모지 또는 파일)이 있는 단어만 출제
      let arr = pool.filter(x => !solvedList().includes(x.w + (level === 3 ? x.syl : '')) && (!last || x.w !== last.w));
      if (!arr.length) {   // 이 묶음을 모두 풀었으면 처음부터 다시
        p[SK] = solvedList().filter(w => !pool.some(x => x.w + (level === 3 ? x.syl : '') === w)); App.save(); App.toast('모두 풀었어요! 다시 시작해요 🎉');
        arr = pool.filter(x => !last || x.w !== last.w);
      }
      c = wpick(arr.length ? arr : pool, x => weight(x.syl));
      if (EMOJI[c.w]) break;
      if (c.src === undefined) c.src = await probe(c.w);
      if (c.src) { only = c.src; break; }
      pool.splice(pool.indexOf(c), 1); c = null;
    }
    if (!c) { root.querySelector('#stage').innerHTML = '<p class="empty">그림이 있는 단어가 없어요.<br>assets/images 폴더에 단어 이름으로 그림을 넣어 주세요.</p>'; return; }
    w = c; last = c; ans = c.syl; tries = 0;
    if (level >= 2) return nextJ(c, only);
    const set = CHO.map(x => String.fromCharCode(0xAC00 + (x * 21 + c.jung) * 28)).filter(l => l !== ans);
    const decoys = []; while (decoys.length < 3) decoys.push(wpick(set.filter(l => !decoys.includes(l)), weight));
    root.querySelector('#stage').innerHTML = `<button class="pic" id="pic" aria-label="${c.w}"><img alt="${c.w}"></button>` +
      shuffle([ans, ...decoys]).map((l, i) => `<button class="fl s${i}" data-l="${l}">${l}</button>`).join('');
    const img = root.querySelector('#pic img');
    const list = only ? [only] : [...local(c.w), `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${EMOJI[c.w]}.svg`]; let k = 0;
    img.onerror = () => { if (++k < list.length) img.src = list[k]; else if (EMOJI[c.w]) img.replaceWith(Object.assign(document.createElement('span'), { className: 'emo', textContent: String.fromCodePoint(parseInt(EMOJI[c.w], 16)) })); };
    img.src = list[0];
    const wd = root.querySelector('#word'); wd.style.fontSize = `min(7rem, ${Math.floor(88 / Math.max(c.w.length, 3))}vw)`;
    wd.innerHTML = [...c.w].map(ch => ch === ans ? '<span class="blank">?</span>' : `<span>${ch}</span>`).join('');
    root.querySelector('#pic').onclick = () => Speech.say(c.w);
    root.querySelectorAll('.fl').forEach(b => b.onclick = () => pick(b));
    locked = false; setTimeout(() => Speech.twice(c.w), 400);   // 처음에 두 번 읽어줌
  }

  // 보통/어려움: 자음 → 모음 (→ 받침) 순서대로 누르기
  function nextJ(c, only) {
    const sy = c.syl.charCodeAt(0) - 0xAC00, ci = Math.floor(sy / 588), vi = c.jung, fi = sy % 28;
    const part = (cc, vv, ff) => cc == null ? '' : vv == null ? JC[cc] : String.fromCharCode(0xAC00 + (cc * 21 + vv) * 28 + (ff || 0));
    const steps = [
      { id: 'c', right: ci, vals: shuffle([ci, ...shuffle(CHO.filter(x => x !== ci)).slice(0, 2)]), lab: x => JC[x], show: () => part(ci) },
      { id: 'v', right: vi, vals: shuffle([vi, ...shuffle(VOWELS.map(x => x.jung).filter(x => x !== vi)).slice(0, 2)]), lab: x => JV[x], show: () => part(ci, vi) }];
    if (level === 3) steps.push({ id: 'f', right: fi, vals: shuffle([fi, 0, ...shuffle([1, 4, 8, 16, 17, 19, 21].filter(x => x !== fi)).slice(0, 1)].filter((x, n, a) => a.indexOf(x) === n).slice(0, 3)), lab: x => x ? JF[x] : '없음', show: () => part(ci, vi, fi) });
    root.querySelector('#stage').innerHTML = `<button class="pic" id="pic" aria-label="${c.w}"><img alt="${c.w}"></button>`;
    const img = root.querySelector('#pic img');
    const list = only ? [only] : [...local(c.w), `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${EMOJI[c.w]}.svg`]; let k = 0;
    img.onerror = () => { if (++k < list.length) img.src = list[k]; else if (EMOJI[c.w]) img.replaceWith(Object.assign(document.createElement('span'), { className: 'emo', textContent: String.fromCodePoint(parseInt(EMOJI[c.w], 16)) })); };
    img.src = list[0];
    const wd = root.querySelector('#word'); wd.style.fontSize = `min(7rem, ${Math.floor(88 / Math.max(c.w.length, 3))}vw)`;
    wd.innerHTML = [...c.w].map(ch => ch === ans ? '<span class="blank">?</span>' : `<span>${ch}</span>`).join('');
    root.querySelector('#jr').innerHTML = steps.map((s, n) => `<div class="jrow${n ? ' off' : ''}" id="j${s.id}">${s.vals.map(x => `<button class="jb" data-i="${x}">${s.lab(x)}</button>`).join('')}</div>`).join('');
    const rows = steps.map(s => root.querySelector('#j' + s.id)), blank = root.querySelector('.blank'), s0 = st(ans);
    let step = 0;
    const wrong = b => { tries++; s0.bad++; App.save(); b.classList.add('wrong'); Speech.stop(); Speech.play('다시 들어볼까요?', () => Speech.play(w.w), '_retry'); if (tries >= 2) rows[step].querySelectorAll('.jb').forEach(x => +x.dataset.i === steps[step].right && x.classList.add('hint')); };
    rows.forEach((row, n) => row.querySelectorAll('.jb').forEach(b => b.onclick = () => {
      if (locked || step !== n || b.classList.contains('wrong')) return;
      if (+b.dataset.i !== steps[n].right) return wrong(b);
      b.classList.add('right'); row.querySelectorAll('.jb').forEach(x => x !== b && x.classList.add('fade')); row.querySelectorAll('.hint').forEach(x => x.classList.remove('hint'));
      if (n < steps.length - 1) { step++; rows[step].classList.remove('off'); blank.textContent = steps[n].show(); blank.classList.add('part'); return; }
      step = 99; locked = true; if (tries === 0) s0.ok++; { const key = w.w + (level === 3 ? c.syl : ''); if (!solvedList().includes(key)) solvedList().push(key); } App.save();
      blank.classList.remove('part'); blank.textContent = ans; blank.classList.add('filled');
      if (tries === 0) good++; upd(); burst();
      const pi = Math.floor(Math.random() * praise.length); Speech.stop();
      Speech.play(praise[pi], () => Speech.play(w.w, () => setTimeout(() => qn >= 10 ? App.finishRound(good, 10, () => App.hangul(mode, level), () => App.hangulBack(level)) : next(), 800)), '_praise' + pi);
    }));
    locked = false; setTimeout(() => Speech.twice(c.w), 400);
  }

  function pick(b) {
    if (locked || b.classList.contains('wrong')) return;
    const l = b.dataset.l, s = st(ans);
    if (l === ans) {
      locked = true; if (tries === 0) s.ok++; if (!solvedList().includes(w.w)) solvedList().push(w.w); App.save();
      b.classList.add('right');
      root.querySelectorAll('.blank').forEach(bl => { bl.textContent = ans; bl.classList.add('filled'); });
      root.querySelectorAll('.fl').forEach(x => x !== b && x.classList.add('fade'));
      if (tries === 0) good++; upd();
      burst();
      const pi = Math.floor(Math.random() * praise.length); Speech.stop();
      Speech.play(praise[pi], () => Speech.play(w.w, () => setTimeout(() => qn >= 10 ? App.finishRound(good, 10, () => App.hangul(mode, level), () => App.hangulBack(level)) : next(), 800)), '_praise' + pi);
    } else {
      tries++; s.bad++; App.save();
      b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 들어볼까요?', () => Speech.play(w.w), '_retry');
      if (tries >= 2) root.querySelectorAll('.fl').forEach(x => x.dataset.l === ans && x.classList.add('hint'));
    }
  }

  function burst() {
    const stg = root.querySelector('#stage');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i'); s.className = 'spark'; s.textContent = ['⭐', '✨', '💛'][i % 3];
      s.style.setProperty('--x', (Math.random() * 120 - 60) + 'vmin'); s.style.setProperty('--y', (Math.random() * 90 - 45) + 'vmin');
      stg.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
  }
  next();
};
App.hangulBack = function (level) { return level === 3 ? this.hangulLevelMenu() : this.hangulMenu(level); };
