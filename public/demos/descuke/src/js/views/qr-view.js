import { TABLES } from '../data/tables.data.js';

// MODO DEMOSTRACIÓN: los QR apuntan a la página de mesa de esta misma demo
const BASE = new URL('mesa.html?t=', location.href).href;

export function renderQR(m) {
    m.innerHTML = `
<div class="dash">
  <div class="page-head no-print">
    <div class="page-head-left">
      <h2>QR por Mesa</h2>
      <p style="font-size:13px;color:var(--text2);margin:4px 0 0">
        Imprime y coloca cada QR en su mesa. El mesero lo escanea para abrir la cuenta.
      </p>
    </div>
    <button onclick="window.print()" style="padding:8px 20px;font-size:13px;font-weight:600;white-space:nowrap">
      Imprimir todos
    </button>
  </div>

  <div id="qr-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-top:20px">
    ${TABLES.map(t => `
    <div class="qr-card-print">
      <div id="qr-${t.id}" class="qr-code-wrap"></div>
      <div class="qr-mesa-label">Mesa ${t.id}</div>
      <div class="qr-mesa-url">${BASE}${t.id}</div>
    </div>`).join('')}
  </div>
</div>`;

    generateQRCodes();
}

function generateQRCodes() {
    if (typeof QRCode === 'undefined') {
        setTimeout(generateQRCodes, 300);
        return;
    }
    TABLES.forEach(t => {
        const el = document.getElementById(`qr-${t.id}`);
        if (!el || el.dataset.done) return;
        el.dataset.done = '1';
        new QRCode(el, {
            text:         BASE + t.id,
            width:        128,
            height:       128,
            colorDark:    '#000000',
            colorLight:   '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
    });
}
