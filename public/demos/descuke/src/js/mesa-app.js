import {
    auth, db,
    onAuthStateChanged,
    collection, addDoc, getDocs,
    query, where
} from './config/firebase.config.js';

const params  = new URLSearchParams(location.search);
const tableId = params.get('t');

const ACTIVE_STATUSES = new Set(['reserved', 'confirmed']);

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function render(html) {
    document.getElementById('mesa-app').innerHTML = html;
}

function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderNoTable() {
    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <h2 style="font-family:'Rajdhani',sans-serif">QR inválido</h2>
      <div class="mesa-estado">
        <span class="mesa-estado-icon">⚠️</span>
        Este código QR no tiene una mesa asociada.
      </div>
    </div></div>`);
}

function renderAccesoDenegado() {
    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <h2 style="font-family:'Rajdhani',sans-serif">Acceso restringido</h2>
      <div class="mesa-estado">
        <span class="mesa-estado-icon">🔒</span>
        Esta página es exclusiva para meseros.
      </div>
      <a href="index.html" class="mesa-link">← Volver al inicio</a>
    </div></div>`);
}

function renderSinReserva(tableId) {
    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <div class="mesa-num">Mesa #${esc(tableId)}</div>
      <div class="mesa-estado">
        <span class="mesa-estado-icon">—</span>
        Esta mesa no tiene una reserva activa para hoy.
      </div>
    </div></div>`);
}

function renderReservaInactiva(tableId) {
    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <div class="mesa-num">Mesa #${esc(tableId)}</div>
      <div class="mesa-estado">
        <span class="mesa-estado-icon">—</span>
        Esta mesa no cuenta con una reserva activa.
      </div>
      <a href="index.html" class="mesa-link">← Volver al inicio</a>
    </div></div>`);
}

function renderCuentaYaAbierta(tableId) {
    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <div class="mesa-num">Mesa #${esc(tableId)}</div>
      <div class="mesa-estado">
        <span class="mesa-estado-icon">⚡</span>
        Esta mesa ya tiene una cuenta abierta.
      </div>
      <a href="index.html" class="mesa-btn" style="text-align:center;text-decoration:none;display:block">
        Ver mis cuentas
      </a>
    </div></div>`);
}

function renderConReserva(tableId, rsv, mesero) {
    const promoLabel = rsv.promo === 'cumpleanos' ? '🎉 Cumpleaños'
        : rsv.promo === 'barrelibre' ? 'Barra Libre' : '';

    render(`<div class="mesa-wrap"><div class="mesa-card">
      <div style="margin-bottom:12px"><span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;font-size:22px">DESCUKE</span></div>
      <div class="mesa-num">Mesa #${esc(tableId)}</div>
      <div class="mesa-info-row">
        <span class="mesa-info-label">Reservada por</span>
        <span class="mesa-info-val">${esc(rsv.rpName)}</span>
      </div>
      <div class="mesa-info-row">
        <span class="mesa-info-label">Cliente</span>
        <span class="mesa-info-val">${esc(rsv.name)}</span>
      </div>
      <div class="mesa-info-row">
        <span class="mesa-info-label">Personas</span>
        <span class="mesa-info-val">${rsv.persons}</span>
      </div>
      ${promoLabel ? `
      <div class="mesa-info-row">
        <span class="mesa-info-label">Promoción</span>
        <span class="mesa-info-val"><span class="mesa-promo-tag">${promoLabel}</span></span>
      </div>` : ''}
      <button class="mesa-btn" id="btn-abrir">Abrir Cuenta</button>
      <p class="mesa-msg" id="mesa-msg"></p>
    </div></div>`);

    document.getElementById('btn-abrir').addEventListener('click', () => abrirCuenta(tableId, rsv, mesero));
}

async function abrirCuenta(tableId, rsv, mesero) {
    const btn = document.getElementById('btn-abrir');
    const msg = document.getElementById('mesa-msg');
    btn.disabled    = true;
    btn.textContent = 'Abriendo...';

    const existeSnap = await getDocs(query(
        collection(db, 'cuentas'),
        where('tableId', '==', tableId),
        where('date',    '==', today()),
        where('status',  '==', 'open')
    ));

    if (!existeSnap.empty) {
        renderCuentaYaAbierta(tableId);
        return;
    }

    try {
        await addDoc(collection(db, 'cuentas'), {
            id:              Date.now().toString(),
            tableId,
            date:            today(),
            reservationId:   rsv.id,
            reservationFbId: rsv.fb_id,
            meseroId:        mesero.id,
            meseroName:      mesero.name,
            rpId:            rsv.rpId,
            rpName:          rsv.rpName,
            clientName:      rsv.name,
            status:          'open',
            openedAt:        new Date().toISOString(),
            closedAt:        null,
            totalConsumo:    0
        });

        location.href = 'index.html';
    } catch (e) {
        console.error('[Descuke mesa]', e);
        msg.textContent = 'Error al abrir la cuenta. Intenta de nuevo.';
        btn.disabled    = false;
        btn.textContent = 'Abrir Cuenta';
    }
}

if (!tableId) {
    renderNoTable();
} else {
    onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
            location.href = 'index.html';
            return;
        }

        const username = firebaseUser.email.split('@')[0];

        const usersSnap = await getDocs(collection(db, 'users'));
        const dbUser = usersSnap.docs
            .map(d => ({ fb_id: d.id, ...d.data() }))
            .find(u => u.id === username);

        if (!dbUser || dbUser.role !== 'mesero') {
            renderAccesoDenegado();
            return;
        }

        const d = today();

        const rsvSnap = await getDocs(query(
            collection(db, 'reservations'),
            where('tableId', '==', tableId),
            where('date',    '==', d)
        ));

        if (rsvSnap.empty) {
            renderSinReserva(tableId);
            return;
        }

        const rsv = { fb_id: rsvSnap.docs[0].id, ...rsvSnap.docs[0].data() };

        if (!ACTIVE_STATUSES.has(rsv.status || 'reserved')) {
            renderReservaInactiva(tableId);
            return;
        }

        const cuentaSnap = await getDocs(query(
            collection(db, 'cuentas'),
            where('tableId', '==', tableId),
            where('date',    '==', d),
            where('status',  '==', 'open')
        ));

        if (!cuentaSnap.empty) {
            renderCuentaYaAbierta(tableId);
            return;
        }

        renderConReserva(tableId, rsv, dbUser);
    });
}
