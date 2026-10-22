// 알파벳 > 대문자/소문자 : 1단계(그림+소리) / 2단계(소리만, 정답 후 큰 글자)
App.alphaMenu = function () {
  Speech.stop();
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><h1>어떤 공부를 할까요?</h1>
      <div class="cards">
        <button class="card al" data-k="up" style="background:#8ddc9b"><b>A B C</b><span>대문자</span></button>
        <button class="card al" data-k="low" style="background:#ffd166"><b>a b c</b><span>소문자</span></button>
        <button class="card al" data-k="word" style="background:#b8a1f0"><b>Apple</b><span>단어</span></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.home();
  this.addClr('alpha');
  this.root.querySelectorAll('.al').forEach(b => b.onclick = () => b.dataset.k === 'up' ? this.alphaUpper() : b.dataset.k === 'low' ? this.alphaUpper(true) : this.alphaWordMenu());
};

App.alphaUpper = function (lower = false) {   // 단계 + 묶음을 한 화면에서 고르면 바로 시작
  Speech.stop();
  const row = (lv, title, sub, color) => `<section class="lvrow" style="--c:${color}"><div class="lvt"><b>${title}</b><span>${sub}</span></div>
    <div class="lvc">${ALPHA_GROUPS.map(([n, l]) => `<button class="chip lvb" data-lv="${lv}" data-l="${l}">${n}</button>`).join('')}</div></section>`;
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home lvmain"><h1>${lower ? '소문자' : '대문자'} 공부</h1>
      ${row(1, '1단계 · 보고 듣기', '그림을 보고 소리를 들어요', '#ffe3c2')}
      ${row(2, '2단계 · 듣고 맞히기', '소리만 듣고 찾아요', '#d9ecff')}</main>`;
  this.root.querySelector('#back').onclick = () => this.alphaMenu();
  this.addClr('alpha');
  this.root.querySelectorAll('.lvb').forEach(b => b.onclick = () => this.alphaGame(+b.dataset.lv, [...b.dataset.l], lower));
};

App.alphaGame = function (level, letters, lower = false) {
  const p = this.prof(), root = this.root;
  const NAMES = Object.fromEntries(ALPHA.map(a => [a.L, a]));
  const SAY = { A: 'Ay.', B: 'Bee.', C: 'See.', D: 'Dee.', E: 'Ee.', F: 'Eff.', G: 'Jee.', H: 'Aitch.', I: 'Eye.', J: 'Jay.', K: 'Kay.', L: 'El.', M: 'Em.', N: 'En.', O: 'Oh.', P: 'Pee.', Q: 'Cue.', R: 'Are.', S: 'Ess.', T: 'Tee.', U: 'You.', V: 'Vee.', W: 'Double you.', X: 'Ex.', Y: 'Why.', Z: 'Zee.' };
  const pool = letters.map(l => NAMES[l]);
  const pre = lower ? 'l' : 'a', show = l => (lower ? l.toLowerCase() : l);   // 소문자: 보기와 정답 글자만 소문자로
  const st = l => (p.stats[`${pre}${level}:${l}`] = p.stats[`${pre}${level}:${l}`] || { ok: 0, bad: 0 });
  const weight = l => Math.max(0.5, 1 + 2 * st(l).bad - 0.5 * st(l).ok);
  const wpick = (arr, wf) => { let t = arr.reduce((s, x) => s + wf(x), 0), r = Math.random() * t; for (const x of arr) { if ((r -= wf(x)) <= 0) return x; } return arr[0]; };
  const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const EXT = ['svg', 'png', 'webp', 'jpg'];
  const cands = a => [...EXT.map(x => encodeURI(`assets/images/${a.word}.${x}`)), ...(a.e ? [`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${a.e}.svg`] : [])];
  const nameSound = (a, done) => Speech.play(SAY[a.L], done, 'en_' + a.L, 'en-US');
  const wordSound = (a, done) => Speech.play(a.word, done, a.snd || 'enw_' + a.L, 'en-US');
  const full = (a, done) => nameSound(a, () => Speech.after(() => wordSound(a, done), 300));          // "에이, 애플"
  const praise = EN_PRAISE;   // 알파벳은 영어로 칭찬
  const doneL = App.doneArr(pre + level); let todo = pool.filter(a => !doneL.includes(a.L));
  if (!todo.length) { App.prof().done[pre + level] = doneL.filter(l => !letters.includes(l)); App.save(); todo = pool.slice(); }
  const total = todo.length;   // 문제 수 = 안 푼 글자 수 (처음엔 묶음의 글자 수)
  let good = 0, qn = 0, cur, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/${total}`; };

  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="game"><div class="stage" id="stage"></div><div class="word" id="word"></div></main>`;
  root.querySelector('#back').onclick = () => App.alphaUpper(lower);

  function next() {
    qn++; upd(); tries = 0;
    cur = alphaVariant(NAMES[App.pickNew(pre + level, pool.map(a => a.L), { random: true })]);     // 글자는 무작위(푼 글자는 건너뜀), 단어는 두 개 중 무작위
    const group = letters.filter(l => l !== cur.L), rest = Object.keys(NAMES).filter(l => l !== cur.L && !letters.includes(l));
    const decoys = []; const src = [...group];
    while (decoys.length < 3 && src.length) { const d = wpick(src, weight); decoys.push(d); src.splice(src.indexOf(d), 1); }
    while (decoys.length < 3) decoys.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    const fl = shuffle([cur.L, ...decoys]).map((l, i) => `<button class="fl s${i}" data-l="${l}">${show(l)}</button>`).join('');
    root.querySelector('#stage').innerHTML = (level === 1
      ? `<button class="pic cap" id="pic" aria-label="${cur.word}"><img alt="${cur.word}"><span class="kcap">${cur.ko}</span></button>`
      : `<button class="pic spk" id="pic" aria-label="소리 듣기"><span class="spkic">🔊</span></button>`) + fl;
    if (level === 1) {
      const img = root.querySelector('#pic img'), list = cands(cur); let k = 0;
      img.onerror = () => { if (++k < list.length) img.src = list[k]; else img.replaceWith(Object.assign(document.createElement('span'), { className: 'emo', style: 'font-size:3rem;font-weight:800', textContent: cur.word })); };
      img.src = list[0];
      root.querySelector('#word').innerHTML = '<span class="blank">?</span>';
    } else root.querySelector('#word').innerHTML = '<span class="blank ghost">&nbsp;</span>';
    root.querySelector('#pic').onclick = () => { if (locked) return; Speech.stop(); level === 1 ? full(cur) : nameSound(cur); };
    root.querySelectorAll('.fl').forEach(b => b.onclick = () => pick(b));
    locked = false;
    setTimeout(() => {   // 처음에 두 번 들려줌
      Speech.stop();
      if (level === 1) full(cur, () => Speech.after(() => full(cur), 500)); else nameSound(cur, () => Speech.after(() => nameSound(cur), 500));
    }, 400);
  }

  function pick(b) {
    if (locked || b.classList.contains('wrong')) return;
    const l = b.dataset.l, s = st(cur.L);
    if (l === cur.L) {
      locked = true; if (tries === 0) { s.ok++; good++; } App.save(); App.markDone(pre + level, cur.L); upd();
      b.classList.add('right'); root.querySelectorAll('.fl').forEach(x => x !== b && x.classList.add('fade'));
      if (level === 1) { const bl = root.querySelector('.blank'); bl.textContent = show(cur.L); bl.classList.add('filled'); root.querySelector('#word').insertAdjacentHTML('beforeend', `<span class="aw">${cur.word}</span>`); }
      else { const pic = root.querySelector('#pic'); pic.classList.remove('spk'); pic.classList.add('reveal'); pic.innerHTML = `<span class="big">${show(cur.L)}</span>`; }
      burst();
      const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(praise[pi], () => full(cur, () => setTimeout(() => qn >= total ? App.finishRound(good, total, () => App.alphaGame(level, letters, lower), () => App.alphaUpper(lower), { label: `${total}개 중 <b>${good}</b>개 맞았어요`, say: good === total ? ['모두 맞았어요! 최고예요!', 'al_res_all'] : good === 0 ? ['괜찮아요, 다시 한번 해 볼까요?', '_res_0'] : [`${KCNT[good]} 개 맞았어요!`, 'al_res_' + good] }) : next(), 800)), 'en_praise' + pi, 'en-US');
    } else {
      tries++; s.bad++; App.save(); b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 들어볼까요?', () => (level === 1 ? full(cur) : nameSound(cur)), '_retry');
      if (tries >= 2) root.querySelectorAll('.fl').forEach(x => x.dataset.l === cur.L && x.classList.add('hint'));
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
     // 시험용
  next();
};
