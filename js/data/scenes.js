/* Vẽ sa hình ngã tư bằng SVG.
 * spec: { vehicles: [{ id:'A', from:'S'|'N'|'E'|'W', move:'straight'|'left'|'right', kind:'car'|'truck'|'fire'|'ambulance'|'police' }] } */
(function () {
  const ROT = { S: 0, W: 90, N: 180, E: 270 };
  const KIND = {
    car: { fill: '#1e88e5', w: 22, h: 34 },
    truck: { fill: '#8d6e63', w: 24, h: 44 },
    fire: { fill: '#e53935', w: 24, h: 42 },
    ambulance: { fill: '#ffffff', w: 22, h: 38 },
    police: { fill: '#3949ab', w: 22, h: 36 },
  };
  const PATH = {
    straight: 'M165 218 L165 64',
    right: 'M165 218 L165 188 Q165 166 188 166 L246 166',
    left: 'M165 218 L165 172 Q165 136 130 136 L56 136',
  };

  function vehicle(v, i) {
    const k = KIND[v.kind] || KIND.car;
    const a = ROT[v.from] || 0;
    const cy = 220 + k.h / 2 + 4;
    const label = v.id;
    const tColor = v.kind === 'ambulance' ? '#c62828' : '#fff';
    const extra =
      v.kind === 'ambulance'
        ? `<rect x="161" y="${cy + 4}" width="8" height="2.5" fill="#c62828"/><rect x="163.75" y="${cy + 1.25}" width="2.5" height="8" fill="#c62828"/>`
        : v.kind === 'fire' || v.kind === 'police'
        ? `<rect x="158" y="${cy - k.h / 2 + 4}" width="14" height="4" rx="2" fill="${v.kind === 'fire' ? '#ffeb3b' : '#ff5252'}"/>`
        : '';
    return `<g transform="rotate(${a} 150 150)">
      <path d="${PATH[v.move] || PATH.straight}" fill="none" stroke="#ffb300" stroke-width="3.5" stroke-dasharray="7 5" marker-end="url(#ah${i})"/>
      <rect x="${165 - k.w / 2}" y="${cy - k.h / 2}" width="${k.w}" height="${k.h}" rx="5" fill="${k.fill}" stroke="#263238" stroke-width="1.5"/>
      <rect x="${165 - k.w / 2 + 3}" y="${cy - k.h / 2 + 3}" width="${k.w - 6}" height="7" rx="2" fill="#cfd8dc" opacity=".9"/>
      ${extra}
      <text x="165" y="${cy + 5}" transform="rotate(${-a} 165 ${cy})" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="15" fill="${tColor}" stroke="${v.kind === 'ambulance' ? 'none' : '#0006'}" stroke-width=".6">${label}</text>
    </g>`;
  }

  window.renderScene = function (spec) {
    const vs = spec.vehicles || [];
    const markers = vs
      .map((_, i) => `<marker id="ah${i}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#ffb300"/></marker>`)
      .join('');
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sa hình ngã tư">
      <defs>${markers}</defs>
      <rect width="300" height="300" fill="#7cb342"/>
      <rect x="0" y="120" width="300" height="60" fill="#546e7a"/>
      <rect x="120" y="0" width="60" height="300" fill="#546e7a"/>
      <g stroke="#fff" stroke-width="2" stroke-dasharray="10 8">
        <line x1="0" y1="150" x2="118" y2="150"/><line x1="182" y1="150" x2="300" y2="150"/>
        <line x1="150" y1="0" x2="150" y2="118"/><line x1="150" y1="182" x2="150" y2="300"/>
      </g>
      <g fill="#fff" opacity=".85">
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${123 + i * 12}" y="186" width="6" height="12"/><rect x="${123 + i * 12}" y="102" width="6" height="12"/><rect x="186" y="${123 + i * 12}" width="12" height="6"/><rect x="102" y="${123 + i * 12}" width="12" height="6"/>`).join('')}
      </g>
      ${vs.map(vehicle).join('')}
    </svg>`;
  };
})();
