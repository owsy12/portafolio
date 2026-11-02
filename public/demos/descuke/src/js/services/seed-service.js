import { db, doc, setDoc } from '../config/firebase.config.js';
import { CATEGORIAS, PRODUCTOS } from '../data/products-catalog.js';
import { isAdmin } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';

export async function sembrarCatalogo() {
    if (!isAdmin()) { toast('Solo el administrador puede sembrar el catálogo'); return; }

    const btn = document.getElementById('btn-sembrar-catalogo');
    if (btn) { btn.disabled = true; btn.textContent = 'Sembrando...'; }

    try {
        const now = new Date().toISOString();

        for (const cat of CATEGORIAS) {
            await setDoc(doc(db, 'categorias', cat.id), {
                ...cat,
                activo:     true,
                created_at: now,
                updated_at: now,
            });
        }

        for (const prod of PRODUCTOS) {
            await setDoc(doc(db, 'productos', prod.id), {
                ...prod,
                activo:     true,
                created_at: now,
                updated_at: now,
            });
        }

        toast(`Catálogo sembrado: ${CATEGORIAS.length} categorías · ${PRODUCTOS.length} productos`);
    } catch (e) {
        toast('Error al sembrar el catálogo');
        console.error('[Descuke] seed-service error:', e);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Sembrar Catálogo'; }
    }
}
