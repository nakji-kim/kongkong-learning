// 다른 그림 찾기 어려움(lv4): 같은 그림 9장 중 "크기가 아닌" 작은 차이 1장 찾기 (감은 눈·위치·개수·비슷한 색·시선 …)
// 기본 그림 SVG 문자열을 조금만 바꿔서 변형을 만듦
(function () {
  const EYE = /<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="#222" stroke="none"\/>/g;
  const eyeAt = (s, i) => { const all = []; let m; EYE.lastIndex = 0; while ((m = EYE.exec(s))) if (+m[3] <= 4.2) all.push(m); return all[i]; };
  const swapEye = (i, fn) => s => { const m = eyeAt(s, i); if (!m) return s; return s.slice(0, m.index) + fn(+m[1], +m[2], +m[3]) + s.slice(m.index + m[0].length); };
  const blink = i => swapEye(i, (x, y, r) => `<path d="M${(x - r).toFixed(1)} ${(y + r * .3).toFixed(1)}q${r} ${(-r * 1.5).toFixed(1)} ${2 * r} 0" fill="none" stroke="#222" stroke-width="2.2"/>`);   // 감은 눈
  const down = i => swapEye(i, (x, y, r) => `<circle cx="${x}" cy="${y + 4}" r="${r}" fill="#222" stroke="none"/>`);                                    // 눈 하나가 아래로
  const gaze = (from, to) => s => s.replace(from, to);
  const R = (a, b) => s => s.replace(a, b);
  const V = {
    dog: { blink: blink(1), tongue: R('<path d="M46 72q4 12 8 0z" fill="#ff7b8a"/>', ''), patch: R('<circle cx="37" cy="48" r="10" fill="#a8703f"', '<circle cx="63" cy="48" r="10" fill="#a8703f"') },
    cat: { whisker: R('M80 58H68', ''), stripe: R('M44 31l1 7', '') },
    bear: { cheek: R('<circle cx="71" cy="58" r="5" fill="#ff9fae" stroke="none"/>', ''), ear: R('<circle cx="76" cy="26" r="6" fill="#e8b98c"', '<circle cx="76" cy="26" r="6" fill="#b9814f"') },
    rabbit: { ear: R('<ellipse cx="64" cy="27" rx="4.4" ry="15"', '<ellipse cx="64" cy="27" rx="4.4" ry="9"') },
    pig: { down: down(1), nostril: R('<ellipse cx="56" cy="64" rx="2.6" ry="4" fill="#8a3a50" stroke="none"/>', ''), ear: R('M82 34L76 10L56 26z', 'M82 34L84 12L56 26z') },
    lion: { mane: R(/(<circle cx="21\.42116167511352" cy="35\.5000000\d*" r="12" fill=")#d98b3a("\/>)/, '$1#c2702c$2'), ear: R('<circle cx="74" cy="22" r="8" fill="#f2b45f"/>', '') },
    koala: { nose: R('<ellipse cx="50" cy="60" rx="9" ry="12" fill="#3b3b3b"/>', '<ellipse cx="50" cy="61" rx="10.6" ry="10.6" fill="#3b3b3b"/>'), ear: R('<circle cx="80" cy="38" r="9" fill="#f1dfe3"', '<circle cx="80" cy="38" r="5" fill="#f1dfe3"') },
    elephant: { wrinkle: R('M46 62h8M46 70h8', 'M46 66h8'), tusk: R('M60 56L69 74L55 67z', 'M60 56L66 66L55 67z') },
    fox: { tip: R('<path d="M92 44Q90 56 82 62Q92 66 94 50z" fill="#fff"', '<path d="M92 44Q90 56 82 62Q92 66 94 50z" fill="#f08a3c"'), ear: R('<path d="M66 30L66 18L57 26z" fill="#5b4033" stroke="none"/>', '') },
    duck: { foot: R('M42 90v6M58 90v6', 'M42 90v6'), tuft: R('<path d="M36 17q2-8 8-6q-2 3-2 7z" fill="#ffcc33"/>', '') },
    horse: { nostril: R('<ellipse cx="56" cy="76" rx="2.4" ry="3.6" fill="#5b3a29" stroke="none"/>', ''), ear: R('M70 28L74 8L58 22z', 'M70 28L80 12L58 22z') },
    giraffe: { horn: R('<circle cx="62" cy="8" r="4.4" fill="#8a5a35"/>', '<circle cx="62" cy="8" r="4.4" fill="#c9965f"/>'), spot: R('<circle cx="70" cy="52" r="3.4" fill="#c98a3a"', '<circle cx="66" cy="55" r="3.4" fill="#c98a3a"') },
    frog: { gaze: gaze('<circle cx="70" cy="30" r="3" fill="#222" stroke="none"/>', '<circle cx="73.2" cy="27.4" r="3" fill="#222" stroke="none"/>'), cheek: R('<circle cx="78" cy="58" r="5" fill="#ff9fae" stroke="none"/>', '') },
    chicken: { wattle: R('<path d="M48 44q2 8 4 0" fill="#ef5b5b" stroke-width="2"/>', ''), comb: R('Q50 6 56 18Q64 10 64 26z', 'Q56 6 64 26z'), wing: R('<circle cx="46" cy="64" r="3.8" fill="#ff9d3d" stroke="none"/>', '') },
    ladybug: { spot: R('<circle cx="32" cy="72" r="5" fill="#222" stroke="none"/>', '<circle cx="28" cy="70" r="5" fill="#222" stroke="none"/>'), dot: R('<circle cx="56" cy="28" r="2.4" fill="#fff" stroke="none"/>', '') },
    butterfly: { move: R('<circle cx="72" cy="34" r="5" fill="#fff" stroke="none"/>', '<circle cx="76" cy="38" r="5" fill="#fff" stroke="none"/>'), tint: R('<path d="M50 52Q86 56 78 82Q62 90 50 56z" fill="#ff8fa3"/>', '<path d="M50 52Q86 56 78 82Q62 90 50 56z" fill="#ff6485"/>') },
  };
  Object.entries(V).forEach(([k, vs]) => {
    const o = ODD2[k]; if (!o) return; const base = o.draw;
    const names = Object.keys(vs).filter(n => vs[n](base()) !== base());   // 실제로 바뀌는 것만
    o.lv4 = names.map(n => 'x_' + n);
    o.draw = d => (d && d.startsWith('x_') && vs[d.slice(2)]) ? vs[d.slice(2)](base()) : base(d);
  });
})();
