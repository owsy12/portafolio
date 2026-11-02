import { auth, signInWithEmailAndPassword, signOut } from '../config/firebase.config.js';
import { $ } from '../utils/dom.js';

export function doLogin(){
    const uid = $('l-u').value.trim();
    const pwd = $('l-p').value;
    const msg = $('lmsg');

    if(!uid || !pwd) { msg.textContent = 'Ingresa usuario y contraseña'; return; }
    msg.textContent = 'Iniciando sesión...';

    const email = uid.toLowerCase() + '@descuke.com';

    signInWithEmailAndPassword(auth, email, pwd)
        .catch(() => { msg.textContent = 'Usuario o contraseña incorrectos'; });
}

export function doLogout(){ signOut(auth); }
