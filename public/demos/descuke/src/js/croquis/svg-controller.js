import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { TABLES } from '../data/tables.data.js';
import { tableAllowed, isTableBlocked, isAdmin, getTableStatus, canReserveNow } from '../rules/access-rules.js';
import { buildSVG } from './svg-renderer.js';
import { toast } from '../ui/toast.js';
import { showReserveModal, showInfoModal } from '../modals/reservation-modal.js';
import { showBlockedAdminModal } from '../modals/table-block-modal.js';

export function redrawSVG(){
    const svg = $('floor-svg');
    const d = $('croquis-date')?.value || ST.today();
    if(svg){ svg.innerHTML = buildSVG(d); attachSVG(); }
}

export function attachSVG(){
    document.querySelectorAll('.te').forEach(el => {
        el.addEventListener('click', () => tableClick(el.dataset.id));
    });
}

export function tableClick(tid){
    const date = $('croquis-date')?.value || ST.today();
    if(!tableAllowed(tid, date)){ toast('Mesa ' + tid + ' no disponible este día'); return; }
    if(isTableBlocked(tid, date)){
        if(isAdmin()){ showBlockedAdminModal(tid, date); return; }
        toast('Mesa ' + tid + ' bloqueada por admin'); return;
    }
    const { status, rsv } = getTableStatus(tid, date);
    const tb = TABLES.find(t => t.id === tid);
    if(status === 'available'){
        if(!canReserveNow()){ toast('Límite de reservas: 9:30 PM'); return; }
        showReserveModal(tid, tb.t, date);
    } else {
        showInfoModal(rsv, tid);
    }
}
