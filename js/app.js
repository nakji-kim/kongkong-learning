const App = {
  root: null, data: null,
  start() { this.root = document.getElementById('app'); this.data = Store.load(); Speech.S = this.data.settings; Words.load(); this.help(); },
  help() {   // 첫 화면: 사용 도움말 → 공부 시작하기 → (프로필 있으면 홈, 없으면 계정 만들기)
    Speech.stop();
    this.root.innerHTML = `<main class="home helpv"><h1>콩콩 배움 놀이</h1>
      <ol class="help">
        <li>계정 정보는 페이지를 실행한 기기/브라우저에만 저장 됩니다.<ul><li>자주 틀리는 문제를 자주 노출하기 위한 오답노트용 입니다.</li><li>기기나 브라우저가 변경되면 연동되지 않습니다.</li></ul></li>
        <li>한번 풀었던 문제는 모든 문제를 풀기전까지 다시 나오지 않아요.(중복 방지)<ul><li>틀렸던 문제는 한번에 맞힐때까지 다시 나와요.</li><li>푼 기록 지우기를 누르면 초기화 후 다시 풀 수 있어요.</li><li>공부 선택 화면에서 누를 시 전체 초기화. 각 공부 안에서 누를 시 해당 공부 초기화</li></ul></li>
        <li>사용 후 피드백은 언제든 환영입니다.<ul><li>그림/음성 등 어색한 사항 수정 요청</li><li>난이도 조절 및 신규 기능 추가 요청 등</li></ul></li>
        <li>지속 업데이트 중으로 계정 / 푼 기록이 지워질수 있어요.<ul><li>우측 하단에 버전이 표시됩니다.</li><li><b style="color:#e8590c">새로고침을 자주</b> 눌러주세요.</li></ul></li>
        <li>자유롭게 공유 가능하지만 상업적 이용은 금지됩니다.</li>
      </ol>
      <button class="chip big" id="go">공부 시작하기</button><span class="ver">v105</span></main>`;
    this.root.querySelector('#go').onclick = () => (this.prof() ? this.home() : this.profiles());
  },
  prof() { return this.data.profiles.find(p => p.id === this.data.active); },
  save() { Store.save(this.data); },
  // ---- 푼 문제 기록 (프로필별, 기기에 저장) ----
  doneArr(key) { const p = this.prof(); p.done = p.done || {}; return (p.done[key] = p.done[key] || []); },
  markDone(key, id) { const a = this.doneArr(key); if (!a.includes(id)) { a.push(id); this.save(); } },
  // ids 중 아직 안 푼 것을 고름(순서대로, 또는 opt.random/opt.weight). 모두 풀었으면 그 묶음만 초기화
  pickNew(key, ids, opt = {}) {
    const a = this.doneArr(key), dn = new Set(a); let left = ids.filter(i => !dn.has(i));
    if (!left.length) { this.prof().done[key] = a.filter(i => !ids.includes(i)); this.save(); left = ids.slice(); this.toast('모두 풀었어요! 다시 시작해요 🎉'); }
    if (opt.weight) { let t = left.reduce((s, x) => s + opt.weight(x), 0), r = Math.random() * t; for (const x of left) { if ((r -= opt.weight(x)) <= 0) return x; } return left[0]; }
    return opt.random ? left[Math.floor(Math.random() * left.length)] : left[0];
  },
  // 한 판 문제 수 = 안 푼 문제 수와 10 중 작은 값. 모두 풀었으면 알리고 처음부터 다시
  roundSize(key, ids) {
    const a = this.doneArr(key); let left = ids.filter(i => !a.includes(i));
    if (!left.length) { this.prof().done[key] = a.filter(i => !ids.includes(i)); this.save(); left = ids.slice(); this.toast('모두 풀었어요! 다시 시작해요 🎉'); }
    return Math.min(10, left.length);
  },
  // 10문제가 아닌 판의 결과 문구/음성
  resultOpt(good, total) {
    return { label: `${total}개 중 <b>${good}</b>개 맞았어요`, say: good === total ? ['모두 맞았어요! 최고예요!', 'al_res_all'] : good === 0 ? ['괜찮아요, 다시 한번 해 볼까요?', '_res_0'] : [`${KCNT[good]} 개 맞았어요!`, 'al_res_' + good] };
  },
  // 푼 기록 범위: all=모든 공부 / 나머지는 해당 공부만
  SCOPES: { hangul: ['한글', []], number: ['숫자', ['add', 'add2', 'add3', 'sub', 'sub2', 'sub3', 'mix', 'mix2', 'mix3']], alpha: ['알파벳', ['a1', 'a2', 'l1', 'l2', 'w1', 'w2']], clock: ['시계', ['ch', 'cm', 'ca']], read: ['읽고 말하기', ['rd1', 'rd2', 'rd3']], play: ['놀이', ['odd1', 'odd2', 'odd3', 'mat1', 'mat2', 'mat3']] },
  solvedCount(scope = 'all') {
    const p = this.prof(), d = p.done || {}; let n = 0;
    if (scope === 'all' || scope === 'hangul') n += (p.solved || []).length + (p.solved2 || []).length + (p.solved3 || []).length;
    for (const [k, [, keys]] of Object.entries(this.SCOPES)) if (scope === 'all' || scope === k) n += keys.reduce((t, x) => t + (d[x] || []).length, 0);
    return n;
  },
  clearSolved(scope = 'all') {
    const n = this.solvedCount(scope); if (!n) return this.toast('지울 기록이 없어요');
    const name = scope === 'all' ? '모든 공부' : this.SCOPES[scope][0];
    if (!confirm(`${name}에서 푼 문제 ${n}개의 기록을 지울까요?\n(다시 처음부터 나와요)`)) return;
    const p = this.prof(); p.done = p.done || {};
    if (scope === 'all') { p.solved = []; p.solved2 = []; p.solved3 = []; p.done = {}; }
    else { if (scope === 'hangul') { p.solved = []; p.solved2 = []; p.solved3 = []; } this.SCOPES[scope][1].forEach(k => delete p.done[k]); }
    this.save(); this.toast('기록을 지웠어요');
  },
  addClr(scope) {   // 화면 위쪽 막대에 "푼 기록 지우기" 버튼을 붙임
    const bar = this.root.querySelector('header.bar'); if (!bar) return;
    const b = document.createElement('button'); b.className = 'chip'; b.id = 'clr'; b.textContent = '🔄 푼 기록 지우기';
    b.onclick = () => this.clearSolved(scope); bar.appendChild(b);
  },
  toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.className = 'show'; setTimeout(() => el.className = '', 1800); },
  home() {
    Speech.stop();
    const p = this.prof();
    this.root.innerHTML = `
      <header class="bar"><button class="chip" id="who">${p.avatar} ${p.name} · 바꾸기</button> <button class="chip" id="clr">🔄 푼 기록 지우기</button></header>
      <main class="home"><h1>무엇을 배워볼까요?</h1>
        <div class="cards">
          <button class="card c-ko" data-k="ko"><b>한글</b><span>ㄱ ㄴ ㄷ</span></button>
          <button class="card c-en" data-k="en"><b>알파벳</b><span>A B C</span></button>
          <button class="card c-ma" data-k="ma"><b>숫자</b><span>1 2 3</span></button>
          <button class="card c-ck" data-k="ck"><b>시계</b><span>🕒</span></button>
          <button class="card c-pl" data-k="pl"><b>놀이</b><span>🧩</span></button>
          <button class="card c-rd" data-k="rd"><b>읽고 말하기</b><span>🎤</span><small>🧪 실험중</small></button>
        </div></main>`;
    this.root.querySelector('#who').onclick = () => this.profiles();
    this.root.querySelector('#clr').onclick = () => this.clearSolved();
    this.root.querySelectorAll('.card').forEach(b => b.onclick = () => {
      if (b.dataset.k === 'rd') this.speakMenu(); else if (b.dataset.k === 'ko') this.hangulLevelMenu(); else if (b.dataset.k === 'ma') this.numberMenu(); else if (b.dataset.k === 'ck') this.clockMenu(); else if (b.dataset.k === 'pl') this.playMenu(); else this.alphaMenu();
    });
  },
  numberMenu() {
    Speech.stop();
    this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
      <main class="home"><h1>어떤 공부를 할까요?</h1>
        <div class="cards">
          <button class="card nm" data-k="add" style="background:#ffb199"><b>＋</b><span>더하기</span></button>
          <button class="card nm" data-k="sub" style="background:#ffd166"><b>－</b><span>빼기</span></button>
          <button class="card nm" data-k="all" style="background:#b8a1f0"><b>＋－</b><span>종합</span></button>
          <button class="card nm" data-k="sp" style="background:#8fd6e8"><b>⚡</b><span>순발력</span></button>
        </div></main>`;
    this.root.querySelector('#back').onclick = () => this.home();
    this.addClr('number');
    this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => b.dataset.k === 'sp' ? this.speedMenu() : this.mathMenu({ add: 'add', sub: 'sub', all: 'mix' }[b.dataset.k]));
  },
  finishRound(good, total, again, back, opt) {   // 한 판 끝 → 별 결과
    Speech.stop();
    if (!opt && total !== 10) opt = this.resultOpt(good, total);
    const CNT = ['', '한 개', '두 개', '세 개', '네 개', '다섯 개', '여섯 개', '일곱 개', '여덟 개', '아홉 개'];
    const msg0 = good === total ? '열 개 모두 맞았어요! 최고예요!' : good === 0 ? '괜찮아요, 다시 한번 해 볼까요?' : `열 개 중에 ${CNT[good]} 맞았어요!`;
    const msg = opt ? opt.say[0] : msg0, mname = opt ? opt.say[1] : '_res_' + good;
    this.root.innerHTML = `<main class="home result"><h1>${good === total ? '와! 모두 맞았어요!' : '잘했어요!'}</h1>
      <div class="rstars">${Array.from({ length: total }, (_, i) => `<span class="rs${i < good ? ' on' : ''}" style="--i:${i}">${i < good ? '⭐' : '☆'}</span>`).join('')}</div>
      <div class="rscore">${opt ? opt.label : `${total}개 중 <b>${good}</b>개 맞았어요`}</div>
      <div class="rbtns"><button class="chip big" id="again">다시 하기</button><button class="chip big" id="quit">그만하기</button></div></main>`;
    const stage = this.root.querySelector('.rstars'), delay = good * 220 + 500;
    const timers = [];
    for (let i = 0; i < good; i++) timers.push(setTimeout(() => { const s = document.createElement('i'); s.className = 'spark'; s.textContent = '✨'; const r = stage.children[i].getBoundingClientRect(); s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top}px;--x:${(Math.random() * 40 - 20)}vmin;--y:-14vmin`; document.body.appendChild(s); setTimeout(() => s.remove(), 1400); }, 300 + i * 220));
    if (good !== total) timers.push(setTimeout(() => Speech.play(msg, null, mname), delay));   // 모두 맞힌 경우에는 음성 없음
    const leave = fn => () => { timers.forEach(clearTimeout); Speech.stop(); fn(); };   // 버튼을 누르면 결과 음성을 바로 멈춤
    this.root.querySelector('#again').onclick = leave(again);
    this.root.querySelector('#quit').onclick = leave(back);
  },
  hangulLevelMenu() {
    Speech.stop();
    this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button></header>
      <main class="home"><h1>어떤 난이도로 할까요?</h1>
        <div class="cards">
          <button class="card nm" data-l="1" style="background:#b8e6a1"><b>쉬움</b><span>글자 고르기</span></button>
          <button class="card nm" data-l="2" style="background:#ffd166"><b>보통</b><span>자음·모음 누르기</span></button>
          <button class="card nm" data-l="3" style="background:#d9c8f5"><b>어려움</b><span>받침까지 누르기</span></button>
        </div></main>`;
    this.root.querySelector('#back').onclick = () => this.home();
    this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => b.dataset.l === '3' ? this.hangul('all', 3) : this.hangulMenu(+b.dataset.l));
  },
  hangulMenu(level = 1) {
    Speech.stop();
    const tot = Words.list.length;
    const card = (k, big, sub, n, i) => `<button class="card vw${n ? '' : ' off'}" data-v="${k}" style="background:hsl(${i * 48 + 8} 85% 80%)"><b>${big}</b><span>${sub}${n ? ' · ' + n + '개' : ' · 비어있음'}</span></button>`;
    this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="clr">🔄 푼 기록 지우기</button></span></header>
      <main class="home"><h1>어떤 모음을 배울까요?</h1>
        <div class="cards">${VOWELS.map((x, i) => card(x.v, x.v, x.ex, Words.count(x.v), i)).join('')}${card('all', '전체', '모두 섞어서', tot, 6)}</div>
</main>`;
    this.root.querySelector('#back').onclick = () => this.hangulLevelMenu();
    this.root.querySelector('#clr').onclick = () => this.clearSolved('hangul');
    this.root.querySelectorAll('.vw').forEach(b => b.onclick = () => b.classList.contains('off') ? this.toast('단어를 추가해 주세요') : this.hangul(b.dataset.v, level));
  },
  profiles() {
    const avatars = ['🐰','🐻','🐶','🐱','🐼','🦊','🐯','🐸'];
    const list = this.data.profiles.map(p => `<div class="prow"><button class="pbtn" data-id="${p.id}">${p.avatar}<span>${p.name}</span></button><button class="del" data-del="${p.id}" aria-label="삭제">✕</button></div>`).join('');
    this.root.innerHTML = `<main class="home"><h1>누가 놀까요?</h1>
      <div class="plist">${list}</div>
      <div class="padd"><input id="nm" maxlength="8" placeholder="이름"><div class="avs">${avatars.map((a,i)=>`<button class="av${i?'':' on'}" data-a="${a}">${a}</button>`).join('')}</div><button class="chip big" id="add">+ 추가하기</button></div></main>`;
    let av = avatars[0];
    this.root.querySelectorAll('.av').forEach(b => b.onclick = () => { av = b.dataset.a; this.root.querySelectorAll('.av').forEach(x => x.classList.toggle('on', x === b)); });
    this.root.querySelectorAll('.pbtn').forEach(b => b.onclick = () => { this.data.active = b.dataset.id; this.save(); this.home(); });
    this.root.querySelectorAll('.del').forEach(b => b.onclick = () => {
      if (!confirm('이 프로필과 학습 기록을 삭제할까요?')) return;
      this.data.profiles = this.data.profiles.filter(p => p.id !== b.dataset.del);
      if (this.data.active === b.dataset.del) this.data.active = null;
      this.save(); this.profiles();
    });
    this.root.querySelector('#add').onclick = () => {
      const name = this.root.querySelector('#nm').value.trim();
      if (!name) return this.toast('이름을 입력해 주세요');
      const id = 'p' + Date.now();
      this.data.profiles.push({ id, name, avatar: av, stats: {} });
      this.data.active = id; this.save(); this.home();
    };
  }
};
