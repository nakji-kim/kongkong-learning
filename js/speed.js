/* 숫자 · 순발력: 판에 흩어진 숫자를 1부터 차례로 빠르게 누르기 (한 판, 기록 저장) */
const SPEED_LV = { 1: { name: '쉬움', max: 10, n: 3, bg: '#b8e6a1' }, 2: { name: '보통', max: 20, n: 3, bg: '#ffd166' }, 3: { name: '어려움', max: 30, n: 4, bg: '#d9c8f5' } };
/* 효과음: 파일 없이 Web Audio로 바로 만들어 지연이 거의 없음 */
const _sfx = { ctx: null,
  init() { try { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { } },
  tone(f0, f1, dur, type, vol) { try { const c = this.ctx; if (!c) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02); } catch (e) { } },
  ok() { this.tone(988, 1568, 0.09, 'sine', 0.75); },
  bad() { this.tone(330, 300, 0.14, 'square', 0.3); } };
const _fmt = ms => (ms / 1000).toFixed(1) + '초';
App.speedMenu = function () {
  Speech.stop();
  const sp = this.prof().speed || {};
  this.root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span><button class="chip" id="clr">🔄 기록 지우기</button></span></header>
    <main class="home"><h1>순발력 · 범위를 골라요</h1><div class="cards">${[1, 2, 3].map(l => { const c = SPEED_LV[l]; return `<button class="card nm" data-l="${l}" style="background:${c.bg}"><b>${c.name}</b><span>1~${c.max} · ${c.n}×${c.n}</span><span>${sp[l] ? '🏆 ' + _fmt(sp[l]) : '기록 없음'}</span></button>`; }).join('')}</div></main>`;
  this.root.querySelector('#back').onclick = () => this.numberMenu();
  this.root.querySelector('#clr').onclick = () => {
    const p = this.prof(); if (!p.speed || !Object.keys(p.speed).length) return this.toast('지울 기록이 없어요');
    if (!confirm('순발력 기록을 모두 지울까요?')) return;
    p.speed = {}; this.save(); this.toast('기록을 지웠어요'); this.speedMenu();
  };
  this.root.querySelectorAll('.nm').forEach(b => b.onclick = () => { _sfx.init(); this.speedGame(+b.dataset.l); });
};
App.speedGame = function (level) {
  const root = this.root, { max, n, name } = SPEED_LV[level], cnt = n * n;
  let gone = false, timers = [], iv = null, next = 1, pen = 0, t0 = 0, busy = true, cells = [];
  const later = (fn, ms) => { const t = setTimeout(() => { if (!gone) fn(); }, ms); timers.push(t); return t; };
  const leave = () => { gone = true; timers.forEach(clearTimeout); clearInterval(iv); Speech.stop(); };
  root.innerHTML = `<header class="bar"><button class="chip" id="back">← 뒤로</button><span class="chip" id="tm">⏱ 0.0초</span></header>
    <main class="game sp"><div class="spg" id="spg" style="--n:${n}"></div><div class="spcd" id="cd"></div></main>`;
  root.querySelector('#back').onclick = () => { leave(); App.speedMenu(); };
  const grid = root.querySelector('#spg'), cd = root.querySelector('#cd'), tm = root.querySelector('#tm');
  const elapsed = () => Date.now() - t0 + pen * 1000;
  const start = () => {
    const nums = Array.from({ length: cnt }, (_, i) => i + 1).sort(() => Math.random() - .5); cells = nums;
    grid.innerHTML = nums.map((v, i) => `<button class="spc" data-i="${i}">${v}</button>`).join('');
    t0 = Date.now(); busy = false;
    iv = setInterval(() => { tm.textContent = '⏱ ' + _fmt(elapsed()); }, 100);
    grid.onclick = e => {
      const b = e.target.closest('.spc'); if (!b || busy || gone || b.classList.contains('gone')) return;
      const i = +b.dataset.i, v = cells[i];
      if (v === next) {
        _sfx.ok(); next++; cells[i] = 0; b.classList.add('gone');
        if (next > max) return finish();
        const nv = v + cnt; later(() => { if (nv <= max) { cells[i] = nv; b.textContent = nv; b.classList.remove('gone'); b.classList.add('born'); later(() => b.classList.remove('born'), 300); } }, 180);
      } else {
        _sfx.bad(); pen++; b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad');
        const f = document.createElement('i'); f.className = 'sppen'; f.textContent = '+1초'; b.appendChild(f); later(() => f.remove(), 700);
        tm.textContent = '⏱ ' + _fmt(elapsed());
      }
    };
  };
  const finish = () => {
    busy = true; clearInterval(iv); const total = elapsed(); tm.textContent = '⏱ ' + _fmt(total);
    const p = App.prof(); p.speed = p.speed || {}; const best = p.speed[level], isNew = best != null && total < best;
    if (best == null || total < best) { p.speed[level] = total; App.save(); }
    later(() => {
      root.innerHTML = `<main class="home result"><h1>${isNew ? '대단해요! 신기록이에요!' : '끝났어요!'}</h1>
        <div class="rstars"><span class="rs on" style="--i:0">${isNew ? '🏆' : '⏱'}</span></div>
        <div class="rscore">내 기록 <b>${_fmt(total)}</b>${pen ? `<br><small>(틀려서 +${pen}초 포함)</small>` : ''}<br><small>${name} 최고 기록 ${_fmt(p.speed[level])}${best == null ? ' · 첫 기록이에요!' : ''}</small></div>
        <div class="rbtns"><button class="chip big" id="again">다시 하기</button><button class="chip big" id="quit">그만하기</button></div></main>`;
      root.querySelector('#again').onclick = () => { leave(); _sfx.init(); App.speedGame(level); };
      root.querySelector('#quit').onclick = () => { leave(); App.speedMenu(); };
      if (isNew) later(() => Speech.play('대단해요! 신기록이에요!', null, 'p_speed_new'), 500);
    }, 700);
  };
  [3, 2, 1].forEach((c, k) => later(() => { cd.textContent = c; cd.classList.remove('go'); void cd.offsetWidth; cd.classList.add('go'); }, k * 800));
  later(() => { cd.textContent = ''; start(); }, 2400);
};
