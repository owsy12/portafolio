import { db, updateDoc, deleteDoc, doc, setDoc, writeBatch, createAuthUser, updateAuthPassword, deleteAuthUser } from '../config/firebase.config.js';
import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { isAdmin } from '../rules/access-rules.js';
import { toast } from '../ui/toast.js';
import { showModal, closeModal } from '../ui/modal.js';

function toEmail(id) {
    return `${id.toLowerCase()}@descuke.com`;
}

export async function addRP() {
    const name = $('rp-name').value.trim();
    const uid  = $('rp-id').value.trim();
    const pass = $('rp-pass').value;
    const role = document.querySelector('input[name="rp-role"]:checked')?.value || 'rp';
    const msg  = $('rp-msg');

    if (!name || !uid || !pass) { msg.textContent = 'Completa todos los campos'; return; }
    if (DB.getU().find(u => u.id === uid)) { msg.textContent = 'Ese usuario ya existe'; return; }

    msg.textContent = 'Creando usuario...';

    try {
        await createAuthUser(toEmail(uid), pass);
    } catch (e) {
        if (e.code !== 'auth/email-already-in-use') {
            msg.textContent = 'Error al crear usuario: ' + (e.message || e.code);
            return;
        }
    }

    await setDoc(doc(db, "users", uid), { id: uid, name, pass, role });

    msg.textContent = '';
    toast(`Usuario ${name} creado. Ya puede iniciar sesión.`);
    $('rp-name').value = '';
    $('rp-id').value   = '';
    $('rp-pass').value = '';
}

export function openEditRP(uid) {
    const u = DB.getU().find(x => x.id === uid);
    if (!u) return;
    showModal(`
<h3>Editar usuario</h3>
<p class="minfo">@${u.id}</p>
<input id="m-name" type="text" value="${u.name}" placeholder="Nombre">
<input id="m-pass" type="password" placeholder="Nueva contraseña (vacío = sin cambio)">
<div class="role-selector">
  <label class="role-opt">
    <input type="radio" name="edit-role" value="rp" ${u.role === 'rp' ? 'checked' : ''}> RP
  </label>
  <label class="role-opt">
    <input type="radio" name="edit-role" value="mesero" ${u.role === 'mesero' ? 'checked' : ''}> Mesero
  </label>
  <label class="role-opt">
    <input type="radio" name="edit-role" value="admin" ${u.role === 'admin' ? 'checked' : ''}> Administrador
  </label>
</div>
<button onclick="saveEditRP('${uid}')">Guardar cambios</button>`);
}

export async function saveEditRP(uid) {
    const name = $('m-name').value.trim();
    const pass = $('m-pass').value;
    const role = document.querySelector('input[name="edit-role"]:checked')?.value || 'rp';
    if (!name) return;

    const user = DB.getU().find(u => u.id === uid);
    if (!user) return;

    const updateData = { name, role };

    if (pass) {
        try {
            await updateAuthPassword(toEmail(uid), user.pass, pass);
        } catch (e) {
            toast('No se pudo actualizar la contraseña en Auth: ' + (e.message || e.code));
            return;
        }
        updateData.pass = pass;
    }

    await updateDoc(doc(db, "users", uid), updateData);
    if (ST.user && ST.user.id === uid) { ST.user = { ...ST.user, ...updateData }; }

    closeModal();
    toast('Usuario actualizado');
}

export async function toggleHostess(uid) {
    if (!isAdmin()) { toast('Solo el administrador puede gestionar Hostess'); return; }
    const user = DB.getU().find(u => u.id === uid);
    if (!user) return;
    const newVal = !user.isHostess;
    await updateDoc(doc(db, "users", user.fb_id), { isHostess: newVal });
    toast(newVal ? `${user.name} es Hostess ahora` : `${user.name} ya no es Hostess`);
}

export async function migrateUsers() {
    if (!isAdmin()) return;
    const users = DB.getU();
    const batch = writeBatch(db);
    let count = 0;

    for (const user of users) {
        if (!user.id) {
            batch.delete(doc(db, "users", user.fb_id));
            count++;
            continue;
        }
        if (user.fb_id !== user.id) {
            const { fb_id, ...data } = user;
            batch.set(doc(db, "users", user.id), data);
            batch.delete(doc(db, "users", user.fb_id));
            count += 2;
        }
    }

    if (count > 0) await batch.commit();
}

export async function delRP(uid) {
    if (!confirm('¿Eliminar este usuario? Sus reservas se mantendrán.')) return;

    const user = DB.getU().find(u => u.id === uid);

    if (user?.pass) {
        try {
            await deleteAuthUser(toEmail(uid), user.pass);
        } catch (e) {
            if (e.code !== 'auth/user-not-found') {
                toast('No se pudo eliminar de Auth: ' + (e.message || e.code));
                return;
            }
        }
    }

    await deleteDoc(doc(db, "users", uid));
    toast('Usuario eliminado');
}
