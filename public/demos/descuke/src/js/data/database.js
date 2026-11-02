import { db, collection, addDoc, doc, setDoc, onSnapshot } from '../config/firebase.config.js';
import { ROLES, SETTINGS } from '../config/constants.js';
import { ST } from '../state/app-state.js';

import { renderView } from '../views/router.js';
import { redrawSVG } from '../croquis/svg-controller.js';
import { refreshDashboardGrid } from '../views/dashboard-view.js';

export const DB = {
    _users: [],
    _reservations: [],
    _cuentas: [],
    _comandas: [],
    _productos: [],
    _categorias: [],
    _settings: { blockedTables: {}, lastCleanup: null },
    _unsubs: [],

    getU: () => DB._users,
    getR: () => DB._reservations,
    getRByDate: (date) => DB._reservations.filter(r => r.date === date),
    getCuentas: () => DB._cuentas,
    getComandas: () => DB._comandas,
    getProductos: () => DB._productos,
    getCategorias: () => DB._categorias,

    getBlocked: (date) => {
        const bt = DB._settings.blockedTables;
        if(!bt || Array.isArray(bt)) return [];
        return bt[date] || [];
    },
    getLastCleanup: () => DB._settings.lastCleanup || null,

    initSync: () => {
        DB.stopSync();

        DB._unsubs.push(
            onSnapshot(collection(db, "users"), (snapshot) => {
                DB._users = snapshot.docs.map(d => ({ fb_id: d.id, ...d.data() }));
                if(!DB._users.find(u => u.role === ROLES.ADMIN)) {
                    setDoc(doc(db, "users", 'admin'),
                        { id: 'admin', name: 'Admin Descuke', pass: 'admin123', role: ROLES.ADMIN },
                        { merge: true });
                }
                if (ST.view === 'rps') renderView();
            })
        );

        DB._unsubs.push(
            onSnapshot(collection(db, "reservations"), (snapshot) => {
                DB._reservations = snapshot.docs.map(d => ({ fb_id: d.id, ...d.data() }));
                if (!ST.user) return;
                if(ST.view === 'dashboard' && document.getElementById('res-grid')){
                    refreshDashboardGrid();
                } else {
                    renderView();
                    if(ST.view === 'croquis') redrawSVG();
                }
            })
        );

        DB._unsubs.push(
            onSnapshot(doc(db, SETTINGS.col, SETTINGS.id), (snap) => {
                DB._settings = snap.exists()
                    ? { blockedTables: {}, lastCleanup: null, ...snap.data() }
                    : { blockedTables: {}, lastCleanup: null };
                if (!ST.user) return;
                if (ST.view === 'croquis') redrawSVG();
                else if (ST.view === 'dashboard') renderView();
            })
        );

        DB._unsubs.push(
            onSnapshot(collection(db, "cuentas"), (snapshot) => {
                DB._cuentas = snapshot.docs.map(d => ({ fb_id: d.id, ...d.data() }));
                if (!ST.user) return;
                if (ST.view === 'mesero' || ST.view === 'cuenta') renderView();
            })
        );

        DB._unsubs.push(
            onSnapshot(collection(db, "comandas"), (snapshot) => {
                DB._comandas = snapshot.docs.map(d => ({ fb_id: d.id, ...d.data() }));
                if (!ST.user) return;
                if (ST.view === 'cuenta') renderView();
            })
        );

        DB._unsubs.push(
            onSnapshot(collection(db, "categorias"), (snapshot) => {
                DB._categorias = snapshot.docs
                    .map(d => ({ fb_id: d.id, ...d.data() }))
                    .filter(c => c.activo !== false)
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
            })
        );

        DB._unsubs.push(
            onSnapshot(collection(db, "productos"), (snapshot) => {
                DB._productos = snapshot.docs
                    .map(d => ({ fb_id: d.id, ...d.data() }))
                    .filter(p => p.activo !== false)
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
                if (!ST.user) return;
                if (ST.view === 'cuenta') renderView();
            })
        );
    },

    stopSync: () => {
        DB._unsubs.forEach(unsub => unsub());
        DB._unsubs = [];
    }
};
