import { db, collection, addDoc, updateDoc, doc, query, where, getDocs } from '../config/firebase.config.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { canCloseAccount, canApplyPromoUniversitaria } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';

export async function getActiveCuentaForTable(tableId, date) {
    const snap = await getDocs(query(
        collection(db, 'cuentas'),
        where('tableId', '==', tableId),
        where('date',    '==', date),
        where('status',  '==', 'open')
    ));
    if (snap.empty) return null;
    return { fb_id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function openAccount(tableId, rsv) {
    const existing = await getActiveCuentaForTable(tableId, rsv.date);
    if (existing) return { ok: false, error: 'Ya existe una cuenta abierta para esta mesa', cuenta: existing };

    const ref = await addDoc(collection(db, 'cuentas'), {
        id:              Date.now().toString(),
        tableId,
        date:            rsv.date,
        reservationId:   rsv.id,
        reservationFbId: rsv.fb_id,
        meseroId:        ST.user.id,
        meseroName:      ST.user.name,
        rpId:            rsv.rpId,
        rpName:          rsv.rpName,
        clientName:      rsv.name,
        promo:           rsv.promo || '',
        persons:         rsv.persons || 0,
        status:          'open',
        openedAt:        new Date().toISOString(),
        closedAt:        null,
        totalConsumo:    0
    });
    return { ok: true, fb_id: ref.id };
}

export async function closeAccount(cuentaId) {
    const cuenta = DB._cuentas.find(c => c.id === cuentaId);
    if (!cuenta)                  throw new Error('Cuenta no encontrada');
    if (!canCloseAccount(cuenta)) throw new Error('Sin permisos para cerrar esta cuenta');
    if (cuenta.status !== 'open') throw new Error('La cuenta ya está cerrada');

    const totalConsumo = DB._comandas
        .filter(c => c.cuentaId === cuentaId)
        .reduce((sum, c) => sum + c.subtotal, 0);

    await updateDoc(doc(db, 'cuentas', cuenta.fb_id), {
        status:       'closed',
        closedAt:     new Date().toISOString(),
        totalConsumo
    });
}

export async function aplicarPromoUniversitaria(cuentaId) {
    if (!canApplyPromoUniversitaria()) { toast('Sin permisos'); return; }

    const cuenta = DB._cuentas.find(c => c.id === cuentaId);
    if (!cuenta) { toast('Cuenta no encontrada'); return; }
    if (cuenta.status !== 'open') { toast('La cuenta ya está cerrada'); return; }
    if (cuenta.universitariaPromo?.applied) { toast('La promoción ya fue aplicada'); return; }

    if (!confirm('¿Aplicar Fusión Universitaria?\nSe registrará que se validaron 5 credenciales universitarias vigentes.')) return;

    try {
        await updateDoc(doc(db, 'cuentas', cuenta.fb_id), {
            universitariaPromo: {
                applied:             true,
                appliedBy:           ST.user.id,
                appliedByName:       ST.user.name,
                appliedAt:           new Date().toISOString(),
                credencialesValidadas: 5
            }
        });
        toast('Fusión Universitaria aplicada');
    } catch (e) {
        toast(e.message || 'Error al aplicar la promoción');
        console.error('[Descuke]', e);
    }
}
