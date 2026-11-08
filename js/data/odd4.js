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
    dog: { blink: blink(1), down: down(0) },
    cat: { blink: blink(0), whisker: R('M80 58H68', '') },
    bear: { cheek: R('<circle cx="71" cy="58" r="5" fill="#ff9fae" stroke="none"/>', ''), down: down(1) },
    rabbit: { blink: blink(1), cheek: R('<circle cx="70" cy="68" r="4.4" fill="#ffc2cf" stroke="none"/>', '') },
    pig: { blink: blink(0), down: down(1) },
    lion: { cheek: R('<circle cx="30" cy="58" r="5" fill="#ff9fae" stroke="none"/>', ''), mane: R(/(<circle cx="21\.42116167511352" cy="35\.5000000\d*" r="12" fill=")#d98b3a("\/>)/, '$1#c2702c$2') },
    koala: { blink: blink(0), nose: R('<ellipse cx="50" cy="60" rx="9" ry="12" fill="#3b3b3b"/>', '<ellipse cx="50" cy="61" rx="10.6" ry="10.6" fill="#3b3b3b"/>') },
    elephant: { wrinkle: R('M46 62h8M46 70h8', 'M46 66h8'), blink: blink(1) },
    fox: { blink: blink(1), tip: R('<path d="M92 44Q90 56 82 62Q92 66 94 50z" fill="#fff"', '<path d="M92 44Q90 56 82 62Q92 66 94 50z" fill="#f08a3c"') },
    duck: { blink: blink(0), foot: R('M42 90v6M58 90v6', 'M42 90v6') },
    horse: { blink: blink(0), down: down(1) },
    giraffe: { horn: R('<circle cx="62" cy="8" r="4.4" fill="#8a5a35"/>', '<circle cx="62" cy="8" r="4.4" fill="#c9965f"/>'), spot: R('<circle cx="70" cy="52" r="3.4" fill="#c98a3a"', '<circle cx="66" cy="55" r="3.4" fill="#c98a3a"') },
    frog: { gaze: gaze('<circle cx="70" cy="30" r="3" fill="#222" stroke="none"/>', '<circle cx="73.2" cy="27.4" r="3" fill="#222" stroke="none"/>'), cheek: R('<circle cx="78" cy="58" r="5" fill="#ff9fae" stroke="none"/>', '') },
    chicken: { blink: blink(0), wattle: R('<path d="M48 44q2 8 4 0" fill="#ef5b5b" stroke-width="2"/>', '') },
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
