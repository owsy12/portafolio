import { db, collection, addDoc, updateDoc, deleteDoc, doc } from '../config/firebase.config.js';
import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { isAdmin, isTableBlocked, canReserveNow, canDeleteReservation, canEditAllReservationFields, canManageArrival } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';
import { showModal, closeModal } from '../ui/modal.js';
import { bdaySubQuestionHTML, wireBdayUI, readBdayName } from '../ui/bday-form.js';

export async function saveRes(tid, ttype, date){
    const name = $('m-name').value.trim();
    const persons = parseInt($('m-persons').value);
    const promo = document.querySelector('input[name="m-promo"]:checked')?.value || '';
    if(!name || !persons){ toast('Completa todos los campos'); return; }

    if(isTableBlocked(tid, date) && !isAdmin()){ toast('Mesa bloqueada por admin'); return; }
    if(!canReserveNow()){ toast('Límite de reservas: 9:30 PM'); return; }
    if(DB.getRByDate(date).find(r => r.tableId === tid)){ toast('Mesa ya reservada'); return; }

    const nombreCumpleanero = promo === 'cumpleanos' ? (readBdayName(name) || name) : '';

    await addDoc(collection(db, "reservations"), {
        id: Date.now().toString(),
        tableId: tid, tableType: ttype, date, name, persons, promo,
        nombreCumpleanero,
        rpId: ST.user.id,
        rpName: isAdmin() ? ($('m-rpname')?.value.trim() || ST.user.name) : ST.user.name,
        status: 'reserved'
    });

    closeModal();
    toast('Reserva creada');
}

export function openEdit(id){
    const r = DB.getR().find(x => x.id === id);
    if(!r) return;
    const promo = r.promo || '';
    const nombreCumpleanero = r.nombreCumpleanero || '';
    const bdaySame = !nombreCumpleanero || nombreCumpleanero === r.name;
    const fullEdit = canEditAllReservationFields();

    showModal(`
<h3>Editar Reserva</h3>
<p class="minfo">Mesa <b>${r.tableId}</b> · ${r.date}</p>
${fullEdit
    ? `<input id="m-name" type="text" value="${r.name}" placeholder="Nombre">
<input id="m-persons" type="number" value="${r.persons}" min="1" placeholder="Personas">`
    : `<div class="m-readonly-field"><span class="m-readonly-label">Nombre</span><span class="m-readonly-value">${r.name}</span></div>
<div class="m-readonly-field"><span class="m-readonly-label">Personas</span><span class="m-readonly-value">${r.persons}</span></div>`
}
${fullEdit?`<input id="m-rpname" type="text" value="${r.rpName||''}" placeholder="Nombre del RP" style="margin-top:4px">`:''}
<div class="promo-selector">
  <label style="font-size:12px;color:var(--text2);margin-bottom:6px;display:block">Promoción</label>
  <div class="promo-opts">
    <label class="promo-opt"><input type="radio" name="m-promo" value="" ${promo===''?'checked':''}><span>Sin promoción</span></label>
    <label class="promo-opt"><input type="radio" name="m-promo" value="cumpleanos" ${promo==='cumpleanos'?'checked':''}><span>🎉 Cumpleaños</span></label>
    <label class="promo-opt"><input type="radio" name="m-promo" value="barrelibre" ${promo==='barrelibre'?'checked':''}><span>Barra Libre</span></label>
  </div>
</div>
${bdaySubQuestionHTML(bdaySame, bdaySame ? '' : nombreCumpleanero)}
<button onclick="saveEdit('${id}')">Guardar cambios</button>`);
    wireBdayUI();
}

export async function saveEdit(id){
    const promo = document.querySelector('input[name="m-promo"]:checked')?.value || '';
    const r = DB.getR().find(x => x.id === id);
    if(!r) return;

    let updateData;

    if(canEditAllReservationFields()){
        const name = $('m-name').value.trim();
        const persons = parseInt($('m-persons').value);
        if(!name || !persons) return;
        const nombreCumpleanero = promo === 'cumpleanos' ? (readBdayName(name) || name) : '';
        updateData = { name, persons, promo, nombreCumpleanero };
        const rpName = $('m-rpname')?.value.trim();
        if(rpName) updateData.rpName = rpName;
    } else {
        const nombreCumpleanero = promo === 'cumpleanos' ? (readBdayName(r.name) || r.name) : '';
        updateData = { promo, nombreCumpleanero };
    }

    await updateDoc(doc(db, "reservations", r.fb_id), updateData);
    closeModal();
    toast('Reserva actualizada');
}

export async function delRes(id){
    if(!canDeleteReservation()){ toast('Solo el administrador puede eliminar reservas'); return; }
    if(!confirm('¿Eliminar esta reserva?')) return;
    const r = DB.getR().find(x => x.id === id);
    if(r) await deleteDoc(doc(db, "reservations", r.fb_id));
    toast('Reserva eliminada');
}

export async function setArrival(id, status){
    if(!canManageArrival()){ toast('Sin permisos para gestionar llegadas'); return; }
    const r = DB.getR().find(x => x.id === id);
    if(r) await updateDoc(doc(db, "reservations", r.fb_id), { status });
    toast(status === 'confirmed' ? 'Confirmada llegada' : 'Marcado como no llegó');
}
