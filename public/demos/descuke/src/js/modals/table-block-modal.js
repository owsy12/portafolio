import { isAdmin } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';
import { showModal } from '../ui/modal.js';

export function showBlockedAdminModal(tid, date){
    if(!isAdmin()){ toast('Acción no autorizada'); return; }
    showModal(`
<h3>Mesa ${tid}</h3>
<p class="minfo">Esta mesa está <b>bloqueada</b> el día <b>${date}</b>.</p>
<p>Los RP no podrán reservarla en esta fecha hasta que la desbloquees.</p>
<button onclick="unblockTable('${tid}','${date}')">Desbloquear mesa</button>`);
}
