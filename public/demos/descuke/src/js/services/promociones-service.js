import { DB } from '../data/database.js';
import { TIPO_PRODUCTO, BARRA_LIBRE_MIN_PERSONAS } from '../config/constants.js';

export function esViernes() { return new Date().getDay() === 5; }

export function esDiaBarraLibre() {
    const d = new Date().getDay();
    return d === 3 || d === 0;
}

export function esPostMedianoche() {
    return new Date().getHours() < 6;
}

export function getPrecioBase(producto) {
    if (producto.promoViernes && esViernes()) return producto.promoViernes;
    return producto.precio_base;
}

function yaUsoPrimeraBotella(cuentaId) {
    return DB._comandas
        .filter(c => c.cuentaId === cuentaId)
        .flatMap(c => c.items)
        .some(i => i.esPrivilegioPromo);
}

export function recalcularCarrito(carrito, cuenta) {
    carrito.forEach(ci => {
        const base = getPrecioBase(ci.producto);
        ci.precio              = base;
        ci.precioOriginal      = ci.producto.precio_base;
        ci.descuentoAplicado   = 0;
        ci.generaComisionRP    = true;
        ci.esPrivilegioPromo   = false;
        ci.promocionAplicada   = ci.producto.promoViernes && esViernes() ? 'viernes_bacardi' : '';
    });

    const tienePromoCumple = cuenta.promo === 'cumpleanos';
    const tienePromoUniv   = cuenta.universitariaPromo?.applied === true || cuenta.promo === 'universitaria';

    if ((tienePromoCumple || tienePromoUniv) && !yaUsoPrimeraBotella(cuenta.id)) {
        const primeraBotella = carrito.find(ci => ci.producto.tipo_producto === TIPO_PRODUCTO.BOTELLA);
        if (primeraBotella) {
            const base = getPrecioBase(primeraBotella.producto);
            primeraBotella.precio            = Math.ceil(base / 2);
            primeraBotella.precioOriginal    = base;
            primeraBotella.descuentoAplicado = 50;
            primeraBotella.generaComisionRP  = false;
            primeraBotella.esPrivilegioPromo = true;
            primeraBotella.promocionAplicada = tienePromoCumple
                ? 'cumpleanero_primera_botella'
                : 'universitaria_primera_botella';
        }
    }

    carrito.forEach(ci => { ci.subtotal = ci.precio * ci.cantidad; });

    return carrito;
}

export function barraLibreGeneraComision(personasConsumo) {
    return personasConsumo >= BARRA_LIBRE_MIN_PERSONAS;
}

export function calcularConsumoConComision(cuentaId) {
    return DB._comandas
        .filter(c => c.cuentaId === cuentaId)
        .flatMap(c => c.items)
        .filter(i => i.generaComisionRP)
        .reduce((s, i) => s + (i.subtotal || 0), 0);
}

export function promoLabel(clave) {
    const MAP = {
        viernes_bacardi:               '🎊 Promo Viernes',
        cumpleanero_primera_botella:   '🎉 1ª botella −50%',
        universitaria_primera_botella: '🎓 1ª botella −50%',
    };
    return MAP[clave] || clave;
}
