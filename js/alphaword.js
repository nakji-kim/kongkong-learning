// 알파벳 > 단어 : 1단계(단어를 듣고 그림 고르기) / 2단계(그림을 보고 첫 글자 채우기)
// 음성은 알파벳 공부에서 쓰는 enw_<글자>.mp3(단어), en_praise*.mp3(영어 칭찬)를 그대로 씁니다.
App.alphaWordMenu = function () {
  Speech.stop();
  const all = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
    <main class="home"><h1>단어 공부</h1>
      <div class="cards">
        <button class="card nm awb" data-lv="1" style="background:#ffe3c2"><b>1단계</b><span>듣고 그림 찾기</span><small class="amd">단어를 듣고 알맞은 그림을 찾아요</small></button>
        <button class="card nm awb" data-lv="2" style="background:#d9ecff"><b>2단계</b><span>첫 글자 채우기</span><small class="amd">빠진 첫 글자를 찾아요</small></button>
      </div></main>`;
  this.root.querySelector('#back').onclick = () => this.alphaMenu();
  this.addClr('alpha');
  this.root.querySelectorAll(".awb").forEach(b => b.onclick = () => this.alphaWordGame(+b.dataset.lv, all));
};

App.alphaWordGame = function (level, letters) {
  const p = this.prof(), root = this.root, key = 'w' + level;
  const NAMES = Object.fromEntries(ALPHA.map(a => [a.L, a]));
  const ITEMS = ALPHA.flatMap(a => a.ws.map(w => ({ ...a, ...w, id: w.word })));   // 단어 하나하나가 문제
  const st = l => (p.stats[`${key}:${l}`] = p.stats[`${key}:${l}`] || { ok: 0, bad: 0 });
  const weight = l => Math.max(0.5, 1 + 2 * st(l).bad - 0.5 * st(l).ok);
  const wpick = (arr, wf) => { let t = arr.reduce((s, x) => s + wf(x), 0), r = Math.random() * t; for (const x of arr) { if ((r -= wf(x)) <= 0) return x; } return arr[0]; };
  const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const EXT = ['svg', 'png', 'webp', 'jpg'];
  const cands = a => [...EXT.map(x => encodeURI(`assets/images/${a.word}.${x}`)), ...(a.e ? [`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/${a.e}.svg`] : [])];
  const wire = (img, a) => {   // 그림 파일 → 이모지 → 글자 순으로 시도
    const list = cands(a); let k = 0;
    img.onerror = () => { if (++k < list.length) img.src = list[k]; else img.replaceWith(Object.assign(document.createElement('span'), { className: 'emo', style: 'font-size:2rem;font-weight:800', textContent: a.word })); };
    img.src = list[0];
  };
  const wordSound = (a, done) => Speech.play(a.word, done, a.snd || 'enw_' + a.L, 'en-US');
  const SIZE = 10;   // 한 판 = 10문제 (별 10개)
  const doneL = App.doneArr(key); let todo = ITEMS.filter(x => !doneL.includes(x.id));
  if (!todo.length) { App.toast('모두 풀었어요! 다시 시작해요 🎉'); App.prof().done[key] = doneL.filter(id => !ITEMS.some(x => x.id === id)); App.save(); todo = ITEMS.slice(); }
  const queue = [];   // 안 푼 단어에서 글자가 겹치지 않게 10개
  for (const x of shuffle(todo)) { if (queue.length < SIZE && !queue.some(q => q.L === x.L)) queue.push(x); }
  for (const x of shuffle(todo)) { if (queue.length < SIZE && !queue.includes(x)) queue.push(x); }
  const total = queue.length;
  let good = 0, qn = 0, cur, tries, locked = true;
  const upd = () => { root.querySelector('#stars').textContent = `⭐ ${good} · ${qn}/${total}`; };
  const wordHtml = a => {   // 2단계: 첫 글자를 빈칸으로
    const rest = a.word.slice(1), n = a.word.length;
    return `<div class="wd" style="font-size:min(clamp(2.8rem,10vw,5.6rem),calc(86vw / ${(n * 0.62).toFixed(2)}))"><span class="blank" id="blank">?</span><span class="rest">${rest.replace(/ /g, '&nbsp;')}</span></div>`;
  };

  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">⭐ 0 · 0/${total}</span></header>
    <main class="game aw2"><div class="stage" id="stage"></div><div class="word" id="word"></div><div class="choices" id="ch"></div></main>`;
  root.querySelector('#back').onclick = () => App.alphaWordMenu();

  function next() {
    qn++; upd(); tries = 0; locked = true;
    cur = queue[qn - 1];
    const decoys = shuffle(Object.keys(NAMES).filter(l => l !== cur.L)).slice(0, 3);
    const opts = shuffle([cur.L, ...decoys]);
    const stage = root.querySelector('#stage'), word = root.querySelector('#word'), ch = root.querySelector('#ch');
    if (level === 1) {
      stage.innerHTML = `<button class="pic spk" id="pic" aria-label="소리 듣기"><span class="spkic">🔊</span></button>`;
      word.innerHTML = '<div class="wd ghost">&nbsp;</div>';
      const vm = Object.fromEntries(opts.map(l => [l, l === cur.L ? cur : alphaVariant(NAMES[l])]));   // 정답은 방금 고른 단어, 오답은 두 단어 중 무작위
      ch.innerHTML = opts.map(l => `<button class="cb pimg" data-l="${l}" aria-label="${vm[l].word}"><img alt=""></button>`).join('');
      ch.querySelectorAll('.cb').forEach(b => wire(b.querySelector('img'), vm[b.dataset.l]));
    } else {
      stage.innerHTML = `<button class="pic cap" id="pic" aria-label="${cur.word}"><img alt="${cur.word}"><span class="kcap">${cur.ko}</span></button>`;
      wire(stage.querySelector('img'), cur);
      word.innerHTML = wordHtml(cur);
      ch.innerHTML = opts.map(l => `<button class="cb" data-l="${l}">${l}</button>`).join('');
    }
    stage.querySelector('#pic').onclick = () => { if (!locked) { Speech.stop(); wordSound(cur); } };
    ch.querySelectorAll('.cb').forEach(b => b.onclick = () => pick(b));
    locked = false;
    setTimeout(() => { Speech.stop(); wordSound(cur, () => Speech.after(() => wordSound(cur), 500)); }, 400);   // 처음에 두 번 들려줌
  }

  function pick(b) {
    if (locked || b.classList.contains('wrong')) return;
    const l = b.dataset.l, s = st(cur.L);
    if (l === cur.L) {
      locked = true; if (tries === 0) { s.ok++; good++; } App.save(); if (tries === 0) App.markDone(key, cur.id); upd();
      b.classList.add('right'); root.querySelectorAll('#ch .cb').forEach(x => x !== b && x.classList.add('fade'));
      if (level === 1) {
        const pic = root.querySelector('#pic'); pic.classList.remove('spk'); pic.classList.add('reveal', 'cap');
        pic.innerHTML = `<img alt="${cur.word}"><span class="kcap">${cur.ko}</span>`; wire(pic.querySelector('img'), cur);
        root.querySelector('#word .wd').outerHTML = `<div class="wd" style="font-size:min(clamp(2.8rem,10vw,5.6rem),calc(86vw / ${(cur.word.length * 0.62).toFixed(2)}))"><span class="rest okw">${cur.word}</span></div>`;
      } else { const bl = root.querySelector('#blank'); bl.textContent = cur.L; bl.classList.add('filled'); }
      burst();
      const pi = Math.floor(Math.random() * 4); Speech.stop();
      Speech.play(EN_PRAISE[pi], () => wordSound(cur, () => setTimeout(() => qn >= total ? App.finishRound(good, total, () => App.alphaWordGame(level, letters), () => App.alphaWordMenu(), { label: `${total}개 중 <b>${good}</b>개 맞았어요`, say: good === total ? ['모두 맞았어요! 최고예요!', 'al_res_all'] : good === 0 ? ['괜찮아요, 다시 한번 해 볼까요?', '_res_0'] : [`${KCNT[good]} 개 맞았어요!`, 'al_res_' + good] }) : next(), 800)), 'en_praise' + pi, 'en-US');
    } else {
      tries++; s.bad++; App.save(); b.classList.add('wrong');
      Speech.stop(); Speech.play('다시 들어볼까요?', () => wordSound(cur), '_retry');
      if (tries >= 2) root.querySelectorAll('#ch .cb').forEach(x => x.dataset.l === cur.L && x.classList.add('hint'));
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
