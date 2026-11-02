export const ST = {
    user: null,
    view: 'dashboard',
    filters: { q: '', type: 'all', status: 'all' },
    statsWeek: null,
    rankingMode: 'reservas',
    today: () => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
};
