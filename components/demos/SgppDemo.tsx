'use client';

import { useMemo, useState } from 'react';

/* Recreación visual del SGPP (JavaFX) en React.
   Textos, menús por rol y colores salen de los archivos FXML/CSS y de
   MainMenuController.java del repositorio. Los datos son ficticios. */

type Role = 'Coordinador' | 'Practicante' | 'Profesor' | 'Administrador';
type ViewKey = 'welcome' | 'addProject' | 'manageProject' | 'selfEval' | string;

const C = {
  bg: '#f4f4f4', card: '#ffffff', border: '#d8dde3', ink: '#1c2330', sub: '#5a6675', hint: '#6b7684', // hint original #8a95a3, oscurecido para contraste AA
  accent: '#005691', sidebar: '#002a4a', orange: '#ed8a2c', okBg: '#e3f5ea', ok: '#2f9b5a', pendBg: '#fdefdd',
};

const USERS: Record<Role, { name: string; id: string; initials: string }> = {
  Coordinador: { name: 'MARÍA ELENA SOTO', id: 'P00012345', initials: 'MS' },
  Practicante: { name: 'CARLOS RAMÍREZ LUNA', id: 'S22013377', initials: 'CR' },
  Profesor: { name: 'JORGE ALBERTO PAZ', id: 'P00045678', initials: 'JP' },
  Administrador: { name: 'ADMINISTRADOR DEMO', id: 'A00000001', initials: 'AD' },
};

// Menús tal como los arma MainMenuController.loadMenuByRole()
const MENUS: Record<Role, { label: string; view: ViewKey; fxml: string }[]> = {
  Administrador: [
    { label: 'Asignar coordinador', view: 'GUIAddCoordinator', fxml: 'GUIAddCoordinator.fxml' },
    { label: 'Registrar profesor', view: 'GUIAddProfessor', fxml: 'GUIAddProfessor.fxml' },
    { label: 'Inactivar coordinador', view: 'GUIDeactivateCoordinator', fxml: 'GUIDeactivateCoordinator.fxml' },
  ],
  Profesor: [{ label: 'Revisar Reportes', view: 'GUISelectEducationalExperience', fxml: 'GUISelectEducationalExperience.fxml' }],
  Coordinador: [
    { label: 'Registrar Experiencia Educativa', view: 'GUIAddEducationalExperience', fxml: 'GUIAddEducationalExperience.fxml' },
    { label: 'Registrar Organización', view: 'GUIAddLinkedOrganization', fxml: 'GUIAddLinkedOrganization.fxml' },
    { label: 'Registrar Practicante', view: 'GUIAddIntern', fxml: 'GUIAddIntern.fxml' },
    { label: 'Asignar Proyecto', view: 'GUIAssignProject', fxml: 'GUIAssignProject.fxml' },
    { label: 'Registrar Técnico', view: 'GUIAddTechnicalResponsible', fxml: 'GUIAddTechnicalResponsible.fxml' },
    { label: 'Registrar Proyecto', view: 'addProject', fxml: 'GUIAddProject.fxml' },
    { label: 'Actualizar Proyecto', view: 'manageProject', fxml: 'GUIManageProject.fxml' },
    { label: 'Inactivar Practicante', view: 'GUIDeactivateIntern', fxml: 'GUIDeactivateIntern.fxml' },
    { label: 'Consultar Organizaciones Vinculadas', view: 'GUIManageLinkedOrganization', fxml: 'GUIManageLinkedOrganization.fxml' },
    { label: 'Consultar técnicos responsables', view: 'GUIManageTechnicalResponsible', fxml: 'GUIManageTechnicalResponsible.fxml' },
    { label: 'Registrar profesor', view: 'GUIAddProfessor', fxml: 'GUIAddProfessor.fxml' },
    { label: 'Inactivar profesor', view: 'GUIDeactivateProfessor', fxml: 'GUIDeactivateProfessor.fxml' },
  ],
  Practicante: [
    { label: 'Subir Documentos Iniciales', view: 'GUIUploadInitialDocuments', fxml: 'GUIUploadInitialDocuments.fxml' },
    { label: 'Solicitar Proyecto', view: 'GUIRequestProject', fxml: 'GUIRequestProject.fxml' },
    { label: 'Registrar Actividad', view: 'GUIAddActivity', fxml: 'GUIAddActivity.fxml' },
    { label: 'Manejar Actividades', view: 'GUIManageActivities', fxml: 'GUIManageActivities.fxml' },
    { label: 'Generar Reporte', view: 'GUIGenerateReport', fxml: 'GUIGenerateReport.fxml' },
    { label: 'Añadir Reporte', view: 'GUIAddReport', fxml: 'GUIAddReport.fxml' },
    { label: 'Generar Autoevaluación', view: 'selfEval', fxml: 'GUIGenerateSelfEvaluation.fxml' },
    { label: 'Añadir Autoevaluación', view: 'GUIAddSelfEvaluation', fxml: 'GUIAddSelfEvaluation.fxml' },
    { label: 'Añadir Evaluación OV', view: 'GUIAddLinkedOrganizationEvaluation', fxml: 'GUIAddLinkedOrganizationEvaluation.fxml' },
    { label: 'Subir Acta de Cierre', view: 'GUIUploadClosureRecord', fxml: 'GUIUploadClosureRecord.fxml' },
    { label: 'Retroalimentación', view: 'GUIInternFeedback', fxml: 'GUIInternFeedback.fxml' },
  ],
};

// Indicadores de GUIWelcome.fxml por rol (valores ficticios)
const DASH: Record<Role, { tag: string; title: string; cards: { cat: string; value: string; sub: string; badge?: 'ok' | 'pend' }[] }> = {
  Coordinador: {
    tag: 'RESUMEN DEL SISTEMA', title: 'Estado general de las prácticas profesionales',
    cards: [
      { cat: 'PROYECTOS REGISTRADOS', value: '18', sub: 'Proyectos en el sistema' },
      { cat: 'PRACTICANTES ACTIVOS', value: '42', sub: 'Con práctica en curso' },
      { cat: 'REPORTES PENDIENTES', value: '7', sub: 'Sin revisar por los profesores' },
      { cat: 'LUGARES DISPONIBLES', value: '11', sub: 'En proyectos con vacantes abiertas' },
    ],
  },
  Practicante: {
    tag: '', title: '',
    cards: [
      { cat: 'ESTADO DE PRÁCTICAS', value: 'En curso', sub: 'Proyecto asignado', badge: 'ok' },
      { cat: 'REPORTES PENDIENTES', value: '1 reporte', sub: 'Reporte mensual de noviembre', badge: 'pend' },
      { cat: 'EVALUACIÓN DEL TUTOR', value: '—', sub: 'Disponible al asignar vacante' },
    ],
  },
  Profesor: {
    tag: 'RESUMEN DE ACTIVIDAD', title: 'Reportes y evaluaciones a tu cargo',
    cards: [
      { cat: 'REPORTES POR REVISAR', value: '5', sub: '5 reportes esperan calificación' },
      { cat: 'TOTAL REPORTES RECIBIDOS', value: '23', sub: 'Reportes asignados al período' },
      { cat: 'PRACTICANTES A CARGO', value: '9', sub: 'Con reportes enviados' },
      { cat: 'EVALUACIONES REALIZADAS', value: '18', sub: 'Reportes ya calificados' },
    ],
  },
  Administrador: {
    tag: 'PANEL DE ADMINISTRACIÓN', title: 'Resumen global de usuarios y recursos del sistema',
    cards: [
      { cat: 'COORDINADORES ACTIVOS', value: '2', sub: 'Coordinadores en el sistema' },
      { cat: 'PROFESORES ACTIVOS', value: '6', sub: 'Profesores registrados y activos' },
      { cat: 'PRACTICANTES ACTIVOS', value: '42', sub: 'Practicantes en curso' },
      { cat: 'PROYECTOS REGISTRADOS', value: '18', sub: 'Total en el sistema' },
    ],
  },
};

const INITIAL_PROJECTS = [
  { nrc: '48213', name: 'Portal de citas para clínica municipal', org: 'Laboratorio de Innovación Municipal', status: 'Activo', cap: 3, start: '2026-08-17', end: '2027-01-15' },
  { nrc: '48213', name: 'Inventario de equipo de cómputo', org: 'Soluciones Digitales del Golfo', status: 'Activo', cap: 2, start: '2026-08-17', end: '2027-01-15' },
  { nrc: '48214', name: 'App de seguimiento de pedidos', org: 'Comercializadora Las Ánimas', status: 'Activo', cap: 4, start: '2026-09-01', end: '2027-01-29' },
  { nrc: '48214', name: 'Tablero de indicadores académicos', org: 'Laboratorio de Innovación Municipal', status: 'Lleno', cap: 0, start: '2026-08-17', end: '2026-12-18' },
];

const LIKERT = [
  'Apliqué conocimientos teóricos en la práctica.',
  'Cumplí con los objetivos establecidos.',
  'Trabajé de forma colaborativa con el equipo.',
  'Administré adecuadamente mi tiempo.',
  'Demostré iniciativa y proactividad.',
  'Resolví problemas de manera efectiva.',
  'Recibí retroalimentación constructiva.',
  'Mejoré mis habilidades técnicas.',
  'Me comuniqué efectivamente con mi responsable.',
  'La práctica fue relevante para mi formación.',
];

function period() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 2 && m <= 7 ? `Periodo Feb-Jul ${y}` : `Periodo Ago-Ene ${m === 1 ? y - 1 : y}`;
}
function today() {
  const t = new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function SgppDemo() {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<ViewKey>('welcome');
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const menu = useMemo(() => (role ? [{ label: 'Inicio', view: 'welcome', fxml: 'GUIWelcome.fxml' }, ...MENUS[role]] : []), [role]);
  const current = menu.find(m => m.view === view) ?? menu[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-line-2 bg-[#1b1f24] text-[13px]" style={{ fontFamily: '"Montserrat","Segoe UI","Helvetica Neue",Arial,sans-serif' }}>
      {/* Barra de ventana */}
      <div className="flex h-9 items-center justify-between gap-3 bg-[#2b3038] px-3.5 text-[11px] text-[#c9ced6]">
        <span className="truncate">{role ? 'SGPP — Sistema de Gestión de Prácticas Profesionales' : 'Inicio de Sesión — SGPP'}</span>
        <span className="shrink-0 rounded bg-black/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#9fb3a8]">Recreación · JavaFX</span>
      </div>

      {!role ? (
        <Login onEnter={r => { setRole(r); setView('welcome'); }} />
      ) : (
        <div className="flex min-h-[600px] flex-col md:flex-row" style={{ background: C.bg, color: C.ink }}>
          {/* Sidebar (escritorio) */}
          <aside className="hidden shrink-0 flex-col text-white transition-[width] duration-300 md:flex" style={{ background: C.sidebar, width: collapsed ? 76 : 250 }}>
            <div className="flex items-center gap-2.5 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-bold">UV</div>
              {!collapsed && (
                <div>
                  <p className="text-[15px] font-bold leading-tight">SGPP</p>
                  <p className="text-[10px] text-white/70">Universidad Veracruzana</p>
                </div>
              )}
            </div>
            <hr className="mx-4 border-white/15" />
            {!collapsed && (
              <div className="flex flex-col items-center px-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold" style={{ background: C.orange }}>{USERS[role].initials}</div>
                <p className="mt-2 text-[12px] font-bold">{USERS[role].name}</p>
                <p className="text-[11px] text-white/70">{USERS[role].id}</p>
                <span className="mt-2 rounded-xl bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90">{role}</span>
              </div>
            )}
            {!collapsed && <p className="px-5 pb-1.5 pt-1 text-[10px] font-bold tracking-[0.12em] text-white/50">MENÚ PRINCIPAL</p>}
            <nav className="flex-1 overflow-y-auto px-2.5 pb-2" aria-label="Menú del SGPP">
              {menu.map(m => {
                const on = m.view === view;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setView(m.view)}
                    title={m.label}
                    className={`mb-0.5 block w-full truncate rounded-md px-3 py-2 text-left text-[12.5px] transition-colors ${on ? 'font-bold text-white' : 'text-white/80 hover:bg-white/10'}`}
                    style={on ? { background: C.accent } : undefined}
                  >
                    {collapsed ? m.label.slice(0, 2) : m.label}
                  </button>
                );
              })}
            </nav>
            <hr className="mx-4 border-white/15" />
            <button type="button" onClick={() => setCollapsed(c => !c)} className="flex items-center justify-between px-5 py-2.5 text-[11px] text-white/70 hover:text-white">
              {!collapsed && <span>Contraer</span>}<span aria-hidden="true">{collapsed ? '›' : '‹'}</span>
            </button>
            <button type="button" onClick={() => { setRole(null); setCollapsed(false); }} className="mx-3 mb-3 rounded-md border border-white/20 px-3 py-2 text-left text-[12px] text-white/90 hover:bg-white/10">
              {collapsed ? '→' : '→  Cerrar Sesión'}
            </button>
          </aside>

          {/* Menú en móvil */}
          <div className="flex items-center gap-2 px-3 py-2.5 text-white md:hidden" style={{ background: C.sidebar }}>
            <span className="text-[13px] font-bold">SGPP</span>
            <label className="sr-only" htmlFor="sgpp-menu">Sección</label>
            <select id="sgpp-menu" value={view} onChange={e => setView(e.target.value)} className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-2 py-2 text-[13px] text-white">
              {menu.map(m => <option key={m.label} value={m.view} className="text-black">{m.label}</option>)}
            </select>
            <button type="button" onClick={() => setRole(null)} className="rounded-md border border-white/20 px-2.5 py-2 text-[12px]">Salir</button>
          </div>

          {/* Área principal */}
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-3 sm:px-6" style={{ borderColor: C.border }}>
              <p className="text-[12px]" style={{ color: C.hint }}>
                SGPP <span className="mx-1">›</span> Sistema <span className="mx-1">›</span>
                <span className="font-semibold" style={{ color: C.ink }}>{view === 'welcome' ? 'Dashboard' : current?.label}</span>
              </p>
              <div className="text-right text-[11px] leading-tight">
                <p className="font-semibold" style={{ color: C.ink }}>{today()}</p>
                <p style={{ color: C.hint }}>{period()}</p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {view === 'welcome' && <Welcome role={role} />}
              {view === 'addProject' && <AddProject onSaved={p => { setProjects(ps => [p, ...ps]); setView('manageProject'); }} onCancel={() => setView('welcome')} />}
              {view === 'manageProject' && <ManageProject rows={projects} setRows={setProjects} />}
              {view === 'selfEval' && <SelfEval role={role} />}
              {!['welcome', 'addProject', 'manageProject', 'selfEval'].includes(view) && current && <NotRecreated label={current.label} fxml={current.fxml} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Pantallas ───────────────────────── */

function Login({ onEnter }: { onEnter: (r: Role) => void }) {
  const [role, setRole] = useState<Role>('Coordinador');
  return (
    <div className="flex min-h-[600px] items-center justify-center p-4 sm:p-8" style={{ background: 'linear-gradient(to bottom, #e8f1f8, #cfe0ee)', color: C.ink }}>
      <div className="w-full max-w-[420px] overflow-hidden rounded-[14px] bg-white shadow-[0_10px_40px_rgba(0,40,80,.15)]">
        <div className="flex items-center gap-3 px-7 pt-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-md text-[13px] font-bold text-white" style={{ background: C.accent }}>UV</div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: C.sub }}>UNIVERSIDAD</p>
            <p className="text-[18px] font-bold" style={{ color: C.accent }}>Veracruzana</p>
          </div>
        </div>
        <div className="mx-7 mt-5 rounded-r-lg py-2.5 pl-4 pr-3" style={{ background: '#e8f1f8', borderLeft: `5px solid ${C.accent}` }}>
          <p className="text-[13px] font-bold" style={{ color: C.accent }}>SGPP</p>
          <p className="text-[12px]" style={{ color: C.sub }}>Sistema de Gestión de Prácticas Profesionales</p>
        </div>
        <form className="px-7 pb-6 pt-5" onSubmit={e => { e.preventDefault(); onEnter(role); }}>
          <p className="text-[20px] font-bold">Bienvenido de nuevo</p>
          <p className="mt-1 text-[12px]" style={{ color: C.sub }}>Inicia sesión con tu matrícula, correo o número de personal.</p>
          <label className="mt-4 block text-[10px] font-bold tracking-[0.12em]" style={{ color: C.sub }}>USUARIO</label>
          <input readOnly value={USERS[role].id} aria-label="Usuario" className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-[13px]" style={{ borderColor: C.border, background: '#f8fafc' }} />
          <label className="mt-3 block text-[10px] font-bold tracking-[0.12em]" style={{ color: C.sub }}>CONTRASEÑA</label>
          <input readOnly type="password" value="demodemo" aria-label="Contraseña" className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-[13px]" style={{ borderColor: C.border, background: '#f8fafc' }} />
          <fieldset className="mt-4">
            <legend className="text-[10px] font-bold tracking-[0.12em]" style={{ color: C.sub }}>ENTRAR COMO (SOLO EN ESTA DEMO)</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {(Object.keys(USERS) as Role[]).map(r => (
                <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]" style={{ borderColor: r === role ? C.accent : C.border, background: r === role ? '#e8f1f8' : '#fff' }}>
                  <input type="radio" name="sgpp-role" checked={r === role} onChange={() => setRole(r)} className="accent-[#005691]" />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="mt-5 w-full rounded-lg py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90" style={{ background: C.accent }}>
            Iniciar Sesión
          </button>
          <p className="mt-5 text-center text-[11px]" style={{ color: C.hint }}>Luzio y Lis te dan la bienvenida</p>
        </form>
      </div>
    </div>
  );
}

function Welcome({ role }: { role: Role }) {
  const d = DASH[role];
  const first = USERS[role].name.split(' ')[0];
  return (
    <div>
      <p className="text-[24px] font-bold sm:text-[28px]">¡Bienvenido, {first.charAt(0) + first.slice(1).toLowerCase()}!</p>
      <p className="mt-1 text-[13px]" style={{ color: C.sub }}>{period()}</p>
      {d.tag && <p className="mt-6 text-[11px] font-bold tracking-[0.12em]" style={{ color: C.accent }}>{d.tag}</p>}
      {d.title && <p className="mt-1 text-[16px] font-bold">{d.title}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {d.cards.map(c => (
          <div key={c.cat} className="rounded-[10px] border bg-white p-4 shadow-[0_4px_18px_rgba(0,40,80,.06)]" style={{ borderColor: C.border }}>
            {c.badge && (
              <span className="mb-2 inline-block rounded-[10px] px-2 py-0.5 text-[10px] font-bold" style={c.badge === 'ok' ? { background: C.okBg, color: C.ok } : { background: C.pendBg, color: C.orange }}>
                {c.badge === 'ok' ? 'ACTIVO' : 'PENDIENTE'}
              </span>
            )}
            <p className="text-[11px] font-bold tracking-wide" style={{ color: C.sub }}>{c.cat}</p>
            <p className="mt-1 text-[24px] font-bold">{c.value}</p>
            <p className="text-[12px]" style={{ color: C.hint }}>{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[18px] text-white" style={{ background: C.accent }} aria-hidden="true">◯</div>
      <div>
        <p className="text-[11px] font-bold tracking-[0.12em]" style={{ color: C.accent }}>{tag}</p>
        <p className="text-[22px] font-bold leading-tight">{title}</p>
        <p className="mt-0.5 text-[13px]" style={{ color: C.sub }}>{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold">{label}<span style={{ color: '#d14343' }}> *</span></span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[11px]" style={{ color: '#d14343' }}>{error}</span>}
    </label>
  );
}
const inputCls = 'w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#005691] focus:ring-2 focus:ring-[#005691]/15';

function AddProject({ onSaved, onCancel }: { onSaved: (p: (typeof INITIAL_PROJECTS)[number]) => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: '', start: '', end: '', ee: '', cap: '', org: '', tech: '', desc: '', goal: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(v => ({ ...v, [k]: k === 'cap' ? e.target.value.replace(/\D/g, '').slice(0, 2) : e.target.value }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    (Object.keys(f) as (keyof typeof f)[]).forEach(k => { if (!f[k].trim()) er[k] = 'Campo obligatorio.'; });
    if (f.start && f.end && f.end <= f.start) er.end = 'La fecha de fin debe ser posterior a la de inicio.';
    if (f.cap && Number(f.cap) < 1) er.cap = 'El cupo debe ser mayor a cero.';
    setErrors(er);
    if (Object.keys(er).length) return;
    onSaved({ nrc: f.ee.slice(-5), name: f.name, org: f.org, status: 'Activo', cap: Number(f.cap), start: f.start, end: f.end });
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHeader tag="COORDINACIÓN · PROYECTOS" title="Registrar Proyecto" sub="Registra un nuevo proyecto de prácticas profesionales con su organización y responsable técnico." />
      <div className="rounded-[10px] border bg-white p-4 sm:p-6" style={{ borderColor: C.border }}>
        <p className="mb-4 text-[16px] font-bold">Información general del proyecto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nombre del proyecto" error={errors.name}><input className={inputCls} style={{ borderColor: C.border }} value={f.name} onChange={set('name')} /></Field></div>
          <Field label="Fecha inicio" error={errors.start}><input type="date" className={inputCls} style={{ borderColor: C.border }} value={f.start} onChange={set('start')} /></Field>
          <Field label="Fecha fin" error={errors.end}><input type="date" className={inputCls} style={{ borderColor: C.border }} value={f.end} onChange={set('end')} /></Field>
          <Field label="Experiencia Educativa" error={errors.ee}>
            <select className={inputCls} style={{ borderColor: C.border }} value={f.ee} onChange={set('ee')}>
              <option value="">Selecciona…</option><option>Prácticas Profesionales · NRC 48213</option><option>Prácticas Profesionales · NRC 48214</option>
            </select>
          </Field>
          <Field label="Cupo máximo" error={errors.cap}><input inputMode="numeric" placeholder="Ej. 5" className={inputCls} style={{ borderColor: C.border }} value={f.cap} onChange={set('cap')} /></Field>
          <Field label="Organización Vinculada" error={errors.org}>
            <select className={inputCls} style={{ borderColor: C.border }} value={f.org} onChange={set('org')}>
              <option value="">Selecciona…</option><option>Laboratorio de Innovación Municipal</option><option>Soluciones Digitales del Golfo</option><option>Comercializadora Las Ánimas</option>
            </select>
          </Field>
          <Field label="Responsable técnico" error={errors.tech}>
            <select className={inputCls} style={{ borderColor: C.border }} value={f.tech} onChange={set('tech')}>
              <option value="">Selecciona…</option><option>Ing. Carla Ruiz Méndez</option><option>Lic. Tomás Herrera</option>
            </select>
          </Field>
          <div className="sm:col-span-2"><Field label="Descripción" error={errors.desc}><textarea rows={3} className={inputCls} style={{ borderColor: C.border }} value={f.desc} onChange={set('desc')} /></Field></div>
          <div className="sm:col-span-2"><Field label="Objetivo del proyecto" error={errors.goal}><textarea rows={2} className={inputCls} style={{ borderColor: C.border }} value={f.goal} onChange={set('goal')} /></Field></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border bg-white px-4 py-2.5 text-[13px] font-semibold" style={{ borderColor: C.border }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white" style={{ background: C.accent }}>✓  Guardar</button>
        </div>
      </div>
    </form>
  );
}

function ManageProject({ rows, setRows }: { rows: typeof INITIAL_PROJECTS; setRows: (f: (r: typeof INITIAL_PROJECTS) => typeof INITIAL_PROJECTS) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  return (
    <div>
      <PageHeader tag="COORDINACIÓN · PROYECTOS" title="Gestión de Proyectos" sub="Selecciona un proyecto para actualizarlo o eliminarlo del catálogo." />
      <div className="rounded-[10px] border bg-white p-4 sm:p-5" style={{ borderColor: C.border }}>
        <p className="mb-3 text-[16px] font-bold">☰ Proyectos registrados</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr style={{ background: '#eef2f6', color: C.sub }}>
                {['NRC', 'Nombre', 'Organización', 'Estado', 'Cupo', 'F. Inicio', 'F. Fin'].map(h => <th key={h} className="border-b px-3 py-2 font-bold" style={{ borderColor: C.border }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.name + i}
                  onClick={() => { setSel(i); setMsg(''); }}
                  className="cursor-pointer"
                  style={sel === i ? { background: C.accent, color: '#fff' } : undefined}
                  aria-selected={sel === i}
                >
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.nrc}</td>
                  <td className="border-b px-3 py-2.5 font-medium" style={{ borderColor: C.border }}>{r.name}</td>
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.org}</td>
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.status}</td>
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.cap}</td>
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.start}</td>
                  <td className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p className="mt-3 rounded-lg px-3 py-2 text-[12px]" style={{ background: C.okBg, color: C.ok }} role="status">{msg}</p>}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setSel(null)} className="rounded-lg border bg-white px-4 py-2.5 text-[13px] font-semibold" style={{ borderColor: C.border }}>Cancelar</button>
          <button
            type="button"
            disabled={sel === null}
            onClick={() => { if (sel === null) return; const n = rows[sel].name; setRows(rs => rs.filter((_, i) => i !== sel)); setSel(null); setMsg(`Se eliminó "${n}" (simulación).`); }}
            className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: '#c0392b' }}
          >Eliminar</button>
          <button
            type="button"
            disabled={sel === null}
            onClick={() => setMsg('En el sistema original se abre GUIUpdateProject.fxml con los datos del proyecto seleccionado.')}
            className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: C.accent }}
          >Actualizar</button>
        </div>
      </div>
    </div>
  );
}

function SelfEval({ role }: { role: Role }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(LIKERT.length).fill(null));
  const [place, setPlace] = useState('');
  const [done, setDone] = useState(false);
  const complete = answers.every(a => a !== null) && place.trim().length > 0;
  const avg = answers.filter((a): a is number => a !== null).reduce((s, a, _, arr) => s + a / arr.length, 0);
  const u = USERS[role];
  return (
    <div>
      <PageHeader tag="PRACTICANTE · AUTOEVALUACIÓN" title="Generar Autoevaluación" sub="Completa la autoevaluación de tu desempeño en la práctica profesional para generar el documento." />
      <div className="grid gap-4">
        <div className="rounded-[10px] border bg-white p-4 sm:p-5" style={{ borderColor: C.border }}>
          <p className="mb-3 text-[16px] font-bold">☺ Datos del practicante</p>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[['Nombre', u.name], ['Matrícula', u.id], ['Organización', 'Soluciones Digitales del Golfo'], ['Departamento', 'Desarrollo de software'], ['Responsable', 'Ing. Carla Ruiz Méndez'], ['Proyecto', 'Inventario de equipo de cómputo']].map(([k, v]) => (
              <div key={k}><dt className="text-[11px] font-bold" style={{ color: C.sub }}>{k}</dt><dd className="text-[13px]">{v}</dd></div>
            ))}
          </dl>
        </div>
        <fieldset className="rounded-[10px] border bg-white p-4 sm:p-5" style={{ borderColor: C.border }}>
          <legend className="sr-only">Escala Likert</legend>
          <p className="mb-3 text-[13px] font-semibold" style={{ color: C.sub }}>★ Escala Likert · 1 (Totalmente en desacuerdo) a 5 (Totalmente de acuerdo)</p>
          <ol className="divide-y" style={{ borderColor: C.border }}>
            {LIKERT.map((q, i) => (
              <li key={q} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[13px]">{i + 1}. {q}</span>
                <span className="flex gap-1.5" role="radiogroup" aria-label={`Pregunta ${i + 1}`}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition-colors" style={answers[i] === n ? { background: C.accent, color: '#fff', borderColor: C.accent } : { borderColor: C.border }}>
                      <input type="radio" className="sr-only" name={`q${i}`} checked={answers[i] === n} onChange={() => setAnswers(a => a.map((v, j) => (j === i ? n : v)))} />
                      {n}
                    </label>
                  ))}
                </span>
              </li>
            ))}
          </ol>
        </fieldset>
        <div className="rounded-[10px] border bg-white p-4 sm:p-5" style={{ borderColor: C.border }}>
          <p className="mb-3 text-[16px] font-bold">✎ Firma</p>
          <Field label="Lugar y Fecha"><input className={inputCls} style={{ borderColor: C.border }} placeholder="ej. Xalapa, Ver., 25 de abril de 2026" value={place} onChange={e => setPlace(e.target.value)} /></Field>
          {done && <p className="mt-3 rounded-lg px-3 py-2 text-[12px]" style={{ background: C.okBg, color: C.ok }} role="status">Documento generado (simulación). Promedio de la autoevaluación: {avg.toFixed(1)} / 5.</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => { setAnswers(Array(LIKERT.length).fill(null)); setPlace(''); setDone(false); }} className="rounded-lg border bg-white px-4 py-2.5 text-[13px] font-semibold" style={{ borderColor: C.border }}>Cancelar</button>
            <button type="button" disabled={!complete} onClick={() => setDone(true)} className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40" style={{ background: C.accent }}>☰  Generar Documento</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotRecreated({ label, fxml }: { label: string; fxml: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="max-w-md rounded-[10px] border border-dashed bg-white p-6 text-center" style={{ borderColor: C.border }}>
        <p className="text-[16px] font-bold">{label}</p>
        <p className="mt-2 text-[13px]" style={{ color: C.sub }}>
          Esta pantalla existe en el sistema original (<code className="rounded bg-[#eef2f6] px-1.5 py-0.5 text-[12px]">{fxml}</code>), pero no está recreada en esta demo.
        </p>
        <p className="mt-3 text-[12px]" style={{ color: C.hint }}>
          Pantallas recreadas: Inicio, Registrar Proyecto y Actualizar Proyecto (coordinador) y Generar Autoevaluación (practicante).
        </p>
      </div>
    </div>
  );
}
