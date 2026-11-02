import { ST } from '../state/app-state.js';
import { PROMO_LABEL } from '../config/constants.js';
import { isAdmin, canDeleteReservation, canManageArrival } from '../rules/access-rules.js';
import { showModal } from '../ui/modal.js';
import { bdaySubQuestionHTML, wireBdayUI } from '../ui/bday-form.js';

export function showReserveModal(tid, ttype, date){
    const typeLabel = ttype === 'vip' ? 'VIP' : 'Periquera';
    showModal(`
<h3>Nueva Reserva</h3>
<div class="m-table-info">
  <span class="m-table-badge">Mesa ${tid}</span>
  <span style="font-size:13px;color:var(--text2)">${typeLabel} · ${date}</span>
</div>
<input id="m-name" type="text" placeholder="Nombre de la reserva" autofocus>
<input id="m-persons" type="number" min="1" max="60" placeholder="Número de personas">
<div class="promo-selector">
  <label style="font-size:12px;color:var(--text2);margin-bottom:6px;display:block">Promoción</label>
  <div class="promo-opts">
    <label class="promo-opt" data-val="">
      <input type="radio" name="m-promo" value="" checked>
      <span>Sin promoción</span>
    </label>
    <label class="promo-opt" data-val="cumpleanos">
      <input type="radio" name="m-promo" value="cumpleanos">
      <span>🎉 Cumpleaños</span>
    </label>
    <label class="promo-opt" data-val="barrelibre">
      <input type="radio" name="m-promo" value="barrelibre">
      <span>Barra Libre</span>
    </label>
  </div>
</div>
${bdaySubQuestionHTML(true, '')}
<p class="minfo">RP: <b>${ST.user.name}</b></p>
${isAdmin()?`<input id="m-rpname" type="text" value="${ST.user.name}" placeholder="Nombre del RP" style="margin-top:4px">`:''}
<button onclick="saveRes('${tid}','${ttype}','${date}')">Confirmar Reserva</button>
${isAdmin()?`<button class="btn-ghost" onclick="adminBlockTable('${tid}','${date}')" style="margin-top:6px">🔒 Bloquear esta mesa (admin)</button>`:''}`);;
    wireBdayUI();
}

export function showInfoModal(rsv, tid){
    const u = ST.user;
    const canEdit   = isAdmin(u) || rsv.rpId === u.id;
    const canDelete = canDeleteReservation(u);
    const sl = { reserved: 'Reservada', confirmed: 'Confirmada', nollegó: 'No llegó' };
    const promo = rsv.promo || '';
    showModal(`
<h3>Mesa ${tid}</h3>
<div class="m-table-info">
  <span class="m-table-badge">${rsv.name}</span>
  <span style="font-size:13px;color:var(--text2)">${sl[rsv.status||'reserved']}</span>
</div>
<p><b>Personas:</b> ${rsv.persons}</p>
<p><b>Fecha:</b> ${rsv.date}</p>
<p><b>RP:</b> ${rsv.rpName}</p>
${promo?`<p><b>Promoción:</b> ${PROMO_LABEL[promo]}</p>`:''}
${promo==='cumpleanos' && rsv.nombreCumpleanero && rsv.nombreCumpleanero!==rsv.name?`<p><b>Cumpleañero:</b> ${rsv.nombreCumpleanero}</p>`:''}
<div class="m-actions">
  ${canManageArrival(u)?`
    <button class="btn-xs green" onclick="setArrival('${rsv.id}','confirmed');closeModal();redrawSVG()">Llegó</button>
    <button class="btn-xs red" onclick="setArrival('${rsv.id}','nollegó');closeModal();redrawSVG()">No llegó</button>`:''}
  ${canEdit?`<button class="btn-xs purple" onclick="closeModal();openEdit('${rsv.id}')">Editar</button>`:''}
  <button class="btn-xs share" onclick="closeModal();handleCompartirReserva('${rsv.id}')">
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      style="display:inline-block;vertical-align:-1px;margin-right:3px">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>Compartir
  </button>
  ${canEdit && canDelete?`<button class="btn-xs gray" onclick="delRes('${rsv.id}');closeModal();redrawSVG()">Eliminar</button>`:''}
</div>`);
}
