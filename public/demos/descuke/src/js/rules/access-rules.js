import { ROLES, LIMIT_HOUR, LIMIT_MIN, TIPO_PRODUCTO } from '../config/constants.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';

export function isAdmin(u = ST.user)  { return !!u && u.role === ROLES.ADMIN; }
export function isRP(u = ST.user)     { return !!u && u.role === ROLES.RP; }
export function isMesero(u = ST.user) { return !!u && u.role === ROLES.MESERO; }
export function isHostess(u = ST.user){ return !!u && !!u.isHostess; }
export function canManageArrival(u = ST.user){ return isAdmin(u) || isHostess(u); }

export function canOpenAccount(u = ST.user){ return isMesero(u) || isAdmin(u); }

export const ACTIVE_RESERVATION_STATUSES = new Set(['reserved', 'confirmed']);

export function isReservationActive(rsv) {
    return ACTIVE_RESERVATION_STATUSES.has(rsv?.status || 'reserved');
}

export function canCloseAccount(cuenta, u = ST.user){
    return isAdmin(u) || (isMesero(u) && cuenta.meseroId === u.id);
}

export function canViewAllAccounts(u = ST.user){ return isAdmin(u); }

export function canApplyPromoUniversitaria(u = ST.user){ return isMesero(u) || isAdmin(u); }

export function tableAllowed(tid, date){
    const day = new Date(date + 'T12:00:00').getDay();
    if(tid === '61' && (day === 5 || day === 6)) return false;
    if(tid === '20' && [0,3,4,5,6].includes(day)) return false;
    return true;
}

export function isTableBlocked(tid, date){ return DB.getBlocked(date).includes(tid); }
export function isTableUsable(tid, date){ return tableAllowed(tid, date) && !isTableBlocked(tid, date); }

export function pastLimit(){
    const n = new Date();
    return n.getHours() > LIMIT_HOUR || (n.getHours() === LIMIT_HOUR && n.getMinutes() >= LIMIT_MIN);
}
export function canReserveNow(user = ST.user){ return isAdmin(user) || !pastLimit(); }

export function getTableStatus(tid, date){
    const found = DB.getRByDate(date).find(r => r.tableId === tid);
    if(!found) return { status: 'available', rsv: null };
    return { status: found.status || 'reserved', rsv: found };
}

export function canDeleteReservation(u = ST.user){ return isAdmin(u); }

export const RP_EDITABLE_FIELDS = ['promo', 'nombreCumpleanero'];

export function canEditAllReservationFields(u = ST.user){ return isAdmin(u); }

export function canRegisterBarraLibre(u = ST.user){ return isAdmin(u); }

export function canAddComanda(u = ST.user){ return isMesero(u) || isAdmin(u); }

export function esProductoBarraLibre(producto){ return producto?.tipo_producto === TIPO_PRODUCTO.BARRA_LIBRE; }
