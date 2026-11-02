'use client';

import { useState } from 'react';

/* Recreación de las vistas .NET MAUI de Pasadena a partir de sus archivos XAML.
   Estructura, textos y colores (#121212, #181818, #222222) son los originales;
   los datos de ejemplo son los mismos que traen las vistas. */

type Screen = 'inicio' | 'perfil' | 'social' | 'playlist' | 'usuarios' | 'canciones';

const SCREENS: { id: Screen; label: string; file: string }[] = [
  { id: 'inicio', label: 'Inicio', file: 'PantallaInicio.xaml' },
  { id: 'perfil', label: 'Perfil', file: 'PerfilUsuarioPage.xaml' },
  { id: 'social', label: 'Social', file: 'SocialPage.xaml' },
  { id: 'playlist', label: 'Crear playlist', file: 'CrearPlaylistPage.xaml' },
  { id: 'usuarios', label: 'Admin · usuarios', file: 'GestionarUsuariosPage.xaml' },
  { id: 'canciones', label: 'Admin · canciones', file: 'GestionarCancionesPage.xaml' },
];

const ALBUM_COLORS = ['#3b2f5c', '#1f4d3f', '#5c3b2f', '#2f405c'];

export function PasadenaDemo() {
  const [screen, setScreen] = useState<Screen>('inicio');
  const current = SCREENS.find(s => s.id === screen)!;
  return (
    <div className="overflow-hidden rounded-2xl border border-line-2" style={{ fontFamily: '"Open Sans","Segoe UI",system-ui,sans-serif' }}>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface p-2" role="tablist" aria-label="Pantallas de Pasadena">
        {SCREENS.map(s => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={s.id === screen}
            onClick={() => setScreen(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${s.id === screen ? 'bg-emerald/15 text-fg ring-1 ring-emerald/40' : 'text-fg-2 hover:text-fg'}`}
          >
            {s.label}
          </button>
        ))}
        <span className="ml-auto hidden font-mono text-[10px] text-muted sm:inline">{current.file} · recreación</span>
      </div>
      <div role="tabpanel" className="min-h-[520px] text-white" style={{ background: '#121212' }}>
        {screen === 'inicio' && <Inicio go={setScreen} />}
        {screen === 'perfil' && <Perfil go={setScreen} />}
        {screen === 'social' && <Social />}
        {screen === 'playlist' && <Playlist go={setScreen} />}
        {screen === 'usuarios' && <Usuarios />}
        {screen === 'canciones' && <Canciones />}
      </div>
    </div>
  );
}

function Search({ placeholder }: { placeholder: string }) {
  return <input aria-label={placeholder} placeholder={placeholder} className="w-full rounded-full border-0 bg-white px-4 py-2.5 text-sm text-black placeholder:text-neutral-500" />;
}

function Inicio({ go }: { go: (s: Screen) => void }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(35);
  return (
    <div className="grid min-h-[520px] grid-rows-[1fr_auto]">
      <div className="grid sm:grid-cols-[minmax(170px,25%)_1fr]">
        <div className="hidden flex-col gap-2.5 bg-black p-3 sm:flex">
          <button type="button" onClick={() => go('playlist')} className="rounded-[20px] bg-[#222] px-3 py-2 text-sm font-bold">+ Crear Playlist</button>
          <p className="mt-1 text-xs font-bold text-neutral-400">TU BIBLIOTECA</p>
          {['🎵 Tus me gusta', '🎧 Canciones tristes', '🎸 Rock Clásico'].map(p => <p key={p} className="px-2 py-1 text-[15px]">{p}</p>)}
          <p className="mt-6 text-xs font-bold text-neutral-400">PANEL DE ADMIN</p>
          <button type="button" onClick={() => go('usuarios')} className="rounded bg-[#181818] px-3 py-2 text-left text-sm">Gestionar Usuarios</button>
          <button type="button" onClick={() => go('canciones')} className="rounded bg-[#181818] px-3 py-2 text-left text-sm">Gestionar Canciones</button>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Search placeholder="¿Qué quieres escuchar?" />
            <button type="button" onClick={() => go('perfil')} aria-label="Perfil" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#222] text-sm">👤</button>
          </div>
          <p className="mt-6 text-[22px] font-bold">Esto puede gustarte</p>
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {['Álbum 1', 'Álbum 2', 'Álbum 3', 'Álbum 4'].map((a, i) => (
              <li key={a} className="rounded-lg bg-[#181818] p-3">
                <div className="aspect-square rounded" style={{ background: ALBUM_COLORS[i] }} aria-hidden="true" />
                <p className="mt-2.5 font-bold">{a}</p>
                <p className="text-sm text-neutral-400">Artista</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 px-4 py-3" style={{ background: '#181818' }}>
        <div className="h-12 w-12 shrink-0 rounded" style={{ background: ALBUM_COLORS[0] }} aria-hidden="true" />
        <div className="min-w-0 flex-1 sm:flex-none">
          <p className="truncate font-bold">Nombre de la canción</p>
          <p className="truncate text-sm text-neutral-400">Nombre del artista</p>
        </div>
        <button type="button" onClick={() => setPlaying(p => !p)} className="h-9 w-9 rounded-full bg-white text-black" aria-label={playing ? 'Pausa' : 'Reproducir'}>{playing ? '❚❚' : '▶'}</button>
        <input type="range" min={0} max={100} value={pos} onChange={e => setPos(+e.target.value)} aria-label="Progreso" className="w-full accent-white sm:flex-1" />
      </div>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5">
      <span aria-hidden="true" className="w-6 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      <span aria-hidden="true" className="text-neutral-500">›</span>
    </button>
  );
}

function Perfil({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="mx-auto max-w-lg p-5">
      <p className="text-xl font-bold">Cuenta</p>
      <div className="mt-3 divide-y divide-white/5 overflow-hidden rounded-[10px] bg-[#222]">
        <Row icon="✎" label="Editar Información Personal" />
        <Row icon="👥" label="Social" onClick={() => go('social')} />
      </div>
      <p className="mt-6 text-xl font-bold">Seguridad</p>
      <div className="mt-3 overflow-hidden rounded-[10px] bg-[#222]">
        <Row icon="🛡" label="Gestionar Usuarios" onClick={() => go('usuarios')} />
      </div>
      <button type="button" className="mt-8 w-full rounded-[10px] bg-[#222] py-3 font-bold text-red-500">Cerrar Sesión</button>
    </div>
  );
}

function Social() {
  const [users, setUsers] = useState([
    { name: 'Daniela_22', following: false }, { name: 'carlos_music', following: true }, { name: 'Sofia_Rock', following: false },
    { name: 'Alex_DJ', following: false }, { name: 'Laura_Indie', following: true },
  ]);
  const [q, setQ] = useState('');
  const shown = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-lg p-5">
      <p className="text-[22px] font-bold">Encontrar Amigos</p>
      <input aria-label="Buscar usuarios" placeholder="Buscar usuarios..." value={q} onChange={e => setQ(e.target.value)} className="mt-3 w-full rounded-full bg-white px-4 py-2.5 text-sm text-black placeholder:text-neutral-500" />
      <ul className="mt-4 space-y-2">
        {shown.map(u => (
          <li key={u.name} className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#333] text-lg" aria-hidden="true">👤</span>
            <span className="flex-1">{u.name}</span>
            <button
              type="button"
              onClick={() => setUsers(us => us.map(x => (x.name === u.name ? { ...x, following: !x.following } : x)))}
              className="min-w-[96px] rounded-[20px] px-4 py-2 text-sm font-semibold text-black"
              style={{ background: u.following ? '#a9a9a9' : '#fff' }}
              aria-pressed={u.following}
            >
              {u.following ? 'Siguiendo' : 'Seguir'}
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="py-4 text-sm text-neutral-400">Sin resultados.</li>}
      </ul>
    </div>
  );
}

function Playlist({ go }: { go: (s: Screen) => void }) {
  const [name, setName] = useState('');
  const [tried, setTried] = useState(false);
  const [created, setCreated] = useState('');
  return (
    <form
      className="mx-auto max-w-lg p-5"
      onSubmit={e => { e.preventDefault(); setTried(true); if (name.trim()) { setCreated(name.trim()); setName(''); setTried(false); } }}
      noValidate
    >
      <p className="text-2xl font-bold">Crea tu playlist</p>
      <label className="mt-5 block text-sm text-neutral-400" htmlFor="pl-name">Nombre</label>
      <input id="pl-name" placeholder="El nombre de tu playlist" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border-b border-neutral-600 bg-transparent py-2 text-white outline-none placeholder:text-neutral-500 focus:border-white" />
      {tried && !name.trim() && <p className="mt-1 text-xs text-red-500">Campo faltante</p>}
      <label className="mt-5 block text-sm text-neutral-400" htmlFor="pl-desc">Descripción</label>
      <textarea id="pl-desc" rows={3} placeholder="Añade una descripción (opcional)" className="mt-1 w-full rounded bg-[#1e1e1e] p-2.5 text-white outline-none placeholder:text-neutral-500" />
      {created && <p className="mt-3 text-sm text-emerald" role="status">Playlist “{created}” creada (simulación).</p>}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => go('inicio')} className="flex-1 rounded-[25px] bg-[#535353] py-3 font-semibold">Cancelar</button>
        <button type="submit" className="flex-1 rounded-[25px] bg-white py-3 font-semibold text-black">Aceptar</button>
      </div>
    </form>
  );
}

function Usuarios() {
  const [users, setUsers] = useState([{ name: 'Daniela_22', banned: false }, { name: 'carlos_music', banned: true }, { name: 'Sofia_Rock', banned: false }]);
  const [msg, setMsg] = useState('');
  return (
    <div className="mx-auto max-w-lg p-5">
      <p className="text-sm text-neutral-400">Panel de Administración</p>
      <p className="text-[22px] font-bold">Gestionar Usuarios</p>
      <div className="mt-3"><Search placeholder="Buscar usuario por nombre..." /></div>
      <ul className="mt-4 space-y-2">
        {users.map(u => (
          <li key={u.name} className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#333] text-lg" aria-hidden="true">👤</span>
            <span className="flex-1">{u.name}</span>
            <button
              type="button"
              onClick={() => {
                setUsers(us => us.map(x => (x.name === u.name ? { ...x, banned: !x.banned } : x)));
                setMsg(u.banned ? `Se ha removido el baneo al usuario ${u.name}.` : `El usuario ${u.name} ha sido baneado.`);
              }}
              className="min-w-[110px] rounded-[20px] px-4 py-2 text-sm font-semibold"
              style={{ background: u.banned ? '#28a745' : '#dc3545' }}
            >
              {u.banned ? 'Desbanear' : 'Banear'}
            </button>
          </li>
        ))}
      </ul>
      {msg && <p className="mt-3 rounded-lg bg-[#222] px-3 py-2 text-sm" role="status">{msg}</p>}
    </div>
  );
}

function Canciones() {
  const [songs, setSongs] = useState([
    { n: 'Canción de prueba 1', a: 'Artista A' }, { n: 'Canción de prueba 2', a: 'Artista B' }, { n: 'Canción de prueba 3', a: 'Artista C' },
  ]);
  return (
    <div className="mx-auto max-w-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[22px] font-bold">Gestionar Canciones</p>
        <button type="button" className="rounded-[20px] px-4 py-2 text-sm font-semibold" style={{ background: '#28a745' }}>+ Agregar Nueva Canción</button>
      </div>
      <div className="mt-3"><Search placeholder="Buscar canción para eliminar..." /></div>
      <ul className="mt-4 space-y-2">
        {songs.map(s => (
          <li key={s.n} className="flex items-center gap-3 rounded-lg bg-[#181818] px-3 py-2.5">
            <div className="flex-1">
              <p>{s.n}</p>
              <p className="text-sm text-neutral-400">{s.a}</p>
            </div>
            <button type="button" onClick={() => setSongs(x => x.filter(y => y.n !== s.n))} className="rounded-[20px] bg-red-600 px-4 py-2 text-sm font-semibold">Eliminar</button>
          </li>
        ))}
        {songs.length === 0 && <li className="py-4 text-sm text-neutral-400">No quedan canciones.</li>}
      </ul>
    </div>
  );
}
