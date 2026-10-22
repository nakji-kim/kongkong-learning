App.hangul = function (mode, level = 1) {
  const SK = level === 2 ? 'solved2' : 'solved', JC = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JV = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const p = this.prof(), root = this.root;
  const jm = mode === 'all' ? null : VOWELS.find(x => x.v === mode).jung;
  const pool = Words.list.filter(x => jm === null || x.jung === jm);
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
    <main class="game"><div class="stage" id="stage"></div><div class="word" id="word"></div>${level === 2 ? '<div class="jrows" id="jr"></div>' : ''}</main>`;
  root.querySelector('#back').onclick = () => App.hangulMenu(level);

  async function next() {
    locked = true; qn++; upd(); let c = null, only = null;
    while (pool.length) {   // 그림(이모지 또는 파일)이 있는 단어만 출제
      let arr = pool.filter(x => !solvedList().includes(x.w) && (!last || x.w !== last.w));
      if (!arr.length) {   // 이 묶음을 모두 풀었으면 처음부터 다시
        p[SK] = solvedList().filter(w => !pool.some(x => x.w === w)); App.save(); App.toast('모두 풀었어요! 다시 시작해요 🎉');
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
    if (level === 2) return next2(c, only);
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

  // 보통: 자음 → 모음 순서대로 누르기
  function next2(c, only) {
    const sy = c.syl.charCodeAt(0) - 0xAC00, ci = Math.floor(sy / 588), vi = c.jung;
    const cons = shuffle([ci, ...shuffle(CHO.filter(x => x !== ci)).slice(0, 2)]), vows = shuffle([vi, ...shuffle(VOWELS.map(x => x.jung).filter(x => x !== vi)).slice(0, 2)]);
    root.querySelector('#stage').innerHTML = `<button class="pic" id="pic" aria-label="${c.w}"><img alt="${c.w}"></button>`;
    const img = root.querySelector('#pic img');
    const list = only ? [only] : [...local(c.w), `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${EMOJI[c.w]}.svg`]; let k = 0;
    img.onerror = () => { if (++k < list.length) img.src = list[k]; else if (EMOJI[c.w]) img.replaceWith(Object.assign(document.createElement('span'), { className: 'emo', textContent: String.fromCodePoint(parseInt(EMOJI[c.w], 16)) })); };
    img.src = list[0];
    const wd = root.querySelector('#word'); wd.style.fontSize = `min(7rem, ${Math.floor(88 / Math.max(c.w.length, 3))}vw)`;
    wd.innerHTML = [...c.w].map(ch => ch === ans ? '<span class="blank">?</span>' : `<span>${ch}</span>`).join('');
    root.querySelector('#jr').innerHTML = `<div class="jrow" id="jc">${cons.map(x => `<button class="jb" data-i="${x}">${JC[x]}</button>`).join('')}</div><div class="jrow off" id="jv">${vows.map(x => `<button class="jb" data-i="${x}">${JV[x]}</button>`).join('')}</div>`;
    const rc = root.querySelector('#jc'), rv = root.querySelector('#jv'), blank = root.querySelector('.blank');
    let step = 0, s = st(ans);
    const wrong = b => { tries++; s.bad++; App.save(); b.classList.add('wrong'); Speech.stop(); Speech.play('다시 들어볼까요?', () => Speech.play(w.w), '_retry'); if (tries >= 2) (step ? rv : rc).querySelectorAll('.jb').forEach(x => +x.dataset.i === (step ? vi : ci) && x.classList.add('hint')); };
    rc.querySelectorAll('.jb').forEach(b => b.onclick = () => {
      if (locked || step !== 0 || b.classList.contains('wrong')) return;
      if (+b.dataset.i !== ci) return wrong(b);
      step = 1; b.classList.add('right'); rc.querySelectorAll('.jb').forEach(x => x !== b && x.classList.add('fade')); rc.querySelectorAll('.hint').forEach(x => x.classList.remove('hint'));
      rv.classList.remove('off'); blank.textContent = JC[ci]; blank.classList.add('part'); tries = tries;
    });
    rv.querySelectorAll('.jb').forEach(b => b.onclick = () => {
      if (locked || step !== 1 || b.classList.contains('wrong')) return;
      if (+b.dataset.i !== vi) return wrong(b);
      step = 2; locked = true; if (tries === 0) s.ok++; if (!solvedList().includes(w.w)) solvedList().push(w.w); App.save();
      b.classList.add('right'); rv.querySelectorAll('.jb').forEach(x => x !== b && x.classList.add('fade')); rv.querySelectorAll('.hint').forEach(x => x.classList.remove('hint'));
      blank.classList.remove('part'); blank.textContent = ans; blank.classList.add('filled');
      if (tries === 0) good++; upd(); burst();
      const pi = Math.floor(Math.random() * praise.length); Speech.stop();
      Speech.play(praise[pi], () => Speech.play(w.w, () => setTimeout(() => qn >= 10 ? App.finishRound(good, 10, () => App.hangul(mode, level), () => App.hangulMenu(level)) : next(), 800)), '_praise' + pi);
    });
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
      Speech.play(praise[pi], () => Speech.play(w.w, () => setTimeout(() => qn >= 10 ? App.finishRound(good, 10, () => App.hangul(mode, level), () => App.hangulMenu(level)) : next(), 800)), '_praise' + pi);
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
