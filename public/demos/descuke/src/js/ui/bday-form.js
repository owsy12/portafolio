import { $ } from '../utils/dom.js';

export function bdaySubQuestionHTML(isSame, customName){
    const same = isSame !== false;
    return `
<div class="bday-q" id="bday-q">
  <label class="bday-q-label">¿El cumpleañero es el mismo del nombre de la reserva?</label>
  <div class="promo-opts">
    <label class="promo-opt"><input type="radio" name="m-bday-same" value="si" ${same?'checked':''}><span>Sí</span></label>
    <label class="promo-opt"><input type="radio" name="m-bday-same" value="no" ${!same?'checked':''}><span>No</span></label>
  </div>
  <input id="m-bday-name" type="text" placeholder="Nombre del cumpleañero" value="${customName||''}" style="margin-top:8px${same?';display:none':''}">
</div>`;
}

export function wireBdayUI(){
    const syncQ = () => {
        const promo = document.querySelector('input[name="m-promo"]:checked')?.value || '';
        const q = $('bday-q'); if(q) q.style.display = promo === 'cumpleanos' ? 'block' : 'none';
    };
    const syncName = () => {
        const same = document.querySelector('input[name="m-bday-same"]:checked')?.value || 'si';
        const n = $('m-bday-name'); if(n) n.style.display = same === 'no' ? 'block' : 'none';
    };
    document.querySelectorAll('input[name="m-promo"]').forEach(r => r.addEventListener('change', syncQ));
    document.querySelectorAll('input[name="m-bday-same"]').forEach(r => r.addEventListener('change', syncName));
    syncQ(); syncName();
}

export function readBdayName(reservationName){
    const promoVal = document.querySelector('input[name="m-promo"]:checked')?.value || '';
    if(promoVal !== 'cumpleanos') return '';
    const same = document.querySelector('input[name="m-bday-same"]:checked')?.value || 'si';
    if(same === 'si') return reservationName;
    return ($('m-bday-name')?.value.trim()) || reservationName;
}
