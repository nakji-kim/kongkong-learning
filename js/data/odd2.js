// 다른 그림 찾기(보통/어려움): 같은 그림 여러 장 중 모양이 살짝 다른 한 장 찾기. 그림은 코드로 그린 SVG.
// draw(d): d 가 없으면 기본 그림, 있으면 그 부분만 다르게 그림. lv2=눈에 띄는 차이, lv3=작은 차이
const _O = '#5b4033';   // 윤곽선
const _s = (inner) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="${_O}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ODD2 = {
  dog: { ko: '강아지', lv2: ['ear', 'tongue'], lv3: ['patch'],
    draw: d => _s(`
      <ellipse cx="21" cy="52" rx="11" ry="21" transform="rotate(14 21 52)" fill="#8a5a35"/>
      <ellipse cx="79" cy="52" rx="11" ry="21" transform="rotate(-14 79 52)" fill="${d === 'ear' ? '#f6efe4' : '#8a5a35'}"/>
      <ellipse cx="50" cy="55" rx="29" ry="27" fill="#f2c58a"/>
      ${d === 'patch' ? '' : '<circle cx="37" cy="48" r="10" fill="#a8703f" stroke="none"/>'}
      <circle cx="37" cy="48" r="3.6" fill="#222" stroke="none"/><circle cx="63" cy="48" r="3.6" fill="#222" stroke="none"/>
      <ellipse cx="50" cy="63" rx="16" ry="12" fill="#fbe6c4" stroke="none"/>
      <ellipse cx="50" cy="58" rx="6" ry="4.4" fill="#222"/>
      <path d="M50 62v6M50 68q-6 5-11 1M50 68q6 5 11 1" fill="none"/>
      ${d === 'tongue' ? '' : '<path d="M46 72q4 12 8 0z" fill="#ff7b8a"/>'}`) },
  elephant: { ko: '코끼리', lv2: ['trunk'], lv3: ['tusk'],
    draw: d => _s(`
      <circle cx="20" cy="42" r="17" fill="#a9b7c6"/><circle cx="80" cy="42" r="17" fill="#a9b7c6"/>
      <circle cx="20" cy="42" r="9" fill="#e7b9c3" stroke="none"/><circle cx="80" cy="42" r="9" fill="#e7b9c3" stroke="none"/>
      <ellipse cx="50" cy="46" rx="26" ry="28" fill="#bccad8"/>
      <circle cx="40" cy="40" r="3.6" fill="#222" stroke="none"/><circle cx="60" cy="40" r="3.6" fill="#222" stroke="none"/>
      ${d === 'tusk' ? '' : '<path d="M40 56L31 74L45 67z" fill="#fff"/>'}
      <path d="M60 56L69 74L55 67z" fill="#fff"/>
      <path d="M43 52h14v${d === 'trunk' ? 18 : 38}q0 6-7 6t-7-6z" fill="#bccad8"/>
      <path d="M46 62h8M46 70h8" fill="none" stroke-width="1.6" opacity=".5"/>`) },
  cat: { ko: '고양이', lv2: ['ear'], lv3: ['stripe'],
    draw: d => _s(`
      <path d="M22 44L26 14L48 30z" fill="#f4a85b"/><path d="M78 44L74 14L52 30z" fill="#f4a85b"/>
      <path d="M28 36L29 22L40 31z" fill="#ffc6d1" stroke="none"/><path d="M72 36L71 22L60 31z" fill="${d === 'ear' ? '#8fd0ff' : '#ffc6d1'}" stroke="none"/>
      <ellipse cx="50" cy="56" rx="31" ry="27" fill="#f4a85b"/>
      <path d="M50 30v9M44 31l1 7M56 31l-1 7" fill="none" ${d === 'stripe' ? 'style="display:none"' : ''}/>
      ${d === 'stripe' ? '<path d="M50 30v9M44 31l1 7" fill="none"/>' : ''}
      <circle cx="38" cy="52" r="3.8" fill="#222" stroke="none"/><circle cx="62" cy="52" r="3.8" fill="#222" stroke="none"/>
      <path d="M47 60h6l-3 4z" fill="#ff7b8a"/><path d="M50 64q-5 6-9 2M50 64q5 6 9 2" fill="none"/>
      <path d="M20 58h12M21 65l11-3M80 58H68M79 65l-11-3" fill="none" stroke-width="1.8"/>`) },
  butterfly: { ko: '나비', lv2: ['wing', 'antenna'], lv3: ['dot'],
    draw: d => _s(`
      <path d="M50 46Q20 6 12 34Q10 50 50 50z" fill="#ffb347"/><path d="M50 46Q80 6 88 34Q90 50 50 50z" fill="#ffb347"/>
      <path d="M50 52Q14 56 22 82Q38 90 50 56z" fill="#ff8fa3"/><path d="M50 52Q86 56 78 82Q62 90 50 56z" fill="${d === 'wing' ? '#8fc7ff' : '#ff8fa3'}"/>
      <circle cx="28" cy="34" r="5" fill="#fff" stroke="none"/><circle cx="72" cy="34" r="5" fill="#fff" stroke="none"/>
      <circle cx="30" cy="72" r="4.4" fill="#fff" stroke="none"/>${d === 'dot' ? '' : '<circle cx="70" cy="72" r="4.4" fill="#fff" stroke="none"/>'}
      <ellipse cx="50" cy="52" rx="4.6" ry="22" fill="#6b4a3a"/>
      <path d="M48 31Q40 18 33 15" fill="none"/>${d === 'antenna' ? '' : '<path d="M52 31Q60 18 67 15" fill="none"/>'}`) },
  fish: { ko: '물고기', lv2: ['fin'], lv3: ['stripe'],
    draw: d => _s(`
      <path d="M70 50L94 32V68z" fill="#ff9d4d"/>
      ${d === 'fin' ? '' : '<path d="M32 32Q48 4 66 32z" fill="#ff9d4d"/>'}
      <ellipse cx="48" cy="50" rx="30" ry="22" fill="#ffb66a"/>
      <path d="M46 31q-5 19 0 38M58 32q-4 18 0 36" fill="none" stroke="#fff" stroke-width="3.4"/>
      ${d === 'stripe' ? '' : '<path d="M34 34q-3 16 0 32" fill="none" stroke="#fff" stroke-width="3.4"/>'}
      <circle cx="30" cy="45" r="4" fill="#fff"/><circle cx="29" cy="45" r="2" fill="#222" stroke="none"/>
      <path d="M20 56q4 3 8 0" fill="none"/>`) },
  snail: { ko: '달팽이', lv2: ['antenna'], lv3: ['ring'],
    draw: d => _s(`
      <path d="M12 78Q8 60 24 60L82 62Q94 62 90 76Q88 80 80 80H18z" fill="#b8d98f"/>
      <circle cx="56" cy="50" r="28" fill="#f0a56e"/><circle cx="56" cy="50" r="19" fill="#f7c392"/>
      ${d === 'ring' ? '' : '<circle cx="56" cy="50" r="11" fill="#f0a56e"/>'}<circle cx="56" cy="50" r="4" fill="#f7c392"/>
      <path d="M20 62Q18 44 14 38M28 62Q28 46 30 38" fill="none" ${d === 'antenna' ? 'style="display:none"' : ''}/>
      ${d === 'antenna' ? '<path d="M28 62Q28 46 30 38" fill="none"/><circle cx="30" cy="36" r="3" fill="#b8d98f"/>' : '<circle cx="14" cy="36" r="3" fill="#b8d98f"/><circle cx="30" cy="36" r="3" fill="#b8d98f"/>'}
      <circle cx="19" cy="70" r="2.6" fill="#222" stroke="none"/>`) },
  bear: { ko: '곰', lv2: ['ear'], lv3: ['cheek'],
    draw: d => _s(`
      <circle cx="24" cy="26" r="13" fill="#b9814f"/>${d === 'ear' ? '' : '<circle cx="76" cy="26" r="13" fill="#b9814f"/>'}
      <circle cx="24" cy="26" r="6" fill="#e8b98c" stroke="none"/>${d === 'ear' ? '' : '<circle cx="76" cy="26" r="6" fill="#e8b98c" stroke="none"/>'}
      <circle cx="50" cy="54" r="31" fill="#b9814f"/><ellipse cx="50" cy="64" rx="15" ry="12" fill="#ecc79d" stroke="none"/>
      <circle cx="38" cy="46" r="3.6" fill="#222" stroke="none"/><circle cx="62" cy="46" r="3.6" fill="#222" stroke="none"/>
      <ellipse cx="50" cy="59" rx="5.4" ry="4" fill="#222"/><path d="M50 63v5M50 68q-5 4-9 1M50 68q5 4 9 1" fill="none"/>
      <circle cx="29" cy="58" r="5" fill="#ff9fae" stroke="none"/>${d === 'cheek' ? '' : '<circle cx="71" cy="58" r="5" fill="#ff9fae" stroke="none"/>'}`) },
  rabbit: { ko: '토끼', lv2: ['ear'], lv3: ['inner'],
    draw: d => _s(`
      <ellipse cx="36" cy="26" rx="9" ry="22" fill="#fff"/><ellipse cx="64" cy="${d === 'ear' ? 34 : 26}" rx="9" ry="${d === 'ear' ? 14 : 22}" fill="#fff"/>
      <ellipse cx="36" cy="27" rx="4.4" ry="15" fill="#ffc2cf" stroke="none"/>${d === 'inner' ? '' : `<ellipse cx="64" cy="27" rx="4.4" ry="15" fill="#ffc2cf" stroke="none"/>`}
      <circle cx="50" cy="62" r="29" fill="#fff"/>
      <circle cx="39" cy="58" r="3.6" fill="#222" stroke="none"/><circle cx="61" cy="58" r="3.6" fill="#222" stroke="none"/>
      <path d="M47 66h6l-3 3z" fill="#ff8aa0"/><path d="M50 69q-5 5-9 2M50 69q5 5 9 2" fill="none"/>
      <circle cx="30" cy="68" r="4.4" fill="#ffc2cf" stroke="none"/><circle cx="70" cy="68" r="4.4" fill="#ffc2cf" stroke="none"/>`) },
  ant: { ko: '개미', lv2: ['antenna'], lv3: ['leg'],
    draw: d => _s(`
      <path d="M44 42Q32 28 26 24M56 42Q68 28 74 24" fill="none" ${d === 'antenna' ? 'style="display:none"' : ''}/>
      ${d === 'antenna' ? '<path d="M44 42Q32 28 26 24" fill="none"/>' : ''}
      <path d="M40 56L20 48M40 62L18 64M42 68L24 84M60 56L80 48M60 62L82 64M58 68L76 84" fill="none" stroke-width="3" ${d === 'leg' ? 'style="display:none"' : ''}/>
      ${d === 'leg' ? '<path d="M40 56L20 48M40 62L18 64M42 68L24 84M60 56L80 48M60 62L82 64" fill="none" stroke-width="3"/>' : ''}
      <ellipse cx="50" cy="26" rx="0" ry="0"/>
      <circle cx="50" cy="40" r="13" fill="#7a4b3a"/><ellipse cx="50" cy="62" rx="9" ry="10" fill="#8a5644"/><ellipse cx="50" cy="82" rx="13" ry="14" fill="#7a4b3a"/>
      <circle cx="45" cy="38" r="2.8" fill="#fff" stroke="none"/><circle cx="55" cy="38" r="2.8" fill="#fff" stroke="none"/>
      <circle cx="45" cy="38" r="1.3" fill="#222" stroke="none"/><circle cx="55" cy="38" r="1.3" fill="#222" stroke="none"/>`) },
};

ODD2.penguin = { ko: '펭귄', lv2: ['flipper', 'foot'], lv3: ['cheek'],
  draw: d => _s(`
    ${d === 'flipper' ? '' : '<ellipse cx="20" cy="58" rx="8" ry="20" transform="rotate(14 20 58)" fill="#3b4252"/>'}<ellipse cx="80" cy="58" rx="8" ry="20" transform="rotate(-14 80 58)" fill="#3b4252"/>
    <path d="M36 90h-8q2-8 12-6zM64 90h8q-2-8-12-6z" fill="#ff9d3d" ${d === 'foot' ? 'style="display:none"' : ''}/>
    ${d === 'foot' ? '<path d="M64 90h8q-2-8-12-6z" fill="#ff9d3d"/>' : ''}
    <ellipse cx="50" cy="52" rx="28" ry="36" fill="#3b4252"/><ellipse cx="50" cy="60" rx="18" ry="26" fill="#fff" stroke="none"/>
    <circle cx="41" cy="40" r="3.6" fill="#fff" stroke="none"/><circle cx="59" cy="40" r="3.6" fill="#fff" stroke="none"/>
    <circle cx="41" cy="40" r="1.8" fill="#222" stroke="none"/><circle cx="59" cy="40" r="1.8" fill="#222" stroke="none"/>
    <path d="M44 48h12l-6 8z" fill="#ff9d3d"/>
    <circle cx="35" cy="52" r="4" fill="#ff9fae" stroke="none"/>${d === 'cheek' ? '' : '<circle cx="65" cy="52" r="4" fill="#ff9fae" stroke="none"/>'}`) };
ODD2.pig = { ko: '돼지', lv2: ['ear'], lv3: ['nostril'],
  draw: d => _s(`
    <path d="M18 34L24 10L44 26z" fill="#ff9fb4"/>${d === 'ear' ? '' : '<path d="M82 34L76 10L56 26z" fill="#ff9fb4"/>'}
    <circle cx="50" cy="54" r="32" fill="#ffb6c6"/>
    <circle cx="36" cy="46" r="3.8" fill="#222" stroke="none"/><circle cx="64" cy="46" r="3.8" fill="#222" stroke="none"/>
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#ff8fa8"/>
    <ellipse cx="44" cy="64" rx="2.6" ry="4" fill="#8a3a50" stroke="none"/>${d === 'nostril' ? '' : '<ellipse cx="56" cy="64" rx="2.6" ry="4" fill="#8a3a50" stroke="none"/>'}`) };
ODD2.lion = { ko: '사자', lv2: ['ear'], lv3: ['cheek'],
  draw: d => _s(`
    ${[...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return `<circle cx="${50 + 33 * Math.cos(a)}" cy="${52 + 33 * Math.sin(a)}" r="12" fill="#d98b3a"/>`; }).join('')}
    <circle cx="26" cy="22" r="8" fill="#f2b45f"/>${d === 'ear' ? '' : '<circle cx="74" cy="22" r="8" fill="#f2b45f"/>'}
    <circle cx="50" cy="52" r="26" fill="#f6c46f"/>
    <circle cx="40" cy="46" r="3.6" fill="#222" stroke="none"/><circle cx="60" cy="46" r="3.6" fill="#222" stroke="none"/>
    <ellipse cx="50" cy="60" rx="12" ry="9" fill="#fbe0aa" stroke="none"/>
    <path d="M46 56h8l-4 5z" fill="#a8553a"/><path d="M50 61q-5 6-9 2M50 61q5 6 9 2" fill="none"/>
    <circle cx="40" cy="62" r="1.2" fill="#a8553a" stroke="none"/><circle cx="60" cy="62" r="1.2" fill="#a8553a" stroke="none"/>
    <circle cx="30" cy="58" r="5" fill="#ff9fae" stroke="none"/>${d === 'cheek' ? '' : '<circle cx="70" cy="58" r="5" fill="#ff9fae" stroke="none"/>'}`) };
ODD2.duck = { ko: '오리', lv2: ['wing'], lv3: ['tuft'],
  draw: d => _s(`
    <path d="M68 56q22-2 24-14q-12 2-24 4z" fill="#ffd84a"/>
    <ellipse cx="50" cy="66" rx="32" ry="24" fill="#ffe266"/>
    ${d === 'wing' ? '' : '<path d="M36 62q22-6 26 10q-14 10-26-10z" fill="#ffcc33"/>'}
    <circle cx="38" cy="36" r="20" fill="#ffe266"/>
    ${d === 'tuft' ? '' : '<path d="M36 17q2-8 8-6q-2 3-2 7z" fill="#ffcc33"/>'}
    <path d="M22 36q-14 2-16 8q8 4 18 2z" fill="#ff9d3d"/>
    <circle cx="36" cy="32" r="3.4" fill="#222" stroke="none"/>
    <path d="M42 90v6M58 90v6" stroke="#ff9d3d" stroke-width="4" fill="none"/>`) };
ODD2.turtle = { ko: '거북이', lv2: ['leg'], lv3: ['spot'],
  draw: d => _s(`
    <circle cx="50" cy="12" r="0" />
    <ellipse cx="50" cy="20" rx="11" ry="13" fill="#9bd36b"/><circle cx="46" cy="18" r="2" fill="#222" stroke="none"/><circle cx="54" cy="18" r="2" fill="#222" stroke="none"/>
    <ellipse cx="22" cy="40" rx="9" ry="12" fill="#9bd36b"/><ellipse cx="78" cy="40" rx="9" ry="12" fill="#9bd36b"/>
    <ellipse cx="22" cy="76" rx="9" ry="12" fill="#9bd36b"/>${d === 'leg' ? '' : '<ellipse cx="78" cy="76" rx="9" ry="12" fill="#9bd36b"/>'}
    <ellipse cx="50" cy="58" rx="30" ry="34" fill="#6aa84f"/>
    <ellipse cx="50" cy="58" rx="9" ry="10" fill="#8fcf6a"/><ellipse cx="34" cy="48" rx="6" ry="7" fill="#8fcf6a"/><ellipse cx="66" cy="48" rx="6" ry="7" fill="#8fcf6a"/>
    <ellipse cx="36" cy="72" rx="6" ry="7" fill="#8fcf6a"/>${d === 'spot' ? '' : '<ellipse cx="64" cy="72" rx="6" ry="7" fill="#8fcf6a"/>'}`) };
ODD2.ladybug = { ko: '무당벌레', lv2: ['antenna'], lv3: ['spot'],
  draw: d => _s(`
    <path d="M42 22Q34 10 28 8" fill="none" ${d === 'antenna' ? 'style="display:none"' : ''}/><path d="M58 22Q66 10 72 8" fill="none"/>
    ${d === 'antenna' ? '' : '<path d="M42 22Q34 10 28 8" fill="none"/>'}
    <circle cx="50" cy="30" r="14" fill="#3b3b3b"/>
    <ellipse cx="50" cy="62" rx="34" ry="32" fill="#e8483f"/><path d="M50 32v62" fill="none"/>
    <circle cx="36" cy="52" r="6" fill="#222" stroke="none"/><circle cx="64" cy="52" r="6" fill="#222" stroke="none"/>
    <circle cx="32" cy="72" r="5" fill="#222" stroke="none"/>${d === 'spot' ? '' : '<circle cx="68" cy="72" r="5" fill="#222" stroke="none"/>'}
    <circle cx="44" cy="28" r="2.4" fill="#fff" stroke="none"/><circle cx="56" cy="28" r="2.4" fill="#fff" stroke="none"/>`) };
ODD2.flower = { ko: '꽃', lv2: ['petal'], lv3: ['leaf'],
  draw: d => _s(`
    <path d="M50 52v42" fill="none" stroke="#4d9a45" stroke-width="5"/>
    <path d="M50 80Q30 76 24 62Q42 62 50 80z" fill="#7ecb6a"/>${d === 'leaf' ? '' : '<path d="M50 74Q70 70 76 56Q58 56 50 74z" fill="#7ecb6a"/>'}
    ${[...Array(6)].map((_, i) => { const a = i * Math.PI / 3 - Math.PI / 2; return (d === 'petal' && i === 2) ? '' : `<circle cx="${50 + 22 * Math.cos(a)}" cy="${34 + 22 * Math.sin(a)}" r="13" fill="#ff9fc4"/>`; }).join('')}
    <circle cx="50" cy="34" r="11" fill="#ffd84a"/>`) };
ODD2.car = { ko: '자동차', lv2: ['wheel'], lv3: ['window'],
  draw: d => _s(`
    <path d="M10 62Q10 50 22 48L32 32Q36 28 42 28H62Q68 28 72 32L82 48Q92 50 92 62V70H10z" fill="#ef5b5b"/>
    <path d="M36 34L28 48H48V34zM54 34V48H76L68 34z" fill="#bfe6ff" ${d === 'window' ? 'style="display:none"' : ''}/>
    ${d === 'window' ? '<path d="M36 34L28 48H48V34z" fill="#bfe6ff"/>' : ''}
    <rect x="84" y="56" width="8" height="7" rx="2" fill="#ffe266"/>
    <circle cx="30" cy="72" r="11" fill="#444"/><circle cx="30" cy="72" r="4.4" fill="#ddd" stroke="none"/>
    ${d === 'wheel' ? '' : '<circle cx="72" cy="72" r="11" fill="#444"/><circle cx="72" cy="72" r="4.4" fill="#ddd" stroke="none"/>'}`) };
ODD2.house = { ko: '집', lv2: ['chimney'], lv3: ['knob'],
  draw: d => _s(`
    ${d === 'chimney' ? '' : '<rect x="66" y="12" width="12" height="26" fill="#b5651d"/>'}
    <rect x="16" y="46" width="68" height="44" fill="#ffe4b5"/>
    <path d="M8 48L50 14L92 48z" fill="#e8584f"/>
    <rect x="42" y="62" width="18" height="28" rx="2" fill="#a0642d"/>
    ${d === 'knob' ? '' : '<circle cx="55" cy="77" r="3.6" fill="#ffe266" stroke="none"/>'}
    <rect x="22" y="58" width="14" height="14" fill="#bfe6ff"/><rect x="66" y="58" width="12" height="14" fill="#bfe6ff"/>`) };

// ---- 추가 그림 12종 ----
ODD2.fox = { ko: '여우', lv2: ['ear'], lv3: ['tip'],
  draw: d => _s(`
    <path d="M62 76Q96 74 92 44Q86 62 66 62z" fill="#f08a3c"/><path d="M92 44Q90 56 82 62Q92 66 94 50z" fill="${d === 'tip' ? '#f08a3c' : '#fff'}" stroke-width="2"/>
    <ellipse cx="46" cy="78" rx="24" ry="16" fill="#f08a3c"/><ellipse cx="46" cy="82" rx="12" ry="9" fill="#fff" stroke="none"/>
    <path d="M22 36L24 10L42 26z" fill="#f08a3c"/>${d === 'ear' ? '' : '<path d="M70 36L68 10L50 26z" fill="#f08a3c"/>'}
    <path d="M26 30L26 18L35 26z" fill="#5b4033" stroke="none"/>${d === 'ear' ? '' : '<path d="M66 30L66 18L57 26z" fill="#5b4033" stroke="none"/>'}
    <path d="M18 44Q46 18 74 44Q70 66 46 68Q22 66 18 44z" fill="#f08a3c"/><path d="M18 46Q30 62 46 62Q62 62 74 46Q62 54 46 54Q30 54 18 46z" fill="#fff" stroke="none"/>
    <circle cx="35" cy="44" r="3" fill="#222" stroke="none"/><circle cx="57" cy="44" r="3" fill="#222" stroke="none"/><ellipse cx="46" cy="56" rx="4" ry="3" fill="#222"/>`) };
ODD2.chicken = { ko: '닭', lv2: ['comb'], lv3: ['dot'],
  draw: d => _s(`
    <path d="M40 86v8M60 86v8M34 95h12M54 95h12" stroke="#ff9d3d" stroke-width="4" fill="none"/>
    <ellipse cx="50" cy="62" rx="32" ry="28" fill="#fff"/>
    <path d="M30 60q20-10 32 6q-12 18-32-6z" fill="#ffe9c4"/>${d === 'dot' ? '' : '<circle cx="46" cy="64" r="3.8" fill="#ff9d3d" stroke="none"/>'}
    ${d === 'comb' ? '' : '<path d="M36 26Q38 10 46 18Q50 6 56 18Q64 10 64 26z" fill="#ef5b5b"/>'}
    <circle cx="50" cy="32" r="16" fill="#fff"/><circle cx="43" cy="30" r="3" fill="#222" stroke="none"/><circle cx="57" cy="30" r="3" fill="#222" stroke="none"/>
    <path d="M45 36h10l-5 7z" fill="#ff9d3d"/><path d="M48 44q2 8 4 0" fill="#ef5b5b" stroke-width="2"/>`) };
ODD2.frog = { ko: '개구리', lv2: ['eye'], lv3: ['cheek'],
  draw: d => _s(`
    <circle cx="30" cy="30" r="13" fill="#7ecb5a"/>${d === 'eye' ? '' : '<circle cx="70" cy="30" r="13" fill="#7ecb5a"/>'}
    <circle cx="30" cy="30" r="7" fill="#fff"/><circle cx="30" cy="30" r="3" fill="#222" stroke="none"/>${d === 'eye' ? '' : '<circle cx="70" cy="30" r="7" fill="#fff"/><circle cx="70" cy="30" r="3" fill="#222" stroke="none"/>'}
    <ellipse cx="50" cy="56" rx="38" ry="30" fill="#7ecb5a"/>
    <path d="M24 60Q50 82 76 60" fill="none"/>
    <circle cx="22" cy="58" r="5" fill="#ff9fae" stroke="none"/>${d === 'cheek' ? '' : '<circle cx="78" cy="58" r="5" fill="#ff9fae" stroke="none"/>'}
    <circle cx="45" cy="48" r="1.6" fill="#3f7a2e" stroke="none"/><circle cx="55" cy="48" r="1.6" fill="#3f7a2e" stroke="none"/>`) };
ODD2.koala = { ko: '코알라', lv2: ['ear'], lv3: ['nose'],
  draw: d => _s(`
    <circle cx="20" cy="38" r="17" fill="#b8bcc6"/>${d === 'ear' ? '' : '<circle cx="80" cy="38" r="17" fill="#b8bcc6"/>'}
    <circle cx="20" cy="38" r="9" fill="#f1dfe3" stroke="none"/>${d === 'ear' ? '' : '<circle cx="80" cy="38" r="9" fill="#f1dfe3" stroke="none"/>'}
    <ellipse cx="50" cy="56" rx="32" ry="30" fill="#b8bcc6"/>
    <circle cx="38" cy="50" r="3.4" fill="#222" stroke="none"/><circle cx="62" cy="50" r="3.4" fill="#222" stroke="none"/>
    <ellipse cx="50" cy="60" rx="9" ry="12" fill="${d === 'nose' ? '#8a5a45' : '#3b3b3b'}"/><path d="M50 72q-6 5-10 2M50 72q6 5 10 2" fill="none"/>`) };
ODD2.sheep = { ko: '양', lv2: ['leg'], lv3: ['ear'],
  draw: d => _s(`
    ${[[26,58],[40,46],[58,46],[74,58],[30,74],[50,78],[70,74],[50,58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#fff"/>`).join('')}
    <path d="M34 84v11M50 86v9" stroke-width="6" fill="none"/>${d === 'leg' ? '' : '<path d="M66 84v11" stroke-width="6" fill="none"/>'}
    <ellipse cx="26" cy="28" rx="9" ry="5" transform="rotate(-24 26 28)" fill="#4a4048"/><ellipse cx="74" cy="28" rx="9" ry="5" transform="rotate(24 74 28)" fill="${d === 'ear' ? '#ffb3c6' : '#4a4048'}"/>
    <ellipse cx="50" cy="38" rx="17" ry="19" fill="#4a4048"/><circle cx="43" cy="36" r="2.6" fill="#fff" stroke="none"/><circle cx="57" cy="36" r="2.6" fill="#fff" stroke="none"/>
    <ellipse cx="50" cy="46" rx="5" ry="3.4" fill="#ffb3c6" stroke="none"/>`) };
ODD2.horse = { ko: '말', lv2: ['mane'], lv3: ['nostril'],
  draw: d => _s(`
    <path d="M30 28L26 8L42 22zM70 28L74 8L58 22z" fill="#b9814f"/>
    ${d === 'mane' ? '' : '<path d="M42 14Q50 2 58 14Q56 28 50 34Q44 28 42 14z" fill="#5b3a29"/>'}
    <path d="M30 24Q50 14 70 24Q74 54 66 78Q50 96 34 78Q26 54 30 24z" fill="#b9814f"/>
    <ellipse cx="50" cy="76" rx="15" ry="13" fill="#d9a66b"/>
    <circle cx="38" cy="44" r="3.4" fill="#222" stroke="none"/><circle cx="62" cy="44" r="3.4" fill="#222" stroke="none"/>
    <ellipse cx="44" cy="76" rx="2.4" ry="3.6" fill="#5b3a29" stroke="none"/>${d === 'nostril' ? '' : '<ellipse cx="56" cy="76" rx="2.4" ry="3.6" fill="#5b3a29" stroke="none"/>'}`) };
ODD2.giraffe = { ko: '기린', lv2: ['horn'], lv3: ['spot'],
  draw: d => _s(`
    <path d="M38 22V8${d === 'horn' ? '' : 'M62 22V8'}" stroke-width="4" fill="none"/><circle cx="38" cy="8" r="4.4" fill="#8a5a35"/>${d === 'horn' ? '' : '<circle cx="62" cy="8" r="4.4" fill="#8a5a35"/>'}${d === 'horn' ? '<path d="M62 22V12" stroke-width="0" fill="none"/>' : ''}
    <ellipse cx="22" cy="34" rx="9" ry="5" transform="rotate(-24 22 34)" fill="#f6c44f"/><ellipse cx="78" cy="34" rx="9" ry="5" transform="rotate(24 78 34)" fill="#f6c44f"/>
    <ellipse cx="50" cy="46" rx="26" ry="28" fill="#f6c44f"/><ellipse cx="50" cy="64" rx="15" ry="11" fill="#ffe3a0" stroke="none"/>
    <circle cx="40" cy="42" r="3.4" fill="#222" stroke="none"/><circle cx="60" cy="42" r="3.4" fill="#222" stroke="none"/>
    <ellipse cx="44" cy="64" rx="2" ry="3" fill="#8a5a35" stroke="none"/><ellipse cx="56" cy="64" rx="2" ry="3" fill="#8a5a35" stroke="none"/>
    <circle cx="36" cy="26" r="4" fill="#c98a3a" stroke="none"/><circle cx="62" cy="30" r="4.6" fill="#c98a3a" stroke="none"/>${d === 'spot' ? '' : '<circle cx="50" cy="22" r="3.4" fill="#c98a3a" stroke="none"/>'}<circle cx="70" cy="52" r="3.4" fill="#c98a3a" stroke="none"/>`) };
ODD2.dino = { ko: '공룡', lv2: ['spike'], lv3: ['eye'],
  draw: d => _s(`
    <path d="M8 70Q30 74 38 58L52 62Q40 84 6 80z" fill="#7ecb6a"/>
    <path d="M30 84v10M62 84v10" stroke-width="7" fill="none" stroke="#5aa94b"/>
    <ellipse cx="46" cy="64" rx="30" ry="22" fill="#7ecb6a"/>
    ${[[30,44],[42,38],[54,38],[66,44]].map(([x, y], i) => (d === 'spike' && i === 1) ? '' : `<path d="M${x - 6} ${y + 4}L${x} ${y - 10}L${x + 6} ${y + 4}z" fill="#ffb347"/>`).join('')}
    <path d="M64 56Q64 34 80 32Q94 32 94 46Q94 58 80 58z" fill="#7ecb6a"/>
    ${d === 'eye' ? '' : '<circle cx="82" cy="42" r="3" fill="#222" stroke="none"/>'}<path d="M80 52q6 3 12 0" fill="none"/>
    <ellipse cx="46" cy="70" rx="15" ry="11" fill="#d6f2c2" stroke="none"/>`) };
ODD2.rocket = { ko: '로켓', lv2: ['flame'], lv3: ['window'],
  draw: d => _s(`
    ${d === 'flame' ? '' : '<path d="M42 78Q50 100 58 78z" fill="#ffb02e"/><path d="M46 78Q50 92 54 78z" fill="#ffe27a" stroke="none"/>'}
    <path d="M32 54L16 76L36 72zM68 54L84 76L64 72z" fill="#ef5b5b"/>
    <path d="M50 6Q74 24 68 62L68 78H32L32 62Q26 24 50 6z" fill="#fff"/><path d="M50 6Q58 12 62 22H38Q42 12 50 6z" fill="#ef5b5b"/>
    <circle cx="50" cy="42" r="9" fill="#7cc0ff"/><circle cx="50" cy="42" r="3" fill="#e6f4ff" stroke="none"/>
    <circle cx="42" cy="66" r="3.6" fill="#7cc0ff" stroke-width="2"/>${d === 'window' ? '' : '<circle cx="58" cy="66" r="3.6" fill="#7cc0ff" stroke-width="2"/>'}`) };
ODD2.ship = { ko: '배', lv2: ['flag'], lv3: ['window'],
  draw: d => _s(`
    ${d === 'flag' ? '' : '<path d="M50 8V32M50 8L68 14L50 20" fill="#ef5b5b"/>'}
    <path d="M50 30V32" fill="none"/>
    <rect x="30" y="32" width="40" height="24" rx="3" fill="#fff"/><rect x="38" y="40" width="8" height="8" fill="#7cc0ff" stroke-width="2"/>${d === 'window' ? '' : '<rect x="54" y="40" width="8" height="8" fill="#7cc0ff" stroke-width="2"/>'}
    <path d="M10 58H90L78 82H22z" fill="#4a90e2"/><path d="M14 62H86" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M6 90q8-8 16 0t16 0t16 0t16 0t16 0" fill="none" stroke="#7cc0ff" stroke-width="3"/>`) };
ODD2.icecream = { ko: '아이스크림', lv2: ['cherry'], lv3: ['line'],
  draw: d => _s(`
    <path d="M32 54L50 94L68 54z" fill="#f2c27a"/>
    <path d="M38 60L58 76M62 60L42 76M36 52L46 74" fill="none" stroke="#c9904a" stroke-width="2"/>${d === 'line' ? '' : '<path d="M66 52L52 80" fill="none" stroke="#c9904a" stroke-width="3.2"/>'}
    <circle cx="50" cy="42" r="20" fill="#ffb3c6"/><circle cx="50" cy="40" r="16" fill="none" stroke="none"/>
    <path d="M30 50q4 8 10 2q4 8 10 0q4 8 10 0q4 8 10-2" fill="#fff"/>
    ${d === 'cherry' ? '' : '<circle cx="50" cy="20" r="7" fill="#ef3b4d"/><path d="M50 14Q54 6 58 6" fill="none" stroke="#4f9a45"/>'}`) };
ODD2.umbrella = { ko: '우산', lv2: ['handle'], lv3: ['stripe'],
  draw: d => _s(`
    ${d === 'handle' ? '<path d="M50 42V80" stroke-width="3.4" fill="none"/>' : '<path d="M50 42V80Q50 92 40 90Q34 88 36 82" stroke-width="3.4" fill="none"/>'}
    <path d="M8 52Q10 14 50 12Q90 14 92 52Q82 44 71 52Q60 44 50 52Q40 44 29 52Q18 44 8 52z" fill="#ff6b81"/>
    <path d="M50 12Q40 30 40 50M50 12Q60 30 60 50" fill="none" stroke-width="2"/>
    <path d="M50 12Q36 28 29 52Q40 44 50 52Q42 32 50 12z" fill="#ffd84a" stroke="none"/>
    <path d="M50 12Q64 28 71 52Q60 44 50 52Q58 32 50 12z" fill="${d === 'stripe' ? '#ff6b81' : '#ffd84a'}" stroke="none"/>
    <path d="M8 52Q10 14 50 12Q90 14 92 52Q82 44 71 52Q60 44 50 52Q40 44 29 52Q18 44 8 52z" fill="none"/>`) };
