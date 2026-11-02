import { DB } from '../data/database.js';
import { ST } from '../state/app-state.js';
import { isAdmin } from '../rules/access-rules.js';
import { escapeHtml } from '../utils/html-utils.js';
import { initialsOf } from '../utils/format-utils.js';

export function renderRPs(m){
    const allUsers = DB.getU();
    const all = DB.getR();
    const admin = isAdmin();
    const users = allUsers.filter(u => u.id !== 'admin');
    const hostessCount = allUsers.filter(u => u.isHostess).length;

    m.innerHTML = `
<div class="rp-wrap">
  <h2>Equipo RP</h2>
  <p class="rp-subtitle">Activa <span class="hostess-highlight">Hostess</span> en un RP para ponerlo a hostear la entrada del antro.</p>
  ${hostessCount > 0 ? `<div class="hostess-counter"><span class="hostess-counter-dot"></span>${hostessCount} RP hosteando la entrada ahora mismo</div>` : ''}
  <div id="rp-msg" class="msg" style="margin-bottom:8px"></div>
  <div class="rp-list">
    ${users.length ? users.map(u => {
        const count = all.filter(r => r.rpId === u.id).length;
        const isH = !!u.isHostess;
        const isMeseroRole = u.role === 'mesero';
        const roleTag = u.role === 'admin'
            ? '<span class="h-role" style="-webkit-text-fill-color:#fff">ADMIN</span>'
            : isMeseroRole
                ? '<span class="h-role" style="-webkit-text-fill-color:#fff;background:var(--green-dim,#065f46)">MESERO</span>'
                : '';
        return `<div class="rp-row${isH ? ' rp-row-hostess' : ''}">
        <div class="rp-avatar">${initialsOf(u.name)}</div>
        <div class="rp-info">
          <div class="rp-name">${escapeHtml(u.name)} ${roleTag}</div>
          <div class="rp-id">@${u.id}</div>
        </div>
        <span class="rp-count">${isMeseroRole ? 'Mesero' : `${count} reservas`}</span>
        <div class="rp-actions">
          ${admin && !isMeseroRole ? `<button class="btn-xs hostess${isH ? ' on' : ''}" onclick="toggleHostess('${u.id}')"><span class="hostess-dot"></span>Hostess</button>` : ''}
          <button class="btn-xs purple" onclick="openEditRP('${u.id}')">Editar</button>
          <button class="btn-xs gray" onclick="delRP('${u.id}')">Eliminar</button>
        </div>
      </div>`;
    }).join('') : `<p style="color:var(--text3);text-align:center;padding:24px 0">No hay usuarios registrados</p>`}
  </div>
  <div class="add-rp-card">
    <h3>Agregar usuario</h3>
    <input id="rp-name" type="text" placeholder="Nombre completo">
    <input id="rp-id" type="text" placeholder="Usuario (para iniciar sesión)">
    <input id="rp-pass" type="password" placeholder="Contraseña">
    <div class="role-selector">
      <label class="role-opt">
        <input type="radio" name="rp-role" value="rp" checked> RP
      </label>
      <label class="role-opt">
        <input type="radio" name="rp-role" value="mesero"> Mesero
      </label>
      <label class="role-opt">
        <input type="radio" name="rp-role" value="admin"> Administrador
      </label>
    </div>
    <button onclick="addRP()" style="margin-top:4px">Crear usuario</button>
  </div>

  ${admin ? `
  <div class="add-rp-card" style="margin-top:12px;border-color:rgba(124,58,237,.25)">
    <h3>Catálogo de Productos</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:10px">
      Siembra las categorías y productos iniciales en Firestore.
      Actualmente: <b>${DB._categorias.length} categorías</b> · <b>${DB._productos.length} productos</b>.
      <br>Idempotente — puedes ejecutarlo varias veces sin duplicar datos.
    </p>
    <button id="btn-sembrar-catalogo" onclick="sembrarCatalogo()" style="width:auto">
      Sembrar Catálogo
    </button>
  </div>` : ''}
</div>`;
}
