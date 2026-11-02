import { $ } from '../utils/dom.js';

export function showModal(html){
    $('modal').innerHTML = `<div class="mbox">${html}<button class="mclose" onclick="closeModal()">✕</button></div>`;
    $('modal').classList.remove('hidden');
}

export function closeModal(){ $('modal').classList.add('hidden'); }
