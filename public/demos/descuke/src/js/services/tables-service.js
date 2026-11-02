import { db, doc, setDoc } from '../config/firebase.config.js';
import { SETTINGS } from '../config/constants.js';
import { DB } from '../data/database.js';
import { isAdmin } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';
import { closeModal } from '../ui/modal.js';
import { redrawSVG } from '../croquis/svg-controller.js';

export async function toggleTableBlock(tid, block, date){
    if(!isAdmin()){ toast('Acción no autorizada'); return; }
    const ref = doc(db, SETTINGS.col, SETTINGS.id);
    const currentDay = DB.getBlocked(date);
    const nextDay = block
        ? Array.from(new Set([...currentDay, tid]))
        : currentDay.filter(x => x !== tid);
    await setDoc(ref, { blockedTables: { [date]: nextDay } }, { merge: true });
}

export async function adminBlockTable(tid, date){
    await toggleTableBlock(tid, true, date);
    closeModal();
    redrawSVG();
    toast('Mesa bloqueada para ' + date);
}

export async function unblockTable(tid, date){
    await toggleTableBlock(tid, false, date);
    closeModal();
    redrawSVG();
    toast('Mesa desbloqueada');
}
