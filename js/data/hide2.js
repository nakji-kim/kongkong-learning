// 숨은 그림 찾기 (보통/어려움): 배경 그림에 자연스럽게 숨은 그림을 찾아 아래 윤곽선 목록과 맞춰 봅니다.
// 같은 도형(HS_SHAPES)으로 장면 속 그림과 목록의 윤곽선을 함께 그려서 모양이 똑같습니다.
const HS_SHAPES = {
  banana:   { d: 'M14 72Q8 36 42 22Q70 10 90 22Q94 27 86 28Q58 30 44 48Q36 68 22 78Q14 80 14 72z', det: '<path d="M88 22L92 14" fill="none"/>' },
  star:     { d: 'M50 6L61 38L95 38L67 58L78 92L50 72L22 92L33 58L5 38L39 38z', det: '' },
  fish:     { d: 'M8 50Q36 16 68 50Q36 84 8 50zM66 50L94 30V70z', det: '<circle cx="24" cy="46" r="3.4" class="dot"/><path d="M40 36Q46 50 40 64" fill="none"/>' },
  snail:    { d: 'M6 84Q4 66 22 66H84Q96 66 92 80Q90 86 80 86H14Q6 86 6 84zM48 12A30 30 0 1 1 47.9 12z', det: '<circle cx="48" cy="42" r="15" fill="none"/><circle cx="48" cy="42" r="5" fill="none"/><path d="M22 66Q18 48 14 40M32 66Q32 50 34 42" fill="none"/>' },
  butterfly:{ d: 'M50 50Q16 6 8 36Q6 52 50 54zM50 50Q84 6 92 36Q94 52 50 54zM50 56Q14 62 24 88Q40 96 50 60zM50 56Q86 62 76 88Q60 96 50 60z', det: '<ellipse cx="50" cy="56" rx="4" ry="22" class="dot"/><path d="M46 32Q40 16 34 12M54 32Q60 16 66 12" fill="none"/>' },
  apple:    { d: 'M50 28Q30 14 18 36Q6 62 24 82Q38 96 50 88Q62 96 76 82Q94 62 82 36Q70 14 50 28z', det: '<path d="M50 28Q50 16 58 8" fill="none"/><path d="M58 16Q70 8 78 14Q68 22 58 16z"/>' },
  bird:     { d: 'M14 50Q14 28 40 28Q64 28 68 46L92 36L80 56Q70 78 42 78Q14 78 14 50zM14 44L2 50L14 56z', det: '<circle cx="34" cy="42" r="3.4" class="dot"/><path d="M40 56Q56 50 64 60" fill="none"/>' },
  umbrella: { d: 'M6 54Q10 14 50 12Q90 14 94 54Q82 46 72 54Q61 46 50 54Q39 46 28 54Q17 46 6 54z', det: '<path d="M50 54V84Q50 94 40 92Q34 90 34 84" fill="none"/><path d="M50 12Q38 30 40 52M50 12Q62 30 60 52" fill="none"/>' },
  key:      { d: 'M28 32A18 18 0 1 0 28.1 32zM28 42A8 8 0 1 1 27.9 42zM44 46H92V56H82V66H74V56H62V64H54V56H44z', det: '' },
  heart:    { d: 'M50 88Q8 56 12 32Q16 10 36 12Q46 14 50 26Q54 14 64 12Q84 10 88 32Q92 56 50 88z', det: '' },
  mushroom: { d: 'M8 54Q10 12 50 10Q90 12 92 54zM38 54H62V86Q62 92 56 92H44Q38 92 38 86z', det: '<circle cx="30" cy="34" r="5" fill="none"/><circle cx="62" cy="28" r="6" fill="none"/><circle cx="74" cy="44" r="4" fill="none"/>' },
  duck:     { d: 'M8 62Q8 86 44 86Q82 86 86 58Q86 52 78 54Q62 56 58 44Q66 40 66 28Q66 10 46 10Q28 10 28 28Q28 40 38 46Q8 46 8 62zM64 26L88 30L64 36z', det: '<circle cx="42" cy="26" r="3" class="dot"/><path d="M30 66Q48 60 62 70" fill="none"/>' },
};
function hsShape(k, fill, stroke, sw, dot) {
  const s = HS_SHAPES[k];
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"><path d="${s.d}" fill-rule="evenodd"/>${s.det.replace(/class="dot"/g, `fill="${dot || stroke}" stroke="none"`)}</g>`;
}
const _cloud = (x, y, s = 1) => `<g fill="#fff" opacity=".95" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="34" ry="12"/><ellipse cx="18" cy="-8" rx="22" ry="12"/></g>`;
const HS_SCENES = [
  { id: 'house', title: '마당 있는 집',
    bg: `<defs><linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8ff"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#sk1)"/><circle cx="340" cy="46" r="24" fill="#ffe27a"/>${_cloud(80, 50)}${_cloud(250, 34, .9)}
<path d="M0 170Q100 120 200 160Q300 120 400 160V300H0z" fill="#9bd77a"/><path d="M0 200Q120 170 240 200T400 190V300H0z" fill="#7fc965"/>
<ellipse cx="318" cy="246" rx="62" ry="28" fill="#6fbfee" stroke="#4a9ccf" stroke-width="3"/><path d="M280 244q8-4 16 0M330 256q8-4 16 0M310 236q6-3 12 0" fill="none" stroke="#bfe6fb" stroke-width="2.4"/>
<path d="M150 300Q170 250 200 224H238Q226 256 244 300z" fill="#d9b98a"/><path d="M168 280q10-4 20 0M196 252q10-4 20 0" fill="none" stroke="#c19d6b" stroke-width="2"/>
<rect x="52" y="140" width="22" height="100" rx="8" fill="#9a6b3f"/><path d="M60 170Q40 160 30 164M66 190Q86 180 96 184" fill="none" stroke="#7d5330" stroke-width="5" stroke-linecap="round"/>
<g fill="#5fb85a"><circle cx="40" cy="108" r="38"/><circle cx="78" cy="96" r="42"/><circle cx="104" cy="128" r="30"/><circle cx="34" cy="142" r="26"/></g><g fill="#4ea34c" opacity=".7"><circle cx="58" cy="90" r="16"/><circle cx="92" cy="116" r="14"/><circle cx="36" cy="128" r="12"/></g>
<rect x="150" y="112" width="130" height="104" fill="#f6e2b8" stroke="#8a6a44" stroke-width="3"/><path d="M136 116L215 56L294 116z" fill="#d95f55" stroke="#8a3d37" stroke-width="3"/><g stroke="#bd4a41" stroke-width="2" fill="none"><path d="M158 106h114M170 94h90M184 82h62M150 118h130"/></g>
<rect x="250" y="64" width="16" height="30" fill="#b86b45" stroke="#7d4a2e" stroke-width="2.4"/><rect x="196" y="156" width="38" height="60" rx="18" fill="#6aa86a" stroke="#3f7a3f" stroke-width="3"/><circle cx="226" cy="190" r="3" fill="#ffe27a"/>
<rect x="162" y="136" width="28" height="28" fill="#bfe6ff" stroke="#8a6a44" stroke-width="3"/><path d="M176 136v28M162 150h28" stroke="#8a6a44" stroke-width="2.4"/><rect x="246" y="136" width="28" height="28" fill="#bfe6ff" stroke="#8a6a44" stroke-width="3"/><path d="M260 136v28M246 150h28" stroke="#8a6a44" stroke-width="2.4"/>
<g fill="#fff" stroke="#b9a07a" stroke-width="2">${[270, 288, 306, 324, 342, 360, 378].map(x => `<rect x="${x}" y="196" width="10" height="34" rx="3"/>`).join('')}</g>
${[[30, 262, '#ff8fb6'], [56, 272, '#ffb3cf'], [84, 258, '#ff8fb6'], [112, 270, '#ffd0e0'], [130, 254, '#ff8fb6'], [18, 284, '#ffd0e0'], [100, 288, '#ff8fb6']].map(([x, y, c]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 16}" stroke="#4a9a45" stroke-width="3"/><circle cx="${x}" cy="${y}" r="8" fill="${c}"/><circle cx="${x}" cy="${y}" r="3" fill="#ffe27a"/>`).join('')}`,
    items: [['banana', 92, 100, 46, -28, '#a9d36e', '#6fa84e'], ['star', 226, 92, 26, 12, '#cf5047', '#a63f38'], ['fish', 308, 250, 38, 8, '#58a9dc', '#3f8bbd'], ['snail', 64, 208, 30, 0, '#a97a4c', '#7d5330'], ['butterfly', 70, 276, 30, -10, '#ff9bc0', '#e0709b']] },
  { id: 'sea', title: '바닷가',
    bg: `<defs><linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#dff4ff"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#sk2)"/><circle cx="60" cy="48" r="22" fill="#ffe27a"/>${_cloud(190, 52, 1.1)}${_cloud(320, 36)}
<rect y="116" width="400" height="96" fill="#4ba8e6"/><g fill="none" stroke="#9fd4f5" stroke-width="2.4">${[[40, 140], [140, 160], [250, 136], [330, 168], [90, 188], [230, 192]].map(([x, y]) => `<path d="M${x} ${y}q8-6 16 0t16 0"/>`).join('')}</g>
<path d="M0 214Q100 196 200 210T400 204V300H0z" fill="#f2dca0"/><path d="M0 250Q120 236 260 252T400 246V300H0z" fill="#ead08a"/>
<path d="M232 120L232 70L284 120z" fill="#fff" stroke="#9aa7b5" stroke-width="2.4"/><path d="M226 120L226 80L196 120z" fill="#ffd9d6" stroke="#9aa7b5" stroke-width="2.4"/><path d="M190 122H290L276 140H204z" fill="#b8754a" stroke="#7d4a2e" stroke-width="2.4"/><path d="M229 70V122" stroke="#7d4a2e" stroke-width="3"/>
<rect x="318" y="150" width="14" height="70" rx="5" fill="#9a6b3f" transform="rotate(8 325 220)"/><g fill="#5fb85a" stroke="#4a9a45" stroke-width="2"><path d="M328 150Q300 130 270 150Q300 146 322 158z"/><path d="M328 150Q356 128 388 148Q356 146 334 158z"/><path d="M328 150Q316 118 296 108Q322 122 328 150z"/><path d="M328 150Q344 116 366 110Q340 124 328 150z"/></g>
<g fill="#8a8f99" stroke="#6b707a" stroke-width="2.4"><path d="M28 246Q30 220 62 220Q94 222 98 246z"/><path d="M84 250Q90 232 112 232Q132 236 134 250z"/></g>
<path d="M150 270q30-12 60 0" fill="none" stroke="#d9bd78" stroke-width="3"/><circle cx="180" cy="284" r="3" fill="#d9bd78"/><circle cx="206" cy="278" r="2.4" fill="#d9bd78"/>`,
    items: [['star', 160, 258, 34, 14, '#e6c47c', '#c9a25b'], ['bird', 196, 52, 36, -6, '#f6fbff', '#cfe3f3'], ['fish', 120, 176, 40, 4, '#3f9ad8', '#2f85c2'], ['umbrella', 326, 126, 44, -12, '#6fbf5a', '#4a9a45'], ['snail', 66, 226, 30, 0, '#8e929b', '#6b707a']] },
  { id: 'forest', title: '숲속',
    bg: `<defs><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfeeff"/><stop offset="1" stop-color="#eaf9e6"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#sk3)"/>${_cloud(300, 40)}
<path d="M0 150Q100 110 200 150T400 140V300H0z" fill="#a8d98a"/><path d="M0 190Q150 160 260 190T400 180V300H0z" fill="#8fcb70"/>
<path d="M120 300Q150 250 230 236Q300 224 400 232V268Q300 258 240 270Q200 280 190 300z" fill="#6fbfee"/>
<g><rect x="24" y="100" width="26" height="140" rx="8" fill="#8c5e3a"/><circle cx="36" cy="84" r="46" fill="#5fb85a"/><circle cx="8" cy="112" r="30" fill="#4ea34c"/><circle cx="66" cy="110" r="30" fill="#4ea34c"/></g>
<g><rect x="330" y="90" width="28" height="150" rx="8" fill="#8c5e3a"/><circle cx="344" cy="72" r="48" fill="#5fb85a"/><circle cx="312" cy="106" r="30" fill="#4ea34c"/><circle cx="378" cy="106" r="30" fill="#4ea34c"/></g>
<g><rect x="150" y="120" width="18" height="100" rx="6" fill="#9a6b3f"/><circle cx="159" cy="108" r="34" fill="#6fc064"/><circle cx="138" cy="124" r="22" fill="#5fb85a"/></g>
<g fill="#7fc65a"><ellipse cx="90" cy="236" rx="40" ry="14"/><ellipse cx="280" cy="214" rx="46" ry="14"/></g>
<rect x="206" y="196" width="40" height="22" rx="10" fill="#8c5e3a"/><ellipse cx="226" cy="196" rx="20" ry="7" fill="#b98a5c"/>
${[[110, 270, '#ff5b6b'], [330, 262, '#ffd84a'], [60, 280, '#ffffff']].map(([x, y, c]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 14}" stroke="#4a9a45" stroke-width="3"/><circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x}" cy="${y}" r="2.6" fill="#ffe27a"/>`).join('')}
<g fill="#6fc064"><circle cx="266" cy="252" r="12"/><circle cx="280" cy="256" r="9"/></g>`,
    items: [['apple', 150, 96, 30, 0, '#8bc34a', '#5f9a35'], ['butterfly', 60, 130, 32, -8, '#f0a05a', '#c97a35'], ['duck', 300, 242, 36, 0, '#4a9ed6', '#2f85c2'], ['mushroom', 226, 190, 28, 0, '#a9784c', '#7d5330'], ['key', 86, 244, 36, -20, '#c9ae6a', '#a3883f']] },
  { id: 'class', title: '교실',
    bg: `<rect width="400" height="300" fill="#fff0c9"/><rect y="226" width="400" height="74" fill="#d9a56a"/><g stroke="#c28a50" stroke-width="2">${[0, 60, 120, 180, 240, 300, 360].map(x => `<path d="M${x} 226V300"/>`).join('')}</g>
<rect x="24" y="26" width="120" height="92" fill="#bfe6ff" stroke="#8a6a44" stroke-width="4"/><path d="M84 26V118M24 72H144" stroke="#8a6a44" stroke-width="3"/>
<path d="M14 18H64V128Q40 112 14 128z" fill="#f4a3b8"/><path d="M104 18H154V128Q130 112 104 128z" fill="#f4a3b8"/><g fill="#e8869f" opacity=".7"><circle cx="30" cy="50" r="5"/><circle cx="48" cy="82" r="5"/><circle cx="26" cy="100" r="5"/><circle cx="120" cy="46" r="5"/><circle cx="138" cy="84" r="5"/></g>
<rect x="176" y="30" width="196" height="102" rx="6" fill="#3f7a5a" stroke="#8a6a44" stroke-width="6"/><path d="M196 56q20-12 40 0M260 96h70M200 108h40" fill="none" stroke="#e8f3ea" stroke-width="3" opacity=".75"/><circle cx="318" cy="64" r="12" fill="none" stroke="#e8f3ea" stroke-width="2.6" opacity=".75"/>
<rect x="260" y="150" width="124" height="76" fill="#b5835a" stroke="#7d5330" stroke-width="3"/><g>${[[268, '#5b8def'], [286, '#ffd84a'], [304, '#ef5b5b'], [322, '#7fc65a'], [340, '#ffd84a'], [358, '#5b8def']].map(([x, c]) => `<rect x="${x}" y="158" width="16" height="64" fill="${c}" stroke="#7d5330" stroke-width="1.6"/>`).join('')}</g>
<rect x="30" y="196" width="160" height="14" rx="4" fill="#c4915e" stroke="#7d5330" stroke-width="3"/><rect x="42" y="210" width="10" height="44" fill="#a97a4c"/><rect x="168" y="210" width="10" height="44" fill="#a97a4c"/>
<rect x="76" y="238" width="30" height="20" rx="4" fill="#d9a56a" stroke="#7d5330" stroke-width="2"/><circle cx="210" cy="260" r="14" fill="#7cc0ff" stroke="#4a8fc2" stroke-width="3"/><path d="M196 260h28M210 246v28" stroke="#4a8fc2" stroke-width="1.6"/>`,
    items: [['heart', 124, 62, 30, 0, '#ea7f9a', '#d9627f'], ['key', 110, 202, 34, -6, '#b98a58', '#8e6538'], ['banana', 313, 192, 36, 90, '#f2cf4a', '#c9a626'], ['star', 244, 94, 28, 8, '#4c8a69', '#6aa683'], ['apple', 296, 180, 26, 0, '#e45a58', '#b83f3f']] },
  { id: 'park', title: '놀이공원',
    bg: `<defs><linearGradient id="sk5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8dcff"/><stop offset="1" stop-color="#f2fbff"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#sk5)"/>${_cloud(70, 44)}${_cloud(330, 60, .9)}
<path d="M0 200Q120 176 240 198T400 190V300H0z" fill="#9ad66f"/><path d="M0 250Q150 230 280 250T400 244V300H0z" fill="#86c960"/>
<g transform="translate(250 112)"><circle r="74" fill="none" stroke="#e8869f" stroke-width="6"/><circle r="52" fill="none" stroke="#e8869f" stroke-width="3"/><path d="M0-74V74M-74 0H74M-52-52L52 52M-52 52L52-52" stroke="#e8869f" stroke-width="3"/>${[[0, -74, '#ffd84a'], [74, 0, '#5b8def'], [0, 74, '#ef5b5b'], [-74, 0, '#7fc65a'], [52, -52, '#ffd84a'], [52, 52, '#5b8def'], [-52, 52, '#ef5b5b'], [-52, -52, '#7fc65a']].map(([x, y, c]) => `<rect x="${x - 9}" y="${y - 8}" width="18" height="16" rx="4" fill="${c}" stroke="#5b4033" stroke-width="2"/>`).join('')}</g><path d="M232 186L250 112L268 186" fill="none" stroke="#e8869f" stroke-width="5"/>
<g><path d="M30 210L70 150L110 210z" fill="#ef5b5b" stroke="#5b4033" stroke-width="2.4"/><path d="M70 150L54 210M70 150L86 210" stroke="#fff" stroke-width="5" opacity=".85"/><rect x="48" y="210" width="44" height="24" fill="#fff0c9" stroke="#5b4033" stroke-width="2.4"/><rect x="62" y="216" width="16" height="18" fill="#b8754a"/></g>
<g><rect x="316" y="180" width="64" height="48" fill="#fff0c9" stroke="#5b4033" stroke-width="2.4"/><path d="M308 182Q348 150 388 182z" fill="#5b8def" stroke="#5b4033" stroke-width="2.4"/><path d="M308 182q10 10 20 0t20 0t20 0t20 0" fill="#fff" stroke="#5b4033" stroke-width="2"/></g>
<g>${[[134, 170, '#ff6b81'], [152, 160, '#4aa3ff'], [170, 172, '#ffd84a'], [144, 184, '#6fcf6f']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="16" fill="${c}" stroke="#5b4033" stroke-width="2"/><path d="M${x} ${y + 16}Q${x - 4} ${y + 40} 150 236" fill="none" stroke="#5b4033" stroke-width="1.6"/>`).join('')}</g>
<ellipse cx="190" cy="268" rx="44" ry="16" fill="#6fbfee" stroke="#4a9ccf" stroke-width="3"/>`,
    items: [['umbrella', 154, 172, 36, 6, '#ff6b81', '#e0506a'], ['duck', 190, 268, 32, 0, '#fff7c9', '#e0cf86'], ['heart', 70, 190, 24, 0, '#d84b4b', '#b53a3a'], ['mushroom', 348, 168, 30, 0, '#4f7fdd', '#3a62b8'], ['key', 312, 112, 34, 30, '#e8b6c4', '#c98a9e']] },
];
