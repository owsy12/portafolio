import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { escapeHtml } from '../utils/html-utils.js';
import { openAccount } from '../services/cuentas-service.js';
import { isReservationActive } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';

let _scanner = null;
let _scanProcessed = false;

export function renderMesero(m) {
    if (_scanner) {
        const s = _scanner;
        _scanner = null;
        s.stop().catch(() => {}).then(() => { try { s.clear(); } catch (_) {} });
    }
    _scanProcessed = false;

    const today = ST.today();
    const cuentas = DB._cuentas.filter(c => c.meseroId === ST.user.id && c.date === today);
    const abiertas = cuentas.filter(c => c.status === 'open');
    const cerradas = cuentas.filter(c => c.status === 'closed');

    m.innerHTML = `
<div class="dash">
  <div class="page-head">
    <div class="page-head-left">
      <h2>Mi Turno</h2>
      <div class="date-pill">
        <span class="date-pill-label">Fecha</span>
        <span style="font-size:13px;font-weight:600;color:var(--text)">${today}</span>
      </div>
    </div>
  </div>

  <div class="kpi-row" style="margin-bottom:20px">
    <div class="kpi-mini">
      <span class="kpi-dot green"></span>
      <div class="kpi-data">
        <span class="kpi-num green">${abiertas.length}</span>
        <span class="kpi-label">Cuentas abiertas</span>
      </div>
    </div>
    <div class="kpi-mini">
      <span class="kpi-dot gray"></span>
      <div class="kpi-data">
        <span class="kpi-num">${cerradas.length}</span>
        <span class="kpi-label">Cerradas hoy</span>
      </div>
    </div>
  </div>

  ${abiertas.length ? `
    <h3 class="mesero-section-title">Cuentas abiertas</h3>
    <div class="res-grid">${abiertas.map(c => cuentaCard(c, true)).join('')}</div>
  ` : `
    <div class="empty-state" style="grid-column:1/-1;padding:40px 0">
      <div class="empty-icon">—</div>
      <p>Sin cuentas abiertas. Escanea el QR de una mesa o ingresa el número manualmente.</p>
    </div>
  `}

  ${cerradas.length ? `
    <h3 class="mesero-section-title" style="margin-top:28px">Cerradas hoy</h3>
    <div class="res-grid">${cerradas.map(c => cuentaCard(c, false)).join('')}</div>
  ` : ''}

  <div class="add-rp-card" style="margin-top:28px">
    <h3>Escanear QR de Mesa</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">
      Usa la cámara para identificar la mesa y abrir la cuenta automáticamente.
    </p>
    <button id="btn-iniciar-camara" onclick="iniciarEscanerQR()" style="width:auto">
      Iniciar Cámara
    </button>
    <div id="qr-scanner-wrap" style="display:none;margin-top:14px">
      <div id="qr-reader" style="width:100%;border-radius:8px;overflow:hidden"></div>
      <button onclick="detenerEscanerQR()" class="btn-ghost" style="margin-top:8px;width:auto">
        Detener cámara
      </button>
      <div id="qr-scanner-msg" class="msg" style="margin-top:6px"></div>
    </div>
    <div id="qr-scan-result" style="margin-top:12px"></div>
  </div>

  <div class="add-rp-card" style="margin-top:16px">
    <h3>Abrir cuenta sin QR</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">
      Ingresa el número de mesa para buscar la reserva activa y abrir la cuenta.
    </p>
    <div class="mesa-input-row">
      <input id="mesa-manual-input" type="text" placeholder="N° de mesa (ej: 5, 10, 3a)"
             onkeydown="if(event.key==='Enter') abrirCuentaManual()">
      <button class="btn-buscar" onclick="abrirCuentaManual()">Buscar mesa</button>
    </div>
    <div id="mesa-manual-msg" class="msg" style="margin-top:6px"></div>
  </div>
</div>`;
}

async function _stopScanner() {
    if (_scanner) {
        try { await _scanner.stop(); } catch (_) {}
        try { _scanner.clear(); } catch (_) {}
        _scanner = null;
    }
}

export async function iniciarEscanerQR() {
    if (typeof Html5Qrcode === 'undefined') {
        const msg = $('qr-scanner-msg');
        if (msg) msg.textContent = 'Cargando lector QR, intenta de nuevo en un momento...';
        return;
    }

    const wrap   = $('qr-scanner-wrap');
    const btn    = $('btn-iniciar-camara');
    const msg    = $('qr-scanner-msg');
    const result = $('qr-scan-result');

    if (wrap)   wrap.style.display   = 'block';
    if (btn)    btn.style.display    = 'none';
    if (result) result.innerHTML     = '';
    if (msg)    msg.textContent      = '';

    _scanProcessed = false;
    await _stopScanner();

    _scanner = new Html5Qrcode('qr-reader');

    try {
        await _scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => _procesarQRMesero(decodedText),
            () => {}
        );
    } catch (err) {
        if (wrap) wrap.style.display = 'none';
        if (btn)  btn.style.display  = 'block';
        _scanner = null;

        const e = String(err).toLowerCase();
        const denied = e.includes('permission') || e.includes('denied') || e.includes('notallowed');
        if (msg) msg.textContent = denied
            ? 'Permiso de cámara denegado. Actívalo en la configuración del navegador y recarga la página.'
            : 'No se pudo acceder a la cámara. Verifica que no esté en uso por otra aplicación.';
    }
}

async function _procesarQRMesero(decodedText) {
    if (_scanProcessed) return;
    _scanProcessed = true;

    await _stopScanner();

    const wrap   = $('qr-scanner-wrap');
    const btn    = $('btn-iniciar-camara');
    const msg    = $('qr-scanner-msg');
    const result = $('qr-scan-result');

    if (wrap) wrap.style.display = 'none';
    if (btn)  btn.style.display  = 'block';
    if (msg)  msg.textContent    = '';

    const tableId = _parseMesaFromQR(decodedText);
    if (!tableId) {
        if (result) result.innerHTML = _msgCard('QR no reconocido. Asegúrate de escanear el código QR de una mesa del sistema.');
        return;
    }

    const today = ST.today();
    const rsv   = DB.getRByDate(today).find(r => r.tableId === tableId);

    if (!rsv || !isReservationActive(rsv)) {
        if (result) result.innerHTML = _msgCard(`Mesa ${escapeHtml(tableId)}: esta mesa no cuenta con una reserva activa.`);
        return;
    }

    const yaAbierta = DB._cuentas.find(
        c => c.tableId === tableId && c.date === today && c.status === 'open'
    );
    if (yaAbierta) {
        if (result) result.innerHTML = _msgCard(`Mesa ${escapeHtml(tableId)}: ya tiene una cuenta abierta.`);
        return;
    }

    if (result) result.innerHTML = _rsvCard(tableId, rsv);
}

function _parseMesaFromQR(text) {
    try {
        const url = new URL(text);
        return url.searchParams.get('t') || null;
    } catch { return null; }
}

function _msgCard(text) {
    return `<div class="mesa-estado-inline">${escapeHtml(text)}</div>`;
}

function _rsvCard(tableId, rsv) {
    const promoLabel = rsv.promo === 'cumpleanos' ? '🎉 Cumpleaños'
        : rsv.promo === 'barrelibre' ? 'Barra Libre' : '';
    return `<div class="res-card">
  <div class="rc-top">
    <span class="rc-badge-mesa">MESA <b>${escapeHtml(tableId)}</b></span>
    <span class="rc-status">Reserva activa</span>
  </div>
  <div class="rc-name">${escapeHtml(rsv.name)}</div>
  <div class="rc-meta">
    <span>RP: ${escapeHtml(rsv.rpName)}</span>
    ${promoLabel ? `<span class="dot">·</span><span>${promoLabel}</span>` : ''}
  </div>
  <div class="rc-actions" style="margin-top:10px">
    <button class="btn-xs purple" onclick="confirmarAperturaQR('${escapeHtml(tableId)}','${escapeHtml(rsv.id)}')">
      Abrir Cuenta
    </button>
  </div>
  <div id="qr-open-msg" class="msg" style="margin-top:6px"></div>
</div>`;
}

export async function detenerEscanerQR() {
    await _stopScanner();
    const wrap = $('qr-scanner-wrap');
    const btn  = $('btn-iniciar-camara');
    if (wrap) wrap.style.display = 'none';
    if (btn)  btn.style.display  = 'block';
}

export async function confirmarAperturaQR(tableId, rsvId) {
    const rsv = DB.getR().find(r => r.id === rsvId);
    const msg = $('qr-open-msg');

    if (!rsv || !isReservationActive(rsv)) {
        if (msg) msg.textContent = 'Esta mesa no cuenta con una reserva activa.';
        return;
    }

    const openBtn = document.querySelector(`[onclick*="confirmarAperturaQR"]`);
    if (openBtn) { openBtn.disabled = true; openBtn.textContent = 'Abriendo...'; }

    try {
        const result = await openAccount(tableId, rsv);
        if (!result.ok) {
            if (msg) msg.textContent = result.error;
            if (openBtn) { openBtn.disabled = false; openBtn.textContent = 'Abrir Cuenta'; }
            return;
        }
        toast(`Cuenta abierta — Mesa ${tableId}`);
    } catch (e) {
        if (msg) msg.textContent = 'Error al abrir la cuenta';
        if (openBtn) { openBtn.disabled = false; openBtn.textContent = 'Abrir Cuenta'; }
        console.error('[Descuke]', e);
    }
}

export async function abrirCuentaManual() {
    const input = $('mesa-manual-input');
    const msg   = $('mesa-manual-msg');
    if (!input) return;

    const tableId = input.value.trim();
    if (!tableId) { msg.textContent = 'Ingresa el número de mesa'; return; }

    msg.textContent = '';

    const today = ST.today();
    const rsv   = DB.getRByDate(today).find(r => r.tableId === tableId);

    if (!rsv) {
        msg.textContent = `Mesa ${tableId} no tiene reserva registrada hoy`;
        return;
    }

    if (!isReservationActive(rsv)) {
        msg.textContent = 'Esta mesa no cuenta con una reserva activa.';
        return;
    }

    const yaAbierta = DB._cuentas.find(
        c => c.tableId === tableId && c.date === today && c.status === 'open'
    );
    if (yaAbierta) {
        msg.textContent = `Mesa ${tableId} ya tiene una cuenta abierta`;
        return;
    }

    input.disabled  = true;
    msg.textContent = 'Abriendo cuenta...';

    try {
        const result = await openAccount(tableId, rsv);
        if (!result.ok) {
            msg.textContent = result.error;
            input.disabled  = false;
            return;
        }
        input.value     = '';
        input.disabled  = false;
        msg.textContent = '';
        toast(`Cuenta abierta — Mesa ${tableId}`);
    } catch (e) {
        msg.textContent = 'Error al abrir la cuenta';
        input.disabled  = false;
        console.error('[Descuke]', e);
    }
}

function cuentaCard(c, isOpen) {
    return `<div class="res-card${isOpen ? ' conf' : ''}">
  <div class="rc-top">
    <span class="rc-badge-mesa">MESA <b>${c.tableId}</b></span>
    <span style="flex:1"></span>
    <span class="rc-status${isOpen ? '' : ' no'}">${isOpen ? 'Abierta' : 'Cerrada'}</span>
  </div>
  <div class="rc-name">${escapeHtml(c.clientName)}</div>
  <div class="rc-meta">
    <span>RP: ${escapeHtml(c.rpName)}</span>
    ${!isOpen ? `<span class="dot">·</span><span>$${c.totalConsumo.toLocaleString('es-MX')}</span>` : ''}
  </div>
  ${isOpen ? `
  <div class="rc-actions">
    <button class="btn-xs purple" onclick="openCuenta('${c.id}')">Ver cuenta</button>
  </div>` : ''}
</div>`;
}
