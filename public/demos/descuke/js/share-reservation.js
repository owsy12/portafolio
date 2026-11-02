const ShareReservation = (() => {
    'use strict';

    /* ── Dimensiones del ticket ──────────────────────────────── */
    const W   = 1080;
    const H   = 1800;
    const PAD = 72;           // padding horizontal general

    /* ── Paleta exacta del design system de Descuke ─────────── */
    const C = {
        bg1:          '#050310',
        bg2:          '#08051a',
        bg3:          '#060110',
        surface:      '#0e0b1e',
        surface2:     '#151129',
        purple:       '#a78bfa',
        purpleBright: '#c4b5fd',
        purpleDeep:   '#7c3aed',
        purpleDim:    '#4c1d95',
        purpleFaint:  'rgba(167,139,250,0.10)',
        purpleBorder: 'rgba(167,139,250,0.28)',
        purpleGlow:   'rgba(167,139,250,0.22)',
        text:         '#f1f0f5',
        text2:        '#9d94b8',
        text3:        '#6a6088',
        border:       '#241d3a',
        white:        '#ffffff',
    };

    /* ── Tipografías (cargadas por Google Fonts en el <head>) ── */
    const F = {
        heading: '"Rajdhani", "Arial Narrow", sans-serif',
        body:    '"DM Sans", Arial, sans-serif',
    };

    /* ── Ruta del logo real ──────────────────────────────────── */
    const LOGO_SRC = null; // MODO DEMOSTRACIÓN: el logo del negocio no se incluye

    /* ── Labels de promoción ─────────────────────────────────── */
    const PROMO_LABEL = {
        cumpleanos: '🎉 Cumpleaños',
        barrelibre: 'Barra Libre',
    };

    /* ═══════════════════════════════════════════════════════════
       HELPERS DE CANVAS
       ═══════════════════════════════════════════════════════════ */

    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload  = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y,     x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x,     y + h, r);
        ctx.arcTo(x,     y + h, x,     y,     r);
        ctx.arcTo(x,     y,     x + w, y,     r);
        ctx.closePath();
    }

    function fadeLine(ctx, y, alpha = 0.35) {
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0,    'transparent');
        g.addColorStop(0.12, `rgba(167,139,250,${alpha})`);
        g.addColorStop(0.88, `rgba(167,139,250,${alpha})`);
        g.addColorStop(1,    'transparent');
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.restore();
    }

    /** Reduce tamaño de fuente hasta que el texto quepa en maxW */
    function fitText(ctx, text, maxW, size, style, font) {
        let s = size;
        ctx.font = `${style} ${s}px ${font}`;
        while (ctx.measureText(text).width > maxW && s > 18) {
            s -= 1;
            ctx.font = `${style} ${s}px ${font}`;
        }
        return s;
    }

    /* ═══════════════════════════════════════════════════════════
       FORMATO DE DATOS
       ═══════════════════════════════════════════════════════════ */

    /**
     * Convierte "YYYY-MM-DD" a fecha legible en español.
     * Usa T12:00:00 para evitar drift de zona horaria (mismo criterio
     * que usa el resto del proyecto en date-utils.js).
     */
    function formatFecha(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T12:00:00');
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-MX', {
            weekday: 'long',
            day:     'numeric',
            month:   'long',
            year:    'numeric',
        });
    }

    function formatFechaCorta(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    /* ═══════════════════════════════════════════════════════════
       GENERADOR DEL TICKET EN CANVAS
       ═══════════════════════════════════════════════════════════ */

    async function generarTicket(r) {
        /* Espera a que las fuentes (Rajdhani, DM Sans) estén listas */
        await document.fonts.ready;

        const canvas  = document.createElement('canvas');
        canvas.width  = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        /* ── 1. FONDO ─────────────────────────────────────────── */
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0,    C.bg1);
        bgGrad.addColorStop(0.45, C.bg2);
        bgGrad.addColorStop(1,    C.bg3);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        /* ── 2. GLOWS AMBIENTALES ─────────────────────────────── */
        const glow = (x, y, rad, color) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
            g.addColorStop(0, color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        };
        glow(W * 0.78, H * 0.12, 700, 'rgba(124,58,237,0.22)');
        glow(W * 0.15, H * 0.58, 600, 'rgba(167,139,250,0.14)');
        glow(W * 0.85, H * 0.82, 450, 'rgba(76,29,149,0.12)');

        /* ── 3. PATRÓN DE PUNTOS (textura sutil) ──────────────── */
        ctx.save();
        ctx.globalAlpha = 0.045;
        ctx.fillStyle   = C.purpleBright;
        const D = 44;
        for (let dx = D / 2; dx < W; dx += D) {
            for (let dy = D / 2; dy < H; dy += D) {
                ctx.beginPath();
                ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        /* ── 4. LÍNEA NEÓN SUPERIOR ───────────────────────────── */
        const neonLine = (y) => {
            const g = ctx.createLinearGradient(0, 0, W, 0);
            g.addColorStop(0,    'transparent');
            g.addColorStop(0.28, C.purpleDeep);
            g.addColorStop(0.55, C.purpleBright);
            g.addColorStop(0.82, C.purpleDeep);
            g.addColorStop(1,    'transparent');
            ctx.save();
            ctx.strokeStyle = g;
            ctx.lineWidth   = 4;
            ctx.shadowColor = C.purple;
            ctx.shadowBlur  = 18;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
            ctx.restore();
        };
        neonLine(4);

        /* ── 5. LOGO ──────────────────────────────────────────── */
        const logo   = LOGO_SRC ? await loadImage(LOGO_SRC) : null;
        const LOGO_Y = 90;

        if (logo) {
            const logoH = 220;
            const logoW = Math.round((logo.naturalWidth / logo.naturalHeight) * logoH);
            const logoX = Math.round((W - logoW) / 2);
            ctx.save();
            ctx.shadowColor = C.purple;
            ctx.shadowBlur  = 28;
            ctx.drawImage(logo, logoX, LOGO_Y, logoW, logoH);
            ctx.restore();
        } else {
            /* Fallback: texto en Rajdhani si el logo no carga */
            ctx.save();
            ctx.font        = `800 90px ${F.heading}`;
            ctx.fillStyle   = C.purpleBright;
            ctx.textAlign   = 'center';
            ctx.shadowColor = C.purple;
            ctx.shadowBlur  = 28;
            ctx.fillText('DESCUKE', W / 2, LOGO_Y + 130);
            ctx.restore();
        }

        /* ── 6. ETIQUETA "RESERVACIÓN" ────────────────────────── */
        ctx.save();
        ctx.font      = `500 34px ${F.heading}`;
        ctx.fillStyle = 'rgba(196,181,253,0.60)';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '10px';
        ctx.fillText('R E S E R V A C I Ó N', W / 2, 390);
        ctx.restore();

        fadeLine(ctx, 425);

        /* ── 7. BADGE MESA ────────────────────────────────────── */
        const MB_W = 480, MB_H = 116, MB_Y = 445;
        const MB_X = (W - MB_W) / 2;

        ctx.save();
        roundRect(ctx, MB_X, MB_Y, MB_W, MB_H, 22);
        const mesaGrad = ctx.createLinearGradient(MB_X, 0, MB_X + MB_W, 0);
        mesaGrad.addColorStop(0,   'rgba(124,58,237,0.08)');
        mesaGrad.addColorStop(0.5, 'rgba(167,139,250,0.20)');
        mesaGrad.addColorStop(1,   'rgba(124,58,237,0.08)');
        ctx.fillStyle   = mesaGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,139,250,0.38)';
        ctx.lineWidth   = 2;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.font        = `800 70px ${F.heading}`;
        ctx.fillStyle   = C.text;
        ctx.textAlign   = 'center';
        ctx.shadowColor = C.purpleBright;
        ctx.shadowBlur  = 16;
        ctx.fillText(`MESA ${r.tableId || '—'}`, W / 2, MB_Y + 78);
        ctx.restore();

        fadeLine(ctx, 600);

        /* ── 8. TARJETA PRINCIPAL ─────────────────────────────── */
        const CX = PAD, CY = 620, CW = W - PAD * 2, CH = 1010, CR = 32;

        ctx.save();
        roundRect(ctx, CX, CY, CW, CH, CR);
        const cardGrad = ctx.createLinearGradient(CX, CY, CX, CY + CH);
        cardGrad.addColorStop(0,   'rgba(167,139,250,0.09)');
        cardGrad.addColorStop(0.5, 'rgba(124,58,237,0.05)');
        cardGrad.addColorStop(1,   'rgba(76,29,149,0.07)');
        ctx.fillStyle   = cardGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,139,250,0.25)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ctx.restore();

        /* Línea de acento izquierda en la tarjeta */
        const sideGrad = ctx.createLinearGradient(0, CY, 0, CY + CH);
        sideGrad.addColorStop(0,   'transparent');
        sideGrad.addColorStop(0.25, C.purpleDeep);
        sideGrad.addColorStop(0.75, C.purpleBright);
        sideGrad.addColorStop(1,   'transparent');
        ctx.save();
        ctx.strokeStyle = sideGrad;
        ctx.lineWidth   = 3.5;
        ctx.shadowColor = C.purple;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.moveTo(CX + CR / 2, CY + 24);
        ctx.lineTo(CX + CR / 2, CY + CH - 24);
        ctx.stroke();
        ctx.restore();

        /* ── 9. CAMPOS DE INFORMACIÓN ─────────────────────────── */
        const FX   = CX + 64;           // x inicial de los campos
        const FW   = CW - 100;          // ancho máximo del texto
        const GAP  = 178;               // distancia vertical entre campos
        let   FY   = CY + 88;           // y inicial del primer campo

        const FIELDS = [
            {
                label: 'NOMBRE DE LA RESERVA',
                value: r.name || '—',
            },
            {
                label: 'FECHA',
                value: formatFecha(r.date),
            },
            {
                label: 'PERSONAS',
                value: String(r.persons || '—'),
            },
            {
                label: 'RP',
                value: r.rpName || '—',
            },
            {
                label: 'TIPO DE RESERVA',
                value: PROMO_LABEL[r.promo] || (r.promo ? r.promo : 'Sin promoción'),
                isChip: true,
            },
        ];

        FIELDS.forEach((field, i) => {
            /* Label */
            ctx.save();
            ctx.font      = `500 27px ${F.heading}`;
            ctx.fillStyle = 'rgba(196,181,253,0.68)';
            ctx.textAlign = 'left';
            ctx.letterSpacing = '1.5px';
            ctx.fillText(field.label, FX, FY);
            ctx.restore();

            /* Value */
            if (field.isChip && field.value !== 'Sin promoción') {
                /* Chip para tipo de reserva */
                ctx.save();
                ctx.font = `700 52px ${F.body}`;
                const TW = Math.min(ctx.measureText(field.value).width + 56, FW);
                const TH = 72, TX = FX, TY = FY + 12;
                roundRect(ctx, TX, TY, TW, TH, 14);
                ctx.fillStyle   = 'rgba(167,139,250,0.18)';
                ctx.fill();
                ctx.strokeStyle = C.purple;
                ctx.lineWidth   = 1.5;
                ctx.shadowColor = C.purple;
                ctx.shadowBlur  = 12;
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.font      = `700 52px ${F.body}`;
                ctx.fillStyle = C.purpleBright;
                ctx.textAlign = 'left';
                ctx.fillText(field.value, TX + 28, TY + 50);
                ctx.restore();
            } else {
                /* Texto plano con auto-fit de tamaño */
                const sz = fitText(ctx, field.value, FW, 52, '700', F.body);
                ctx.save();
                ctx.font      = `700 ${sz}px ${F.body}`;
                ctx.fillStyle = C.text;
                ctx.textAlign = 'left';
                ctx.fillText(field.value, FX, FY + 62);
                ctx.restore();
            }

            /* Separador entre campos (no después del último) */
            if (i < FIELDS.length - 1) {
                const sepY  = FY + GAP - 18;
                const sepGr = ctx.createLinearGradient(FX, 0, FX + FW, 0);
                sepGr.addColorStop(0,   'rgba(167,139,250,0.22)');
                sepGr.addColorStop(0.6, 'rgba(167,139,250,0.12)');
                sepGr.addColorStop(1,   'transparent');
                ctx.save();
                ctx.strokeStyle = sepGr;
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.moveTo(FX, sepY);
                ctx.lineTo(FX + FW, sepY);
                ctx.stroke();
                ctx.restore();
            }

            FY += GAP;
        });

        /* ── 10. FOOTER ───────────────────────────────────────── */
        fadeLine(ctx, 1685, 0.28);

        ctx.save();
        ctx.font      = `400 28px ${F.body}`;
        ctx.fillStyle = 'rgba(241,240,245,0.40)';
        ctx.textAlign = 'center';
        ctx.fillText('Presenta esta reservación al llegar', W / 2, 1735);
        ctx.restore();

        ctx.save();
        ctx.font      = `500 24px ${F.heading}`;
        ctx.fillStyle = 'rgba(167,139,250,0.38)';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '2px';
        ctx.restore();

        /* ── 11. LÍNEA NEÓN INFERIOR ──────────────────────────── */
        neonLine(H - 4);

        return canvas;
    }

    /* ═══════════════════════════════════════════════════════════
       ACCIONES: DESCARGAR Y COMPARTIR
       ═══════════════════════════════════════════════════════════ */

    function descargar(canvas, r) {
        const nombre   = String(r.name || 'reserva').replace(/\s+/g, '_').toLowerCase();
        const filename = `ticket_descuke_${nombre}.png`;
        canvas.toBlob((blob) => {
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    async function compartir(canvas, r) {
        const nombre   = String(r.name || 'reserva').replace(/\s+/g, '_').toLowerCase();
        const filename = `ticket_descuke_${nombre}.png`;
        try {
            const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Reservación Descuke — ${r.name}`,
                    text:  `Mesa ${r.tableId} · ${formatFechaCorta(r.date)}`,
                });
            } else {
                descargar(canvas, r);
            }
        } catch (err) {
            if (err.name !== 'AbortError') descargar(canvas, r);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       MODAL DE PREVIEW
       ═══════════════════════════════════════════════════════════ */

    function cerrar() {
        const modal = document.getElementById('dsk-share-modal');
        if (!modal) return;
        modal.classList.add('dsk-out');
        setTimeout(() => modal.remove(), 260);
    }

    async function openShareModal(reservaData) {
        if (!reservaData) return;

        document.getElementById('dsk-share-modal')?.remove();
        inyectarEstilos();

        const canShare = !!(navigator.share && navigator.canShare);

        const modal = document.createElement('div');
        modal.id = 'dsk-share-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="dsk-bg" id="dsk-bg"></div>
            <div class="dsk-panel">
                <div class="dsk-handle" aria-hidden="true"></div>
                <div class="dsk-head">
                    <div class="dsk-head-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                    </div>
                    <span class="dsk-head-title">Compartir Reserva</span>
                    <button class="dsk-close" id="dsk-close" aria-label="Cerrar modal">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="dsk-preview" id="dsk-preview">
                    <div class="dsk-spinner-wrap">
                        <div class="dsk-spinner"></div>
                        <span>Generando ticket...</span>
                    </div>
                </div>
                <div class="dsk-footer" id="dsk-footer" style="display:none">
                    ${canShare ? `
                    <button class="dsk-btn dsk-primary" id="dsk-share-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Compartir
                    </button>` : ''}
                    <button class="dsk-btn ${canShare ? 'dsk-secondary' : 'dsk-primary'}" id="dsk-dl-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Descargar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('dsk-in'));

        /* Cierre */
        document.getElementById('dsk-close').addEventListener('click', cerrar);
        document.getElementById('dsk-bg').addEventListener('click', cerrar);
        const onKey = (e) => { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', onKey); } };
        document.addEventListener('keydown', onKey);

        /* Generar */
        let cvs;
        try {
            cvs = await generarTicket(reservaData);
        } catch (err) {
            console.error('[Descuke Share]', err);
            document.getElementById('dsk-preview').innerHTML =
                `<p style="color:var(--red-soft,#f87171);font-size:13px;text-align:center">
                    Error al generar el ticket. Intenta nuevamente.
                </p>`;
            return;
        }

        const preview = document.getElementById('dsk-preview');
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'dsk-ticket-img';
        img.alt = 'Ticket de reserva Descuke';
        img.src = cvs.toDataURL('image/png', 1.0);
        preview.appendChild(img);

        document.getElementById('dsk-footer').style.display = 'flex';

        const shareBtn = document.getElementById('dsk-share-btn');
        if (shareBtn) shareBtn.addEventListener('click', () => compartir(cvs, reservaData));
        document.getElementById('dsk-dl-btn').addEventListener('click', () => descargar(cvs, reservaData));
    }

    /* ═══════════════════════════════════════════════════════════
       INYECCIÓN DE CSS DEL MODAL
       (Los estilos del .btn-xs.share van en styles.css)
       ═══════════════════════════════════════════════════════════ */

    function inyectarEstilos() {
        if (document.getElementById('dsk-share-css')) return;
        const s = document.createElement('style');
        s.id = 'dsk-share-css';
        s.textContent = `
#dsk-share-modal{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-end;justify-content:center}
.dsk-bg{position:absolute;inset:0;background:rgba(0,0,0,0);backdrop-filter:blur(0px);transition:background .28s,backdrop-filter .28s;cursor:pointer}
#dsk-share-modal.dsk-in .dsk-bg{background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}
#dsk-share-modal.dsk-out .dsk-bg{background:rgba(0,0,0,0);backdrop-filter:blur(0px);transition-duration:.22s}
.dsk-panel{
    position:relative;z-index:1;
    background:linear-gradient(160deg,#0e0b1e 0%,#080516 100%);
    border:1px solid rgba(167,139,250,.26);border-bottom:none;
    border-radius:22px 22px 0 0;
    width:min(520px,100vw);max-height:92vh;
    display:flex;flex-direction:column;overflow:hidden;
    box-shadow:0 -6px 50px rgba(124,58,237,.22),0 -2px 16px rgba(124,58,237,.10),
               inset 0 1px 0 rgba(196,181,253,.07);
    transform:translateY(100%);transition:transform .30s cubic-bezier(.32,.72,0,1)
}
#dsk-share-modal.dsk-in .dsk-panel{transform:translateY(0)}
#dsk-share-modal.dsk-out .dsk-panel{transform:translateY(100%);transition-duration:.22s}
.dsk-handle{width:36px;height:4px;background:rgba(167,139,250,.30);border-radius:2px;margin:12px auto 0;flex-shrink:0}
.dsk-head{display:flex;align-items:center;gap:10px;padding:14px 18px 14px;border-bottom:1px solid rgba(167,139,250,.14);flex-shrink:0}
.dsk-head-icon{width:34px;height:34px;border-radius:9px;background:rgba(167,139,250,.14);border:1px solid rgba(167,139,250,.26);display:flex;align-items:center;justify-content:center;color:#c4b5fd;flex-shrink:0}
.dsk-head-title{font-family:"Rajdhani",sans-serif;font-size:18px;font-weight:700;color:#f1f0f5;letter-spacing:.3px;flex:1}
.dsk-close{width:30px;height:30px;border-radius:50%;background:rgba(167,139,250,.10);border:1px solid rgba(167,139,250,.22);color:rgba(241,240,245,.55);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:all .18s;flex-shrink:0}
.dsk-close:hover{background:rgba(167,139,250,.24);border-color:rgba(167,139,250,.45);color:#f1f0f5}
.dsk-preview{flex:1;overflow-y:auto;padding:18px;display:flex;align-items:center;justify-content:center;min-height:160px;scrollbar-width:thin;scrollbar-color:rgba(167,139,250,.3) transparent}
.dsk-preview::-webkit-scrollbar{width:3px}
.dsk-preview::-webkit-scrollbar-thumb{background:rgba(167,139,250,.3);border-radius:2px}
.dsk-spinner-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;color:rgba(196,181,253,.6);font-family:"DM Sans",Arial,sans-serif;font-size:13px}
@keyframes dsk-spin{to{transform:rotate(360deg)}}
.dsk-spinner{width:36px;height:36px;border:3px solid rgba(167,139,250,.16);border-top-color:#a78bfa;border-radius:50%;animation:dsk-spin .7s linear infinite}
.dsk-ticket-img{max-width:100%;max-height:60vh;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.65),0 0 0 1px rgba(167,139,250,.20);object-fit:contain;display:block}
.dsk-footer{padding:12px 18px 18px;gap:10px;border-top:1px solid rgba(167,139,250,.12);flex-shrink:0}
.dsk-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px 16px;border-radius:12px;font-family:"DM Sans",Arial,sans-serif;font-size:14px;font-weight:600;cursor:pointer;border:none;outline:none;transition:all .18s;letter-spacing:.2px;white-space:nowrap}
.dsk-primary{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;box-shadow:0 4px 20px rgba(124,58,237,.40)}
.dsk-primary:hover{filter:brightness(1.12);box-shadow:0 6px 28px rgba(124,58,237,.55);transform:translateY(-1px)}
.dsk-secondary{background:rgba(167,139,250,.10);color:#c4b5fd;border:1px solid rgba(167,139,250,.26)}
.dsk-secondary:hover{background:rgba(167,139,250,.20);border-color:rgba(167,139,250,.42);color:#ddd6fe}
@media(min-width:521px){
    #dsk-share-modal{align-items:center}
    .dsk-panel{border-radius:20px;border-bottom:1px solid rgba(167,139,250,.26);max-height:88vh;transform:translateY(16px) scale(.97);opacity:0;transition:transform .28s cubic-bezier(.32,.72,0,1),opacity .22s}
    #dsk-share-modal.dsk-in .dsk-panel{transform:translateY(0) scale(1);opacity:1}
    #dsk-share-modal.dsk-out .dsk-panel{transform:translateY(10px) scale(.97);opacity:0}
    .dsk-handle{display:none}
}
@media(prefers-reduced-motion:reduce){.dsk-panel,.dsk-bg,.dsk-btn{transition:none!important}.dsk-spinner{animation:none}}
        `;
        document.head.appendChild(s);
    }

    /* ── API PÚBLICA ─────────────────────────────────────────── */
    return { openShareModal };

})();