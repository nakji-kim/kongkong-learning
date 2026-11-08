// 다른 그림 찾기 어려움(lv4): 같은 그림 9장 중 눈·점 같은 아주 작은 부분만 살짝 다른 1장 찾기 (보통=lv3 보다 작은 차이)
// 각 그림의 기본 SVG 문자열에서 작은 원 하나의 크기를 바꿈: 작게(S) 또는 크게(B)
(function () {
  const circ = (s, fill, maxR, idx) => {   // 기본 그림에서 조건에 맞는 작은 원의 idx 번째 위치
    const re = new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="([\\d.]+)" fill="${fill}"`, 'g'), all = [];
    let m; while ((m = re.exec(s))) if (+m[3] <= maxR) all.push({ i: m.index, len: m[0].length, r: +m[3], t: m[0] });
    return all[idx] || all[0];
  };
  const size = (fill, maxR, idx, f) => s => {
    const c = circ(s, fill, maxR, idx); if (!c) return s;
    return s.slice(0, c.i) + c.t.replace(/ r="[\d.]+"/, ` r="${(c.r * f).toFixed(2)}"`) + s.slice(c.i + c.len);
  };
  const EYE = { dog: ['#222', 4], elephant: ['#222', 4], cat: ['#222', 4], bear: ['#222', 4], pig: ['#222', 4], lion: ['#222', 4], koala: ['#222', 4], horse: ['#222', 4], giraffe: ['#222', 4], fox: ['#222', 4], frog: ['#222', 4], chicken: ['#222', 4], duck: ['#222', 4], dino: ['#222', 4], rabbit: ['#222', 4] };
  const OTHER = { ladybug: ['#222', 7], car: ['#ddd', 6], butterfly: ['#fff', 6], house: ['#ffe266', 4], fish: ['#222', 3] };
  const F = { ladybug: [.8, 1.15], butterfly: [.75, 1.2], car: [.75, 1.2], frog: [.45, 1.8], fish: [.4, 1.9] };   // 그림별 크기 배율(작게, 크게)
  const V = {};
  Object.entries(EYE).forEach(([k, [c, r]]) => { const f = F[k] || [.64, 1.32]; V[k] = { e4s: size(c, r, 0, f[0]), e4b: size(c, r, 1, f[1]) }; });
  Object.entries(OTHER).forEach(([k, [c, r]]) => { const f = F[k] || [.62, 1.32]; V[k] = { e4s: size(c, r, 0, f[0]), e4b: size(c, r, 1, f[1]) }; });
  delete V.frog.e4s; delete V.fish.e4s;   // 너무 작아서 구분이 안 되는 것은 뺌
  Object.entries(V).forEach(([k, vs]) => {
    const o = ODD2[k]; if (!o) return; const base = o.draw;
    o.lv4 = Object.keys(vs);
    o.draw = d => (d && vs[d]) ? vs[d](base()) : base(d);
  });
})();
