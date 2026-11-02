export function initialsOf(name){
    return (name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join('') || '?';
}
