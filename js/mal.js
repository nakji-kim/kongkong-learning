// 끝말잇기 (한글) : 쉬움 = 그림 이어 고르기 · 보통 = 글자 보고 고르기 · 어려움 = 빈칸(가운데 그림) 채우기
const MAL_LOCAL = {"Airplane": "Airplane.svg", "Bear": "Bear.svg", "Bird": "Bird.svg", "Bus": "Bus.svg", "Cake": "Cake.svg", "Chicken": "Chicken.svg", "Cow": "Cow.svg", "Dinosaur": "Dinosaur.svg", "Donut": "Donut.svg", "Ear": "Ear.svg", "Eye": "Eye.svg", "Fire": "Fire.svg", "Flower": "Flower.svg", "Fox": "Fox.svg", "Gift": "Gift.svg", "Guitar": "Guitar.svg", "Heart": "Heart.svg", "House": "House.svg", "Kangaroo": "Kangaroo.svg", "Koala": "Koala.svg", "Ladybug": "Ladybug.svg", "Leaf": "Leaf.svg", "Milk": "Milk.svg", "Moon": "Moon.svg", "Nose": "Nose.svg", "Nut": "Nut.svg", "Octopus": "Octopus.svg", "Orange": "Orange.svg", "Panda": "Panda.svg", "Pencil": "Pencil.svg", "Penguin": "Penguin.svg", "Queen": "Queen.svg", "Robot": "Robot.svg", "Rocket": "Rocket.svg", "Rose": "Rose.svg", "Shoes": "Shoes.svg", "Snake": "Snake.svg", "Snowman": "Snowman.svg", "Strawberry": "Strawberry.svg", "Tomato": "Tomato.svg", "Train": "Train.svg", "Turtle": "Turtle.svg", "Watch": "Watch.svg", "Worm": "Worm.svg", "Xylophone": "Xylophone.svg", "Yellow": "Yellow.svg", "Zero": "Zero.svg", "거머리": "거머리.svg", "고무": "고무.svg", "과자": "과자.svg", "구슬": "구슬.svg", "그네": "그네.svg", "그물": "그물.svg", "기저귀": "기저귀.svg", "김치": "김치.svg", "꼬리": "꼬리.svg", "놀이터": "놀이터.svg", "다리미": "다리미.svg", "더덕": "더덕.svg", "도깨비": "도깨비.svg", "도마": "도마.svg", "두꺼비": "두꺼비.svg", "두더지": "두더지.svg", "두부": "두부.svg", "마차": "마차.svg", "머리": "머리.svg", "머리띠": "머리띠.svg", "멸치": "멸치.svg", "모래": "모래.svg", "무": "무.svg", "무릎": "무릎.svg", "미끄럼틀": "미끄럼틀.svg", "미역": "미역.svg", "보리": "보리.svg", "보물": "보물.svg", "보자기": "보자기.svg", "부채": "부채.svg", "사진": "사진.svg", "서랍": "서랍.svg", "소풍": "소풍.svg", "수건": "수건.svg", "스티커": "스티커.svg", "시소": "시소.svg", "어깨": "어깨.svg", "어항": "어항.svg", "유리": "유리.svg", "이마": "이마.svg", "이불": "이불.svg", "이쑤시개": "이쑤시개.svg", "자두": "자두.svg", "저금통": "저금통.svg", "제비": "제비.svg", "조개": "조개.svg", "조끼": "조끼.svg", "조랑말": "조랑말.svg", "주머니": "주머니.svg", "지갑": "지갑.svg", "지우개": "지우개.svg", "처마": "처마.svg", "초가집": "초가집.svg", "치마": "치마.svg", "치약": "치약.svg", "커튼": "커튼.svg", "쿠션": "쿠션.svg", "쿠키": "쿠키.svg", "타월": "타월.svg", "타조": "타조.svg", "터널": "터널.svg", "투구": "투구.svg", "파자마": "파자마.svg", "포크레인": "포크레인.svg", "피리": "피리.svg", "하늘": "하늘.svg", "하모니카": "하모니카.svg", "허리": "허리.svg", "허수아비": "허수아비.svg", "호두": "호두.svg", "호수": "호수.svg", "휴지": "휴지.svg"};
const MAL_SKIP = ['치아'];   // 끝말잇기에서 뺄 단어
const _malHas = w => !MAL_SKIP.includes(w) && !!(MAL_LOCAL[w] || (typeof EMOJI !== 'undefined' && EMOJI[w]));
const _malImg = (w, cls = '') => MAL_LOCAL[w] ? `<img class="${cls}" alt="" src="assets/images/${encodeURI(MAL_LOCAL[w])}">` : pimg(EMOJI[w], cls);
const _malJosa = ch => { const b = (ch.charCodeAt(0) - 0xAC00) % 28; return b === 0 || b === 8 ? '로' : '으로'; };
const _malWords = () => [...new Set(Words.list.map(x => x.w))].filter(w => w.length > 1 && _malHas(w));   // 한 글자 단어는 뺌
App.malMenu = function () {
  this.cardMenu('어떤 난이도로 할까요?', [
    { b: '쉬움', t: '그림 이어 고르기', bg: '#b8e6a1', go: () => this.malGame(1) },
    { b: '보통', t: '그림 보고 글자 고르기', bg: '#ffd166', go: () => this.malGame(2) },
    { b: '어려움', t: '빈칸 채우기', bg: '#d9c8f5', go: () => this.malGame(3) },
    { b: '자유', t: '컴퓨터와 이어 쓰기', bg: '#ffb3c1', go: () => this.malFree() },
  ], () => this.hangulHome(), 'mal', '📖 한글 · 끝말잇기');
};
App.malGame = function (level) {
  const ws = _malWords(), first = {};
  ws.forEach(w => (first[w[0]] = first[w[0]] || []).push(w));
  const nexts = (a, ex = []) => (first[a.at(-1)] || []).filter(b => b !== a && !ex.includes(b));
  let ids = [];
  if (level < 3) ws.forEach(a => nexts(a).forEach(b => ids.push(a + '>' + b)));
  else ws.forEach(a => nexts(a).forEach(b => nexts(b, [a]).forEach(c => ids.push([a, b, c].join('>')))));
  const key = 'mal' + level, hl = (w) => `${w.slice(0, -1)}<b class="malhl">${w.at(-1)}</b>`, hf = (w) => `<b class="malhl">${w[0]}</b>${w.slice(1)}`, hb = (w) => `<b class="malhl">${w[0]}</b>${w.slice(1, -1)}<b class="malhl">${w.at(-1)}</b>`,
    item = (w, html, cls = '') => `<div class="malit ${cls}">${_malImg(w)}<span class="malw">${html}</span></div>`, arrow = '<i>→</i>';
  const decoys = (need, ex, n = 3) => _shuf(ws.filter(w => w[0] !== need && !ex.includes(w))).slice(0, n);
  let asked = false;   // 어려움 문제 음성은 처음 한 번만
  const make = () => {
    const id = App.pickNew(key, ids, { random: true }), [a, b, c] = id.split('>');
    if (level === 3) {
      const wasAsked = asked; asked = true;
      // 보기: 되도록 정답과 첫 글자가 같은 단어 (앞 단어와는 이어지지만 뒤 단어와는 이어지지 않는 것) → 뒤 단어까지 확인해야 함
      const okA = w => _malVar(a.at(-1)).includes(w[0]), okC = w => _malVar(w.at(-1)).includes(c[0]) || _malVar(c[0]).includes(w.at(-1)) || w.at(-1) === c[0];
      const bad = w => ![a, b, c].includes(w) && !(okA(w) && okC(w));
      let dec = _shuf(ws.filter(w => w[0] === b[0] && bad(w))).slice(0, 3);
      if (dec.length < 3) dec = [...dec, ..._shuf(ws.filter(w => okA(w) && bad(w) && !dec.includes(w))).slice(0, 3 - dec.length)];
      if (dec.length < 3) dec = [...dec, ...decoys(a.at(-1), [a, b, c, ...dec], 3 - dec.length)];
      const opts = _shuf([b, ...dec]);
      return {
        key: 'ml:' + id, done: [key, id], answer: b, q: ['빈칸에 들어갈 말을 찾아요!', 'mal_q3'], once: true, silent: wasAsked,
        a: [[a, a], [b, b], [c, c]],
        stage: `<div class="malrow"><div class="malit">${_malImg(a)}</div><i>→</i><div class="malit q"><span class="malq">?</span></div><i>→</i><div class="malit">${_malImg(c)}</div></div>`,
        reveal: (root, btn) => { root.querySelector('#cstage').innerHTML = `<div class="malrow sm">${item(a, hl(a))}${arrow}${item(b, hb(b), 'pop')}${arrow}${item(c, hf(c))}</div>`; if (btn) btn.classList.add('zoom'); },
        choices: opts.map(x => ({ id: x, cls: 'pimg', html: _malImg(x) })),
      };
    }
    const opts = _shuf([b, ...decoys(a.at(-1), [a, b])]);
    return {
      key: 'ml:' + id, done: [key, id], answer: b, q: [a, a],
      a: [[a, a], [b, b]],
      stage: `<div class="malit big">${_malImg(a)}</div>`,
      reveal: (root, btn) => { root.querySelector('#cstage').innerHTML = `<div class="malrow">${item(a, hl(a))}${arrow}${item(b, hf(b), 'pop')}</div>`; if (btn) btn.classList.add('zoom'); },
      choices: opts.map(x => level === 1 ? { id: x, cls: 'pimg', html: _malImg(x) } : { id: x, cls: 'wide', html: x }),
    };
  };
  this.quiz(make, () => App.malGame(level), () => App.malMenu(), 'mal', App.roundSize(key, ids));
};

/* ---------- 자유 : 키보드로 직접 쳐서 컴퓨터와 번갈아 끝말잇기 (규칙만 확인 · 음성 없음) ---------- */
const _malVar = ch => {   // 두음법칙 : 리↔이, 라↔나, 린→인 …
  const c = ch.charCodeAt(0) - 0xAC00, jo = (c / 588) | 0, ju = ((c % 588) / 28) | 0, jg = c % 28, Y = [20, 2, 6, 12, 17, 7, 3].includes(ju), mk = n => String.fromCharCode(0xAC00 + n * 588 + ju * 28 + jg), v = [ch];
  if (jo === 5) v.push(mk(Y ? 11 : 2)); else if (jo === 2) { v.push(mk(Y ? 11 : 5)); } else if (jo === 11 && Y) v.push(mk(5), mk(2));
  return v;
};
App.malFree = function () {
  const root = this.root, pool = [...new Set([...Words.list.map(x => x.w), ...MAL_EXTRA])].filter(w => /^[가-힣]{2,}$/.test(w) && !MAL_SKIP.includes(w));
  const byFirst = {}; pool.forEach(w => (byFirst[w[0]] = byFirst[w[0]] || []).push(w));
  const used = new Set(), chain = []; let mine = 0, gone = false, busy = true, timer = null;
  const cand = (last) => _malVar(last).flatMap(c => byFirst[c] || []).filter(w => !used.has(w));
  const hasNext = w => cand(w.at(-1)).some(x => x !== w);
  const hlLast = w => `${w.slice(0, -1)}<b class="malhl">${w.at(-1)}</b>`;
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="stars">${STAR_IMG} <span id="cnt">0</span>개</span></header>
    <main class="game mg mfree"><div class="mfcur" id="cur"></div><div class="mfmsg" id="msg"></div>
      <div class="mfin"><input id="inp" type="text" lang="ko" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="여기에 써 보세요" maxlength="12"><button class="chip big" id="go">확인</button></div>
      <button class="chip" id="giveup">🙈 모르겠어요</button><div class="mfhist" id="hist"></div></main>`;
  const $ = s => root.querySelector(s), inp = $('#inp');
  $('#back').onclick = () => { gone = true; clearTimeout(timer); App.malMenu(); };
  const show = (who, w) => {
    $('#cur').innerHTML = `<div class="mfwho ${who}">${who === 'cp' ? '🤖 컴퓨터' : '🙂 나'}</div><div class="malit big">${_malHas(w) ? _malImg(w) : ''}<span>${hlLast(w)}</span></div>`;
    const h = document.createElement('span'); h.className = 'mfchip ' + who; h.textContent = w; $('#hist').appendChild(h); h.scrollIntoView({ block: 'nearest' });
    const need = w.at(-1), vs = _malVar(need); $('#msg').innerHTML = who === 'cp' ? hint(need) : '🤖 생각하는 중…';
  };
  const hint = ch => { const alt = _malVar(ch).slice(1); return `<b class="malhl">${ch}</b> 소리로 시작하는 말을 써 보세요!${alt.length ? `<br><small>(${alt.join(' · ')} 도 돼요)</small>` : ''}`; };
  const say = (t, bad) => { $('#msg').innerHTML = t; $('#msg').classList.toggle('bad', !!bad); };
  const cpTurn = () => {
    if (gone) return; busy = true; const last = chain.at(-1);
    timer = setTimeout(() => {
      if (gone) return;
      const all = cand(last.at(-1)).filter(w => w !== last), good = all.filter(hasNext), pickFrom = good.length && Math.random() < .85 ? good : all;
      if (!pickFrom.length) return end(true);
      const w = pickFrom[Math.floor(Math.random() * pickFrom.length)]; used.add(w); chain.push(w); show('cp', w); busy = false; inp.disabled = false; inp.value = ''; inp.focus();
    }, 900);
  };
  const burst = () => { const stg = $('#cur'); for (let i = 0; i < 10; i++) { const s = document.createElement('i'); s.className = 'spark'; App.sparkFill(s, ['⭐', '✨', '💛'][i % 3]); s.style.setProperty('--x', (Math.random() * 90 - 45) + 'vmin'); s.style.setProperty('--y', (Math.random() * 40 - 20) + 'vmin'); stg.appendChild(s); setTimeout(() => s.remove(), 1400); } };
  const submit = () => {
    if (busy || gone) return; const w = inp.value.replace(/\s+/g, ''); if (!w) return;
    const need = chain.at(-1).at(-1), vs = _malVar(need);
    if (!/^[가-힣]+$/.test(w)) return say('한글로만 써 주세요 ✏️', 1);
    if (w.length < 2) return say('두 글자 이상으로 써 주세요 ✏️', 1);
    if (!vs.includes(w[0])) return say(hint(need), 1);
    if (used.has(w)) return say('이미 나온 말이에요. 다른 말을 써 주세요', 1);
    $('#msg').classList.remove('bad'); used.add(w); chain.push(w); mine++; $('#cnt').textContent = mine; inp.blur(); inp.disabled = true; busy = true; show('me', w); burst(); cpTurn();
  };
  const end = win => {
    gone = true; Speech.stop();
    root.innerHTML = `<main class="home result"><h1>${win ? '와! 컴퓨터가 졌어요!' : '잘했어요!'}</h1>
      <div class="rscore">${win ? '컴퓨터가 더 생각나지 않대요. ' : ''}${STAR_IMG} <b>${mine}</b>개를 이어 썼어요</div>
      <div class="mfhist res">${chain.map((w, i) => `<span class="mfchip ${i % 2 ? 'me' : 'cp'}">${w}</span>`).join('')}</div>
      <div class="rbtns"><button class="chip big" id="again">다시 하기</button><button class="chip big" id="quit">그만하기</button></div></main>`;
    root.querySelector('#again').onclick = () => App.malFree(); root.querySelector('#quit').onclick = () => App.malMenu();
  };
  $('#go').onclick = submit; $('#giveup').onclick = () => { if (!gone) end(false); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); } });
  const starts = pool.filter(w => hasNext(w) && _malHas(w)), s0 = starts[Math.floor(Math.random() * starts.length)];
  used.add(s0); chain.push(s0); show('cp', s0); busy = false; setTimeout(() => inp.focus(), 300);
};
