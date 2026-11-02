import { db, collection, doc, setDoc, getDocs, query, where, writeBatch } from '../config/firebase.config.js';
import { SETTINGS } from '../config/constants.js';
import { isAdmin } from '../rules/access-rules.js';
import { firstOfMonth } from '../utils/date-utils.js';

export async function runMonthlyCleanupIfNeeded(){
    if(!isAdmin()) return;
    const firstToday = firstOfMonth();

    const snap = await getDocs(collection(db, SETTINGS.col));
    const current = snap.docs.find(d => d.id === SETTINGS.id)?.data() || {};
    if(current.lastCleanup === firstToday) return;

    const q1 = query(collection(db, "reservations"), where("date", "<", firstToday));
    const resSnap = await getDocs(q1);
    const docs = resSnap.docs;

    for(let i = 0; i < docs.length; i += 400){
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
    }
    await setDoc(doc(db, SETTINGS.col, SETTINGS.id), { lastCleanup: firstToday }, { merge: true });
    if(docs.length) console.info(`[Descuke] Limpieza mensual: ${docs.length} reservas eliminadas (< ${firstToday}).`);
}
