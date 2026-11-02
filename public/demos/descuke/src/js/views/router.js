import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { isAdmin, isMesero } from '../rules/access-rules.js';
import { renderLogin } from './login-view.js';
import { renderDashboard } from './dashboard-view.js';
import { renderCroquis } from './croquis-view.js';
import { renderStats } from './stats-view.js';
import { renderRPs } from './rps-view.js';
import { renderMesero } from './mesero-view.js';
import { renderCuentaView } from './cuenta-view.js';
import { renderQR } from './qr-view.js';

export function render(){
    if(!ST.user){ renderLogin(); return; }
    if(isMesero()) { renderMeseroApp(); return; }
    renderApp();
}

function renderApp(){
    const u = ST.user;
    const tabs = [
        { id: 'dashboard', label: 'Reservas' },
        { id: 'croquis',   label: 'Croquis' },
        ...(isAdmin(u) ? [
            { id: 'stats', label: 'Estadísticas' },
            { id: 'rps',   label: 'Equipo RP' },
            { id: 'qr',    label: 'QR Mesas' }
        ] : [])
    ];
    $('app').innerHTML = `
<div class="app-wrap">
  <header>
    <span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:18px;flex-shrink:0">DESCUKE</span>
    <div class="h-flex"></div>
    <span class="h-user">${u.name}${isAdmin(u)?'<span class="h-role">ADMIN</span>':''}</span>
    <button class="btn-ghost" onclick="doLogout()" style="padding:6px 14px;font-size:12px">Salir</button>
  </header>
  <nav>${tabs.map(t => `<button class="tab${ST.view===t.id?' active':''}" data-view="${t.id}" onclick="setView('${t.id}')">${t.label}</button>`).join('')}</nav>
  <main id="main"></main>
</div>`;
    renderView();
}

function renderMeseroApp(){
    const u = ST.user;
    ST.view = 'mesero';
    $('app').innerHTML = `
<div class="app-wrap">
  <header>
    <span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:18px;flex-shrink:0">DESCUKE</span>
    <div class="h-flex"></div>
    <span class="h-user">${u.name}<span class="h-role">MESERO</span></span>
    <button class="btn-ghost" onclick="doLogout()" style="padding:6px 14px;font-size:12px">Salir</button>
  </header>
  <main id="main"></main>
</div>`;
    renderMesero($('main'));
}

export function setView(v){
    ST.view = v;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
    const m = $('main'); if(m) renderView();
}

export function renderView(){
    const m = $('main'); if(!m) return;
    if(ST.view === 'dashboard')    renderDashboard(m);
    else if(ST.view === 'croquis') renderCroquis(m);
    else if(ST.view === 'stats')   renderStats(m);
    else if(ST.view === 'rps')     renderRPs(m);
    else if(ST.view === 'mesero')  renderMesero(m);
    else if(ST.view === 'cuenta')  renderCuentaView(m);
    else if(ST.view === 'qr')      renderQR(m);
}

export function goToMesero(){
    ST.view = 'mesero';
    const m = $('main');
    if(m) renderMesero(m);
}
