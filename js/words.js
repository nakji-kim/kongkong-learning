const VOWELS = [
  { v: 'ㅏ', ex: '아', jung: 0 }, { v: 'ㅓ', ex: '어', jung: 4 }, { v: 'ㅗ', ex: '오', jung: 8 },
  { v: 'ㅜ', ex: '우', jung: 13 }, { v: 'ㅡ', ex: '으', jung: 18 }, { v: 'ㅣ', ex: '이', jung: 20 }
];
const CHO = [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 16, 17, 18]; // ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ
const Words = {
  list: [], skipped: [],
  parse(text) {   // 항목 = (단어, 맞출 글자). 같은 단어가 다른 글자 아래 있으면 각각 별도 문제
    const seen = new Set(), list = [], skipped = [];
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*-\s*(\S+)\s*:\s*(.+)$/); if (!m) continue;
      const head = m[1], hc = head.charCodeAt(0) - 0xAC00;
      if (!/^[가-힣]$/.test(head) || hc % 28) { skipped.push(head + '(받침 있는 글자는 맞출 글자로 쓸 수 없음)'); continue; }
      for (const raw of m[2].split(/[,，]/)) {
        const w = raw.trim(), key = w + '|' + head;
        if (!/^[가-힣]+$/.test(w) || seen.has(key)) continue;   // "쉬운 그림 단어가 적음" 같은 메모는 무시
        seen.add(key);
        if (!w.includes(head)) { skipped.push(`${w}('${head}' 없음)`); continue; }
        list.push({ w, syl: head, jung: ((hc / 28) | 0) % 21 });
      }
    }
    return { list, skipped };
  },
  text() { return DEFAULT_WORDS_TEXT; },
  load() { const r = this.parse(this.text()); this.list = r.list; this.skipped = r.skipped; },
  count(v) { const j = VOWELS.find(x => x.v === v).jung; return this.list.filter(x => x.jung === j).length; }
};
