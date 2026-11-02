import { TABLES } from '../data/tables.data.js';
import { ST } from '../state/app-state.js';
import { tableAllowed, isTableBlocked, getTableStatus } from '../rules/access-rules.js';

export function svgFill(eff, t){
    if(eff === 'blocked')   return '#0f0c1a';
    if(eff === 'available') return t === 'vip' ? '#5b21b6' : '#9d174d';
    if(eff === 'confirmed') return '#065f46';
    if(eff === 'nollegó')   return '#7f1d1d';
    return '#1e1b2e';
}
export function svgStroke(eff, t){
    if(eff === 'blocked')   return '#1a1530';
    if(eff === 'available') return t === 'vip' ? '#a78bfa' : '#f472b6';
    if(eff === 'confirmed') return '#34d399';
    if(eff === 'nollegó')   return '#f87171';
    return '#3f3660';
}
export function svgText(eff){
    if(eff === 'available') return '#e9e1ff';
    if(eff === 'blocked')   return '#2e2850';
    return '#6b63a0';
}

export function buildSVG(date){
    const d = date || ST.today();
    let s = `<defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#0d0a1e"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#110d20" stroke-width=".5"/>
    </pattern>
  </defs>
  <rect width="960" height="590" fill="url(#bg)"/>
  <rect width="960" height="590" fill="url(#grid)" opacity=".5"/>
  <rect x="440" y="6" width="150" height="40" rx="6" fill="#13102a" stroke="#1e1a40" stroke-width="1"/>
  <text x="515" y="31" text-anchor="middle" fill="#7c6fc4" font-size="12" font-family="Rajdhani,sans-serif" font-weight="600" letter-spacing="2">DJ</text>
  <rect x="428" y="128" width="178" height="52" rx="6" fill="#13102a" stroke="#1e1a40" stroke-width="1"/>
  <text x="517" y="159" text-anchor="middle" fill="#7c6fc4" font-size="12" font-family="Rajdhani,sans-serif" font-weight="600" letter-spacing="3">TARIMA</text>
  <rect x="828" y="195" width="68" height="65" rx="4" fill="#0e0c1a" stroke="#1a1730" stroke-width="1"/>
  <text x="862" y="234" text-anchor="middle" fill="#2e2a55" font-size="8" font-family="sans-serif">Escalera</text>
  <rect x="828" y="264" width="68" height="178" rx="6" fill="#13102a" stroke="#1e1a40" stroke-width="1"/>
  <text x="862" y="360" text-anchor="middle" fill="#7c6fc4" font-size="11" font-family="Rajdhani,sans-serif" font-weight="600" letter-spacing="3" transform="rotate(-90,862,360)">BARRA</text>`;

    TABLES.forEach(tb => {
        const dayAllowed = tableAllowed(tb.id, d);
        const adminBlocked = isTableBlocked(tb.id, d);
        const { status, rsv } = getTableStatus(tb.id, d);
        const eff = (!dayAllowed || adminBlocked) ? 'blocked' : status;
        const fill = svgFill(eff, tb.t);
        const stroke = svgStroke(eff, tb.t);
        const tc = svgText(eff);
        const op = eff === 'blocked' ? '0.4' : '1';
        const isBday = rsv && rsv.promo === 'cumpleanos';

        if(tb.t === 'vip'){
            const cx = tb.x + tb.w/2, cy = tb.y + tb.h/2;
            s += `<g class="te${adminBlocked?' te-locked':''}" data-id="${tb.id}" opacity="${op}">
        <rect x="${tb.x}" y="${tb.y}" width="${tb.w}" height="${tb.h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${cx}" y="${tb.lbl?cy-1:cy+4}" text-anchor="middle" fill="${tc}" font-size="9" font-family="Rajdhani,sans-serif" font-weight="600" pointer-events="none">${tb.id}</text>
        ${tb.lbl?`<text x="${cx}" y="${cy+8}" text-anchor="middle" fill="${tc}" font-size="6.5" font-family="sans-serif" pointer-events="none">${tb.lbl}</text>`:''}
        ${isBday?`<text x="${tb.x+tb.w-6}" y="${tb.y-3}" font-size="12" pointer-events="none">🎉</text>`:''}
        ${adminBlocked?`<text x="${tb.x+4}" y="${tb.y-3}" font-size="11" pointer-events="none">🔒</text>`:''}
      </g>`;
        } else {
            s += `<g class="te${adminBlocked?' te-locked':''}" data-id="${tb.id}" opacity="${op}">
        <circle cx="${tb.cx}" cy="${tb.cy}" r="${tb.r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${tb.cx}" y="${tb.cy+4}" text-anchor="middle" fill="${tc}" font-size="${tb.id.length>2?'8':'10'}" font-family="Rajdhani,sans-serif" font-weight="600" pointer-events="none">${tb.id}</text>
        ${isBday?`<text x="${tb.cx+tb.r-4}" y="${tb.cy-tb.r+4}" font-size="12" pointer-events="none">🎉</text>`:''}
        ${adminBlocked?`<text x="${tb.cx-tb.r+2}" y="${tb.cy-tb.r+6}" font-size="11" pointer-events="none">🔒</text>`:''}
      </g>`;
        }
    });
    return s;
}
