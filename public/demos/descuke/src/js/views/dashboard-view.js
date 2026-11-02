import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { isAdmin, canDeleteReservation, canManageArrival } from '../rules/access-rules.js';
import { escapeHtml } from '../utils/html-utils.js';
import { ICON } from '../ui/icons.js';
import { PROMO_LABEL } from '../config/constants.js';

function applyFilters(list){
    const { q, type, status } = ST.filters;
    const needle = q.trim().toLowerCase();
    return list.filter(r => {
        if(type !== 'all'){
            const tt = (r.tableType || r.t) === 'vip' ? 'vip' : 'per';
            if(tt !== type) return false;
        }
        if(status !== 'all'){
            const s = r.status || 'reserved';
            if(s !== status) return false;
        }
        if(needle){
            const hay = `${r.name||''} ${r.rpName||''} ${r.tableId||''}`.toLowerCase();
            if(!hay.includes(needle)) return false;
        }
        return true;
    });
}

export function refreshDashboardGrid(){
    const savedDate = $('filter-date')?.value || ST.today();
    const dayRes = DB.getRByDate(savedDate);
    const scoped = (isAdmin() || canManageArrival()) ? dayRes : dayRes.filter(r => r.rpId === ST.user.id);
    const list = applyFilters(scoped);

    updateKpis(scoped);

    const grid = $('res-grid');
    if(!grid) return;
    grid.innerHTML = list.length
        ? list.map(r => resCard(r, ST.user)).join('')
        : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">—</div><p>Sin resultados con estos filtros</p></div>`;
}

function updateKpis(dayList){
    const total = dayList.length;
    const conf  = dayList.filter(r => r.status === 'confirmed').length;
    const no    = dayList.filter(r => r.status === 'nollegó').length;
    const pend  = total - conf - no;
    const rate  = total ? Math.round((conf / total) * 100) : 0;
    const set = (id, v) => { const el = $(id); if(el) el.textContent = v; };
    set('kpi-total', total); set('kpi-conf', conf);
    set('kpi-no', no); set('kpi-pend', pend);
    set('kpi-rate', rate + '%');
    const bar = $('kpi-rate-bar'); if(bar) bar.style.width = rate + '%';
}

export function setFilter(key, val){
    ST.filters[key] = val;
    document.querySelectorAll(`.chip-group[data-filter="${key}"] .chip`).forEach(c => {
        c.classList.toggle('active', c.dataset.val === val);
    });
    refreshDashboardGrid();
}

export function onSearchInput(v){
    ST.filters.q = v;
    refreshDashboardGrid();
}

export function renderDashboard(m){
    const u = ST.user;
    const savedDate = $('filter-date')?.value || ST.today();
    const f = ST.filters;

    const chipsType = [
        { v: 'all', l: 'Todas' }, { v: 'vip', l: 'VIP' }, { v: 'per', l: 'Periquera' }
    ];
    const chipsStatus = [
        { v: 'all', l: 'Todas' }, { v: 'reserved', l: 'Reservada' },
        { v: 'confirmed', l: 'Llegó' }, { v: 'nollegó', l: 'No llegó' }
    ];
    const chipHtml = (group, key, active) => group.map(c =>
        `<button class="chip${c.v===active?' active':''}" data-val="${c.v}" onclick="setFilter('${key}','${c.v}')">${c.l}</button>`
    ).join('');

    m.innerHTML = `
<div class="dash">
  <div class="page-head">
    <div class="page-head-left">
      <h2>Reservas</h2>
      <div class="date-pill">
        <span class="date-pill-label">Fecha</span>
        <input type="date" id="filter-date" value="${savedDate}" onchange="renderView()">
      </div>
    </div>
    ${isAdmin(u)?`<div class="print-group">
      <button class="btn-print" onclick="printDay()">${ICON.printer}Imprimir reservas</button>
      <button class="btn-print btn-print-alt" onclick="printBirthdays()">🎉 Cumpleaños</button>
    </div>`:''}
  </div>
 
  <div class="kpi-row" id="kpi-row">
    <div class="kpi-mini"><span class="kpi-dot purple"></span>
      <div class="kpi-data"><span class="kpi-num purple" id="kpi-total">0</span><span class="kpi-label">Total reservas</span></div>
    </div>
    <div class="kpi-mini"><span class="kpi-dot green"></span>
      <div class="kpi-data"><span class="kpi-num green" id="kpi-conf">0</span><span class="kpi-label">Llegaron</span></div>
    </div>
    <div class="kpi-mini"><span class="kpi-dot red"></span>
      <div class="kpi-data"><span class="kpi-num red" id="kpi-no">0</span><span class="kpi-label">No llegaron</span></div>
    </div>
    <div class="kpi-mini"><span class="kpi-dot gray"></span>
      <div class="kpi-data"><span class="kpi-num" id="kpi-pend">0</span><span class="kpi-label">Pendientes</span></div>
    </div>
    <div class="kpi-rate">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
        <span class="kpi-num" id="kpi-rate">0%</span>
        <span class="kpi-label">Tasa asistencia</span>
      </div>
      <div class="kpi-bar"><div class="kpi-bar-fill" id="kpi-rate-bar" style="width:0%"></div></div>
    </div>
  </div>
 
  <div class="filter-row">
    <div class="search-box">
      ${ICON.search}
      <input type="text" id="search-input" placeholder="Buscar cliente, RP, mesa..." value="${f.q.replace(/"/g,'&quot;')}" oninput="onSearchInput(this.value)">
    </div>
    <div class="chip-group" data-filter="type">${chipHtml(chipsType, 'type', f.type)}</div>
    <div class="chip-group" data-filter="status">${chipHtml(chipsStatus, 'status', f.status)}</div>
  </div>
 
  <div class="res-grid" id="res-grid"></div>
</div>`;
    refreshDashboardGrid();
}

function resCard(r, u){
    const canEdit = isAdmin(u) || r.rpId === u.id;
    const canDelete = canDeleteReservation(u);
    const sl = { reserved: 'Reservada', confirmed: 'Llegó ✓', nollegó: 'No llegó' };
    const sc = { reserved: '', confirmed: 's-conf', nollegó: 's-no' };
    const statusClass = { reserved: '', confirmed: 'conf', nollegó: 'no' };
    const tt = (r.tableType || r.t) === 'vip';
    const promo = r.promo || '';
    const curStatus = r.status || 'reserved';
    const isBday = promo === 'cumpleanos';

    return `<div class="res-card ${sc[curStatus]}${isBday?' bday':''}">
  <div class="rc-top">
    <span class="rc-badge ${tt?'vip':'per'}">${tt?'VIP':'Periquera'}</span>
    <span class="rc-badge-mesa">MESA <b>${r.tableId}</b></span>
    <span style="flex:1"></span>
    <span class="rc-status ${statusClass[curStatus]}">${sl[curStatus]}</span>
  </div>
  <div class="rc-name">${escapeHtml(r.name)}</div>
  <div class="rc-meta">
    <span>${r.persons} personas</span><span class="dot">·</span>
    <span>RP: ${escapeHtml(r.rpName||'')}</span>
    ${promo?`<span class="rc-promo promo-${promo}">${PROMO_LABEL[promo]}</span>`:''}
  </div>
  ${canEdit?`<div class="rc-actions">
    ${canManageArrival(u)?`
      <button class="btn-xs green${curStatus==='confirmed'?' active':''}" onclick="setArrival('${r.id}','confirmed')">Llegó</button>
      <button class="btn-xs red${curStatus==='nollegó'?' active':''}" onclick="setArrival('${r.id}','nollegó')">No llegó</button>`:''}
    <button class="btn-xs purple" onclick="openEdit('${r.id}')">Editar</button>
    <button class="btn-xs share" onclick="handleCompartirReserva('${r.id}')"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:3px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Compartir</button>
    ${canDelete?`<button class="btn-xs gray" onclick="delRes('${r.id}')">Eliminar</button>`:''}
  </div>`:''}
</div>`;
}