import { auth, collection, getDocs, onAuthStateChanged } from './config/firebase.config.js';
import { ROLES } from './config/constants.js';
import { ST } from './state/app-state.js';
import { DB } from './data/database.js';
import { db } from './config/firebase.config.js';

import { doLogin, doLogout } from './services/auth-service.js';
import { setView, renderView, render, goToMesero } from './views/router.js';
import { togglePassword } from './views/login-view.js';
import { setFilter, onSearchInput } from './views/dashboard-view.js';
import { setRankingMode, selectStatsWeek } from './views/stats-view.js';
import { redrawSVG } from './croquis/svg-controller.js';
import { closeModal } from './ui/modal.js';
import { saveRes, openEdit, saveEdit, delRes, setArrival } from './services/reservations-service.js';
import { addRP, openEditRP, saveEditRP, delRP, toggleHostess, migrateUsers } from './services/rps-service.js';
import { adminBlockTable, unblockTable } from './services/tables-service.js';
import { printDay, printBirthdays } from './print/print-service.js';
import { abrirCuentaManual, iniciarEscanerQR, detenerEscanerQR, confirmarAperturaQR } from './views/mesero-view.js';
import { openCuenta, guardarComanda, cerrarCuentaConfirm, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, setCatFilter, setCatalogSearch, registrarBarraLibre } from './views/cuenta-view.js';
import { aplicarPromoUniversitaria } from './services/cuentas-service.js';
import { sembrarCatalogo } from './services/seed-service.js';
import { runMonthlyCleanupIfNeeded } from './services/cleanup-service.js';
import { isAdmin } from './rules/access-rules.js';
import { $ } from './utils/dom.js';

document.addEventListener('click', e => { if(e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Enter' && $('l-u')) doLogin(); });

window.doLogin = doLogin;
window.doLogout = doLogout;
window.setView = setView;
window.printDay = printDay;
window.printBirthdays = printBirthdays;
window.setArrival = setArrival;
window.openEdit = openEdit;
window.delRes = delRes;
window.openEditRP = openEditRP;
window.delRP = delRP;
window.addRP = addRP;
window.saveEditRP = saveEditRP;
window.toggleHostess = toggleHostess;
window.closeModal = closeModal;
window.saveRes = saveRes;
window.saveEdit = saveEdit;
window.redrawSVG = redrawSVG;
window.renderView = renderView;
window.adminBlockTable = adminBlockTable;
window.unblockTable = unblockTable;
window.togglePassword = togglePassword;
window.setFilter = setFilter;
window.onSearchInput = onSearchInput;
window.selectStatsWeek = selectStatsWeek;
window.setRankingMode = setRankingMode;
window.renderMeseroView   = goToMesero;
window.abrirCuentaManual   = abrirCuentaManual;
window.iniciarEscanerQR    = iniciarEscanerQR;
window.detenerEscanerQR    = detenerEscanerQR;
window.confirmarAperturaQR = confirmarAperturaQR;
window.openCuenta          = openCuenta;
window.guardarComanda      = guardarComanda;
window.cerrarCuentaConfirm = cerrarCuentaConfirm;
window.agregarAlCarrito    = agregarAlCarrito;
window.cambiarCantidad     = cambiarCantidad;
window.quitarDelCarrito    = quitarDelCarrito;
window.setCatFilter        = setCatFilter;
window.setCatalogSearch    = setCatalogSearch;
window.registrarBarraLibre = registrarBarraLibre;
window.aplicarPromoUniversitaria = aplicarPromoUniversitaria;
window.sembrarCatalogo     = sembrarCatalogo;

window.handleCompartirReserva = function(id) {
    const r = DB.getR().find(x => x.id === id);
    if (!r) return;
    if (typeof ShareReservation !== 'undefined') {
        ShareReservation.openShareModal(r);
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const username = user.email.split('@')[0];

        const snap = await getDocs(collection(db, "users"));
        DB._users = snap.docs.map(d => ({ fb_id: d.id, ...d.data() }));

        const dbUser = DB._users.find(u => u.id === username);
        ST.user = dbUser || { id: username, name: username, role: ROLES.RP };

        DB.initSync();
        render();

        if(isAdmin()){
            runMonthlyCleanupIfNeeded().catch(err => console.error('[Descuke] cleanup error:', err));
            migrateUsers().catch(err => console.error('[Descuke] migration error:', err));
        }
    } else {
        DB.stopSync();
        ST.user = null;
        render();
    }
});
