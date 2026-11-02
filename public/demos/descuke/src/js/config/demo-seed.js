/* MODO DEMOSTRACIÓN — datos ficticios.
   Nombres, reservas y cuentas son inventados. Se generan relativos a la
   fecha actual para que la demo siempre tenga actividad "hoy". */
import { CATEGORIAS, PRODUCTOS } from '../data/products-catalog.js';
import { TABLES } from '../data/tables.data.js';
import { firstOfMonth } from '../utils/date-utils.js';

export const DEMO_PASSWORD = 'demo1234';

export const DEMO_ACCOUNTS = [
    { id: 'admin',  name: 'Administración (demo)', role: 'admin',  pass: DEMO_PASSWORD },
    { id: 'valeria',name: 'Valeria Ruiz',          role: 'rp',     pass: DEMO_PASSWORD },
    { id: 'diego',  name: 'Diego Herrera',         role: 'rp',     pass: DEMO_PASSWORD },
    { id: 'sofia',  name: 'Sofía Méndez',          role: 'rp',     pass: DEMO_PASSWORD },
    { id: 'camila', name: 'Camila Torres',         role: 'rp',     pass: DEMO_PASSWORD, isHostess: true },
    { id: 'luis',   name: 'Luis Romero',           role: 'mesero', pass: DEMO_PASSWORD },
    { id: 'ana',    name: 'Ana Pérez',             role: 'mesero', pass: DEMO_PASSWORD },
];

const CLIENTES = [
    'Mariana López', 'Jorge Castillo', 'Fernanda Aguilar', 'Ricardo Vega', 'Paola Navarro',
    'Andrea Salas', 'Emilio Robles', 'Daniela Fuentes', 'Héctor Ibarra', 'Lucía Cervantes',
    'Óscar Medina', 'Regina Campos', 'Tomás Ortega', 'Natalia Rosas', 'Iván Delgado',
    'Ximena Pacheco', 'Rodrigo Lara', 'Alejandra Mora', 'Bruno Esquivel', 'Carla Montes',
];

// Generador pseudoaleatorio determinista (misma demo en cada carga)
function rng(seed){
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };

export function seedData(){
    const r = rng(20261101);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const now = new Date().toISOString();
    const store = { users: {}, reservations: {}, cuentas: {}, comandas: {}, categorias: {}, productos: {}, settings: {} };

    DEMO_ACCOUNTS.forEach(u => { store.users[u.id] = { ...u }; });
    CATEGORIAS.forEach(c => { store.categorias[c.id] = { ...c, activo: true, created_at: now, updated_at: now }; });
    PRODUCTOS.forEach(p => { store.productos[p.id] = { ...p, activo: true, created_at: now, updated_at: now }; });

    const rps = DEMO_ACCOUNTS.filter(u => u.role === 'rp');
    const usableTables = TABLES.filter(t => !['20', '61'].includes(t.id));
    let n = 0;

    // Últimas 3 semanas + próximos 7 días (las estadísticas usan el histórico)
    for (let day = -20; day <= 7; day++) {
        const date = iso(addDays(day));
        const dow = addDays(day).getDay();
        const busy = day === 0 ? 14 : (dow === 5 || dow === 6) ? 10 + Math.floor(r() * 6) : 2 + Math.floor(r() * 4);
        const tables = [...usableTables].sort(() => r() - 0.5).slice(0, busy);
        tables.forEach((t, i) => {
            const rp = pick(rps);
            const name = pick(CLIENTES);
            const roll = r();
            const promo = roll < 0.15 ? 'cumpleanos' : roll < 0.22 ? 'barrelibre' : '';
            let status = 'reserved';
            if (day < 0) status = r() < 0.8 ? 'confirmed' : 'nollegó';
            if (day === 0) status = i < 6 ? 'confirmed' : i === 6 ? 'nollegó' : 'reserved';
            const id = String(1700000000000 + (++n));
            store.reservations['rsv_' + n] = {
                id, tableId: t.id, tableType: t.t, date, name,
                persons: 2 + Math.floor(r() * 9), promo,
                nombreCumpleanero: promo === 'cumpleanos' ? name : '',
                rpId: rp.id, rpName: rp.name, status,
            };
        });
    }

    // Una cuenta abierta hoy con una comanda, para explorar el módulo de meseros
    const today = iso(addDays(0));
    const [fbId, rsv] = Object.entries(store.reservations).find(([, x]) => x.date === today && x.status === 'confirmed');
    const cuentaFb = 'cta_demo_1';
    store.cuentas[cuentaFb] = {
        id: '1800000000001', tableId: rsv.tableId, date: today,
        reservationId: rsv.id, reservationFbId: fbId,
        meseroId: 'luis', meseroName: 'Luis Romero',
        rpId: rsv.rpId, rpName: rsv.rpName, clientName: rsv.name,
        promo: rsv.promo || '', persons: rsv.persons, status: 'open',
        openedAt: now, closedAt: null, totalConsumo: 0,
    };
    const item = (p, cantidad) => ({
        productoId: p.id, nombre: p.nombre, categoria_id: p.categoria_id, tipo_producto: p.tipo_producto,
        cantidad, precioOriginal: p.precio_base, precio: p.precio_base, descuentoAplicado: 0,
        subtotal: p.precio_base * cantidad, generaComisionRP: p.tipo_producto === 'botella',
        esPrivilegioPromo: false, promocionAplicada: '', observaciones: '',
    });
    const P = Object.fromEntries(PRODUCTOS.map(p => [p.id, p]));
    const items = [item(P['botella-tequila'], 1), item(P['refresco'], 4), item(P['papas'], 1)];
    store.comandas['cmd_demo_1'] = {
        id: '1800000000002', cuentaId: '1800000000001', cuentaFbId: cuentaFb,
        tableId: rsv.tableId, date: today, meseroId: 'luis', items,
        subtotal: items.reduce((s, i) => s + i.subtotal, 0),
        generaComisionRP: true, esBarraLibre: false, timestamp: now,
    };

    // Evita que la limpieza mensual borre el histórico de la demo
    store.settings.app = { blockedTables: { [iso(addDays(1))]: ['74'] }, lastCleanup: firstOfMonth() };
    return store;
}
