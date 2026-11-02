import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { isAdmin } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';

const PRINT_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px}
.print-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;border-bottom:2px solid #1e1b4b;padding-bottom:16px}
.print-header img{height:40px;filter:brightness(0)}
.ph-title{font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;display:block}
.ph-date{font-size:14px;font-weight:600;color:#111;display:block}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1e1b4b;color:#fff;padding:9px 12px;text-align:left}
td{padding:8px 12px;border-bottom:1px solid #eee}
tr:nth-child(even) td{background:#f8f7ff}
.conf{color:#065f46;font-weight:600}.no{color:#7f1d1d;font-weight:600}
.bday{color:#d97706;font-weight:600}.bl{color:#7c3aed;font-weight:600}
.empty{padding:40px;text-align:center;color:#888}
.consumo-cell{font-size:11px;color:#444;max-width:220px;word-break:break-word}
.mesero-cell{font-size:12px;color:#333}`;

function openPrintWindow(title, bodyHTML){
    const win = window.open('', '_blank', 'width=860,height=640');
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${PRINT_CSS}</style></head><body>${bodyHTML}<script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
    win.document.close();
}

export function printDay(){
    if(!isAdmin()){ toast('Acción no autorizada'); return; }
    const dateSel = $('filter-date')?.value || ST.today();
    const list = DB.getRByDate(dateSel);

    const cuentasDia  = DB._cuentas.filter(c => c.date === dateSel);
    const comandasDia = DB._comandas.filter(c => c.date === dateSel);

    const cuentaMap = {};
    cuentasDia.forEach(c => { cuentaMap[c.tableId] = c; });

    const consumoMap = {};
    comandasDia.forEach(cmd => {
        if (!consumoMap[cmd.cuentaId]) consumoMap[cmd.cuentaId] = {};
        cmd.items.forEach(item => {
            const k = item.nombre;
            consumoMap[cmd.cuentaId][k] = (consumoMap[cmd.cuentaId][k] || 0) + item.cantidad;
        });
    });

    function consumoTexto(cuentaId) {
        const agg = consumoMap[cuentaId];
        if (!agg || !Object.keys(agg).length) return '—';
        return Object.entries(agg).map(([n, q]) => `${q}x ${n}`).join(', ');
    }

    const body = `
<div class="print-header">
  <span style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;font-size:20px">DESCUKE</span>
  <div>
    <span class="ph-title">Reservas del día</span>
    <span class="ph-date">${dateSel} &nbsp;·&nbsp; ${list.length} reservas</span>
  </div>
</div>
${list.length === 0 ? '<p class="empty">Sin reservas para esta fecha</p>' : `
<table><thead><tr>
  <th>Mesa</th><th>Tipo</th><th>Nombre</th><th>Personas</th>
  <th>RP</th><th>Promoción</th><th>Estado</th>
  <th>Mesero</th><th>Consumo</th><th>Total Consumo</th>
</tr></thead>
<tbody>${list.map(r => {
        const cuenta = cuentaMap[r.tableId];
        const promo = r.promo || '';
        const promoCell = promo === 'cumpleanos'
            ? `<td class="bday">🎉 Cumpleaños</td>`
            : promo === 'universitaria' ? `<td class="bday">🎓 Universitaria</td>`
            : promo === 'barrelibre' ? `<td class="bl">Barra Libre</td>`
            : `<td style="color:#bbb">—</td>`;
        const estado = { reserved: 'Reservada', confirmed: 'Confirmada', nollegó: 'No llegó' }[r.status || 'reserved'];
        const estadoClass = r.status === 'confirmed' ? 'conf' : r.status === 'nollegó' ? 'no' : '';
        const meseroCell   = cuenta ? cuenta.meseroName : '—';
        const consumoCell  = cuenta ? consumoTexto(cuenta.id) : '—';
        const totalConsumo = cuenta
            ? `$${(cuenta.totalConsumo || 0).toLocaleString('es-MX')}`
            : '—';
        return `<tr>
      <td>${r.tableId}</td>
      <td>${(r.tableType||r.t)==='vip'?'VIP':'Periquera'}</td>
      <td>${r.name}</td><td>${r.persons}</td>
      <td>${r.rpName||''}</td>${promoCell}
      <td class="${estadoClass}">${estado}</td>
      <td class="mesero-cell">${meseroCell}</td>
      <td class="consumo-cell">${consumoCell}</td>
      <td style="font-weight:600;white-space:nowrap">${totalConsumo}</td>
    </tr>`;
    }).join('')}</tbody>
</table>`}`;
    openPrintWindow(`Descuke Reservas ${dateSel}`, body);
}

export function printBirthdays(){
    if(!isAdmin()){ toast('Acción no autorizada'); return; }
    const dateSel = $('filter-date')?.value || ST.today();
    const list = DB.getRByDate(dateSel).filter(r => r.promo === 'cumpleanos');
    const body = `
<div class="print-header">
  <span style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;font-size:20px">DESCUKE</span>
  <div>
    <span class="ph-title">Cumpleaños del día</span>
    <span class="ph-date">${dateSel} &nbsp;·&nbsp; ${list.length} cumpleaños</span>
  </div>
</div>
${list.length === 0 ? '<p class="empty">Sin cumpleaños para esta fecha</p>' : `
<table><thead><tr>
  <th>Cumpleañero</th><th>Mesa</th><th>RP</th>
</tr></thead>
<tbody>${list.map(r => `<tr>
  <td class="bday">${r.nombreCumpleanero || r.name}</td>
  <td>${r.tableId}</td>
  <td>${r.rpName || ''}</td>
</tr>`).join('')}</tbody>
</table>`}`;
    openPrintWindow(`Descuke Cumpleaños ${dateSel}`, body);
}
