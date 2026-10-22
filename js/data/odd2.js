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
