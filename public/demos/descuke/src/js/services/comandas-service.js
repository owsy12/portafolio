import { db, collection, addDoc } from '../config/firebase.config.js';
import { ST } from '../state/app-state.js';

export async function addComanda(cuenta, items, esBarraLibre = false) {
    if (!items || items.length === 0) throw new Error('Sin items');

    const subtotal         = items.reduce((s, i) => s + (i.subtotal || 0), 0);
    const generaComisionRP = items.some(i => i.generaComisionRP);

    await addDoc(collection(db, 'comandas'), {
        id:             Date.now().toString(),
        cuentaId:       cuenta.id,
        cuentaFbId:     cuenta.fb_id,
        tableId:        cuenta.tableId,
        date:           cuenta.date,
        meseroId:       ST.user.id,
        items,
        subtotal,
        generaComisionRP,
        esBarraLibre,
        timestamp:      new Date().toISOString()
    });
}
