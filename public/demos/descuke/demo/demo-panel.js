/* Panel flotante de la demo: cambia de rol con un clic y reinicia los datos.
   No forma parte de la aplicación original. */
import { auth, signInWithEmailAndPassword, signOut, resetDemo } from '../src/js/config/firebase.config.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../src/js/config/demo-seed.js';

const ROLE_LABEL = { admin: 'Administrador', rp: 'Relaciones públicas', mesero: 'Mesero' };
const ACCOUNTS = [
    DEMO_ACCOUNTS.find(a => a.id === 'admin'),
    DEMO_ACCOUNTS.find(a => a.id === 'valeria'),
    DEMO_ACCOUNTS.find(a => a.id === 'camila'),
    DEMO_ACCOUNTS.find(a => a.id === 'luis'),
];

const css = `
#demo-panel{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;font-family:'DM Sans',system-ui,sans-serif;color:#f1f0f5;max-width:calc(100vw - 24px)}
#demo-panel *{box-sizing:border-box}
#demo-panel .dp-toggle{display:flex;align-items:center;gap:8px;background:#0b1f17;border:1px solid #1f6f50;color:#d1fae5;border-radius:999px;padding:8px 14px;font:600 12px/1 'DM Sans',sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);min-height:36px}
#demo-panel .dp-dot{width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399}
#demo-panel .dp-body{margin-top:8px;width:290px;max-width:100%;background:rgba(10,12,14,.97);border:1px solid #23302a;border-radius:14px;padding:14px;box-shadow:0 18px 48px rgba(0,0,0,.6)}
#demo-panel[data-open="false"] .dp-body{display:none}
#demo-panel h4{margin:0 0 4px;font:700 13px 'DM Sans',sans-serif;color:#fff}
#demo-panel p{margin:0 0 10px;font-size:12px;line-height:1.45;color:#a3b3ab}
#demo-panel .dp-acc{display:flex;width:100%;justify-content:space-between;align-items:center;gap:8px;background:#121816;border:1px solid #23302a;border-radius:10px;padding:9px 11px;margin-bottom:6px;color:#f1f0f5;cursor:pointer;text-align:left;font:500 13px 'DM Sans',sans-serif;min-height:40px}
#demo-panel .dp-acc:hover,#demo-panel .dp-acc:focus-visible{border-color:#34d399;outline:none}
#demo-panel .dp-acc small{color:#7f9189;font-size:11px}
#demo-panel .dp-acc[aria-current="true"]{border-color:#34d399;background:#0f231b}
#demo-panel .dp-row{display:flex;gap:6px;margin-top:8px}
#demo-panel .dp-btn{flex:1;background:transparent;border:1px solid #2b3a33;color:#c7d2cc;border-radius:10px;padding:8px;font:500 12px 'DM Sans',sans-serif;cursor:pointer;min-height:36px}
#demo-panel .dp-btn:hover{border-color:#34d399;color:#fff}
#demo-panel code{background:#16201c;border-radius:4px;padding:1px 5px;color:#d1fae5}
`;

function mount(){
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'demo-panel';
    const startOpen = !auth.currentUser;
    wrap.dataset.open = String(startOpen);
    wrap.innerHTML = `
      <button class="dp-toggle" type="button" aria-expanded="${startOpen}" aria-controls="dp-body">
        <span class="dp-dot" aria-hidden="true"></span> DEMO · datos ficticios
      </button>
      <div class="dp-body" id="dp-body" role="region" aria-label="Controles de la demostración">
        <h4>Entra con un rol</h4>
        <p>Es el código real de Descuke, conectado a una base de datos simulada en tu navegador. Nada de lo que hagas aquí sale de esta pestaña.</p>
        <div class="dp-accounts"></div>
        <p style="margin-top:8px">También puedes escribir el usuario a mano con la contraseña <code>${DEMO_PASSWORD}</code>.</p>
        <div class="dp-row">
          <button class="dp-btn" type="button" data-act="reset">Reiniciar datos</button>
          <button class="dp-btn" type="button" data-act="logout">Cerrar sesión</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const list = wrap.querySelector('.dp-accounts');
    const current = auth.currentUser?.uid;
    ACCOUNTS.forEach(a => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dp-acc';
        if (a.id === current) b.setAttribute('aria-current', 'true');
        const role = a.isHostess ? 'Hostess (RP con acceso a llegadas)' : ROLE_LABEL[a.role];
        b.innerHTML = `<span>${a.name}<br><small>${role}</small></span><small>${a.id}</small>`;
        b.addEventListener('click', async () => {
            if (auth.currentUser) await signOut(auth);
            await signInWithEmailAndPassword(auth, a.id + '@descuke.com', DEMO_PASSWORD);
            if (!location.pathname.endsWith('index.html') && location.pathname.includes('mesa')) location.href = 'index.html';
            location.reload();
        });
        list.appendChild(b);
    });

    const toggle = wrap.querySelector('.dp-toggle');
    toggle.addEventListener('click', () => {
        const open = wrap.dataset.open !== 'true';
        wrap.dataset.open = String(open);
        toggle.setAttribute('aria-expanded', String(open));
    });
    wrap.querySelector('[data-act="reset"]').addEventListener('click', () => { resetDemo(); location.reload(); });
    wrap.querySelector('[data-act="logout"]').addEventListener('click', async () => { await signOut(auth); location.reload(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
