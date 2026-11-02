/* ════════════════════════════════════════════════════════════════════
   MODO DEMOSTRACIÓN — reemplazo local de Firebase
   ────────────────────────────────────────────────────────────────────
   Este archivo sustituye a la configuración real de Firebase SOLO en la
   demo del portafolio. Expone la misma API que usa la aplicación
   (Firestore + Auth), pero guarda todo en memoria del navegador
   (sessionStorage) con datos ficticios. No se conecta a ningún servidor,
   no contiene credenciales y no toca la base de datos de producción.
   El resto del código de la aplicación se ejecuta sin cambios.
   ════════════════════════════════════════════════════════════════════ */
import { seedData, DEMO_ACCOUNTS } from './demo-seed.js';

const STORE_KEY = 'descuke-demo-store-v1';
const AUTH_KEY  = 'descuke-demo-user-v1';

/* ── Almacenamiento seguro (sessionStorage puede fallar en iframes/privado) ── */
const safe = {
    get(k){ try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v){ try { sessionStorage.setItem(k, v); } catch { /* sin persistencia */ } },
    del(k){ try { sessionStorage.removeItem(k); } catch { /* noop */ } },
};

function loadStore(){
    const raw = safe.get(STORE_KEY);
    if (raw) { try { return JSON.parse(raw); } catch { /* datos corruptos → semilla */ } }
    return seedData();
}
let STORE = loadStore();            // { coleccion: { id: datos } }
const persist = () => safe.set(STORE_KEY, JSON.stringify(STORE));
persist();

const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
function deepMerge(target, src){
    const out = { ...target };
    for (const [k, v] of Object.entries(src)) {
        out[k] = isPlainObject(v) && isPlainObject(out[k]) ? deepMerge(out[k], v) : clone(v);
    }
    return out;
}
const newId = () => 'demo_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const col = (name) => (STORE[name] ||= {});

/* ── Referencias ─────────────────────────────────────────────────── */
const db   = { __demo: true };
const app  = { name: 'descuke-demo' };

function collection(_db, name){ return { kind: 'collection', col: name }; }
function doc(_db, name, id){ return { kind: 'doc', col: name, id: String(id) }; }
function where(field, op, value){ return { field, op, value }; }
function query(ref, ...filters){ return { kind: 'query', col: ref.col, filters }; }

function matches(data, filters = []){
    return filters.every(({ field, op, value }) => {
        const v = data[field];
        switch (op) {
            case '==': return v === value;
            case '!=': return v !== value;
            case 'in': return Array.isArray(value) && value.includes(v);
            case '<':  return v <  value;
            case '<=': return v <= value;
            case '>':  return v >  value;
            case '>=': return v >= value;
            case 'array-contains': return Array.isArray(v) && v.includes(value);
            default: return false;
        }
    });
}

/* ── Snapshots ───────────────────────────────────────────────────── */
function docSnap(name, id){
    const data = col(name)[id];
    return { id, ref: { kind: 'doc', col: name, id }, exists: () => data !== undefined, data: () => clone(data) };
}
function querySnap(ref){
    const filters = ref.kind === 'query' ? ref.filters : [];
    const docs = Object.entries(col(ref.col))
        .filter(([, d]) => matches(d, filters))
        .map(([id]) => docSnap(ref.col, id));
    return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn) => docs.forEach(fn) };
}

/* ── Suscripciones en "tiempo real" ──────────────────────────────── */
const listeners = new Set();
function notify(colName){
    persist();
    // Asíncrono, como Firestore: evita reentradas en el render actual
    queueMicrotask(() => {
        listeners.forEach(l => {
            if (l.ref.col !== colName) return;
            try { l.cb(l.ref.kind === 'doc' ? docSnap(l.ref.col, l.ref.id) : querySnap(l.ref)); }
            catch (e) { console.error('[demo] listener error', e); }
        });
    });
}
function onSnapshot(ref, cb){
    const l = { ref, cb };
    listeners.add(l);
    queueMicrotask(() => {
        if (!listeners.has(l)) return;
        cb(ref.kind === 'doc' ? docSnap(ref.col, ref.id) : querySnap(ref));
    });
    return () => listeners.delete(l);
}

/* ── Escrituras ──────────────────────────────────────────────────── */
const latency = () => new Promise(r => setTimeout(r, 60));

async function addDoc(ref, data){
    await latency();
    const id = newId();
    col(ref.col)[id] = clone(data);
    notify(ref.col);
    return { id };
}
function applySet(ref, data, opts){
    const c = col(ref.col);
    c[ref.id] = opts && opts.merge && c[ref.id] ? deepMerge(c[ref.id], data) : clone(data);
}
async function setDoc(ref, data, opts){
    await latency();
    applySet(ref, data, opts);
    notify(ref.col);
}
function applyUpdate(ref, data){
    const c = col(ref.col);
    if (!c[ref.id]) throw new Error('No document to update: ' + ref.col + '/' + ref.id);
    const next = { ...c[ref.id] };
    for (const [k, v] of Object.entries(data)) {
        if (k.includes('.')) {               // rutas tipo "a.b.c"
            const parts = k.split('.');
            let o = next;
            parts.slice(0, -1).forEach(p => { o[p] = isPlainObject(o[p]) ? { ...o[p] } : {}; o = o[p]; });
            o[parts.at(-1)] = clone(v);
        } else next[k] = clone(v);
    }
    c[ref.id] = next;
}
async function updateDoc(ref, data){
    await latency();
    applyUpdate(ref, data);
    notify(ref.col);
}
async function deleteDoc(ref){
    await latency();
    delete col(ref.col)[ref.id];
    notify(ref.col);
}
async function getDocs(ref){
    await latency();
    return querySnap(ref);
}
function writeBatch(){
    const ops = [];
    return {
        set: (ref, data, opts) => { ops.push(() => applySet(ref, data, opts)); },
        update: (ref, data) => { ops.push(() => applyUpdate(ref, data)); },
        delete: (ref) => { ops.push(() => { delete col(ref.col)[ref.id]; }); },
        commit: async () => {
            await latency();
            const touched = new Set();
            ops.forEach(op => op());
            // Notificar todas las colecciones afectadas
            Object.keys(STORE).forEach(c => touched.add(c));
            touched.forEach(notify);
        },
    };
}

/* ── Auth simulada ───────────────────────────────────────────────── */
const authListeners = new Set();
const auth = { currentUser: null };
(() => {
    const raw = safe.get(AUTH_KEY);
    if (raw) { try { auth.currentUser = JSON.parse(raw); } catch { /* noop */ } }
})();
function emitAuth(){
    authListeners.forEach(cb => queueMicrotask(() => cb(auth.currentUser)));
}
function onAuthStateChanged(_auth, cb){
    authListeners.add(cb);
    queueMicrotask(() => cb(auth.currentUser));
    return () => authListeners.delete(cb);
}
async function signInWithEmailAndPassword(_auth, email, password){
    await latency();
    const username = String(email).split('@')[0].toLowerCase();
    const ok = DEMO_ACCOUNTS.find(a => a.id === username && a.pass === password)
        || Object.values(col('users')).find(u => u.id === username && u.pass === password);
    if (!ok) { const e = new Error('auth/invalid-credential'); e.code = 'auth/invalid-credential'; throw e; }
    auth.currentUser = { uid: username, email: username + '@descuke.com' };
    safe.set(AUTH_KEY, JSON.stringify(auth.currentUser));
    emitAuth();
    return { user: auth.currentUser };
}
async function signOut(){
    auth.currentUser = null;
    safe.del(AUTH_KEY);
    emitAuth();
}
// Alta/baja de cuentas: en la demo solo se registran en la colección "users"
async function createAuthUser(email){ return { uid: String(email).split('@')[0], email }; }
async function updateAuthPassword(){ return true; }
async function deleteAuthUser(){ return true; }

/* ── Utilidad para el panel de la demo ───────────────────────────── */
export function resetDemo(){
    safe.del(STORE_KEY);
    safe.del(AUTH_KEY);
}

export {
    app, db, auth,
    collection, addDoc, updateDoc, doc, setDoc, deleteDoc,
    onSnapshot, getDocs, query, where, writeBatch,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    createAuthUser, updateAuthPassword, deleteAuthUser
};
