import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { escapeHtml } from '../utils/html-utils.js';
import { addComanda } from '../services/comandas-service.js';
import { closeAccount } from '../services/cuentas-service.js';
import { isAdmin, canApplyPromoUniversitaria } from '../rules/access-rules.js';
import {
    recalcularCarrito,
    barraLibreGeneraComision,
    getPrecioBase,
    promoLabel,
    esViernes,
    esPostMedianoche,
} from '../services/promociones-service.js';
import { TIPO_PRODUCTO } from '../config/constants.js';
import { toast } from '../ui/toast.js';

let _cuentaId  = null;
let _carrito   = [];
let _catFilter = 'todas';
let _search    = '';

export function openCuenta(cuentaId) {
    _cuentaId  = cuentaId;
    _carrito   = [];
    _catFilter = 'todas';
    _search    = '';
    ST.view    = 'cuenta';
    const m    = $('main');
    if (m) renderCuentaView(m);
}

export function renderCuentaView(m) {
    if (!_cuentaId) return;

    const cuenta = DB._cuentas.find(c => c.id === _cuentaId);
    if (!cuenta) { toast('Cuenta no encontrada'); return; }

    const comandas = DB._comandas
        .filter(c => c.cuentaId === _cuentaId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const totalAcumulado = comandas.reduce((s, c) => s + (c.subtotal || 0), 0);
    const isClosed       = cuenta.status === 'closed';

    const promoReserva = cuenta.promo || '';
    const promoCumple  = promoReserva === 'cumpleanos';
    const promoUniv    = cuenta.universitariaPromo?.applied === true || promoReserva === 'universitaria';

    m.innerHTML = `
<div class="dash">

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn-ghost" onclick="renderMeseroView()" style="padding:6px 12px;font-size:12px">
      ← Mi Turno
    </button>
    <div style="flex:1;min-width:0">
      <h2 style="margin:0;font-size:20px">Mesa #${escapeHtml(cuenta.tableId)}</h2>
      <p style="margin:2px 0 0;font-size:13px;color:var(--text2)">
        ${escapeHtml(cuenta.clientName)} · RP: ${escapeHtml(cuenta.rpName)}
      </p>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="font-size:22px;font-weight:700;color:var(--purple-bright,#c4b5fd)">
        $${totalAcumulado.toLocaleString('es-MX')}
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:1px">Total acumulado</div>
    </div>
  </div>

  ${promoCumple ? `
  <div class="promo-activa-banner">
    🎉 Cumpleaños — Primera botella con <b>50% de descuento</b> · Sin comisión para RP
  </div>` : ''}

  ${promoUniv ? `
  <div class="promo-activa-banner" style="background:rgba(124,58,237,.08);border-color:rgba(124,58,237,.25)">
    🎓 Fusión Universitaria — Primera botella con <b>50% de descuento</b> · Sin comisión para RP
    ${cuenta.universitariaPromo?.appliedByName
        ? `<br><span style="font-size:11px;opacity:.7">Aplicada por ${escapeHtml(cuenta.universitariaPromo.appliedByName)}</span>`
        : ''}
  </div>` : ''}

  ${comandas.length ? `
  <h3 class="mesero-section-title">Comandas registradas</h3>
  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
    ${comandas.map(c => _comandaCard(c)).join('')}
  </div>` : `
  <div class="empty-state" style="padding:28px 0;margin-bottom:16px">
    <div class="empty-icon">—</div>
    <p>Sin consumo registrado aún.</p>
  </div>`}

  ${!isClosed ? `
  <div class="add-rp-card">
    <h3>Nueva Comanda</h3>

    <input id="cat-search" type="text" placeholder="Buscar producto…"
           value="${escapeHtml(_search)}"
           oninput="setCatalogSearch(this.value)"
           style="margin-bottom:10px">

    <div class="cat-chips-row" id="cat-chips">
      ${_buildChipsHTML()}
    </div>

    <div id="catalogo-wrap" style="margin-bottom:12px">
      ${_buildCatalogoHTML(cuenta)}
    </div>

    <div id="carrito-wrap">
      ${_buildCarritoHTML(cuenta)}
    </div>

    <div id="comanda-msg" class="msg" style="margin-top:6px"></div>
  </div>

  ${isAdmin() ? `
  <div class="add-rp-card" style="margin-top:12px;border-color:rgba(124,58,237,.3)">
    <h3 style="color:var(--purple-bright,#c4b5fd)">Registrar Barra Libre <span style="font-size:11px;font-weight:400;color:var(--text3)">(solo admin)</span></h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:10px">
      Genera comisión al RP si asistieron <b>5 o más personas</b>.
    </p>
    <div class="mesa-input-row">
      <input id="bl-personas" type="number" min="1" placeholder="Personas que consumieron" style="margin:0">
      <button class="btn-buscar" onclick="registrarBarraLibre('${escapeHtml(cuenta.id)}')">Registrar</button>
    </div>
    <div id="bl-msg" class="msg" style="margin-top:6px"></div>
  </div>` : ''}

  ${canApplyPromoUniversitaria() && !cuenta.universitariaPromo?.applied ? `
  <div class="add-rp-card" style="margin-top:12px;border-color:rgba(124,58,237,.25)">
    <h3 style="color:var(--purple-bright,#c4b5fd)">🎓 Fusión Universitaria</h3>
    ${esPostMedianoche() ? `
    <p style="font-size:13px;color:var(--text3);margin-bottom:10px">
      La Fusión Universitaria solo puede aplicarse hasta las 12:00 AM.
    </p>
    <button disabled
      style="width:100%;padding:12px;background:rgba(124,58,237,.05);color:var(--text3);
             border:1px solid rgba(124,58,237,.15);border-radius:12px;font-size:14px;
             font-weight:600;font-family:inherit;cursor:not-allowed;opacity:.5">
      Aplicar Fusión Universitaria
    </button>` : `
    <p style="font-size:13px;color:var(--text2);margin-bottom:10px">
      Primera botella con <b>50% de descuento</b>. Requiere 5 credenciales universitarias vigentes.
    </p>
    <button onclick="aplicarPromoUniversitaria('${escapeHtml(cuenta.id)}')"
      style="width:100%;padding:12px;background:rgba(124,58,237,.12);
             color:var(--purple-bright,#c4b5fd);border:1px solid rgba(124,58,237,.3);
             border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;
             font-family:inherit;transition:background .18s">
      Aplicar Fusión Universitaria
    </button>`}
  </div>` : ''}

  <button
    onclick="cerrarCuentaConfirm('${escapeHtml(cuenta.id)}')"
    style="width:100%;margin-top:16px;padding:13px;background:rgba(239,68,68,.1);
           color:#f87171;border:1px solid rgba(239,68,68,.28);border-radius:12px;
           font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .18s">
    Cerrar Cuenta
  </button>` : `
  <div class="res-card" style="text-align:center;padding:20px">
    <p style="color:var(--text2);font-size:14px;margin:0">
      Cuenta cerrada · Total:
      <b style="color:var(--text)">$${cuenta.totalConsumo.toLocaleString('es-MX')}</b>
    </p>
  </div>`}

</div>`;
}

function _buildChipsHTML() {
    const cats = DB._categorias.filter(c => {
        const tieneProds = DB._productos.some(p =>
            p.categoria_id === c.id &&
            p.activo !== false &&
            (isAdmin() || p.tipo_producto !== TIPO_PRODUCTO.BARRA_LIBRE)
        );
        return tieneProds;
    });

    return [{ id: 'todas', nombre: 'Todas' }, ...cats].map(c =>
        `<button class="cat-chip${_catFilter === c.id ? ' active' : ''}"
                 onclick="setCatFilter('${escapeHtml(c.id)}')">
           ${escapeHtml(c.nombre)}
         </button>`
    ).join('');
}

function _buildCatalogoHTML(cuenta) {
    if (!DB._productos.length) {
        return `<div class="cat-empty">
          <p>No hay productos en el catálogo.</p>
          ${isAdmin() ? '<p style="font-size:12px">Ve a <b>Equipo RP</b> y haz clic en <b>Sembrar Catálogo</b>.</p>' : '<p style="font-size:12px">Pide al administrador que siembre el catálogo.</p>'}
        </div>`;
    }

    let prods = DB._productos.filter(p => p.activo !== false);

    if (!isAdmin()) prods = prods.filter(p => p.tipo_producto !== TIPO_PRODUCTO.BARRA_LIBRE);

    if (_catFilter !== 'todas') prods = prods.filter(p => p.categoria_id === _catFilter);

    if (_search) {
        const q = _search.toLowerCase();
        prods = prods.filter(p => p.nombre.toLowerCase().includes(q));
    }

    if (!prods.length) {
        return `<div class="cat-empty"><p>Sin productos para esta búsqueda.</p></div>`;
    }

    return `<div class="cat-grid">
      ${prods.map(p => {
          const precio       = getPrecioBase(p);
          const tienePromoV  = p.promoViernes && esViernes();
          const esGratis     = precio === 0;
          return `<div class="cat-producto" onclick="agregarAlCarrito('${escapeHtml(p.id)}')">
            <div class="cat-prod-nombre">${escapeHtml(p.nombre)}</div>
            ${tienePromoV ? `<div class="cat-prod-precio-orig">$${p.precio_base.toLocaleString('es-MX')}</div>` : ''}
            <div class="cat-prod-precio${tienePromoV ? ' promo' : ''}">
              ${esGratis ? '<span style="color:var(--text3);font-size:11px">Precio no configurado</span>' : `$${precio.toLocaleString('es-MX')}`}
            </div>
            ${tienePromoV ? '<div class="cat-promo-badge">Promo Viernes</div>' : ''}
            <div class="cat-prod-add">+</div>
          </div>`;
      }).join('')}
    </div>`;
}

function _buildCarritoHTML(cuenta) {
    if (!_carrito.length) {
        return `<div class="carrito-vacio">Carrito vacío — selecciona productos arriba.</div>`;
    }

    const total = _carrito.reduce((s, ci) => s + ci.subtotal, 0);

    return `
    <div class="carrito-wrap-inner">
      <h4 style="margin:0 0 10px;font-size:14px;color:var(--text2)">Carrito</h4>
      <div class="carrito-tabla">
        <div class="carrito-thead">
          <span style="flex:1">Producto</span>
          <span style="width:88px;text-align:center">Cant.</span>
          <span style="width:72px;text-align:right">Precio</span>
          <span style="width:80px;text-align:right">Subtotal</span>
          <span style="width:24px"></span>
        </div>
        ${_carrito.map((ci, i) => {
            const tieneDescuento = ci.descuentoAplicado > 0;
            const tienePromoV    = ci.promocionAplicada === 'viernes_bacardi';
            return `<div class="carrito-row">
              <div class="carrito-nombre" style="flex:1;min-width:0">
                <span>${escapeHtml(ci.producto.nombre)}</span>
                ${tieneDescuento || tienePromoV
                    ? `<span class="promo-badge-item">${promoLabel(ci.promocionAplicada)}</span>`
                    : ''}
              </div>
              <div class="carrito-qty">
                <button class="btn-xs gray" onclick="cambiarCantidad(${i},-1)" style="padding:2px 8px">−</button>
                <span style="min-width:18px;text-align:center;font-size:13px">${ci.cantidad}</span>
                <button class="btn-xs gray" onclick="cambiarCantidad(${i},1)" style="padding:2px 8px">+</button>
              </div>
              <div style="width:72px;text-align:right;font-size:13px">
                ${tieneDescuento
                    ? `<s style="color:var(--text3);font-size:11px">$${ci.precioOriginal.toLocaleString('es-MX')}</s><br>`
                    : ''}
                $${ci.precio.toLocaleString('es-MX')}
              </div>
              <div style="width:80px;text-align:right;font-size:13px;font-weight:600;color:var(--purple-bright,#c4b5fd)">
                $${ci.subtotal.toLocaleString('es-MX')}
              </div>
              <button class="btn-xs gray" onclick="quitarDelCarrito(${i})" style="padding:2px 6px;width:24px">✕</button>
            </div>`;
        }).join('')}
      </div>
      <div class="carrito-total-row">
        <span>Total comanda</span>
        <span style="font-size:20px;font-weight:700;color:var(--purple-bright,#c4b5fd)">
          $${total.toLocaleString('es-MX')}
        </span>
      </div>
      <button onclick="guardarComanda('${_cuentaId}')" style="margin-top:12px">Guardar Comanda</button>
    </div>`;
}

function _comandaCard(c) {
    const hora   = new Date(c.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const esBL   = !!c.esBarraLibre;
    const comisionTag = esBL
        ? (c.generaComisionRP
            ? '<span class="promo-badge-item" style="background:rgba(16,185,129,.15);color:#34d399">Comisión RP ✓</span>'
            : '<span class="promo-badge-item" style="background:rgba(100,116,139,.12);color:var(--text3)">Sin comisión</span>')
        : '';

    return `<div class="res-card${esBL ? ' bl-card' : ''}">
  <div class="rc-top">
    <span style="font-size:12px;color:var(--text3)">${hora}</span>
    <span style="flex:1"></span>
    ${esBL ? '<span class="rc-promo promo-barrelibre" style="margin-right:6px">Barra Libre</span>' : ''}
    ${comisionTag}
    <span style="font-weight:600;color:var(--purple-bright,#c4b5fd);margin-left:6px">
      $${(c.subtotal || 0).toLocaleString('es-MX')}
    </span>
  </div>
  <ul style="margin:8px 0 0;padding:0 0 0 4px;list-style:none;display:flex;flex-direction:column;gap:5px">
    ${c.items.map(i => {
        const tieneDesc = (i.descuentoAplicado || 0) > 0;
        return `<li style="display:flex;align-items:baseline;gap:6px;font-size:13px">
      <span style="color:var(--purple-bright,#c4b5fd);font-weight:600;min-width:22px">${i.cantidad}x</span>
      <span style="flex:1;color:var(--text)">${escapeHtml(i.nombre)}</span>
      ${i.observaciones ? `<span style="color:var(--text3);font-style:italic;font-size:12px">(${escapeHtml(i.observaciones)})</span>` : ''}
      ${tieneDesc ? `<span class="promo-badge-item" style="font-size:10px">−${i.descuentoAplicado}%</span>` : ''}
      <span style="color:var(--text2);font-size:12px">$${(i.subtotal || 0).toLocaleString('es-MX')}</span>
    </li>`;
    }).join('')}
  </ul>
</div>`;
}

export function setCatFilter(catId) {
    _catFilter = catId;
    const chips = $('cat-chips');
    if (chips) chips.innerHTML = _buildChipsHTML();
    _renderCatalogo();
}

export function setCatalogSearch(text) {
    _search = text;
    _renderCatalogo();
}

export function agregarAlCarrito(productoId) {
    const producto = DB._productos.find(p => p.id === productoId);
    if (!producto) return;

    const cuenta = DB._cuentas.find(c => c.id === _cuentaId);
    if (!cuenta) return;

    const existente = _carrito.find(ci => ci.producto.id === productoId);
    if (existente) {
        existente.cantidad++;
    } else {
        _carrito.push({
            producto,
            cantidad:          1,
            precio:            getPrecioBase(producto),
            precioOriginal:    producto.precio_base,
            descuentoAplicado: 0,
            subtotal:          getPrecioBase(producto),
            generaComisionRP:  true,
            esPrivilegioPromo: false,
            promocionAplicada: producto.promoViernes && esViernes() ? 'viernes_bacardi' : '',
            observaciones:     '',
        });
    }

    recalcularCarrito(_carrito, cuenta);
    _renderCarrito(cuenta);
}

export function cambiarCantidad(index, delta) {
    if (!_carrito[index]) return;
    const cuenta = DB._cuentas.find(c => c.id === _cuentaId);
    if (!cuenta) return;

    _carrito[index].cantidad += delta;
    if (_carrito[index].cantidad <= 0) {
        _carrito.splice(index, 1);
    }

    recalcularCarrito(_carrito, cuenta);
    _renderCarrito(cuenta);
}

export function quitarDelCarrito(index) {
    const cuenta = DB._cuentas.find(c => c.id === _cuentaId);
    _carrito.splice(index, 1);
    if (cuenta) recalcularCarrito(_carrito, cuenta);
    _renderCarrito(cuenta);
}

export async function guardarComanda(cuentaId) {
    const cuenta = DB._cuentas.find(c => c.id === cuentaId);
    if (!cuenta) { toast('Cuenta no encontrada'); return; }

    if (!_carrito.length) {
        const msg = $('comanda-msg');
        if (msg) msg.textContent = 'El carrito está vacío';
        return;
    }

    const msg = $('comanda-msg');
    if (msg) msg.textContent = 'Guardando…';

    const items = _carrito.map(ci => ({
        productoId:        ci.producto.id,
        nombre:            ci.producto.nombre,
        categoria_id:      ci.producto.categoria_id || '',
        tipo_producto:     ci.producto.tipo_producto || '',
        cantidad:          ci.cantidad,
        precioOriginal:    ci.precioOriginal,
        precio:            ci.precio,
        descuentoAplicado: ci.descuentoAplicado,
        subtotal:          ci.subtotal,
        generaComisionRP:  ci.generaComisionRP,
        esPrivilegioPromo: ci.esPrivilegioPromo,
        promocionAplicada: ci.promocionAplicada,
        observaciones:     ci.observaciones || '',
    }));

    try {
        await addComanda(cuenta, items);
        _carrito = [];
        if (msg) msg.textContent = '';
        toast('Comanda guardada');
    } catch (e) {
        if (msg) msg.textContent = 'Error al guardar. Intenta de nuevo.';
        console.error('[Descuke]', e);
    }
}

export async function registrarBarraLibre(cuentaId) {
    if (!isAdmin()) { toast('Sin permisos'); return; }

    const cuenta = DB._cuentas.find(c => c.id === cuentaId);
    if (!cuenta) { toast('Cuenta no encontrada'); return; }

    const input = $('bl-personas');
    const msg   = $('bl-msg');
    if (!input) return;

    const personas = parseInt(input.value) || 0;
    if (personas < 1) {
        if (msg) msg.textContent = 'Ingresa el número de personas';
        return;
    }

    const blProducto  = DB._productos.find(p => p.tipo_producto === TIPO_PRODUCTO.BARRA_LIBRE);
    const precio      = blProducto?.precio_base || 0;
    const generaComis = barraLibreGeneraComision(personas);

    const items = [{
        productoId:        blProducto?.id || 'barra-libre',
        nombre:            'Barra Libre',
        categoria_id:      'cat-especiales',
        tipo_producto:     TIPO_PRODUCTO.BARRA_LIBRE,
        cantidad:          personas,
        precioOriginal:    precio,
        precio,
        descuentoAplicado: 0,
        subtotal:          precio * personas,
        generaComisionRP:  generaComis,
        esPrivilegioPromo: false,
        promocionAplicada: '',
        observaciones:     `${personas} persona${personas !== 1 ? 's' : ''}`,
    }];

    if (msg) msg.textContent = 'Registrando…';

    try {
        await addComanda(cuenta, items, true);
        input.value       = '';
        if (msg) msg.textContent = '';
        toast(generaComis
            ? `Barra Libre registrada — ${personas} personas · Genera comisión al RP`
            : `Barra Libre registrada — ${personas} personas · Sin comisión (< 5)`
        );
    } catch (e) {
        if (msg) msg.textContent = 'Error al registrar';
        console.error('[Descuke]', e);
    }
}

export async function cerrarCuentaConfirm(cuentaId) {
    if (!confirm('¿Cerrar esta cuenta? Ya no se podrán agregar más productos.')) return;
    try {
        await closeAccount(cuentaId);
        toast('Cuenta cerrada');
        window.renderMeseroView();
    } catch (e) {
        toast(e.message || 'Error al cerrar la cuenta');
        console.error('[Descuke]', e);
    }
}

function _renderCatalogo() {
    const cuenta = DB._cuentas.find(c => c.id === _cuentaId);
    const wrap   = $('catalogo-wrap');
    if (wrap && cuenta) wrap.innerHTML = _buildCatalogoHTML(cuenta);
}

function _renderCarrito(cuenta) {
    const wrap = $('carrito-wrap');
    if (wrap && cuenta) wrap.innerHTML = _buildCarritoHTML(cuenta);
}
