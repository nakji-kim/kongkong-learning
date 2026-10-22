// 음성 우선순위: assets/audio/단어.mp3 (녹음/AI음성 파일) → 기기 내장 한국어 음성
const Speech = {
  S: { voice: '', tone: 'cute' }, t: 0, a: null,
  voices() {   // 자연스러운 음성(Natural/Online/Neural/Premium)을 앞으로
    if (!('speechSynthesis' in window)) return [];
    const rank = v => /natural|online|neural|premium|enhanced|wavenet/i.test(v.name) ? 0 : /google/i.test(v.name) ? 1 : 2;
    return speechSynthesis.getVoices().filter(v => v.lang.replace('_', '-').startsWith('ko')).sort((a, b) => rank(a) - rank(b));
  },
  tts(text, done, lang = 'ko-KR') {
    const t = this.t, end = () => { if (t === this.t && done) done(); };
    if (!('speechSynthesis' in window)) return void setTimeout(end, 700);
    const u = new SpeechSynthesisUtterance(text), cute = this.S.tone === 'cute', vs = this.voices();
    u.lang = lang; u.rate = lang === 'ko-KR' ? (cute ? 0.7 : 0.85) : 0.8; u.pitch = lang === 'ko-KR' ? (cute ? 1.6 : 1) : 1.3;
    if (lang === 'ko-KR') u.voice = vs.find(v => v.name === this.S.voice) || vs[0] || null;
    u.onend = end; u.onerror = end; speechSynthesis.speak(u);
  },
  play(text, done, name = text, lang = 'ko-KR') {   // assets/audio 파일 → 기기 음성
    const t = this.t; let used = false;
    const fb = () => { if (used || t !== this.t) return; used = true; this.tts(text, done, lang); };
    const fin = () => { if (!used && t === this.t) { used = true; done && done(); } };
    const file = () => { if (t !== this.t) return; const a = new Audio(encodeURI(`assets/audio/${name}.mp3`)); this.a = a; a.onended = fin; a.onerror = fb; a.play().catch(fb); };
    file();
  },
  after(fn, ms) { const t = this.t; setTimeout(() => { if (t === this.t) fn(); }, ms); },   // 도중에 stop() 되면 이어 읽기 취소
  say(text, done) { this.stop(); this.play(text, done); },
  twice(text, done, name = text, lang = 'ko-KR') { this.stop(); const t = this.t; this.play(text, () => setTimeout(() => { if (t === this.t) this.play(text, done, name, lang); }, 500), name, lang); },   // 중간에 stop() 되면 두 번째 읽기는 취소
  seq(parts, done, gap = 40) {   // [[글자, 파일이름], …] 을 차례로 말함 (숫자 문제처럼 짧은 조각을 이어 붙일 때)
    const t = this.t; let i = 0;
    const step = () => { if (t !== this.t) return; if (i >= parts.length) return void (done && done()); const [tx, nm] = parts[i++]; this.play(tx, () => setTimeout(step, gap), nm); };
    step();
  },
  talk(text, done) { this.stop(); this.tts(text, done); },   // 칭찬 등 (파일 조회 없음)
  stop() { this.t++; if (this.a) { this.a.onended = this.a.onerror = null; this.a.pause(); this.a = null; } 'speechSynthesis' in window && speechSynthesis.cancel(); }
};
