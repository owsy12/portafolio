import { $ } from '../utils/dom.js';
import { ICON, loginParticles } from '../ui/icons.js';

export function renderLogin(){
    $('app').innerHTML = `
<div class="login-wrap">
  <div class="login-aura"></div>
  <div class="login-particles">${loginParticles()}</div>
  <div class="login-card">
    <div class="login-logo">
      <span class="demo-wordmark" style="font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.18em;color:#c4b5fd;display:block;font-size:44px;text-align:center;text-shadow:0 0 24px rgba(167,139,250,.45)">DESCUKE</span>
    </div>
    <div id="lmsg" class="msg"></div>
    <div class="input-wrap">
      ${ICON.user}
      <input id="l-u" type="text" placeholder="Usuario" autocomplete="username"
             onkeydown="if(event.key==='Enter')document.getElementById('l-p').focus()">
    </div>
    <div class="input-wrap with-toggle">
      ${ICON.lock}
      <input id="l-p" type="password" placeholder="Contraseña" autocomplete="current-password"
             onkeydown="if(event.key==='Enter')doLogin()">
      <button class="input-toggle" type="button" aria-label="Mostrar contraseña"
              onclick="togglePassword(this)">${ICON.eye}</button>
    </div>
    <button onclick="doLogin()">Iniciar sesión</button>
    <p class="small">Solicita tu acceso al administrador</p>
  </div>
</div>`;
}

export function togglePassword(btn){
    const input = document.getElementById('l-p');
    if(!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show ? ICON.eyeOff : ICON.eye;
    btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
}
