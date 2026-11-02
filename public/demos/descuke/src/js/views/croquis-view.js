import { ST } from '../state/app-state.js';
import { buildSVG } from '../croquis/svg-renderer.js';
import { attachSVG } from '../croquis/svg-controller.js';

export function renderCroquis(m){
    const today = ST.today();
    m.innerHTML = `
<div class="croquis-wrap">
  <div class="croquis-head">
    <h2>Mapa de Mesas</h2>
    <input type="date" id="croquis-date" value="${today}" onchange="redrawSVG()">
  </div>
  <div class="legend">
    <span class="leg"><span class="leg-sq" style="background:var(--purple-deep)"></span>VIP disponible</span>
    <span class="leg"><span class="leg-dot" style="background:var(--pink-dim)"></span>Periquera disponible</span>
    <span class="leg"><span class="leg-sq" style="background:var(--surface3)"></span>Reservada</span>
    <span class="leg"><span class="leg-sq" style="background:var(--green-dim)"></span>Confirmada</span>
    <span class="leg"><span class="leg-sq" style="background:var(--red-dim)"></span>No llegó</span>
    <span class="leg"><span class="leg-sq" style="background:#0f0c1a;opacity:.4"></span>Bloqueada 🔒</span>
    <span class="leg">🎉 Cumpleaños</span>
  </div>
  <div class="svg-scroll">
    <svg id="floor-svg" viewBox="0 0 960 590" width="100%" xmlns="http://www.w3.org/2000/svg">
      ${buildSVG(today)}
    </svg>
  </div>
</div>`;
    attachSVG();
}
