// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de proyectos del portafolio.
// Para agregar un proyecto: copia un objeto, cambia el `slug` y llena los campos.
// La página /proyectos/[slug] se genera sola. Las imágenes van en
// public/projects/<slug>/ (formato .webp) y se registran en content/images.json.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'Web' | 'Escritorio' | 'Full-Stack' | 'Backend' | 'Académico' | 'Cliente real' | 'Personal' | 'IA';

export type Kind = 'cliente' | 'academico' | 'personal';

export type GalleryImage = { src: string; alt: string; caption?: string; mobile?: boolean; pixel?: boolean };

export type ArchLayer = { label: string; nodes: { name: string; detail?: string; mine?: boolean }[] };

export type DemoKind = 'descuke' | 'sgpp' | 'pasadena' | 'simuladores' | null;

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  kind: Kind;
  kindLabel: string;
  status: string;
  categories: Category[];
  team: string;
  role: string;
  summary: string;
  problem: string;
  goals: string[];
  features: string[];
  stack: string[];
  architecture: { text: string; layers: ArchLayer[] };
  contributions: string[];
  evidence: { text: string; links: { label: string; href: string }[] };
  decisions: { title: string; text: string }[];
  cover?: string;
  coverAlt?: string;
  coverStyle?: 'screenshot' | 'pixel' | 'mobile';
  gallery: GalleryImage[];
  demo: DemoKind;
  demoNote?: string;
  code?: { file: string; lang: string; source: string };
  notes?: string[];
  timeline?: { when: string; what: string }[];
  retro?: string[];
  group: 'clientes' | 'propios' | 'equipo';
  featured: boolean;
};

export const CATEGORIES: Category[] = ['Web', 'Escritorio', 'Full-Stack', 'Backend', 'Académico', 'Cliente real', 'Personal', 'IA'];

export const projects: Project[] = [
  // ───────────────────────────────────────────────────────── DESCUKE
  {
    slug: 'descuke',
    title: 'Descuke',
    tagline: 'Prototipo de reservaciones, mesas y cuentas para un centro nocturno',
    year: '2026',
    kind: 'personal',
    kindLabel: 'Proyecto individual',
    status: 'Prototipo funcional',
    categories: ['Web', 'Full-Stack', 'Personal'],
    team: 'Desarrollo individual',
    role: 'Diseño, desarrollo y documentación',
    summary:
      'Aplicación web que diseñé y programé solo para un centro nocturno: reservar mesas por fecha, controlar llegadas, abrir cuentas por código QR y registrar comandas, con una vista distinta para cada rol del personal. Quedó como prototipo funcional; el negocio no llegó a implementarlo.',
    problem:
      'En un centro nocturno, las reservas, la asignación de mesas y las cuentas de cada noche suelen depender de mensajes y listas sueltas. La propuesta era un lugar único donde relaciones públicas reservara, la hostess confirmara llegadas, los meseros abrieran cuentas y la administración viera el estado completo.',
    goals: [
      'Reservar mesas sobre un croquis real del lugar y evitar dobles reservas.',
      'Separar permisos por rol: administración, relaciones públicas (RP), hostess y meseros.',
      'Abrir cuentas solo para reservas activas y registrar el consumo de cada mesa.',
      'Dar a los RP una imagen de la reserva lista para enviar al cliente.',
    ],
    features: [
      'Croquis interactivo en SVG con estados por mesa: disponible, reservada, llegó, no llegó y bloqueada.',
      'Reservas por fecha con promociones (cumpleaños, barra libre) y hora límite para RP.',
      'Rol de hostess para marcar llegadas en la entrada.',
      'Módulo de meseros: apertura de cuenta escaneando el QR de la mesa o buscándola a mano.',
      'Comandas con catálogo de productos, promociones y cálculo de subtotales.',
      'Panel de estadísticas semanal y ranking de RP.',
      'Generación de QR imprimibles por mesa.',
      'Imagen de la reserva generada en el navegador (Canvas) para compartir.',
      'Impresión de la lista de reservas y de cumpleaños del día.',
    ],
    stack: ['JavaScript (ES Modules)', 'HTML', 'CSS', 'SVG', 'Canvas API', 'Firebase Firestore', 'Firebase Auth', 'Firebase Hosting'],
    architecture: {
      text:
        'Aplicación de una sola página sin framework. El código está dividido por responsabilidad: vistas que generan el HTML, servicios que hablan con Firestore, un módulo central de reglas de acceso y un estado compartido. Firestore se escucha en tiempo real, así que todas las pantallas abiertas se actualizan cuando alguien reserva o abre una cuenta.',
      layers: [
        { label: 'Interfaz', nodes: [{ name: 'Vistas por rol', detail: 'reservas, croquis, meseros, cuentas, estadísticas', mine: true }, { name: 'Página de mesa', detail: 'mesa.html, abre la cuenta desde el QR', mine: true }] },
        { label: 'Lógica', nodes: [{ name: 'Reglas de acceso', detail: 'permisos por rol en un solo módulo', mine: true }, { name: 'Servicios', detail: 'reservas, cuentas, comandas, promociones', mine: true }] },
        { label: 'Datos', nodes: [{ name: 'Firestore', detail: 'suscripciones en tiempo real' }, { name: 'Firebase Auth', detail: 'inicio de sesión del personal' }] },
      ],
    },
    contributions: [
      'Desarrollé la aplicación completa de forma individual, incluida la interfaz con estética oscura y acentos neón.',
      'Implementé los cuatro roles y concentré los permisos en un módulo de reglas de acceso.',
      'Construí el croquis en SVG, el flujo de reservas y el módulo de meseros con comandas.',
      'Programé la imagen para compartir la reserva con Canvas.',
      'Reorganicé el código en módulos por capa y documenté la causa y la solución de las incidencias del módulo de meseros.',
    ],
    evidence: {
      text: 'El código fuente no está publicado. La demo de arriba ejecuta ese mismo código; solo se sustituyó la conexión a Firebase por una base de datos simulada con datos ficticios.',
      links: [],
    },
    decisions: [
      {
        title: 'Reglas de acceso en un solo módulo',
        text: 'Todas las preguntas del tipo "¿este usuario puede…?" viven en access-rules.js. Cuando apareció un error (se podían abrir cuentas en reservas marcadas como "no llegó"), la corrección se hizo en un solo lugar y se reutilizó en la vista de meseros y en la página del QR.',
      },
      {
        title: 'Tiempo real con Firestore',
        text: 'Las vistas se suscriben a las colecciones con onSnapshot. La hostess, los RP y los meseros ven los cambios al momento sin recargar la página.',
      },
      {
        title: 'Sin framework',
        text: 'El proyecto usa JavaScript con módulos nativos y se publica como sitio estático en Firebase Hosting. Sin paso de compilación, cualquier cambio se prueba y se despliega en segundos.',
      },
    ],
    cover: '/projects/descuke/croquis.webp',
    coverAlt: 'Croquis interactivo de mesas de Descuke con estados de reserva',
    coverStyle: 'screenshot',
    gallery: [
      { src: '/projects/descuke/reservas.webp', alt: 'Panel de reservas del día con indicadores de asistencia', caption: 'Reservas del día con filtros y tasa de asistencia.' },
      { src: '/projects/descuke/croquis.webp', alt: 'Croquis de mesas en SVG', caption: 'Croquis con el estado de cada mesa.' },
      { src: '/projects/descuke/nueva_reserva.webp', alt: 'Formulario para crear una reserva desde el croquis', caption: 'Nueva reserva desde una mesa libre.' },
      { src: '/projects/descuke/compartir.webp', alt: 'Imagen de la reserva generada para compartir', caption: 'Imagen de la reserva generada con Canvas.' },
      { src: '/projects/descuke/cuenta.webp', alt: 'Cuenta de una mesa con comandas registradas', caption: 'Cuenta abierta con comandas y catálogo.' },
      { src: '/projects/descuke/estadisticas.webp', alt: 'Panel de estadísticas semanales y ranking de RP', caption: 'Estadísticas semanales y ranking de RP.' },
      { src: '/projects/descuke/movil_hostess.webp', alt: 'Vista móvil de la hostess', caption: 'Vista móvil de la hostess.', mobile: true },
    ],
    demo: 'descuke',
    demoNote:
      'Es el código real de la aplicación. La conexión a Firebase se reemplazó por una base de datos simulada en el navegador con nombres, reservas y productos ficticios. Los cambios se eliminan al cerrar la pestaña.',
    notes: ['El proyecto no llegó a implementarse en el negocio.', 'La demo usa un catálogo ficticio y no incluye el logo ni los datos del negocio.'],
    group: 'propios',
    timeline: [
      { when: "may 2026", what: "Primeras versiones: reservas por fecha, roles y el croquis de mesas." },
      { when: "jun 2026", what: "Módulo de meseros, catálogo de productos y promociones, y corrección de las incidencias que documenté." },
    ],
    retro: [
      "No guardaría las contraseñas en Firestore: Firebase Auth ya se encarga de eso y ahí sobran.",
      "Agregaría pruebas automatizadas a las reglas de acceso, que es donde más errores aparecieron.",
      "Lo probaría con el personal desde el principio; se quedó en prototipo antes de llegar a usarse en una noche real.",
    ],
    featured: true,
  },

  // ───────────────────────────────────────────────────────── SIMULADORES
  {
    slug: 'simuladores-exani-usicamm',
    title: 'Simuladores EXANI-I y USICAMM',
    tagline: 'Aplicaciones de práctica de examen para un centro de formación',
    year: '2025',
    kind: 'cliente',
    kindLabel: 'Cliente real',
    status: 'Entregado y en uso',
    categories: ['Escritorio', 'Cliente real'],
    team: 'Desarrollo individual',
    role: 'Requerimientos con el cliente, desarrollo y entrega',
    summary:
      'Dos aplicaciones de escritorio en C# y WPF para que los aspirantes del Centro de Formación Juan de Zumárraga (Perote, Veracruz) practiquen el EXANI-I, examen de ingreso a nivel superior, y la evaluación USICAMM de admisión docente, con tiempo límite y resultados al terminar. El centro los sigue usando.',
    problem:
      'El centro prepara aspirantes para el examen de ingreso a la universidad y para la admisión a la carrera docente. Necesitaba una herramienta propia para que practicaran con reactivos del tipo que aparece en el examen y con el mismo límite de tiempo.',
    goals: [
      'Simular las condiciones del examen: reactivos por módulo, tiempo límite global y sin pausas.',
      'Que el centro pudiera actualizar el banco de preguntas sin tocar el código.',
      'Mostrar al aspirante su resultado y una recomendación al terminar.',
    ],
    features: [
      'EXANI-I: 113 reactivos en 4 módulos (pensamiento matemático, pensamiento analítico, estructura de la lengua y comprensión lectora), con lecturas y reactivos con imagen.',
      'USICAMM: 91 reactivos de 44 temas y tres tipos de pregunta: opción múltiple, tabla de verdadero/falso y relacionar columnas.',
      'Temporizador global de 2 horas (EXANI-I) y 3 horas (USICAMM); al agotarse, el examen termina solo.',
      'Pantalla de resultados con aciertos, porcentaje y un mensaje según el desempeño (90 % o más, 70 % o más, menos de 70 %).',
      'Banco de preguntas en un archivo JSON incrustado en la aplicación.',
    ],
    stack: ['C#', '.NET Framework 4.7.2', 'WPF', 'XAML', 'MVVM', 'Newtonsoft.Json'],
    architecture: {
      text:
        'Ambas aplicaciones siguen el patrón MVVM: un MainViewModel cambia entre las vistas de inicio, examen y resultados; los view models exponen comandos (RelayCommand) y notifican cambios a la interfaz (ViewModelBase). Las preguntas se cargan desde un JSON incrustado como recurso y se deserializan con Newtonsoft.Json.',
      layers: [
        { label: 'Vistas', nodes: [{ name: 'InicioView', mine: true }, { name: 'ExamenView', detail: 'plantillas por tipo de pregunta', mine: true }, { name: 'ResultadosView', mine: true }] },
        { label: 'View models', nodes: [{ name: 'MainViewModel', detail: 'navegación entre pantallas', mine: true }, { name: 'ExamenViewModel', detail: 'temporizador y calificación', mine: true }, { name: 'ResultadosViewModel', mine: true }] },
        { label: 'Modelo y datos', nodes: [{ name: 'Pregunta, Opción, ItemEvaluacion', mine: true }, { name: 'banco_preguntas.json', detail: 'recurso incrustado', mine: true }] },
      ],
    },
    contributions: [
      'Levanté los requerimientos directamente con el cliente.',
      'Desarrollé ambas aplicaciones de forma individual, de la interfaz a la lógica de calificación.',
      'Diseñé el modelo de preguntas de USICAMM para soportar tres tipos de reactivo con una sola vista y plantillas distintas.',
      'Capturé los bancos de preguntas en JSON (113 y 91 reactivos) y entregué el software funcionando; el centro lo sigue usando con sus aspirantes.',
    ],
    evidence: {
      text: 'El código pertenece al cliente y no está publicado. Revisé ambos proyectos completos para escribir esta página; la recreación de arriba sigue sus vistas XAML y su lógica, pero usa preguntas de ejemplo en lugar del banco real.',
      links: [],
    },
    decisions: [
      {
        title: 'MVVM con navegación por view model',
        text: 'Un solo MainViewModel decide qué pantalla se muestra según el view model activo. La ventana no conoce las vistas, lo que mantuvo el flujo inicio → examen → resultados en un solo lugar.',
      },
      {
        title: 'Preguntas como datos',
        text: 'El banco vive en un JSON y no en el código. Agregar o corregir un reactivo no requiere tocar la lógica, y el mismo esqueleto sirvió para los dos simuladores.',
      },
      {
        title: 'Tipos de reactivo en el modelo',
        text: 'En USICAMM cada pregunta declara su tipo (opción múltiple, verdadero/falso o relacionar) y la vista elige la plantilla. En verdadero/falso el punto solo cuenta si todas las filas son correctas.',
      },
    ],
    cover: '/projects/simuladores-exani-usicamm/recreacion-usicamm.webp',
    coverAlt: 'Recreación de un reactivo de verdadero o falso del simulador USICAMM',
    coverStyle: 'screenshot',
    gallery: [],
    demo: 'simuladores',
    demoNote:
      'Recreación visual hecha en React a partir de las vistas XAML y los view models: pantallas, textos, colores, temporizador y cálculo del resultado son los del programa. Las preguntas son ejemplos escritos para el portafolio; el banco real del cliente y su logo no se publican.',
    group: 'clientes',
    retro: [
      "Haría que los reactivos de relacionar columnas cuenten en la calificación de USICAMM; hoy solo cuentan opción múltiple y verdadero/falso.",
      "Mostraría la argumentación de cada reactivo al terminar: el banco ya la trae y ayudaría mucho a estudiar.",
      "Calcularía el total de reactivos desde el banco en lugar de escribirlo en la vista, y avisaría si el archivo de preguntas no carga.",
    ],
    featured: true,
  },

  // ───────────────────────────────────────────────────────── SGPP
  {
    slug: 'sgpp',
    title: 'SGPP',
    tagline: 'Sistema de Gestión de Prácticas Profesionales',
    year: '2026',
    kind: 'academico',
    kindLabel: 'Académico · equipo de 2',
    status: 'Completado',
    categories: ['Escritorio', 'Backend', 'Académico'],
    team: 'Equipo de dos personas',
    role: 'Capa de acceso a datos, pruebas, tema visual y documentación UML',
    summary:
      'Aplicación de escritorio en Java para administrar las prácticas profesionales de la carrera: practicantes, proyectos, organizaciones vinculadas, reportes y evaluaciones. Cada rol (administrador, coordinador, profesor y practicante) tiene su propio menú.',
    problem:
      'El seguimiento de las prácticas profesionales involucra a coordinadores, profesores, practicantes y organizaciones externas, con documentos y evaluaciones en cada etapa. El sistema concentra ese proceso en una sola aplicación.',
    goals: [
      'Modelar el proceso completo de prácticas con la metodología ICONIX.',
      'Separar la interfaz, la lógica y el acceso a datos en capas.',
      'Probar automáticamente la capa de acceso a datos.',
    ],
    features: [
      'Inicio de sesión y menú lateral según el rol del usuario.',
      'Registro de proyectos, organizaciones vinculadas, responsables técnicos y practicantes.',
      'Asignación de proyectos y solicitudes de los practicantes.',
      'Reportes mensuales, autoevaluaciones y evaluaciones de la organización.',
      'Generación de documentos y retroalimentación al practicante.',
      'Paneles de inicio con indicadores distintos para cada rol.',
    ],
    stack: ['Java 21', 'JavaFX', 'FXML', 'CSS', 'JDBC', 'MySQL', 'JUnit 5', 'UML', 'ICONIX', 'Enterprise Architect'],
    architecture: {
      text:
        'Arquitectura por capas. Las vistas FXML y sus controladores forman la interfaz; la lógica accede a la base de datos solo a través de DAOs definidos por interfaces; los DTOs transportan los datos entre capas. Los errores de base de datos se traducen a excepciones propias antes de llegar a la interfaz.',
      layers: [
        { label: 'Interfaz', nodes: [{ name: 'Vistas FXML + CSS', detail: 'tema visual y refactorización', mine: true }, { name: 'Controladores JavaFX' }] },
        { label: 'Lógica', nodes: [{ name: 'Interfaces DAO', mine: true }, { name: 'DTOs', mine: true }, { name: 'Excepciones propias', detail: 'duplicados, integridad, validación', mine: true }] },
        { label: 'Datos', nodes: [{ name: 'DAOs con JDBC', mine: true }, { name: 'MySQL' }] },
        { label: 'Pruebas', nodes: [{ name: 'JUnit 5', detail: 'suite de los DAOs y builders de datos', mine: true }] },
      ],
    },
    contributions: [
      'Creé 10 DAOs, 13 interfaces y 7 DTOs, entre ellos los de proyectos, solicitudes, asignaciones, evaluaciones, profesores y roles de usuario.',
      'Agregué excepciones propias para entradas duplicadas, integridad referencial y validación.',
      'Escribí la suite de pruebas de los DAOs con JUnit 5, con constructores de datos de prueba y un script de limpieza de la base de datos.',
      'Diseñé el tema visual (SGPPTheme.css y unas 30 hojas de estilo) y refactoricé las vistas de inicio de sesión, menú principal, bienvenida y formularios.',
      'Desarrollé la vista y el controlador para generar la autoevaluación del practicante.',
      'Elaboré la documentación UML con ICONIX: casos de uso, modelo de dominio, robustez, secuencia y actividad.',
    ],
    evidence: {
      text: 'El historial de Git del repositorio muestra la autoría de cada archivo. Mi trabajo está en las ramas aocp-developer y acop-developer-Rebase.',
      links: [{ label: 'Repositorio en GitHub', href: 'https://github.com/owsy12/SistemaParaPracticasProfesionales' }],
    },
    decisions: [
      {
        title: 'Interfaces para cada DAO',
        text: 'Los controladores dependen de interfaces como IProjectDAO y no de la implementación. Eso permitió probar los DAOs por separado y cambiar consultas sin tocar la interfaz.',
      },
      {
        title: 'Errores de MySQL traducidos',
        text: 'El error 1062 de MySQL (entrada duplicada) se convierte en DuplicateEntryException. La interfaz muestra un mensaje claro en lugar de un error de SQL.',
      },
      {
        title: 'Datos de prueba con builders',
        text: 'Cada entidad tiene un TestDataBuilder. Así cada prueba arma solo los datos que necesita y la base se limpia con un script al terminar.',
      },
    ],
    cover: '/projects/sgpp/recreacion-panel.webp',
    coverAlt: 'Recreación de la pantalla principal del SGPP',
    coverStyle: 'screenshot',
    gallery: [],
    demo: 'sgpp',
    demoNote:
      'Recreación visual hecha en React a partir de los archivos FXML y CSS del proyecto: textos, menús por rol y colores son los del sistema original. No ejecuta el programa Java ni se conecta a una base de datos.',
    group: 'equipo',
    timeline: [
      { when: "mar 2026", what: "Arranca el proyecto. Primeros DAOs, interfaces y DTOs de proyectos y solicitudes." },
      { when: "abr 2026", what: "Conexión a la base de datos, primeras vistas y excepciones para el registro." },
      { when: "may 2026", what: "Vista de autoevaluación y rediseño de las vistas con el tema CSS." },
      { when: "jun 2026", what: "Suite de pruebas con JUnit 5, corrección de los errores de una auditoría técnica y entrega." },
    ],
    retro: [
      "Dejaría la versión final en la rama main con un README que explique cómo correrlo; hoy el código vive en otras ramas.",
      "Usaría Maven para las dependencias en lugar de JAR locales en la carpeta lib.",
      "Sacaría el archivo .env del historial de Git desde el primer día.",
    ],
    featured: true,
  },

  // ───────────────────────────────────────────────────────── PROPIFY
  {
    slug: 'propify',
    title: 'Propify',
    tagline: 'Plataforma inmobiliaria con microservicios',
    year: '2026',
    kind: 'academico',
    kindLabel: 'Académico · equipo',
    status: 'Completado',
    categories: ['Web', 'Académico'],
    team: 'Equipo de tres personas',
    role: 'Rediseño del frontend (sistema de diseño v2)',
    summary:
      'Plataforma web para publicar, buscar y contratar inmuebles en venta o renta, con panel de administración, contratos y pagos. El frontend está en React y el backend en microservicios con FastAPI.',
    problem:
      'Buscar inmueble implica comparar muchas opciones, agendar visitas y luego formalizar un contrato. Propify reúne ese proceso: catálogo con filtros, detalle del inmueble, solicitudes, visitas y contratos.',
    goals: [
      'Ofrecer un catálogo con filtros por tipo, operación, uso, precio y recámaras.',
      'Dar al administrador herramientas para inmuebles, usuarios, solicitudes y contratos.',
      'Que la interfaz se vea profesional y funcione en móvil.',
    ],
    features: [
      'Portada con buscador, filtros avanzados y catálogo de inmuebles.',
      'Detalle con galería, características, mapa y agenda de visitas.',
      'Registro, inicio de sesión y verificación de correo.',
      'Panel de administración: inmuebles, usuarios, solicitudes, contratos, rentas, ventas y visitas.',
      'Contratos con cláusulas y pagos con Stripe.',
    ],
    stack: ['React 19', 'Vite', 'React Router', 'CSS (tokens de diseño)', 'Leaflet', 'FastAPI', 'Docker', 'Nginx'],
    architecture: {
      text:
        'El frontend en React consume una API detrás de un gateway Nginx, que reparte las peticiones entre microservicios de usuarios, inmuebles, contratos y pagos. Todo se levanta con Docker.',
      layers: [
        { label: 'Cliente', nodes: [{ name: 'Frontend React', detail: 'rediseño visual completo', mine: true }] },
        { label: 'Entrada', nodes: [{ name: 'Gateway Nginx' }] },
        { label: 'Servicios', nodes: [{ name: 'user-service' }, { name: 'property-service' }, { name: 'contract-service' }, { name: 'payment-service' }] },
      ],
    },
    contributions: [
      'Implementé un sistema de diseño con tokens CSS: paleta, escala de neutros, colores semánticos, tipografía, espaciado y sombras.',
      'Rediseñé la barra de navegación (menú responsivo y desplegable de administración) y el pie de página.',
      'Rehice la portada con buscador, la tarjeta de inmueble y la página de detalle con galería y barra lateral fija.',
      'Rediseñé las pantallas de autenticación, la página 404 y los componentes de alerta, modal y carga.',
    ],
    evidence: {
      text: 'El rediseño está en un solo commit mío: 12 archivos y más de 1,300 líneas, en las ramas oswaldo-develop y jbh-develoop. El backend lo desarrollaron mis compañeros.',
      links: [{ label: 'Repositorio en GitHub', href: 'https://github.com/queenprotea/Propify' }],
    },
    decisions: [
      {
        title: 'Tokens antes que componentes',
        text: 'Primero definí variables CSS para color, tipografía, espacio y sombras, y después rediseñé cada pantalla con ellas. El resultado es consistente y fácil de ajustar.',
      },
    ],
    cover: '/projects/propify/home.webp',
    coverAlt: 'Portada de Propify con buscador de inmuebles',
    coverStyle: 'screenshot',
    gallery: [
      { src: '/projects/propify/home.webp', alt: 'Portada de Propify con buscador', caption: 'Portada con buscador.' },
      { src: '/projects/propify/catalogo.webp', alt: 'Catálogo de inmuebles en tarjetas', caption: 'Catálogo con tarjetas de inmueble.' },
      { src: '/projects/propify/detalle.webp', alt: 'Detalle de un inmueble con galería', caption: 'Detalle con galería y barra lateral.' },
      { src: '/projects/propify/login.webp', alt: 'Pantalla de inicio de sesión', caption: 'Inicio de sesión.' },
      { src: '/projects/propify/movil.webp', alt: 'Portada de Propify en móvil', caption: 'Vista móvil.', mobile: true },
    ],
    demo: null,
    notes: [
      'Las capturas se tomaron ejecutando el frontend real con respuestas de API simuladas. Los inmuebles y sus ilustraciones son ficticios.',
    ],
    group: 'equipo',
    timeline: [
      { when: "may 2026", what: "El equipo arranca el backend en microservicios." },
      { when: "jun 2026", what: "Hago el rediseño completo del frontend y se prepara el despliegue." },
    ],
    retro: [
      "Dividiría la hoja de estilos global (unas 800 líneas) en estilos por componente para que sea más fácil de mantener.",
    ],
    featured: true,
  },

  // ───────────────────────────────────────────────────────── PASADENA
  {
    slug: 'pasadena',
    title: 'Pasadena',
    tagline: 'Plataforma de streaming musical con microservicios',
    year: '2025',
    kind: 'academico',
    kindLabel: 'Académico · equipo',
    status: 'Prototipo de interfaz',
    categories: ['Escritorio', 'Académico'],
    team: 'Equipo de cuatro personas; mi participación fue el frontend (vistas)',
    role: 'Vistas del cliente en .NET MAUI',
    summary:
      'Plataforma para escuchar música, crear playlists y seguir a otros usuarios. El backend se dividió en microservicios (FastAPI y Go) con PostgreSQL y MongoDB; yo construí las vistas del cliente.',
    problem:
      'El reto del curso era diseñar una plataforma distribuida: autenticación, metadatos, playlists, perfiles y transmisión de audio como servicios independientes detrás de un gateway.',
    goals: [
      'Diseñar las pantallas principales del cliente.',
      'Cubrir tanto el flujo del usuario como el del administrador.',
    ],
    features: [
      'Pantalla de inicio con biblioteca, recomendaciones y reproductor.',
      'Perfil, edición de información personal y página social para seguir usuarios.',
      'Crear y editar playlists y agregar canciones.',
      'Panel de administración para gestionar usuarios y canciones.',
    ],
    stack: ['C#', '.NET MAUI', 'XAML', 'FastAPI', 'Go', 'gRPC', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker Compose', 'Nginx'],
    architecture: {
      text:
        'Un gateway Nginx enruta las peticiones REST y gRPC hacia seis servicios: autenticación, usuarios, playlists, administración y metadatos en FastAPI, y transmisión de audio en Go. Cada servicio tiene su propia base de datos.',
      layers: [
        { label: 'Cliente', nodes: [{ name: 'Vistas .NET MAUI', detail: 'inicio, perfil, social, playlists, admin', mine: true }] },
        { label: 'Entrada', nodes: [{ name: 'Gateway Nginx', detail: 'REST y gRPC' }] },
        { label: 'Servicios', nodes: [{ name: 'auth' }, { name: 'user' }, { name: 'playlist' }, { name: 'admin' }, { name: 'metadata' }, { name: 'streaming (Go)' }] },
        { label: 'Datos', nodes: [{ name: 'PostgreSQL' }, { name: 'MongoDB' }, { name: 'Redis' }] },
      ],
    },
    contributions: [
      'Construí 10 vistas del cliente en .NET MAUI (XAML y C#): inicio, perfil, edición de perfil, social, crear y editar playlist, agregar canción y tres pantallas de administración de usuarios y canciones.',
      'Configuré la estructura base del proyecto MAUI y la navegación entre páginas con Shell.',
      'Las vistas usan datos de ejemplo; la conexión con los servicios quedó pendiente.',
    ],
    evidence: {
      text: 'Mis 11 commits están en el repositorio del cliente. El backend está en el repositorio principal y lo desarrollaron mis compañeros.',
      links: [
        { label: 'Repositorio del cliente', href: 'https://github.com/queenprotea/pasadena-frontend' },
        { label: 'Repositorio del backend', href: 'https://github.com/x3776x/pasadena' },
      ],
    },
    decisions: [
      {
        title: 'Navegación con Shell',
        text: 'Cada página se registra como ruta en AppShell y se navega con GoToAsync, lo que mantiene las vistas independientes entre sí.',
      },
    ],
    cover: '/projects/pasadena/recreacion-inicio.webp',
    coverAlt: 'Recreación de la pantalla de inicio de Pasadena',
    coverStyle: 'screenshot',
    gallery: [],
    demo: 'pasadena',
    demoNote: 'Recreación visual hecha en React a partir de los archivos XAML: estructura, textos y colores son los de las vistas originales. No ejecuta la aplicación .NET MAUI.',
    group: 'equipo',
    timeline: [
      { when: "sep 2025", what: "El equipo arranca el backend." },
      { when: "oct 2025", what: "Hago las 10 vistas del cliente en .NET MAUI." },
      { when: "ene 2026", what: "Último avance del backend." },
    ],
    retro: [
      "Conectaría las vistas con los servicios en lugar de dejar datos de ejemplo.",
      "Usaría view models con bindings en todas las pantallas; varias tienen la lógica en el code-behind.",
    ],
    featured: false,
  },

  // ───────────────────────────────────────────────────────── API REST
  {
    slug: 'api-rest-usuarios',
    title: 'API REST de usuarios',
    tagline: 'Pruebas automatizadas, documentación y autenticación con JWT',
    year: '2025',
    kind: 'academico',
    kindLabel: 'Académico',
    status: 'Completado',
    categories: ['Backend', 'Académico'],
    team: 'Sobre una base existente',
    role: 'Pruebas, documentación y autenticación',
    summary:
      'API en Node.js y Express con Sequelize y MySQL. Partí de una base existente y agregué las pruebas automatizadas, la documentación con Swagger y la autenticación con JWT firmados con llaves RSA.',
    problem:
      'La API funcionaba, pero no tenía pruebas, documentación ni protección de rutas. El trabajo consistió en volverla verificable y segura.',
    goals: [
      'Probar controladores y endpoints de forma automática.',
      'Documentar la API para que otro desarrollador pueda usarla sin leer el código.',
      'Proteger rutas con tokens.',
    ],
    features: [
      'Pruebas unitarias del controlador de usuarios con Jest.',
      'Pruebas de integración de los endpoints con Supertest.',
      'Documentación interactiva con Swagger UI.',
      'Inicio de sesión que emite JWT firmados con RS256 y middleware que los verifica.',
    ],
    stack: ['Node.js', 'Express', 'Sequelize', 'MySQL', 'Jest', 'Supertest', 'Swagger', 'JWT (RS256)'],
    architecture: {
      text: 'Rutas de Express que pasan por un middleware de verificación de token antes de llegar a los controladores; Sequelize se encarga del acceso a MySQL.',
      layers: [
        { label: 'Entrada', nodes: [{ name: 'Rutas Express' }, { name: 'Middleware JWT', mine: true }, { name: 'Swagger UI', mine: true }] },
        { label: 'Lógica', nodes: [{ name: 'Controladores', detail: 'usuarios y autenticación', mine: true }] },
        { label: 'Datos', nodes: [{ name: 'Sequelize' }, { name: 'MySQL' }] },
        { label: 'Pruebas', nodes: [{ name: 'Jest + Supertest', mine: true }] },
      ],
    },
    contributions: [
      'Escribí las pruebas unitarias y de integración con Jest y Supertest.',
      'Documenté los endpoints con swagger-jsdoc y Swagger UI.',
      'Implementé el inicio de sesión con JWT firmados con llaves RSA y el middleware que protege las rutas.',
    ],
    evidence: {
      text: 'Mis tres commits en el repositorio corresponden a cada una de estas partes.',
      links: [{ label: 'Repositorio en GitHub', href: 'https://github.com/owsy12/express-sequelize-tests' }],
    },
    decisions: [
      {
        title: 'Llaves RSA en lugar de un secreto compartido',
        text: 'Con RS256, solo quien tiene la llave privada puede firmar tokens; cualquier servicio puede verificarlos con la pública.',
      },
    ],
    gallery: [],
    demo: null,
    code: {
      file: '__tests__/usuario.integration.test.js',
      lang: 'javascript',
      source: `describe('API /api/usuarios (integración)', () => {
  test('Debe rechazar creación de usuario sin email', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ nombre: 'Andrés', pass: 'secreto123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('ok', false);
    expect(res.body).toHaveProperty('errores');
  });

  test('Debe obtener lista de usuarios', async () => {
    const res = await request(app).get('/api/usuarios');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.usuarios)).toBe(true);
  });
});`,
    },
    group: 'equipo',
    timeline: [
      { when: "may 2025", what: "Se sube la base de la API." },
      { when: "nov 2025", what: "Agrego las pruebas, la documentación con Swagger y la autenticación con JWT." },
    ],
    retro: [
      "No subiría la llave privada ni el archivo .env al repositorio; irían en variables de entorno.",
    ],
    featured: false,
  },

  // ───────────────────────────────────────────────────────── AVENTURA CAPTURA 2D
  {
    slug: 'aventura-captura-2d',
    title: 'Aventura Captura 2D',
    tagline: 'RPG 2D en Godot 4 hecho con vibe coding: dirigir a la IA y verificar el resultado',
    year: '2026',
    kind: 'personal',
    kindLabel: 'Desarrollo con IA',
    status: 'En desarrollo · etapa 3 de 4',
    categories: ['Personal', 'IA'],
    team: 'Individual, con Claude (de Anthropic) como asistente de IA',
    role: 'Dirección del desarrollo con IA: especificación, prompts y verificación',
    summary:
      'Juego de rol en pixel art construido con vibe coding: definí el juego y sus etapas, y Claude, el asistente de IA de Anthropic, escribió el código bajo mi dirección. El resultado son unas 6,900 líneas de GDScript, contenido original y tres suites de pruebas automatizadas que pasan.',
    problem: 'Evaluar cómo llevar un proyecto extenso con asistencia de IA manteniendo el control: que el resultado funcione, esté organizado y se pueda verificar.',
    goals: [
      'Construir el juego por etapas jugables, cada una con un alcance cerrado.',
      'Mantener separados los datos (especies, movimientos, tipos, objetos) y el código.',
      'Cubrir la lógica con pruebas automatizadas que se puedan volver a correr.',
    ],
    features: [
      'Movimiento por casillas, interiores, transiciones y compañero que sigue al jugador.',
      'Criaturas visibles en la hierba alta con rareza, tamaños y carácter propio.',
      'Captura por lanzamiento con círculo de precisión.',
      'Combate por turnos con 18 tipos, estados, críticos, experiencia y evoluciones.',
      'Mochila, CriaDex, PC, tienda, centro de cuidados y guardado de partida.',
    ],
    stack: ['Godot 4', 'GDScript', 'JSON', 'Claude (Anthropic)', 'Ingeniería de prompts'],
    architecture: {
      text: 'Escenas de Godot para mundo, captura, combate e interfaz; autoloads para el estado global; especies, movimientos, tipos, objetos y diálogos definidos en archivos JSON.',
      layers: [
        { label: 'Escenas', nodes: [{ name: 'Mundo' }, { name: 'Captura' }, { name: 'Combate' }, { name: 'Interfaz' }] },
        { label: 'Núcleo', nodes: [{ name: 'Autoloads', detail: 'estado del juego y ajustes' }, { name: 'battle_math', detail: 'fórmulas de combate' }] },
        { label: 'Datos', nodes: [{ name: 'JSON', detail: 'especies, movimientos, tipos, objetos' }] },
      ],
    },
    contributions: [
      'Definí el juego, su estilo visual y un plan de cuatro etapas, cada una con su lista de funciones.',
      'Dirigí la generación del código con prompts por etapa y los fui refinando según lo que salía: alcance, estructura del proyecto y formato de los datos.',
      'Revisé lo generado, probé el juego y pedí correcciones hasta cerrar cada etapa; el avance y las limitaciones conocidas quedan registrados en PROGRESO.md.',
      'El proyecto incluye pruebas automatizadas: 270 comprobaciones generales, 84 de la etapa 3 y una partida simulada de 44 pasos. Todas pasan en Godot 4.4.',
    ],
    evidence: {
      text: 'El código lo generó Claude bajo mi dirección; mi trabajo fue especificar, dirigir y verificar. Las capturas salen del recorrido visual automatizado del propio proyecto.',
      links: [],
    },
    decisions: [
      {
        title: 'Etapas cerradas en lugar de un solo prompt',
        text: 'Pedir el juego completo de una vez produce algo que no se puede revisar. Dividirlo en etapas jugables permitió probar cada una antes de seguir y detectar errores cuando todavía eran pequeños.',
      },
      {
        title: 'Las pruebas como contrato',
        text: 'Cada etapa incluía sus propias pruebas automatizadas. Si algo se rompía al avanzar, las pruebas anteriores lo señalaban sin tener que volver a jugar todo.',
      },
      {
        title: 'Datos fuera del código',
        text: 'Especies, movimientos, tipos y objetos están en JSON. Así pude pedir cambios de contenido sin tocar la lógica y revisar el balance del juego en un solo lugar.',
      },
    ],
    cover: '/projects/aventura-captura-2d/pueblo.webp',
    coverAlt: 'Pueblo inicial del juego en pixel art',
    coverStyle: 'pixel',
    gallery: [
      { src: '/projects/aventura-captura-2d/titulo.webp', alt: 'Pantalla de título', caption: 'Pantalla de título.', pixel: true },
      { src: '/projects/aventura-captura-2d/pueblo.webp', alt: 'Pueblo con casas y laboratorio', caption: 'Pueblo inicial.', pixel: true },
      { src: '/projects/aventura-captura-2d/captura.webp', alt: 'Minijuego de captura con círculo de precisión', caption: 'Captura con círculo de precisión.', pixel: true },
      { src: '/projects/aventura-captura-2d/combate.webp', alt: 'Menú de combate por turnos', caption: 'Combate por turnos.', pixel: true },
      { src: '/projects/aventura-captura-2d/combate-movimientos.webp', alt: 'Selección de movimientos en combate', caption: 'Movimientos con tipo y PP.', pixel: true },
      { src: '/projects/aventura-captura-2d/criadex.webp', alt: 'CriaDex con criaturas registradas', caption: 'CriaDex.', pixel: true },
      { src: '/projects/aventura-captura-2d/equipo.webp', alt: 'Pantalla de equipo', caption: 'Equipo.', pixel: true },
      { src: '/projects/aventura-captura-2d/tienda.webp', alt: 'Tienda con compra de objetos', caption: 'Tienda.', pixel: true },
    ],
    demo: null,
    group: 'propios',
    timeline: [
      { when: "Etapa 1", what: "Base jugable: pueblo, casas, laboratorio, movimiento y diálogos." },
      { when: "Etapa 2", what: "Ruta 1, criaturas en la hierba alta, captura, mochila y guardado." },
      { when: "Etapa 3", what: "Ciudad, tienda, centro de cuidados y combates por turnos." },
      { when: "Etapa 4", what: "Pendiente: bosque y primer gimnasio." },
    ],
    retro: [
      "Pediría desde el inicio que al aprender un quinto movimiento se pueda elegir cuál olvidar; hoy se olvida el más antiguo.",
    ],
    featured: false,
  },

  // ───────────────────────────────────────────────────────── INVENTARIOPLUS
  {
    slug: 'inventarioplus',
    title: 'InventarioPlus',
    tagline: 'Gestión de inventarios con arquitectura cliente-servidor',
    year: '2025',
    kind: 'academico',
    kindLabel: 'Académico · equipo',
    status: 'Completado',
    categories: ['Escritorio', 'Académico'],
    team: 'Equipo de cuatro personas; mi participación fue el frontend (vistas)',
    role: 'Todas las vistas del cliente (WPF) y documentación técnica',
    summary:
      'Sistema de escritorio para controlar productos, proveedores, reservas, movimientos de entrada y salida, y reportes. Se compone de un cliente WPF, un servidor con servicios WCF y una biblioteca de clases compartida.',
    problem: 'Llevar el inventario de un negocio con varios usuarios conectados a un mismo servidor.',
    goals: ['Separar cliente, servidor y contratos compartidos.', 'Cubrir productos, proveedores, reservas, movimientos y reportes.'],
    features: [
      'Inicio de sesión con menú para administrador y para empleado.',
      'Registro y consulta de productos, proveedores y usuarios.',
      'Reservas de productos y su liberación.',
      'Entradas, historial de movimientos y reportes por periodo.',
    ],
    stack: ['C#', '.NET Framework', 'WPF', 'WCF', 'Entity Framework 6', 'SQL Server'],
    architecture: {
      text: 'El cliente WPF se comunica con el servidor a través de contratos de servicio WCF definidos en una biblioteca compartida; el servidor usa Entity Framework para acceder a la base de datos.',
      layers: [
        { label: 'Cliente', nodes: [{ name: 'Aplicación WPF', detail: '30 vistas de administrador y empleado', mine: true }] },
        { label: 'Contratos', nodes: [{ name: 'Biblioteca compartida', detail: 'interfaces de servicio y DTOs' }] },
        { label: 'Servidor', nodes: [{ name: 'Servicios WCF' }, { name: 'Entity Framework 6' }] },
      ],
    },
    contributions: [
      'Desarrollé todas las vistas del cliente en WPF: 30 pantallas en XAML.',
      'Inicio de sesión y menús principales para administrador y empleado.',
      'Productos: registrar, consultar (vista de administrador y de empleado) y modificar.',
      'Proveedores, usuarios, reservas de productos, entradas y salidas, historial de movimientos, reportes por periodo y su vista previa.',
      'Participé en la documentación técnica.',
    ],
    evidence: {
      text: 'Las vistas están en la carpeta Vistas del proyecto cliente. Los commits que las subieron los hicieron otros integrantes del equipo, así que el historial de Git no muestra mi autoría.',
      links: [{ label: 'Repositorio en GitHub', href: 'https://github.com/queenprotea/inventarioPlusSolucion' }],
    },
    decisions: [],
    gallery: [],
    demo: null,
    group: 'equipo',
    featured: false,
  },
];

export const getProject = (slug: string) => projects.find(p => p.slug === slug);
