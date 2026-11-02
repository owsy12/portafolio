function toLocalISO(d){
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function mondayOf(isoDate){
    const d = new Date(isoDate + 'T12:00:00');
    const dow = d.getDay();
    const diff = (dow === 0 ? -6 : 1 - dow);
    d.setDate(d.getDate() + diff);
    return toLocalISO(d);
}

export function addDaysISO(iso, n){
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return toLocalISO(d);
}

export function fmtWeekLabel(w){
    const fmt = iso => {
        const d = new Date(iso + 'T12:00:00');
        return d.toLocaleDateString('es-MX', { day:'numeric', month:'short' }).replace('.', '');
    };
    return `${fmt(w.start)} – ${fmt(w.end)}`;
}

export function isoWeekNum(isoDate){
    const d = new Date(isoDate + 'T12:00:00');
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function firstOfMonth(date = new Date()){
    return toLocalISO(new Date(date.getFullYear(), date.getMonth(), 1));
}
